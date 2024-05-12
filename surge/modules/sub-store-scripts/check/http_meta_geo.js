/**
 *
 * 节点信息(适配 Sub-Store Node.js 版)
 * 
 * App 版请使用 geo.js
 *
 * 查看说明: https://t.me/zhetengsha/1269
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * HTTP META(https://github.com/xream/http-meta) 参数
 * - [http_meta_protocol] 协议 默认: http
 * - [http_meta_host] 服务地址 默认: 127.0.0.1
 * - [http_meta_port] 端口号 默认: 9876
 * - [http_meta_start_delay] 初始启动延时(单位: 毫秒) 默认: 3000
 * - [http_meta_proxy_timeout] 每个节点耗时(单位: 毫秒). 此参数是为了防止脚本异常退出未关闭核心. 设置过小将导致核心过早退出. 目前逻辑: 启动初始的延时 + 每个节点耗时. 默认: 10000
 *
 * 其它参数
 * - [retries] 重试次数 默认 1
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [internal] 使用内部方法获取 IP 信息. 默认 false
                设置环境变量 SUB_STORE_MMDB_COUNTRY_PATH 和 SUB_STORE_MMDB_ASN_PATH, 或 传入 mmdb_country_path 和 mmdb_asn_path 参数(分别为 MaxMind GeoLite2 Country 和 GeoLite2 ASN 数据库 的路径)
*              数据来自 GeoIP 数据库
*              (因为懒) 开启后, 将认为远程 API 返回的响应内容为纯文本 IP 地址, 并用于内部方法
 * - [method] 请求方法. 默认 get
 * - [api] 测落地的 API . 默认为 http://ip-api.com/json?lang=zh-CN
 *         当使用 internal 时, 默认为 http://checkip.amazonaws.com
 * - [format] 自定义格式, 从 节点(proxy) 和 API 响应(api) 中取数据. 默认为: {{api.country}} {{api.isp}} - {{proxy.name}}
 *            当使用 internal 时, 默认为 {{api.countryCode}} {{api.aso}} - {{proxy.name}}
 * - [cache] 使用缓存, 默认不使用缓存
 * - [geo] 在节点上附加 _geo 字段, 默认不附加
 * - [incompatible] 在节点上附加 _incompatible 字段来标记当前客户端不兼容该协议, 默认不附加
 * - [remove_incompatible] 移除当前客户端不兼容的协议. 默认不移除.
 * - [remove_failed] 移除失败的节点. 默认不移除.
 * - [mmdb_country_path] 见 internal
 * - [mmdb_asn_path] 见 internal
 */

async function operator(proxies = [], targetPlatform, context) {
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const remove_failed = $arguments.remove_failed
  const remove_incompatible = $arguments.remove_incompatible
  const incompatibleEnabled = $arguments.incompatible
  const geoEnabled = $arguments.geo
  const http_meta_host = $arguments.http_meta_host ?? '127.0.0.1'
  const http_meta_port = $arguments.http_meta_port ?? 9876
  const http_meta_protocol = $arguments.http_meta_protocol ?? 'http'
  const http_meta_api = `${http_meta_protocol}://${http_meta_host}:${http_meta_port}`
  const http_meta_start_delay = parseFloat($arguments.http_meta_start_delay ?? 3000)
  const http_meta_proxy_timeout = parseFloat($arguments.http_meta_proxy_timeout ?? 10000)
  const method = $arguments.method || 'get'

  const internal = $arguments.internal
  const mmdb_country_path = $arguments.mmdb_country_path
  const mmdb_asn_path = $arguments.mmdb_asn_path
  let format = $arguments.format || '{{api.country}} {{api.isp}} - {{proxy.name}}'
  let url = $arguments.api || 'http://ip-api.com/json?lang=zh-CN'
  let utils
  if (internal) {
    utils = new ProxyUtils.MMDB({ country: mmdb_country_path, asn: mmdb_asn_path })
    format = $arguments.format || `{{api.countryCode}} {{api.aso}} - {{proxy.name}}`
    url = $arguments.api || 'http://checkip.amazonaws.com'
  }

  const $ = $substore
  const internalProxies = []
  proxies.map((proxy, index) => {
    try {
      const node = ProxyUtils.produce([proxy], 'ClashMeta', 'internal')?.[0]
      if (node) {
        // $.info(JSON.stringify(node, null, 2))
        internalProxies.push({ ...node, _proxies_index: index })
      } else {
        proxies[index]._incompatible = true
      }
    } catch (e) {
      $.error(e)
    }
  })
  // $.info(JSON.stringify(internalProxies, null, 2))
  $.info(`核心支持节点数: ${internalProxies.length}/${proxies.length}`)
  if (!internalProxies.length) return proxies

  if (cacheEnabled) {
    try {
      let allCached = true
      for (var i = 0; i < internalProxies.length; i++) {
        const proxy = internalProxies[i]
        const id = getCacheId({ proxy, url, format })
        const cached = cache.get(id)
        if (cached) {
          if (cached.api) {
            proxies[proxy._proxies_index].name = formatter({
              proxy: proxies[proxy._proxies_index],
              api: cached.api,
              format,
            })
            proxies[proxy._proxies_index]._geo = cached.api
          }
        } else {
          allCached = false
          break
        }
      }
      if (allCached) {
        $.info('所有节点都有有效缓存 完成')
        return proxies
      }
    } catch (e) {}
  }

  const http_meta_timeout = http_meta_start_delay + internalProxies.length * http_meta_proxy_timeout

  let http_meta_pid
  let http_meta_ports = []

  // 启动 HTTP META
  const res = await http({
    retries: 0,
    method: 'post',
    url: `${http_meta_api}/start`,
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      proxies: internalProxies,
      timeout: http_meta_timeout,
    }),
  })
  let body = res.body
  try {
    body = JSON.parse(body)
  } catch (e) {}
  const { ports, pid } = body
  if (!pid || !ports) {
    throw new Error(`======== HTTP META 启动失败 ====\n${body}`)
  }
  http_meta_pid = pid
  http_meta_ports = ports
  $.info(
    `\n======== HTTP META 启动 ====\n[端口] ${ports}\n[PID] ${pid}\n[超时] 若未手动关闭 ${
      Math.round(http_meta_timeout / 60 / 10) / 100
    } 分钟后自动关闭\n`
  )
  $.info(`等待 ${http_meta_start_delay / 1000} 秒后开始检测`)
  await $.wait(http_meta_start_delay)

  const batches = []
  const concurrency = parseInt($arguments.concurrency || 10) // 一组并发数
  for (let i = 0; i < internalProxies.length; i += concurrency) {
    const batch = internalProxies.slice(i, i + concurrency)
    batches.push(batch)
  }

  for (const batch of batches) {
    await Promise.all(batch.map(check))
  }

  // stop http meta
  try {
    const res = await http({
      method: 'post',
      url: `${http_meta_api}/stop`,
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        pid: [http_meta_pid],
      }),
    })
    $.info(`\n======== HTTP META 关闭 ====\n${JSON.stringify(res, null, 2)}`)
  } catch (e) {
    $.error(e)
  }

  if (remove_incompatible || remove_failed) {
    proxies = proxies.filter(p => {
      if (remove_incompatible && p._incompatible) {
        return false
      } else if (remove_failed && !p._geo) {
        return !remove_incompatible && p._incompatible
      }
      return true
    })
  }

  if (!geoEnabled || !incompatibleEnabled) {
    proxies = proxies.map(p => {
      if (!geoEnabled) {
        delete p._geo
      }
      if (!incompatibleEnabled) {
        delete p._incompatible
      }
      return p
    })
  }

  return proxies

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled ? getCacheId({ proxy, url, format }) : undefined
    // $.info(`检测 ${id}`)
    try {
      const cached = cache.get(id)
      if (cacheEnabled && cached) {
        $.info(`[${proxy.name}] 使用缓存`)
        if (cached.api) {
          $.log(`[${proxy.name}] api: ${JSON.stringify(cached.api, null, 2)}`)
          proxies[proxy._proxies_index].name = formatter({
            proxy: proxies[proxy._proxies_index],
            api: cached.api,
            format,
          })
          if (geoEnabled) proxies[proxy._proxies_index]._geo = cached.api
        }
        return
      }
      // $.info(JSON.stringify(proxy, null, 2))
      const index = internalProxies.indexOf(proxy)
      const startedAt = Date.now()
      let api = {}
      if (internal) {
        api = {
          countryCode: utils.geoip(proxy.server),
          aso: utils.ipaso(proxy.server),
        }
        $.info(`[${proxy.name}] countryCode: ${api.countryCode}, aso: ${api.aso}`)
        if (api.countryCode && api.aso) {
          proxies[proxy._proxies_index].name = formatter({ proxy: proxies[proxy._proxies_index], api, format })
          proxies[proxy._proxies_index]._geo = api
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置成功缓存`)
            cache.set(id, { api })
          }
        } else {
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置失败缓存`)
            cache.set(id, {})
          }
        }
      } else {
        const res = await http({
          proxy: `http://${http_meta_host}:${http_meta_ports[index]}`,
          method,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1',
          },
          url,
        })
        api = String(lodash_get(res, 'body'))
        try {
          api = JSON.parse(api)
        } catch (e) {}
        const status = parseInt(res.status || res.statusCode || 200)
        let latency = ''
        latency = `${Date.now() - startedAt}`
        $.info(`[${proxy.name}] status: ${status}, latency: ${latency}`)
        if (status == 200) {
          proxies[proxy._proxies_index].name = formatter({ proxy: proxies[proxy._proxies_index], api, format })
          proxies[proxy._proxies_index]._geo = api
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置成功缓存`)
            cache.set(id, { api })
          }
        } else {
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置失败缓存`)
            cache.set(id, {})
          }
        }
      }
      $.log(`[${proxy.name}] api: ${JSON.stringify(api, null, 2)}`)
    } catch (e) {
      $.error(`[${proxy.name}] ${e.message ?? e}`)
      if (cacheEnabled) {
        $.info(`[${proxy.name}] 设置失败缓存`)
        cache.set(id, {})
      }
    }
  }
  // 请求
  async function http(opt = {}) {
    const METHOD = opt.method || $arguments.method || 'get'
    const TIMEOUT = parseFloat(opt.timeout || $arguments.timeout || 5000)
    const RETRIES = parseFloat(opt.retries ?? $arguments.retries ?? 1)
    const RETRY_DELAY = parseFloat(opt.retry_delay ?? $arguments.retry_delay ?? 1000)

    let count = 0
    const fn = async () => {
      try {
        return await $.http[METHOD]({ ...opt, timeout: TIMEOUT })
      } catch (e) {
        // $.error(e)
        if (count < RETRIES) {
          count++
          const delay = RETRY_DELAY * count
          // $.info(`第 ${count} 次请求失败: ${e.message || e}, 等待 ${delay / 1000}s 后重试`)
          await $.wait(delay)
          return await fn()
        } else {
          throw e
        }
      }
    }
    return await fn()
  }
  function lodash_get(source, path, defaultValue = undefined) {
    const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
    let result = source
    for (const p of paths) {
      result = Object(result)[p]
      if (result === undefined) {
        return defaultValue
      }
    }
    return result
  }
  function formatter({ proxy = {}, api = {}, format = '' }) {
    let f = format.replace(/\{\{(.*?)\}\}/g, '${$1}')
    return eval(`\`${f}\``)
  }
  function getCacheId({ proxy = {}, url, format }) {
    return `http-meta:geo:${url}:${format}:${JSON.stringify(
      Object.fromEntries(Object.entries(proxy).filter(([key]) => !/^(collectionName|subName|id|_.*)$/i.test(key)))
    )}`
  }
}

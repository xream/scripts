/**
 * 感谢 群友 @utopter 投稿
 * 说明:
 * - [regex] 正则表达式，仅匹配的节点会被测速
 * - [percentage] 删除测速结果后X%的节点, X作为参数传入
 * - [whitelist_regex] 白名单正则表达式，匹配的节点不会被删除
 * - [blacklist_regex] 黑名单正则表达式，匹配的节点不会被测速，同时会被保留
 *
 * HTTP META(https://github.com/xream/http-meta) 参数
 * - [http_meta_protocol] 协议 默认: http
 * - [http_meta_host] 服务地址 默认: 127.0.0.1
 * - [http_meta_port] 端口号 默认: 9876
 * - [http_meta_start_delay] 初始启动延时(单位: 毫秒) 默认: 3000
 * - [http_meta_proxy_timeout] 每个节点耗时(单位: 毫秒). 此参数是为了防止脚本异常退出未关闭核心. 设置过小将导致核心过早退出. 目前逻辑: 启动初始的延时 + 每个节点耗时. 默认: 10000
 *
 * 其它参数
 * - [timeout] 请求超时(单位: 毫秒) 默认 10000
 * - [retries] 重试次数 默认 0
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 1
 * - [size] 测速大小(单位 MB). 默认 10
 * - [keep_incompatible] 保留当前客户端不兼容的协议. 默认不保留.
 * - [regex] 正则表达式，仅匹配的节点会被测速
 * - [percentage] 删除测速结果后X%的节点, X作为参数传入
 * - [whitelist_regex] 白名单正则表达式，匹配的节点不会被删除
 * - [blacklist_regex] 黑名单正则表达式，匹配的节点不会被测速，但会被保留
 * - [cache] 使用缓存, 默认不使用缓存
 * 关于缓存时长
 * 当使用相关脚本时, 若在对应的脚本中使用参数(⚠ 别忘了这个, 一般为 cache, 值设为 true 即可)开启缓存
 * 可在前端(>=2.16.0) 配置各项缓存的默认时长
 * 持久化缓存数据在 JSON 里
 * 可以在脚本的前面添加一个脚本操作, 实现保留 1 小时的缓存. 这样比较灵活
 * async function operator() {
 *     scriptResourceCache._cleanup(undefined, 1 * 3600 * 1000);
 * }
 */

async function operator(proxies = [], targetPlatform, context) {
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const http_meta_host = $arguments.http_meta_host ?? '127.0.0.1'
  const http_meta_port = $arguments.http_meta_port ?? 9876
  const http_meta_protocol = $arguments.http_meta_protocol ?? 'http'
  const http_meta_api = `${http_meta_protocol}://${http_meta_host}:${http_meta_port}`

  const http_meta_start_delay = parseFloat($arguments.http_meta_start_delay ?? 3000)
  const http_meta_proxy_timeout = parseFloat($arguments.http_meta_proxy_timeout ?? 10000)

  const keepIncompatible = $arguments.keep_incompatible
  const bytes = ($arguments.size || 10) * 1024 * 1024
  const url = `https://speed.cloudflare.com/__down?bytes=${bytes}`
  const regex = new RegExp($arguments.regex || '.*') // 如果未设置正则表达式，则匹配所有节点
  const percentage = parseFloat($arguments.percentage || 0) // 获取删除百分比
  const whitelist_regex = $arguments.whitelist_regex ? new RegExp($arguments.whitelist_regex) : null // 白名单正则表达式
  const blacklist_regex = $arguments.blacklist_regex ? new RegExp($arguments.blacklist_regex) : null // 黑名单正则表达式

  const $ = $substore
  const validProxies = []
  const incompatibleProxies = []
  const internalProxies = []
  const blacklistedProxies = [] // 用于存储黑名单节点

  proxies.forEach((proxy, index) => {
    try {
      const node = ProxyUtils.produce([proxy], 'ClashMeta', 'internal')?.[0]
      if (!node || !node.name) {
        if (keepIncompatible) {
          incompatibleProxies.push(proxy)
        }
        return
      }
      if (regex.test(node.name)) {
        if (blacklist_regex && blacklist_regex.test(node.name)) {
          blacklistedProxies.push(node) // 加入黑名单列表
        } else {
          internalProxies.push({ ...node, _proxies_index: index }) // 加入待测列表
        }
      } else {
        if (keepIncompatible) {
          incompatibleProxies.push(proxy)
        }
      }
    } catch (e) {
      $.error(e)
    }
  })

  $.info(`核心支持节点数: ${internalProxies.length}/${proxies.length}`)
  if (!internalProxies.length) return proxies

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

  // 根据正则表达式分组
  const proxyGroups = {}
  validProxies.forEach(proxy => {
    if (!proxy || !proxy.name) return
    let groupName = null
    for (const key of regex.source.split('|')) {
      if (new RegExp(key).test(proxy.name)) {
        groupName = key
        break
      }
    }
    if (!groupName) {
      groupName = 'default' // 未匹配任何正则的节点归为默认组
    }
    if (!proxyGroups[groupName]) {
      proxyGroups[groupName] = []
    }
    proxyGroups[groupName].push(proxy)
  })

  // 对每个分组进行删除操作
  for (const groupName in proxyGroups) {
    const groupProxies = proxyGroups[groupName]
    groupProxies.sort((a, b) => {
      if (!a || !b || !a.name || !b.name) return 0
      const speedA = parseInt(a.name.match(/^\[(\d+) M\]/)[1])
      const speedB = parseInt(b.name.match(/^\[(\d+) M\]/)[1])
      return speedB - speedA // 降序排列
    })

    const numToDelete = Math.floor((groupProxies.length * percentage) / 100)
    for (let i = 0; i < numToDelete; i++) {
      // 修改循环条件
      const proxy = groupProxies[groupProxies.length - 1] // 获取最后一个节点
      if (!proxy || !proxy.name) continue

      // 检查白名单和黑名单
      if (whitelist_regex && whitelist_regex.test(proxy.name)) {
        // 在白名单中的节点标记为 [LS]
        proxy.name = proxy.name.replace(/^\[\d+ M\]/, '[LS]')
      } else if (!blacklist_regex || !blacklist_regex.test(proxy.name)) {
        // 不在黑名单中的节点删除
        groupProxies.pop() // 从末尾删除节点
      }
    }
  }

  // 将分组后的节点合并到结果列表
  validProxies.length = 0
  for (const groupName in proxyGroups) {
    validProxies.push(...proxyGroups[groupName])
  }

  // 去除速度标记
  validProxies.forEach(proxy => {
    if (!proxy || !proxy.name) return
    proxy.name = proxy.name.replace(/^\[\d+ M\] /, '')
  })

  // 将黑名单节点添加到结果列表
  validProxies.push(...blacklistedProxies)

  return keepIncompatible ? [...validProxies, ...incompatibleProxies] : validProxies

  async function check(proxy) {
    if (!proxy) return
    const id = cacheEnabled
      ? `http-meta:speed:${JSON.stringify(
          Object.fromEntries(
            Object.entries(proxy).filter(([key]) => !/^(name|collectionName|subName|id|_.*)$/i.test(key))
          )
        )}`
      : undefined
    try {
      const cached = cache.get(id)
      if (cacheEnabled && cached) {
        $.info(`[${proxy.name}] 使用缓存`)
        if (cached.speed) {
          validProxies.push({
            ...proxy,
            name: `[${cached.speed}] ${proxy.name}`,
          })
        }
        return
      }
      const index = internalProxies.indexOf(proxy)
      const startedAt = Date.now()
      const res = await http({
        proxy: `http://${http_meta_host}:${http_meta_ports[index]}`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1',
        },
        url,
      })
      const status = parseInt(res.status || res.statusCode || 200)
      let latency = ''
      latency = `${Date.now() - startedAt}`
      const speed = Math.round((bytes / 1024 / 1024 / (latency / 1000)) * 8) + ' M'
      $.info(`[${proxy.name}] status: ${status}, latency: ${latency}, speed: ${speed}`)
      // 判断响应
      if (speed) {
        validProxies.push({
          ...proxy,
          name: `[${speed}] ${proxy.name}`,
        })
        if (cacheEnabled) {
          $.info(`[${proxy.name}] 设置成功缓存`)
          cache.set(id, { speed })
        }
      } else {
        if (cacheEnabled) {
          $.info(`[${proxy.name}] 设置失败缓存`)
          cache.set(id, {})
        }
      }
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
    const TIMEOUT = parseFloat(opt.timeout || $arguments.timeout || 10000)
    const RETRIES = parseFloat(opt.retries ?? $arguments.retries ?? 0)
    const RETRY_DELAY = parseFloat(opt.retry_delay ?? $arguments.retry_delay ?? 1000)
    let count = 0
    const fn = async () => {
      try {
        return await $.http[METHOD]({ ...opt, timeout: TIMEOUT })
      } catch (e) {
        if (count < RETRIES) {
          count++
          const delay = RETRY_DELAY * count
          await $.wait(delay)
          return await fn()
        } else {
          throw e
        }
      }
    }
    return await fn()
  }
}

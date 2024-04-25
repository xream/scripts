/**
 * 节点信息(入口版)
 *
 * ⚠️ 本脚本不进行域名解析 如有需要 可在节点操作中添加域名解析
 *
 * 查看说明: https://t.me/zhetengsha/1358
 *
 * 落地版脚本请查看: https://t.me/zhetengsha/1269
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 参数
 * - [retries] 重试次数 默认 1
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [method] 请求方法. 默认 get
 * - [api] 测入口的 API . 默认为 http://ip-api.com/json/{{proxy.server}}?lang=zh-CN
 * - [format] 自定义格式, 从 节点(proxy) 和 入口 API 响应(api)中取数据. 默认为: {{api.country}} {{api.isp}} - {{proxy.name}}
 * - [valid] 验证 api 请求是否合法. 默认: ProxyUtils.isIP('{{api.ip || api.query}}')
 * - [cache] 使用缓存, 默认不使用缓存
 * - [entrance] 在节点上附加 _entrance 字段(API 响应数据), 默认不附加
 * - [remove_failed] 移除失败的节点. 默认不移除.
 */

async function operator(proxies = [], targetPlatform, context) {
  const $ = $substore

  const remove_failed = $arguments.remove_failed
  const entranceEnabled = $arguments.entrance
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const format = $arguments.format || `{{api.country}} {{api.isp}} - {{proxy.name}}`
  const method = $arguments.method || 'get'
  const valid = $arguments.valid || `ProxyUtils.isIP('{{api.ip || api.query}}')`
  const url = $arguments.api || `http://ip-api.com/json/{{proxy.server}}?lang=zh-CN`
  const batches = []
  const concurrency = parseInt($arguments.concurrency || 10) // 一组并发数
  for (let i = 0; i < proxies.length; i += concurrency) {
    const batch = proxies.slice(i, i + concurrency)
    batches.push(batch)
  }

  for (const batch of batches) {
    await Promise.all(batch.map(check))
  }

  if (remove_failed) {
    proxies = proxies.filter(p => {
      if (remove_failed && !p._entrance) {
        return false
      }
      return true
    })
  }

  if (!entranceEnabled) {
    proxies = proxies.map(p => {
      if (!entranceEnabled) {
        delete p._entrance
      }
      return p
    })
  }

  return proxies

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled
      ? `entrance:${url}:${format}:${JSON.stringify(
          Object.fromEntries(Object.entries(proxy).filter(([key]) => !/^(collectionName|subName|id|_.*)$/i.test(key)))
        )}`
      : undefined
    // $.info(`检测 ${id}`)
    try {
      const cached = cache.get(id)
      if (cacheEnabled && cached) {
        $.info(`[${proxy.name}] 使用缓存`)
        if (cached.api) {
          $.log(`[${proxy.name}] api: ${JSON.stringify(cached.api, null, 2)}`)
          proxy.name = formatter({ proxy, api: cached.api, format })
          proxy._entrance = cached.api
        }
        return
      }
      // 请求
      const startedAt = Date.now()
      const res = await http({
        method,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1',
        },
        url: formatter({ proxy, format: url }),
      })
      let api = String(lodash_get(res, 'body'))
      try {
        api = JSON.parse(api)
      } catch (e) {}
      const status = parseInt(res.status || res.statusCode || 200)
      let latency = ''
      latency = `${Date.now() - startedAt}`
      $.info(`[${proxy.name}] status: ${status}, latency: ${latency}`)
      $.log(`[${proxy.name}] api: ${JSON.stringify(api, null, 2)}`)
      if (status == 200 && eval(formatter({ api, format: valid }))) {
        proxy.name = formatter({ proxy, api, format })
        proxy._entrance = api
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
    const METHOD = opt.method || 'get'
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
}

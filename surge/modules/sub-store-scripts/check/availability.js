/**
 * 节点测活(适配 Surge/Loon 版)
 *
 * 说明: https://t.me/zhetengsha/1210
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 参数
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [retries] 重试次数 默认 1
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [url] 检测的 URL. 需要 encodeURIComponent. 默认 http://www.apple.com/library/test/success.html
 * - [status] 合法的状态码. 默认 200
 * - [method] 请求方法. 默认 head, 如果测试 URL 不支持, 可设为 get
 * - [show_latency] 显示延迟. 默认不显示
 * - [keep_incompatible] 保留当前客户端不兼容的协议. 默认不保留.
 * - [cache] 使用缓存, 默认不使用缓存
 */

async function operator(proxies = [], targetPlatform, context) {
  const $ = $substore
  const { isLoon, isSurge } = $.env
  if (!isLoon && !isSurge) throw new Error('仅支持 Loon 和 Surge(ability=http-client-policy)')
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const method = $arguments.method || 'head'
  const keepIncompatible = $arguments.keep_incompatible
  const validStatus = parseInt($arguments.status || 200)
  const url = decodeURIComponent($arguments.url || 'http://www.apple.com/library/test/success.html')
  const target = isLoon ? 'Loon' : isSurge ? 'Surge' : undefined
  const validProxies = []
  const batches = []
  const concurrency = parseInt($arguments.concurrency || 10) // 一组并发数
  for (let i = 0; i < proxies.length; i += concurrency) {
    const batch = proxies.slice(i, i + concurrency)
    batches.push(batch)
  }

  for (const batch of batches) {
    await Promise.all(batch.map(check))
  }

  return validProxies

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled
      ? `availability:${JSON.stringify(
          Object.fromEntries(
            Object.entries(proxy).filter(([key]) => !/^(name|collectionName|subName|id|_.*)$/i.test(key))
          )
        )}`
      : undefined
    // $.info(`检测 ${id}`)
    try {
      const node = ProxyUtils.produce([proxy], target)
      if (node) {
        const cached = cache.get(id)
        if (cacheEnabled && cached) {
          $.info(`[${proxy.name}] 使用缓存`)
          if (cached.latency) {
            validProxies.push({
              ...proxy,
              name: `${$arguments.show_latency ? `[${cached.latency}] ` : ''}${proxy.name}`,
            })
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
          url,
          'policy-descriptor': node,
          node,
        })
        const status = parseInt(res.status || res.statusCode || 200)
        let latency = ''
        latency = `${Date.now() - startedAt}`
        $.info(`[${proxy.name}] status: ${status}, latency: ${latency}`)
        // 判断响应
        if (status == validStatus) {
          validProxies.push({
            ...proxy,
            name: `${$arguments.show_latency ? `[${latency}] ` : ''}${proxy.name}`,
          })
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置成功缓存`)
            cache.set(id, { latency })
          }
        } else {
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置失败缓存`)
            cache.set(id, {})
          }
        }
      } else {
        if (keepIncompatible) {
          validProxies.push(proxy)
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
}

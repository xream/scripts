/**
 * GPT 检测(适配 Surge/Loon 版)
 *
 * 适配 Sub-Store Node.js 版 请查看: https://t.me/zhetengsha/1209
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 * 检测方法: https://zset.cc/archives/34/
 * 需求来源: @underHZLY
 * 讨论贴: https://www.nodeseek.com/post-78153-1
 *
 * 参数
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [retries] 重试次数 默认 1
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [client] GPT 检测的客户端类型. 默认 iOS
 * - [method] 请求方法. 默认 get
 * - [cache] 使用缓存, 默认不使用缓存
 */

async function operator(proxies = [], targetPlatform, context) {
  const $ = $substore
  const { isLoon, isSurge } = $.env
  if (!isLoon && !isSurge) throw new Error('仅支持 Loon 和 Surge(ability=http-client-policy)')
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const method = $arguments.method || 'get'
  const url = $arguments.client === 'Android' ? `https://android.chat.openai.com` : `https://ios.chat.openai.com`
  const target = isLoon ? 'Loon' : isSurge ? 'Surge' : undefined
  const batches = []
  const concurrency = parseInt($arguments.concurrency || 10) // 一组并发数
  for (let i = 0; i < proxies.length; i += concurrency) {
    const batch = proxies.slice(i, i + concurrency)
    batches.push(batch)
  }

  for (const batch of batches) {
    await Promise.all(batch.map(check))
  }

  return proxies

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled
      ? `gpt:${url}:${JSON.stringify(
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
          if (cached.gpt) {
            proxy.name = `[GPT] ${proxy.name}`
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
        const status = parseInt(res.status ?? res.statusCode ?? 200)
        let body = String(res.body ?? res.rawBody)
        try {
          body = JSON.parse(body)
        } catch (e) {}
        // $.info(`body ${JSON.stringify(body, null, 2)}`)
        const msg = body?.error?.error_type || body?.cf_details
        let latency = ''
        latency = `${Date.now() - startedAt}`
        $.info(`[${proxy.name}] status: ${status}, msg: ${msg}, latency: ${latency}`)
        // cf 拦截是 400 错误, 403 就是没被拦截, 走到了未鉴权的逻辑
        // https://zset.cc/archives/34/
        // 更新: 403 的时候, 还得看响应
        if (status == 403 && !['unsupported_country'].includes(msg)) {
          proxy.name = `[GPT] ${proxy.name}`
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置成功缓存`)
            cache.set(id, { gpt: true })
          }
        } else {
          if (cacheEnabled) {
            $.info(`[${proxy.name}] 设置失败缓存`)
            cache.set(id, {})
          }
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

/**
 *
 * 节点丢包率统计(适配 Sub-Store Node.js 版)
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * HTTP META(https://github.com/xream/http-meta) 参数
 * - [http_meta_protocol] 协议 默认: http
 * - [http_meta_host] 服务地址 默认: 127.0.0.1
 * - [http_meta_port] 端口号 默认: 9876
 * - [http_meta_authorization] Authorization 默认无
 * - [http_meta_start_delay] 初始启动延时(单位: 毫秒) 默认: 3000
 * - [http_meta_proxy_timeout] 每个节点耗时(单位: 毫秒). 此参数是为了防止脚本异常退出未关闭核心. 设置过小将导致核心过早退出. 默认按 samples/timeout/retries/sample_delay 自动估算
 *
 * 其它参数
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [retries] 单次探测重试次数 默认 0
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [samples] 每个节点探测次数 默认 10
 * - [sample_delay] 每次探测间隔(单位: 毫秒) 默认 0
 * - [url] 检测的 URL. 在 URL query 参数中使用需要 encodeURIComponent. 直接使用前端的可视化参数编辑不需要 encodeURIComponent. 默认 http://connectivitycheck.platform.hicloud.com/generate_204
 * - [ua] 请求头 User-Agent. 在 URL query 参数中使用需要 encodeURIComponent. 直接使用前端的可视化参数编辑不需要 encodeURIComponent. 默认 Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1
 * - [status] 合法的状态码的正则表达式. 在 URL query 参数中使用需要 encodeURIComponent. 直接使用前端的可视化参数编辑不需要 encodeURIComponent. 默认 204
 * - [method] 请求方法. 默认 head, 如果测试 URL 不支持, 可设为 get
 * - [max_loss_rate] 最大允许丢包率(0-100). 高于该值会被移除. 默认 100
 * - [show_packet_loss] 显示丢包率. 默认不显示. 注: 即使不开启这个参数, 节点上也会添加一个 _packet_loss 字段
 * - [keep_incompatible] 保留当前客户端不兼容的协议. 默认不保留.
 * - [include_unsupported_proxy] 传递给运行环境时, 包含官方/商店版不支持的协议. 默认不包含. 若开启, 需要保证你的运行环境确实支持这些协议, 不然会报错
 * - [telegram_bot_token] Telegram Bot Token
 * - [telegram_chat_id] Telegram Chat ID
 * - [cache] 使用缓存, 默认不使用缓存
 * - [disable_failed_cache/ignore_failed_error] 禁用失败缓存. 即不缓存超过 max_loss_rate 的结果
 * 关于缓存时长
 * 当使用相关脚本时, 若在对应的脚本中使用参数(⚠ 别忘了这个, 一般为 cache, 值设为 true 即可)开启缓存
 * 可在前端(>=2.16.0) 配置各项缓存的默认时长
 * 持久化缓存数据在 JSON 里
 * 可以在脚本的前面添加一个脚本操作, 实现保留 1 小时的缓存. 这样比较灵活
 * async function operator() {
 *     scriptResourceCache._cleanup(undefined, 1 * 3600 * 1000);
 * }
 */

async function operator(proxies = [], targetPlatform, env) {
  const cacheEnabled = $arguments.cache
  const disableFailedCache = $arguments.disable_failed_cache || $arguments.ignore_failed_error
  const cache = scriptResourceCache
  const telegram_chat_id = $arguments.telegram_chat_id
  const telegram_bot_token = $arguments.telegram_bot_token
  const http_meta_host = $arguments.http_meta_host ?? '127.0.0.1'
  const http_meta_port = $arguments.http_meta_port ?? 9876
  const http_meta_protocol = $arguments.http_meta_protocol ?? 'http'
  const http_meta_authorization = $arguments.http_meta_authorization ?? ''
  const http_meta_api = `${http_meta_protocol}://${http_meta_host}:${http_meta_port}`

  const http_meta_start_delay = parseFloat($arguments.http_meta_start_delay ?? 3000)

  const method = $arguments.method || 'head'
  const keepIncompatible = $arguments.keep_incompatible
  const includeUnsupportedProxy = $arguments.include_unsupported_proxy
  const validStatus = new RegExp($arguments.status || '204')
  const url = decodeURIComponent($arguments.url || 'http://connectivitycheck.platform.hicloud.com/generate_204')
  const ua = decodeURIComponent(
    $arguments.ua ||
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1'
  )
  const samples = normalizePositiveInt($arguments.samples, 10)
  const sampleDelay = parseFloat($arguments.sample_delay || 0)
  const maxLossRate = normalizePercent($arguments.max_loss_rate, 100)
  const timeout = parseFloat($arguments.timeout || 5000)
  const retries = parseFloat($arguments.retries ?? 0)
  const retryDelay = parseFloat($arguments.retry_delay ?? 1000)
  const defaultHttpMetaProxyTimeout =
    samples * (timeout * (retries + 1) + (retryDelay * retries * (retries + 1)) / 2 + sampleDelay) + 1000
  const http_meta_proxy_timeout = parseFloat($arguments.http_meta_proxy_timeout ?? defaultHttpMetaProxyTimeout)

  const $ = $substore
  const validProxies = []
  const incompatibleProxies = []
  const internalProxies = []
  const failedProxies = []
  let name = ''
  for (const [key, value] of Object.entries(env.source)) {
    if (!key.startsWith('_')) {
      name = value.displayName || value.name
      break
    }
  }
  if (!name) {
    const collection = env.source._collection
    name = collection.displayName || collection.name
  }

  proxies.map((proxy, index) => {
    try {
      const node = ProxyUtils.produce([{ ...proxy }], 'ClashMeta', 'internal', {
        'include-unsupported-proxy': includeUnsupportedProxy,
      })?.[0]
      if (node) {
        for (const key in proxy) {
          if (/^_/i.test(key)) {
            node[key] = proxy[key]
          }
        }
        // $.info(JSON.stringify(node, null, 2))
        internalProxies.push({ ...node, _proxies_index: index })
      } else {
        if (keepIncompatible) {
          incompatibleProxies.push(proxy)
        }
      }
    } catch (e) {
      $.error(e)
    }
  })
  // $.info(JSON.stringify(internalProxies, null, 2))
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
      Authorization: http_meta_authorization,
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

  try {
    const concurrency = parseInt($arguments.concurrency || 10) // 一组并发数
    await executeAsyncTasks(
      internalProxies.map(proxy => () => check(proxy)),
      { concurrency }
    )
  } finally {
    // stop http meta
    try {
      const res = await http({
        method: 'post',
        url: `${http_meta_api}/stop`,
        headers: {
          'Content-type': 'application/json',
          Authorization: http_meta_authorization,
        },
        body: JSON.stringify({
          pid: [http_meta_pid],
        }),
      })
      $.info(`\n======== HTTP META 关闭 ====\n${JSON.stringify(res, null, 2)}`)
    } catch (e) {
      $.error(e)
    }
  }

  if (telegram_chat_id && telegram_bot_token && failedProxies.length > 0) {
    const text = `\`${name}\` 节点丢包率测试:\n${failedProxies
      .map(proxy => `❌ [${proxy.type}] \`${proxy.name}\` ${formatPacketLoss(proxy._packet_loss)}%`)
      .join('\n')}`
    await http({
      method: 'post',
      url: `https://api.telegram.org/bot${telegram_bot_token}/sendMessage`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_id: telegram_chat_id, text, parse_mode: 'MarkdownV2' }),
      retries: 0,
      timeout: 5000,
    })
  }

  return (keepIncompatible ? [...validProxies, ...incompatibleProxies] : validProxies).sort((a, b) => {
    const lossA = typeof a._packet_loss === 'number' ? a._packet_loss : Number.MAX_SAFE_INTEGER
    const lossB = typeof b._packet_loss === 'number' ? b._packet_loss : Number.MAX_SAFE_INTEGER
    const latencyA = typeof a._latency === 'number' ? a._latency : Number.MAX_SAFE_INTEGER
    const latencyB = typeof b._latency === 'number' ? b._latency : Number.MAX_SAFE_INTEGER
    return lossA - lossB || latencyA - latencyB
  })

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled
      ? `http-meta:packet-loss:${url}:${method}:${validStatus}:${samples}:${sampleDelay}:${maxLossRate}:${JSON.stringify(
          Object.fromEntries(
            Object.entries(proxy).filter(([key]) => !/^(name|collectionName|subName|id|_.*)$/i.test(key))
          )
        )}`
      : undefined
    // $.info(`检测 ${id}`)
    try {
      const cached = cacheEnabled ? cache.get(id) : undefined
      if (cacheEnabled && cached) {
        if (typeof cached.packetLoss === 'number') {
          validProxies.push(withStats(ProxyUtils.parse(JSON.stringify(proxy))[0], cached))
          $.info(`[${proxy.name}] 使用成功缓存`)
          return
        } else if (disableFailedCache) {
          $.info(`[${proxy.name}] 不使用失败缓存`)
        } else {
          $.info(`[${proxy.name}] 使用失败缓存`)
          return
        }
      }
      // $.info(JSON.stringify(proxy, null, 2))
      const index = internalProxies.indexOf(proxy)
      const stats = await measurePacketLoss(proxy, opt =>
        http({
          ...opt,
          proxy: `http://${http_meta_host}:${http_meta_ports[index]}`,
          method,
          headers: {
            'User-Agent': ua,
          },
          url,
        })
      )
      $.info(
        `[${proxy.name}] packet loss: ${formatPacketLoss(stats.packetLoss)}%, success: ${stats.successCount}/${
          stats.totalCount
        }, latency: ${stats.latency === '' ? '-' : stats.latency}`
      )
      if (stats.packetLoss <= maxLossRate) {
        validProxies.push(withStats(ProxyUtils.parse(JSON.stringify(proxy))[0], stats))
        if (cacheEnabled) {
          $.info(`[${proxy.name}] 设置成功缓存`)
          cache.set(id, stats)
        }
      } else {
        if (cacheEnabled && !disableFailedCache) {
          $.info(`[${proxy.name}] 设置失败缓存`)
          cache.set(id, {})
        }
        failedProxies.push({ ...ProxyUtils.parse(JSON.stringify(proxy))[0], _packet_loss: stats.packetLoss })
      }
    } catch (e) {
      $.error(`[${proxy.name}] ${e.message ?? e}`)
      if (cacheEnabled && !disableFailedCache) {
        $.info(`[${proxy.name}] 设置失败缓存`)
        cache.set(id, {})
      }
      failedProxies.push({ ...ProxyUtils.parse(JSON.stringify(proxy))[0], _packet_loss: 100 })
    }
  }

  async function measurePacketLoss(proxy, request) {
    const latencies = []
    let successCount = 0
    for (let i = 0; i < samples; i++) {
      const startedAt = Date.now()
      let status
      let success = false
      try {
        const res = await request({})
        status = parseInt(res.status || res.statusCode || 200)
        success = validStatus.test(status)
      } catch (e) {
        status = e.message ?? e
      }
      if (success) {
        successCount++
        latencies.push(Date.now() - startedAt)
      }
      $.info(`[${proxy.name}] sample ${i + 1}/${samples}: status: ${status}, result: ${success ? 'success' : 'loss'}`)
      if (sampleDelay > 0 && i < samples - 1) {
        await $.wait(sampleDelay)
      }
    }
    const lossCount = samples - successCount
    const packetLoss = roundPercent((lossCount / samples) * 100)
    const latency = latencies.length
      ? Math.round(latencies.reduce((sum, item) => sum + item, 0) / latencies.length)
      : ''
    return { packetLoss, latency, successCount, lossCount, totalCount: samples }
  }

  function withStats(proxy, stats) {
    const { _proxies_index, ...baseProxy } = proxy
    return {
      ...baseProxy,
      name: `${$arguments.show_packet_loss ? `[${formatPacketLoss(stats.packetLoss)}%] ` : ''}${proxy.name}`,
      _packet_loss: stats.packetLoss,
      _packet_loss_count: stats.lossCount,
      _success_count: stats.successCount,
      _total_count: stats.totalCount,
      _latency: stats.latency,
    }
  }

  // 请求
  async function http(opt = {}) {
    const METHOD = opt.method || $arguments.method || 'get'
    const TIMEOUT = parseFloat(opt.timeout || $arguments.timeout || 5000)
    const RETRIES = parseFloat(opt.retries ?? $arguments.retries ?? 0)
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
          // $.info(`第 ${count} 次请求失败: ${e.message ?? e}, 等待 ${delay / 1000}s 后重试`)
          await $.wait(delay)
          return await fn()
        } else {
          throw e
        }
      }
    }
    return await fn()
  }
  function normalizePercent(value, fallback) {
    const parsed = parseFloat(value ?? fallback)
    if (Number.isNaN(parsed)) return fallback
    return Math.min(100, Math.max(0, parsed))
  }
  function normalizePositiveInt(value, fallback) {
    const parsed = parseInt(value ?? fallback)
    if (Number.isNaN(parsed) || parsed < 1) return fallback
    return parsed
  }
  function roundPercent(value) {
    return Math.round(value * 100) / 100
  }
  function formatPacketLoss(value) {
    if (typeof value !== 'number') return value
    return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, '')
  }
  function executeAsyncTasks(tasks, { wrap, result, concurrency = 1 } = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let running = 0
        const results = []

        let index = 0

        function executeNextTask() {
          while (index < tasks.length && running < concurrency) {
            const taskIndex = index++
            const currentTask = tasks[taskIndex]
            running++

            currentTask()
              .then(data => {
                if (result) {
                  results[taskIndex] = wrap ? { data } : data
                }
              })
              .catch(error => {
                if (result) {
                  results[taskIndex] = wrap ? { error } : error
                }
              })
              .finally(() => {
                running--
                executeNextTask()
              })
          }

          if (running === 0) {
            return resolve(result ? results : undefined)
          }
        }

        await executeNextTask()
      } catch (e) {
        reject(e)
      }
    })
  }
}

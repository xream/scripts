/**
 *
 * 节点测活(适配 Sub-Store Node.js 版)
 *
 * 说明: https://t.me/zhetengsha/1210
 *
 * HTTP META(https://github.com/xream/http-meta) 参数
 * - [http_meta_protocol] 协议 默认: http
 * - [http_meta_host] 服务地址 默认: 127.0.0.1
 * - [http_meta_port] 端口号 默认: 9876
 * - [http_meta_start_delay] 初始启动延时(单位: 秒) 默认: 60
 * - [http_meta_proxy_timeout] 每个节点耗时(单位: 秒). 此参数是为了防止脚本异常退出未关闭核心. 设置过小将导致核心过早退出. 目前逻辑: 启动初始的延时 + 每个节点耗时. 默认: 60
 *
 * 其它参数
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [retries] 重试次数 默认 1
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [url] 检测的 URL. 需要 encodeURIComponent. 默认 http://www.apple.com/library/test/success.html
 * - [status] 合法的状态码. 默认 200
 * - [method] 请求方法. 默认 head, 如果测试 URL 不支持, 可设为 get
 * - [show_latency] 显示延迟. 默认不显示
 * - [keep_incompatible] 保留当前客户端不兼容的协议. 默认不保留.
 */

async function operator(proxies = [], targetPlatform, context) {
  const http_meta_host = $arguments.http_meta_host ?? '127.0.0.1'
  const http_meta_port = $arguments.http_meta_port ?? 9876
  const http_meta_protocol = $arguments.http_meta_protocol ?? 'http'
  const http_meta_api = `${http_meta_protocol}://${http_meta_host}:${http_meta_port}`
  // 若未手动关闭, 将按此超时设置自动关闭
  // 此参数是为了防止脚本异常退出未关闭核心. 设置过小将导致核心过早退出. 目前逻辑: 启动初始的延时 + 每个节点耗时(因为测入口的节点为全部节点, 测落地的节点为核心支持的有效节点 先偷懒按全部节点计算)
  const http_meta_start_delay = $arguments.http_meta_start_delay ?? 60
  const http_meta_proxy_timeout = $arguments.http_meta_proxy_timeout ?? 60
  const http_meta_timeout = (http_meta_start_delay + proxies.length * http_meta_proxy_timeout) * 1000
  const method = $arguments.method || 'head'
  const keepIncompatible = $arguments.keep_incompatible
  const validStatus = parseInt($arguments.status || 200)
  const url = decodeURIComponent($arguments.url || 'http://www.apple.com/library/test/success.html')

  const $ = $substore
  const validProxies = []
  const incompatibleProxies = []
  const internalProxies = []
  proxies.map((proxy, index) => {
    try {
      const node = ProxyUtils.produce([proxy], 'ClashMeta', 'internal')?.[0]
      if (node) {
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
      http_meta_timeout / 60 / 1000
    } 分钟后自动关闭\n`
  )

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

  return keepIncompatible ? [...validProxies, ...incompatibleProxies] : validProxies

  async function check(proxy) {
    try {
      // $.info(JSON.stringify(proxy, null, 2))
      const index = internalProxies.indexOf(proxy)
      const startedAt = Date.now()
      const res = await http({
        proxy: `http://${http_meta_host}:${http_meta_ports[index]}`,
        method,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1',
        },
        url,
      })
      const status = parseInt(res.status || res.statusCode || 200)
      let latency = ''
      if ($arguments.show_latency) {
        latency = `${Date.now() - startedAt}`
      }
      $.info(`status: ${status}, latency: ${latency}`)
      // 判断响应
      if (status == validStatus) {
        validProxies.push({
          ...proxy,
          name: `${latency ? `[${latency}] ` : ''}${proxy.name}`,
        })
      }
    } catch (e) {
      $.error(e)
    }
  }
  // 请求
  async function http(opt = {}) {
    const METHOD = opt.method || $arguments.method || 'get'
    const TIMEOUT = parseFloat(opt.timeout || $arguments.timeout || 5000)
    const RETRIES = parseFloat(opt.retries ?? $arguments.retries ?? 1)
    const RETRY_DELAY = parseFloat(opt.retry_delay ?? $arguments.retries ?? 1000)

    let count = 0
    const fn = async () => {
      try {
        return await $.http[METHOD]({ ...opt, timeout: TIMEOUT })
      } catch (e) {
        $.error(e)
        if (count < RETRIES) {
          count++
          const delay = RETRY_DELAY * count
          $.log(`第 ${count} 次请求失败: ${e.message || e}, 等待 ${delay / 1000}s 后重试`)
          await $.wait(delay)
          return await fn()
        }
      }
    }
    return await fn()
  }
}

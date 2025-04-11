/**
 * 节点测活(Node.js, 仅测试 server+port connect, 不保证节点可用性)
 *
 * ❤️ 点子和原始逻辑来自 @Momiji233
 *
 * 说明: https://t.me/zhetengsha/1607
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 执行后会给节点加上 `_latency` 字段, 方便之后再处理
 *
 * 参数
 * - [show_latency] 显示延迟. 默认不显示
 * - [timeout] 请求超时(单位: 毫秒) 默认 5000
 * - [retries] 重试次数 默认 1
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 10
 * - [cache] 使用缓存, 默认不使用缓存
 * 关于缓存时长
 * 当使用相关脚本时, 若在对应的脚本中使用参数开启缓存, 可设置持久化缓存 sub-store-csr-expiration-time 的值来自定义默认缓存时长, 默认为 172800000 (48 * 3600 * 1000, 即 48 小时)
 * 🎈Loon 可在插件中设置
 * 其他平台同理, 持久化缓存数据在 JSON 里
 * 可以在脚本的前面添加一个脚本操作, 实现保留 1 小时的缓存. 这样比较灵活
 * async function operator() {
 *     scriptResourceCache._cleanup(undefined, 1 * 3600 * 1000);
 * }
 */

async function operator(proxies = [], targetPlatform, env) {
  const $ = $substore
  const { isNode } = $.env
  if (!isNode) throw new Error('仅支持 Node.js')
  const net = require('net')
  const process = require('process')
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const validProxies = []

  const concurrency = parseInt($arguments.concurrency || 10) // 一组并发数
  await executeAsyncTasks(
    proxies.map(proxy => () => check(proxy)),
    { concurrency }
  )

  // const batches = []
  // for (let i = 0; i < proxies.length; i += concurrency) {
  //   const batch = proxies.slice(i, i + concurrency)
  //   batches.push(batch)
  // }
  // for (const batch of batches) {
  //   await Promise.all(batch.map(check))
  // }

  return validProxies

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled ? `connect-latency:${proxy.server}:${proxy.port}` : undefined
    // $.info(`检测 ${id}`)
    try {
      const cached = cache.get(id)
      if (cacheEnabled && cached) {
        $.info(`[${proxy.name}] 使用缓存`)
        if (cached.latency) {
          validProxies.push({
            ...proxy,
            name: `${$arguments.show_latency ? `[${cached.latency}] ` : ''}${proxy.name}`,
            _latency: cached.latency,
          })
        }
        return
      }
      // 连接
      const latency = await connect(proxy.server, proxy.port)
      $.info(`[${proxy.name}] latency: ${latency}`)
      validProxies.push({
        ...proxy,
        name: `${$arguments.show_latency ? `[${latency}] ` : ''}${proxy.name}`,
        _latency: latency,
      })
      if (cacheEnabled) {
        $.info(`[${proxy.name}] 设置成功缓存`)
        cache.set(id, { latency })
      }
    } catch (e) {
      $.error(`[${proxy.name}] ${e.message ?? e}`)
      if (cacheEnabled) {
        $.info(`[${proxy.name}] 设置失败缓存`)
        cache.set(id, {})
      }
    }
  }

  // 连接
  async function connect(host, port) {
    const TIMEOUT = parseFloat($arguments.timeout || 5000)
    const RETRIES = parseFloat($arguments.retries ?? 1)
    const RETRY_DELAY = parseFloat($arguments.retry_delay ?? 1000)

    let count = 0
    const fn = async () => {
      try {
        return await Promise.race([
          new Promise((resolve, reject) => {
            const startTime = process.hrtime()

            const client = net.createConnection({ host, port }, () => {
              const connectTime = process.hrtime(startTime)
              resolve(Math.round(connectTime[0] * 1000 + connectTime[1] / 1e6))

              client.end()
            })

            client.on('error', e => {
              reject(e)
            })
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT)),
        ])
      } catch (e) {
        // $.error(e)
        if (count < RETRIES) {
          count++
          const delay = RETRY_DELAY * count
          // $.info(`第 ${count} 次失败: ${e.message || e}, 等待 ${delay / 1000}s 后重试`)
          await $.wait(delay)
          return await fn()
        } else {
          throw e
        }
      }
    }
    return await fn()
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

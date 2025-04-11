/**
 * 节点测速娱乐版(适配 Surge/Loon 版)
 *
 * 说明: https://t.me/zhetengsha/1258
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 参数
 * - [timeout] 请求超时(单位: 毫秒) 默认 10000
 * - [retries] 重试次数 默认 0
 * - [retry_delay] 重试延时(单位: 毫秒) 默认 1000
 * - [concurrency] 并发数 默认 1
 * - [size] 测速大小(单位 MB). 默认 10
 * - [show_speed] 显示速度. 默认不显示. 注: 即使不开启这个参数, 节点上也会添加一个 _speed 字段
 * - [keep_incompatible] 保留当前客户端不兼容的协议. 默认不保留.
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

async function operator(proxies = [], targetPlatform, context) {
  const $ = $substore
  const { isLoon, isSurge } = $.env
  if (!isLoon && !isSurge) throw new Error('仅支持 Loon 和 Surge(ability=http-client-policy)')
  const cacheEnabled = $arguments.cache
  const cache = scriptResourceCache
  const keepIncompatible = $arguments.keep_incompatible
  const bytes = ($arguments.size || 10) * 1024 * 1024
  const url = `https://speed.cloudflare.com/__down?bytes=${bytes}`
  const target = isLoon ? 'Loon' : isSurge ? 'Surge' : undefined
  const validProxies = []
  const concurrency = parseInt($arguments.concurrency || 1) // 一组并发数
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

  return validProxies.sort((a, b) => b._speed - a._speed)

  async function check(proxy) {
    // $.info(`[${proxy.name}] 检测`)
    // $.info(`检测 ${JSON.stringify(proxy, null, 2)}`)
    const id = cacheEnabled
      ? `speed:${JSON.stringify(
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
          if (cached.speed) {
            validProxies.push({
              ...proxy,
              name: `${$arguments.show_speed ? `[${cached.speed} M] ` : ''}${proxy.name}`,
              _speed: cached.speed,
            })
          }
          return
        }
        // 请求
        const startedAt = Date.now()
        const res = await http({
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
        const speed = Math.round((bytes / 1024 / 1024 / (latency / 1000)) * 8)
        $.info(`[${proxy.name}] status: ${status}, latency: ${latency}, speed: ${speed} M`)
        // 判断响应
        if (speed) {
          validProxies.push({
            ...proxy,
            name: `${$arguments.show_speed ? `[${speed} M] ` : ''}${proxy.name}`,
            _speed: speed,
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
    const TIMEOUT = parseFloat(opt.timeout || $arguments.timeout || 10000)
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

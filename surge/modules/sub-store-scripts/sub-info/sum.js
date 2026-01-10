// 合并组合订阅中单条订阅的流量 仅做流量加法
// 旧版是拉取订阅的时候 去写入流量信息 所以可能是下一次才会在客户端里看到新的流量信息
// 新版 后端 >= 2.20.69 是实时的

async function operator(proxies = [], targetPlatform, context) {
  const SUBS_KEY = 'subs'
  const COLLECTIONS_KEY = 'collections'
  const $ = $substore
  const { source } = context
  const { _collection: collection } = source
  if (!collection || Object.keys(source).length > 1) throw new Error('暂时仅支持组合订阅, 请在组合订阅中使用此脚本')

  const allSubs = $.read(SUBS_KEY) || []
  let uploadSum = 0
  let downloadSum = 0
  let totalSum = 0
  let expire

  let args = $arguments || {}
  const { parseFlowHeaders, getFlowHeaders, flowTransfer, getRmainingDays } = flowUtils

  const subnames = [...collection.subscriptions]
  let subscriptionTags = collection.subscriptionTags
  if (Array.isArray(subscriptionTags) && subscriptionTags.length > 0) {
    allSubs.forEach(sub => {
      if (
        Array.isArray(sub.tag) &&
        sub.tag.length > 0 &&
        !subnames.includes(sub.name) &&
        sub.tag.some(tag => subscriptionTags.includes(tag))
      ) {
        subnames.push(sub.name)
      }
    })
  }

  for await (const sub of allSubs) {
    if (subnames.includes(sub.name)) {
      let subInfo
      if (sub.source === 'local' && !['localFirst', 'remoteFirst'].includes(sub.mergeSources)) {
        if (sub.subUserinfo) {
          if (/^https?:\/\//.test(sub.subUserinfo)) {
            subInfo = await getFlowHeaders(undefined, undefined, undefined, sub.proxy, sub.subUserinfo)
          } else {
            subInfo = sub.subUserinfo
          }
        }
      } else {
        let url = `${sub.url}`
          .split(/[\r\n]+/)
          .map(i => i.trim())
          .filter(i => i.length)?.[0]

        let urlArgs = {}
        const rawArgs = url.split('#')
        url = url.split('#')[0]
        if (rawArgs.length > 1) {
          try {
            // 支持 `#${encodeURIComponent(JSON.stringify({arg1: "1"}))}`
            urlArgs = JSON.parse(decodeURIComponent(rawArgs[1]))
          } catch (e) {
            for (const pair of rawArgs[1].split('&')) {
              const key = pair.split('=')[0]
              const value = pair.split('=')[1]
              // 部分兼容之前的逻辑 const value = pair.split('=')[1] || true;
              urlArgs[key] = value == null || value === '' ? true : decodeURIComponent(value)
            }
          }
        }
        args = { ...urlArgs, ...args }
        if (!args.noFlow) {
          if (sub.subUserinfo) {
            if (/^https?:\/\//.test(sub.subUserinfo)) {
              subInfo = await getFlowHeaders(undefined, undefined, undefined, sub.proxy, sub.subUserinfo)
            } else {
              subInfo = sub.subUserinfo
            }
          } else {
            subInfo = await getFlowHeaders(url)
          }
        }
      }
      if (subInfo) {
        const {
          total,
          usage: { upload, download },
          expires,
        } = parseFlowHeaders(subInfo)
        if (upload > 0) uploadSum += upload
        if (download > 0) downloadSum += download
        if (total > 0) totalSum += total
        if (expires && expires * 1000 > Date.now()) {
          expire = expire ? Math.min(expire, expires) : expires
        }
      }
    }
  }
  const subUserInfo = `upload=${uploadSum}; download=${downloadSum}; total=${totalSum}${
    expire ? ` ; expire=${expire}` : ''
  }`

  // 旧版需要写入, 返回响应头里使用这个
  const allCols = $.read(COLLECTIONS_KEY) || []
  for (var index = 0; index < allCols.length; index++) {
    if (collection.name === allCols[index].name) {
      // 写入订阅流量信息
      allCols[index].subUserinfo = subUserInfo
      break
    }
  }
  $.write(allCols, COLLECTIONS_KEY)

  // 新版直接可以加到响应头里
  if ($options) {
    $options._res = {
      headers: {
        'subscription-userinfo': subUserInfo,
      },
    }
  }

  return proxies
}

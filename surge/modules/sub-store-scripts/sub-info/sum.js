// 合并组合订阅中单条订阅的流量 仅做流量加法
// 这个是拉取订阅的时候 去写入流量信息
// 所以可能是下一次才会在客户端里看到新的流量信息

async function operator(proxies = [], targetPlatform, context) {
  const SUBS_KEY = 'subs'
  const COLLECTIONS_KEY = 'collections'
  const $ = $substore
  const { source } = context
  if (!source._collection || Object.keys(source).length > 1)
    throw new Error('暂时仅支持组合订阅, 请在组合订阅中使用此脚本')

  const allSubs = $.read(SUBS_KEY) || []
  let uploadSum = 0
  let downloadSum = 0
  let totalSum = 0

  let args = $arguments || {}
  const { parseFlowHeaders, getFlowHeaders, flowTransfer, getRmainingDays } = flowUtils

  for await (const sub of allSubs) {
    if (source._collection.subscriptions.includes(sub.name)) {
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
        } = parseFlowHeaders(subInfo)
        if (upload > 0) uploadSum += upload
        if (download > 0) downloadSum += download
        if (total > 0) totalSum += total
      }
    }
  }

  const allCols = $.read(COLLECTIONS_KEY) || []
  for (var index = 0; index < allCols.length; index++) {
    if (source._collection.name === allCols[index].name) {
      // 写入订阅流量信息
      allCols[index].subUserinfo = `upload=${uploadSum}; download=${downloadSum}; total=${totalSum}`
      break
    }
  }
  $.write(allCols, COLLECTIONS_KEY)

  return proxies
}

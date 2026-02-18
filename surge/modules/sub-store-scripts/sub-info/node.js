async function operator(proxies = [], targetPlatform, context) {
  let args = $arguments || {}
  const $ = $substore
  const { parseFlowHeaders, getFlowHeaders, flowTransfer, getRmainingDays, normalizeFlowHeader } = flowUtils
  const sub = context.source[proxies?.[0]?._subName || proxies?.[0]?.subName]
  let subInfo
  let flowInfo
  if (sub.source !== 'local' || ['localFirst', 'remoteFirst'].includes(sub.mergeSources)) {
    try {
      let url =
        `${sub.url}`
          .split(/[\r\n]+/)
          .map(i => i.trim())
          .filter(i => i.length)?.[0] || ''

      let urlArgs = {}
      rawArgs = url.split('#')
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
      if (!urlArgs.noFlow && /^https?/.test(url)) {
        // forward flow headers
        flowInfo = await getFlowHeaders(
          urlArgs?.insecure ? `${url}#insecure` : url,
          urlArgs.flowUserAgent,
          undefined,
          sub.proxy,
          urlArgs.flowUrl
        )
        if (flowInfo) {
          const headers = normalizeFlowHeader(flowInfo, true)
          if (headers?.['subscription-userinfo']) {
            subInfo = headers['subscription-userinfo']
          }
        }
      }
      args = { ...urlArgs, ...args }
    } catch (err) {
      $.error(`订阅 ${sub.name} 获取流量信息时发生错误: ${JSON.stringify(err)}`)
      $.error(err?.message)
      $.error(err?.stack)
    }
  }
  if (sub.subUserinfo) {
    let subUserInfo
    if (/^https?:\/\//.test(sub.subUserinfo)) {
      try {
        subUserInfo = await getFlowHeaders(undefined, undefined, undefined, proxy || sub.proxy, sub.subUserinfo)
      } catch (e) {
        $.error(`订阅 ${sub.name} 使用自定义流量链接 ${sub.subUserinfo} 获取流量信息时发生错误: ${JSON.stringify(e)}`)
      }
    } else {
      subUserInfo = sub.subUserinfo
    }

    const headers = normalizeFlowHeader([subUserInfo, flowInfo].filter(i => i).join(';'), true)
    if (headers?.['subscription-userinfo']) {
      subInfo = headers['subscription-userinfo']
    }
  }

  if (subInfo) {
    let {
      expires,
      total,
      usage: { upload, download },
    } = parseFlowHeaders(subInfo)
    if (args.hideExpire) {
      expires = undefined
    }
    const date = expires ? new Date(expires * 1000).toLocaleDateString() : ''
    let remainingDays
    try {
      remainingDays = getRmainingDays({
        resetDay: args.resetDay,
        startDate: args.startDate,
        cycleDays: args.cycleDays,
      })
    } catch (e) {}
    let show = upload + download
    if (args.showRemaining) {
      show = total - show
    }
    const showT = flowTransfer(Math.abs(show))
    showT.value = show < 0 ? '-' + showT.value : showT.value
    const totalT = flowTransfer(total)
    let name = `流量 ${showT.value} ${showT.unit} / ${totalT.value} ${totalT.unit}`
    if (remainingDays) {
      name = `${name} | ${remainingDays} 天`
    }
    if (date) {
      name = `${name} | ${date}`
    }
    // 获取 proxies 的最后一项
    const node = proxies[proxies.length - 1] || {
      type: 'ss',
      server: '1.0.0.1',
      port: 80,
      cipher: 'aes-128-gcm',
      password: 'password',
    }
    proxies.unshift({
      ...node,
      name,
    })
  }

  return proxies
}

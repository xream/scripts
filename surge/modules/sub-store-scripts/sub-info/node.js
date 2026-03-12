async function operator(proxies = [], targetPlatform, context) {
  let args = $arguments || {}
  const $ = $substore
  const { parseFlowHeaders, getFlowHeaders, flowTransfer, getRmainingDays, normalizeFlowHeader } = flowUtils
  const sub = context.source[proxies?.[0]?._subName || proxies?.[0]?.subName]
  let subInfo
  let flowInfo
  let rawSubInfo = ''
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
        subUserInfo = await getFlowHeaders(
          undefined,
          undefined,
          undefined,
          sub.proxy,
          sub.subUserinfo
        )
      } catch (e) {
        $.error(
          `订阅 ${sub.name} 使用自定义流量链接 ${sub.subUserinfo} 获取流量信息时发生错误: ${e?.message ?? e}`
        )
        $.error(e?.stack)
      }
    } else {
      subUserInfo = sub.subUserinfo
    }

    const parts = [subUserInfo, flowInfo]
      .filter(i => i != null)
      .map(i => (typeof i === 'string' ? i : JSON.stringify(i)))

    const headers = normalizeFlowHeader(parts.join(';'), true)

    if (headers?.['subscription-userinfo']) {
      subInfo = headers['subscription-userinfo']
      rawSubInfo = parts.join(';')
    }
  }

  // 解析扩展字段（last_update / plan_name / reset_hour 等非标准字段）
  function parseExtendedFields(raw = '') {
    const result = {}
    for (const segment of raw.split(/[;,]/)) {
      const eqIdx = segment.indexOf('=')
      if (eqIdx === -1) continue
      const key = segment.slice(0, eqIdx).trim()
      const value = segment.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
      result[key] = value
    }
    return result
  }

  // 格式化重置剩余时间：< 24 小时显示小时数，否则显示天数
  function formatResetTime(hours) {
    if (hours == null || isNaN(hours) || hours < 0) return ''
    if (hours < 24) return `${hours}h 后重置`
    const days = Math.round(hours / 24)
    return `${days}天后重置`
  }

  if (subInfo) {
    let {
      expires,
      total,
      usage: { upload, download },
    } = parseFlowHeaders(subInfo)

    // 解析扩展字段
    const extFields = parseExtendedFields(rawSubInfo)
    const lastUpdate = extFields['last_update']
    const planName = extFields['plan_name']
    const resetHour = extFields['reset_hour'] != null ? parseInt(extFields['reset_hour']) : null

    if (args.hideExpire) {
      expires = undefined
    }
    const date = expires
      ? new Date(expires * 1000).toLocaleDateString('sv') // YYYY-MM-DD
      : ''

    let remainingDays
    try {
      remainingDays = getRmainingDays({
        resetDay: args.resetDay,
        startDate: args.startDate,
        cycleDays: args.cycleDays,
      })
    } catch (e) { }

    let show = upload + download
    if (args.showRemaining) {
      show = total - show
    }
    const showT = flowTransfer(Math.abs(show))
    showT.value = show < 0 ? '-' + showT.value : showT.value
    const totalT = flowTransfer(total)
    let name

    if (args.showLastUpdate && lastUpdate) {
      const shortTime = lastUpdate.slice(0, 16)
      name = `${shortTime} | ${showT.value} ${showT.unit}`

      const resetStr = formatResetTime(resetHour)
      if (resetStr) {
        name = `${name} | ${resetStr}`
      } else if (extFields['reset_day']) {
        name = `${name} | 每月${extFields['reset_day']}日重置`
      }

      if (planName) {
        name = `${name} | ${planName}`
      }
    } else {
      // 仅在非 showLastUpdate 模式下才需要 remainingDays
      let remainingDays
      try {
        remainingDays = getRmainingDays({
          resetDay: args.resetDay,
          startDate: args.startDate,
          cycleDays: args.cycleDays,
        })
      } catch (e) { }

      name = `流量 ${showT.value} ${showT.unit} / ${totalT.value} ${totalT.unit}`
      if (remainingDays) {
        name = `${name} | ${remainingDays} 天`
      }
      if (date) {
        name = `${name} | ${date}`
      }
    }

    // 三端兼容协议白名单
    const COMPATIBLE_TYPES = new Set(['ss', 'trojan', 'vmess', 'vless'])

    // proxies 的最后一项
    const lastProxy = proxies[proxies.length - 1]
    const isCompatible = lastProxy && COMPATIBLE_TYPES.has(lastProxy.type?.toLowerCase())

    const dummyNode = {
      type: 'ss',
      server: '1.0.0.1',
      port: 443,
      cipher: 'aes-128-gcm',
      password: 'password',
    }


    proxies.unshift({
      ...(isCompatible ? lastProxy : dummyNode),
      name,
    })
  }

  return proxies
}

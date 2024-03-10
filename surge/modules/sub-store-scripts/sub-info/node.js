async function operator(proxies = [], targetPlatform, env) {
  const { parseFlowHeaders, getFlowHeaders, flowTransfer, getRmainingDays } = flowUtils
  const sub = env.source[proxies[0].subName]
  const localOnly = sub.source === 'local' && !['localFirst', 'remoteFirst'].includes(sub.mergeSources)

  if (!localOnly && sub.url) {
    let url = `${sub.url}`
      .split(/[\r\n]+/)
      .map(i => i.trim())
      .filter(i => i.length)?.[0]

    let $arguments = {}
    const rawArgs = url.split('#')
    url = url.split('#')[0]
    if (rawArgs.length > 1) {
      try {
        // 支持 `#${encodeURIComponent(JSON.stringify({arg1: "1"}))}`
        $arguments = JSON.parse(decodeURIComponent(rawArgs[1]))
      } catch (e) {
        for (const pair of rawArgs[1].split('&')) {
          const key = pair.split('=')[0]
          const value = pair.split('=')[1]
          // 部分兼容之前的逻辑 const value = pair.split('=')[1] || true;
          $arguments[key] = value == null || value === '' ? true : decodeURIComponent(value)
        }
      }
    }
    if (!$arguments.noFlow) {
      const {
        expires,
        total,
        usage: { upload, download },
      } = parseFlowHeaders(await getFlowHeaders(url))
      const date = expires ? new Date(expires * 1000).toLocaleDateString() : ''
      let remainingDays
      try {
        remainingDays = getRmainingDays($arguments.resetDay)
      } catch (e) {}
      const current = upload + download
      const currT = flowTransfer(Math.abs(current))
      currT.value = current < 0 ? '-' + currT.value : currT.value
      const totalT = flowTransfer(total)
      let name = `流量 ${currT.value} ${currT.unit} / ${totalT.value} ${totalT.unit}`
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
  }

  return proxies
}

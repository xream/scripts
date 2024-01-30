const $ = new Env('network-info')

$.isRequest = () => typeof $request !== 'undefined'
$.isPanel = () => $.isSurge() && typeof $input != 'undefined' && $.lodash_get($input, 'purpose') === 'panel'
$.isTile = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'tile'
// $.isStashCron = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'cron'

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}
if ($.isRequest()) {
  // $.log($.toStr($request))
  arg = { ...arg, ...parseQueryString($request.url) }
}
const keya = 'spe'
const keyb = 'ge'
const bay = 'edtest'

let result = {}
let title = ''
let content = ''
!(async () => {
  if ($.lodash_get(arg, 'TYPE') === 'EVENT') {
    const eventDelay = parseFloat($.lodash_get(arg, 'EVENT_DELAY') || 3)
    $.log(`网络变化, 等待 ${eventDelay} 秒后开始查询`)
    if (eventDelay) {
      await $.wait(1000 * eventDelay)
    }
  }
  if ($.isTile()) {
    await notify('网络信息', '面板', '开始查询')
  }
  let SSID = ''
  let LAN = ''
  let LAN_IPv4 = ''
  let LAN_IPv6 = ''
  if (typeof $network !== 'undefined') {
    $.log($.toStr($network))
    const v4 = $.lodash_get($network, 'v4.primaryAddress')
    const v6 = $.lodash_get($network, 'v6.primaryAddress')
    if ($.lodash_get(arg, 'SSID') == 1) {
      SSID = $.lodash_get($network, 'wifi.ssid')
    }
    if (v4 && $.lodash_get(arg, 'LAN') == 1) {
      LAN_IPv4 = v4
    }
    if (v6 && $.lodash_get(arg, 'LAN') == 1 && $.lodash_get(arg, 'IPv6') == 1) {
      LAN_IPv6 = v6
    }
  } else if (typeof $config !== 'undefined') {
    try {
      let conf = $config.getConfig()
      $.log(conf)
      conf = JSON.parse(conf)
      if ($.lodash_get(arg, 'SSID') == 1) {
        SSID = $.lodash_get(conf, 'ssid')
      }
    } catch (e) {}
  }
  if (LAN_IPv4 || LAN_IPv6) {
    LAN = ['LAN:', LAN_IPv4, maskIP(LAN_IPv6)].filter(i => i).join(' ')
  }
  if (LAN) {
    LAN = `${LAN}\n\n`
  }
  if (SSID) {
    SSID = `SSID: ${SSID}\n\n`
  }

  let [
    { CN_IP = '', CN_INFO = '', CN_POLICY = '' } = {},
    { PROXY_IP = '', PROXY_INFO = '', PROXY_PRIVACY = '', PROXY_POLICY = '', IP = '' } = {},
    { CN_IPv6 = '' } = {},
    { PROXY_IPv6 = '' } = {},
  ] = await Promise.all(
    $.lodash_get(arg, 'IPv6') == 1
      ? [getDirectRequestInfo(), getProxyRequestInfo(), getDirectInfoIPv6(), getProxyInfoIPv6()]
      : [getDirectRequestInfo(), getProxyRequestInfo()]
  )
  let continueFlag = true
  if ($.lodash_get(arg, 'TYPE') === 'EVENT') {
    const lastNetworkInfoEvent = $.getjson('lastNetworkInfoEvent')
    if (
      CN_IP !== $.lodash_get(lastNetworkInfoEvent, 'CN_IP') ||
      CN_IPv6 !== $.lodash_get(lastNetworkInfoEvent, 'CN_IPv6') ||
      PROXY_IP !== $.lodash_get(lastNetworkInfoEvent, 'PROXY_IP') ||
      PROXY_IPv6 !== $.lodash_get(lastNetworkInfoEvent, 'PROXY_IPv6')
    ) {
      // 有任何一项不同 都继续
      $.setjson({ CN_IP, PROXY_IP, CN_IPv6, PROXY_IPv6 }, 'lastNetworkInfoEvent')
    } else {
      // 否则 直接结束
      $.log('网络信息未发生变化, 不继续')
      continueFlag = false
    }
  }
  if (continueFlag) {
    if ($.lodash_get(arg, 'PRIVACY') == '1' && PROXY_PRIVACY) {
      PROXY_PRIVACY = `\n${PROXY_PRIVACY}`
    }
    let ENTRANCE = ''
    if (IP && IP !== PROXY_IP) {
      const entranceDelay = parseFloat($.lodash_get(arg, 'ENTRANCE_DELAY') || 0)
      $.log(`入口 IP: ${IP} 与落地 IP: ${PROXY_IP} 不一致, 等待 ${entranceDelay} 秒后查询入口`)
      if (entranceDelay) {
        await $.wait(1000 * entranceDelay)
      }
      let [{ CN_INFO: ENTRANCE_INFO1 = '', isCN = false } = {}, { PROXY_INFO: ENTRANCE_INFO2 = '' } = {}] =
        await Promise.all([getDirectInfo(IP), getProxyInfo(IP)])
      // 国内接口的国外 IP 解析过于离谱 排除掉
      if (ENTRANCE_INFO1 && isCN) {
        ENTRANCE = `入口 IP: ${maskIP(IP) || '-'}\n${maskAddr(ENTRANCE_INFO1)}`
      }
      if (ENTRANCE_INFO2) {
        if (ENTRANCE) {
          ENTRANCE = `${ENTRANCE.replace('位置:', '位置¹:').replace('运营商:', '运营商¹:')}\n${maskAddr(
            ENTRANCE_INFO2.replace('位置:', '位置²:').replace('运营商:', '运营商²:')
          )}`
        } else {
          ENTRANCE = `入口 IP: ${maskIP(IP) || '-'}\n${maskAddr(ENTRANCE_INFO2)}`
        }
      }
    }
    if (ENTRANCE) {
      ENTRANCE = `${ENTRANCE}\n\n`
    }
    if (/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(CN_IPv6)) {
      CN_IPv6 = ''
    }
    if (CN_IPv6 && $.lodash_get(arg, 'IPv6') == 1) {
      CN_IPv6 = `\n${maskIP(CN_IPv6)}`
    }
    if (PROXY_IPv6 && $.lodash_get(arg, 'IPv6') == 1) {
      PROXY_IPv6 = `\n${maskIP(PROXY_IPv6)}`
    }
    if (CN_POLICY === 'DIRECT') {
      CN_POLICY = ``
    } else {
      CN_POLICY = `策略: ${maskAddr(CN_POLICY) || '-'}\n`
    }
    if (CN_INFO) {
      CN_INFO = `\n${CN_INFO}`
    }
    if (PROXY_POLICY === 'DIRECT') {
      PROXY_POLICY = `代理策略: 直连`
    } else {
      PROXY_POLICY = `代理策略: ${maskAddr(PROXY_POLICY) || '-'}`
    }
    if (PROXY_INFO) {
      PROXY_INFO = `\n${PROXY_INFO}`
    }
    title = `${PROXY_POLICY}`
    content = `${SSID}${LAN}${CN_POLICY}IP: ${maskIP(CN_IP) || '-'}${CN_IPv6}${maskAddr(
      CN_INFO
    )}\n\n${ENTRANCE}落地 IP: ${maskIP(PROXY_IP) || '-'}${PROXY_IPv6}${maskAddr(
      PROXY_INFO
    )}${PROXY_PRIVACY}\n执行时间: ${new Date().toTimeString().split(' ')[0]}`
    if ($.isTile()) {
      await notify('网络信息', '面板', '查询完成')
    } else if (!$.isPanel()) {
      if ($.lodash_get(arg, 'TYPE') === 'EVENT') {
        await notify(
          `🄳 ${maskIP(CN_IP) || '-'} 🅿 ${maskIP(PROXY_IP) || '-'}`.replace(/\n+/g, '\n').replace(/\ +/g, ' ').trim(),
          `${maskAddr(CN_INFO.replace(/(位置|运营商).*?:/g, '').replace(/\n/g, ' '))}`
            .replace(/\n+/g, '\n')
            .replace(/\ +/g, ' ')
            .trim(),
          `${maskAddr(PROXY_INFO.replace(/(位置|运营商).*?:/g, '').replace(/\n/g, ' '))}${
            CN_IPv6 ? `\n🄳 ${CN_IPv6.replace(/\n+/g, '')}` : ''
          }${PROXY_IPv6 ? `\n🅿 ${PROXY_IPv6.replace(/\n+/g, '')}` : ''}${SSID ? `\n${SSID}` : SSID}${LAN}`
            .replace(/\n+/g, '\n')
            .replace(/\ +/g, ' ')
            .trim()
        )
      } else {
        await notify('网络信息', title, content)
      }
    }
  }
})()
  .catch(async e => {
    $.logErr(e)
    $.logErr($.toStr(e))
    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    title = `❌`
    content = msg
    await notify('网络信息', title, content)
  })
  .finally(async () => {
    if ($.isRequest()) {
      result = {
        response: {
          status: 200,
          body: JSON.stringify(
            {
              title,
              content,
            },
            null,
            2
          ),
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          },
        },
      }
    } else {
      result = { title, content, ...arg }
    }
    $.log($.toStr(result))
    $.done(result)
  })

async function getDirectRequestInfo() {
  const { CN_IP, CN_INFO } = await getDirectInfo()
  const { POLICY } = await getRequestInfo(
    new RegExp(
      `cip\\.cc|for${keyb}\\.${keya}${bay}\\.cn|api-v3\\.${keya}${bay}\\.cn|ipservice\\.ws\\.126\\.net|api\\.bilibili\\.com|api\\.live\\.bilibili\\.com|myip\\.ipip\\.net|ip\\.ip233\\.cn`
    )
  )
  return { CN_IP, CN_INFO, CN_POLICY: POLICY }
}
async function getProxyRequestInfo() {
  const { PROXY_IP, PROXY_INFO, PROXY_PRIVACY } = await getProxyInfo()
  const { POLICY, IP } = await getRequestInfo(/ipinfo\.io|ip-score\.com|ipwhois\.app|ip-api\.com|api-ipv4\.ip\.sb/)
  return { PROXY_IP, PROXY_INFO, PROXY_PRIVACY, PROXY_POLICY: POLICY, IP }
}
async function getRequestInfo(regexp) {
  let POLICY = ''
  let IP = ''
  try {
    const { requests } = await httpAPI('/v1/requests/recent', 'GET')
    const request = requests.slice(0, 10).find(i => regexp.test(i.URL))
    // $.log('recent request', $.toStr(request))
    POLICY = request.policyName
    if (/\(Proxy\)/.test(request.remoteAddress)) {
      IP = request.remoteAddress.replace(/\s*\(Proxy\)\s*/, '')
    }
  } catch (e) {
    $.log(`从最近请求中获取 ${regexp} 发生错误: ${e.message || e}`)
    $.logErr(e)
    $.logErr($.toStr(e))
  }
  return {
    POLICY,
    IP,
  }
}
async function getDirectInfo(ip) {
  let CN_IP
  let CN_INFO
  let isCN
  const msg = `使用 ${$.lodash_get(arg, 'DOMESTIC_IPv4') || 'spcn'} 查询 ${ip ? ip : '分流'} 信息`
  if ($.lodash_get(arg, 'DOMESTIC_IPv4') == 'cip') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `http://cip.cc/${ip ? encodeURIComponent(ip) : ''}`,
        headers: { 'User-Agent': 'curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3' },
      })
      let body = String($.lodash_get(res, 'body'))
      const addr = body.match(/地址\s*(:|：)\s*(.*)/)[2]
      isCN = addr.includes('中国')
      CN_IP = ip || body.match(/IP\s*(:|：)\s*(.*?)\s/)[2]
      CN_INFO = [
        ['位置:', isCN ? getflag('CN') : undefined, addr.replace(/中国\s*/, '') || ''].filter(i => i).join(' '),
        ['运营商:', body.match(/运营商\s*(:|：)\s*(.*)/)[2].replace(/中国\s*/, '') || ''].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && $.lodash_get(arg, 'DOMESTIC_IPv4') == 'ipip') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://myip.ipip.net`,
        headers: { 'User-Agent': 'curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3' },
      })
      let body = String($.lodash_get(res, 'body'))
      CN_IP = body.match(/IP\s*(:|：)\s*(.*?)\s/)[2]
      let info = body.match(/来自于\s*(:|：)\s*(.*)/)[2]
      isCN = info.startsWith('中国')
      CN_INFO = ['位置:', isCN ? getflag('CN') : undefined, info.replace(/中国\s*/, '')].filter(i => i).join(' ')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && $.lodash_get(arg, 'DOMESTIC_IPv4') == 'bilibili') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://api.bilibili.com/x/web-interface/zone`,
        // url: `https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}

      isCN = $.lodash_get(body, 'data.country') === '中国'
      CN_IP = $.lodash_get(body, 'data.addr')
      CN_INFO = [
        [
          '位置:',
          isCN ? getflag('CN') : undefined,
          $.lodash_get(body, 'data.country'),
          $.lodash_get(body, 'data.province'),
          $.lodash_get(body, 'data.city'),
        ]
          .filter(i => i)
          .join(' '),
        ['运营商:', $.lodash_get(body, 'data.isp')].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && $.lodash_get(arg, 'DOMESTIC_IPv4') == '126') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://ipservice.ws.126.net/locate/api/getLocByIp`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}

      const countryCode = $.lodash_get(body, 'result.countrySymbol')
      isCN = countryCode === 'CN'
      CN_IP = $.lodash_get(body, 'result.ip')
      CN_INFO = [
        [
          '位置:',
          getflag(countryCode),
          $.lodash_get(body, 'result.country'),
          $.lodash_get(body, 'result.province'),
          $.lodash_get(body, 'result.city'),
        ]
          .filter(i => i)
          .join(' '),
        ['运营商:', $.lodash_get(body, 'result.operator')].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && $.lodash_get(arg, 'DOMESTIC_IPv4') == 'ip233') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://ip.ip233.cn/ip`,
        headers: {
          Referer: 'https://ip233.cn/',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}

      const countryCode = $.lodash_get(body, 'country')
      isCN = countryCode === 'CN'
      CN_IP = $.lodash_get(body, 'ip')
      CN_INFO = ['位置:', getflag(countryCode), $.lodash_get(body, 'desc').replace(/中国\s*/, '')]
        .filter(i => i)
        .join(' ')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      if (ip) {
        const res = await $.http.get({
          timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
          url: `https://api-v3.${keya}${bay}.cn/ip`,
          params: { ip },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
          },
        })
        let body = String($.lodash_get(res, 'body'))
        try {
          body = JSON.parse(body)
        } catch (e) {}
        const countryCode = $.lodash_get(body, 'data.countryCode')
        isCN = countryCode === 'CN'
        CN_IP = ip || $.lodash_get(body, 'data.ip')
        CN_INFO = [
          [
            '位置:',
            getflag(countryCode),
            $.lodash_get(body, 'data.country').replace(/\s*中国\s*/, ''),
            $.lodash_get(body, 'data.province'),
            $.lodash_get(body, 'data.city'),
            $.lodash_get(body, 'data.district'),
          ]
            .filter(i => i)
            .join(' '),
          ['运营商:', $.lodash_get(body, 'data.operator') || $.lodash_get(body, 'data.isp') || '-']
            .filter(i => i)
            .join(' '),
        ]
          .filter(i => i)
          .join('\n')
      } else {
        const res = await $.http.get({
          timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
          url: `https://for${keyb}.${keya}${bay}.cn/api/location/info`,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
          },
        })
        let body = String($.lodash_get(res, 'body'))
        try {
          body = JSON.parse(body)
        } catch (e) {}
        const countryCode = body.country_code
        isCN = countryCode === 'CN'
        CN_IP = body.ip
        CN_INFO = [
          [
            '位置:',
            getflag(countryCode),
            body.country.replace(/\s*中国\s*/, ''),
            body.province,
            body.city,
            body.distinct,
          ]
            .filter(i => i)
            .join(' '),
          ['运营商:', body.net_str || body.operator || body.isp].filter(i => i).join(' '),
        ]
          .filter(i => i)
          .join('\n')
      }
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }
  return { CN_IP, CN_INFO: simplifyAddr(CN_INFO), isCN }
}
async function getDirectInfoIPv6() {
  let CN_IPv6
  const msg = `使用 ${$.lodash_get(arg, 'DOMESTIC_IPv6') || 'ddnspod'} 查询 IPv6 分流信息`
  if ($.lodash_get(arg, 'DOMESTIC_IPv6') == 'neu6') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://speed.neu6.edu.cn/getIP.php`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      CN_IPv6 = body.trim()
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://ipv6.ddnspod.com`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      CN_IPv6 = body.trim()
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }
  return { CN_IPv6 }
}
async function getProxyInfo(ip) {
  let PROXY_IP
  let PROXY_INFO
  let PROXY_PRIVACY

  const msg = `使用 ${$.lodash_get(arg, 'LANDING_IPv4') || 'ipapi'} 查询 ${ip ? ip : '分流'} 信息`

  if ($.lodash_get(arg, 'LANDING_IPv4') == 'ipinfo') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://ipinfo.io/widget/${ip ? encodeURIComponent(ip) : ''}`,
        headers: {
          Referer: 'https://ipinfo.io/',
          'User-Agent':
            'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/109.0.0.0',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'ip')
      PROXY_INFO = [
        ['位置:', getflag(body.country), body.country.replace(/\s*中国\s*/, ''), body.region, body.city]
          .filter(i => i)
          .join(' '),
        ['运营商:', $.lodash_get(body, 'company.name') || $.lodash_get(body, 'asn.name')].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
      if (!ip && $.lodash_get(arg, 'PRIVACY') == '1') {
        const privacyObj = $.lodash_get(body, 'privacy') || {}
        let privacy = []
        const privacyMap = {
          true: '✓',
          false: '✗',
          '': '-',
        }
        Object.keys(privacyObj).forEach(key => {
          privacy.push(`${key.toUpperCase()}: ${privacyMap[privacyObj[key]]}`)
        })
        if (privacy.length > 0) {
          PROXY_PRIVACY = `隐私安全:\n${privacy.join('\n')}`
        } else {
          PROXY_PRIVACY = `隐私安全: -`
        }
      }
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if ($.lodash_get(arg, 'LANDING_IPv4') == 'ipscore') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://ip-score.com/json`,
        params: { ip },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/109.0.0.0',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'ip')
      PROXY_INFO = [
        [
          '位置¹:',
          getflag($.lodash_get(body, 'geoip1.countrycode')),
          $.lodash_get(body, 'geoip1.country'),
          $.lodash_get(body, 'geoip1.region'),
          $.lodash_get(body, 'geoip1.city'),
        ]
          .filter(i => i)
          .join(' '),
        [
          '位置²:',
          getflag($.lodash_get(body, 'geoip2.countrycode')),
          $.lodash_get(body, 'geoip2.country'),
          $.lodash_get(body, 'geoip2.region'),
          $.lodash_get(body, 'geoip2.city'),
        ]
          .filter(i => i)
          .join(' '),
        ['运营商:', body.isp || body.org || body.asn].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if ($.lodash_get(arg, 'LANDING_IPv4') == 'ipsb') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://api-ipv4.ip.sb/geoip${ip ? `/${encodeURIComponent(ip)}` : ''}`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/109.0.0.0',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'ip')
      PROXY_INFO = [
        [
          '位置:',
          getflag($.lodash_get(body, 'country_code')),
          $.lodash_get(body, 'country'),
          $.lodash_get(body, 'region'),
          $.lodash_get(body, 'city'),
        ]
          .filter(i => i)
          .join(' '),

        ['运营商:', body.isp || body.organization].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if ($.lodash_get(arg, 'LANDING_IPv4') == 'ipwhois') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://ipwhois.app/widget.php`,
        params: {
          lang: 'zh-CN',
          ip,
        },
        headers: {
          Host: 'ipwhois.app',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
          Accept: '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          'Accept-Encoding': 'gzip, deflate, br',
          Origin: 'https://ipwhois.io',
          Connection: 'keep-alive',
          Referer: 'https://ipwhois.io/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}

      PROXY_IP = ip || $.lodash_get(body, 'ip')
      PROXY_INFO = [
        ['位置:', getflag(body.country_code), body.country.replace(/\s*中国\s*/, ''), body.region, body.city]
          .filter(i => i)
          .join(' '),
        ['运营商:', $.lodash_get(body, 'connection.org') || $.lodash_get(body, 'connection.isp')]
          .filter(i => i)
          .join(' '),
      ]
        .filter(i => i)
        .join('\n')
      if (!ip && $.lodash_get(arg, 'PRIVACY') == 1) {
        const securityMap = {
          true: '✓',
          false: '✗',
          '': '-',
        }
        const securityObj = $.lodash_get(body, 'security') || {}
        let security = []
        Object.keys(securityObj).forEach(key => {
          security.push(`${key.toUpperCase()}: ${securityMap[securityObj[key]]}`)
        })
        if (security.length > 0) {
          PROXY_PRIVACY = `隐私安全:\n${security.join('\n')}`
        } else {
          PROXY_PRIVACY = `隐私安全: -`
        }
      }
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      const p = ip ? `/${encodeURIComponent(ip)}` : ''
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `http://ip-api.com/json${p}?lang=zh-CN`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/109.0.0.0',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'query')
      PROXY_INFO = [
        ['位置:', getflag(body.countryCode), body.country.replace(/\s*中国\s*/, ''), body.regionName, body.city]
          .filter(i => i)
          .join(' '),
        ['运营商:', body.isp || body.org || body.as].filter(i => i).join(' '),
      ]
        .filter(i => i)
        .join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }

  return { PROXY_IP, PROXY_INFO: simplifyAddr(PROXY_INFO), PROXY_PRIVACY }
}
async function getProxyInfoIPv6() {
  let PROXY_IPv6
  const msg = `使用 ${$.lodash_get(arg, 'LANDING_IPv6') || 'ipsb'} 查询 IPv6 分流信息`
  if ($.lodash_get(arg, 'LANDING_IPv6') == 'ident') {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://v6.ident.me`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      PROXY_IPv6 = body.trim()
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      const res = await $.http.get({
        timeout: parseFloat($.lodash_get(arg, 'TIMEOUT') || 5),
        url: `https://api-ipv6.ip.sb/ip`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      PROXY_IPv6 = body.trim()
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }

  return { PROXY_IPv6 }
}
function simplifyAddr(addr) {
  if (!addr) return ''
  return addr
    .split(/\n/)
    .map(i => Array.from(new Set(i.split(/\ +/))).join(' '))
    .join('\n')
}
function maskAddr(addr) {
  if (!addr) return ''
  if ($.lodash_get(arg, 'MASK') == 1) {
    let result = ''
    const parts = addr.split(' ')

    if (parts.length >= 3) {
      // 如果有两个或更多的空格，按空格分组后将中间的部分替换为"*"
      result = [parts[0], '*', parts[parts.length - 1]].join(' ')
    } else {
      // 如果空格少于2个，将字符串三等分，将中间的部分替换为"*"
      const third = Math.floor(addr.length / 3)
      result = addr.substring(0, third) + '*'.repeat(third) + addr.substring(2 * third)
    }
    return result
  } else {
    return addr
  }
}
function maskIP(ip) {
  if (!ip) return ''
  if ($.lodash_get(arg, 'MASK') == 1) {
    let result = ''
    if (ip.includes('.')) {
      // IPv4
      let parts = ip.split('.')
      result = [...parts.slice(0, 2), '*', '*'].join('.')
    } else {
      // IPv6
      let parts = ip.split(':')
      result = [...parts.slice(0, 4), '*', '*', '*', '*'].join(':')
    }
    return result
  } else {
    return ip
  }
}
async function httpAPI(path = '/v1/requests/recent', method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    $httpAPI(method, path, body, result => {
      resolve(result)
    })
  })
}

function getflag(e) {
  if ($.lodash_get(arg, 'FLAG') == 1) {
    try {
      const t = e
        .toUpperCase()
        .split('')
        .map(e => 127397 + e.charCodeAt())
      // return String.fromCodePoint(...t).replace(/🇹🇼/g, '🇨🇳');
      return String.fromCodePoint(...t).replace(/🇹🇼/g, '🇼🇸')
    } catch (e) {
      return ''
    }
  } else {
    return ''
  }
}
// 参数 与其他脚本逻辑一致
function parseQueryString(url) {
  const queryString = url.split('?')[1] // 获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g // 匹配键值对的正则表达式
  const params = {}
  let match

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]) // 解码键
    const value = decodeURIComponent(match[2]) // 解码值
    params[key] = value // 将键值对添加到对象中
  }

  return params
}
// 通知
async function notify(title, subt, desc, opts) {
  if ($.lodash_get(arg, 'TYPE') === 'EVENT' || $.lodash_get(arg, 'notify') == 1) {
    $.msg(title, subt, desc, opts)
  } else {
    $.log('🔕', title, subt, desc, opts)
  }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}

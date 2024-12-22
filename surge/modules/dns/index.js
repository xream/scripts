const dnsPacket = require('dns-packet')
const { Buffer } = require('buffer')

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
} else {
  arg = {}
}
function log(...args) {
  if(`${arg?.log}` === '1') {
    console.log(...args)
  }
}
log(`传入的 $argument: ${JSON.stringify(arg, null, 2)}`)

let result = { addresses: [], ttl: parseInt(arg?.ttl || 60) }
!(async () => {
  let type = arg?.type || 'A,AAAA'
  type = type.split(/\s*,\s*/).filter(i => ['A', 'AAAA'].includes(i))
  let doh = arg?.doh || 'https://8.8.4.4/dns-query'
  doh = doh.split(/\s*,\s*/).filter(i => /https?:\/\//.test(i))
  const domain = $domain
  const timeout = parseInt(arg?.timeout || 2)
  let edns
  if(arg?.edns === 'auto') {
    try {
      edns = JSON.parse(await $persistentStore.read('lastNetworkInfoEvent'))?.CN_IP
      log(`从持久化缓存解析 CN_IP: ${edns}`)
    } catch (e) {
      log(`从持久化缓存解析 CN_IP 失败: ${e}`)
    }
  } else {
    edns = arg?.edns
  }
  edns = edns || '114.114.114.114'
  log(`使用 edns: ${edns}`)
  
  log(`[${domain}] 使用 ${doh.join(', ')} 查询 ${type} 结果`)
  const promises = doh.map(async url => {
    const res = await Promise.all(type.map(i => query({
      url,
      domain,
      type: i,
      timeout,
      edns,
    })))

    const addresses = []
    let ttl = parseInt(arg?.ttl || 60)
    
    res.forEach(i => {
      i.answers.forEach(ans => {
        if (type.includes(ans.type)) {
          addresses.push(ans.data)
          if (ans.ttl > 0) {
            ttl = ans.ttl
          }
        }
      })
    })
    
    if (addresses.length === 0) {
      throw new Error(`[${domain}] ${url} 查询结果为空`)
    }
    
    return {
      url,
      addresses,
      ttl,
    }
  
  })
  const { url, addresses, ttl } = await Promise.any(promises)
  log(`[${domain}] 最快响应来自: ${url}`)
  result = {addresses, ttl}
})()
  .catch(async e => {
    log(e)
    if(`${arg?.fallback}` === '1') {
      result = {}
    }
  })
  .finally(async () => {
    $done(result)
  })

function isIPv4(ip) {
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(ip)
}

function isIPv6(ip) {
  return /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(ip)
}
function isIP(ip) {
  return isIPv4(ip) || isIPv6(ip)
}
async function query({ url, domain, type = 'A', timeout, edns }) {
  const buf = dnsPacket.encode({
      type: 'query',
      id: 0,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
          {
              type,
              name: domain,
          },
      ],
      additionals: [
          {
              type: 'OPT',
              name: '.',
              udpPayloadSize: 4096,
              flags: 0,
              options: [
                  {
                      code: 'CLIENT_SUBNET',
                      ip: edns,
                      sourcePrefixLength: isIPv4(edns) ? 24 : 56,
                      scopePrefixLength: 0,
                  },
              ],
          },
      ],
  });
  const res = await http({
      url: `${url}?dns=${buf
          .toString('base64')
          .toString('utf-8')
          .replace(/=/g, '')}`,
      headers: {
          Accept: 'application/dns-message',
          // 'Content-Type': 'application/dns-message',
      },
      // body: buf,
      'binary-mode': true,
      encoding: null, // 使用 null 编码以确保响应是原始二进制数据
      timeout,
      policy: `${arg?.policy}` === '0' ? undefined : arg?.policy,
  });

  return dnsPacket.decode(Buffer.from(res.body));
}
// 请求
async function http(opt) {
  return new Promise((resolve, reject) => {
    $httpClient.get(opt, (error, response, data) => {
      if (response) {
        response.body = data
        resolve(response, {
          error: error,
        })
      } else {
        resolve(null, {
          error: error,
        })
      }
    })
  })
}


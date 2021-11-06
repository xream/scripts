const isV2P = typeof $evui !== 'undefined'
let customName
if (isV2P && typeof __name !== 'undefined') {
  let matchedName = String(__name).match(/^__(.*)__10010_query/)
  if (matchedName) {
    customName = matchedName[1]
    console.log(`V2P 尝试从脚本名称中读取 store key: ${customName}`)
  }
}

const $$ = {
  debug: true, // 调试模式
  title: '联通余量',
  name: customName ? String(customName) : '10010_query',
  get_cookie_url_regex: /mobileService\/onLine\.htm/,
  set_cookie_url_regex: /(queryOcsPackageFlowLeftContent|accountBalancenew)/,
  query_url: 'https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContent',
  open_url: 'chinaunicom://',
  // open_url:
  //   'chinaunicom://?open=%7B%22openType%22:%22url%22,%22title%22:%22%E4%BD%99%E9%87%8F%E6%9F%A5%E8%AF%A2%22,%22openUrl%22:%22https://m.client.10010.com/mobileService/openPlatform/openPlatLine.htm?to_url=https://img.client.10010.com/yuliangchaxun2/index.html?linkType=unicomNewShare&mobileA=https://m1.img.10010.com/resources/7188192A31B5AE06E41B64DA6D65A9B0/20201222/jpg/20201222114110.jpg&businessName=%E4%BD%99%E9%87%8F%E6%9F%A5%E8%AF%A2&businessCode=https://m1.img.10010.com/resources/7188192A31B5AE06E41B64DA6D65A9B0/20201222/jpg/20201222114110.jpg&shareType=1&mobileB=F8A34DFF6F9346E68343756DB268C5A5&duanlianjieabc=0tygAa4n%22%7D',
  notify: (subTitle, content) => {
    const name = $.read('name')
    $.notify(
      name ? String(name) : $$.title,
      isV2P ? '' : subTitle,
      isV2P ? `${subTitle}\n${content}` : content,
      String($.read('no_url')) === 'true' ? undefined : { 'open-url': $$.open_url }
    )
  },
}
const getQueryStringParams = query =>
  query
    ? (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params, param) => {
        let [key, value] = param.split('=')
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : ''
        return params
      }, {})
    : {}
// prettier-ignore
const _ = {get(a,b,c=void 0){const d=b.replace(/\[(\d+)\]/g,".$1").split(".");let e=a;for(const f of d)if(e=Object(e)[f],void 0===e)return c;return e},
  set(a,b,c){return Object(a)===a?(Array.isArray(b)||(b=b.toString().match(/[^.[\]]+/g)||[]),b.slice(0,-1).reduce((d,a,c)=>Object(d[a])===d[a]?d[a]:d[a]=Math.abs(b[c+1])>>0==+b[c+1]?[]:{},a)[b[b.length-1]]=c,a):a}}
// prettier-ignore
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
var userAgentTpl = {
  p: 'Mozilla/5.0 (iPad; CPU OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@8.0600}{systemVersion:dis}{yw_code:}',
}
const $ = API($$.name, $$.debug)

const now = new Date().getTime()

const v2p = $.read('v2p')

const v2pSync = async () => {
  try {
    const value = { ...$.cache }
    delete value.v2p
    delete value.last
    delete value.wifi
    delete value.maintenance
    delete value.client_query_disabled
    let key = _.get(v2p, 'store.key')
    key = key ? String(key) : $$.name
    const v2pSyncRes = await $.http.post({
      url: `${_.get(v2p, 'baseURL')}/webhook`,
      body: JSON.stringify({
        token: _.get(v2p, 'webhook.token'),
        type: 'store',
        op: 'put',
        key,
        value,
        options: {
          type: 'object',
          // belong: '10010_query.js',
          note: '联通余量 https://github.com/xream/scripts/tree/main/surge/modules/10010',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Base64.encode(`${_.get(v2p, 'webhook.username')}:${_.get(v2p, 'webhook.password')}`),
      },
    })
    $.log(`ℹ️ V2P 同步响应: ${$.stringify(v2pSyncRes.body)}`)
    if (JSON.parse(v2pSyncRes.body).rescode !== 0) {
      throw new Error('响应异常')
    }
    $$.notify(`✅ V2P 已同步: ${key}`, `${Object.keys(value).join(', ')}`)
  } catch (e) {
    e.message = `V2P 同步失败 ${e.message}`
    throw e
  }
}

let result
!(async () => {
  if (isV2P && String($.read('v2p_disabled')) === 'true') {
    $.log('🈲 V2P 端禁止执行')
    return
  }
  if ($.env.isRequest) {
    const { headers, method, url, body } = $request
    let { Cookie = '' } = headers
    if (Cookie) {
      Cookie = String(Cookie)
    }

    $.log(`🌐 请求 [${method}] 🔗 ${url}`)
    if (method === 'POST' && Cookie && $$.get_cookie_url_regex.test(url)) {
      if (String($.read('cookie_disabled')) !== 'true') {
        let appId
        try {
          const bodyObj = getQueryStringParams(body)
          $.log(`请求的 body: ${$.stringify(bodyObj)}`)
          appId = bodyObj.appId
          $.log(`请求的 appId: ${appId}`)
        } catch (e) {
          const msg = e.message || e
          $.error(`❌ appId ${msg}`)
        }
        if (!appId) {
          throw new Error('未获取到 appId')
        }
        let mobile
        try {
          mobile = Cookie.match(/c_mobile=(\d{11})/)[1]
          $.log(`Cookie中的 手机号: ${mobile}`)
        } catch (e) {
          const msg = e.message || e
          $.error(`❌ 手机号 ${msg}`)
        }
        if (!mobile) {
          throw new Error('未获取到 手机号')
        }
        $.write(Cookie, 'cookie')
        $.write(appId, 'appId')
        $.write(mobile, 'mobile')

        if (String($.read('cookie_notification_disabled')) !== 'true') {
          $$.notify('Cookie, 手机号, appId 已保存', Cookie)
        }
      }
      if (String(_.get(v2p, 'sync')) === 'true') {
        await v2pSync()
      }
    } else if (method === 'GET' && $$.set_cookie_url_regex.test(url)) {
      let savedCookie = $.read('cookie')
      $.log(`🍪 给请求加 Cookie: ${savedCookie}`)
      if (!savedCookie) {
        if (String($.read('autoSign')) === 'true') {
          savedCookie = await autoSign()
        } else {
          throw new Error('无 Cookie. 请打开中国联通重新获取')
        }
      }
      if (savedCookie) {
        headers.Cookie = savedCookie
        result = { headers }
      }
    }
  } else {
    let savedCookie = $.read('cookie')
    if (!savedCookie) {
      if (String($.read('autoSign')) === 'true') {
        savedCookie = await autoSign()
      } else {
        throw new Error('无 Cookie. 请打开中国联通重新获取')
      }
    }

    if (String(_.get(v2p, 'sync_once')) === 'true') {
      await v2pSync()
      _.set(v2p, 'sync_once', 'false')
      $.write(v2p, 'v2p')
      $$.notify('下次直接执行时 将不会同步 V2P')
    }
    if (!isV2P && String($.read('client_query_disabled')) === 'true') {
      $.log('🈲 客户端禁止进行查询')
      return
    }
    let isWifi
    try {
      if ($.env.isLoon) {
        const conf = JSON.parse($config.getConfig())
        isWifi = conf.ssid
      } else if ($.env.isSurge) {
        isWifi = $network.wifi.ssid
      }
    } catch (e) {}
    if (isWifi && String($.read('wifi')) !== 'true') {
      $.log('Wifi 环境, 不进行查询')
      return
    }
    let queryBody
    let isUndergoingMaintenance
    try {
      let queryRes
      try {
        queryRes = await $.http.get({
          url: $$.query_url,
          headers: {
            Cookie: savedCookie,
            'Accept-Encoding': 'gzip, deflate, br',
            Accept: 'application/json',
          },
        })
      } catch (e) {
        e.message = `余量查询网络错误 ${e.message}`
        isUndergoingMaintenance = true
        throw e
      }
      queryBody = _.get(queryRes, 'body')
      $.log(`ℹ️ 余量查询响应: ${$.stringify(queryRes.body)}`)
      try {
        queryBody = JSON.parse(queryBody)
      } catch (e) {}
      const queryCode = String(_.get(queryBody, 'code'))
      if (queryCode !== '0000') {
        let desc = _.get(queryBody, 'desc')
        if (queryCode === '9998') {
          isUndergoingMaintenance = true
        } else {
          let checkResBody
          try {
            const checkRes = await $.http.post({
              url: 'https://m.client.10010.com/servicequerybusiness/query/myInformation',
              headers: {
                Cookie: savedCookie,
              },
            })
            checkResBody = JSON.parse(checkRes.body)
          } catch (e) {}
          $.log(`ℹ️  检测 Cookie 接口响应: ${$.stringify(checkResBody)}`)
          $.log(checkResBody)
          if (_.get(checkResBody, 'code') === '0000') {
            $.log(`ℹ️ 检测 Cookie 接口响应正常`)
            isUndergoingMaintenance = true
          } else {
            if (!desc) {
              desc = _.get(checkResBody, 'desc')
            }
            $.delete('cookie')
            $.log(`ℹ️ 检测 Cookie 接口响应异常 删除cookie 等待下次自动登录`)
          }
          throw new Error(desc || '响应异常')
        }
      }
    } catch (e) {
      e.message = `余量查询失败 ${e.message}`
      if (isUndergoingMaintenance) {
        const maintenance = $.read('maintenance')
        if (maintenance) {
          let maintenanceDurationTxt
          const maintenanceDuration = (now - parseFloat(_.get(maintenance, 'time'))) / 1000 / 60
          if (!isNaN(maintenanceDuration) && maintenanceDuration > 0) {
            if (maintenanceDuration > 60) {
              maintenanceDurationTxt = `${(maintenanceDuration / 60).toFixed(2)}小时`
            } else {
              maintenanceDurationTxt = `${maintenanceDuration.toFixed(2)}分钟`
            }
          }
          $.log(`🚧 系统维护 不继续执行 时长 ${$.stringify(maintenanceDurationTxt)}`)
          return
        }
        const currentMaintenance = { time: now }
        $.log(`ℹ️ 保存系统维护开始时间: ${$.stringify(currentMaintenance)}`)
        $.write(currentMaintenance, 'maintenance')
        if (String($.read('maintenance_disabled')) !== 'true') {
          $$.notify('🚧 系统维护', '维护结束将不继续通知')
        }
        return
      } else {
        throw e
      }
    }
    const maintenance = $.read('maintenance')
    if (maintenance) {
      let maintenanceDurationTxt
      const maintenanceDuration = (now - parseFloat(_.get(maintenance, 'time'))) / 1000 / 60
      if (!isNaN(maintenanceDuration) && maintenanceDuration > 0) {
        if (maintenanceDuration > 60) {
          maintenanceDurationTxt = `${(maintenanceDuration / 60).toFixed(2)}小时`
        } else {
          maintenanceDurationTxt = `${maintenanceDuration.toFixed(2)}分钟`
        }
      }
      $.log(`🚧 系统维护结束 时长 ${$.stringify(maintenanceDurationTxt)}`)
      if (String($.read('maintenance_disabled')) !== 'true') {
        $$.notify('🚧 系统维护结束', `时长 ${maintenanceDurationTxt}`)
      }
      $.delete('maintenance')
    }
    // 套餐名
    const packageName = queryBody.packageName || '⚠️ 无套餐名'
    $.log(`📦 套餐名: ${packageName}`)
    $$.title = packageName
    // 总流量
    let sumFlowTxt
    let sumFlow = parseFloat(_.get(queryBody, 'summary.sum'))
    if (!isNaN(sumFlow) && sumFlow >= 0) {
      if (sumFlow >= 1000) {
        sumFlowTxt = `${(sumFlow / 1024).toFixed(2)}G`
      } else {
        sumFlowTxt = `${sumFlow.toFixed(2)}M`
      }
    }
    $.log(`ℹ️ 总流量: ${sumFlowTxt}, ${sumFlow}`)
    // 免流
    let freeFlowTxt
    let freeFlow = parseFloat(_.get(queryBody, 'summary.freeFlow'))
    if (!isNaN(freeFlow) && freeFlow >= 0) {
      if (freeFlow >= 1000) {
        freeFlowTxt = `${(freeFlow / 1024).toFixed(2)}G`
      } else {
        freeFlowTxt = `${freeFlow.toFixed(2)}M`
      }
    }
    $.log(`🆓 免流: ${freeFlowTxt}, ${freeFlow}`)
    // 非免流流量
    let paidFlowTxt
    let paidFlow
    if (sumFlowTxt && freeFlowTxt) {
      paidFlow = parseFloat(sumFlow - freeFlow)
      if (!isNaN(paidFlow) && paidFlow >= 0) {
        if (paidFlow >= 1000) {
          paidFlowTxt = `${(paidFlow / 1024).toFixed(2)}G`
        } else {
          paidFlowTxt = `${paidFlow.toFixed(2)}M`
        }
      }
    }
    $.log(`🆓 非免流流量: ${paidFlowTxt}, ${paidFlow}`)
    // 流量包
    const otherPkgRegExpStr = $.read('other_pkg')
    $.log(`需要单独显示的流量包名正则 ${otherPkgRegExpStr}`)
    let otherPkgs = []
    let remainingFlow = 0
    let remainingFlowTxt

    const resources = queryBody.resources
    if (Array.isArray(resources)) {
      resources.map(resource => {
        if (_.get(resource, 'type') === 'flow') {
          const details = _.get(resource, 'details')
          if (Array.isArray(details)) {
            details.map(detail => {
              let addUpItemName = _.get(detail, 'addUpItemName') || ''
              let feePolicyName = _.get(detail, 'feePolicyName') || ''
              const pkgFullName = addUpItemName ? `${feePolicyName}（${addUpItemName}）` : `${feePolicyName}`
              $.log(`📦 包名: ${pkgFullName}`)
              let remain = parseFloat(_.get(detail, 'remain'))
              let use = parseFloat(_.get(detail, 'use'))
              const usedPercent = parseFloat(_.get(detail, 'usedPercent'))
              $.log(`ℹ️ 剩余: ${remain}, 已用: ${use}, 已用率: ${usedPercent}`)
              if (/日租/.test(pkgFullName) && use <= 1) {
                use = 0
                $.log(`ℹ️ 修正日租已用流量为 ${use}`)
              }
              let otherPkgName

              if (otherPkgRegExpStr) {
                const otherPkgMatchedArray = pkgFullName.match(new RegExp(otherPkgRegExpStr))
                if (otherPkgMatchedArray) {
                  otherPkgName = otherPkgMatchedArray[1]
                }
              }

              if (otherPkgName) {
                $.log(`ℹ️ 需要单独显示的流量包名: ${otherPkgName}`)
                if (!isNaN(remain) && remain === 0) {
                  // 有剩余且剩余为0 不显示
                } else if (!isNaN(remain) && remain > 0) {
                  otherPkgs.push({ name: otherPkgName, remain })
                } else if (!isNaN(use) && use > 0) {
                  otherPkgs.push({ name: otherPkgName, use })
                }
              }
              if (!isNaN(remain) && remain > 0) {
                remainingFlow += remain
              }
            })
          }
        }
      })
    }
    if (remainingFlow >= 1000) {
      remainingFlowTxt = `${(remainingFlow / 1024).toFixed(2)}G`
    } else {
      remainingFlowTxt = `${remainingFlow.toFixed(2)}M`
    }

    let last = $.read('last')
    $.log(`ℹ️ 上次查询结果: ${$.stringify(last)}`)

    let durationTxt
    let freeFlowUsedTxt
    let freeFlowUsed
    let sumFlowUsedTxt
    let sumFlowUsed
    let remainingFlowUsedTxt
    let remainingFlowUsed
    if (last) {
      const duration = (now - parseFloat(_.get(last, 'time'))) / 1000 / 60
      if (!isNaN(duration) && duration > 0) {
        if (duration > 60) {
          durationTxt = `${(duration / 60).toFixed(2)}小时`
        } else {
          durationTxt = `${duration.toFixed(2)}分钟`
        }
      }
      $.log(`⌛ 时长: ${durationTxt}, ${duration}`)

      let ignore_flow = parseFloat($.read('ignore_flow'))
      let same = String($.read('same')) === 'true'
      if (isNaN(ignore_flow) || ignore_flow < 0) {
        ignore_flow = 0
      }
      $.log(`ℹ️ 流量变化忽略阈值: ${ignore_flow}M`)
      $.log(`ℹ️ 当前时间段内无用量变化时, 也进行通知: ${same ? '是' : '否'}`)

      if (freeFlowTxt) {
        freeFlowUsed = freeFlow - parseFloat(_.get(last, 'freeFlow'))
        if (!isNaN(freeFlowUsed) && freeFlowUsed >= 0) {
          if (same || freeFlowUsed > ignore_flow) {
            if (freeFlowUsed >= 1000) {
              freeFlowUsedTxt = `${(freeFlowUsed / 1024).toFixed(2)}G`
            } else {
              freeFlowUsedTxt = `${freeFlowUsed.toFixed(2)}M`
            }
          }
        }
        $.log(`ℹ️ 时段内免流: ${freeFlowUsedTxt}, ${freeFlowUsed}`)
      }

      if (sumFlowTxt) {
        sumFlowUsed = sumFlow - parseFloat(_.get(last, 'sumFlow'))
        if (!isNaN(sumFlowUsed) && sumFlowUsed >= 0) {
          if (same || sumFlowUsed > ignore_flow) {
            if (sumFlowUsed >= 1000) {
              sumFlowUsedTxt = `${(sumFlowUsed / 1024).toFixed(2)}G`
            } else {
              sumFlowUsedTxt = `${sumFlowUsed.toFixed(2)}M`
            }
          }
        }
        $.log(`ℹ️ 时段内总流量: ${freeFlowUsedTxt}, ${freeFlowUsed}`)
      }
      if (!isNaN(freeFlowUsed) && freeFlowUsed >= 0 && !isNaN(sumFlowUsed) && sumFlowUsed >= 0) {
        remainingFlowUsed = parseFloat(sumFlowUsed - freeFlowUsed)
        if (!isNaN(remainingFlowUsed) && remainingFlowUsed >= 0) {
          if (same || remainingFlowUsed > ignore_flow) {
            if (remainingFlowUsed >= 1000) {
              remainingFlowUsedTxt = `${(remainingFlowUsed / 1024).toFixed(2)}G`
            } else {
              remainingFlowUsedTxt = `${remainingFlowUsed.toFixed(2)}M`
            }
          }
        }
      }
    }
    const current = { time: now, freeFlow, sumFlow }
    $.log(`ℹ️ 保存本次查询结果: ${$.stringify(current)}`)
    $.write(current, 'last')

    let subTitle = ''
    let content = ''
    if (durationTxt) {
      const durationMsgs = []
      if (remainingFlowUsedTxt) {
        durationMsgs.push(`非免流 ${remainingFlowUsedTxt}`)
      }
      if (freeFlowUsedTxt) {
        durationMsgs.push(`免流 ${freeFlowUsedTxt}`)
      }
      if (!(!isNaN(remainingFlowUsed) && remainingFlowUsed >= 0) && sumFlowUsedTxt) {
        durationMsgs.push(`总 ${sumFlowUsedTxt}`)
      }

      if (durationMsgs.length > 0) {
        durationMsgs.unshift(`时长 ${durationTxt}`)
        subTitle = durationMsgs.join(' ')
      }
    }

    const totalMsgs = []
    if (remainingFlowTxt) {
      totalMsgs.push(`剩余 ${remainingFlowTxt}`)
    }
    if (otherPkgs.length > 0) {
      otherPkgs.map(({ name, use, remain }) => {
        if (remain) {
          let remainTxt
          if (remain >= 1000) {
            remainTxt = `${(remain / 1024).toFixed(2)}G`
          } else {
            remainTxt = `${remain.toFixed(2)}M`
          }
          totalMsgs.push(`${name} ${remainTxt}`)
        } else if (use) {
          let useTxt
          if (use >= 1000) {
            useTxt = `${(use / 1024).toFixed(2)}G`
          } else {
            useTxt = `${use.toFixed(2)}M`
          }
          totalMsgs.push(`${name}已用 ${useTxt}`)
        }
      })
    }
    if (freeFlowTxt) {
      totalMsgs.push(`免流 ${freeFlowTxt}`)
    }
    if (!remainingFlowTxt && paidFlowTxt) {
      totalMsgs.push(`非免流 ${paidFlowTxt}`)
    }
    if (!remainingFlowTxt && !paidFlowTxt && sumFlowTxt) {
      totalMsgs.push(`总 ${sumFlowTxt}`)
    }
    if (totalMsgs.length > 0) {
      content = totalMsgs.join(' ')
    }
    $.log(`🚀 ${subTitle}\n${content}`)
    if (subTitle) {
      $.log('发送通知')
      $$.notify(subTitle, content)
    } else {
      $.log('不发送通知')
    }
  }
})()
  .catch(e => {
    const msg = e.message || e
    $.error(`❌ ${msg}`)
    $$.notify('', `❌ ${msg}`)
  })
  .finally(async () => {
    if (isV2P) {
      await $.wait(1000)
    }
    $.done(result)
  })

async function autoSign() {
  let signCookies
  $.log(`🔘 使用自动登录`)
  let mobile = $.read('mobile')
  let password = $.read('password')
  const appId = $.read('appId')
  const rsapublicKeyEncodeAPI = $.read('rsapublicKeyEncodeAPI')
  if (!mobile || !password || !appId || !rsapublicKeyEncodeAPI) {
    throw new Error('请先设置手机号、密码、appId、加密接口')
  }
  mobile = String(mobile)
  password = String(password)
  let device = $.read('device')
  if (!device) {
    device = [
      {
        deviceOS: '14.0.1',
        deviceBrand: 'iphone',
        deviceModel: 'iPad',
        buildSn: 'LMY48Z',
        deviceId: generateMixed(15) + '',
      },
      {
        deviceOS: '14.0.1',
        deviceBrand: 'iphone',
        deviceModel: 'iPad',
        buildSn: 'V417IR',
        deviceId: generateMixed(15) + '',
      },
    ][Math.floor(Math.random() * 2)]
    $.write(device, 'device')
  }
  let encoded = $.read('encoded')
  if (
    _.get(encoded, 'original.mobile') === mobile &&
    _.get(encoded, 'original.password') === password &&
    _.get(encoded, 'mobile') &&
    _.get(encoded, 'password')
  ) {
    $.log(`ℹ️ 读取加密信息: ${$.stringify(encoded)}`)
    mobile = encoded.mobile
    password = encoded.password
  } else {
    // 开源 'https://runkit.com/xream/rsapublickeyencode'
    try {
      const encodedRes = await $.http.post({
        url: rsapublicKeyEncodeAPI,
        body: JSON.stringify({
          mobile,
          password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      $.log(`ℹ️ 加密响应: ${$.stringify(encodedRes.body)}`)
      const encoded = JSON.parse(encodedRes.body)
      if (!encoded.mobile || !encoded.password) {
        throw new Error('响应异常')
      }
      $.write({ ...encoded, original: { mobile, password } }, 'encoded')
      $.log(`ℹ️ 保存加密信息: ${$.stringify(encoded)}`)
      mobile = encoded.mobile
      password = encoded.password
    } catch (e) {
      e.message = `加密失败 ${e.message}`
      throw e
    }
  }

  var appInfo = {
    version: 8.0602,
    unicom_version: 'iphone_c@8.0602',
    app_name: '中国联通',
    package_name: 'com.sinovatech.unicom.ui',
  }

  const buildUnicomUserAgent = (options, tplname) => {
    let rdm = {
      ...device,
      ...appInfo,
      desmobile: options.user,
    }
    var fmt = (str, params) => {
      for (let key in params) {
        str = str.replace(new RegExp('\\{' + key + '\\}', 'g'), params[key])
      }
      return str
    }
    return fmt(userAgentTpl[tplname], Object.assign(rdm, options))
  }
  const transParams = data => {
    return Object.keys(data)
      .map(k => `${k}=${encodeURIComponent(data[k])}`)
      .join('&')
    // let params = new URLSearchParams()
    // for (let item in data) {
    //   params.append(item, data['' + item + ''])
    // }
    // return params
  }
  try {
    const signRes = await $.http.post({
      headers: {
        'user-agent': buildUnicomUserAgent({}, 'p'),
        referer: 'https://m.client.10010.com',
        origin: 'https://m.client.10010.com',
      },
      url: `https://m.client.10010.com/mobileService/login.htm`,
      body: transParams({
        // ChinaunicomMobileBusiness
        appId,
        deviceBrand: device.deviceBrand,
        deviceCode: device.deviceId, // IMEI
        deviceId: device.deviceId,
        deviceModel: device.deviceModel,
        deviceOS: device.android_version,
        isRemberPwd: 'true',
        keyVersion: '',
        mobile,
        netWay: 'Wifi',
        password,
        pip: '172.16.70.15',
        provinceChanel: 'general',
        simCount: '0',
        timestamp: new Date()
          .toISOString()
          .replace(/[^0-9]/g, '')
          .slice(0, -3),
        version: appInfo.unicom_version,
        yw_code: '',
      }),
    })
    $.log(`ℹ️ 登录响应: ${$.stringify(signRes)}`)
    const signBody = JSON.parse(signRes.body)
    if (_.get(signBody, 'code') !== '0') {
      throw new Error(_.get(signBody, 'dsc') || '响应异常')
    }
    signCookies = signRes.headers['set-cookie'] || signRes.headers['Set-Cookie']
    if (Array.isArray(signCookies)) {
      signCookies = signCookies.join('; ')
    }
    if (!signCookies) {
      throw new Error(`登录 Cookie 为空`)
    }

    $.log(`🍪 登录 Cookie: ${signCookies}`)
    $.write(signCookies, 'cookie')
    return signCookies
  } catch (e) {
    e.message = `登录失败 ${e.message}`
    throw e
  }
}

// 530000000126002
function generateMixed(n) {
  var chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  let res = ''
  for (var i = 0; i < n; i++) {
    var id = Math.floor(Math.random() * 9)
    res += chars[id]
  }
  return res
}
// prettier-ignore
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,n="function"==typeof require&&"undefined"!=typeof $jsbox,i="function"==typeof require&&!n,o="undefined"!=typeof $request,r="undefined"!=typeof importModule;return{isQX:e,isLoon:t,isSurge:s,isNode:i,isJSBox:n,isRequest:o,isScriptable:r}}
// prettier-ignore
function HTTP(e={baseURL:""}){function t(t,u){u="string"==typeof u?{url:u}:u;const c=e.baseURL;c&&!a.test(u.url||"")&&(u.url=c?c+u.url:u.url),u.body&&u.headers&&!u.headers["Content-Type"]&&(u.headers["Content-Type"]="application/x-www-form-urlencoded"),u={...e,...u};const h=u.timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...u.events};let f,d;if(l.onRequest(t,u),s)f=$task.fetch({method:t,...u});else if(n||i||r)f=new Promise((e,s)=>{const n=r?require("request"):$httpClient;n[t.toLowerCase()](u,(t,n,i)=>{t?s(t):e({statusCode:n.status||n.statusCode,headers:n.headers,body:i})})});else if(o){const e=new Request(u.url);e.method=t,e.headers=u.headers,e.body=u.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=h?new Promise((e,s)=>{d=setTimeout(()=>(l.onTimeout(),s(`${t} URL: ${u.url} exceeds the timeout ${h} ms`)),h)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>l.onResponse(e))}const{isQX:s,isLoon:n,isSurge:i,isScriptable:o,isNode:r}=ENV(),u=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"],a=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,c={};return u.forEach(e=>c[e.toLowerCase()]=(s=>t(e,s))),c}
// prettier-ignore
function API(e="untitled",t=!1){const{isQX:s,isLoon:n,isSurge:i,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){const e=require("fs");return{fs:e}}return null})(),this.initCache();const s=(e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)});Promise.prototype.delay=function(e){return this.then(function(t){return s(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(n||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(n||i)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),i||n)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i||n?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),i||n)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",c={}){const h=c["open-url"],l=c["media-url"];if(s&&$notify(e,t,a,c),i&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:h}),n){let s={};h&&(s.openUrl=h),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(o||u){const s=a+(h?`\n点击跳转: ${h}`:"")+(l?`\n多媒体: ${l}`:"");if(r){const n=require("push");n.schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||n||i?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}

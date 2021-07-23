const $ = new Env('联通余量查询')
$.cookie_key = '10010_query_cookie'
$.wifi_key = '10010_wifi'
$.same_key = '10010_same'
$.last_check_key = '10010_last_check'
$.maintain_key = '10010_maintain'
$.ignore_flow_key = '10010_ignore_flow'
$.url = 'https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContent'
$.open_url = 'chinaunicom://?open=%7B%22openType%22:%22url%22,%22title%22:%22%E4%BD%99%E9%87%8F%E6%9F%A5%E8%AF%A2%22,%22openUrl%22:%22https://m.client.10010.com/mobileService/openPlatform/openPlatLine.htm?to_url=https://img.client.10010.com/yuliangchaxun2/index.html?linkType=unicomNewShare&mobileA=https://m1.img.10010.com/resources/7188192A31B5AE06E41B64DA6D65A9B0/20201222/jpg/20201222114110.jpg&businessName=%E4%BD%99%E9%87%8F%E6%9F%A5%E8%AF%A2&businessCode=https://m1.img.10010.com/resources/7188192A31B5AE06E41B64DA6D65A9B0/20201222/jpg/20201222114110.jpg&shareType=1&mobileB=F8A34DFF6F9346E68343756DB268C5A5&duanlianjieabc=0tygAa4n%22%7D'

function getData(Cookie) {
    return new Promise((resolve, reject) => {
        $.get({
          url: $.url,
          headers: {
            Cookie,
            'Accept-Encoding': 'gzip, deflate, br',
          },
        }, (e, res, data) => {
          if (e) {
            reject(e)
          } else {
            resolve(data)
          }
        })
    })
}

!(async () => {
  const savedCookie = $.getdata($.cookie_key);
  if (!savedCookie) {
    $.msg($.name, '无 Cookie', '点击通知登录中国联通 打开余量查询', $.open_url);
    return
  }
  let isWifi
  try{
    if ($.isLoon()) {
      const conf = JSON.parse($config.getConfig());
      isWifi = conf.ssid
    } else if ($.isSurge()) {
      isWifi = $network.wifi.ssid
    }} catch (e) {
    $.logErr('wifi 判断出现错误', e)
  }
  // isWifi = false
  if (isWifi && String($.getdata($.wifi_key)) !== 'true') {
    $.log('wifi环境 不查询')
    return
  }
 
  let data = await getData(savedCookie)
  $.log('⬇️ data', data)
  try {
    data = JSON.parse(data)
  } catch (e) {
    throw new Error('数据解析失败')
  }
  let savedMaintain
  if (data.code !== "0000") {
    if (data.code === "9998") {
      // $.setdata('', $.maintain_key);
      savedMaintain = $.getdata($.maintain_key)
      if (!savedMaintain) {
        $.setdata(String(new Date().getTime()), $.maintain_key);
        // throw new Error('🚧 联通维护开始 维护结束前将不会继续通知')
        $.msg($.pkg, '🚧 联通维护开始', '维护结束前将不会继续通知')
        return
      } else {
        $.log('🚧 联通维护中 维护结束前将不会继续通知', `持续 ${((new Date().getTime() - savedMaintain) / 1000 / 60).toFixed(2)}分钟`)
        return
      }
    } else {
      throw new Error(data.desc || '数据响应错误')
    }
  }
  
  const msgs = []
  const subTitles = []
  let remains = 0
  let free
  const pkg = data.packageName
  if (!pkg) {
    $.pkg = '⚠️ 无套餐名'
  } else {
    $.pkg = pkg
  }
  if (savedMaintain) {
    $.pkg += `(联通维护结束 时长 ${((new Date().getTime() - savedMaintain) / 1000 / 60).toFixed(2)}分钟)`
  }
  $.setdata('', $.maintain_key);

  const resources = data.resources
  if (!Array.isArray(resources)) {
    throw new Error('无流量包明细')
  }
  resources.map(resource => {
    const { details, type } = resource
    if (type === 'flow') {
      details.map(detail => {
        let { addUpItemName, feePolicyName, remain, use, usedPercent } = detail
        remain = parseFloat(remain)
        use = parseFloat(use)
        let useTxt
        if (!isNaN(use)) {
          if (use > 1024) {
            useTxt = `${(use/1024).toFixed(2)}G`
          } else {
            useTxt = `${use}M`
          }
        }
        usedPercent = parseFloat(usedPercent)
        if (!isNaN(usedPercent)) {
          usedPercent.toFixed(2)
        }
        // 日租
        if (/日租/.test(addUpItemName)) {
          if (usedPercent === 0) {
            // 未用日租
          } else {
            msgs.push(`⚠️ 日租 ${useTxt}`)
          }
        } else if (!isNaN(remain) && remain > 0) {
          remains += remain
        }
      })
    }
  });
  let remainsTxt
  if (remains > 1024) {
    remainsTxt = `${(remains/1024).toFixed(2)}G`
  } else {
    remainsTxt = `${remains.toFixed(2)}M`
  }
  let freeTxt
  if (data.summary) {
    free = parseFloat(data.summary.freeFlow)
    if (!isNaN(free)) {
      if (free > 1024) {
        freeTxt = `${(free/1024).toFixed(2)}G`
      } else {
        freeTxt = `${free}M`
      }
    }
  }
  let line = []
  if (remainsTxt) {
    line.push(`剩余 ${remainsTxt}`)
  }
  if (freeTxt) {
    line.push(`免流 ${freeTxt}`)
  }
  if (line.length > 0) {
    msgs.push(line.join(' '))
  }
  const now = new Date().getTime()
  let last = $.getdata($.last_check_key)
  if (last) {
    last = JSON.parse(last)
    const mins = (now - last.time) / 1000 / 60
    let ignore_flow = $.getdata($.ignore_flow_key) || 0
    $.log(`忽略小于 ${ignore_flow}M 的变化`)
    let remainsUsed = last.remains - remains
    let remainsUsedTxt = ''
    if (remainsUsed>0) {
      if (remainsUsed > 1024) {
        remainsUsedTxt = ` 消耗 ${(remainsUsed/1024).toFixed(2)}G`
      } else if (remainsUsed >= ignore_flow){
        remainsUsedTxt = ` 消耗 ${remainsUsed.toFixed(2)}M`
      }
    }
    let freeUsed = free - last.free
    let freeUsedTxt = ''
    if (freeUsed > 0) {
      if (freeUsed > 1024) {
        freeUsedTxt = ` 免流 ${(freeUsed/1024).toFixed(2)}G`
      } else if (freeUsed >= ignore_flow){
        freeUsedTxt = ` 免流 ${freeUsed.toFixed(2)}M`
      }
    }
    if (remainsUsedTxt || freeUsedTxt) {
      msgs.unshift(`${mins.toFixed(0)}分钟${remainsUsedTxt}${freeUsedTxt}`)
    } else if(!savedMaintain && String($.getdata($.same_key)) !== 'true') {
      $.log($.pkg, subTitles.join('\n'), msgs.join('\n'))
      $.log("无流量变化 不通知")
      return
    }
  }
  $.msg($.pkg, subTitles.join('\n'), msgs.join('\n'), $.open_url)
  $.setjson({
    time: now,
    remains,
    free,
  }, $.last_check_key);
  if ($.isNode()) {
    process.exit(0)
  }
})()
  .catch((e) => {
    $.logErr(e); $.msg($.name, '❌', String(e.message || e), $.open_url)
    if ($.isNode()) {
      process.exit(1)
    }
  })
  .finally(() => {
    if (!$.isNode()) {
      $.done()
    } 
  })

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

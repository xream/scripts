const $ = API('sub-store')

function operator(proxies) {
  try {
    const rawInfo = $.read('subs')
    const readName = $.read('collections')
    const subtag = $request.url.match(/download\/(collection\/)?([\w-_]*)/)[2]
    if ($request.url.match(/\/collection\//)) {
      //collection subscription.
      const isOpen = readName[subtag].process.map(o => o.type).indexOf('Script Operator') != -1
      for (var i = 0; i < readName[subtag].subscriptions.length; i++) {
        $.raw_Name = readName[subtag].subscriptions[i]
        if (!isOpen) break //prevent queries in certain cases.
        AllSubs(rawInfo[$.raw_Name].url, $.raw_Name)
      }
    } else {
      //single subscription.
      $.raw_Name = rawInfo[subtag].name
      AllSubs(rawInfo[subtag].url, $.raw_Name)
    }
  } catch (e) {
    $.error(`\n🔹 订阅昵称:「 ${$.raw_Name || '未知'} 」\n🔺 查询失败:「 ${err.message || err} 」`)
  } finally {
    return proxies
  }
}

async function AllSubs(subsUrl, subsName) {
  try {
    $.log(`〽️ 开始进行信息查询  ${subsName} ${subsUrl}`)
    const resp = await $.http.get({
      url: subsUrl,
      headers: { 'User-Agent': 'Quantumult%20X' },
    })
    var sinfo = JSON.stringify(resp.headers || '')
      .replace(/ /g, '')
      .toLowerCase()
    if (sinfo.indexOf('total=') == -1 || sinfo.indexOf('download=') == -1) throw new Error('该订阅不包含流量信息')
    var total = (parseFloat(sinfo.split('total=')[1].split(',')[0]) / 1024 ** 3).toFixed(0)
    var usd = (
      (parseFloat(sinfo.indexOf('upload') != -1 ? sinfo.split('upload=')[1].split(',')[0] : '0') +
        parseFloat(sinfo.split('download=')[1].split(',')[0])) /
      1024 ** 3
    ).toFixed(2)
    var left = (
      parseFloat(sinfo.split('total=')[1].split(',')[0]) / 1024 ** 3 -
      (parseFloat(sinfo.indexOf('upload') != -1 ? sinfo.split('upload=')[1].split(',')[0] : '0') +
        parseFloat(sinfo.split('download=')[1].split(',')[0])) /
        1024 ** 3
    ).toFixed(2)
    if (sinfo.indexOf('expire=') != -1) {
      let eprTxt = sinfo.split('expire=')[1].split(',')[0]
      eprTxt = String(eprTxt).replace(/\D*/g, '')
      if (eprTxt) {
        // $.notify('eprTxt', `${eprTxt.length}`, `${eprTxt}`);
        var epr = new Date(parseFloat(eprTxt) * 1000)
        var year = epr.getFullYear()
        var mth = epr.getMonth() + 1 < 10 ? '0' + (epr.getMonth() + 1) : epr.getMonth() + 1
        var day = epr.getDate() < 10 ? '0' + epr.getDate() : epr.getDate()
        var epr = `🔹 过期时间:「 ${year}-${mth}-${day} 」`
      } else {
        var epr = `🔹 有效时间:「 永久 」`
      }
    } else {
      var epr = ''
    }
    $.notify(`🔹 订阅昵称:「 ${subsName} 」`, epr, `🔸 已用流量:「 ${usd} GB 」\n🔸 剩余流量:「 ${left} GB 」`)
  } catch (er) {
    $.error(`\n🔹 订阅昵称:「 ${subsName} 」\n🔺 查询失败:「 ${er.message || er} 」`)
  }
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(c=>u[c.toLowerCase()]=(u=>(function(u,c){(c="string"==typeof c?{url:c}:c).url=e?e+c.url:c.url;const h=(c={...t,...c}).timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...c.events};let a,d;if(l.onRequest(u,c),s)a=$task.fetch({method:u,...c});else if(o||i||r)a=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](c,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(n){const e=new Request(c.url);e.method=u,e.headers=c.headers,e.body=c.body,a=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=h?new Promise((e,t)=>{d=setTimeout(()=>(l.onTimeout(),t(`${u} URL: ${c.url} exceeds the timeout ${h} ms`)),h)}):null;return(f?Promise.race([f,a]).then(e=>(clearTimeout(d),e)):a).then(e=>l.onResponse(e))})(c,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",c="",h={}){const l=h["open-url"],a=h["media-url"];if(s&&$notify(e,t,c,h),i&&$notification.post(e,t,c+`${a?"\n多媒体:"+a:""}`,{url:l}),o){let s={};l&&(s.openUrl=l),a&&(s.mediaUrl=a),"{}"==JSON.stringify(s)?$notification.post(e,t,c):$notification.post(e,t,c,s)}if(n||u){const s=c+(l?`\n点击跳转: ${l}`:"")+(a?`\n多媒体: ${a}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/
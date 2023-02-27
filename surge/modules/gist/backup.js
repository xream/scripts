const $ = new Env('gist')

const KEY_INITED = `@xream.gist.inited`
const KEY_USERNAME = `@xream.gist.username`
const KEY_TOKEN = `@xream.gist.token`
const KEY_DESC = `@xream.gist.desc`
const KEY_SAVE_KEY = `@xream.gist.saveKey`

$.setdata(new Date().toLocaleString('zh'), KEY_INITED)

!(async () => {
  const desc = $.getdata(KEY_DESC) || 'Auto Generated BoxJs Global Backup'
  const saveKey = $.getdata(KEY_SAVE_KEY) || 'backup.json'

  const username = $.getdata(KEY_USERNAME)
  const token = $.getdata(KEY_TOKEN)
  if (!token || !username) throw new Error('请填写 Gist 备份的 token 和 用户名')

  let gist
  let gists = []

  try {
    console.log(`开始获取 Gist 请求`)
    const res = await $.http.get({
      url: `https://api.github.com/users/${username}/gists`,
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      },
    })
    // console.log(res)
    const status = $.lodash_get(res, 'status') || $.lodash_get(res, 'statusCode') || 200
    console.log('↓ res status')
    console.log(status)
    let resBody = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
    try {
      resBody = JSON.parse(resBody)
    } catch (e) {}
    console.log('↓ res body')
    // console.log(resBody)
    if (!String(status).startsWith(2)) {
      throw new Error($.lodash_get(resBody, 'message') || '未知错误')
    }
    gists = resBody
  } catch (e) {
    console.log(e)
    throw new Error(`获取 Gist 失败: ${$.lodash_get(e, 'message') || e}`)
  }
  gist = gists.find(i => !!i.files[saveKey])
  console.log(`Gist ${gist ? '已存在' : '不存在'}`)
  try {
    console.log(`开始 ${gist ? '更新' : '创建'} Gist ${gist ? gist.id : ''}`)
    const post = opts =>
      new Promise((resolve, reject) => {
        $.post(opts, (err, resp, body) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })
    const res = await post({
      method: gist ? 'patch' : 'post',
      url: `https://api.github.com/gists${gist ? '/' + gist.id : ''}`,
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      },
      body: JSON.stringify({
        description: desc,
        public: false,
        files: {
          [saveKey]: {
            content: JSON.stringify(getBoxJsData()),
          },
        },
      }),
    })
    // console.log(res)
    const status = $.lodash_get(res, 'status') || $.lodash_get(res, 'statusCode') || 200
    console.log('↓ res status')
    console.log(status)
    let resBody = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
    try {
      resBody = JSON.parse(resBody)
    } catch (e) {}
    console.log('↓ res body')
    console.log(resBody)
    if (!String(status).startsWith(2)) {
      throw new Error($.lodash_get(resBody, 'message') || '未知错误')
    }
    gist = resBody
  } catch (e) {
    console.log(e)
    throw new Error(`${gist ? '更新' : '创建'} Gist 失败: ${$.lodash_get(e, 'message') || e}`)
  }

  $.msg(`Gist 备份`, `✅`, `${gist.url}`)
})()
  .catch(e => {
    console.log(e)
    $.msg(`Gist 备份`, `❌`, `${$.lodash_get(e, 'message') || e}`)
  })
  .finally(() => {
    $.done()
  })

function getBoxJsData() {
  //#region boxjs
  const $ = new Env('BoxJs')

  // 为 eval 准备的上下文环境
  const $eval_env = {}

  $.version = '0.12.1'
  $.versionType = 'beta'

  // 发出的请求需要需要 Surge、QuanX 的 rewrite
  $.isNeedRewrite = true

  /**
   * ===================================
   * 持久化属性: BoxJs 自有的数据结构
   * ===================================
   */

  // 存储`用户偏好`
  $.KEY_usercfgs = 'chavy_boxjs_userCfgs'
  // 存储`应用会话`
  $.KEY_sessions = 'chavy_boxjs_sessions'
  // 存储`页面缓存`
  $.KEY_web_cache = 'chavy_boxjs_web_cache'
  // 存储`应用订阅缓存`
  $.KEY_app_subCaches = 'chavy_boxjs_app_subCaches'
  // 存储`全局备份` (弃用, 改用 `chavy_boxjs_backups`)
  $.KEY_globalBaks = 'chavy_boxjs_globalBaks'
  // 存储`备份索引`
  $.KEY_backups = 'chavy_boxjs_backups'
  // 存储`当前会话` (配合切换会话, 记录当前切换到哪个会话)
  $.KEY_cursessions = 'chavy_boxjs_cur_sessions'

  /**
   * ===================================
   * 持久化属性: BoxJs 公开的数据结构
   * ===================================
   */

  // 存储用户访问`BoxJs`时使用的域名
  $.KEY_boxjs_host = 'boxjs_host'

  // 请求响应体 (返回至页面的结果)
  $.json = $.name // `接口`类请求的响应体
  $.html = $.name // `页面`类请求的响应体

  // 页面源码地址
  $.web = `https://cdn.jsdelivr.net/gh/chavyleung/scripts@${$.version}/box/chavy.boxjs.html?_=${new Date().getTime()}`
  // 版本说明地址 (Release Note)
  $.ver = `https://raw.githubusercontent.com/chavyleung/scripts/master/box/release/box.release.json`

  /**
   * http://boxjs.com/ => `http://boxjs.com`
   * http://boxjs.com/app/jd => `http://boxjs.com`
   */
  function getHost(url) {
    return url.slice(0, url.indexOf('/', 8))
  }

  /**
   * http://boxjs.com/ => ``
   * http://boxjs.com/api/getdata => `/api/getdata`
   */
  function getPath(url) {
    // 如果以`/`结尾, 去掉最后一个`/`
    const end = url.lastIndexOf('/') === url.length - 1 ? -1 : undefined
    // slice第二个参数传 undefined 会直接截到最后
    // indexOf第二个参数用来跳过前面的 "https://"
    return url.slice(url.indexOf('/', 8), end)
  }

  /**
   * ===================================
   * 处理前端请求
   * ===================================
   */

  /**
   * 处理`页面`请求
   */
  async function handlePage() {
    // 获取 BoxJs 数据
    const boxdata = getBoxData()
    boxdata.syscfgs.isDebugMode = false

    // 调试模式: 是否每次都获取新的页面
    const isDebugWeb = [true, 'true'].includes($.getdata('@chavy_boxjs_userCfgs.isDebugWeb'))
    const debugger_web = $.getdata('@chavy_boxjs_userCfgs.debugger_web')
    const cache = $.getjson($.KEY_web_cache, null)

    // 如果没有开启调试模式，且当前版本与缓存版本一致，且直接取缓存
    if (!isDebugWeb && cache && cache.version === $.version) {
      $.html = cache.cache
    }
    // 如果开启了调试模式，并指定了 `debugger_web` 则从指定的地址获取页面
    else {
      if (isDebugWeb && debugger_web) {
        // 调试地址后面拼时间缀, 避免 GET 缓存
        const isQueryUrl = debugger_web.includes('?')
        $.web = `${debugger_web}${isQueryUrl ? '&' : '?'}_=${new Date().getTime()}`
        boxdata.syscfgs.isDebugMode = true
        console.log(`[WARN] 调试模式: $.web = : ${$.web}`)
      }
      // 如果调用这个方法来获取缓存, 且标记为`非调试模式`
      const getcache = () => {
        console.log(`[ERROR] 调试模式: 正在使用缓存的页面!`)
        boxdata.syscfgs.isDebugMode = false
        return $.getjson($.KEY_web_cache).cache
      }
      await $.http.get($.web).then(
        resp => {
          if (/<title>BoxJs<\/title>/.test(resp.body)) {
            // 返回页面源码, 并马上存储到持久化仓库
            $.html = resp.body
            const cache = { version: $.version, cache: $.html }
            $.setjson(cache, $.KEY_web_cache)
          } else {
            // 如果返回的页面源码不是预期的, 则从持久化仓库中获取
            $.html = getcache()
          }
        },
        // 如果获取页面源码失败, 则从持久化仓库中获取
        () => ($.html = getcache())
      )
    }
    // 根据偏好设置, 替换首屏颜色 (如果是`auto`则交由页面自适应)
    const theme = $.getdata('@chavy_boxjs_userCfgs.theme')
    if (theme === 'light') {
      $.html = $.html.replace('#121212', '#fff')
    } else if (theme === 'dark') {
      $.html = $.html.replace('#fff', '#121212')
    }
    /**
     * 后端渲染数据, 感谢 https://t.me/eslint 提供帮助
     *
     * 如果直接渲染到 box: null 会出现双向绑定问题
     * 所以先渲染到 `boxServerData: null` 再由前端 `this.box = this.boxServerData` 实现双向绑定
     */
    $.html = $.html.replace('boxServerData: null', 'boxServerData:' + JSON.stringify(boxdata))

    // 调试模式支持 vue Devtools (只有在同时开启调试模式和指定了调试地址才生效)
    // vue.min.js 生效时, 会导致 @click="window.open()" 报 "window" is not defined 错误
    if (isDebugWeb && debugger_web) {
      $.html = $.html.replace('vue.min.js', 'vue.js')
    }
  }

  /**
   * 处理`查询`请求
   */
  async function handleQuery() {
    const [, query] = $.path.split('/query')
    if (/^\/boxdata/.test(query)) {
      $.json = getBoxData()
    } else if (/^\/baks/.test(query)) {
      const [, backupId] = query.split('/baks/')
      $.json = $.getjson(backupId)
    } else if (/^\/versions$/.test(query)) {
      await getVersions(true)
    } else if (/^\/data/.test(query)) {
      // TODO 记录每次查询的 key 至 usercfgs.viewkeys
      const [, dataKey] = query.split('/data/')
      $.json = {
        key: dataKey,
        val: $.getdata(dataKey),
      }
    }
  }

  /**
   * 处理 API 请求
   */
  async function handleApi() {
    const [, api] = $.path.split('/api')

    if (api === '/save') {
      await apiSave()
    } else if (api === '/addAppSub') {
      await apiAddAppSub()
    } else if (api === '/reloadAppSub') {
      await apiReloadAppSub()
    } else if (api === '/delGlobalBak') {
      await apiDelGlobalBak()
    } else if (api === '/updateGlobalBak') {
      await apiUpdateGlobalBak()
    } else if (api === '/saveGlobalBak') {
      await apiSaveGlobalBak()
    } else if (api === '/impGlobalBak') {
      await apiImpGlobalBak()
    } else if (api === '/revertGlobalBak') {
      await apiRevertGlobalBak()
    } else if (api === '/runScript') {
      await apiRunScript()
    } else if (api === '/saveData') {
      await apiSaveData()
    }
  }

  async function handleOptions() {}

  /**
   * ===================================
   * 获取基础数据
   * ===================================
   */

  function getBoxData() {
    const datas = {}
    const usercfgs = getUserCfgs()
    const sessions = getAppSessions()
    const curSessions = getCurSessions()
    const sysapps = getSystemApps()
    const syscfgs = getSystemCfgs()
    const appSubCaches = getAppSubCaches()
    const globalbaks = getGlobalBaks()

    // 把 `内置应用`和`订阅应用` 里需要持久化属性放到`datas`
    sysapps.forEach(app => Object.assign(datas, getAppDatas(app)))
    usercfgs.appsubs.forEach(sub => {
      const subcache = appSubCaches[sub.url]
      if (subcache && subcache.apps && Array.isArray(subcache.apps)) {
        subcache.apps.forEach(app => Object.assign(datas, getAppDatas(app)))
      }
    })

    const box = { datas, usercfgs, sessions, curSessions, sysapps, syscfgs, appSubCaches, globalbaks }
    return box
  }

  /**
   * 获取系统配置
   */
  function getSystemCfgs() {
    // prettier-ignore
    return {
      env: $.isStash() ? 'Stash' : $.isShadowrocket() ? 'Shadowrocket' : $.isLoon() ? 'Loon' : $.isQuanX() ? 'QuanX' : $.isSurge() ? 'Surge' : 'Node',
      version: $.version,
      versionType: $.versionType,
      envs: [
        { id: 'Surge', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/surge.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/surge.png'] },
        { id: 'QuanX', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/quanX.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/quantumultx.png'] },
        { id: 'Loon', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/loon.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/loon.png'] },
        { id: 'Shadowrocket', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/shadowrocket.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/shadowrocket.png'] },
        { id: 'Stash', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/stash.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/stash.png'] }
      ],
      chavy: { id: 'ChavyLeung', icon: 'https://avatars3.githubusercontent.com/u/29748519', repo: 'https://github.com/chavyleung/scripts' },
      senku: { id: 'GideonSenku', icon: 'https://avatars1.githubusercontent.com/u/39037656', repo: 'https://github.com/GideonSenku' },
      id77: { id: 'id77', icon: 'https://avatars0.githubusercontent.com/u/9592236', repo: 'https://github.com/id77' },
      orz3: { id: 'Orz-3', icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/Orz-3.png', repo: 'https://github.com/Orz-3/' },
      boxjs: { id: 'BoxJs', show: false, icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/box.png', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/box.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/box.png'], repo: 'https://github.com/chavyleung/scripts' },
      defaultIcons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/appstore.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/appstore.png']
    }
  }

  /**
   * 获取内置应用
   */
  function getSystemApps() {
    // prettier-ignore
    const sysapps = [
      {
        id: 'BoxSetting',
        name: '偏好设置',
        descs: ['可手动执行一些抹掉数据的脚本', '可设置明暗两种主题下的主色调', '可设置壁纸清单'],
        keys: [
          '@chavy_boxjs_userCfgs.httpapi',
          '@chavy_boxjs_userCfgs.bgimg',
          '@chavy_boxjs_userCfgs.http_backend',
          '@chavy_boxjs_userCfgs.color_dark_primary',
          '@chavy_boxjs_userCfgs.color_light_primary'
        ],
        settings: [
          { id: '@chavy_boxjs_userCfgs.httpapis', name: 'HTTP-API (Surge)', val: '', type: 'textarea', placeholder: ',examplekey@127.0.0.1:6166', autoGrow: true, rows: 2, persistentHint:true, desc: '示例: ,examplekey@127.0.0.1:6166! 注意: 以逗号开头, 逗号分隔多个地址, 可加回车' },
          { id: '@chavy_boxjs_userCfgs.httpapi_timeout', name: 'HTTP-API Timeout (Surge)', val: 20, type: 'number', persistentHint:true, desc: '如果脚本作者指定了超时时间, 会优先使用脚本指定的超时时间.' },
          { id: '@chavy_boxjs_userCfgs.http_backend', name: 'HTTP Backend (Quantumult X)', val: '', type: 'text',placeholder: 'http://127.0.0.1:9999', persistentHint:true, desc: '示例: http://127.0.0.1:9999 ! 注意: 必须是以 http 开头的完整路径, 不能是 / 结尾' },
          { id: '@chavy_boxjs_userCfgs.bgimgs', name: '背景图片清单', val: '无,\n跟随系统,跟随系统\nlight,http://api.btstu.cn/sjbz/zsy.php\ndark,https://uploadbeta.com/api/pictures/random\n妹子,http://api.btstu.cn/sjbz/zsy.php', type: 'textarea', placeholder: '无,{回车} 跟随系统,跟随系统{回车} light,图片地址{回车} dark,图片地址{回车} 妹子,图片地址', persistentHint:true, autoGrow: true, rows: 2, desc: '逗号分隔名字和链接, 回车分隔多个地址' },
          { id: '@chavy_boxjs_userCfgs.bgimg', name: '背景图片', val: '', type: 'text', placeholder: 'http://api.btstu.cn/sjbz/zsy.php', persistentHint:true, desc: '输入背景图标的在线链接' },
          { id: '@chavy_boxjs_userCfgs.changeBgImgEnterDefault', name: '手势进入壁纸模式默认背景图片', val: '', type: 'text', placeholder: '填写上面背景图片清单的值', persistentHint:true, desc: '' },
          { id: '@chavy_boxjs_userCfgs.changeBgImgOutDefault', name: '手势退出壁纸模式默认背景图片', val: '', type: 'text', placeholder: '填写上面背景图片清单的值', persistentHint:true, desc: '' },
          { id: '@chavy_boxjs_userCfgs.color_light_primary', name: '明亮色调', canvas: true, val: '#F7BB0E', type: 'colorpicker', desc: '' },
          { id: '@chavy_boxjs_userCfgs.color_dark_primary', name: '暗黑色调', canvas: true, val: '#2196F3', type: 'colorpicker', desc: '' }
        ],
        scripts: [
          {
            name: "抹掉：所有缓存",
            script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.caches.js"
          },
          {
            name: "抹掉：收藏应用",
            script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.favapps.js"
          },
          {
            name: "抹掉：用户偏好",
            script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.js"
          },
          {
            name: "抹掉：所有会话",
            script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.sessions.js"
          },
          {
            name: "抹掉：所有备份",
            script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.baks.js"
          },
          {
            name: "抹掉：BoxJs (注意备份)",
            script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.boxjs.js"
          }
        ],
        author: '@chavyleung',
        repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
        icons: [
          'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.mini.png',
          'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.png'
        ]
      },
      {
        id: 'BoxSwitcher',
        name: '会话切换',
        desc: '打开静默运行后, 切换会话将不再发出系统通知 \n注: 不影响日志记录',
        keys: [],
        settings: [{ id: 'CFG_BoxSwitcher_isSilent', name: '静默运行', val: false, type: 'boolean', desc: '切换会话时不发出系统通知!' }],
        author: '@chavyleung',
        repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
        icons: [
          'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.mini.png',
          'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.png'
        ],
        script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/switcher/box.switcher.js'
      },
      {
        "id": "BoxGist",
        "name": "Gist备份",
        "keys": ["@gist.token", "@gist.username"],
        "author": "@dompling",
        "repo": "https://github.com/dompling/Script/tree/master/gist",
        "icons": [
          "https://raw.githubusercontent.com/Former-Years/icon/master/github-bf.png",
          "https://raw.githubusercontent.com/Former-Years/icon/master/github-bf.png"
        ],
        "descs_html": [
          "脚本由 <a href='https://github.com/dompling' target='_blank'>@dompling</a> 提供, 感谢!",
          "<br />",
          "<b>Token</b> 获取方式:",
          "<span style='margin-left: 40px'>头像菜单 -></span>",
          "<span style='margin-left: 40px'>Settings -></span>",
          "<span style='margin-left: 40px'>Developer settings -></span>",
          "<span style='margin-left: 40px'>Personal access tokens -></span>",
          "<span style='margin-left: 40px'>Generate new token -></span>",
          "<span style='margin-left: 40px'>在里面找到 gist 勾选提交</span>"
        ],
        "scripts": [
          {
            "name": "备份 Gist",
            "script": "https://raw.githubusercontent.com/dompling/Script/master/gist/backup.js"
          },
          {
            "name": "从 Gist 恢复",
            "script": "https://raw.githubusercontent.com/dompling/Script/master/gist/restore.js"
          }
        ],
        "settings": [
          {
            "id": "@gist.username",
            "name": "用户名",
            "val": null,
            "type": "text",
            "placeholder": "github 用户名",
            "desc": "必填"
          },
          {
            "id": "@gist.token",
            "name": "Personal access tokens",
            "val": null,
            "type": "text",
            "placeholder": "github personal access tokens",
            "desc": "必填"
          }
        ]
      }
    ]
    return sysapps
  }

  /**
   * 获取用户配置
   */
  function getUserCfgs() {
    const defcfgs = {
      favapps: [],
      appsubs: [],
      viewkeys: [],
      isPinedSearchBar: true,
      httpapi: 'examplekey@127.0.0.1:6166',
      http_backend: '',
    }
    const usercfgs = Object.assign(defcfgs, $.getjson($.KEY_usercfgs, {}))

    // 处理异常数据：删除所有为 null 的订阅
    if (usercfgs.appsubs.includes(null)) {
      usercfgs.appsubs = usercfgs.appsubs.filter(sub => sub)
      $.setjson(usercfgs, $.KEY_usercfgs)
    }

    return usercfgs
  }

  /**
   * 获取`应用订阅`缓存
   */
  function getAppSubCaches() {
    return $.getjson($.KEY_app_subCaches, {})
  }

  /**
   * 获取全局备份列表
   */
  function getGlobalBaks() {
    let backups = $.getjson($.KEY_backups, [])

    // 处理异常数据：删除所有为 null 的备份
    if (backups.includes(null)) {
      backups = backups.filter(bak => bak)
      $.setjson(backups, $.KEY_backups)
    }

    return backups
  }

  /**
   * 获取版本清单
   */
  function getVersions() {
    return $.http.get($.ver).then(
      resp => {
        try {
          $.json = $.toObj(resp.body)
        } catch {
          $.json = {}
        }
      },
      () => ($.json = {})
    )
  }

  /**
   * 获取用户应用
   */
  function getUserApps() {
    // TODO 用户可在 BoxJs 中自定义应用, 格式与应用订阅一致
    return []
  }

  /**
   * 获取应用会话
   */
  function getAppSessions() {
    return $.getjson($.KEY_sessions, []) || []
  }

  /**
   * 获取当前切换到哪个会话
   */
  function getCurSessions() {
    return $.getjson($.KEY_cursessions, {}) || {}
  }

  /**
   * ===================================
   * 接口类函数
   * ===================================
   */

  function getAppDatas(app) {
    const datas = {}
    const nulls = [null, undefined, 'null', 'undefined']
    if (app.keys && Array.isArray(app.keys)) {
      app.keys.forEach(key => {
        const val = $.getdata(key)
        datas[key] = nulls.includes(val) ? null : val
      })
    }
    if (app.settings && Array.isArray(app.settings)) {
      app.settings.forEach(setting => {
        const key = setting.id
        const val = $.getdata(key)
        datas[key] = nulls.includes(val) ? null : val
      })
    }
    return datas
  }

  async function apiSave() {
    const data = $.toObj($request.body)
    if (Array.isArray(data)) {
      data.forEach(dat => $.setdata(dat.val, dat.key))
    } else {
      $.setdata(data.val, data.key)
    }
    $.json = getBoxData()
  }

  async function apiAddAppSub() {
    const sub = $.toObj($request.body)
    // 添加订阅
    const usercfgs = getUserCfgs()
    usercfgs.appsubs.push(sub)
    $.setjson(usercfgs, $.KEY_usercfgs)
    // 加载订阅缓存
    await reloadAppSubCache(sub.url)
    $.json = getBoxData()
  }

  async function apiReloadAppSub() {
    const sub = $.toObj($request.body)
    if (sub) {
      await reloadAppSubCache(sub.url)
    } else {
      await reloadAppSubCaches()
    }
    $.json = getBoxData()
  }

  async function apiDelGlobalBak() {
    const backup = $.toObj($request.body)
    const backups = $.getjson($.KEY_backups, [])
    const bakIdx = backups.findIndex(b => b.id === backup.id)
    if (bakIdx > -1) {
      backups.splice(bakIdx, 1)
      $.setdata('', backup.id)
      $.setjson(backups, $.KEY_backups)
    }
    $.json = getBoxData()
  }

  async function apiUpdateGlobalBak() {
    const { id: backupId, name: backupName } = $.toObj($request.body)
    const backups = $.getjson($.KEY_backups, [])
    const backup = backups.find(b => b.id === backupId)
    if (backup) {
      backup.name = backupName
      $.setjson(backups, $.KEY_backups)
    }
    $.json = getBoxData()
  }

  async function apiRevertGlobalBak() {
    const { id: bakcupId } = $.toObj($request.body)
    const backup = $.getjson(bakcupId)
    if (backup) {
      const {
        chavy_boxjs_sysCfgs,
        chavy_boxjs_sysApps,
        chavy_boxjs_sessions,
        chavy_boxjs_userCfgs,
        chavy_boxjs_cur_sessions,
        chavy_boxjs_app_subCaches,
        ...datas
      } = backup
      $.setdata(JSON.stringify(chavy_boxjs_sessions), $.KEY_sessions)
      $.setdata(JSON.stringify(chavy_boxjs_userCfgs), $.KEY_usercfgs)
      $.setdata(JSON.stringify(chavy_boxjs_cur_sessions), $.KEY_cursessions)
      $.setdata(JSON.stringify(chavy_boxjs_app_subCaches), $.KEY_app_subCaches)
      const isNull = val => [undefined, null, 'null', 'undefined', ''].includes(val)
      Object.keys(datas).forEach(datkey => $.setdata(isNull(datas[datkey]) ? '' : `${datas[datkey]}`, datkey))
    }
    const boxdata = getBoxData()
    $.json = boxdata
  }

  async function apiSaveGlobalBak() {
    const backups = $.getjson($.KEY_backups, [])
    const boxdata = getBoxData()
    const backup = $.toObj($request.body)
    const backupData = {}
    backupData['chavy_boxjs_userCfgs'] = boxdata.usercfgs
    backupData['chavy_boxjs_sessions'] = boxdata.sessions
    backupData['chavy_boxjs_cur_sessions'] = boxdata.curSessions
    backupData['chavy_boxjs_app_subCaches'] = boxdata.appSubCaches
    Object.assign(backupData, boxdata.datas)
    backups.push(backup)
    $.setjson(backups, $.KEY_backups)
    $.setjson(backupData, backup.id)
    $.json = getBoxData()
  }

  async function apiImpGlobalBak() {
    const backups = $.getjson($.KEY_backups, [])
    const backup = $.toObj($request.body)
    const backupData = backup.bak
    delete backup.bak
    backups.push(backup)
    $.setjson(backups, $.KEY_backups)
    $.setjson(backupData, backup.id)
    $.json = getBoxData()
  }

  async function apiRunScript() {
    // 取消勿扰模式
    $.isMute = false
    const opts = $.toObj($request.body)
    const httpapi = $.getdata('@chavy_boxjs_userCfgs.httpapi')
    const ishttpapi = /.*?@.*?:[0-9]+/.test(httpapi)
    let script_text = null
    if (opts.isRemote) {
      await $.getScript(opts.url).then(script => (script_text = script))
    } else {
      script_text = opts.script
    }
    if ($.isSurge() && !$.isLoon() && !$.isShadowrocket() && ishttpapi) {
      const runOpts = { timeout: opts.timeout }
      await $.runScript(script_text, runOpts).then(resp => ($.json = JSON.parse(resp)))
    } else {
      await new Promise(resolve => {
        $eval_env.resolve = resolve
        // 避免被执行脚本误认为是 rewrite 环境
        // 所以需要 `$request = undefined`
        $eval_env.request = $request
        $request = undefined
        // 重写 console.log, 把日志记录到 $eval_env.cached_logs
        $eval_env.cached_logs = []
        console.cloned_log = console.log
        console.log = l => {
          console.cloned_log(l)
          $eval_env.cached_logs.push(l)
        }
        // 重写脚本内的 $done, 调用 $done() 即是调用 $eval_env.resolve()
        script_text = script_text.replace(/\$done/g, '$eval_env.resolve')
        script_text = script_text.replace(/\$\.done/g, '$eval_env.resolve')
        try {
          eval(script_text)
        } catch (e) {
          $eval_env.cached_logs.push(e)
          resolve()
        }
      })
      // 还原 console.log
      console.log = console.cloned_log
      // 还原 $request
      $request = $eval_env.request
      // 返回数据
      $.json = {
        result: '',
        output: $eval_env.cached_logs.join('\n'),
      }
    }
  }

  async function apiSaveData() {
    const { key: dataKey, val: dataVal } = $.toObj($request.body)
    $.setdata(dataVal, dataKey)
    $.json = {
      key: dataKey,
      val: $.getdata(dataKey),
    }
  }

  /**
   * ===================================
   * 工具类函数
   * ===================================
   */

  function reloadAppSubCache(url) {
    // 地址后面拼时间缀, 避免 GET 缓存
    const requrl = `${url}${url.includes('?') ? '&' : '?'}_=${new Date().getTime()}`
    return $.http.get(requrl).then(resp => {
      try {
        const subcaches = getAppSubCaches()
        subcaches[url] = $.toObj(resp.body)
        subcaches[url].updateTime = new Date()
        $.setjson(subcaches, $.KEY_app_subCaches)
        $.log(`更新订阅, 成功! ${url}`)
      } catch (e) {
        $.logErr(e)
        $.log(`更新订阅, 失败! ${url}`)
      }
    })
  }

  async function reloadAppSubCaches() {
    $.msg($.name, '更新订阅: 开始!')
    const reloadActs = []
    const usercfgs = getUserCfgs()
    usercfgs.appsubs.forEach(sub => {
      reloadActs.push(reloadAppSubCache(sub.url))
    })
    await Promise.all(reloadActs)
    $.log(`全部订阅, 完成!`)
    const endTime = new Date().getTime()
    const costTime = (endTime - $.startTime) / 1000
    $.msg($.name, `更新订阅: 完成! 🕛 ${costTime} 秒`)
  }

  function upgradeUserData() {
    const usercfgs = getUserCfgs()
    // 如果存在`usercfgs.appsubCaches`则需要升级数据
    const isNeedUpgrade = !!usercfgs.appsubCaches
    if (isNeedUpgrade) {
      // 迁移订阅缓存至独立的持久化空间
      $.setjson(usercfgs.appsubCaches, $.KEY_app_subCaches)
      // 移除用户偏好中的订阅缓存
      delete usercfgs.appsubCaches
      usercfgs.appsubs.forEach(sub => {
        delete sub._raw
        delete sub.apps
        delete sub.isErr
        delete sub.updateTime
      })
    }
    if (isNeedUpgrade) {
      $.setjson(usercfgs, $.KEY_usercfgs)
    }
  }

  /**
   * 升级备份数据
   *
   * 升级前: 把所有备份都存到一个持久化空间
   * 升级后: 把每个备份都独立存到一个空间, `$.KEY_backups` 仅记录必要的数据索引
   */
  function upgradeGlobalBaks() {
    let oldbaks = $.getdata($.KEY_globalBaks)
    let newbaks = $.getjson($.KEY_backups, [])
    const isEmpty = bak => [undefined, null, ''].includes(bak)
    const isExistsInNew = backupId => newbaks.find(bak => bak.id === backupId)

    // 存在旧备份数据时, 升级备份数据格式
    if (!isEmpty(oldbaks)) {
      oldbaks = JSON.parse(oldbaks)
      oldbaks.forEach(bak => {
        if (isEmpty(bak)) return
        if (isEmpty(bak.bak)) return
        if (isExistsInNew(bak.id)) return

        console.log(`正在迁移: ${bak.name}`)
        const backupId = bak.id
        const backupData = bak.bak

        // 删除旧的备份数据, 仅保留索引信息
        delete bak.bak
        newbaks.push(bak)

        // 提取旧备份数据, 存入独立的持久化空间
        $.setjson(backupData, backupId)
      })
      $.setjson(newbaks, $.KEY_backups)
    }

    // 清空所有旧备份的数据
    $.setdata('', $.KEY_globalBaks)
  }

  /**
   * ===================================
   * 结束类函数
   * ===================================
   */
  function doneBox() {
    // 记录当前使用哪个域名访问
    $.setdata(getHost($request.url), $.KEY_boxjs_host)
    if ($.isOptions) doneOptions()
    else if ($.isPage) donePage()
    else if ($.isQuery) doneQuery()
    else if ($.isApi) doneApi()
    else $.done()
  }

  function getBaseDoneHeaders(mixHeaders = {}) {
    return Object.assign(
      {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      },
      mixHeaders
    )
  }

  function getHtmlDoneHeaders() {
    return getBaseDoneHeaders({
      'Content-Type': 'text/html;charset=UTF-8',
    })
  }
  function getJsonDoneHeaders() {
    return getBaseDoneHeaders({
      'Content-Type': 'text/json; charset=utf-8',
    })
  }

  function doneOptions() {
    const headers = getBaseDoneHeaders()
    if ($.isSurge() || $.isLoon()) {
      $.done({ response: { headers } })
    } else if ($.isQuanX()) {
      $.done({ headers })
    }
  }

  function donePage() {
    const headers = getHtmlDoneHeaders()
    if ($.isSurge() || $.isLoon()) {
      $.done({ response: { status: 200, headers, body: $.html } })
    } else if ($.isQuanX()) {
      $.done({ status: 'HTTP/1.1 200', headers, body: $.html })
    }
  }

  function doneQuery() {
    $.json = $.toStr($.json)
    const headers = getJsonDoneHeaders()
    if ($.isSurge() || $.isLoon()) {
      $.done({ response: { status: 200, headers, body: $.json } })
    } else if ($.isQuanX()) {
      $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
    }
  }

  function doneApi() {
    $.json = $.toStr($.json)
    const headers = getJsonDoneHeaders()
    if ($.isSurge() || $.isLoon()) {
      $.done({ response: { status: 200, headers, body: $.json } })
    } else if ($.isQuanX()) {
      $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
    }
  }

  //#endregion

  const boxdata = getBoxData()

  const backupData = {}
  backupData['chavy_boxjs_userCfgs'] = boxdata.usercfgs
  backupData['chavy_boxjs_sessions'] = boxdata.sessions
  backupData['chavy_boxjs_cur_sessions'] = boxdata.curSessions
  backupData['chavy_boxjs_app_subCaches'] = boxdata.appSubCaches
  Object.assign(backupData, boxdata.datas)
  return backupData
}

function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env
    }

    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts
      let sender = this.get
      if (method === 'POST') {
        sender = this.post
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })
    }

    get(opts) {
      return this.send.call(this.env, opts)
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST')
    }
  }

  return new (class {
    constructor(name, opts) {
      this.name = name
      this.http = new Http(this)
      this.data = null
      this.dataFile = 'box.dat'
      this.logs = []
      this.isMute = false
      this.isNeedRewrite = false
      this.logSeparator = '\n'
      this.encoding = 'utf-8'
      this.startTime = new Date().getTime()
      Object.assign(this, opts)
      this.log('', `🔔${this.name}, 开始!`)
    }

    isNode() {
      return 'undefined' !== typeof module && !!module.exports
    }

    isQuanX() {
      return 'undefined' !== typeof $task
    }

    isSurge() {
      return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
    }

    isLoon() {
      return 'undefined' !== typeof $loon
    }

    isShadowrocket() {
      return 'undefined' !== typeof $rocket
    }

    isStash() {
      return 'undefined' !== typeof $environment && $environment['stash-version']
    }

    toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str)
      } catch {
        return defaultValue
      }
    }

    toStr(obj, defaultValue = null) {
      try {
        return JSON.stringify(obj)
      } catch {
        return defaultValue
      }
    }

    getjson(key, defaultValue) {
      let json = defaultValue
      const val = this.getdata(key)
      if (val) {
        try {
          json = JSON.parse(this.getdata(key))
        } catch {}
      }
      return json
    }

    setjson(val, key) {
      try {
        return this.setdata(JSON.stringify(val), key)
      } catch {
        return false
      }
    }

    getScript(url) {
      return new Promise(resolve => {
        this.get({ url }, (err, resp, body) => resolve(body))
      })
    }

    runScript(script, runOpts) {
      return new Promise(resolve => {
        let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
        httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
        let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
        httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
        httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
        const [key, addr] = httpapi.split('@')
        const opts = {
          url: `http://${addr}/v1/scripting/evaluate`,
          body: { script_text: script, mock_type: 'cron', timeout: httpapi_timeout },
          headers: { 'X-Key': key, Accept: '*/*' },
        }
        this.post(opts, (err, resp, body) => resolve(body))
      }).catch(e => this.logErr(e))
    }

    loaddata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs')
        this.path = this.path ? this.path : require('path')
        const curDirDataFilePath = this.path.resolve(this.dataFile)
        const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
        const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
        if (isCurDirDataFile || isRootDirDataFile) {
          const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
          try {
            return JSON.parse(this.fs.readFileSync(datPath))
          } catch (e) {
            return {}
          }
        } else return {}
      } else return {}
    }

    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs')
        this.path = this.path ? this.path : require('path')
        const curDirDataFilePath = this.path.resolve(this.dataFile)
        const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
        const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
        const jsondata = JSON.stringify(this.data)
        if (isCurDirDataFile) {
          this.fs.writeFileSync(curDirDataFilePath, jsondata)
        } else if (isRootDirDataFile) {
          this.fs.writeFileSync(rootDirDataFilePath, jsondata)
        } else {
          this.fs.writeFileSync(curDirDataFilePath, jsondata)
        }
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
      let result = source
      for (const p of paths) {
        result = Object(result)[p]
        if (result === undefined) {
          return defaultValue
        }
      }
      return result
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
      path
        .slice(0, -1)
        .reduce(
          (a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})),
          obj
        )[path[path.length - 1]] = value
      return obj
    }

    getdata(key) {
      let val = this.getval(key)
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objval = objkey ? this.getval(objkey) : ''
        if (objval) {
          try {
            const objedval = JSON.parse(objval)
            val = objedval ? this.lodash_get(objedval, paths, '') : val
          } catch (e) {
            val = ''
          }
        }
      }
      return val
    }

    setdata(val, key) {
      let issuc = false
      if (/^@/.test(key)) {
        const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
        const objdat = this.getval(objkey)
        const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
        try {
          const objedval = JSON.parse(objval)
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
        } catch (e) {
          const objedval = {}
          this.lodash_set(objedval, paths, val)
          issuc = this.setval(JSON.stringify(objedval), objkey)
        }
      } else {
        issuc = this.setval(val, key)
      }
      return issuc
    }

    getval(key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.read(key)
      } else if (this.isQuanX()) {
        return $prefs.valueForKey(key)
      } else if (this.isNode()) {
        this.data = this.loaddata()
        return this.data[key]
      } else {
        return (this.data && this.data[key]) || null
      }
    }

    setval(val, key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.write(val, key)
      } else if (this.isQuanX()) {
        return $prefs.setValueForKey(val, key)
      } else if (this.isNode()) {
        this.data = this.loaddata()
        this.data[key] = val
        this.writedata()
        return true
      } else {
        return (this.data && this.data[key]) || null
      }
    }

    initGotEnv(opts) {
      this.got = this.got ? this.got : require('got')
      this.cktough = this.cktough ? this.cktough : require('tough-cookie')
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
      if (opts) {
        opts.headers = opts.headers ? opts.headers : {}
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
          opts.cookieJar = this.ckjar
        }
      }
    }

    get(opts, callback = () => {}) {
      if (opts.headers) {
        delete opts.headers['Content-Type']
        delete opts.headers['Content-Length']
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {}
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
        }
        $httpClient.get(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body
            resp.statusCode = resp.status
          }
          callback(err, resp, body)
        })
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {}
          Object.assign(opts.opts, { hints: false })
        }
        $task.fetch(opts).then(
          resp => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          err => callback(err)
        )
      } else if (this.isNode()) {
        let iconv = require('iconv-lite')
        this.initGotEnv(opts)
        this.got(opts)
          .on('redirect', (resp, nextOpts) => {
            try {
              if (resp.headers['set-cookie']) {
                const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                if (ck) {
                  this.ckjar.setCookieSync(ck, null)
                }
                nextOpts.cookieJar = this.ckjar
              }
            } catch (e) {
              this.logErr(e)
            }
            // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
          })
          .then(
            resp => {
              const { statusCode: status, statusCode, headers, rawBody } = resp
              const body = iconv.decode(rawBody, this.encoding)
              callback(null, { status, statusCode, headers, rawBody, body }, body)
            },
            err => {
              const { message: error, response: resp } = err
              callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
            }
          )
      }
    }

    post(opts, callback = () => {}) {
      const method = opts.method ? opts.method.toLocaleLowerCase() : 'post'
      // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
      if (opts.body && opts.headers && !opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
      if (opts.headers) delete opts.headers['Content-Length']
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {}
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false })
        }
        $httpClient[method](opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body
            resp.statusCode = resp.status
          }
          callback(err, resp, body)
        })
      } else if (this.isQuanX()) {
        opts.method = method === 'patch' ? 'PATCH' : method
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {}
          Object.assign(opts.opts, { hints: false })
        }
        $task.fetch(opts).then(
          resp => {
            const { statusCode: status, statusCode, headers, body } = resp
            callback(null, { status, statusCode, headers, body }, body)
          },
          err => callback(err)
        )
      } else if (this.isNode()) {
        let iconv = require('iconv-lite')
        this.initGotEnv(opts)
        const { url, ..._opts } = opts
        this.got[method](url, _opts).then(
          resp => {
            const { statusCode: status, statusCode, headers, rawBody } = resp
            const body = iconv.decode(rawBody, this.encoding)
            callback(null, { status, statusCode, headers, rawBody, body }, body)
          },
          err => {
            const { message: error, response: resp } = err
            callback(error, resp, resp && iconv.decode(resp.rawBody, this.encoding))
          }
        )
      }
    }
    /**
     *
     * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
     *    :$.time('yyyyMMddHHmmssS')
     *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
     *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
     * @param {string} fmt 格式化参数
     * @param {number} 可选: 根据指定时间戳返回格式化日期
     *
     */
    time(fmt, ts = null) {
      const date = ts ? new Date(ts) : new Date()
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
      return fmt
    }

    /**
     * 系统通知
     *
     * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
     *
     * 示例:
     * $.msg(title, subt, desc, 'twitter://')
     * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     *
     * @param {*} title 标题
     * @param {*} subt 副标题
     * @param {*} desc 通知详情
     * @param {*} opts 通知参数
     *
     */
    msg(title = name, subt = '', desc = '', opts) {
      const toEnvOpts = rawopts => {
        if (!rawopts) return rawopts
        if (typeof rawopts === 'string') {
          if (this.isLoon()) return rawopts
          else if (this.isQuanX()) return { 'open-url': rawopts }
          else if (this.isSurge()) return { url: rawopts }
          else return undefined
        } else if (typeof rawopts === 'object') {
          if (this.isLoon()) {
            let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
            let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
            return { openUrl, mediaUrl }
          } else if (this.isQuanX()) {
            let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
            let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
            let updatePasteboard = rawopts['update-pasteboard'] || rawopts.updatePasteboard
            return { 'open-url': openUrl, 'media-url': mediaUrl, 'update-pasteboard': updatePasteboard }
          } else if (this.isSurge()) {
            let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
            return { url: openUrl }
          }
        } else {
          return undefined
        }
      }
      if (!this.isMute) {
        if (this.isSurge() || this.isLoon()) {
          $notification.post(title, subt, desc, toEnvOpts(opts))
        } else if (this.isQuanX()) {
          $notify(title, subt, desc, toEnvOpts(opts))
        }
      }
      if (!this.isMuteLog) {
        let logs = ['', '==============📣系统通知📣==============']
        logs.push(title)
        subt ? logs.push(subt) : ''
        desc ? logs.push(desc) : ''
        console.log(logs.join('\n'))
        this.logs = this.logs.concat(logs)
      }
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs]
      }
      console.log(logs.join(this.logSeparator))
    }

    logErr(err, msg) {
      const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
      if (!isPrintSack) {
        this.log('', `❗️${this.name}, 错误!`, err)
      } else {
        this.log('', `❗️${this.name}, 错误!`, err.stack)
      }
    }

    wait(time) {
      return new Promise(resolve => setTimeout(resolve, time))
    }

    done(val = {}) {
      const endTime = new Date().getTime()
      const costTime = (endTime - this.startTime) / 1000
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
      this.log()
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(val)
      } else if (this.isNode()) {
        process.exit(1)
      }
    }
  })(name, opts)
}

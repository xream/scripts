// 使用说明 https://t.me/zhetengsha/4533
async function operator(proxies = [], targetPlatform, context) {
  let { config, user, password, ua, timeout, subUA, auth_data, api } = $arguments

  const SUBS_KEY = 'subs'
  const $ = $substore
  const { source } = context
  if (auth_data && api) {
    $.info(`使用外部传入的 auth_data 和 api 地址`)
  } else {
    // 从配置接口获取 API 地址
    let { body: configRes } = await $.http.get({
      url: config,
      headers: {
        'user-agent': ua,
      },
      timeout,
    })
    $.info(`从配置接口获取 API 地址 ${configRes}`)
    $.info(`进行 Base64 解码`)
    configRes = ProxyUtils.Base64.decode(configRes)
    $.info(`解码后内容 ${configRes}`)
    $.info(`进行 JSON 解析`)
    configRes = JSON.parse(configRes)
    $.info(`解析后内容 ${JSON.stringify(configRes, null, 2)}`)

    // ⚠️ 从某个字段取, 分析了俩机场 有的是 domain 有的是 hosts
    api = configRes.hosts?.[0] || configRes.domain?.[0]
    // 支持读取 api_path 字段拼接到 api 后面
    const api_path = configRes.api_path
    if (api_path) {
      api = `${api}/${api_path}`
    }

    $.info(`👀 API 地址: ===>${api}<===`)

    // ⚠️ 登录接口 不同的机场可能不同
    const login = `${api}/passport/auth/login`

    $.info(`登录接口 ${login}, 进行登录`)
    let { body: loginRes } = await $.http.post({
      url: login,
      headers: {
        'user-agent': ua,
        'content-type': 'application/json; charset=utf-8',
      },
      timeout,
      body: JSON.stringify({
        email: user,
        password,
      }),
    })
    $.info(`登录接口返回内容 ${loginRes}`)
    loginRes = JSON.parse(loginRes)
    auth_data = loginRes.data?.auth_data
    $.info(`👀 登录获取到的 auth_data ===>${auth_data}<===`)
  }

  // ⚠️ 获取订阅接口 不同的机场可能不同
  const subscribe = `${api}/user/getSubscribe`

  $.info(`订阅接口 ${subscribe}, 进行获取订阅`)
  let { body: subscribeRes } = await $.http.get({
    url: subscribe,
    headers: {
      'user-agent': ua,
      authorization: `${auth_data}`,
    },
    timeout,
  })
  $.info(`订阅接口返回内容 ${subscribeRes}`)
  subscribeRes = JSON.parse(subscribeRes)
  const subscriptionUrl = subscribeRes.data?.subscribe_url
  $.info(`获取到的订阅地址 ${subscriptionUrl}`)

  const { statusCode, body, headers } = await $.http.get({
    url: subscriptionUrl,
    headers: {
      // 拉取订阅时候的 UA
      'user-agent': subUA,
    },
    timeout,
  })
  if (statusCode < 200 || statusCode >= 400) {
    $.error(`请求订阅地址失败，状态码 ${statusCode}, 跳过`)
    return proxies
  }
  let parsed
  try {
    parsed = ProxyUtils.parse(body)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      $.error(`订阅不包含有效节点, 跳过`)
      return proxies
    }
    $.info(`节点数 ${parsed.length}`)
  } catch (e) {
    $.error(`订阅尝试解析节点失败 ${e.message ?? e}, 跳过`)
    return proxies
  }
  const subscriptionUserinfo = headers['subscription-userinfo']
  $.info(`订阅流量信息 ${subscriptionUserinfo}`)

  const allSubs = $.read(SUBS_KEY) || []

  for (const name in source) {
    const sub = source[name]
    if (sub.name) {
      for (var index = 0; index < allSubs.length; index++) {
        if (sub.name === allSubs[index].name) {
          $.info(`写入订阅流量信息 ${subscriptionUserinfo} 和订阅内容`)
          allSubs[index].subUserinfo = subscriptionUserinfo
          allSubs[index].content = body
          // 留一份原始订阅地址 虽然没啥用
          allSubs[index].url = subscriptionUrl
          break
        }
      }
      break
    }
  }
  $.write(allSubs, SUBS_KEY)
  return parsed
}

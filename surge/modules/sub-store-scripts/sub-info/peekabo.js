/* 
  Sub-Store 对接 Peekabo 服务器流量信息
  https://t.me/zhetengsha/5956
*/

async function operator(proxies = [], targetPlatform, context) {
  const SUBS_KEY = 'subs'
  const $ = $substore
  const { source } = context

  if (source._collection) throw new Error('不支持组合订阅, 请在单条订阅中使用此脚本')

  // 参数配置传入
  const API_TOKEN = $arguments?.token
  const SERVER_ID = $arguments?.id
  const TRAFFIC_MODE = String($arguments?.traffic || 'outbound').toLowerCase()
  if (!API_TOKEN || !SERVER_ID) throw new Error('请传入 token 和 id 参数')
  if (!['outbound', 'inbound', 'both'].includes(TRAFFIC_MODE)) {
    throw new Error('traffic 参数仅支持 outbound、inbound、both')
  }

  // 获取流量信息
  const res = await $.http.get({
    url: `https://vf-hk.peekabo.io/api/server/${encodeURIComponent(SERVER_ID)}?state=true`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    timeout: 10 * 1000,
  })
  const { data } = JSON.parse(res.body)
  const traffic = data?.state?.network?.primary?.traffic
  const limit = String(data?.network?.primary?.limit || '')
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*GB$/i)
  const upload = TRAFFIC_MODE === 'inbound' ? 0 : traffic?.tx
  const download = TRAFFIC_MODE === 'outbound' ? 0 : traffic?.rx
  const total = limit ? Number(limit[1]) * 1024 ** 3 : NaN
  const expire = Math.floor(Date.parse(data?.currentMonthlyPeriod?.end) / 1000)
  const planName = String(data?.name || '').trim()

  if (
    ![upload, download, total, expire].every(Number.isSafeInteger) ||
    upload < 0 ||
    download < 0 ||
    total <= 0 ||
    expire <= 0 ||
    !planName
  ) {
    throw new Error('Peekabo API 返回的流量信息不完整')
  }

  const subUserinfo = `upload=${upload}; download=${download}; total=${total}; expire=${expire}; plan_name=${encodeURIComponent(planName)}`

  // 旧版需要写入, 返回响应头里使用这个
  const allSubs = $.read(SUBS_KEY) || []
  for (const name in source) {
    const sub = source[name]
    if (sub.name && (sub.url || sub.content)) {
      // 确定是订阅
      for (var index = 0; index < allSubs.length; index++) {
        if (sub.name === allSubs[index].name) {
          // 写入订阅流量信息
          allSubs[index].subUserinfo = subUserinfo
          break
        }
      }
      break
    }
  }
  $.write(allSubs, SUBS_KEY)

  // 新版直接可以加到响应头里
  if ($options) {
    $options._res = {
      headers: {
        'subscription-userinfo': subUserinfo,
      },
    }
  }

  return proxies
}

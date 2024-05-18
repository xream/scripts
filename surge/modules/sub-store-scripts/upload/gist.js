/**
 * 上传订阅至 Gist
 *
 * 发布说明: https://t.me/zhetengsha/1428
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 参数
 * - [name] Gist 名称. 为防止意外修改你已有的 Gist, 此参数为必填
 * - [file] 文件名. 为防止意外修改你已有的 Gist 文件, 此参数为必填
 * - [token] GitHub Token. 默认为 Sub-Store 中已经配置的 Token
 * - [target] 指定输出的目标. 默认为 ClashMeta
 */
async function operator(proxies = [], targetPlatform, context) {
  const $ = $substore

  const settings = $.read('settings') || {}
  const GITHUB_TOKEN = $arguments?.token || settings.gistToken
  if (!GITHUB_TOKEN) throw new Error('请配置 Token')
  const GIST_NAME = $arguments?.name
  if (!GIST_NAME) throw new Error('请配置 Gist 名称')
  const FILENAME = $arguments?.file
  if (!FILENAME) throw new Error('请配置 Gist 文件名')
  let platform = $arguments?.target || 'ClashMeta'

  const { isLoon, isSurge } = $.env

  let files = {}

  let content = await produceArtifact({
    type: 'subscription',
    subscription: {},
    content: 'proxies:\n' + proxies.map(proxy => '  - ' + JSON.stringify(proxy) + '\n').join(''),
    platform,
  })

  const manager = new ProxyUtils.Gist({
    token: GITHUB_TOKEN,
    key: GIST_NAME,
  })

  files[encodeURIComponent(FILENAME)] = {
    content,
  }

  const res = await manager.upload(files)
  let body = {}
  try {
    body = JSON.parse(res.body)
    // eslint-disable-next-line no-empty
  } catch (e) {}

  // console.log(JSON.stringify(body, null, 2))

  const raw_url = body.files[encodeURIComponent(FILENAME)]?.raw_url
  const new_url = raw_url?.replace(/\/raw\/[^/]*\/(.*)/, '/raw/$1')

  $.info(`已上传至 ${new_url}`)
  if (isSurge) {
    $notification.post(`🌍 Sub-Store`, 'Gist', `点击复制 ${new_url}`, {
      action: 'clipboard',
      text: new_url,
    })
  } else {
    $.notify('🌍 Sub-Store', `Gist: ${new_url}`)
  }

  return proxies
}

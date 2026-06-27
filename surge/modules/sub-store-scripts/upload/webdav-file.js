/**
 * 上传文件至 WebDAV
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 参数
 * - [base-url] WebDAV 基础地址/服务入口, 例如 https://dav.jianguoyun.com/dav
 * - [folder] WebDAV 上传目录, 例如 /sub-store、sub-store、/subscriptions/sub-store、subscriptions/sub-store. 若为 / 或不填, 表示直接使用 base-url
 * - [file] 文件名, 例如 subscription.yaml. 目录请写在 folder, 不要写在 file
 * - [username] WebDAV 用户名
 * - [password] WebDAV 密码
 * - [age-public-key] age 加密公钥, 若设置了就会加密. 也可以不设置此项, 由后端从私钥推导公钥
 * - [age-secret-key] age 解密私钥, 若未设置 age-public-key, 由后端从私钥推导公钥
 *
 * 这样拆分 base-url / folder / file 是为了减少 WebDAV 目录创建时的无效尝试:
 * base-url 通常是服务固定入口, 例如坚果云的 /dav, 不应该尝试创建;
 * 上传遇到 4xx 时, 脚本只解析 folder 并逐级创建 folder, 不会从 base-url 的路径开始创建;
 * folder 为 / 或不填时表示 base-url 已经是目标目录, 不会发起创建目录请求。
 */
const $ = $substore
const args = typeof $arguments === 'undefined' ? {} : $arguments

const target = parseWebDavTarget(args)
const baseUrl = target.baseUrl
const folder = target.folder
const file = normalizeFileName(args.file)
const username = args.username == null ? target.username : String(args.username)
const password = args.password == null ? target.password : String(args.password)
const agePublicKey = normalizeArg(args['age-public-key'])
const ageSecretKey = normalizeArg(args['age-secret-key'])

validateArgs({ baseUrl, file, username, password })

const folderUrl = joinUrl(baseUrl, folder)
const fileUrl = joinUrl(folderUrl, file)
let content = $content ?? $files[0]
const publicKey = await getUploadPublicKey($, agePublicKey, ageSecretKey)

if (publicKey) {
  $.info('使用 age 加密 WebDAV 文件内容')
  content = await ProxyUtils.age.encrypt(content, publicKey)
}

let res = await putContent({ $, fileUrl, username, password, content })
if (shouldTryCreateFolder($, res)) {
  $.info('WebDAV 上传返回 4xx, 尝试自动创建目录')
  await ensureFolderCollections({ $, baseUrl, folder, username, password })
  res = await putContent({ $, fileUrl, username, password, content })
}
assertSuccess($, res, '上传 WebDAV 文件')

const accessUrl = buildAccessUrl(fileUrl, username, password)
const message = `已上传至 ${accessUrl}`
$.info(message)
notify($, 'WebDAV', `点击复制 ${accessUrl}`, accessUrl)

function validateArgs({ baseUrl, file, username, password }) {
  if (!baseUrl) throw new Error('请配置 WebDAV 基础地址 base-url')
  if (!file) throw new Error('请配置 WebDAV 文件名 file')
  if (file.includes('/')) {
    throw new Error('file 只填写文件名, 目录请写在 folder')
  }
  if ((username && !password) || (!username && password)) {
    throw new Error('username 和 password 需要同时配置')
  }
}

async function getUploadPublicKey($, agePublicKey, ageSecretKey) {
  if (agePublicKey) return agePublicKey
  if (!ageSecretKey) return ''

  $.info('未配置 age-public-key, 尝试从 age-secret-key 推导公钥')
  return await ProxyUtils.age.derivePublicKey(ageSecretKey)
}

async function putContent({ $, fileUrl, username, password, content }) {
  return await $.http.put({
    url: fileUrl,
    headers: buildHeaders(username, password, {
      'Content-Type': 'text/plain; charset=utf-8',
    }),
    body: content,
  })
}

async function ensureFolderCollections({ $, baseUrl, folder, username, password }) {
  for (const current of getCollectionUrls(baseUrl, folder)) {
    $.info(`创建 WebDAV 目录: ${current}`)
    const res = await $.http.request({
      method: 'MKCOL',
      url: current,
      headers: buildHeaders(username, password),
    })
    const statusCode = getStatusCode(res)
    if ((statusCode >= 200 && statusCode < 300) || statusCode === 405) {
      continue
    }
    throw responseError(res, `创建 WebDAV 目录失败, 请手动创建目录或检查 WebDAV 设置是否正确`)
  }
}

function getCollectionUrls(baseUrl, folderPath) {
  const urls = []
  const segments = folderPath.split('/').filter(Boolean)
  let current = baseUrl

  for (const segment of segments) {
    current = `${current}/${encodePathSegment(segment)}`
    urls.push(current)
  }

  return urls
}

function parseWebDavTarget(args) {
  const rawBaseUrl = args['base-url'] ?? args.baseUrl ?? args.base_url
  const rawLegacyUrl = args.url
  let parsed = parseBaseUrl(rawBaseUrl || rawLegacyUrl)
  let folder = normalizeFolderPath(args.folder)

  if (!rawBaseUrl && rawLegacyUrl && !folder) {
    const legacy = splitLegacyUrl(parsed.url)
    const { username, password } = parsed
    parsed = parseBaseUrl(legacy.baseUrl)
    parsed.username = username
    parsed.password = password
    folder = legacy.folder
  }

  return {
    baseUrl: parsed.url,
    folder,
    username: parsed.username,
    password: parsed.password,
  }
}

function parseBaseUrl(value) {
  const text = normalizeArg(value)
  if (!text) return { url: '', username: '', password: '' }
  const parsed = new URL(text)
  const username = decodeURIComponent(parsed.username || '')
  const password = decodeURIComponent(parsed.password || '')
  parsed.username = ''
  parsed.password = ''
  parsed.hash = ''
  parsed.search = ''
  return {
    url: parsed.toString().replace(/\/+$/, ''),
    username,
    password,
  }
}

function splitLegacyUrl(value) {
  const parsed = new URL(value)
  const segments = parsed.pathname.split('/').filter(Boolean)
  const folder = decodePathSegment(segments.pop() || '')
  parsed.pathname = segments.length ? `/${segments.join('/')}` : '/'

  return {
    baseUrl: parsed.toString().replace(/\/+$/, ''),
    folder: normalizeFolderPath(folder),
  }
}

function normalizeFolderPath(value) {
  return normalizeArg(value).replace(/^\/+/, '').replace(/\/+$/, '')
}

function normalizeFileName(value) {
  return normalizeArg(value).replace(/^\/+/, '').replace(/\/+$/, '')
}

function joinUrl(base, path) {
  const encodedPath = encodePath(path)
  return encodedPath ? `${base}/${encodedPath}` : base
}

function buildAccessUrl(fileUrl, username, password) {
  if (!username && !password) return fileUrl

  const parsed = new URL(fileUrl)
  const credentials = `${encodeURIComponent(username)}:${encodeURIComponent(password)}`
  return `${parsed.protocol}//${credentials}@${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`
}

function encodePath(path) {
  return path.split('/').filter(Boolean).map(encodePathSegment).join('/')
}

function encodePathSegment(segment) {
  try {
    return encodeURIComponent(decodeURIComponent(segment))
  } catch (e) {
    return encodeURIComponent(segment)
  }
}

function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment)
  } catch (e) {
    return segment
  }
}

function normalizeArg(value) {
  return value == null ? '' : String(value).trim()
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || []))
}

function buildHeaders(username, password, extra = {}) {
  const headers = { ...extra }
  if (username || password) {
    headers.Authorization = `Basic ${ProxyUtils.Base64.encode(`${username}:${password}`)}`
  }
  return headers
}

function shouldTryCreateFolder($, res) {
  return $.env.isNode && isClientErrorStatus(getStatusCode(res))
}

function isClientErrorStatus(statusCode) {
  return statusCode >= 400 && statusCode < 500
}

function assertSuccess($, res, actionName) {
  const statusCode = getStatusCode(res)
  if (statusCode >= 200 && statusCode < 300) return

  if (isClientErrorStatus(statusCode) && !$.env.isNode) {
    throw new Error(`${actionName}失败, 状态码: ${statusCode}. WebDAV 目录可能不存在, 当前环境不支持自动创建目录, 请手动创建目录或检查 WebDAV 设置是否正确`)
  }

  if (isClientErrorStatus(statusCode)) {
    throw responseError(res, `${actionName}失败, 请手动创建目录或检查 WebDAV 设置是否正确`)
  }

  throw responseError(res, `${actionName}失败`)
}

function responseError(res, prefix) {
  const statusCode = getStatusCode(res)
  const body = typeof res?.body === 'string' ? res.body.trim() : ''
  const detail = body ? `\n${body.slice(0, 300)}` : ''
  return new Error(`${prefix}, 状态码: ${statusCode || 'unknown'}${detail}`)
}

function getStatusCode(res) {
  return Number(res?.statusCode || res?.status || 0)
}

function notify($, subtitle, message, clipboardText) {
  if ($.env.isSurge && typeof $notification !== 'undefined') {
    $notification.post(`🌍 Sub-Store`, subtitle, message, {
      action: 'clipboard',
      text: clipboardText,
    })
  } else {
    $.notify('🌍 Sub-Store', `${subtitle}: ${clipboardText || message}`)
  }
}

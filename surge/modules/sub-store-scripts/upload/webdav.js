/**
 * 使用 WebDAV 备份/恢复数据
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 *
 * 参数
 * - [base-url] WebDAV 基础地址/服务入口, 例如 https://dav.jianguoyun.com/dav
 * - [folder] WebDAV 备份目录, 例如 /sub-store、sub-store、/backups/sub-store、backups/sub-store. 若为 / 或不填, 表示直接使用 base-url
 * - [file] 文件名, 例如 backup.json. 目录请写在 folder, 不要写在 file
 * - [username] WebDAV 用户名
 * - [password] WebDAV 密码
 * - [action] 操作. upload 上传. download 下载. 默认 upload
 * - [type] 类型. data: Sub-Store 所有数据. 默认 data
 * - [keep] 下载恢复时保留本地字段, 多个路径用英文逗号分隔, 例如 settings.gistToken
 * - [age-public-key] age 加密公钥, 若设置了就会加密. 仅在上传时有效. 也可以不设置此项, 由后端从私钥推导公钥
 * - [age-secret-key] age 解密私钥, 若设置了就会解密. 上传时, 若未设置 age-public-key, 由后端从私钥推导公钥
 *
 * 这样拆分 base-url / folder / file 是为了减少 WebDAV 目录创建时的无效尝试:
 * base-url 通常是服务固定入口, 例如坚果云的 /dav, 不应该尝试创建;
 * 上传遇到 409 时, 脚本只解析 folder 并逐级创建 folder, 不会从 base-url 的路径开始创建;
 * folder 为 / 或不填时表示 base-url 已经是目标目录, 不会发起创建目录请求。
 */
const $ = $substore
const args = typeof $arguments === 'undefined' ? {} : $arguments

const action = normalizeArg(args.action || 'upload').toLowerCase()
const type = normalizeArg(args.type || 'data').toLowerCase()
const target = parseWebDavTarget(args)
const baseUrl = target.baseUrl
const folder = target.folder
const file = normalizeFileName(args.file)
const username = args.username == null ? target.username : String(args.username)
const password = args.password == null ? target.password : String(args.password)
const keep = normalizeArg(args.keep)
const agePublicKey = normalizeArg(args['age-public-key'])
const ageSecretKey = normalizeArg(args['age-secret-key'])

validateArgs()

const folderUrl = joinUrl(baseUrl, folder)
const fileUrl = joinUrl(folderUrl, file)

try {
  const result = action === 'upload' ? await uploadData() : await downloadData()
  const message = getSuccessMessage(result)
  $.info(message)
  notify('WebDAV', message)
  $content = getSuccessContent(result)
} catch (error) {
  const message = error?.message || `${error}`
  $.error(`WebDAV ${actionLabel(action)}失败: ${message}`)
  notify('WebDAV', `${actionLabel(action)}失败: ${message}`)
  $content = `WebDAV ${actionLabel(action)}失败\n\n${message}`
}

function validateArgs() {
  if (!baseUrl) throw new Error('请配置 WebDAV 基础地址 base-url')
  if (!file) throw new Error('请配置 WebDAV 文件名 file')
  if (file.includes('/')) {
    throw new Error('file 只填写文件名, 目录请写在 folder')
  }
  if (!['upload', 'download'].includes(action)) {
    throw new Error(`不支持的 action: ${action}`)
  }
  if (type !== 'data') {
    throw new Error(`暂不支持的 type: ${type}`)
  }
  if ((username && !password) || (!username && password)) {
    throw new Error('username 和 password 需要同时配置')
  }
}

async function uploadData() {
  const data = readCurrentData()
  let content = JSON.stringify(data, null, `  `)
  const publicKey = await getUploadPublicKey()
  const encrypted = Boolean(publicKey)

  if (encrypted) {
    $.info('使用 age 加密 WebDAV 备份内容')
    content = await ProxyUtils.age.encrypt(content, publicKey)
  }

  let res = await putContent(content, encrypted)
  if (getStatusCode(res) === 409 && $.env.isNode) {
    $.info('WebDAV 父目录不存在, 尝试自动创建目录')
    await ensureFolderCollections(baseUrl, folder)
    res = await putContent(content, encrypted)
  }
  assertSuccess(res, '上传 WebDAV 备份')
  return res
}

async function downloadData() {
  const res = await $.http.get({
    url: fileUrl,
    headers: buildHeaders({
      Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
    }),
  })
  assertSuccess(res, '下载 WebDAV 备份')

  let content = res.body || ''
  if (ageSecretKey) {
    $.info('使用 age 解密私钥解密')
    content = await ProxyUtils.age.decrypt(content, ageSecretKey)
  }

  const currentData = readCurrentData()
  const data = parseBackupData(content)
  applyKeepFields(data, currentData)
  restoreData(data)
  return res
}

async function putContent(content, encrypted) {
  return await $.http.put({
    url: fileUrl,
    headers: buildHeaders({
      'Content-Type': encrypted ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    }),
    body: content,
  })
}

async function getUploadPublicKey() {
  if (agePublicKey) return agePublicKey
  if (!ageSecretKey) return ''

  $.info('未配置 age-public-key, 尝试从 age-secret-key 推导公钥')
  return await ProxyUtils.age.derivePublicKey(ageSecretKey)
}

function readCurrentData() {
  if ($.env.isNode) return clone($.cache || {})

  const raw = $.read('#sub-store')
  if (!raw) return {}
  if (typeof raw === 'object') return clone(raw)
  return JSON.parse(raw)
}

function restoreData(data) {
  const content = JSON.stringify(data, null, `  `)
  $.write(content, '#sub-store')
  if ($.env.isNode) {
    $.cache = data
    $.persistCache()
  }
  if (typeof migrate === 'function') {
    $.info('执行恢复后的数据迁移')
    migrate()
  }
}

function parseBackupData(content) {
  const text = typeof content === 'string' ? content : `${content || ''}`
  try {
    const data = JSON.parse(ProxyUtils.Base64.decode(text))
    assertBackupData(data)
    return data
  } catch (base64Error) {
    try {
      const data = JSON.parse(text)
      assertBackupData(data)
      return data
    } catch (jsonError) {
      $.error(`备份文件校验失败, 无法还原\nReason: ${jsonError?.message ?? jsonError}`)
      throw new Error('备份文件校验失败, 无法还原')
    }
  }
}

function assertBackupData(content) {
  if (!isPlainObject(content) || !isPlainObject(content.settings)) {
    throw new Error('备份文件应该至少包含 settings 字段')
  }
}

async function ensureFolderCollections(baseUrl, folderPath) {
  for (const current of getCollectionUrls(baseUrl, folderPath)) {
    $.info(`创建 WebDAV 目录: ${current}`)
    const res = await $.http.request({
      method: 'MKCOL',
      url: current,
      headers: buildHeaders(),
    })
    const statusCode = getStatusCode(res)
    if ((statusCode >= 200 && statusCode < 300) || statusCode === 405) {
      continue
    }
    throw responseError(res, `创建 WebDAV 目录失败`)
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

function applyKeepFields(data, currentData) {
  if (!keep) return

  keep
    .split(',')
    .map(path => path.trim())
    .filter(Boolean)
    .forEach(path => {
      const value = getByPath(currentData, path)
      if (typeof value !== 'undefined') {
        setByPath(data, path, value)
      }
    })
}

function buildHeaders(extra = {}) {
  const headers = { ...extra }
  if (username || password) {
    headers.Authorization = `Basic ${ProxyUtils.Base64.encode(`${username}:${password}`)}`
  }
  return headers
}

function assertSuccess(res, actionName) {
  const statusCode = getStatusCode(res)
  if (statusCode >= 200 && statusCode < 300) return

  if (statusCode === 409 && !$.env.isNode) {
    throw new Error(`${actionName}失败, 状态码: 409. WebDAV 父目录可能不存在, 当前环境不支持自动创建目录, 请先手动创建`)
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

function notify(subtitle, message) {
  if ($.env.isSurge && typeof $notification !== 'undefined') {
    $notification.post('🌍 Sub-Store', subtitle, message)
  } else {
    $.notify('🌍 Sub-Store', `${subtitle}: ${message}`)
  }
}

function actionLabel(value) {
  return value === 'download' ? '下载' : '上传'
}

function getSuccessMessage(res) {
  const statusCode = getStatusCode(res)
  if (action === 'download') {
    return `已恢复 ⚠️ 请刷新页面, 状态码: ${statusCode}`
  }
  return `已上传, 状态码: ${statusCode}`
}

function getSuccessContent(res) {
  const statusCode = getStatusCode(res)
  if (action === 'download') {
    return `WebDAV 已恢复 ⚠️ 请刷新页面\n\n状态码: ${statusCode}`
  }
  return `WebDAV 已上传\n\n状态码: ${statusCode}`
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
  return JSON.parse(JSON.stringify(value || {}))
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  )
}

function toPath(path) {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
}

function getByPath(value, path) {
  return toPath(path).reduce((acc, key) => {
    if (acc == null) return undefined
    return acc[key]
  }, value)
}

function setByPath(target, path, value) {
  const keys = toPath(path)
  const lastKey = keys.pop()
  if (!lastKey) return

  const parent = keys.reduce((acc, key, index) => {
    if (!isPlainObject(acc[key]) && !Array.isArray(acc[key])) {
      acc[key] = /^\d+$/.test(keys[index + 1]) ? [] : {}
    }
    return acc[key]
  }, target)
  parent[lastKey] = value
}

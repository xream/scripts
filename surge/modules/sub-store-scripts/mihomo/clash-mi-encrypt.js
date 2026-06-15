/*
 * ClashMi encrypted profile output for Sub-Store file script.
 *
 * 参数:
 * - password / pwd / key / decryptPassword / decrypt_password: ClashMi 里填写的解密密码
 *
 * 加密格式与 ClashMi ProfileDecryptUtils 保持一致:
 * - AES-128-CBC + PKCS7
 * - key = MD5(password) 的 16 字节 digest
 * - output = Base64(16 字节 IV + ciphertext)
 * - 响应头 subscription-encryption: true
 */

const content = $content ?? $files[0]
const password = getPassword()

if (!password) {
  throw new Error('缺少 password 参数')
}

if (content == null || String(content).length === 0) {
  throw new Error('无输入内容: $content 和 $files[0] 均为空')
}

$content = encryptClashMiProfile(password, String(content))
$options = markSubscriptionEncrypted($options)

function encryptClashMiProfile(password, plaintext) {
  const crypto = require('crypto')
  const key = crypto.createHash('md5').update(String(password), 'utf8').digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()])

  return Buffer.concat([iv, ciphertext]).toString('base64')
}

function getPassword() {
  const args = parseMaybeObject(typeof $arguments === 'undefined' ? undefined : $arguments)
  const options = parseMaybeObject(typeof $options === 'undefined' ? undefined : $options)
  return getFirstValue([args, options], ['password', 'pwd', 'key', 'decryptPassword', 'decrypt_password'])
}

function markSubscriptionEncrypted(options) {
  const next = options && typeof options === 'object' ? options : {}
  next._res = next._res && typeof next._res === 'object' ? next._res : {}
  next._res.headers = next._res.headers && typeof next._res.headers === 'object' ? next._res.headers : {}
  next._res.headers['subscription-encryption'] = 'true'
  return next
}

function getFirstValue(sources, names) {
  for (const source of sources) {
    if (!source || typeof source !== 'object') {
      continue
    }
    for (const name of names) {
      if (Object.prototype.hasOwnProperty.call(source, name) && source[name] != null && String(source[name]) !== '') {
        return source[name]
      }
    }
  }
  return ''
}

function parseMaybeObject(value) {
  if (!value) {
    return {}
  }
  if (typeof value === 'object') {
    return value
  }

  const text = String(value).trim()
  if (!text) {
    return {}
  }

  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (_) {}

  const out = {}
  text.split('&').forEach(pair => {
    const index = pair.indexOf('=')
    if (index <= 0) {
      return
    }
    const key = decodeURIComponent(pair.slice(0, index).replace(/\+/g, ' '))
    const val = decodeURIComponent(pair.slice(index + 1).replace(/\+/g, ' '))
    out[key] = val
  })
  return out
}

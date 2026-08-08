/* 
  Sub-Store 对接 NodeGet 服务器流量信息
  https://t.me/zhetengsha/5921
*/
const TEXT_HEADERS = { 'content-type': 'text/plain; charset=utf-8' }
const SUMMARY_FIELDS = ['total_received', 'total_transmitted']
const BASELINE_CONCURRENCY = 6

function textResponse(body, status = 200) {
  return new Response(body, { status, headers: TEXT_HEADERS })
}

function fail(status, message) {
  return textResponse(`error=${sanitizeOutputValue(message)}\n`, status)
}

function firstParam(searchParams, names) {
  for (const name of names) {
    const value = searchParams.get(name)
    if (value !== null && value !== '') {
      return value
    }
  }
  return null
}

function parseBytes(raw, fieldName, fallback) {
  if (raw === null || raw === undefined || raw === '') {
    return fallback
  }

  const text = String(raw).trim()
  const match = text.match(/^(\d+(?:\.\d+)?)\s*(b|kb|kib|mb|mib|gb|gib|tb|tib)?$/i)
  if (!match) {
    throw new Error(`${fieldName} must be bytes or a number with KB/MB/GB/TB suffix`)
  }

  const value = Number(match[1])
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative number`)
  }

  const unit = (match[2] || 'b').toLowerCase()
  const multipliers = {
    b: 1,
    kb: 1000,
    kib: 1024,
    mb: 1000 ** 2,
    mib: 1024 ** 2,
    gb: 1000 ** 3,
    gib: 1024 ** 3,
    tb: 1000 ** 4,
    tib: 1024 ** 4,
  }

  const bytes = Math.floor(value * multipliers[unit])
  if (!Number.isSafeInteger(bytes)) {
    throw new Error(`${fieldName} is too large`)
  }

  return bytes
}

function parseResetDay(raw, fallback = 1) {
  if (raw === null || raw === undefined || raw === '') {
    return fallback
  }

  const resetDay = Number(String(raw).trim())
  if (!Number.isInteger(resetDay) || resetDay < 1 || resetDay > 31) {
    throw new Error('resetDay must be an integer from 1 to 31')
  }

  return resetDay
}

function parseCycleDays(raw) {
  const cycleDays = Number.parseInt(String(raw), 10)
  if (!Number.isInteger(cycleDays) || cycleDays <= 0) {
    throw new Error('cycleDays must be a positive integer')
  }
  return cycleDays
}

function parseStartDate(raw) {
  const startDate = String(raw).trim()
  if (startDate === '' || Number.isNaN(Date.parse(startDate))) {
    throw new Error('startDate is invalid')
  }
  return startDate
}

function parseRequiredName(url) {
  const name = firstParam(url.searchParams, ['name'])
  if (name === null || name.trim() === '') {
    throw new Error('name query parameter is required')
  }
  return name.trim()
}

function parseRequestOptions(url, env) {
  const totalRaw = firstParam(url.searchParams, ['total', 'total_bytes', 'quota'])
  const resetDayRaw = firstParam(url.searchParams, ['resetDay', 'reset_day'])
  const envResetDay = env && (env.resetDay ?? env.reset_day)
  const startDateRaw = firstParam(url.searchParams, ['startDate', 'start_date'])
  const envStartDate = env && (env.startDate ?? env.start_date)
  const cycleDaysRaw = firstParam(url.searchParams, ['cycleDays', 'cycle_days'])
  const envCycleDays = env && (env.cycleDays ?? env.cycle_days)
  const startDate = startDateRaw ?? envStartDate ?? null
  const cycleDays = cycleDaysRaw ?? envCycleDays ?? null

  if ((startDate === null) !== (cycleDays === null)) {
    throw new Error('startDate and cycleDays must be provided together')
  }

  return {
    name: parseRequiredName(url),
    total: parseBytes(totalRaw, 'total', totalRaw === null ? parseBytes(env && env.total, 'env.total', 0) : 0),
    cycle:
      startDate !== null
        ? {
            type: 'fixed',
            startDate: parseStartDate(startDate),
            cycleDays: parseCycleDays(cycleDays),
          }
        : {
            type: 'monthly',
            resetDay: parseResetDay(resetDayRaw, resetDayRaw === null ? parseResetDay(envResetDay, 1) : 1),
          },
  }
}

function errorStatus(error) {
  const message = error && error.message ? error.message : String(error)
  if (/^(total|env\.total|resetDay|env\.resetDay|reset_day|env\.reset_day|startDate|cycleDays|name)\b/.test(message)) {
    return 400
  }
  if (/^server name not found\b/.test(message)) {
    return 404
  }
  if (/^multiple servers matched\b/.test(message)) {
    return 409
  }
  return 500
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function monthResetDate(year, month, resetDay) {
  return new Date(year, month, resetDay, 0, 0, 0, 0)
}

function currentCycle(now, resetDay) {
  const thisReset = monthResetDate(now.getFullYear(), now.getMonth(), resetDay)

  if (now >= thisReset) {
    return {
      startMs: thisReset.getTime(),
      endMs: monthResetDate(now.getFullYear(), now.getMonth() + 1, resetDay).getTime(),
    }
  }

  return {
    startMs: monthResetDate(now.getFullYear(), now.getMonth() - 1, resetDay).getTime(),
    endMs: thisReset.getTime(),
  }
}

function remainingDaysUntilReset(now, resetDay) {
  const today = now.getDate()
  const month = now.getMonth()
  const year = now.getFullYear()
  const daysInCurrentMonth = resetDay > today ? 0 : daysInMonth(year, month)
  return daysInCurrentMonth - today + resetDay
}

function localMidnight(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date, days) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function fixedCycle(now, startDate, cycleDays) {
  const start = localMidnight(new Date(startDate))
  const today = localMidnight(now)
  if (start.getTime() > today.getTime()) {
    throw new Error('startDate must be earlier than now')
  }

  let end = new Date(startDate)
  end.setDate(end.getDate() + cycleDays)
  while (end < today) {
    end.setDate(end.getDate() + cycleDays)
  }
  end.setHours(0, 0, 0, 0)

  const startOfCycle = addDays(end, -cycleDays)
  startOfCycle.setHours(0, 0, 0, 0)
  const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24))

  return {
    startMs: startOfCycle.getTime(),
    endMs: end.getTime(),
    remainingDays,
  }
}

function resolveCycle(now, cycle) {
  if (cycle.type === 'fixed') {
    return fixedCycle(now, cycle.startDate, cycle.cycleDays)
  }

  const { startMs, endMs } = currentCycle(now, cycle.resetDay)
  return {
    startMs,
    endMs,
    remainingDays: remainingDaysUntilReset(now, cycle.resetDay),
  }
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function timezoneOffset(date) {
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absolute = Math.abs(offsetMinutes)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60
  return `${sign}${pad2(hours)}:${pad2(minutes)}`
}

function formatLocalDateTime(ms) {
  const date = new Date(ms)
  return [
    date.getFullYear(),
    '-',
    pad2(date.getMonth() + 1),
    '-',
    pad2(date.getDate()),
    'T',
    pad2(date.getHours()),
    ':',
    pad2(date.getMinutes()),
    ':',
    pad2(date.getSeconds()),
    timezoneOffset(date),
  ].join('')
}

function formatRange(startMs, endMs) {
  return `${formatLocalDateTime(startMs)}~${formatLocalDateTime(endMs)}`
}

async function callNodeget(method, params) {
  const response = await nodeget(method, params)
  if (response && response.error) {
    const message = response.error.message || JSON.stringify(response.error)
    throw new Error(`${method}: ${message}`)
  }
  return response ? response.result : undefined
}

function tokenFromEnv(env) {
  const token = env && (env.token || env.nodeget_token || env.NODEGET_TOKEN)
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('missing env.token')
  }
  return token.trim()
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

async function listUuids(token) {
  const result = await callNodeget('agent-uuid_list_all', { token })
  return toArray(result).filter(uuid => typeof uuid === 'string' && uuid.length > 0)
}

async function queryMetadataNames(token, uuids) {
  if (uuids.length === 0) {
    return new Map()
  }

  const rows = toArray(
    await callNodeget('kv_get_multi_value', {
      token,
      namespace_key: uuids.map(uuid => ({
        namespace: uuid,
        key: 'metadata_name',
      })),
    })
  )

  const names = new Map()
  for (const row of rows) {
    if (!row || typeof row.namespace !== 'string' || row.key !== 'metadata_name') {
      continue
    }
    const name = stringOrNull(row.value)
    if (name !== null) {
      names.set(row.namespace, name)
    }
  }
  return names
}

function findUuidByName(names, requestedName) {
  const matches = []
  for (const [uuid, name] of names.entries()) {
    if (name === requestedName) {
      matches.push(uuid)
    }
  }

  if (matches.length === 0) {
    throw new Error(`server name not found: ${requestedName}`)
  }
  if (matches.length > 1) {
    throw new Error(`multiple servers matched name: ${requestedName}`)
  }

  return matches[0]
}

function stringOrNull(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

async function queryLatestSummaries(token, uuids) {
  if (uuids.length === 0) {
    return new Map()
  }

  const rows = toArray(
    await callNodeget('agent_dynamic_summary_multi_last_query', {
      token,
      uuids,
      fields: SUMMARY_FIELDS,
    })
  )

  const latest = new Map()
  for (const row of rows) {
    if (row && typeof row.uuid === 'string') {
      latest.set(row.uuid, row)
    }
  }
  return latest
}

async function queryBaselineSummary(token, uuid, startMs) {
  const beforeRows = await queryDynamicSummary(token, uuid, [{ uuid }, { timestamp_to: startMs }, { limit: 1 }])
  if (beforeRows.length > 0) {
    return beforeRows[0]
  }

  const afterRows = await queryDynamicSummary(token, uuid, [{ uuid }, { timestamp_from: startMs }])
  return afterRows.length > 0 ? afterRows[0] : null
}

async function queryDynamicSummary(token, uuid, condition) {
  const result = await callNodeget('agent_query_dynamic_summary', {
    token,
    query: {
      fields: SUMMARY_FIELDS,
      condition,
    },
  })

  return toArray(result).filter(row => row && row.uuid === uuid)
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index], index)
    }
  }

  const workerCount = Math.min(limit, items.length)
  const workers = []
  for (let i = 0; i < workerCount; i += 1) {
    workers.push(worker())
  }
  await Promise.all(workers)
  return results
}

async function queryBaselines(token, uuids, startMs) {
  const pairs = await mapLimit(uuids, BASELINE_CONCURRENCY, async uuid => [
    uuid,
    await queryBaselineSummary(token, uuid, startMs),
  ])
  return new Map(pairs)
}

function numericField(row, field) {
  if (!row || row[field] === null || row[field] === undefined) {
    return null
  }

  const value = Number(row[field])
  return Number.isFinite(value) ? value : null
}

function trafficDelta(latest, baseline, field) {
  const latestValue = numericField(latest, field)
  if (latestValue === null || latestValue < 0) {
    return 0
  }

  const baselineValue = numericField(baseline, field)
  if (baselineValue === null || baselineValue < 0) {
    return 0
  }

  const delta = latestValue - baselineValue
  if (delta >= 0) {
    return Math.floor(delta)
  }

  return Math.floor(Math.max(latestValue, 0))
}

function sanitizeOutputValue(value) {
  return String(value)
    .replace(/[;\r\n]/g, ' ')
    .trim()
}

function lineForUuid(uuid, name, latest, baseline, total, remainingDays, range) {
  const upload = trafficDelta(latest, baseline, 'total_transmitted')
  const download = trafficDelta(latest, baseline, 'total_received')
  return [
    // `name=${sanitizeOutputValue(name || uuid)}`,
    // `uuid=${sanitizeOutputValue(uuid)}`,
    `upload=${upload}`,
    `download=${download}`,
    `total=${total}`,
    `reset_day=${remainingDays}`,
    // `range=${range}`,
  ].join('; ')
}

export default {
  async onRoute(request, env) {
    try {
      const url = new URL(request.url)
      const token = tokenFromEnv(env)
      const { name, total, cycle } = parseRequestOptions(url, env)
      const now = new Date()
      const { startMs, endMs, remainingDays } = resolveCycle(now, cycle)
      const range = formatRange(startMs, endMs)

      const uuids = await listUuids(token)
      const names = await queryMetadataNames(token, uuids)
      const uuid = findUuidByName(names, name)
      const [latest, baselines] = await Promise.all([
        queryLatestSummaries(token, [uuid]),
        queryBaselines(token, [uuid], startMs),
      ])

      const body = lineForUuid(uuid, name, latest.get(uuid), baselines.get(uuid), total, remainingDays, range)

      return textResponse(body.length > 0 ? `${body}\n` : '')
    } catch (error) {
      return fail(errorStatus(error), error)
    }
  },
}

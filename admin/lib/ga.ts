import crypto from 'crypto'

// Cliente del GA4 Data API para el admin. Auth con service account
// (JWT RS256 firmado con node:crypto → access token), sin SDK externo.
// Server-only. Requiere env: GA_SA_CLIENT_EMAIL, GA_SA_PRIVATE_KEY.

const PROPERTY = process.env.GA_PROPERTY_ID || '540275671'
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'

let cache: { token: string; exp: number } | null = null

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

async function getToken(): Promise<string> {
  if (cache && Date.now() < cache.exp - 60_000) return cache.token

  const email = process.env.GA_SA_CLIENT_EMAIL
  const key = process.env.GA_SA_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !key) throw new Error('GA_CREDS_MISSING')

  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const data = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify(claims))}`
  const sig = crypto.sign('RSA-SHA256', Buffer.from(data), key).toString('base64url')
  const jwt = `${data}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    cache: 'no-store',
  })
  const j = await res.json()
  if (!j.access_token) throw new Error('GA_TOKEN_FAIL: ' + JSON.stringify(j))
  cache = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 }
  return cache.token
}

async function runReport(body: unknown): Promise<any> {
  const token = await getToken()
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )
  const j = await res.json()
  if (j.error) throw new Error('GA_API: ' + j.error.message)
  return j
}

async function scalar(startDate: string, metric: string): Promise<number> {
  const j = await runReport({ dateRanges: [{ startDate, endDate: 'today' }], metrics: [{ name: metric }] })
  return Number(j.rows?.[0]?.metricValues?.[0]?.value || 0)
}

async function ctaCount(startDate: string): Promise<number> {
  const j = await runReport({
    dateRanges: [{ startDate, endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'cta_app_click' } } },
  })
  return Number(j.rows?.[0]?.metricValues?.[0]?.value || 0)
}

export type GAData = {
  views7: number
  views28: number
  viewsTotal: number
  users28: number
  sessions28: number
  cta7: number
  cta28: number
  topPages: { path: string; views: number }[]
}

export async function getAnalytics(): Promise<GAData> {
  const [views7, views28, viewsTotal, users28, sessions28, cta7, cta28, top] = await Promise.all([
    scalar('6daysAgo', 'screenPageViews'),
    scalar('27daysAgo', 'screenPageViews'),
    scalar('2020-01-01', 'screenPageViews'),
    scalar('27daysAgo', 'activeUsers'),
    scalar('27daysAgo', 'sessions'),
    ctaCount('6daysAgo'),
    ctaCount('27daysAgo'),
    runReport({
      dateRanges: [{ startDate: '27daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 6,
    }),
  ])
  const topPages = (top.rows || []).map((r: any) => ({
    path: r.dimensionValues[0].value,
    views: Number(r.metricValues[0].value),
  }))
  return { views7, views28, viewsTotal, users28, sessions28, cta7, cta28, topPages }
}

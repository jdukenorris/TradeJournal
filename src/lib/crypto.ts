import crypto from 'crypto'

const DEFAULT_EXP_SECONDS = 5 * 60

function getSecret(): string {
  const secret = process.env.DEVICE_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Missing DEVICE_TOKEN_SECRET')
  return secret
}

export function signPayload(payload: object, expSeconds = DEFAULT_EXP_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + expSeconds, nbf: now }
  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const unsigned = `${encode(header)}.${encode(body)}`
  const hmac = crypto.createHmac('sha256', getSecret()).update(unsigned).digest('base64url')
  return `${unsigned}.${hmac}`
}

export function verifyAndDecode(token: string): any | null {
  const [h, b, sig] = token.split('.')
  if (!h || !b || !sig) return null
  const expected = crypto.createHmac('sha256', getSecret()).update(`${h}.${b}`).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
  const body = JSON.parse(Buffer.from(b, 'base64url').toString())
  const now = Math.floor(Date.now() / 1000)
  if (body.exp && now > body.exp) return null
  if (body.nbf && now < body.nbf) return null
  return body
}



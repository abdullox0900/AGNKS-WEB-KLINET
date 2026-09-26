// Dev-only utility: generates a validly-signed Telegram WebApp initData string
// for local browser testing, using the local TELEGRAM_CLIENT_BOT_TOKEN test token.
// Never use this against a production bot token.
import { createHmac } from 'node:crypto'

const BOT_TOKEN = process.env.BOT_TOKEN ?? '123456:TEST-TOKEN-FOR-LOCAL-DEV-ONLY'
const userId = process.argv[2] ?? '900000001'
const firstName = process.argv[3] ?? 'Test Client'

const user = JSON.stringify({ id: Number(userId), first_name: firstName, language_code: 'uz' })
const params = new URLSearchParams()
params.set('user', user)
params.set('auth_date', String(Math.floor(Date.now() / 1000)))
params.set('query_id', 'AAHdev' + userId)

const pairs = []
for (const [key, value] of params.entries()) pairs.push(`${key}=${value}`)
pairs.sort()
const dataCheckString = pairs.join('\n')

const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()
const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

params.set('hash', hash)
console.log(params.toString())

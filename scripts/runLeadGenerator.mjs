import fs from 'node:fs'

const BASE_URL = process.env.DEKES_BASE_URL || 'http://localhost:3002'
const credentials = {
  email: 'leadtester@dekes.com',
  password: 'StrongPass123!',
  name: 'Lead Tester',
  organizationName: 'Lead Org',
}

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i += 1) {
    const [key, value] = args[i].split('=')
    if (!key.startsWith('--')) continue
    const normalizedKey = key.replace(/^--/, '')
    const val = value ?? args[i + 1]
    if (value === undefined && args[i + 1] && !args[i + 1].startsWith('--')) {
      i += 1
    }
    options[normalizedKey] = val
  }

  return {
    label: (options.label || 'run').replace(/[^a-z0-9-_]/gi, '_').toLowerCase(),
    query:
      options.query || 'find B2B SaaS founders in Austin who recently raised seed',
    estimatedResults: Number(options.estimatedResults || options.results || 100),
    carbonBudget: Number(options.carbonBudget || options.carbon || 10000),
    regions: options.regions ? options.regions.split(',').map((r) => r.trim()) : ['US-CAL-CISO', 'FR', 'DE'],
  }
}

const runOptions = parseArgs()

async function jsonFetch(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, init)
  let data = null
  try {
    data = await res.json()
  } catch (err) {
    const text = await res.text().catch(() => '')
    throw new Error(`Non-JSON response (${res.status}): ${text}`)
  }
  if (!res.ok) {
    const reason = data?.error || JSON.stringify(data)
    throw new Error(`Request to ${path} failed (${res.status}): ${reason}`)
  }
  return data
}

async function ensureSessionToken() {
  try {
    const data = await jsonFetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    return data.token
  } catch (err) {
    if (!/Email already registered/i.test(err.message)) throw err
    const data = await jsonFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    })
    return data.token
  }
}

async function runLeads(token) {
  const body = {
    query: runOptions.query,
    estimatedResults: runOptions.estimatedResults,
    carbonBudget: runOptions.carbonBudget,
    regions: runOptions.regions,
  }
  const data = await jsonFetch('/api/leads/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  return data
}

async function listLeads(token) {
  const data = await jsonFetch('/api/leads', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data.leads || []
}

async function main() {
  const token = await ensureSessionToken()
  fs.writeFileSync('session_token.txt', token)
  console.log(`[${runOptions.label}] Session token acquired`)

  const runResult = await runLeads(token)
  fs.writeFileSync(`run_result_${runOptions.label}.json`, JSON.stringify(runResult, null, 2))
  console.log(`[${runOptions.label}] Lead generator run complete:`, runResult.run)

  const leads = await listLeads(token)
  fs.writeFileSync(
    `leads_snapshot_${runOptions.label}.json`,
    JSON.stringify(leads, null, 2)
  )
  console.log(`[${runOptions.label}] Total leads returned: ${leads.length}`)
}

main().catch((err) => {
  console.error('Lead generator automation failed:', err)
  process.exit(1)
})

// src/supabaseClient.js
// This file creates a single connection to our Supabase database.
// We import this wherever we need to read or write data.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel dashboard.')
}

const RETRYABLE_STATUS = new Set([502, 503, 504, 520])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(input, init = {}) {
  const method = String(init?.method || 'GET').toUpperCase()
  const isRetryableMethod = method === 'GET' || method === 'HEAD'
  const maxAttempts = isRetryableMethod ? 3 : 1
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(input, init)
      if (!isRetryableMethod || !RETRYABLE_STATUS.has(response.status) || attempt === maxAttempts) {
        return response
      }
    } catch (error) {
      lastError = error
      if (!isRetryableMethod || attempt === maxAttempts) throw error
    }

    await sleep(250 * attempt)
  }

  throw lastError || new Error('Request failed')
}

export function isServiceUnavailableError(error) {
  const status = Number(error?.status || error?.response?.status)
  if ([502, 503, 504, 520].includes(status)) return true

  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('520') ||
    message.includes('failed to fetch') ||
    message.includes('service unavailable') ||
    message.includes('bad gateway') ||
    message.includes('gateway timeout')
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithRetry },
})

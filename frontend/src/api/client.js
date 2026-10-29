export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors || null
  }
}

function getCookie(name) {
  const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

// The backend sets the XSRF-TOKEN cookie when we call /api/auth/csrf
async function ensureCsrfCookie() {
  if (!getCookie('XSRF-TOKEN')) {
    await fetch('/api/auth/csrf', { credentials: 'same-origin' })
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (method !== 'GET') {
    await ensureCsrfCookie()
    const token = getCookie('XSRF-TOKEN')
    if (token) headers['X-XSRF-TOKEN'] = token
  }

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // response had no JSON body
  }

    if (!response.ok) {
    const message =
      data?.detail || data?.message || data?.error ||
      (response.status === 403 ? 'Security token problem (HTTP 403). Refresh the page and try again.'
        : response.status === 401 ? 'Please log in again (HTTP 401).'
        : `Request failed (HTTP ${response.status})`)
    throw new ApiError(response.status, message, data?.errors)
  }
  return data
}
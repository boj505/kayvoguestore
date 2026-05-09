const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Cache configuration
const CACHE_PREFIX = 'wc_cache_v1:'
const CACHE_TTL_MS = Number(import.meta.env.VITE_WC_CACHE_TTL_MS) || 1000 * 60 * 30 // 30 minutes

const getHeaders = () => ({
  'Content-Type': 'application/json',
})

const getCache = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (!ts) return null
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return data
  } catch (err) {
    return null
  }
}

const setCache = (key, data) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }))
  } catch (err) {
    // ignore
  }
}

const buildKey = (prefix, params = {}) => {
  const q = new URLSearchParams(params).toString()
  return `${prefix}:${q || 'all'}`
}

// Fetch products — pass params like { per_page: 8, category: 12 }
export const fetchProducts = async (params = {}, { force = false } = {}) => {
  const cacheKey = buildKey('products', params)
  if (!force) {
    const cached = getCache(cacheKey)
    if (cached) return cached
  }

  const query = new URLSearchParams(params).toString()
  const url   = `${BASE_URL}/products${query ? `?${query}` : ''}`

  const response = await fetch(url, { headers: getHeaders() })
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  const data = await response.json()
  setCache(cacheKey, data)
  return data
}

// Fetch a single product by ID
export const fetchProduct = async (id, { force = false } = {}) => {
  const cacheKey = `product:${id}`
  if (!force) {
    const cached = getCache(cacheKey)
    if (cached) return cached
  }
  const response = await fetch(`${BASE_URL}/products/${id}`, { headers: getHeaders() })
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  const data = await response.json()
  setCache(cacheKey, data)
  return data
}

// Fetch categories — used by the tab filter
export const fetchCategories = async (params = {}, { force = false } = {}) => {
  const cacheKey = buildKey('categories', params)
  if (!force) {
    const cached = getCache(cacheKey)
    if (cached) return cached
  }

  const query = new URLSearchParams(params).toString()
  const url   = `${BASE_URL}/products/categories${query ? `?${query}` : ''}`

  const response = await fetch(url, { headers: getHeaders() })
  if (!response.ok) throw new Error(`Error: ${response.status}`)
  const data = await response.json()
  setCache(cacheKey, data)
  return data
}

export const clearWcCache = (pattern) => {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(CACHE_PREFIX) && (!pattern || k.includes(pattern))) {
        localStorage.removeItem(k)
      }
    })
  } catch (err) {
    // ignore
  }
}
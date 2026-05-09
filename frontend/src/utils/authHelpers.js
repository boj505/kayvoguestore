export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const normalizeEmail = (email) => email.trim().toLowerCase()
export const normalizeName = (name) => name.trim().toLowerCase()

export const findUserByEmail = (email) => {
  const savedUsers = JSON.parse(localStorage.getItem('kv_users') || '[]')
  return savedUsers.find((user) => user.email === normalizeEmail(email))
}

export const findUserByName = (name) => {
  const savedUsers = JSON.parse(localStorage.getItem('kv_users') || '[]')
  const normalized = normalizeName(name)
  return savedUsers.find((user) => normalizeName(user.name) === normalized)
}

export const getSavedUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('kv_users') || '[]')
  } catch (error) {
    return []
  }
}

export const saveUsers = (users) => {
  localStorage.setItem('kv_users', JSON.stringify(users))
}

export const generateAuthToken = () =>
  crypto.randomUUID?.() || `token-${Date.now()}-${Math.random().toString(36).slice(2)}`

export const validateEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

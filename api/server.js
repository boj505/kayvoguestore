const express = require('express')
const axios = require('axios')
const cors = require('cors')
const dotenv = require('dotenv')
const https = require('https')
const path = require('path')
const fs = require('fs')

const app = express()

const envPath = path.resolve(__dirname, '.env')
dotenv.config({ path: envPath })

const {
  WC_URL,
  WC_KEY,
  WC_SECRET,
  WC_SKIP_TLS_VERIFY,
  WP_URL,
  WP_USER,
  WP_APP_PASSWORD,
  ALLOWED_ORIGIN = 'https://kayvoguestores.vercel.app',
  PORT = 3000,
} = process.env

const defaultSkipTls = process.env.NODE_ENV !== 'production' ? 'true' : 'false'
const skipTlsVerify = WC_SKIP_TLS_VERIFY ?? defaultSkipTls

const BASE_URL = WC_URL?.replace(/\/$/, '')
const WP_BASE_URL = WP_URL?.replace(/\/$/, '')
const auth = {
  username: WC_KEY || '',
  password: WC_SECRET || '',
}

if (!BASE_URL || !auth.username || !auth.password) {
  console.warn(
    'Warning: WooCommerce env vars are missing. Add WC_URL, WC_KEY, WC_SECRET to api/.env.'
  )
}

if (!WP_BASE_URL || !WP_APP_PASSWORD) {
  console.warn(
    'Warning: WordPress env vars are missing. Add WP_URL, WP_APP_PASSWORD to api/.env for password reset functionality.'
  )
}

if (!WP_USER) {
  console.warn(
    'Warning: WP_USER is not configured. Set the WordPress admin username for the application password in api/.env.'
  )
}

const axiosOptions = {
  auth,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: new https.Agent({ rejectUnauthorized: skipTlsVerify.toLowerCase() !== 'true' }),
}

const wpAxiosOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${WP_USER || 'admin'}:${WP_APP_PASSWORD}`).toString('base64')}`
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: skipTlsVerify.toLowerCase() !== 'true' }),
}

console.log('WooCommerce proxy config: skip TLS verify =', WC_SKIP_TLS_VERIFY)
console.log('WordPress auth configured:', !!WP_BASE_URL)

const allowedOrigins = [
  ALLOWED_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error('CORS policy violation'))
    },
  })
)
app.use(express.json({ limit: '25mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Auth routes for local authentication
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  // For local development, we'll simulate password reset by returning a success message
  // In a real application, this would send an email or use another verification method
  res.json({
    message: 'Password reset initiated. Check your account recovery options.',
    resetMethod: 'security_questions', // or 'sms', 'email', etc.
    email: email
  })
})

// Security questions based password reset
app.post('/api/auth/verify-security-answer', async (req, res) => {
  const { email, securityQuestion, securityAnswer } = req.body

  if (!email || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ message: 'Email, security question, and answer are required' })
  }

  // In a real app, you'd verify against stored security questions
  // For this demo, we'll accept any answer and generate a new password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let newPassword = ''
  for (let i = 0; i < 8; i++) {
    newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Hash the new password
  const encoder = new TextEncoder()
  const data = encoder.encode(newPassword)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const passwordHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  res.json({
    message: 'Security answer verified. New password generated.',
    newPassword: newPassword,
    passwordHash: passwordHash,
    email: email
  })
})

app.post('/api/auth/reset-password', async (req, res) => {
  const { password, email } = req.body

  if (!password || !email) {
    return res.status(400).json({ message: 'Password and email are required' })
  }

  try {
    // Hash the new password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const passwordHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    res.json({
      message: 'Password reset successfully',
      email: email,
      passwordHash: passwordHash
    })
  } catch (error) {
    console.error('Password reset error:', error.message)
    res.status(500).json({
      message: 'Unable to reset password'
    })
  }
})

const handleProxy = async (req, res, pathSuffix) => {
  if (!BASE_URL) {
    return res.status(500).json({ error: 'WooCommerce base URL is not configured.' })
  }

  try {
    const url = `${BASE_URL}${pathSuffix}`
    const response = await axios.get(url, {
      ...axiosOptions,
      params: req.query,
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: error.message }
    res.status(status).json(data)
  }
}
app.get('/api/products', async (req, res) => {
  if (!BASE_URL) {
    return res.status(500).json({ error: 'WooCommerce base URL is not configured.' })
  }

  try {
    const { search, ...rest } = req.query

    /* Normal product search first */
    let response = await axios.get(`${BASE_URL}/products`, {
      ...axiosOptions,
      params: {
        ...rest,
        ...(search ? { search } : {}),
      },
    })

    let products = response.data

    /* If no results, try category slug search */
    if (search && Array.isArray(products) && products.length === 0) {
      const catRes = await axios.get(`${BASE_URL}/products/categories`, {
        ...axiosOptions,
        params: {
          search,
          per_page: 20,
        },
      })

      const categories = catRes.data

      if (categories.length > 0) {
        const categoryIds = categories.map((cat) => cat.id).join(',')

        const secondRes = await axios.get(`${BASE_URL}/products`, {
          ...axiosOptions,
          params: {
            ...rest,
            category: categoryIds,
          },
        })

        products = secondRes.data
      }
    }

    res.json(products)
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: error.message }
    res.status(status).json(data)
  }
})
app.get('/api/products/categories', async (req, res) => handleProxy(req, res, '/products/categories'))
app.get('/api/products/:id', async (req, res) => handleProxy(req, res, `/products/${req.params.id}`))

app.get('/api/proxy-image', async (req, res) => {
  const { src } = req.query

  if (!src) {
    return res.status(400).json({ error: 'Missing src query parameter.' })
  }

  let imageUrl
  try {
    imageUrl = new URL(src)
  } catch (err) {
    return res.status(400).json({ error: 'Invalid image URL.' })
  }

  const baseOrigin = new URL(BASE_URL).origin
  if (imageUrl.origin !== baseOrigin) {
    return res.status(403).json({ error: 'Image host not allowed.' })
  }

  try {
    const response = await axios.get(imageUrl.href, {
      ...axiosOptions,
      responseType: 'stream',
    })

    res.setHeader('content-type', response.headers['content-type'] || 'application/octet-stream')
    if (response.headers['cache-control']) {
      res.setHeader('cache-control', response.headers['cache-control'])
    }

    response.data.pipe(res)
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: error.message }
    res.status(status).json(data)
  }
})

app.post('/api/orders', async (req, res) => {
  const {
    billing,
    shipping,
    line_items,
    payment_method,
    payment_method_title,
    customer_id,
    receiptBase64,
    receiptFilename,
  } = req.body

  if (!billing || !Array.isArray(line_items) || line_items.length === 0) {
    return res.status(400).json({ error: 'Invalid order payload. billing and line_items are required.' })
  }

  const orderPayload = {
    payment_method: payment_method || 'paystack',
    payment_method_title: payment_method_title || (payment_method === 'opay_transfer' ? 'OPay Transfer' : 'Paystack'),
    set_paid: payment_method !== 'opay_transfer',
    billing,
    shipping: shipping || billing,
    line_items,
  }

  if (payment_method === 'opay_transfer') {
    orderPayload.status = 'on-hold'
    orderPayload.customer_note = 'OPay transfer payment selected. Payment receipt has been uploaded for review.'
    orderPayload.meta_data = [
      { key: 'opay_payment_type', value: 'OPay Transfer' },
      { key: 'opay_receipt_filename', value: receiptFilename || 'Uploaded receipt' },
    ]
  }

  if (customer_id) {
    orderPayload.customer_id = customer_id
  }

  let receiptAbsoluteUrl = null

  if (receiptBase64 && receiptFilename) {
    try {
      const uploadsDir = path.join(__dirname, 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      const safeFilename = `${Date.now()}-${receiptFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = path.join(uploadsDir, safeFilename)
      const fileBuffer = Buffer.from(receiptBase64, 'base64')
      fs.writeFileSync(filePath, fileBuffer)

      const receiptUrl = `/uploads/${safeFilename}`
      receiptAbsoluteUrl = `${req.protocol}://${req.get('host')}${receiptUrl}`
      orderPayload.meta_data = orderPayload.meta_data || []
      orderPayload.meta_data.push({ key: 'opay_receipt_url', value: receiptAbsoluteUrl })
      orderPayload.meta_data.push({ key: 'opay_receipt_filename', value: safeFilename })
    } catch (writeError) {
      console.error('Failed to save receipt upload:', writeError)
    }
  }

  try {
    const response = await axios.post(`${BASE_URL}/orders`, orderPayload, axiosOptions)
    const createdOrder = response.data

    if (receiptAbsoluteUrl && createdOrder?.id) {
      try {
        await axios.post(
          `${BASE_URL}/orders/${createdOrder.id}/notes`,
          {
            note: `<p>OPay receipt uploaded for review.</p><img src="${receiptAbsoluteUrl}" alt="OPay receipt" style="max-width:100%;height:auto;" />`,
            customer_note: false,
          },
          axiosOptions
        )
      } catch (noteError) {
        console.error('Failed to add receipt note to WooCommerce order:', noteError)
      }
    }

    res.status(response.status).json(createdOrder)
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: error.message }
    res.status(status).json(data)
  }
})

app.get('/api/orders', async (req, res) => {
  const { email, customer_id, page = 1, per_page = 100 } = req.query

  const params = {
    page,
    per_page,
    orderby: 'date',
    order: 'desc',
  }

  if (customer_id) {
    params.customer = customer_id
  }

  if (email) {
    params.search = email
  }

  try {
    const response = await axios.get(`${BASE_URL}/orders`, {
      ...axiosOptions,
      params,
    })

    let orders = Array.isArray(response.data) ? response.data : []

    if (email) {
      const normalizedEmail = email.toLowerCase()
      orders = orders.filter(
        (order) =>
          order.billing?.email?.toLowerCase() === normalizedEmail ||
          order.customer_email?.toLowerCase() === normalizedEmail
      )
    }

    res.status(response.status).json(orders)
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: error.message }
    res.status(status).json(data)
  }
})

app.get('/api/orders/:id', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/orders/${req.params.id}`, axiosOptions)
    res.status(response.status).json(response.data)
  } catch (error) {
    const status = error.response?.status || 500
    const data = error.response?.data || { message: error.message }
    res.status(status).json(data)
  }
})

app.listen(PORT, () => {
  console.log(`WooCommerce proxy running on http://localhost:${PORT}`)
})

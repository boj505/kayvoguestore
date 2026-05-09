import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchProduct } from '../api/Woocommerce'

/* ─────────────────────────── helpers ─────────────────────────── */

const formatCurrency = (value) =>
  value != null ? `₦${Number(value).toLocaleString('en-NG')}` : '₦0'

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getImageSrc = (src) => {
  const placeholder = 'https://via.placeholder.com/120x120/f5f5f5/111111?text=+'
  if (!src) return placeholder
  if (typeof src === 'string')
    return src.startsWith('http')
      ? `/api/proxy-image?src=${encodeURIComponent(src)}`
      : src
  if (typeof src === 'object')
    return getImageSrc(src.src || src.url || src.source_url || src.image || src.media?.source_url)
  return placeholder
}

const STATUS_CONFIG = {
  completed:  { label: 'Completed',  dot: '#0d7a5f', bg: '#f0fdf4', text: '#0d7a5f' },
  processing: { label: 'Processing', dot: '#2563eb', bg: '#eff6ff', text: '#2563eb' },
  paid:       { label: 'Paid',       dot: '#0d7a5f', bg: '#f0fdf4', text: '#0d7a5f' },
  'on-hold':  { label: 'On Hold',    dot: '#b45309', bg: '#fffbeb', text: '#b45309' },
  pending:    { label: 'Pending',    dot: '#b45309', bg: '#fffbeb', text: '#b45309' },
  cancelled:  { label: 'Cancelled',  dot: '#dc2626', bg: '#fef2f2', text: '#dc2626' },
  failed:     { label: 'Failed',     dot: '#dc2626', bg: '#fef2f2', text: '#dc2626' },
}

const getStatus = (status = '') => {
  const key = status.toLowerCase()
  return STATUS_CONFIG[key] || { label: status || 'Pending', dot: '#9ca3af', bg: '#f9fafb', text: '#6b7280' }
}

const getItemImage = (item, products) => {
  const raw =
    item.image?.src ||
    item.image ||
    item.product?.images?.[0]?.src ||
    item.product?.image?.src ||
    products[item.product_id]?.images?.[0]?.src ||
    item.meta_data?.find((m) => m.key === 'image')?.value?.src ||
    item.meta_data?.find((m) => m.key === 'image')?.value
  return getImageSrc(raw)
}

const getItemMeta = (item, key) =>
  item.meta_data?.find((m) => m.key === key)?.value || ''

/* ─────────────────────────── CSS ─────────────────────────── */

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .anim-fade-up { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.15) both; }
  .delay-1 { animation-delay: .08s; }
  .delay-2 { animation-delay: .16s; }
  .delay-3 { animation-delay: .24s; }
  .delay-4 { animation-delay: .32s; }
  .delay-5 { animation-delay: .40s; }
  .shimmer-block {
    background: linear-gradient(90deg,#e2e8f0 25%,#f8fafc 50%,#e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  .order-card { transition: box-shadow 0.2s ease; }
  .order-card:hover { box-shadow: 0 8px 40px -12px rgba(15,23,42,0.18); }
  .item-row + .item-row { border-top: 1px solid rgba(0,0,0,.055); }
  .details-open  { display: block; }
  .details-close { display: none; }
`

/* ─────────────────────────── sub-components ─────────────────────────── */

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

const SkeletonCard = () => (
  <div className="bg-white border border-black/[0.07] p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="shimmer-block h-3 w-20 rounded" />
        <div className="shimmer-block h-6 w-32 rounded" />
      </div>
      <div className="shimmer-block h-6 w-20 rounded" />
    </div>
    <div className="flex gap-4 pt-2">
      <div className="shimmer-block w-16 h-16 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="shimmer-block h-4 w-3/4 rounded" />
        <div className="shimmer-block h-3 w-1/3 rounded" />
      </div>
    </div>
  </div>
)

/* ─────────────────────────── Order Card ─────────────────────────── */

const OrderCard = ({ order, products, index }) => {
  const [expanded, setExpanded] = useState(false)
  const items = order.line_items || order.orderItems || []

  const subtotal =
    order.subtotal != null
      ? Number(order.subtotal)
      : Number(order.total || 0) - Number(order.shipping_total || 0) - Number(order.total_tax || 0)

  const shippingTotal =
    order.shipping_total != null ? Number(order.shipping_total) :
    order.shippingFee    != null ? Number(order.shippingFee)    : 0

  const billingName = [
    order.billing?.first_name || order.shippingAddress?.name || '',
    order.billing?.last_name  || '',
  ].filter(Boolean).join(' ')

  const shippingAddr = order.shipping || {}
  const localAddr    = order.shippingAddress || {}

  const addressLine = [
    shippingAddr.address_1 || localAddr.street,
    shippingAddr.address_2,
    shippingAddr.city       || localAddr.city,
    shippingAddr.state      || localAddr.state,
    shippingAddr.postcode,
    shippingAddr.country    || localAddr.country,
  ].filter(Boolean).join(', ')

  return (
    <div
      className={`anim-fade-up delay-${Math.min(index + 1, 5)} bg-white border border-black/[0.07] order-card`}
    >
      {/* ── Header row ── */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left px-5 sm:px-7 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
        aria-expanded={expanded}
      >
        <div className="flex items-start sm:items-center gap-5 sm:gap-8 flex-1 min-w-0">
          {/* Thumbnail stack */}
          <div className="flex -space-x-3 flex-shrink-0">
            {items.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white overflow-hidden bg-[#f5f4f2] flex-shrink-0"
                style={{ zIndex: 3 - i }}
              >
                <img
                  src={getItemImage(item, products)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {items.length > 3 && (
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white bg-[#111] flex items-center justify-center flex-shrink-0"
                style={{ zIndex: 0 }}
              >
                <span className="text-white text-[10px] font-medium">+{items.length - 3}</span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-1">Order</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-xl font-semibold text-[#111] leading-none">
              #{order.id}
            </p>
            <p className="mt-1.5 text-xs text-gray-400">{formatDate(order.date_created || order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <StatusBadge status={order.status} />
          <div className="text-right hidden sm:block">
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-1">Total</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-lg font-semibold text-[#111]">
              {formatCurrency(order.total)}
            </p>
          </div>
          {/* Chevron */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>

      {/* Mobile total */}
      <div className="sm:hidden px-5 pb-4 flex justify-between items-center border-t border-black/[0.05] pt-3">
        <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400">Total</p>
        <p style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-lg font-semibold text-[#111]">
          {formatCurrency(order.total)}
        </p>
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-black/[0.07]">

          {/* Items list */}
          <div>
            {items.map((item, i) => {
              const size  = getItemMeta(item, 'pa_size')  || item.size  || ''
              const color = getItemMeta(item, 'pa_color') || item.color || ''
              const name  = item.name || item.product_name || item.product?.name || 'Product'
              const qty   = item.quantity || item.qty || 1
              const price = item.total || item.subtotal || item.price

              return (
                <div key={i} className="item-row flex items-center gap-4 sm:gap-6 px-5 sm:px-7 py-4 sm:py-5 hover:bg-[#fafaf8] transition-colors duration-150">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#f5f4f2] flex-shrink-0 overflow-hidden">
                    <img src={getItemImage(item, products)} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-base sm:text-lg font-semibold text-[#111] leading-tight truncate">
                      {name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 mt-1">
                      <span className="text-xs text-gray-400">Qty {qty}</span>
                      {size  && <span className="text-xs text-gray-400">Size {size}</span>}
                      {color && <span className="text-xs text-gray-400">{color}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-[#111]">{formatCurrency(price)}</p>
                    {item.price && item.total && Number(item.price) !== Number(item.total) && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Unit: {formatCurrency(item.price)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/[0.055] border-t border-black/[0.07]">

            {/* Billing */}
            {(billingName || order.billing?.email || order.billing?.phone) && (
              <div className="bg-white px-5 sm:px-7 py-5">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-3">Billing</p>
                {billingName        && <p className="text-sm font-semibold text-[#111]">{billingName}</p>}
                {order.billing?.email && <p className="text-xs text-gray-500 mt-1">{order.billing.email}</p>}
                {order.billing?.phone && <p className="text-xs text-gray-500 mt-0.5">{order.billing.phone}</p>}
              </div>
            )}

            {/* Shipping */}
            {addressLine && (
              <div className="bg-white px-5 sm:px-7 py-5">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-3">Delivery address</p>
                <p className="text-xs text-gray-500 leading-6">{addressLine}</p>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white px-5 sm:px-7 py-5">
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-3">Payment method</p>
              <p className="text-sm font-semibold text-[#111]">
                {order.payment_method_title || order.payment_method || order.paymentMethod || 'Paystack'}
              </p>
            </div>

            {/* Totals */}
            <div className="bg-white px-5 sm:px-7 py-5">
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-3">Summary</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-[#111] font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {shippingTotal >= 0 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span className="text-[#111] font-medium">
                      {shippingTotal === 0 ? 'Free' : formatCurrency(shippingTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs pt-2 mt-1 border-t border-black/[0.07]">
                  <span className="text-gray-400 uppercase tracking-[0.3em] text-[9px]">Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-base font-semibold text-[#111]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── Main ─────────────────────────── */

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState({})
  const [loading, setLoading]   = useState(true)
  const [notice, setNotice]     = useState('')

  const getLocalOrders = useCallback(() => {
    const userEmail = user?.email?.toLowerCase()
    try {
      const saved = JSON.parse(localStorage.getItem('kv_orders') || '[]')
      if (!Array.isArray(saved)) return []
      return saved.filter(
        (o) =>
          String(o.userId) === String(user?.id) ||
          (o.userEmail && o.userEmail.toLowerCase() === userEmail)
      )
    } catch {
      return []
    }
  }, [user?.email, user?.id])

  const loadOrders = useCallback(async () => {
    if (!user?.email) { setOrders([]); setLoading(false); return }
    setLoading(true)
    setNotice('')

    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}&per_page=100`)
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.message || 'Unable to fetch orders.')
      }

      const fetched = (await res.json()) || []
      const local   = getLocalOrders()
      const combined = fetched.length > 0 ? fetched : local

      if (fetched.length === 0 && local.length > 0) {
        setNotice('Showing locally saved orders — sync will retry shortly.')
      }

      const ids = [...new Set(
        combined.flatMap((o) => (o.line_items || []).map((li) => li.product_id).filter(Boolean))
      )]

      const productMap = {}
      await Promise.all(
        ids.map(async (id) => {
          try { productMap[id] = await fetchProduct(id) }
          catch { /* silent */ }
        })
      )

      setProducts(productMap)
      setOrders(combined)
    } catch {
      const local = getLocalOrders()
      setOrders(local)
      if (local.length > 0) setNotice('Showing offline order history. Pull-to-refresh will retry.')
    } finally {
      setLoading(false)
    }
  }, [user?.email, getLocalOrders])

  useEffect(() => {
    if (!authLoading) loadOrders()
    const onFocus = () => { if (!authLoading) loadOrders() }
    window.addEventListener('focus', onFocus)
    return () => { window.removeEventListener('focus', onFocus) }
  }, [authLoading, loadOrders])

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: 'Clash Display, sans-serif' }}>

        {/* Section header */}
        <div className="mb-7 anim-fade-up">
          <p className="text-[9px] uppercase tracking-[0.5em] text-gray-400 mb-2">History</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-3xl sm:text-4xl font-semibold text-[#111]">
            Your Orders
          </h2>
        </div>

        {/* Notice banner */}
        {notice && (
          <div className="anim-fade-up mb-6 border border-amber-200 bg-amber-50 px-5 py-3">
            <p className="text-xs text-amber-700">{notice}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {(authLoading || loading) && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Orders */}
        {!authLoading && !loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <OrderCard key={order.id ?? i} order={order} products={products} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!authLoading && !loading && orders.length === 0 && (
          <div className="anim-fade-up border border-black/[0.07] bg-white px-8 py-16 text-center">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 mx-auto mb-5 text-gray-300">
              <rect x="8" y="14" width="32" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 14v-3a8 8 0 0116 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M19 26h10M24 21v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-2xl font-semibold text-[#111] mb-2">
              No orders yet
            </p>
            <p className="text-xs text-gray-400 leading-6 max-w-xs mx-auto">
              You haven't placed any orders. When you do, they'll appear here.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default MyOrders
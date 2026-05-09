import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ReviewModal from '../Components/ReviewModal'

const formatCurrency = (value) =>
  value ? `₦${Number(value).toLocaleString('en-NG')}` : '₦0'

const getImageSrc = (src) =>
  src?.startsWith('http')
    ? `/api/proxy-image?src=${encodeURIComponent(src)}`
    : src || 'https://via.placeholder.com/120x120/f5f5f5/111111?text=Product'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

/* ─── tiny inline styles for keyframes (Tailwind can't do @keyframes) ─── */
const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .anim-fade-up   { animation: fadeUp 0.65s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-scale-in  { animation: scaleIn 0.5s cubic-bezier(.22,.68,0,1.2) both; }
  .delay-100  { animation-delay: .10s; }
  .delay-200  { animation-delay: .20s; }
  .delay-300  { animation-delay: .30s; }
  .delay-400  { animation-delay: .40s; }
  .delay-500  { animation-delay: .50s; }
  .delay-600  { animation-delay: .60s; }
  .shimmer-line {
    background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }
  .item-row:not(:last-child) { border-bottom: 1px solid rgba(0,0,0,.06); }
`

/* ─── Check-mark SVG ─── */
const CheckCircle = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <circle cx="24" cy="24" r="23" stroke="#111" strokeWidth="1.5" />
    <path d="M14 24.5l7 7 13-14" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ─── Package icon ─── */
const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4 opacity-60">
    <path d="M21 10V7a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 7v3" />
    <path d="M21 10l-9 5-9-5" />
    <path d="M12 22V12" />
    <path d="M3 10v7a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 17v-7" />
  </svg>
)

/* ─── Loading skeleton ─── */
const LoadingSkeleton = () => (
  <>
    <style>{css}</style>
    <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="shimmer-line h-4 w-32 mb-6" />
        <div className="shimmer-line h-10 w-3/4" />
        <div className="shimmer-line h-4 w-full" />
        <div className="shimmer-line h-4 w-2/3" />
        <div className="mt-8 shimmer-line h-40 w-full rounded-2xl" />
      </div>
    </div>
  </>
)

/* ─── Main component ─── */
const OrderConfirmation = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const orderId = location.state?.orderId

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('kv_orders') || '[]')
    const filteredOrders = savedOrders.filter(
      (o) =>
        o.userId === user?.id ||
        o.userEmail === user?.email ||
        (!o.userId && !o.userEmail)
    )
    setOrder(
      orderId
        ? filteredOrders.find((o) => o.id === orderId) || filteredOrders[filteredOrders.length - 1]
        : filteredOrders[filteredOrders.length - 1]
    )
    setLoading(false)
  }, [orderId, user])

  // Show review modal after order confirmation is displayed
  useEffect(() => {
    if (order && !loading) {
      const timer = setTimeout(() => {
        setShowReviewModal(true)
      }, 2000) // Show after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [order, loading])

  const handleNewReview = (newReview) => {
    // Handle new review submission
    console.log('New review:', newReview)
    setShowReviewModal(false)
  }

  if (loading) return <LoadingSkeleton />

  if (!order) {
    return (
      <>
        <style>{css}</style>
        <div className="min-h-screen bg-[#f9f8f6]  flex items-center justify-center px-6">
          <div className="anim-fade-up text-center max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-6">Nothing here</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif' }} className="text-5xl font-semibold text-[#111] mb-4 leading-tight">
              No order found
            </h1>
            <p className="text-sm text-gray-500 leading-7 mb-10">
              We couldn't find a recent order linked to your account. Browse our collection and place an order to get started.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 bg-[#111] text-white text-xs uppercase tracking-[0.3em] px-8 py-4 hover:bg-[#333] transition-colors duration-300"
            >
              Shop now
            </button>
          </div>
        </div>
      </>
    )
  }

  const subtotal = order.orderItems?.reduce(
    (acc, item) => acc + (Number(item.price) * (item.quantity || item.qty || 1)), 0
  ) ?? 0
  const shipping = order.shippingFee ?? 0
  const total = order.total ?? subtotal + shipping

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen pt-10 bg-[#f9f8f6]" style={{ fontFamily: 'Clash Display, sans-serif' }}>

        {/* ── Top confirmation banner ── */}
        <div className="bg-[#111] text-white px-4 py-3 text-center anim-scale-in">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/60">
            Your order is confirmed · #{order.id}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">

          {/* ── Hero section ── */}
          <div className="anim-fade-up mb-14 text-center">
            <div className="inline-flex mb-8">
              <CheckCircle />
            </div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-4">Thank you</p>
            <h1
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
              className="text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-tight text-[#111]"
            >
              Order confirmed.
            </h1>
            <p className="mt-5 text-sm text-gray-500 leading-7 max-w-md mx-auto">
              We've received your order and we're getting it ready. A confirmation will be sent to{' '}
              <span className="text-[#111] font-medium">{order.userEmail || user?.email || 'your email'}</span>.
            </p>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ── LEFT: Order details ── */}
            <div className="space-y-5">

              {/* Meta row */}
              <div className="anim-fade-up delay-100 grid grid-cols-2 sm:grid-cols-3 gap-px bg-black/[0.07] border border-black/[0.07]">
                {[
                  { label: 'Order', value: `#${order.id}` },
                  { label: 'Date', value: formatDate(order.createdAt) },
                  { label: 'Status', value: 'Confirmed' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white px-5 py-5">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-1.5">{label}</p>
                    <p
                      className="text-sm font-medium text-[#111] truncate"
                      style={label === 'Status' ? { color: '#0d7a5f' } : {}}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="anim-fade-up delay-200 bg-white border border-black/[0.07]">
                <div className="px-6 pt-6 pb-4 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <PackageIcon />
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400">
                      {order.orderItems?.length} {order.orderItems?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <div>
                  {order.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="item-row flex items-center gap-4 sm:gap-6 px-6 py-5 hover:bg-[#fafaf8] transition-colors duration-200"
                    >
                      {/* Image */}
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#f5f4f2] overflow-hidden">
                        <img
                          src={getImageSrc(item.image || item.img || item.images?.[0]?.src)}
                          alt={item.product || item.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}
                          className="text-[1.05rem] sm:text-lg font-semibold text-[#111] leading-tight truncate"
                        >
                          {item.product || item.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          <span className="text-xs text-gray-400">Qty {item.quantity || item.qty || 1}</span>
                          {item.color && <span className="text-xs text-gray-400">{item.color}</span>}
                          {item.size  && <span className="text-xs text-gray-400">Size {item.size}</span>}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-semibold text-[#111]">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              <div className="anim-fade-up delay-300 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white border border-black/[0.07] px-6 py-6">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-3">Delivery address</p>
                  <p className="text-sm font-semibold text-[#111]">{user?.name || order.userEmail || 'Customer'}</p>
                  <p className="mt-1.5 text-xs text-gray-500 leading-6">
                    {order.shippingAddress?.street || 'No street specified'}<br />
                    {[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}<br />
                    {order.shippingAddress?.country || ''}
                  </p>
                </div>
                <div className="bg-white border border-black/[0.07] px-6 py-6">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-3">Payment</p>
                  <p className="text-sm font-semibold text-[#111]">
                    {order.paymentMethod || order.payment_method_title || order.payment_method || 'OPay Transfer'}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-500 leading-6">
                    Securely processed.<br />No card data is stored.
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Order summary + CTA ── */}
            <div className="space-y-5 anim-fade-up delay-400">

              {/* Price breakdown */}
              <div className="bg-white border border-black/[0.07] px-6 py-7">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-6">Order summary</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-[#111] font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span className="text-[#111] font-medium">
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="pt-4 mt-2 border-t border-black/[0.07] flex justify-between items-baseline">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400">Total</span>
                    <span
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      className="text-2xl font-semibold text-[#111]"
                    >
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA block */}
              <div className="bg-[#111] px-6 py-8 text-white">
                <p className="text-[9px] uppercase tracking-[0.45em] text-white/40 mb-3">Continue</p>
                <h3
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  className="text-2xl font-semibold leading-snug mb-2"
                >
                  Discover more pieces
                </h3>
                <p className="text-xs text-white/55 leading-6 mb-7">
                  Explore our latest arrivals — handpicked styles designed to last.
                </p>
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full bg-white text-[#111] text-[10px] uppercase tracking-[0.35em] py-4 hover:bg-[#f0efed] active:scale-[.98] transition-all duration-200"
                >
                  Continue shopping
                </button>
              </div>

              {/* Help */}
              <div className="bg-white border border-black/[0.07] px-6 py-6 text-center">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-2">Need help?</p>
                <p className="text-xs text-gray-500 leading-6">
                  Questions about your order?{' '}
                  <a
                    href="mailto:support@yourbrand.com"
                    className="text-[#111] underline underline-offset-2 hover:no-underline transition-all"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* ── Bottom reassurance strip ── */}
          <div className="anim-fade-up delay-500 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-black/[0.06] border border-black/[0.06]">
            {[
              { title: 'Secure payments', body: 'All transactions are encrypted and processed securely.' },
              { title: 'Easy returns',    body: 'Not satisfied? We offer hassle-free returns within 14 days.' },
              { title: 'Premium quality', body: 'Every piece is crafted with care and quality assurance.' },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white px-6 py-8 text-center">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-2">{title}</p>
                <p className="text-xs text-gray-500 leading-6">{body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Review Modal - shown after order confirmation */}
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleNewReview}
      />
    </>
  )
}

export default OrderConfirmation
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  LocalShippingOutlined,
  AutorenewOutlined,
  VerifiedOutlined,
  AddOutlined,
  RemoveOutlined,
  ExpandMoreOutlined,
  StarOutlined,
  ArrowForwardOutlined,
  ChevronLeftOutlined,
  LockOutlined,
  LocalFireDepartmentOutlined,
  CheckCircleOutlined,
  AccessTimeOutlined,
  InfoOutlined,
  ZoomInOutlined,
  CloseOutlined,
} from '@mui/icons-material'
import ProductCard from '../Components/ProductCard'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/useWishlist'
import { fetchProduct, fetchProducts } from '../api/Woocommerce'

// ─── Constants ────────────────────────────────────────────────────────
const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const waistSizes = ['26', '28', '30', '32', '34', '36', '38', '40', '42']
const SIZE_INFO = { XS: 'Chest 32–34"', S: 'Chest 34–36"', M: 'Chest 36–38"', L: 'Chest 38–40"', XL: 'Chest 40–42"', XXL: 'Chest 42–44"' }

const TRUST = [
  { icon: LocalShippingOutlined, label: 'Free Delivery',    sub: 'On orders over ₦55,000' },
  { icon: AutorenewOutlined,     label: '30-Day Returns',   sub: 'Hassle-free guarantee'   },
  { icon: VerifiedOutlined,      label: 'Authenticated',    sub: 'Curated & verified'      },
  { icon: LockOutlined,          label: 'Secure Checkout',  sub: 'SSL encrypted'           },
]

const REVIEWS = [
  { id: 1, name: 'Adaeze O.',   rating: 5, date: 'Mar 2025', verified: true, body: 'Absolutely love this! The quality is amazing. Me and my partner wore it to an outing and got so many compliments. The fabric feels premium, not like your average thrift.' },
  { id: 2, name: 'Emeka T.',    rating: 5, date: 'Feb 2025', verified: true, body: 'Fits perfectly. True to size and super comfortable. Delivered faster than expected. Will definitely be ordering more pieces from KayVogue.' },
  { id: 3, name: 'Chidinma R.', rating: 4, date: 'Jan 2025', verified: true, body: 'Good quality and fast delivery. The colour is exactly as shown. Slightly thicker than expected but honestly that is a plus — feels durable.' },
]

const PAYMENT_ICONS = ['Visa', 'MC', 'PayPal', 'Paystack', 'Flutterwave']
const FREE_SHIPPING_THRESHOLD = 55000
const RECENTLY_VIEWED_KEY = 'kv_recently_viewed'
const MAX_RECENTLY_VIEWED = 8

const getRecentlyViewedIds = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]')
  } catch {
    return []
  }
}

const addRecentlyViewedId = (productId) => {
  if (typeof window === 'undefined' || !productId) return
  const ids = getRecentlyViewedIds().filter((id) => id !== productId)
  ids.unshift(productId)
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids.slice(0, MAX_RECENTLY_VIEWED)))
}

// ─── Data helpers ─────────────────────────────────────────────────────
const buildColorOptions = (attributes) => {
  const colorAttr = attributes?.find((attr) => /color/i.test(attr.name))
  if (!colorAttr || !colorAttr.options?.length) return []
  return colorAttr.options.map((label, idx) => ({ label, imgIdx: idx, swatch: '#1a1a1a' }))
}
const buildSizeOptions = (attributes, categories = [], name = '') => {
  const categoryText = categories?.map((cat) => cat.name).join(' ') || ''
  const isWaistCategory = /jogger/i.test(categoryText) || /jogger/i.test(name)
  if (isWaistCategory) {
    const waistAttr = attributes?.find((attr) => /waist/i.test(attr.name))
    const lengthAttr = attributes?.find((attr) => /length/i.test(attr.name))
    if (waistAttr && lengthAttr) {
      const combinations = []
      for (const w of waistAttr.options) {
        for (const l of lengthAttr.options) {
          combinations.push(`${w} x ${l}`)
        }
      }
      return combinations
    } else {
      return waistSizes
    }
  } else {
    const sizeAttr = attributes?.find((attr) => /size/i.test(attr.name))
    return sizeAttr?.options?.length ? sizeAttr.options : defaultSizes
  }
}
const buildProductData = (data) => {
  const categoryText = data.categories?.map((cat) => cat.name).join(' ') || ''
  const isWaistCategory = /jogger/i.test(categoryText) || /jogger/i.test(data.name)
  return {
  id:            data.id,
  name:          data.name,
  category:      data.categories?.[0]?.name || 'Product',
  tag:           data.tags?.[0]?.name || (data.on_sale ? 'Sale' : null),
  price:         Number(data.price) || 0,
  regular_price: Number(data.regular_price) || 0,
  on_sale:       Boolean(data.on_sale),
  rating:        Number(data.average_rating) || 4.8,
  reviews:       Number(data.rating_count) || 3,
  sold:          Number(data.total_sales) || 142,
  sku:           data.sku || 'KV-001',
  stockLeft:     Math.floor(Math.random() * 5) + 2,
  description:   data.description || '',
  short_desc:    data.short_description || '',
  images:        data.images?.map((img) => img.src) || [],
  colors:        buildColorOptions(data.attributes || []),
  sizes:         buildSizeOptions(data.attributes || [], data.categories || [], data.name || ''),
  isWaistCategory,
  features: ['Premium quality fabric', 'Unisex relaxed fit', 'Ethically sourced', 'Limited stock'],
  accordion: [
    { title: 'Description',       body: data.description ? data.description.replace(/<[^>]+>/g, '') : 'A curated thrift piece selected for quality and style. Each item is inspected, cleaned, and ready to wear.' },
    { title: 'Material & Care',   body: 'Machine wash cold with like colours. Tumble dry low. Iron on low heat if needed. Wash inside out to preserve colour and print longevity.' },
    { title: 'Fit & Sizing',      body: 'Unisex relaxed fit. If you are between sizes, size up for a more oversized look. Refer to our size guide for exact measurements.' },
    { title: 'Shipping & Returns',body: 'Free delivery on orders over ₦55,000. Standard delivery 2–4 working days within Lagos. Other states 3–6 days. Easy returns within 30 days — no questions asked.' },
  ],
}
}

// ─── Utils ────────────────────────────────────────────────────────────
const fmt   = (n) => `₦${Number(n).toLocaleString('en-NG')}`
const stars = (n) => Array.from({ length: 5 }, (_, i) => i < Math.round(n))
const getImageSrc = (src) =>
  src?.startsWith('http') ? `/api/proxy-image?src=${encodeURIComponent(src)}` : src

// ─── Sub-components ───────────────────────────────────────────────────
const StarRow = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-[2px]">
    {stars(rating).map((filled, i) => (
      <StarOutlined key={i} style={{ fontSize: size, color: filled ? '#D4942A' : '#e0dbd4' }} />
    ))}
  </div>
)

const AccordionItem = ({ title, body, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#e8e3dc]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.15em' }}
          className="text-[10px] uppercase text-[#0a0a0a] font-semibold group-hover:text-[#5a4a3a] transition-colors">
          {title}
        </span>
        <ExpandMoreOutlined
          style={{ fontSize: 18, color: '#9a9188' }}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className="overflow-hidden transition-all duration-400 ease-out" style={{ maxHeight: open ? '300px' : '0px' }}>
        <p style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.03em' }}
          className="text-[12px] leading-relaxed text-[#7a7068] pb-5">
          {body}
        </p>
      </div>
    </div>
  )
}

const StockBar = ({ left }) => {
  const pct = Math.min((left / 8) * 100, 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-[#c8472b]" style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.05em' }}>
          <LocalFireDepartmentOutlined style={{ fontSize: 13 }} />
          Only {left} left in stock
        </span>
        <span className="text-[11px] text-[#9a9188]" style={{ fontFamily: 'var(--font-ui)' }}>
          High demand
        </span>
      </div>
      <div className="h-1 bg-[#ede8e1] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c8472b, #e06b3a)' }}
        />
      </div>
    </div>
  )
}

const ShippingProgress = ({ cartTotal }) => {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0)
  const pct = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  return (
    <div className="bg-[#f5f1eb] rounded px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <LocalShippingOutlined style={{ fontSize: 15, color: remaining === 0 ? '#2a7a3e' : '#9a9188' }} />
        <span style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.03em' }} className="text-[11px] text-[#5a5048]">
          {remaining === 0
            ? '🎉 You qualify for FREE delivery!'
            : `Add ${fmt(remaining)} more for free delivery`}
        </span>
      </div>
      <div className="h-1 bg-[#e0d9ce] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: remaining === 0 ? '#2a7a3e' : '#0a0a0a' }}
        />
      </div>
    </div>
  )
}

const ImageZoomModal = ({ src, onClose }) => (
  <div
    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
    >
      <CloseOutlined style={{ color: 'white', fontSize: 20 }} />
    </button>
    <img
      src={src}
      alt="Zoomed"
      className="max-w-full max-h-[90vh] object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────
const Product = () => {
  const { id } = useParams()
  const [product, setProduct]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [mainImg, setMainImg]     = useState(0)
  const [activeColor, setActiveColor] = useState(0)
  const [activeSize, setActiveSize]   = useState(null)
  const [hoveredSize, setHoveredSize] = useState(null)
  const [quantity, setQuantity]       = useState(1)
  const [wishlisted, setWishlisted]   = useState(false)
  const [adding, setAdding]           = useState(false)
  const [zoomSrc, setZoomSrc]         = useState(null)
  const [mobileImgIdx, setMobileImgIdx] = useState(0)
  const [imgHovered, setImgHovered]     = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [notification, setNotification]   = useState(null)
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([])
  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0

  const cart      = useCart()
  const wishlist  = useWishlist()
  const navigate  = useNavigate()
const handleViewedAddToCart = (p) =>
  cart?.addToCart?.({ ...p, images: p.images?.map(getImageSrc) })
  const handleViewedToggleWishlist = (product) => wishlist?.addToWishlist?.(product)

  const handleAddToCart = () => {
    if (!activeSize) {
      toast.error('Please select a size to continue', { duration: 2500 })
      infoPanelRef.current?.querySelector('[data-size-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
     // ✅ Proxy images before sending to cart
  const cartProduct = {
    ...product,
    images: product.images.map(getImageSrc),
  }

    cart?.addToCart?.(
      cartProduct,
      activeSize,
      hasColors ? product.colors[activeColor]?.label : undefined,
      quantity,
    )

    setAdding(true)
    setTimeout(() => {
      setAdding(false)
      toast.success(`${product.name} added to bag`, {
        duration: 3000,
        description: `${hasColors ? product.colors[activeColor]?.label + ' · ' : ''}Size ${activeSize} · Qty ${quantity}`,
      })
    }, 800)
  }

  const handleBuyNow = () => {
    if (!activeSize) {
      toast.error('Please select a size to continue', { duration: 2500 })
      infoPanelRef.current?.querySelector('[data-size-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
      // ✅ Proxy images before sending to cart
  const cartProduct = {
    ...product,
    images: product.images.map(getImageSrc),
  }


    cart?.addToCart?.(
      cartProduct,
      activeSize,
      hasColors ? product.colors[activeColor]?.label : undefined,
      quantity,
    )

    setAdding(true)
    setTimeout(() => {
      setAdding(false)
      navigate('/checkout')
    }, 200)
  }

  const loadRecentlyViewedProducts = async (currentProductId) => {
    const ids = getRecentlyViewedIds().filter((id) => id !== currentProductId)
    if (!ids.length) {
      setRecentlyViewedProducts([])
      return
    }

    try {
      const result = await fetchProducts({ include: ids.join(','), per_page: ids.length })
      const productById = Object.fromEntries(result.map((item) => [item.id, item]))
      const ordered = ids.map((id) => productById[id]).filter(Boolean).slice(0, 4)
      setRecentlyViewedProducts(ordered)
    } catch (err) {
      console.error('Recently viewed products failed:', err)
      setRecentlyViewedProducts([])
    }
  }

  const mobileGallRef = useRef(null)
  const infoPanelRef  = useRef(null)

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetchProduct(id)
        setProduct(buildProductData(response))
        setMainImg(0)
        setActiveColor(0)
        setActiveSize(null)
        setMobileImgIdx(0)
        addRecentlyViewedId(response.id)
        loadRecentlyViewedProducts(response.id)
      } catch (err) {
        console.error('Product fetch failed', err)
        setError('Unable to load product information.')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  // Fake social proof notification
  useEffect(() => {
    if (!product) return
    const names   = ['Tolu from Lagos', 'Chidi from Abuja', 'Amara from PH', 'Kemi from Ibadan']
    const timeout = setTimeout(() => {
      setNotification(names[Math.floor(Math.random() * names.length)])
      setTimeout(() => setNotification(null), 4500)
    }, 3500)
    return () => clearTimeout(timeout)
  }, [product])

  const onMobileScroll = () => {
    if (!mobileGallRef.current) return
    setMobileImgIdx(Math.round(mobileGallRef.current.scrollLeft / mobileGallRef.current.offsetWidth))
  }

  const handleColorSelect = (idx, imgIdx) => {
    setActiveColor(idx)
    setMainImg(Math.min(imgIdx, (product?.images?.length || 1) - 1))
  }

  const handleShare = async () => {
    try {
      await navigator.share({ title: `KayVogue — ${product.name}`, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!', { duration: 1500 })
    }
  }

  const discount = product?.on_sale && product?.regular_price > 0
    ? Math.round((1 - product.price / product.regular_price) * 100)
    : 0

  if (loading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a] rounded-full animate-spin" />
          <p style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.15em' }} className="text-[11px] uppercase text-[#9a9188]">
            Loading product…
          </p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-[#faf8f5] p-6">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0ece6] flex items-center justify-center mx-auto mb-5">
            <InfoOutlined style={{ fontSize: 28, color: '#9a9188' }} />
          </div>
          <p className="font-semibold text-[#0a0a0a] mb-2">Product not found</p>
          <p className="text-sm text-[#7a7068] mb-6">{error || 'The selected product could not be found.'}</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white text-sm uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors">
            Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  const cartValue = quantity * product.price

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --font-display: 'Playfair Display', Georgia, serif;
          --font-ui: 'DM Sans', sans-serif;
          --cream: #faf8f5;
          --ink: #0a0a0a;
          --warm-mid: #7a7068;
          --warm-light: #e8e3dc;
          --accent: #D4942A;
          --accent-red: #c8472b;
        }

        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          0%  { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); }
          100%{ transform: scale(1);   opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        @keyframes slideNotif {
          0%   { transform: translateY(20px); opacity: 0; }
          15%  { transform: translateY(0);    opacity: 1; }
          80%  { transform: translateY(0);    opacity: 1; }
          100% { transform: translateY(-10px);opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .fade-up-1 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .slide-left { animation: slideInLeft 0.65s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-right{ animation: slideInRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .pop-in { animation: popIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        .btn-shimmer {
          background: linear-gradient(90deg, #1a1a1a 25%, #3a3a3a 50%, #1a1a1a 75%);
          background-size: 600px 100%;
          animation: shimmer 1.2s infinite;
        }
        .notif-anim { animation: slideNotif 4.5s cubic-bezier(0.22,1,0.36,1) both; }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }

        .img-zoom-wrap { overflow: hidden; }
        .img-zoom-wrap img { transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); }
        .img-zoom-wrap:hover img { transform: scale(1.04); }

        .size-pill {
          transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        .size-pill:hover:not(.active) {
          background: #f0ece6;
          border-color: #0a0a0a !important;
        }

        .thumb-btn { transition: all 0.2s ease; }
        .thumb-btn:hover { opacity: 1 !important; }

        .related-card .card-img img { transition: transform 0.55s cubic-bezier(0.22,1,0.36,1); }
        .related-card:hover .card-img img { transform: scale(1.07); }
        .related-card .quick-add { transition: all 0.25s ease; opacity: 0; transform: translateY(8px); }
        .related-card:hover .quick-add { opacity: 1; transform: translateY(0); }

        .tab-underline { position: relative; }
        .tab-underline::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 100%; height: 2px;
          background: #0a0a0a;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .tab-underline.active::after { transform: scaleX(1); }

        .wishlist-btn { transition: all 0.2s ease; }
        .wishlist-btn:hover { transform: scale(1.1); }
        .wishlist-btn:active { transform: scale(0.95); }

        .add-btn {
          position: relative;
          overflow: hidden;
        }
        .add-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.08);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .add-btn:hover::after { transform: translateX(0); }
      `}</style>

      {/* ── Social Proof Notification ─────────────────────────── */}
      {notification && (
        <div className="fixed bottom-24 left-4 z-[90] notif-anim pointer-events-none">
          <div className="flex items-center gap-3 bg-white border border-[#e8e3dc] rounded-lg shadow-xl px-4 py-3 max-w-[260px]">
            <div className="w-8 h-8 rounded-full bg-[#f0ece6] flex-none flex items-center justify-center">
              <span className="text-sm">🛍️</span>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)' }} className="text-[11px] font-semibold text-[#0a0a0a] leading-tight">
                {notification}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)' }} className="text-[10px] text-[#9a9188] mt-0.5">
                just purchased this item
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#2a8a4e] flex-none pulse-dot" />
          </div>
        </div>
      )}

      {/* ── Image Zoom Modal ──────────────────────────────────── */}
      {zoomSrc && <ImageZoomModal src={zoomSrc} onClose={() => setZoomSrc(null)} />}

      <main className="w-full bg-[#faf8f5] min-h-screen md:mt-35 mt-25" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 pt-8 pb-32">

          {/* ── Breadcrumb ─────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-8 fade-up-1">
            <Link to="/shop" className="flex items-center gap-1 hover:text-[#5a4a3a] transition-colors"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.1em', color: '#9a9188' }}>
              <ChevronLeftOutlined style={{ fontSize: 14 }} />
              Shop
            </Link>
            <span style={{ color: '#c8c0b8' }}>/</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#9a9188' }}>{product.category}</span>
            <span style={{ color: '#c8c0b8' }}>/</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#5a5048' }} className="truncate max-w-[160px]">
              {product.name}
            </span>
          </div>

          {/* ══ MAIN GRID ════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-8 lg:gap-14 items-start">

            {/* ── LEFT: Gallery ─────────────────────────────────── */}
            <div className="flex gap-3 lg:sticky lg:top-28 slide-left">

              {/* Desktop Thumbs (vertical) */}
              <div className="hidden lg:flex flex-col gap-2 no-scroll" style={{ maxHeight: '620px', overflowY: 'auto' }}>
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImg(i)}
                    className="thumb-btn flex-none relative overflow-hidden bg-[#f0ece6] rounded"
                    style={{
                      width: 72, height: 86,
                      outline:       i === mainImg ? '2px solid #0a0a0a' : '2px solid transparent',
                      outlineOffset: 2,
                      opacity:       i === mainImg ? 1 : 0.55,
                    }}
                  >
                    <img src={getImageSrc(src)} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>

              {/* Desktop Main Image */}
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="hidden lg:block relative bg-[#ede9e3] rounded-lg overflow-hidden img-zoom-wrap cursor-zoom-in"
                  style={{ paddingBottom: '118%' }}
                  onMouseEnter={() => setImgHovered(true)}
                  onMouseLeave={() => setImgHovered(false)}
                  onClick={() => setZoomSrc(getImageSrc(product.images[mainImg]))}
                >
                  {product.images.map((src, i) => (
                    <img
                      key={i}
                      src={getImageSrc(src)}
                      alt={`View ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
                      style={{ opacity: i === mainImg ? 1 : 0 }}
                    />
                  ))}

                  {/* Tag badge */}
                  {product.tag && (
                    <div className={`absolute top-4 left-4 font-semibold text-[9px] tracking-[0.22em] uppercase px-3 py-1.5 rounded-sm
                      ${product.tag === 'Sale' ? 'bg-[#c8472b] text-white' : 'bg-[#0a0a0a] text-white'}`}
                      style={{ fontFamily: 'var(--font-ui)' }}>
                      {product.tag}
                      {discount > 0 && ` —${discount}%`}
                    </div>
                  )}

                  {/* Zoom hint */}
                  <div className={`absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white/80 text-[10px] rounded-full px-3 py-1.5 transition-opacity duration-300 ${imgHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{ fontFamily: 'var(--font-ui)' }}>
                    <ZoomInOutlined style={{ fontSize: 13 }} />
                    Click to zoom
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button onClick={() => setWishlisted(!wishlisted)}
                      className="wishlist-btn w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                      {wishlisted
                        ? <FavoriteOutlined style={{ fontSize: 17, color: '#c8472b' }} className="pop-in" />
                        : <FavoriteBorderOutlined style={{ fontSize: 17, color: '#5a5048' }} />}
                    </button>
                    <button onClick={handleShare}
                      className="wishlist-btn w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                      <ShareOutlined style={{ fontSize: 16, color: '#5a5048' }} />
                    </button>
                  </div>

                  {/* Counter pill */}
                  <div className="absolute bottom-4 left-4 bg-black/25 backdrop-blur-sm text-white/70 text-[9px] rounded-full px-2.5 py-1"
                    style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.08em' }}>
                    {String(mainImg + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Mobile Gallery */}
                <div className="lg:hidden relative">
                  <div ref={mobileGallRef} onScroll={onMobileScroll}
                    className="no-scroll flex overflow-x-auto snap-x snap-mandatory rounded-lg" style={{ scrollBehavior: 'smooth' }}>
                    {product.images.map((src, i) => (
                      <div key={i} className="relative flex-none snap-start w-full overflow-hidden bg-[#ede9e3]"
                        style={{ paddingBottom: '115%' }}>
                        <img src={getImageSrc(src)} alt={`View ${i + 1}`}
                          className="absolute inset-0 w-full h-full object-cover object-top" />
                        {i === 0 && product.tag && (
                          <div className={`absolute top-4 left-4 text-[9px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1.5 rounded-sm
                            ${product.tag === 'Sale' ? 'bg-[#c8472b] text-white' : 'bg-[#0a0a0a] text-white'}`}
                            style={{ fontFamily: 'var(--font-ui)' }}>
                            {product.tag}
                          </div>
                        )}
                        {i === 0 && (
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button onClick={() => setWishlisted(!wishlisted)}
                              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                              {wishlisted
                                ? <FavoriteOutlined style={{ fontSize: 16, color: '#c8472b' }} />
                                : <FavoriteBorderOutlined style={{ fontSize: 16, color: '#5a5048' }} />}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Mobile dot indicators */}
                  <div className="flex justify-center gap-1.5 mt-3">
                    {product.images.map((_, i) => (
                      <button key={i} onClick={() => {
                        mobileGallRef.current?.scrollTo({ left: i * mobileGallRef.current.offsetWidth, behavior: 'smooth' })
                      }}
                        className="rounded-full transition-all duration-300 bg-[#0a0a0a]"
                        style={{ width: i === mobileImgIdx ? 22 : 6, height: 6, opacity: i === mobileImgIdx ? 0.85 : 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile thumb row */}
                <div className="hidden md:flex lg:hidden gap-2 no-scroll overflow-x-auto mt-1">
                  {product.images.map((src, i) => (
                    <button key={i} onClick={() => setMainImg(i)}
                      className="flex-none overflow-hidden rounded transition-all"
                      style={{ width: 60, height: 72, outline: i === mainImg ? '2px solid #0a0a0a' : '2px solid transparent', outlineOffset: 2, opacity: i === mainImg ? 1 : 0.5 }}>
                      <img src={getImageSrc(src)} alt="" className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Product Info ────────────────────────────── */}
            <div ref={infoPanelRef} className="flex flex-col gap-5 slide-right lg:pt-0">

              {/* Category + SKU */}
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.18em', fontSize: 10 }}
                  className="uppercase text-[#9a9188] font-medium">
                  {product.category} · Unisex
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#b8b0a8' }}>
                  SKU: {product.sku}
                </span>
              </div>

              {/* Name */}
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', lineHeight: 1.08, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                  {product.name}
                </h1>
              </div>

              {/* Rating + Sold */}
              <div className="flex items-center gap-3 flex-wrap">
                <StarRow rating={product.rating} size={14} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#D4942A' }} className="font-semibold">
                  {product.rating}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#9a9188' }}>
                  ({product.reviews} reviews)
                </span>
                <span style={{ color: '#d8d0c8' }}>·</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#9a9188' }}>
                  {product.sold}+ sold
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 400, color: '#0a0a0a' }}>
                  {fmt(quantity * product.price)}
                </span>
                {product.on_sale && product.regular_price > 0 && (
                  <>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#b8b0a8', textDecoration: 'line-through' }}>
                      {fmt(quantity * product.regular_price)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}
                      className="bg-[#c8472b] text-white px-2 py-0.5 rounded-sm">
                      SAVE {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Shipping progress */}
              <ShippingProgress cartTotal={cartValue} />

              <div className="h-px bg-[#e8e3dc]" />

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {product.features.map((f) => (
                  <span key={f} className="flex items-center gap-1.5 bg-[#f0ece6] rounded-full px-3 py-1.5"
                    style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#5a5048', letterSpacing: '0.04em' }}>
                    <CheckCircleOutlined style={{ fontSize: 11, color: '#2a7a3e' }} />
                    {f}
                  </span>
                ))}
              </div>

              {hasColors && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}
                      className="uppercase text-[#0a0a0a]">
                      Colour
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#5a5048' }}>
                      {product.colors[activeColor]?.label}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map((c, i) => (
                      <button key={c.label} onClick={() => handleColorSelect(i, c.imgIdx)} aria-label={c.label} title={c.label}
                      className="relative w-9 h-9 rounded-full transition-transform duration-200 hover:scale-105"
                      style={{
                        background: c.swatch,
                        border:     `1.5px solid rgba(0,0,0,${c.label.toLowerCase().includes('white') || c.label.toLowerCase().includes('chalk') ? '0.2' : '0.08'})`,
                        outline:    i === activeColor ? '2.5px solid #0a0a0a' : '2.5px solid transparent',
                        outlineOffset: 3,
                      }}>
                      {i === activeColor && (
                        <span className="absolute inset-0 flex items-center justify-center text-[12px] pop-in"
                          style={{ color: c.label.toLowerCase().includes('white') || c.label.toLowerCase().includes('chalk') ? '#0a0a0a' : 'white' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Size Selector */}
              <div data-size-section>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}
                    className="uppercase text-[#0a0a0a]">
                    Size
                  </span>
                  <button onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
                    className="flex items-center gap-1 hover:text-[#0a0a0a] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#9a9188' }}>
                    <InfoOutlined style={{ fontSize: 13 }} />
                    Size Guide
                  </button>
                </div>

                {/* Size guide tooltip */}
                {sizeGuideOpen && (
                  <div className="mb-3 bg-white border border-[#e8e3dc] rounded-lg p-4 pop-in">
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}
                      className="uppercase text-[#9a9188] mb-3">
                      {product.isWaistCategory ? 'Waist & Length Measurements' : 'Chest Measurements'}
                    </p>
                    {product.isWaistCategory ? (
                      <div className="text-sm text-[#7a7068]">
                        <p>Waist sizes: {waistSizes.join(', ')}</p>
                        <p>Length sizes: 30", 32", 34", 36"</p>
                        <p>Select a combination that fits you best.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(SIZE_INFO).map(([s, m]) => (
                          <div key={s} className="flex flex-col items-center bg-[#faf8f5] rounded p-2">
                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600 }} className="text-[#0a0a0a]">{s}</span>
                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10 }} className="text-[#9a9188] mt-0.5">{m}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => {
                    const isActive = activeSize === s
                    return (
                      <button key={s} onClick={() => setActiveSize(s)}
                        onMouseEnter={() => setHoveredSize(s)}
                        onMouseLeave={() => setHoveredSize(null)}
                        className={`size-pill font-semibold rounded-md transition-all duration-200 ${isActive ? 'active' : ''}`}
                        style={{
                          fontFamily:  'var(--font-ui)',
                          fontSize:    11,
                          letterSpacing: '0.08em',
                          width:       52, height: 44,
                          background:  isActive ? '#0a0a0a' : 'white',
                          color:       isActive ? 'white' : '#0a0a0a',
                          border:      `1.5px solid ${isActive ? '#0a0a0a' : '#ddd8d0'}`,
                        }}>
                        {s}
                      </button>
                    )
                  })}
                </div>

                {/* Size hint */}
                {hoveredSize && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#7a7068' }} className="mt-2 pop-in">
                    {product.isWaistCategory
                      ? (() => {
                          const parts = hoveredSize.split(' x ')
                          if (parts.length === 2) {
                            return `Waist: ${parts[0]}", Length: ${parts[1]}"`
                          } else {
                            return `Waist: ${hoveredSize}"`
                          }
                        })()
                      : SIZE_INFO[hoveredSize] ? `${hoveredSize}: ${SIZE_INFO[hoveredSize]}` : hoveredSize}
                  </p>
                )}
                {!activeSize && !hoveredSize && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.08em', color: '#b8b0a8' }}
                    className="uppercase mt-2">
                    ↑ Select your size to continue
                  </p>
                )}
              </div>

              {/* Stock + Urgency */}
              <StockBar left={product.stockLeft} />

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}
                  className="uppercase text-[#0a0a0a]">
                  Qty
                </span>
                <div className="inline-flex items-center border border-[#ddd8d0] rounded-md overflow-hidden bg-white">
                  <button onClick={() => setQuantity((p) => Math.max(1, p - 1))} disabled={quantity === 1}
                    className="w-10 h-10 flex items-center justify-center text-[#7a7068] hover:text-[#0a0a0a] disabled:opacity-25 transition-colors">
                    <RemoveOutlined style={{ fontSize: 15 }} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#0a0a0a' }}
                    className="w-10 text-center font-medium">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity((p) => p + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[#7a7068] hover:text-[#0a0a0a] transition-colors">
                    <AddOutlined style={{ fontSize: 15 }} />
                  </button>
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#9a9188' }}>
                  {product.stockLeft} available
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <button onClick={handleAddToCart} disabled={adding}
                  className={`add-btn w-full h-14 font-semibold text-white rounded-lg tracking-widest uppercase transition-all duration-300 ${adding ? 'btn-shimmer cursor-wait' : 'bg-[#0a0a0a] hover:bg-[#1a1a1a]'}`}
                  style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em' }}>
                  {adding ? 'Adding to bag…' : 'Add to Bag'}
                </button>
                <button onClick={handleBuyNow} className="w-full h-14 font-semibold rounded-lg uppercase tracking-widest transition-all duration-300 border-2 border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
                  style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em' }}>
                  Buy Now
                </button>
              </div>

              {/* Payment methods */}
              <div className="flex items-center justify-center gap-2 flex-wrap py-1">
                <LockOutlined style={{ fontSize: 12, color: '#b8b0a8' }} />
                {PAYMENT_ICONS.map((p) => (
                  <span key={p} style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.06em', fontWeight: 600 }}
                    className="border border-[#ddd8d0] rounded px-2 py-1 text-[#9a9188] bg-white">
                    {p}
                  </span>
                ))}
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#b8b0a8' }}>
                  Secure checkout
                </span>
              </div>

              {/* Trust grid */}
              <div className="grid grid-cols-2 gap-3 py-4 border-y border-[#e8e3dc]">
                {TRUST.map(({ icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#f0ece6] flex-none flex items-center justify-center mt-0.5">
                      {React.createElement(icon, { style: { fontSize: 15, color: '#7a7068' } })}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600 }} className="text-[#0a0a0a]">
                        {label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10 }} className="text-[#9a9188]">
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div>
                <AccordionItem title="Description"        body={product.accordion[0].body} defaultOpen />
                <AccordionItem title="Material & Care"    body={product.accordion[1].body} />
                <AccordionItem title="Fit & Sizing"       body={product.accordion[2].body} />
                <AccordionItem title="Shipping & Returns" body={product.accordion[3].body} />
              </div>

            </div>
          </div>

          {/* ══ REVIEWS ══════════════════════════════════════════ */}
          <div className="mt-24 md:mt-32 fade-up-2">
            <div className="h-px bg-[#e8e3dc] mb-12" />

            <div className="grid md:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">

              {/* Aggregate block */}
              <div className="flex flex-col gap-5">
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.25em', color: '#9a9188' }}
                    className="uppercase mb-2">Customer Reviews</p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', color: '#0a0a0a' }}>
                    What they say
                  </h2>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e3dc] p-6 flex flex-col gap-4">
                  <div className="flex items-end gap-3">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 400, color: '#0a0a0a', lineHeight: 1 }}>
                      {product.rating}
                    </span>
                    <div className="pb-1">
                      <StarRow rating={product.rating} size={18} />
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#9a9188' }} className="mt-1">
                        Based on {product.reviews} reviews
                      </p>
                    </div>
                  </div>

                  {/* Rating bars */}
                  {[5,4,3,2,1].map((n) => {
                    const count = n === 5 ? 2 : n === 4 ? 1 : 0
                    const pct   = (count / REVIEWS.length) * 100
                    return (
                      <div key={n} className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#7a7068', width: 8 }}>{n}</span>
                        <StarOutlined style={{ fontSize: 11, color: '#D4942A' }} />
                        <div className="flex-1 h-1.5 bg-[#ede8e1] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#D4942A]" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#9a9188', width: 16 }}>{count}</span>
                      </div>
                    )
                  })}
                </div>

                <button className="w-full py-3 border border-[#ddd8d0] rounded-lg text-[#0a0a0a] text-[11px] uppercase tracking-widest font-semibold hover:bg-[#0a0a0a] hover:text-white transition-all duration-300"
                  style={{ fontFamily: 'var(--font-ui)' }}>
                  Write a Review
                </button>
              </div>

              {/* Review cards */}
              <div className="flex flex-col gap-4">
                {REVIEWS.map((r) => (
                  <div key={r.id} className="bg-white border border-[#e8e3dc] rounded-xl p-6 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f0ece6] flex items-center justify-center flex-none">
                          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', color: '#5a4a3a' }}>
                            {r.name[0]}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }} className="text-[#0a0a0a]">
                            {r.name}
                          </p>
                          {r.verified && (
                            <p className="flex items-center gap-1" style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#2a7a3e' }}>
                              <CheckCircleOutlined style={{ fontSize: 11 }} />
                              Verified purchase
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-none">
                        <StarRow rating={r.rating} size={12} />
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#b8b0a8' }}>{r.date}</span>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.65, color: '#5a5048' }}>
                      "{r.body}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RECENTLY VIEWED ════════════════════════════════ */}
          {recentlyViewedProducts.length > 0 && (
            <div className="mt-24 md:mt-32">
              <div className="h-px bg-[#e8e3dc] mb-12" />

              <div className="flex items-end justify-between mb-10">
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.25em', color: '#9a9188' }}
                    className="uppercase mb-2">Recently Viewed</p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', color: '#0a0a0a' }}>
                    Items you viewed recently
                  </h2>
                </div>
                <Link to="/shop" className="flex items-center gap-1.5 hover:text-[#0a0a0a] transition-colors group"
                  style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.14em', color: '#9a9188' }}>
                  View All
                  <ArrowForwardOutlined style={{ fontSize: 13 }} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Desktop grid */}
              <div className="hidden md:grid grid-cols-4 gap-5">
                {recentlyViewedProducts.map((item, index) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    index={index}
                    onAddToCart={handleViewedAddToCart}
                    onToggleWishlist={handleViewedToggleWishlist}
                  />
                ))}
              </div>

              {/* Mobile horizontal scroll */}
              <div className="md:hidden flex gap-3.5 overflow-x-auto no-scroll snap-x snap-mandatory -mx-4 px-4 pb-3">
                {recentlyViewedProducts.map((item, index) => (
                  <div key={item.id} className="flex-none snap-start" style={{ width: '65vw' }}>
                    <ProductCard
                      product={item}
                      index={index}
                      onAddToCart={handleViewedAddToCart}
                      onToggleWishlist={handleViewedToggleWishlist}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Sticky Mobile Buy Bar ─────────────────────────────── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e8e3dc] px-4 py-3">
          <div className="flex gap-2.5 items-center max-w-lg mx-auto">
            <div className="flex flex-col flex-1 min-w-0">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#0a0a0a', lineHeight: 1 }}>
                {fmt(quantity * product.price)}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.1em', color: '#9a9188' }}
                className="uppercase truncate mt-0.5">
                {activeSize
                  ? `Size ${activeSize}${hasColors ? ` · ${product.colors[activeColor]?.label}` : ''}`
                  : 'Select a size above'}
              </span>
            </div>
            <button onClick={handleAddToCart}
              className={`flex-1 h-12 font-semibold uppercase tracking-widest text-white rounded-lg transition-all duration-300 ${adding ? 'btn-shimmer' : 'bg-[#0a0a0a] hover:bg-[#1a1a1a]'}`}
              style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.18em' }}>
              {adding ? 'Adding…' : 'Add to Bag'}
            </button>
            <button onClick={handleBuyNow} className="h-12 px-4 font-semibold uppercase tracking-widest text-[#0a0a0a] border border-[#0a0a0a] rounded-lg hover:bg-[#0a0a0a] hover:text-white transition-all duration-300"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.14em' }}>
              Buy
            </button>
          </div>
        </div>

      </main>
    </>
  )
}

export default Product;
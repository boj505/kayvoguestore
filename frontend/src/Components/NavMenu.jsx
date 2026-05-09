import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  SearchOutlined,
  PersonOutlineOutlined,
  ShoppingBagOutlined,
  FavoriteBorderOutlined,
  CloseOutlined,
  ArrowForwardOutlined,
  HomeOutlined,
  MenuOutlined,
  KeyboardArrowDownOutlined,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import Cart from './Cart'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/useWishlist'
import { useAuth } from '../context/AuthContext'
import { fetchCategories, fetchProducts } from '../api/Woocommerce'

// ─────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Shop',    to: '/shop',    hasMega: true  },
  { label: 'About',   to: '/about',   hasMega: false },
  { label: 'Reviews', to: '/reviews', hasMega: false },
  { label: 'FAQs',    to: '/faqs',    hasMega: false },
]

const ANNOUNCEMENTS = [
  'Free delivery on orders above 80k',
  'Genz exclusive',
  'Premium quality, affordable prices',
]

const QUICK_CATS = ['Hoodies', 'Sweatshirts', 'Joggers', 'Shorts', 'Roundnecks', 'Jerseys']

const DISCOVER_LINKS = [
  { label: 'New arrivals',  to: '/shop?orderby=date'       },
  { label: 'On sale',       to: '/shop?on_sale=true'       },
  { label: 'Best sellers',  to: '/shop?orderby=popularity' },
  { label: 'Staff picks',   to: '/shop?featured=true'      },
]

// Fixed pixel heights — header never shrinks on scroll
const ANNOUNCE_H = 32
const HEADER_H   = 68
const TOTAL_H    = ANNOUNCE_H + HEADER_H // 100

// ─────────────────────────────────────────────────────────────────────
// STYLE TOKENS
// ─────────────────────────────────────────────────────────────────────
const clash = { fontFamily: 'Clash Display, sans-serif' }
const logo  = { fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontStyle: 'normal' }
const cg    = { fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 400 }

// ─────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────
const proxyImg = (src) => {
  if (!src || typeof src !== 'string') return null
  return src.startsWith('http')
    ? `/api/proxy-image?src=${encodeURIComponent(src)}`
    : src
}

const getImgUrl = (p) => {
  if (!p) return null
  const imgs = p.images || (p.image ? [p.image] : null)
  if (Array.isArray(imgs) && imgs.length) {
    const img = imgs[0]
    if (!img) return null
    const raw = typeof img === 'string' ? img : img.src || img.url || img.source_url || null
    return proxyImg(raw)
  }
  if (p.image) {
    const raw = typeof p.image === 'string' ? p.image : p.image.src || p.image.url || null
    return proxyImg(raw)
  }
  return null
}

const getCatImg = (cat) => {
  if (!cat?.image) return null
  return proxyImg(cat.image.src || cat.image.url || null)
}

const fmtPrice = (p) => {
  const n = Number(p)
  return Number.isNaN(n) ? String(p ?? '') : `₦${n.toLocaleString('en-NG')}`
}

// ─────────────────────────────────────────────────────────────────────
// SCROLL LOCK (compensates for scrollbar width)
// ─────────────────────────────────────────────────────────────────────
const useLockScroll = (active) => {
  useEffect(() => {
    if (!active) return
    const prev    = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    const sbW     = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow     = 'hidden'
    document.body.style.paddingRight = `${sbW}px`
    return () => {
      document.body.style.overflow     = prev
      document.body.style.paddingRight = prevPad
    }
  }, [active])
}

// ─────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────
const Badge = ({ count, red = false }) => {
  if (!count) return null
  return (
    <span
      className={`absolute -top-[7px] -right-[7px] min-w-[16px] h-[16px] px-[3px] rounded-full
        flex items-center justify-center ${red ? 'bg-[#c8472b]' : 'bg-[#0a0a0a]'} text-white`}
      style={{ ...clash, fontSize: 7, fontWeight: 700 }}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────
// AUTO-SCROLL PRODUCT RAIL
// ─────────────────────────────────────────────────────────────────────
const ProductRail = ({ products, onClose }) => {
  const railRef  = useRef(null)
  const animRef  = useRef(null)
  const posRef   = useRef(0)
  const pauseRef = useRef(false)

  useEffect(() => {
    const el = railRef.current
    if (!el || products.length === 0) return
    const tick = () => {
      if (!pauseRef.current) {
        posRef.current += 0.5
        const half = el.scrollWidth / 2
        if (posRef.current >= half) posRef.current -= half
        el.scrollLeft = posRef.current
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [products])

  const doubled = [...products, ...products]

  return (
    <div
      ref={railRef}
      className="flex gap-5 overflow-hidden select-none"
      style={{ scrollBehavior: 'auto' }}
      onMouseEnter={() => { pauseRef.current = true  }}
      onMouseLeave={() => { pauseRef.current = false }}
    >
      {doubled.map((p, i) => (
        <Link
          key={`${p.id}-${i}`}
          to={`/product/${p.id}`}
          onClick={onClose}
          className="group flex-shrink-0 w-[155px] block"
          draggable={false}
        >
          <div className="w-[155px] h-[195px] bg-[#f0ece6] overflow-hidden mb-3">
            {getImgUrl(p) ? (
              <img
                src={getImgUrl(p)}
                alt={p.name}
                draggable={false}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.06]"
              />
            ) : (
              <div className="w-full h-full bg-[#ede9e3]" />
            )}
          </div>
          <p className="text-[11px] tracking-[0.06em] text-[#0a0a0a] truncate group-hover:opacity-50 transition-opacity" style={clash}>
            {p.name}
          </p>
          <p className="text-[10px] tracking-[0.04em] text-black/40 mt-1" style={clash}>
            {fmtPrice(p.price)}
          </p>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MEGA MENU
// Stays open as long as the mouse is in the nav trigger zone OR the
// panel itself. A shared debounce timer (280ms) bridges the gap.
// onPanelEnter / onPanelLeave are wired to the same timer.
// ─────────────────────────────────────────────────────────────────────
const MegaMenu = ({ categories, featuredProducts, onClose, onPanelEnter, onPanelLeave }) => {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <>
      {/* Click-away backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-30"
        style={{ top: TOTAL_H, background: 'rgba(0,0,0,0.28)' }}
        onClick={onClose}
      />

      {/* Full-viewport panel */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1,  y: 0  }}
        exit={{ opacity: 0,     y: -8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 z-40 bg-white overflow-y-auto hidden lg:flex flex-col"
        style={{ top: TOTAL_H, bottom: 0 }}
        onMouseEnter={onPanelEnter}
        onMouseLeave={onPanelLeave}
      >
        <div className="flex-1 w-full max-w-[1500px] mx-auto px-10 xl:px-16 2xl:px-24 py-10">

          {/* ── Category grid ── */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-7">
              <span className="text-[10px] tracking-[0.38em] uppercase text-black/35" style={clash}>
                Shop by category
              </span>
              <Link
                to="/shop"
                onClick={onClose}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase text-black/35 hover:text-black/70 transition-colors"
                style={clash}
              >
                All categories <ArrowForwardOutlined style={{ fontSize: 13 }} />
              </Link>
            </div>

            {/* Larger cards — 5 cols base, up to 10 on 2xl */}
            <div className="grid grid-cols-5 xl:grid-cols-8 2xl:grid-cols-10 gap-5">
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  onClick={onClose}
                  className="group block"
                >
                  {/* Taller image */}
                  <div className="aspect-[3/4] overflow-hidden bg-[#f0ece6] mb-3">
                    {getCatImg(cat) ? (
                      <img
                        src={getCatImg(cat)}
                        alt={cat.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.07]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] tracking-[0.14em] uppercase text-black/25 text-center px-2" style={clash}>
                          {cat.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11.5px] tracking-[0.08em] text-[#0a0a0a] group-hover:opacity-45 transition-opacity leading-tight" style={clash}>
                    {cat.name}
                  </p>
                  <p className="text-[9.5px] tracking-[0.04em] text-black/32 mt-1" style={clash}>
                    {cat.count ?? 0} pieces
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-black/[0.06] mb-10" />

          {/* ── Products + Discover ── */}
          <div className="grid grid-cols-[1fr_215px] xl:grid-cols-[1fr_235px] gap-10 items-start">

            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] tracking-[0.38em] uppercase text-black/35" style={clash}>
                  Just dropped
                </span>
                <Link
                  to="/shop?orderby=date"
                  onClick={onClose}
                  className="flex items-center gap-1 text-[10px] tracking-[0.22em] uppercase text-black/35 hover:text-black/70 transition-colors"
                  style={clash}
                >
                  View all <ArrowForwardOutlined style={{ fontSize: 13 }} />
                </Link>
              </div>

              {featuredProducts.length > 0 ? (
                <ProductRail products={featuredProducts} onClose={onClose} />
              ) : (
                <div className="flex gap-5">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="w-[155px] flex-shrink-0">
                      <div className="w-[155px] h-[195px] bg-[#f0ece6] animate-pulse" />
                      <div className="h-2.5 bg-black/5 mt-3 w-3/4 animate-pulse rounded" />
                      <div className="h-2 bg-black/5 mt-1.5 w-1/2 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <span className="block text-[10px] tracking-[0.38em] uppercase text-black/35 mb-5" style={clash}>
                Discover
              </span>

              <div className="flex flex-col mb-7">
                {DISCOVER_LINKS.map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={onClose}
                    className="flex items-center justify-between py-3.5 border-b border-black/[0.06] group"
                  >
                    <span className="text-[12.5px] tracking-[0.1em] uppercase text-[#0a0a0a] group-hover:opacity-40 transition-opacity" style={clash}>
                      {link.label}
                    </span>
                    <ArrowForwardOutlined
                      style={{ fontSize: 13 }}
                      className="text-black/20 group-hover:text-black/50 group-hover:translate-x-0.5 transition-all duration-200"
                    />
                  </Link>
                ))}
              </div>

              <div className="bg-[#0a0a0a] px-5 py-7">
                <span className="block text-[8.5px] tracking-[0.3em] uppercase text-white/30 mb-2" style={clash}>Every Friday</span>
                <p className="text-white/90 leading-snug mb-5" style={{ ...cg, fontSize: '1.3rem' }}>
                  Fresh drops,<br />every week.
                </p>
                <Link
                  to="/shop?orderby=date"
                  onClick={onClose}
                  className="flex items-center gap-1 text-[9px] tracking-[0.26em] uppercase text-white/45 hover:text-white/80 transition-colors"
                  style={clash}
                >
                  Shop now <ArrowForwardOutlined style={{ fontSize: 11 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom close strip */}
        <div className="flex-shrink-0 border-t border-black/[0.06] px-10 xl:px-16 py-4 flex items-center justify-between">
          <p className="text-[9px] tracking-[0.22em] uppercase text-black/22" style={clash}>
            Move away or press Esc to close
          </p>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[9px] tracking-[0.22em] uppercase text-black/30 hover:text-black/65 transition-colors"
            style={clash}
          >
            <CloseOutlined style={{ fontSize: 13 }} /> Close
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────────────────────────────
const SearchOverlay = ({ onClose }) => {
  const [query,  setQuery]  = useState('')
  const [recent, setRecent] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    try { setRecent(JSON.parse(localStorage.getItem('recentSearches') || '[]')) } catch {}
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { clearTimeout(t); window.removeEventListener('keydown', esc) }
  }, [onClose])

  const doSearch = useCallback((term) => {
    const q = term.trim()
    if (!q) return
    const params = new URLSearchParams(location.search)
    params.set('search', q)
    params.delete('page')
    try {
      const updated = [q, ...recent.filter(s => s !== q)].slice(0, 8)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch {}
    onClose()
    navigate(`/shop?${params.toString()}`)
  }, [location.search, recent, navigate, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[90] bg-white flex flex-col"
    >
      <div className="flex h-[70px] items-center gap-4 border-b border-black/[0.07] px-5 sm:px-8 lg:px-14 flex-shrink-0">
        <SearchOutlined style={{ fontSize: 20, color: '#0a0a0a', opacity: 0.28 }} />
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query) }} className="flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pieces, styles…"
            className="w-full bg-transparent outline-none text-[#0a0a0a] placeholder:text-black/20"
            style={{ ...cg, fontSize: 'clamp(1.15rem, 2.5vw, 1.65rem)' }}
          />
        </form>
        <button onClick={onClose} aria-label="Close search" className="text-black/28 hover:text-black/60 transition-colors p-1">
          <CloseOutlined style={{ fontSize: 20 }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-14 py-8 space-y-8">
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10.5px] tracking-[0.3em] uppercase text-black/30" style={clash}>Recent searches</span>
              <button
                onClick={() => { try { localStorage.removeItem('recentSearches') } catch {} setRecent([]) }}
                className="text-[10px] tracking-[0.18em] uppercase text-black/25 hover:text-black/55 transition-colors"
                style={clash}
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map(term => (
                <button
                  key={term}
                  onClick={() => doSearch(term)}
                  className="h-9 px-4 border border-black/10 text-[11px] tracking-[0.1em] text-black/50 hover:border-black/35 hover:text-black/80 transition-all"
                  style={clash}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <span className="block text-[10.5px] tracking-[0.3em] uppercase text-black/30 mb-4" style={clash}>Browse categories</span>
          <div className="flex flex-wrap gap-2">
            {QUICK_CATS.map(cat => (
              <button
                key={cat}
                onClick={() => doSearch(cat)}
                className="h-10 px-5 bg-[#f5f3f0] text-[11px] tracking-[0.1em] text-black/55 hover:bg-[#0a0a0a] hover:text-white transition-all"
                style={clash}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-5 sm:px-8 lg:px-14 pb-6 border-t border-black/[0.06] pt-4">
        <span className="text-[9px] tracking-[0.18em] uppercase text-black/20" style={clash}>
          Press Enter to search · Esc to close
        </span>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MOBILE DRAWER — white, accordion for Shop
// ─────────────────────────────────────────────────────────────────────
const MobileMenu = ({ categories, onClose, isLoggedIn }) => {
  const [shopOpen, setShopOpen] = useState(false)
  const navigate = useNavigate()

  const SECONDARY = [
    { label: 'About',   to: '/about'   },
    { label: 'Reviews', to: '/reviews' },
    { label: 'FAQs',    to: '/faqs'    },
  ]
  const DISCOVER = [
    { label: 'New arrivals',  to: '/shop?orderby=date'       },
    { label: 'On sale',       to: '/shop?on_sale=true'       },
    { label: 'Best sellers',  to: '/shop?orderby=popularity' },
  ]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const go = (to) => { onClose(); navigate(to) }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
        className="fixed top-0 left-0 bottom-0 z-[80] w-[min(340px,88vw)] bg-white flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-11 pb-5 border-b border-black/[0.07] flex-shrink-0">
          <Link
            to="/"
            onClick={onClose}
            style={{ ...logo, fontSize: '1.85rem', letterSpacing: '-0.01em' }}
            className="text-[#111]"
          >
            KayVogue
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="text-black/30 hover:text-black/70 transition-colors p-1">
            <CloseOutlined style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Shop accordion */}
          <div className="border-b border-black/[0.07]">
            <button
              onClick={() => setShopOpen(p => !p)}
              className="w-full flex items-center justify-between px-6 py-5 group"
            >
              <span className="text-[15px] tracking-[0.1em] uppercase text-[#111] group-hover:opacity-50 transition-opacity" style={clash}>
                Shop
              </span>
              <motion.span
                animate={{ rotate: shopOpen ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                className="text-black/30"
              >
                <KeyboardArrowDownOutlined style={{ fontSize: 22 }} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {shopOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden bg-[#f9f8f6]"
                >
                  <div className="px-6 pt-3 pb-6">
                    <p className="text-[9px] tracking-[0.38em] uppercase text-black/30 mb-3 mt-1" style={clash}>Discover</p>
                    {DISCOVER.map(({ label, to }) => (
                      <button
                        key={label}
                        onClick={() => go(to)}
                        className="w-full flex items-center justify-between py-3.5 border-b border-black/[0.06] group"
                      >
                        <span className="text-[13px] tracking-[0.08em] uppercase text-[#111] group-hover:opacity-45 transition-opacity" style={clash}>
                          {label}
                        </span>
                        <ArrowForwardOutlined style={{ fontSize: 14 }} className="text-black/20" />
                      </button>
                    ))}

                    {categories.length > 0 && (
                      <>
                        <p className="text-[9px] tracking-[0.38em] uppercase text-black/30 mb-4 mt-6" style={clash}>Categories</p>
                        {/* Image cards grid — images fully visible on mobile */}
                        <div className="grid grid-cols-2 gap-3">
                          {categories.slice(0, 8).map((cat) => {
                            const img = getCatImg(cat)
                            return (
                              <button
                                key={cat.id}
                                onClick={() => go(`/shop?category=${cat.id}`)}
                                className="group relative overflow-hidden rounded-none bg-[#ede9e3]"
                                style={{ aspectRatio: '4/3' }}
                              >
                                {img && (
                                  <img
                                    src={img}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
                                  />
                                )}
                                {/* Gradient for legible text over any image */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10">
                                  <p className="text-[11.5px] tracking-[0.06em] uppercase text-white font-medium leading-tight text-left" style={clash}>
                                    {cat.name}
                                  </p>
                                  {cat.count != null && (
                                    <p className="text-[9px] text-white/60 mt-0.5 text-left" style={clash}>
                                      {cat.count} pieces
                                    </p>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => go('/shop')}
                          className="mt-4 w-full flex items-center justify-center gap-2 border border-black/12 py-3.5 text-[11.5px] tracking-[0.2em] uppercase text-black/50 hover:border-black/30 hover:text-[#111] transition-all"
                          style={clash}
                        >
                          View all pieces
                          <ArrowForwardOutlined style={{ fontSize: 14 }} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secondary links */}
          {SECONDARY.map(({ label, to }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.12, duration: 0.32 }}
              className="border-b border-black/[0.07]"
            >
              <button
                onClick={() => go(to)}
                className="w-full flex items-center justify-between px-6 py-5 group"
              >
                <span className="text-[15px] tracking-[0.1em] uppercase text-[#111] group-hover:opacity-45 transition-opacity" style={clash}>
                  {label}
                </span>
                <ArrowForwardOutlined style={{ fontSize: 16 }} className="text-black/20" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.32 }}
          className="flex-shrink-0 px-6 pt-5 pb-8 border-t border-black/[0.07] space-y-3"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
        >
          <button
            onClick={() => go(isLoggedIn ? '/profile' : '/login')}
            className="w-full flex items-center justify-between bg-[#0a0a0a] px-5 py-4"
          >
            <span className="text-[11.5px] tracking-[0.3em] uppercase text-white/70" style={clash}>
              {isLoggedIn ? 'My account' : 'Sign in / Register'}
            </span>
            <PersonOutlineOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)' }} />
          </button>
          <p className="text-[8.5px] tracking-[0.22em] uppercase text-black/20" style={clash}>© 2025 KayVogue</p>
        </motion.div>
      </motion.div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────
const NavMenu = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [scrolled,         setScrolled]         = useState(false)
  const [openCart,         setOpenCart]         = useState(false)
  const [openSearch,       setOpenSearch]       = useState(false)
  const [openMobileMenu,   setOpenMobileMenu]   = useState(false)
  const [megaOpen,         setMegaOpen]         = useState(false)
  const [announcement,     setAnnouncement]     = useState(0)
  const [wcCategories,     setWcCategories]     = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])

  // Single shared timer — used by both nav trigger AND megamenu panel
  const megaTimer = useRef(null)
  const MEGA_DELAY = 280 // ms — enough to cross the gap between header and panel

  const { cartCount }     = useCart()
  const { wishlistCount } = useWishlist()
  const { isLoggedIn }    = useAuth()

  useLockScroll(openSearch || megaOpen || openMobileMenu || openCart)

  // ── Data ──────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    Promise.all([
      fetchCategories({ per_page: 20, hide_empty: true }),
      fetchProducts({ per_page: 14, orderby: 'date', order: 'desc' }),
    ])
      .then(([cats, prods]) => {
        if (!alive) return
        setWcCategories(Array.isArray(cats) ? cats : [])
        setFeaturedProducts(Array.isArray(prods) ? prods : [])
      })
      .catch(err => console.error('NavMenu data load:', err))
    return () => { alive = false }
  }, [])

  // ── Route change ──────────────────────────────────────────────────
  useEffect(() => {
    setOpenCart(false); setOpenSearch(false)
    setMegaOpen(false); setOpenMobileMenu(false)
  }, [location])

  // ── Scroll — only affects background, NOT height ──────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // ── Announcements ─────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setAnnouncement(a => (a + 1) % ANNOUNCEMENTS.length), 3600)
    return () => clearInterval(id)
  }, [])

  // ── ⌘K shortcut ──────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpenSearch(s => !s) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  // ── Mega hover — shared timer functions ───────────────────────────
  const openMega = useCallback(() => {
    clearTimeout(megaTimer.current)
    setMegaOpen(true)
  }, [])

  // Schedule close — fires only if neither nav nor panel re-enters in time
  const scheduleMegaClose = useCallback(() => {
    clearTimeout(megaTimer.current)
    megaTimer.current = setTimeout(() => setMegaOpen(false), MEGA_DELAY)
  }, [])

  // Cancel a pending close (mouse re-entered zone)
  const cancelMegaClose = useCallback(() => {
    clearTimeout(megaTimer.current)
  }, [])

  const closeMega = useCallback(() => {
    clearTimeout(megaTimer.current)
    setMegaOpen(false)
  }, [])

  // ── Colour ────────────────────────────────────────────────────────
  const isHero  = !scrolled && location.pathname === '/'
  const navBg   = scrolled
    ? 'bg-white/96 backdrop-blur-2xl border-b border-black/[0.055] shadow-[0_1px_0_rgba(0,0,0,0.04)]'
    : isHero
      ? 'bg-transparent'
      : 'bg-white border-b border-black/[0.055]'
  const tx      = isHero ? 'text-white'    : 'text-[#111]'
  const txMuted = isHero ? 'text-white/60' : 'text-black/42'

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/')

  const linkCls = (to) =>
    `text-[11.5px] tracking-[0.22em] uppercase transition-opacity duration-200 relative
     after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-current
     after:transition-[width] after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)]
     ${isActive(to)
       ? `${tx} after:w-full`
       : `${txMuted} after:w-0 hover:opacity-100 hover:after:w-full`}`

  return (
    <>
      {/* ── Announcement bar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
        style={{ height: ANNOUNCE_H }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={announcement}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-[10.5px] sm:text-[11px] tracking-[0.28em] uppercase text-white/55 text-center px-4"
            style={clash}
          >
            {ANNOUNCEMENTS[announcement]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Main header — height NEVER changes on scroll ── */}
      <header
        className={`fixed left-0 right-0 z-40 transition-colors duration-300 ${navBg}`}
        style={{ top: ANNOUNCE_H, height: HEADER_H }}
      >
        <div
          className="mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 h-full"
          style={{ maxWidth: 1500 }}
        >
          {/* Hamburger — mobile */}
          <button
            onClick={() => setOpenMobileMenu(true)}
            aria-label="Open menu"
            className={`${tx} md:hidden flex items-center justify-center w-10 h-10 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0`}
          >
            <MenuOutlined style={{ fontSize: 23 }} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            aria-label="KayVogue"
            className={`${tx} opacity-90 hover:opacity-55 transition-opacity duration-300
              absolute left-1/2 -translate-x-1/2
              md:static md:translate-x-0 md:left-auto`}
            style={{ ...logo, fontSize: 'clamp(1.65rem, 2.8vw, 2.05rem)', letterSpacing: '-0.015em' }}
          >
            KayVogue
          </Link>

          {/* Desktop nav — absolutely centred */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-8 lg:gap-10 absolute left-1/2 -translate-x-1/2"
          >
            {NAV_LINKS.map(link =>
              link.hasMega ? (
                <div
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={openMega}
                  onMouseLeave={scheduleMegaClose}
                >
                  {/*
                    Invisible bridge: fills the pixel gap between the bottom
                    of the nav button and the top of the megamenu panel so
                    the mouse never technically "leaves" a hover zone.
                  */}
                  <div
                    className="absolute left-0 right-0 pointer-events-auto"
                    style={{ top: '100%', height: HEADER_H / 2 }}
                    onMouseEnter={cancelMegaClose}
                    onMouseLeave={scheduleMegaClose}
                  />
                  <button
                    onClick={() => navigate(link.to)}
                    aria-haspopup="menu"
                    aria-expanded={megaOpen}
                    className={`${linkCls(link.to)} flex items-center gap-0.5`}
                    style={clash}
                  >
                    {link.label}
                    <motion.span
                      animate={{ rotate: megaOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex opacity-50"
                    >
                      <KeyboardArrowDownOutlined style={{ fontSize: 15 }} />
                    </motion.span>
                  </button>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                  className={linkCls(link.to)}
                  style={clash}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => setOpenSearch(true)}
              aria-label="Search (⌘K)"
              className={`${tx} hidden md:flex opacity-55 hover:opacity-100 transition-opacity`}
            >
              <SearchOutlined style={{ fontSize: 21 }} />
            </button>
            <button
              onClick={() => setOpenSearch(true)}
              aria-label="Search"
              className={`${tx} md:hidden opacity-65 hover:opacity-100 transition-opacity`}
            >
              <SearchOutlined style={{ fontSize: 22 }} />
            </button>

            <Link
              to="/wishlist"
              aria-label={`Wishlist${wishlistCount ? ` — ${wishlistCount}` : ''}`}
              className={`${tx} hidden md:flex opacity-55 hover:opacity-100 transition-opacity relative`}
            >
              <FavoriteBorderOutlined style={{ fontSize: 21 }} />
              <Badge count={wishlistCount} red />
            </Link>

            <Link
              to={isLoggedIn ? '/profile' : '/login'}
              aria-label="Account"
              className={`${tx} hidden md:flex opacity-55 hover:opacity-100 transition-opacity`}
            >
              <PersonOutlineOutlined style={{ fontSize: 21 }} />
            </Link>

            <button
              onClick={() => setOpenCart(true)}
              aria-label={`Bag${cartCount ? ` — ${cartCount}` : ''}`}
              className={`${tx} opacity-65 hover:opacity-100 transition-opacity relative`}
            >
              <ShoppingBagOutlined style={{ fontSize: 22 }} />
              <Badge count={cartCount} />
            </button>
          </div>
        </div>
      </header>

      {/* Mega menu — outside header so it can truly go full-height */}
      <AnimatePresence>
        {megaOpen && (
          <MegaMenu
            categories={wcCategories}
            featuredProducts={featuredProducts}
            onClose={closeMega}
            onPanelEnter={cancelMegaClose}
            onPanelLeave={scheduleMegaClose}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile bottom tab bar ── */}
      <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-white/96 backdrop-blur-2xl border-t border-black/[0.055]">
          <div className="grid grid-cols-5 h-[58px] max-w-sm mx-auto px-1">
            {[
              { label: 'Home',   icon: <HomeOutlined style={{ fontSize: 21 }} />, to: '/',    onClick: null },
              { label: 'Menu',   icon: <MenuOutlined style={{ fontSize: 21 }} />, to: null,   onClick: () => setOpenMobileMenu(true) },
              {
                label: isLoggedIn ? 'Account' : 'Sign in',
                icon: <PersonOutlineOutlined style={{ fontSize: 21 }} />,
                to: isLoggedIn ? '/profile' : '/login',
                onClick: null,
              },
              {
                label: 'Saved',
                icon: (
                  <div className="relative inline-flex">
                    <FavoriteBorderOutlined style={{ fontSize: 21 }} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-[6px] -right-[6px] min-w-[13px] h-[13px] px-[2px] rounded-full bg-[#c8472b] text-white flex items-center justify-center"
                        style={{ ...clash, fontSize: 6, fontWeight: 700 }}>
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </div>
                ),
                to: '/wishlist', onClick: null,
              },
              {
                label: 'Bag',
                icon: (
                  <div className="relative inline-flex">
                    <ShoppingBagOutlined style={{ fontSize: 21 }} />
                    {cartCount > 0 && (
                      <span className="absolute -top-[6px] -right-[6px] min-w-[13px] h-[13px] px-[2px] rounded-full bg-[#0a0a0a] text-white flex items-center justify-center"
                        style={{ ...clash, fontSize: 6, fontWeight: 700 }}>
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                ),
                to: null, onClick: () => setOpenCart(true),
              },
            ].map(({ label, icon, to, onClick }) => {
              const active = to
                ? to === '/' ? location.pathname === '/' : isActive(to)
                : false
              const base = 'flex flex-col items-center justify-center gap-[3px] transition-opacity duration-200'
              return onClick ? (
                <button key={label} onClick={onClick} aria-label={label}
                  className={`${base} opacity-35 hover:opacity-75`}>
                  <span className="text-[#111]">{icon}</span>
                  <span className="text-[7.5px] tracking-[0.12em] uppercase text-[#111]" style={clash}>{label}</span>
                </button>
              ) : (
                <Link key={label} to={to} aria-label={label}
                  className={`${base} ${active ? 'opacity-100' : 'opacity-35'}`}>
                  <span className="text-[#111]">{icon}</span>
                  <span className="text-[7.5px] tracking-[0.12em] uppercase text-[#111]" style={clash}>{label}</span>
                </Link>
              )
            })}
          </div>
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </nav>

      {/* ── Overlays ── */}
      <AnimatePresence>
        {openSearch && <SearchOverlay onClose={() => setOpenSearch(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {openCart && <Cart handleCart={() => setOpenCart(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {openMobileMenu && (
          <MobileMenu
            categories={wcCategories}
            onClose={() => setOpenMobileMenu(false)}
            isLoggedIn={isLoggedIn}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default NavMenu
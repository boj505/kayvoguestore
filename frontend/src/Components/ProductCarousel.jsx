import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../api/Woocommerce'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/useWishlist'

/* ─────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────── */
const clash = { fontFamily: 'Clash Display, sans-serif' }
const cg    = { fontFamily: 'Cormorant Garamond, serif' }

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const css = `
  .carousel-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0 20px 0 20px;
  }
  @media (min-width: 640px) {
    .carousel-scroll { gap: 16px; padding: 0 40px; }
  }
  @media (min-width: 1024px) {
    .carousel-scroll { padding: 0 80px; }
  }
  .carousel-scroll::-webkit-scrollbar { display: none; }

  .product-card {
    flex-shrink: 0;
    scroll-snap-align: start;
    width: 68vw;
  }
  @media (min-width: 480px)  { .product-card { width: 260px; } }
  @media (min-width: 768px)  { .product-card { width: 280px; } }
  @media (min-width: 1280px) { .product-card { width: 300px; } }

  /* Image zoom on hover */
  .card-img {
    transition: transform 0.75s cubic-bezier(.22,.68,0,1.1);
  }
  .product-card:hover .card-img { transform: scale(1.06); }

  /* Action buttons slide up */
  .card-actions {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  .product-card:hover .card-actions,
  .card-actions.touched {
    opacity: 1;
    transform: translateY(0);
  }

  /* Icon button */
  .icon-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: #fff;
    border: 1px solid rgba(0,0,0,.08);
    transition: background .2s ease, border-color .2s ease, transform .15s ease;
  }
  .icon-btn:hover  { background: #111; border-color: #111; }
  .icon-btn:active { transform: scale(.94); }
  .icon-btn:hover svg { stroke: #fff; }
  .icon-btn.active-wish { background: #111; border-color: #111; }
  .icon-btn.active-wish svg { stroke: #fff; fill: #fff; }
  .icon-btn.added-bag  { background: #111; border-color: #111; }
  .icon-btn.added-bag svg { stroke: #fff; }

  /* Nav arrow */
  .nav-arrow {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-center: center;
    background: #fff;
    border: 1px solid rgba(0,0,0,.1);
    transition: background .2s ease, border-color .2s ease;
  }
  .nav-arrow:hover  { background: #111; border-color: #111; }
  .nav-arrow:hover svg { stroke: #fff; }
  .nav-arrow:active { transform: scale(.95); }

  /* Progress dots */
  .dot {
    width: 20px; height: 2px;
    background: rgba(0,0,0,.15);
    transition: background .25s ease, width .25s ease;
  }
  .dot.active { background: #111; width: 32px; }

  /* Shimmer skeleton */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .skel {
    background: linear-gradient(90deg, #ede9e3 25%, #f5f3f0 50%, #ede9e3 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
  }

  /* Toast feedback */
  .feed-toast {
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: #111; color: #fff;
    padding: 10px 20px;
    font-size: 11px; letter-spacing: .25em; text-transform: uppercase;
    white-space: nowrap;
    opacity: 0;
    transition: opacity .25s ease;
    z-index: 999;
    pointer-events: none;
  }
  .feed-toast.show { opacity: 1; }

  @media (min-width: 768px) {
    .feed-toast { bottom: 32px; }
  }
`

/* ─────────────────────────────────────────────
   ICONS — inline SVG, no MUI dependency needed
───────────────────────────────────────────── */
const IconHeart = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#fff' : 'none'} stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" style={{ stroke: filled ? '#fff' : 'currentColor', transition: 'fill .2s ease' }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round"/>
  </svg>
)
const IconBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round"/>
    <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
const fmtPrice = (p) => {
  const n = Number(p)
  return Number.isNaN(n) ? String(p ?? '') : `₦${n.toLocaleString('en-NG')}`
}

const proxyImg = (src) => {
  if (!src || typeof src !== 'string') return null
  return src.startsWith('http')
    ? `/api/proxy-image?src=${encodeURIComponent(src)}`
    : src
}

const getProductImg = (p) => {
  const raw =
    p.imgSrc ||
    p.image?.src ||
    p.images?.[0]?.src ||
    p.image?.source_url ||
    p.images?.[0]?.source_url ||
    null
  return proxyImg(raw)
}

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="product-card">
    <div className="skel w-full aspect-[3/4] mb-3" />
    <div className="skel h-3 w-3/4 mb-2 rounded" />
    <div className="skel h-3 w-1/3 rounded" />
  </div>
)

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
const ProductCard = ({ product }) => {
  const { addToCart }         = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [bagAdded,   setBagAdded]   = useState(false)
  const [touched,    setTouched]    = useState(false)   // mobile tap reveal
  const [imgError,   setImgError]   = useState(false)

  const inWishlist = isInWishlist?.(product.id) ?? false
  const imgSrc     = imgError ? null : getProductImg(product)

  const handleBag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart?.({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      quantity: 1,
      image:    imgSrc,
    })
    setBagAdded(true)
    setTimeout(() => setBagAdded(false), 1800)
  }

  const handleWish = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist?.(product)
  }

  const handleCardTouch = () => setTouched(p => !p)

  return (
    <div
      className="product-card group"
      onClick={handleCardTouch}
      onMouseLeave={() => setTouched(false)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#ede9e3] aspect-[3/4] mb-3">
        <Link to={`/product/${product.id}`} onClick={e => e.stopPropagation()}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="card-img w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#ede9e3]">
              <span className="text-[9px] tracking-[0.3em] uppercase text-black/25" style={clash}>
                No image
              </span>
            </div>
          )}
        </Link>

        {/* Sale badge */}
        {product.on_sale && (
          <div className="absolute top-3 left-3 bg-[#111] px-2.5 py-1">
            <span className="text-[9px] tracking-[0.3em] uppercase text-white" style={clash}>Sale</span>
          </div>
        )}

        {/* Action buttons */}
        <div className={`card-actions absolute bottom-3 right-3 flex flex-col gap-2 ${touched ? 'touched' : ''}`}>
          {/* Wishlist */}
          <button
            onClick={handleWish}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`icon-btn ${inWishlist ? 'active-wish' : ''}`}
          >
            <IconHeart filled={inWishlist} />
          </button>

          {/* Add to bag */}
          <button
            onClick={handleBag}
            aria-label="Add to bag"
            className={`icon-btn ${bagAdded ? 'added-bag' : ''}`}
          >
            <IconBag />
          </button>
        </div>
      </div>

      {/* Info */}
      <Link to={`/product/${product.id}`} onClick={e => e.stopPropagation()}>
        <p
          className="text-[13px] text-[#111] leading-snug truncate mb-1 hover:opacity-55 transition-opacity"
          style={clash}
        >
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[12px] text-[#111] font-medium" style={clash}>
            {fmtPrice(product.sale_price || product.price)}
          </p>
          {product.on_sale && product.regular_price && (
            <p className="text-[11px] text-black/35 line-through" style={clash}>
              {fmtPrice(product.regular_price)}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN CAROUSEL
───────────────────────────────────────────── */
const ProductCarousel = ({
  products: initialProducts,
  category = 'joggers',       // WooCommerce category slug
  categoryId,                  // optionally pass numeric ID
  title = "Joggers you'd love.",
  subtitle = 'Easy fits for every day.',
  limit = 12,
  showHeader = true,
  shopLink = '/category/joggers',
}) => {
  const scrollRef = useRef(null)
  const [products, setProducts] = useState(initialProducts || [])
  const [loading,  setLoading]  = useState(!initialProducts?.length)
  const [error,    setError]    = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  // const [toast,    setToast]    = useState('')
  // const toastRef = useRef(null)

  /* ── Fetch from WooCommerce by category slug ── */
  useEffect(() => {
    if (initialProducts?.length) return

    let alive = true
    setLoading(true)
    setError(false)

    const loadProducts = async () => {
      try {
        let catId = categoryId

        // If no categoryId provided, fetch categories to resolve slug to ID
        if (!catId && category) {
          try {
            const categoriesData = await fetchCategories({ 
              slug: category,
              per_page: 1 
            })
            const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories ?? []
            if (categories.length > 0) {
              catId = categories[0].id
            }
          } catch (err) {
            console.warn(`Could not fetch category ID for "${category}":`, err)
            // Continue anyway - will try search parameter instead
          }
        }

        // Build params for fetching products
        const params = {
          per_page: limit,
          orderby: 'date',
          order: 'desc',
        }

        // If we have a category ID, use it; otherwise use search
        if (catId) {
          params.category = catId
        } else if (category) {
          // Fallback: search by category name
          params.search = category
        }

        const data = await fetchProducts(params)
        if (!alive) return

        const list = Array.isArray(data) ? data : data?.products ?? []
        setProducts(list.length > 0 ? list : [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
        if (alive) setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadProducts()
    return () => { alive = false }
  }, [category, categoryId, limit, initialProducts])

  /* ── Auto-scroll ── */
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !products.length) return

    const id = setInterval(() => {
      if (document.hidden) return
      const cardW = el.querySelector('.product-card')?.offsetWidth ?? 280
      const gap   = 16
      const next  = el.scrollLeft + cardW + gap

      if (next >= el.scrollWidth - el.offsetWidth) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: cardW + gap, behavior: 'smooth' })
      }
    }, 4000)

    return () => clearInterval(id)
  }, [products])

  /* ── Track active index for dot indicator ── */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const cardW = el.querySelector('.product-card')?.offsetWidth ?? 280
      setActiveIndex(Math.round(el.scrollLeft / (cardW + 16)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [products])

  /* ── Nav ── */
  const scroll = useCallback((dir) => {
    const el  = scrollRef.current
    if (!el) return
    const cardW = el.querySelector('.product-card')?.offsetWidth ?? 280
    el.scrollBy({ left: dir === 'left' ? -(cardW + 16) : (cardW + 16), behavior: 'smooth' })
  }, [])

  // const showToast = (msg) => {
  //   setToast(msg)
  //   clearTimeout(toastRef.current)
  //   toastRef.current = setTimeout(() => setToast(''), 1800)
  // }

  const visibleDots = Math.min(products.length, 6)

  return (
    <>
      <style>{css}</style>

      <div className="w-full bg-[#f9f8f6]"  style={clash}>

        {/* ── Header ── */}
        {showHeader && (
          <div className="flex items-end justify-between px-5 sm:px-10 lg:px-20 mb-7 sm:mb-9">
            <div>
              <p className="text-[9px] tracking-[0.52em] uppercase text-black/30 mb-2.5">
                Collection
              </p>
              <h2
                className="leading-tight tracking-[-0.015em] text-[#111]"
                style={{ ...cg, fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontWeight: 600 }}
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12.5px] text-black/45 mt-1.5" style={clash}>
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 mb-1">
              {/* Desktop arrows */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  aria-label="Scroll left"
                  className="nav-arrow"
                >
                  <IconChevronLeft />
                </button>
                <button
                  onClick={() => scroll('right')}
                  aria-label="Scroll right"
                  className="nav-arrow"
                >
                  <IconChevronRight />
                </button>
              </div>

              {/* View all */}
              <Link
                to={shopLink}
                className="hidden sm:inline-flex items-center gap-2 border border-black/15 px-5 py-2.5 text-[10px] tracking-[0.3em] uppercase text-[#111] hover:bg-[#111] hover:text-white hover:border-[#111] transition-all duration-200"
              >
                View all
                <IconArrow />
              </Link>
            </div>
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="carousel-scroll pb-2">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="px-5 sm:px-10 lg:px-20 py-16 text-center">
            <p style={{ ...cg, fontSize: '1.4rem', fontWeight: 600 }} className="text-[#111] mb-2">
              Couldn't load products
            </p>
            <p className="text-[12.5px] text-black/40 mb-6" style={clash}>
              Please check your connection and try again.
            </p>
            <button
              onClick={() => { setError(false); setLoading(true) }}
              className="border border-black/15 px-6 py-3 text-[10px] tracking-[0.3em] uppercase text-[#111] hover:bg-[#111] hover:text-white transition-all"
              style={clash}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && products.length === 0 && (
          <div className="px-5 sm:px-10 lg:px-20 py-16 text-center">
            <p style={{ ...cg, fontSize: '1.4rem', fontWeight: 600 }} className="text-[#111] mb-2">
              No pieces found
            </p>
            <p className="text-[12.5px] text-black/40" style={clash}>
              Check back on Friday — new drops land weekly.
            </p>
          </div>
        )}

        {/* ── Carousel ── */}
        {!loading && !error && products.length > 0 && (
          <div className="relative">
            <div ref={scrollRef} className="carousel-scroll pb-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

              {/* "View all" end card */}
              <div className="product-card flex items-center justify-center bg-white border border-black/[0.07] aspect-[3/4]">
                <Link
                  to={shopLink}
                  className="flex flex-col items-center gap-4 group px-6"
                >
                  <div className="w-10 h-10 border border-black/15 flex items-center justify-center group-hover:bg-[#111] group-hover:border-[#111] transition-all duration-200">
                    <span className="group-hover:[&_svg]:stroke-white">
                      <IconArrow />
                    </span>
                  </div>
                  <p
                    className="text-[10px] tracking-[0.35em] uppercase text-black/40 group-hover:text-[#111] transition-colors text-center"
                    style={clash}
                  >
                    View all {title}
                  </p>
                </Link>
              </div>
            </div>

            {/* Mobile arrows */}
            <div className="flex md:hidden items-center justify-between px-5 mt-5">
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: visibleDots }).map((_, i) => (
                  <div key={i} className={`dot ${i === activeIndex % visibleDots ? 'active' : ''}`} />
                ))}
              </div>

              {/* Arrow pair */}
              <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')}  aria-label="Scroll left"  className="nav-arrow">
                  <IconChevronLeft />
                </button>
                <button onClick={() => scroll('right')} aria-label="Scroll right" className="nav-arrow">
                  <IconChevronRight />
                </button>
              </div>
            </div>

            {/* Desktop dots */}
            <div className="hidden md:flex items-center justify-center gap-1.5 mt-6 pb-1">
              {Array.from({ length: visibleDots }).map((_, i) => (
                <div key={i} className={`dot ${i === activeIndex % visibleDots ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile "View all" link */}
        {!loading && !error && products.length > 0 && (
          <div className="flex sm:hidden justify-center mt-6 px-5">
            <Link
              to={shopLink}
              className="w-full flex items-center justify-center gap-2 border border-black/15 py-3.5 text-[10px] tracking-[0.32em] uppercase text-[#111] hover:bg-[#111] hover:text-white transition-all"
            >
              View all {title}
              <IconArrow />
            </Link>
          </div>
        )}
      </div>

      {/* Feedback toast */}
      {/* <div className={`feed-toast ${toast ? 'show' : ''}`} style={clash}>
        {toast}
      </div> */}
    </>
  )
}

export default ProductCarousel
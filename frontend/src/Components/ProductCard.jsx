import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FavoriteBorderOutlined,
  FavoriteOutlined,
  AddOutlined,
} from '@mui/icons-material'

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const fallbackImage = 'https://via.placeholder.com/700x900/f0ede8/111111?text=+'

const getProductImage = (product) => {
  const url = product?.images?.[0]?.src || product?.img || product?.image
  if (!url) return fallbackImage
  return url.startsWith('http') ? `/api/proxy-image?src=${encodeURIComponent(url)}` : url
}

export default function ProductCard({
  product,
  index = 0,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) {
  const navigate = useNavigate()
  const [src, setSrc]           = useState(getProductImage(product))
  const [wished, setWished]     = useState(isWishlisted)
  const [added, setAdded]       = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    setWished(isWishlisted)
  }, [isWishlisted])

  const handleCardClick = (event) => {
    if (event.target.closest('button, a')) return
    if (product?.id) navigate(`/product/${product.id}`)
  }

  const brand        = product?.categories?.[0]?.name || product?.brand || 'Kayvogue'
  const isOnSale     = product?.on_sale
  const hasDiscount  =
    product?.regular_price &&
    Number(product.regular_price) > Number(product.price)
  const discountPct  = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.regular_price)) * 100)
    : null

  const handleWishlist = () => {
    setWished(v => !v)
    onToggleWishlist?.(product)
  }

  const handleCart = () => {
    setAdded(true)
    onAddToCart?.(product)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col cursor-pointer"
      style={{
        animationDelay: `${(index % 8) * 60}ms`,
        animation: 'fadeUp 0.5s ease both',
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      {/* ── Image Container ─────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-[#f0ede8]" style={{ aspectRatio: '3/4' }}>

        {/* Shimmer skeleton while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0ede8] via-[#e8e4de] to-[#f0ede8] animate-pulse" />
        )}

        <Link to={`/product/${product.id}`} tabIndex={-1}>
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setSrc(fallbackImage)}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04] ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </Link>

        {/* ── Badges ──────────────────────────────────────────────────────── */}
        {isOnSale && discountPct && (
          <span
            className="absolute left-3 top-3 bg-[#111] px-2 py-0.5 text-[9px] uppercase tracking-[0.25em] text-white"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            −{discountPct}%
          </span>
        )}

        {/* ── Wishlist (top-right) ─────────────────────────────────────────── */}
        <button
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
        >
          {wished
            ? <FavoriteOutlined    style={{ fontSize: 17, color: '#111' }} />
            : <FavoriteBorderOutlined style={{ fontSize: 17, color: '#111' }} />}
        </button>

        {/* ── Add to Cart — slides up on hover ────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleCart}
            className={`w-full py-3 text-[10px] uppercase tracking-[0.3em] transition-colors duration-200 flex items-center justify-center gap-2 ${
              added
                ? 'bg-[#111] text-white'
                : 'bg-white/95 backdrop-blur-sm text-[#111] hover:bg-[#111] hover:text-white'
            }`}
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {added ? (
              <>
                <span>Added</span>
                <span className="text-base leading-none">·</span>
              </>
            ) : (
              <>
                <AddOutlined style={{ fontSize: 12 }} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile cart button (always visible on small screens) */}
        <button
          onClick={handleCart}
          aria-label="Add to cart"
          className="sm:hidden absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm"
        >
          <AddOutlined style={{ fontSize: 16 }} />
        </button>
      </div>

      {/* ── Product Info ─────────────────────────────────────────────────────── */}
      <div className="mt-3.5 flex flex-col gap-1 px-0.5">

        {/* Brand */}
        <p
          className="text-[9px] uppercase tracking-[0.35em] text-[#aaa]"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          {brand}
        </p>

        {/* Name */}
        <Link to={`/product/${product.id}`} className="group/link">
          <h3
            className="text-[15px] font-light leading-snug text-[#111] line-clamp-2 group-hover/link:text-[#555] transition-colors"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div className="mt-0.5 flex items-baseline gap-2">
          <span
            className="text-[13px] font-medium tracking-wide text-[#111]"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {fmt(product.price)}
          </span>
          {hasDiscount && (
            <span
              className="text-[11px] text-[#bbb] line-through"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              {fmt(product.regular_price)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
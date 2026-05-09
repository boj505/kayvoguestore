import { useState, useRef } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowForwardOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  StarOutlined,
} from '@mui/icons-material'
import { useCart } from '../context/CartContext'

// ─────────────────────────────────────────────────────────────────────
// MOCK DATA — replace with real product from WooCommerce API
// ─────────────────────────────────────────────────────────────────────
const PRODUCT = {
  id: 14,
  slug: 'oversized-signature-hoodie',
  name: 'Signature Oversized Hoodie',
  category: 'Hoodies',
  tagline: 'The piece everyone reaches for.',
  description:
    'Heavyweight 400gsm fleece with a dropped shoulder and a lived-in drape that only gets better with time. Designed for wear, not display.',
  price: 18500,
  regular_price: 24000,
  on_sale: true,
  rating: 4.8,
  review_count: 134,
  stock_status: 'instock',
  details: ['400gsm fleece', 'Dropped shoulder', 'Unisex fit', 'Pre-shrunk'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: [
    { name: 'Bone',  hex: '#e8e0d4' },
    { name: 'Slate', hex: '#7a8591' },
    { name: 'Onyx',  hex: '#1a1a1a' },
    { name: 'Mocha', hex: '#8b6f5e' },
  ],
  images: {
    primary:   '../../src/assets/hd14.jpg',
    secondary: '../../src/assets/hd10.jpg',
    detail1:   '../../src/assets/cp1.jpg',
    detail2:   '../../src/assets/sw18.jpg',
  },
}

const fmt = (n) => `₦${Number(n).toLocaleString('en-NG')}`

// ─── Animation presets ────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 22 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
  },
})

const fadeIn = (delay = 0) => ({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, delay } },
})

// ─── Star rating ──────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <StarOutlined
        key={s}
        style={{
          fontSize: 11,
          color: s <= Math.round(rating) ? '#0a0a0a' : 'transparent',
          WebkitTextStroke: s <= Math.round(rating) ? 'none' : '1px rgba(10,10,10,0.25)',
        }}
      />
    ))}
  </div>
)

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function ProductHighlight() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const { addToCart } = useCart()

  const [activeColor, setActiveColor] = useState(PRODUCT.colors[2])
  const [activeSize,  setActiveSize]  = useState('')
  const [wished,      setWished]      = useState(false)
  const [imageHover,  setImageHover]  = useState(false)
  const [added,       setAdded]       = useState(false)
  const [sizeError,   setSizeError]   = useState(false)

  const handleAddToCart = () => {
    if (!activeSize) { setSizeError(true); return }
    setSizeError(false)
    addToCart({ ...PRODUCT, selectedSize: activeSize, selectedColor: activeColor.name })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <section
      ref={ref}
      aria-label={`Product spotlight: ${PRODUCT.name}`}
      style={{
        width: '100%',
        background: '#faf9f7',
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)',
      }}
    >
      {/* ── Section label ── */}
      <motion.div
        variants={fadeIn(0)}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
          maxWidth: 1200,
          margin: '0 auto clamp(2rem, 5vw, 3.5rem)',
        }}
      >
        <span
          style={{
            fontFamily: '"clash_display", sans-serif',
            fontSize: 9, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.35,
          }}
        >
          Staff Pick
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(10,10,10,0.1)' }} />
        <Link
          to="/shop"
          style={{
            fontFamily: '"clash_display", sans-serif',
            fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.35,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.35'}
        >
          View all <ArrowForwardOutlined style={{ fontSize: 11 }} />
        </Link>
      </motion.div>

      {/* ── Main grid ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(2rem, 5vw, 5rem)',
          alignItems: 'start',
        }}
      >

        {/* ════ LEFT — Image stack ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Primary image */}
          <motion.div
            variants={fadeIn(0.1)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ position: 'relative', overflow: 'hidden', background: '#f0ece6' }}
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}
          >
            {/* Sale badge */}
            {PRODUCT.on_sale && (
              <div
                aria-label="Sale"
                style={{
                  position: 'absolute', top: '1.2rem', left: '1.2rem', zIndex: 2,
                  background: '#0a0a0a',
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#fff', padding: '5px 10px',
                }}
              >
                Sale
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={() => setWished(w => !w)}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                position: 'absolute', top: '1.1rem', right: '1.1rem', zIndex: 2,
                background: 'rgba(250,249,247,0.85)',
                border: 'none', cursor: 'pointer',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {wished
                ? <FavoriteOutlined    style={{ fontSize: 16, color: '#c8472b' }} />
                : <FavoriteBorderOutlined style={{ fontSize: 16, color: '#0a0a0a', opacity: 0.45 }} />}
            </button>

            {/* Images */}
            <Link to={`/product/${PRODUCT.id}`} aria-label={`View ${PRODUCT.name}`}>
              <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                <img
                  src={PRODUCT.images.primary}
                  alt={`${PRODUCT.name} — primary view`}
                  loading="eager"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'top',
                    display: 'block',
                    transition: 'opacity 0.5s ease, transform 0.7s ease',
                    opacity: imageHover ? 0 : 1,
                    transform: imageHover ? 'scale(1.03)' : 'scale(1)',
                  }}
                />
                <img
                  src={PRODUCT.images.secondary}
                  alt={`${PRODUCT.name} — alternate view`}
                  loading="lazy"
                  aria-hidden="true"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'top',
                    display: 'block',
                    transition: 'opacity 0.5s ease, transform 0.7s ease',
                    opacity: imageHover ? 1 : 0,
                    transform: imageHover ? 'scale(1)' : 'scale(1.03)',
                  }}
                />
              </div>
            </Link>
          </motion.div>

          {/* Detail thumbnails */}
          <motion.div
            variants={fadeIn(0.25)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}
          >
            {[PRODUCT.images.detail1, PRODUCT.images.detail2].map((src, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '3/2', overflow: 'hidden',
                  background: '#ede9e3', cursor: 'pointer',
                }}
              >
                <img
                  src={src}
                  alt={`${PRODUCT.name} detail ${i + 1}`}
                  loading="lazy"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    display: 'block',
                    transition: 'transform 0.6s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* ════ RIGHT — Product info ════ */}
        <div style={{ paddingTop: 'clamp(0rem, 2vw, 1.5rem)' }}>

          {/* Category + rating row */}
          <motion.div
            variants={fadeUp(0.15)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}
          >
            <span
              style={{
                fontFamily: '"clash_display", sans-serif',
                fontSize: 9, letterSpacing: '0.24em',
                textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.35,
              }}
            >
              {PRODUCT.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Stars rating={PRODUCT.rating} />
              <span
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 9, letterSpacing: '0.1em',
                  color: '#0a0a0a', opacity: 0.35,
                }}
              >
                {PRODUCT.rating} ({PRODUCT.review_count})
              </span>
            </div>
          </motion.div>

          {/* Product name — SEO h1 */}
          <motion.h1
            variants={fadeUp(0.2)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              lineHeight: 1.08, color: '#0a0a0a',
              margin: '0 0 0.6rem',
            }}
          >
            {PRODUCT.name}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeUp(0.25)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              fontFamily: '"clash_display", sans-serif',
              fontSize: 10, letterSpacing: '0.08em',
              color: '#0a0a0a', opacity: 0.4,
              margin: '0 0 1.6rem',
            }}
          >
            {PRODUCT.tagline}
          </motion.p>

          {/* Price */}
          <motion.div
            variants={fadeUp(0.3)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1.6rem' }}
          >
            <span
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.9rem', fontWeight: 400, color: '#0a0a0a',
              }}
            >
              {fmt(PRODUCT.price)}
            </span>
            {PRODUCT.on_sale && (
              <span
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '1.2rem', color: '#0a0a0a', opacity: 0.3,
                  textDecoration: 'line-through',
                }}
              >
                {fmt(PRODUCT.regular_price)}
              </span>
            )}
            {PRODUCT.on_sale && (
              <span
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 8.5, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#2a7a4b',
                  border: '1px solid rgba(42,122,75,0.3)',
                  padding: '3px 8px',
                }}
              >
                Save {fmt(PRODUCT.regular_price - PRODUCT.price)}
              </span>
            )}
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeIn(0.32)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ height: 1, background: 'rgba(10,10,10,0.08)', marginBottom: '1.6rem' }}
          />

          {/* Color selector */}
          <motion.div
            variants={fadeUp(0.35)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ marginBottom: '1.6rem' }}
          >
            <p
              style={{
                fontFamily: '"clash_display", sans-serif',
                fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.4,
                marginBottom: '0.75rem',
              }}
            >
              Colour — <span style={{ opacity: 0.9 }}>{activeColor.name}</span>
            </p>
            <div style={{ display: 'flex', gap: 10 }} role="radiogroup" aria-label="Select colour">
              {PRODUCT.colors.map((c) => (
                <button
                  key={c.name}
                  role="radio"
                  aria-checked={activeColor.name === c.name}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setActiveColor(c)}
                  style={{
                    width: 26, height: 26,
                    borderRadius: '50%',
                    background: c.hex,
                    border: activeColor.name === c.name
                      ? '2px solid #0a0a0a'
                      : '2px solid transparent',
                    outline: activeColor.name === c.name
                      ? '2px solid rgba(10,10,10,0.12)'
                      : 'none',
                    outlineOffset: 2,
                    cursor: 'pointer',
                    transition: 'outline 0.15s, border 0.15s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Size selector */}
          <motion.div
            variants={fadeUp(0.4)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ marginBottom: '1.8rem' }}
          >
            <div
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '0.75rem',
              }}
            >
              <p
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 9, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.4, margin: 0,
                }}
              >
                Size {activeSize && `— ${activeSize}`}
              </p>
              <button
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 9, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.3,
                  background: 'none', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                }}
              >
                Size guide
              </button>
            </div>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
              role="radiogroup"
              aria-label="Select size"
            >
              {PRODUCT.sizes.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={activeSize === s}
                  onClick={() => { setActiveSize(s); setSizeError(false) }}
                  style={{
                    width: 44, height: 44,
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 10, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: activeSize === s ? '#0a0a0a' : 'transparent',
                    color: activeSize === s ? '#fff' : 'rgba(10,10,10,0.55)',
                    border: activeSize === s
                      ? '1px solid #0a0a0a'
                      : sizeError
                        ? '1px solid rgba(200,71,43,0.5)'
                        : '1px solid rgba(10,10,10,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && (
              <p
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 9, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#c8472b',
                  marginTop: 8,
                }}
                role="alert"
              >
                Please select a size
              </p>
            )}
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeUp(0.45)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2rem' }}
          >
            <button
              onClick={handleAddToCart}
              disabled={PRODUCT.stock_status !== 'instock'}
              aria-label={`Add ${PRODUCT.name} to cart`}
              style={{
                height: 54,
                background: added ? '#2a7a4b' : '#0a0a0a',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.3s ease',
              }}
            >
              <span
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 10.5, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: '#fff',
                }}
              >
                {added ? '✓ Added to Bag' : 'Add to Bag'}
              </span>
              {!added && (
                <ArrowForwardOutlined style={{ fontSize: 14, color: '#fff', opacity: 0.7 }} />
              )}
            </button>

            <Link
              to={`/product/${PRODUCT.id}`}
              style={{
                height: 48,
                border: '1px solid rgba(10,10,10,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                fontFamily: '"clash_display", sans-serif',
                fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(10,10,10,0.55)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(10,10,10,0.5)'; e.currentTarget.style.color = '#0a0a0a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(10,10,10,0.15)'; e.currentTarget.style.color = 'rgba(10,10,10,0.55)' }}
            >
              View Full Details
            </Link>
          </motion.div>

          {/* Product details chips */}
          <motion.div
            variants={fadeUp(0.5)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ marginBottom: '2rem' }}
          >
            <p
              style={{
                fontFamily: '"clash_display", sans-serif',
                fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.3,
                marginBottom: '0.65rem',
              }}
            >
              Details
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRODUCT.details.map((d) => (
                <span
                  key={d}
                  style={{
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 9, letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(10,10,10,0.5)',
                    border: '1px solid rgba(10,10,10,0.1)',
                    padding: '5px 10px',
                    background: '#fff',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Description — SEO friendly */}
          <motion.div
            variants={fadeUp(0.55)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              borderTop: '1px solid rgba(10,10,10,0.07)',
              paddingTop: '1.4rem',
            }}
          >
            <p
              style={{
                fontFamily: '"clash_display", sans-serif',
                fontSize: 10.5, letterSpacing: '0.05em',
                lineHeight: 1.9, color: '#0a0a0a', opacity: 0.45,
                margin: 0,
              }}
            >
              {PRODUCT.description}
            </p>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeUp(0.6)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              display: 'flex', flexWrap: 'wrap', gap: '1.2rem',
              borderTop: '1px solid rgba(10,10,10,0.07)',
              paddingTop: '1.4rem', marginTop: '1.4rem',
            }}
          >
            {[
              { label: 'Free delivery', sub: 'Orders above ₦50,000' },
              { label: 'Easy returns',  sub: '14-day return policy'  },
              { label: 'Authentic',     sub: 'Quality guaranteed'    },
            ].map((t) => (
              <div key={t.label} style={{ flex: '1 1 120px' }}>
                <p
                  style={{
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 9, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: '#0a0a0a',
                    margin: '0 0 3px',
                  }}
                >
                  {t.label}
                </p>
                <p
                  style={{
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 8.5, letterSpacing: '0.1em',
                    color: '#0a0a0a', opacity: 0.3,
                    margin: 0, textTransform: 'none',
                  }}
                >
                  {t.sub}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
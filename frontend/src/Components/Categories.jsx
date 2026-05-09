import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowForwardOutlined } from '@mui/icons-material'
import { fetchCategories } from '../api/Woocommerce'

/**
 * CLEAN + MOBILE FRIENDLY
 * Fetches REAL WooCommerce categories from:
 * kayvogue.local.com (via your existing fetchCategories helper)
 *
 * Expected helper:
 * fetchCategories(params)
 * -> should call /wp-json/wc/v3/products/categories
 */

// fallback images (replace with better category banners anytime)
import img1 from '../../src/assets/show1.jpg'
import img2 from '../../src/assets/show2.jpg'
import img3 from '../../src/assets/show3.jpg'
import img4 from '../../src/assets/show4.jpg'
import img5 from '../../src/assets/hd12.jpg'
import img6 from '../../src/assets/hd14.jpg'
import img7 from '../../src/assets/hd15.jpg'

const FALLBACK_IMAGES = [img1, img2, img3, img4, img5, img6, img7]

const formatCategory = (cat, index) => {
  const fallbackImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  const imageUrl = cat.image?.src

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: `${cat.count || 0} pieces`,
    image: imageUrl
      ? `/api/proxy-image?src=${encodeURIComponent(imageUrl)}`
      : fallbackImage,
    fallbackImage,
    to: `/category/${cat.slug}`,
  }
}

const CategoryCard = ({ item, tall = false }) => {
  const [hovered, setHovered] = useState(false)
  const [src, setSrc] = useState(item.image || item.fallbackImage)

  return (
    <Link
      to={item.to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block overflow-hidden rounded-2xl bg-[#f3f0eb]"
      style={{ height: tall ? '480px' : '230px' }}
    >
      <img
        src={src}
        alt={item.name}
        onError={() => setSrc(item.fallbackImage)}
        className="h-full w-full object-cover object-top transition duration-700"
        style={{
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <p className="mb-1 text-[8px] uppercase tracking-[0.25em] text-white/60">
          {item.count}
        </p>

        <div className="flex items-end justify-between gap-3">
          <h3
            className="text-white leading-none"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: tall
                ? 'clamp(1.9rem,3vw,2.7rem)'
                : 'clamp(1.1rem,2vw,1.6rem)',
            }}
          >
            {item.name}
          </h3>

          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition group-hover:translate-x-1">
            <ArrowForwardOutlined
              style={{ fontSize: 14, color: '#fff' }}
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

const Skeleton = ({ tall = false }) => (
  <div
    className="animate-pulse rounded-2xl bg-[#ece8e2]"
    style={{ height: tall ? '480px' : '230px' }}
  />
)

export default function Categories({
  maxItems = Infinity,
  showViewAll = false,
  viewAllPath = '/shop',
  compact = false,
  activeCategory = null,
  onSelect = null,
}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await fetchCategories({
          per_page: 100,
          orderby: 'count',
          order: 'desc',
          hide_empty: true,
        })

        const clean = Array.isArray(data)
          ? data
              .filter(
                (cat) =>
                  cat.name?.toLowerCase() !== 'uncategorized'
              )
              .map(formatCategory)
          : []

        setCategories(clean)
      } catch (err) {
        console.error(err)
        setError('Unable to load categories.')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const visibleCategories = useMemo(
    () => (Number.isFinite(maxItems) ? categories.slice(0, maxItems) : categories),
    [categories, maxItems]
  )
  const hero = useMemo(() => visibleCategories.slice(0, 2), [visibleCategories])
  const grid = useMemo(() => visibleCategories.slice(2), [visibleCategories])
  const hasMore = categories.length > visibleCategories.length

  const pillButton = (item) => {
    const active = activeCategory === item.slug
    const classes = `rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition ${active ? 'bg-black text-white border-black' : 'bg-white text-[#111] border-[#ccc] hover:border-black'}`

    if (onSelect) {
      return (
        <button
          key={item.id}
          onClick={() => onSelect(item.slug)}
          className={classes}
          type='button'
        >
          {item.name}
        </button>
      )
    }

    return (
      <Link key={item.id} to={item.to} className={classes}>
        {item.name}
      </Link>
    )
  }

  if (compact) {
    return (
      <div className='flex flex-wrap gap-2'>
        {visibleCategories.map((item) => pillButton(item))}
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-black/35">
            Browse
          </p>

          <h2
            className="text-[#0a0a0a] leading-none"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(2rem,4vw,3.3rem)',
            }}
          >
            Shop by Category
          </h2>
        </div>

        {hasMore && showViewAll && (
          <Link
            to={viewAllPath}
            className="hidden items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-black/45 transition hover:text-black md:flex"
          >
            View All
            <ArrowForwardOutlined style={{ fontSize: 13 }} />
          </Link>
        )}
      </div>

      <div className="mb-8 h-px bg-black/10" />

      {/* Error */}
      {error && (
        <div className="py-20 text-center">
          <p className="text-sm text-black/50">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <>
          {/* Desktop */}
          <div className="hidden gap-3 md:grid">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton tall />
              <Skeleton tall />
            </div>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      {!loading && !error && categories.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden flex-col gap-3 md:flex">
            {hero.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {hero.map((item) => (
                  <CategoryCard
                    key={item.id}
                    item={item}
                    tall
                  />
                ))}
              </div>
            )}

            {grid.length > 0 && (
              <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
                {grid.map((item) => (
                  <CategoryCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {visibleCategories.map((item, index) => (
                <div
                  key={item.id}
                  className={
                    index === visibleCategories.length - 1 &&
                    visibleCategories.length % 2 !== 0
                      ? 'col-span-2'
                      : ''
                  }
                >
                  <CategoryCard item={item} />
                </div>
              ))}
            </div>

            {hasMore && showViewAll && (
              <div className="pt-3">
                <Link
                  to={viewAllPath}
                  className="flex w-full items-center justify-center border border-black/15 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-black/60 transition hover:bg-black hover:text-white"
                >
                  All Categories
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty */}
      {!loading && !error && categories.length === 0 && (
        <div className="py-20 text-center">
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: '1.6rem',
            }}
            className="text-black/45"
          >
            No categories found
          </p>
        </div>
      )}
    </section>
  )
}
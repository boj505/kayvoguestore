import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import ProductCard from '../Components/ProductCard'
import FiltersDrawer from '../Components/FiltersDrawer'
import QuickViewModal from '../Components/QuickViewModal'
import { fetchProducts } from '../api/Woocommerce'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/useWishlist'
import { TuneOutlined, SearchOutlined, CloseOutlined } from '@mui/icons-material'

const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { value: 'random',     label: 'Random' },
  { value: 'popularity', label: 'Featured' },
  { value: 'newest',     label: 'New In'  },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
]

// Shuffle array utility
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Shop() {
  const location = useLocation()
  const [products, setProducts]           = useState([])
  const [page, setPage]                   = useState(1)
  const [hasMore, setHasMore]             = useState(true)
  const [loading, setLoading]             = useState(false)
  const [filtersOpen, setFiltersOpen]     = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [searchOpen, setSearchOpen]       = useState(false)

  const [searchTerm, setSearchTerm]       = useState('')
  const [category, setCategory]           = useState(null)
  const [minPrice, setMinPrice]           = useState('')
  const [maxPrice, setMaxPrice]           = useState('')
  const [sort, setSort]                   = useState('random')

  const cart     = useCart()
  const wishlist = useWishlist()
  const loaderRef   = useRef(null)
  const searchRef   = useRef(null)

  // ── sync URL params ──────────────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(location.search)
    setSearchTerm(p.get('search')    || '')
    setCategory(p.get('category')   || null)
    setMinPrice(p.get('min_price')  || '')
    setMaxPrice(p.get('max_price')  || '')
    setSort(p.get('sort')           || 'random')
  }, [location.search])

  // ── build query params ───────────────────────────────────────────────────────
  const params = useMemo(() => {
    const q = {}
    if (searchTerm) q.search     = searchTerm
    if (category)   q.category   = category
    if (minPrice)   q.min_price  = minPrice
    if (maxPrice)   q.max_price  = maxPrice
    if (sort === 'popularity') q.orderby = 'popularity'
    if (sort === 'price_asc')  { q.orderby = 'price' }
    if (sort === 'price_desc') { q.orderby = 'price'; q.order = 'desc' }
    if (sort === 'newest')       q.orderby = 'date'
    // Note: random is handled on frontend by shuffling
    return q
  }, [searchTerm, category, minPrice, maxPrice, sort])

  // ── fetch ────────────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async (reset = false) => {
    if (loading) return // Prevent concurrent loads
    setLoading(true)
    try {
      const pg   = reset ? 1 : page
      const data = await fetchProducts({ page: pg, per_page: PAGE_SIZE, ...params })
      setProducts(prev => reset ? data : [...prev, ...data])
      setHasMore(Array.isArray(data) && data.length === PAGE_SIZE)
      setPage(cur => reset ? 2 : cur + 1)
    } catch (err) {
      console.error('Shop load failed:', err)
    } finally {
      setLoading(false)
    }
  }, [page, params, loading])

  useEffect(() => {
    const resetAndFetch = async () => {
      setPage(1)
      setHasMore(true)
      setLoading(true)
      try {
        if (sort === 'random') {
          // For random, fetch multiple pages to get more products, then shuffle
          let allData = []
          for (let p = 1; p <= 5; p++) { // Fetch up to 5 pages (100 products)
            const data = await fetchProducts({ page: p, per_page: PAGE_SIZE, ...params })
            allData = allData.concat(data)
            if (data.length < PAGE_SIZE) break // Stop if less than full page
          }
          const shuffled = shuffleArray(allData)
          setProducts(shuffled)
          setHasMore(false)
          setPage(1) // No pagination for random
        } else {
          const data = await fetchProducts({ page: 1, per_page: PAGE_SIZE, ...params })
          setProducts(data)
          setHasMore(Array.isArray(data) && data.length === PAGE_SIZE)
          setPage(2)
        }
      } catch (err) {
        console.error('Shop load failed:', err)
        setProducts([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    resetAndFetch()
  }, [params, sort])

  // ── infinite scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loading && sort !== 'random') loadProducts(false) },
      { rootMargin: '500px' }
    )
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, loading, loadProducts, sort])

  // ── search autofocus ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleAddToCart = useCallback((p) => {
    try {
      const extractUrl = (img) => {
        if (!img) return null
        if (typeof img === 'string') return img
        return img?.src || img?.url || img?.source_url || img?.media_link || null
      }
      
      cart.addToCart(
        { ...p, images: p.images?.map(extractUrl) },
        'M',
        'Default',
        1
      )
      
      toast.success(`${p.name} added to bag`, {
        duration: 2000,
        description: 'Size M · Qty 1',
      })
    } catch (err) {
      console.error('Error adding to cart:', err)
      toast.error('Failed to add to bag', { duration: 2000 })
    }
  }, [cart])
  
  const handleToggleWishlist = useCallback((p) => {
    try {
      wishlist.toggleWishlist(p)
    } catch (err) {
      console.error('Error toggling wishlist:', err)
    }
  }, [wishlist])

  const activeFiltersCount = [category, minPrice, maxPrice].filter(Boolean).length

  return (
    <main className="min-h-screen pt-20 bg-[#fafaf8] text-[#111]" style={{ fontFamily: 'Clash Display, sans-serif' }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#e8e5e0]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.5em] text-[#9a9590] mb-5"
              >
                SS / 2024
              </p>
              <h1
                className="text-[clamp(3rem,9vw,8rem)] font-light leading-[0.9] tracking-[-0.02em] text-[#111]"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                The Edit.
              </h1>
            </div>
            <p className="max-w-[280px] text-[11px] leading-[1.9] text-[#9a9590] uppercase tracking-[0.15em] sm:text-right">
              Curated essentials for <br />the considered wardrobe
            </p>
          </div>
        </div>
        {/* decorative line accent */}
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ccc] to-transparent" />
      </section>

      {/* ── Sticky Utility Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#fafaf8]/90 backdrop-blur-lg border-b border-[#e8e5e0]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">

          {/* Main bar */}
          <div className="flex items-center justify-between h-14">
            {/* Left: Item count */}
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#aaa]">
              {loading ? '—' : `${products.length} pieces`}
            </span>

            {/* Right: Controls */}
            <div className="flex items-center gap-6">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(v => !v)}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#111] hover:text-[#888] transition-colors"
              >
                {searchOpen
                  ? <CloseOutlined style={{ fontSize: 14 }} />
                  : <SearchOutlined style={{ fontSize: 14 }} />}
                <span className="hidden sm:inline">{searchOpen ? 'Close' : 'Search'}</span>
              </button>

              {/* Divider */}
              <span className="h-3 w-px bg-[#ddd]" />

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#aaa] hidden sm:inline">Sort</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="bg-transparent text-[10px] uppercase tracking-[0.25em] outline-none cursor-pointer text-[#111]"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <span className="h-3 w-px bg-[#ddd]" />

              {/* Filter */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] hover:text-[#888] transition-colors"
              >
                <TuneOutlined style={{ fontSize: 14 }} />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-[8px] text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Search Row */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: searchOpen ? '60px' : '0px' }}
          >
            <div className="flex items-center gap-3 border-t border-[#e8e5e0] py-3">
              <SearchOutlined style={{ fontSize: 14, color: '#aaa' }} />
              <input
                ref={searchRef}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search the collection…"
                className="flex-1 bg-transparent text-[11px] uppercase tracking-[0.25em] outline-none placeholder:text-[#ccc] text-[#111]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-[#aaa] hover:text-[#111]">
                  <CloseOutlined style={{ fontSize: 14 }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 py-10">

        {/* Active filters */}
        <div className="mb-10">
          {/* Active filter pills */}
          {minPrice && (
            <ActivePill label={`From ₦${Number(minPrice).toLocaleString()}`} onRemove={() => setMinPrice('')} />
          )}
          {maxPrice && (
            <ActivePill label={`To ₦${Number(maxPrice).toLocaleString()}`} onRemove={() => setMaxPrice('')} />
          )}
        </div>

        {/* ── Product Grid ──────────────────────────────────────────────────── */}
        {products.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <section className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 lg:gap-x-8 sm:gap-y-16">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onQuickView={setQuickViewProduct}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist?.isWishlisted?.(product.id) || false}
              />
            ))}
          </section>
        )}

        {/* ── Footer / Loader ───────────────────────────────────────────────── */}
        <div className="mt-24 flex flex-col items-center gap-4 py-10">
          {loading && <LoadingDots />}
          {!loading && !hasMore && products.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <div className="h-px w-16 bg-[#ddd]" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#bbb]">
                {products.length} items shown
              </span>
            </div>
          )}
          <div ref={loaderRef} className="h-1 w-1" />
        </div>
      </div>

      {/* ── Drawers & Modals ────────────────────────────────────────────────── */}
      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={(applied) => {
          setCategory(applied.category || null)
          setMinPrice(applied.minPrice  || '')
          setMaxPrice(applied.maxPrice  || '')
          setFiltersOpen(false)
        }}
        initial={{ category, minPrice, maxPrice }}
      />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product) => {
            handleAddToCart(product)
            setQuickViewProduct(null)
          }}
        />
      )}
    </main>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function ActivePill({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1.5 border border-[#111] px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#111] hover:bg-[#111] hover:text-white transition-colors duration-200"
    >
      {label}
      <CloseOutlined style={{ fontSize: 10 }} />
    </button>
  )
}

function LoadingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-[#bbb] animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="h-px w-12 bg-[#ddd]" />
      <p
        className="text-3xl font-light text-[#ccc]"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        Nothing found.
      </p>
      <p className="text-[9px] uppercase tracking-[0.35em] text-[#bbb]">
        Try adjusting your filters
      </p>
    </div>
  )
}
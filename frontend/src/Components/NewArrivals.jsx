import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import ProductCard from './ProductCard'
import { fetchProducts, fetchCategories } from '../api/Woocommerce'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/useWishlist'

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCount, setVisibleCount] = useState(8)
  const [categoryId, setCategoryId] = useState(null)
  const cart = useCart()
  const wishlist = useWishlist()

  // Fetch category ID for 'New Arrivals'
  useEffect(() => {
    const getCategoryId = async () => {
      try {
        const categories = await fetchCategories({ per_page: 100 })
        const newArrivalsCategory = categories.find(
          (cat) => cat.name.toLowerCase() === 'new arrivals'
        )
        if (newArrivalsCategory) {
          setCategoryId(newArrivalsCategory.id)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    getCategoryId()
  }, [])

  // Fetch products from 'New Arrivals' category
  useEffect(() => {
    if (categoryId === null) return

    const loadProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedProducts = await fetchProducts({
          category: categoryId,
          per_page: 50,
          orderby: 'date',
          order: 'desc',
        })
        setProducts(fetchedProducts)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [categoryId])

  const visibleProducts = products.slice(0, visibleCount)
  const hasMore = products.length > visibleCount

  const handleViewAll = () => {
    setVisibleCount(products.length)
  }

  return (
    <section
      className="w-full py-12 md:py-20 px-4 md:px-0"
      style={{ backgroundColor: '#faf9f7' }}
    >
      <div className="container mx-auto">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <p
              className="text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-[#999] mb-3"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              Latest drops
            </p>
            <h2
              className="text-[28px] md:text-[42px] leading-tight text-[#111]"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=new-arrivals"
            className="mt-4 md:mt-0 inline-flex items-center text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[#111] hover:text-[#555] transition-colors"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            View all
            <span className="ml-2">→</span>
          </Link>
        </div>

        {/* ── Products Grid ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div
                className="inline-block w-8 h-8 border-2 border-[#e0dcd6] border-t-[#111] rounded-full animate-spin"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
              <p
                className="mt-4 text-[12px] text-[#999]"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                Loading products...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center max-w-sm">
              <p
                className="text-[13px] text-[#999] mb-4"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-[10px] uppercase tracking-[0.2em] text-[#111] border-b border-[#111] pb-1 hover:text-[#555] transition-colors"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <p
              className="text-[13px] text-[#999]"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              No products available yet
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onAddToCart={(p) => {
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
                  }}
                  onToggleWishlist={(p) => {
                    try {
                      wishlist.toggleWishlist(p)
                    } catch (err) {
                      console.error('Error toggling wishlist:', err)
                    }
                  }}
                  isWishlisted={wishlist?.isWishlisted?.(product.id) || false}
                />
              ))}
            </div>

            {/* ── Load More Button ─────────────────────────────────────────────── */}
            {hasMore && visibleCount < products.length && (
              <div className="flex justify-center mt-8 md:mt-12">
                <button
                  onClick={handleViewAll}
                  className="px-8 md:px-10 py-3 md:py-4 border border-[#111] text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[#111] hover:bg-[#111] hover:text-white transition-all duration-300"
                  style={{ fontFamily: 'Clash Display, sans-serif' }}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

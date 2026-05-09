import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import ProductCard from '../Components/ProductCard'
import { fetchCategories, fetchProducts } from '../api/Woocommerce'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/useWishlist'
import { ArrowForwardOutlined, SearchOutlined } from '@mui/icons-material'

const PAGE_SIZE = 24

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cart = useCart()
  const wishlist = useWishlist()

  const handleAddToCart = (product) => {
    try {
      const extractUrl = (img) => {
        if (!img) return null
        if (typeof img === 'string') return img
        return img?.src || img?.url || img?.source_url || img?.media_link || null
      }
      
      cart.addToCart(
        { ...product, images: product.images?.map(extractUrl) },
        'M',
        'Default',
        1
      )
      
      toast.success(`${product.name} added to bag`, {
        duration: 2000,
        description: 'Size M · Qty 1',
      })
    } catch (err) {
      console.error('Error adding to cart:', err)
      toast.error('Failed to add to bag', { duration: 2000 })
    }
  }
  
  const handleToggleWishlist = (product) => {
    try {
      wishlist.toggleWishlist(product)
    } catch (err) {
      console.error('Error toggling wishlist:', err)
    }
  }

  useEffect(() => {
    const loadCategory = async () => {
      if (!slug) return
      setLoading(true)
      setError(null)
      try {
        const categories = await fetchCategories({ slug, per_page: 1 })
        if (!Array.isArray(categories) || categories.length === 0) {
          throw new Error('Category not found')
        }

        const selected = categories[0]
        setCategory(selected)

        const productsData = await fetchProducts({ per_page: PAGE_SIZE, category: selected.id })
        setProducts(Array.isArray(productsData) ? productsData : [])
      } catch (err) {
        console.error('Category load failed:', err)
        setError('Unable to load this category.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [slug])

  return (
    <main className="min-h-screen pt-20 bg-[#fafaf8] text-[#111]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
      <section className="relative overflow-hidden border-b border-[#e8e5e0]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.5em] text-[#9a9590] mb-5">
                Category
              </p>
              <h1 className="text-[clamp(3rem,9vw,8rem)] font-light leading-[0.9] tracking-[-0.02em] text-[#111]"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {category?.name || slug}
              </h1>
            </div>
            <div className="max-w-xl text-[11px] uppercase tracking-[0.15em] text-[#9a9590] sm:text-right">
              {category?.description ? (
                <span dangerouslySetInnerHTML={{ __html: category.description }} />
              ) : (
                'Browse the latest pieces available in this collection.'
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 py-10">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#aaa]">
            {loading ? 'Loading products…' : `${products.length} item${products.length === 1 ? '' : 's'}`}
          </p>
          <Link to="/shop" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#111] hover:text-[#888] transition-colors">
            <SearchOutlined style={{ fontSize: 14 }} />
            Back to Shop
          </Link>
        </div>

        {error ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#7a7068]">{error}</p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#7a7068]">No products found in this category.</p>
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 lg:gap-x-8 sm:gap-y-16">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist?.isWishlisted?.(product.id) || false}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { FavoriteBorderOutlined, UndoOutlined } from '@mui/icons-material'
import ProductCard from '../Components/ProductCard'
import { useWishlist } from '../context/useWishlist'
import { useCart } from '../context/CartContext'

export default function Wishlist() {
  const { items = [], removeFromWishlist, wishlistCount = 0 } = useWishlist()
  const cartApi = useCart()

  const [localItems, setLocalItems] = useState(items)
  const [snackbar, setSnackbar] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const showSnackbar = (message, actionLabel, onAction) => {
    setSnackbar({ message, actionLabel, onAction })

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setSnackbar(null)
    }, 4000)
  }

  const handleRemove = useCallback(
    (product) => {
      setLocalItems((prev) => prev.filter((item) => item.id !== product.id))
      removeFromWishlist(product.id)

      showSnackbar(
        `${product.name} removed`,
        'Undo',
        () => {
          setLocalItems((prev) => [product, ...prev])
        }
      )
    },
    [removeFromWishlist]
  )

  const handleMoveToCart = useCallback(
    (product) => {
      try {
        const extractUrl = (img) => {
          if (!img) return null
          if (typeof img === 'string') return img
          return img?.src || img?.url || img?.source_url || img?.media_link || null
        }
        
        cartApi.addToCart(
          { ...product, images: product.images?.map(extractUrl) },
          'M',
          'Default',
          1
        )

        setLocalItems((prev) => prev.filter((item) => item.id !== product.id))
        removeFromWishlist(product.id)

        toast.success(`${product.name} added to bag`, {
          duration: 2000,
          description: 'Size M · Qty 1',
        })
      } catch (err) {
        console.error('Error adding to cart:', err)
        toast.error('Failed to add to cart', { duration: 2000 })
      }
    },
    [cartApi, removeFromWishlist]
  )

  const handleMoveAll = () => {
    if (!localItems.length) return

    try {
      const extractUrl = (img) => {
        if (!img) return null
        if (typeof img === 'string') return img
        return img?.src || img?.url || img?.source_url || img?.media_link || null
      }
      
      localItems.forEach((item) =>
        cartApi.addToCart(
          { ...item, images: item.images?.map(extractUrl) },
          'M',
          'Default',
          1
        )
      )

      localItems.forEach((item) => removeFromWishlist(item.id))
      setLocalItems([])

      toast.success(`${localItems.length} items added to bag`, {
        duration: 2000,
      })
    } catch (err) {
      console.error('Error adding items to cart:', err)
      toast.error('Failed to add items to cart', { duration: 2000 })
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] pt-20 text-[#111]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.35em] text-black/45"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              Wishlist
            </p>

            <h1
              className="mt-3 text-4xl leading-none sm:text-5xl"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
              }}
            >
              Saved Pieces
            </h1>

            <p
              className="mt-3 max-w-xl text-sm text-black/60 sm:text-[15px]"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              Keep track of the products you love and return anytime.
            </p>
          </div>

          <div
            className="text-sm text-black/50"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {wishlistCount} Saved
          </div>
        </header>

        {/* Empty */}
        {localItems.length === 0 ? (
          <section className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] border border-black/10 bg-white px-8 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f4ee]">
                <FavoriteBorderOutlined style={{ fontSize: 28 }} />
              </div>

              <h2
                className="mt-6 text-3xl"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 600,
                }}
              >
                Your wishlist is empty
              </h2>

              <p
                className="mt-3 text-sm text-black/60"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                Discover premium pieces and save them here for later.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/shop"
                  className="rounded-full bg-black px-6 py-3 text-[12px] uppercase tracking-[0.25em] text-white transition hover:opacity-90"
                  style={{ fontFamily: 'Clash Display, sans-serif' }}
                >
                  Shop Now
                </Link>

                <Link
                  to="/"
                  className="rounded-full border border-black/10 px-6 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:bg-black/5"
                  style={{ fontFamily: 'Clash Display, sans-serif' }}
                >
                  Explore
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Product Grid */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {localItems.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isWishlisted={true}
                  onAddToCart={handleMoveToCart}
                  onToggleWishlist={handleRemove}
                />
              ))}
            </section>
          </>
        )}
      </div>

      {/* Floating Action Bar */}
      {localItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-full border border-black/10 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
            <div
              className="text-sm"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              <span className="font-semibold">{localItems.length}</span>{' '}
              Saved
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMoveAll}
                className="rounded-full bg-black px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-white"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                Move All
              </button>

              <Link
                to="/cart"
                className="rounded-full border border-black/10 px-5 py-2 text-[11px] uppercase tracking-[0.22em]"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                Cart
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-5 py-3 text-white shadow-xl">
          <div className="flex items-center gap-4 text-sm">
            <span>{snackbar.message}</span>

            {snackbar.actionLabel && (
              <button
                onClick={snackbar.onAction}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"
              >
                <UndoOutlined style={{ fontSize: 15 }} />
                {snackbar.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
import { useState, useEffect } from 'react'
import { WishlistContext } from './WishlistContext'

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kv_wishlist') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('kv_wishlist', JSON.stringify(items))
  }, [items])

  const addToWishlist = (product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev
      return [...prev, product]
    })
  }

  const removeFromWishlist = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleWishlist = (product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      return exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    })
  }

  const isWishlisted = (id) => items.some((p) => p.id === id)

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      wishlistCount: items.length,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

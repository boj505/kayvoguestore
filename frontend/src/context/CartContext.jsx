import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kv_cart')
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      if (!Array.isArray(parsed)) return []

      return parsed.map((item) => {
        const id = item.id ?? item.product_id ?? item.productId ?? null
        const size = item.size ?? item.selectedSize ?? 'M'
        const color = item.color ?? item.selectedColor ?? 'Default'
        const key = item.key ?? `${id}-${size}-${color}`

        // Normalize image value
        let img = item.img ?? item.image ?? null
        if (!img && Array.isArray(item.images) && item.images.length > 0) {
          img = typeof item.images[0] === 'string'
            ? item.images[0]
            : item.images[0]?.src || item.images[0]?.url || null
        } else if (img && typeof img === 'object') {
          img = img?.src || img?.url || img?.source_url || img?.media_link || null
        }

        const price = Number(item.price ?? item.unit_price ?? 0)
        const qty = Number(item.qty ?? item.quantity ?? 1)

        return {
          key,
          id,
          name: item.name ?? item.title ?? item.product ?? '',
          price,
          img,
          category: item.category ?? '',
          size,
          color,
          qty,
        }
      })
    } catch (err) {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('kv_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, size, color, qty = 1) => {
    setCart((prev) => {
      const key = `${product.id}-${size}-${color}`
      const exists = prev.find((i) => i.key === key)
      
      // Extract image with proper WooCommerce fallbacks
      let img = null
      if (Array.isArray(product.images) && product.images.length > 0) {
        // Handle array of objects with .src property
        img = product.images[0]?.src || product.images[0]
      } else if (product.image?.src) {
        img = product.image.src
      } else if (product.image) {
        img = product.image
      } else if (product.img) {
        img = product.img
      }
      
      if (exists) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, {
        key,
        id:       product.id,
        name:     product.name,
        price:    parseFloat(product.price),
        img:      img,
        category: product.categories?.[0]?.name ?? '',
        size,
        color,
        qty,
      }]
    })
  }

  const removeFromCart = (keyOrId) => {
    if (keyOrId == null) return
    setCart((prev) => prev.filter((i) => {
      if (i.key && String(i.key) === String(keyOrId)) return false
      if (i.id && String(i.id) === String(keyOrId)) return false
      return true
    }))
  }

  const updateQty = (keyOrId, qty) => {
    if (qty < 1) return removeFromCart(keyOrId)
    setCart((prev) =>
      prev.map((i) => (i.key === keyOrId || String(i.id) === String(keyOrId)) ? { ...i, qty } : i)
    )
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart,
      updateQty, clearCart, cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
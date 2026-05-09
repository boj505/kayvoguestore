import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import {
  CloseOutlined,
  AddOutlined,
  RemoveOutlined,
  DeleteOutlineOutlined,
  ArrowForwardOutlined,
  LocalShippingOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material'

// ─────────────────────────────────────────────────────────────────────
// MOCK CART ITEMS — replace with your cart context / Redux state
// ─────────────────────────────────────────────────────────────────────


const FREE_SHIPPING_THRESHOLD = 55000
const fmt = (n) => `₦${Number(n).toLocaleString('en-NG')}`

const getCartImage = (src) => {
  if (!src) return 'https://via.placeholder.com/400x480?text=Product'
  const imageUrl = typeof src === 'object'
    ? src?.src || src?.url || src?.source_url || null
    : src
  if (!imageUrl) return 'https://via.placeholder.com/400x480?text=Product'
  return imageUrl.startsWith('http')
    ? `/api/proxy-image?src=${encodeURIComponent(imageUrl)}`
    : imageUrl
}

// ─── Drawer variants ──────────────────────────────────────────────────
const drawerVariants = {
  hidden:  { x: '100%', opacity: 0.6 },
  visible: {
    x: 0, opacity: 1,
    transition: { type: 'spring', stiffness: 340, damping: 38, mass: 1 },
  },
  exit: {
    x: '100%', opacity: 0,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
}

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06 + 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: 40, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
}

// ─── Empty state ──────────────────────────────────────────────────────
const EmptyCart = ({ handleCart }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
    <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center">
      <ShoppingBagOutlined style={{ fontSize: 26, color: '#0a0a0a', opacity: 0.3 }} />
    </div>
    <div>
      <p
        className="text-[#0a0a0a] mb-2 leading-none"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.6rem' }}
      >
        Your bag is empty
      </p>
      <p className="font-[clash_display] text-[10px] tracking-[0.18em] uppercase text-black/35">
        Discover pieces worth keeping
      </p>
    </div>
    <Link
      to="/shop"
      onClick={handleCart}
      className="font-[clash_display] text-[10px] tracking-[0.22em] uppercase bg-[#0a0a0a] text-white px-8 py-3.5 hover:bg-[#2a2a2a] transition-colors duration-300 flex items-center gap-2 group"
    >
      Shop Collection
      <ArrowForwardOutlined style={{ fontSize: 13 }} className="group-hover:translate-x-0.5 transition-transform duration-200" />
    </Link>
  </div>
)

// ─── Shipping progress bar ────────────────────────────────────────────
const ShippingBar = ({ subtotal }) => {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const pct       = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const achieved  = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="px-6 py-4 bg-[#f7f4f0] border-b border-black/[0.06]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <LocalShippingOutlined style={{ fontSize: 14, opacity: 0.4 }} />
          <p className="font-[clash_display] text-[10px] tracking-[0.16em] uppercase text-black/50">
            {achieved
              ? 'You have unlocked free delivery!'
              : `${fmt(remaining)} away from free delivery`}
          </p>
        </div>
        {achieved && (
          <span className="font-[clash_display] text-[9px] tracking-[0.15em] uppercase text-[#2a7a4b]">
            ✓ Unlocked
          </span>
        )}
      </div>
      <div className="w-full h-[3px] bg-black/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:      `${pct}%`,
            background: achieved ? '#2a7a4b' : '#0a0a0a',
          }}
        />
      </div>
    </div>
  )
}

// ─── Single cart item ─────────────────────────────────────────────────
const CartItem = ({ item, index, onQtyChange, onRemove }) => {
  const [removing, setRemoving] = useState(false)

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => onRemove(item.key), 260)
  }

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`flex gap-4 px-6 py-5 border-b border-black/[0.06] transition-opacity duration-260 ${removing ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* ── Product image ── */}
      <Link
        to={`/product/${item.id}`}
        className="flex-none relative overflow-hidden bg-[#f0ece6] hover:opacity-90 transition-opacity duration-200"
        style={{ width: 96, height: 116 }}
      >
        <img
          src={getCartImage(item.img)}
          alt={item.name}
          onError={(event) => {
            event.currentTarget.src = 'https://via.placeholder.com/400x480?text=Product'
          }}
          className="w-full h-full object-cover object-top"
        />
      </Link>

      {/* ── Info ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">

        {/* Top row: name + remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-[clash_display] text-[9px] tracking-[0.22em] uppercase text-black/30 mb-1">
              {item.category}
            </p>
            <Link to={`/product/${item.id}`}>
              <h3
                className="text-[#0a0a0a] leading-snug hover:opacity-60 transition-opacity duration-200"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.1rem' }}
              >
                {item.name}
              </h3>
            </Link>
          </div>
          <button
            onClick={handleRemove}
            aria-label="Remove item"
            className="flex-none mt-0.5 text-black/20 hover:text-[#c8472b] transition-colors duration-200 p-0.5"
          >
            <DeleteOutlineOutlined style={{ fontSize: 17 }} />
          </button>
        </div>

        {/* Variant pills */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-[clash_display] text-[9px] tracking-[0.14em] uppercase text-black/40 border border-black/10 px-2 py-1">
            {item.color}
          </span>
          <span className="font-[clash_display] text-[9px] tracking-[0.14em] uppercase text-black/40 border border-black/10 px-2 py-1">
            Size {item.size}
          </span>
        </div>

        {/* Bottom row: qty stepper + price */}
        <div className="flex items-center justify-between mt-3">

          {/* Qty stepper */}
          <div className="flex items-center border border-black/12">
            <button
              onClick={() => onQtyChange(item.key, item.qty - 1)}
              disabled={item.qty === 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-black/35 hover:text-black disabled:opacity-20 transition-colors duration-150"
            >
              <RemoveOutlined style={{ fontSize: 13 }} />
            </button>
            <span className="w-7 text-center font-[clash_display] text-xs text-[#0a0a0a] tabular-nums">
              {item.qty}
            </span>
            <button
              onClick={() => onQtyChange(item.key, item.qty + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-black/35 hover:text-black transition-colors duration-150"
            >
              <AddOutlined style={{ fontSize: 13 }} />
            </button>
          </div>

          {/* Line price */}
          <p
            className="text-[#0a0a0a]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.15rem', fontWeight: 400 }}
          >
            {fmt(item.price * item.qty)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Cart Drawer ─────────────────────────────────────────────────
const Cart = ({ handleCart }) => {
  const { cart: items, updateQty, removeFromCart } = useCart()

  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError]   = useState(false)

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

 const handleQtyChange = (key, newQty) => updateQty(key, newQty)


  const handleRemove    = (key) => removeFromCart(key)


  const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const discount  = promoApplied ? Math.round(subtotal * 0.1) : 0
  const total     = subtotal - discount
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)

  const handlePromo = () => {
    if (promoInput.trim().toUpperCase() === 'KAY10') {
      setPromoApplied(true)
      setPromoError(false)
    } else {
      setPromoError(true)
      setPromoApplied(false)
    }
  }

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleCart}
        className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]"
      />

      {/* ── Drawer ── */}
      <motion.aside
        key="drawer"
        variants={drawerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 right-0 bottom-0 z-[80] w-full sm:w-[420px] bg-white flex flex-col shadow-2xl"
        aria-label="Shopping cart"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-black/[0.07] flex-none">
          <div className="flex items-baseline gap-3">
            <h2
              className="text-[#0a0a0a] leading-none"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.65rem' }}
            >
              Your Bag
            </h2>
            {itemCount > 0 && (
              <span className="font-[clash_display] text-[10px] tracking-[0.15em] uppercase text-black/35">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={handleCart}
            aria-label="Close cart"
            className="w-9 h-9 flex items-center justify-center text-black/35 hover:text-[#0a0a0a] hover:bg-black/[0.04] rounded-full transition-all duration-200"
          >
            <CloseOutlined style={{ fontSize: 19 }} />
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyCart handleCart={handleCart} />
        ) : (
          <>
            {/* ── Shipping progress ── */}
            <ShippingBar subtotal={subtotal} />

            {/* ── Items list ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <CartItem
                    key={item.key}
                    item={item}
                    index={i}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>

              {/* Promo code */}
              <div className="px-6 py-5 border-b border-black/[0.06]">
                <p className="font-[clash_display] text-[10px] tracking-[0.2em] uppercase text-black/40 mb-3">
                  Promo Code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(false) }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePromo()}
                    placeholder="Enter code"
                    disabled={promoApplied}
                    className={`flex-1 h-11 border font-[clash_display] text-xs tracking-widest uppercase px-4 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-black/25 bg-transparent transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                      promoError ? 'border-[#c8472b]' : 'border-black/15 focus:border-black/40'
                    }`}
                  />
                  <button
                    onClick={handlePromo}
                    disabled={promoApplied || !promoInput.trim()}
                    className="h-11 px-5 font-[clash_display] text-[10px] tracking-[0.18em] uppercase bg-[#0a0a0a] text-white hover:bg-[#2a2a2a] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex-none"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="font-[clash_display] text-[9px] tracking-[0.14em] uppercase text-[#2a7a4b] mt-2">
                    ✓ KAY10 applied — 10% off
                  </p>
                )}
                {promoError && (
                  <p className="font-[clash_display] text-[9px] tracking-[0.14em] uppercase text-[#c8472b] mt-2">
                    Invalid promo code
                  </p>
                )}
              </div>

              {/* Order summary */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-[clash_display] text-[10px] tracking-[0.18em] uppercase text-black/40">
                    Subtotal
                  </span>
                  <span
                    className="text-[#0a0a0a]"
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.05rem' }}
                  >
                    {fmt(subtotal)}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex items-center justify-between">
                    <span className="font-[clash_display] text-[10px] tracking-[0.18em] uppercase text-[#2a7a4b]">
                      Discount (10%)
                    </span>
                    <span
                      className="text-[#2a7a4b]"
                      style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.05rem' }}
                    >
                      −{fmt(discount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-[clash_display] text-[10px] tracking-[0.18em] uppercase text-black/40">
                    Delivery
                  </span>
                  <span className="font-[clash_display] text-[10px] tracking-[0.12em] uppercase text-black/40">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-[#2a7a4b]">Free</span>
                    ) : 'Calculated at checkout'}
                  </span>
                </div>

                <div className="pt-3 border-t border-black/[0.08] flex items-baseline justify-between">
                  <span className="font-[clash_display] text-[11px] tracking-[0.2em] uppercase text-[#0a0a0a]">
                    Total
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[clash_display] text-[9px] tracking-widest uppercase text-black/30">NGN</span>
                    <span
                      className="text-[#0a0a0a]"
                      style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.45rem', fontWeight: 400 }}
                    >
                      {fmt(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom padding so last item isn't hidden behind footer */}
              <div className="h-4" />
            </div>

            {/* ── Footer CTAs ── */}
            <div className="flex-none border-t border-black/[0.08] px-6 pt-4 pb-6 bg-white space-y-2.5">
              <Link
                to="/checkout"
                onClick={handleCart}
                className="w-full h-14 bg-[#0a0a0a] text-white font-[clash_display] text-[11px] tracking-[0.22em] uppercase hover:bg-[#2a2a2a] transition-colors duration-300 flex items-center justify-center gap-2 group"
              >
                Checkout
                <ArrowForwardOutlined
                  style={{ fontSize: 14 }}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
              </Link>
              <button
                onClick={handleCart}
                className="w-full h-12 font-[clash_display] text-[10px] tracking-[0.2em] uppercase text-black/45 hover:text-black transition-colors duration-200"
              >
                Continue Shopping
              </button>

              {/* Payment icons */}
              <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
                {['Visa', 'Mastercard', 'Verve', 'Paystack'].map((p) => (
                  <span
                    key={p}
                    className="font-[clash_display] text-[8px] tracking-[0.12em] uppercase text-black/20 border border-black/10 px-2 py-1"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.aside>
    </AnimatePresence>
  )
}

export default Cart
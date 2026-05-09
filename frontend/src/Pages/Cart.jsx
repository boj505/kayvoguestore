import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import {
  AddOutlined,
  RemoveOutlined,
  DeleteOutlineOutlined,
  ArrowForwardOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material'

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const getCartImage = (src) => {
  if (!src) return 'https://via.placeholder.com/400x480?text=Product'
  if (src.startsWith('http')) {
    return `/api/proxy-image?src=${encodeURIComponent(src)}`
  }
  return src
}

export default function CartPage() {
  const { cart: items, updateQty, removeFromCart, cartTotal, cartCount } = useCart()

  const handleQtyChange = (key, newQty) => updateQty(key, newQty)
  const handleRemove = (key) => removeFromCart(key)

  if (!items.length) {
    return (
      <main className="min-h-screen bg-[#f8f6f1] text-[#111111] pt-24">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#f3efe8] text-[#0a0a0a] shadow-sm">
              <ShoppingBagOutlined style={{ fontSize: 28 }} />
            </div>
            <h1 className="text-3xl font-[Cormorant Garamond] font-semibold tracking-tight">Your cart is empty</h1>
            <p className="mt-3 max-w-xl mx-auto text-sm text-black/60">Add products from your shop to see them here. Your selections will stay saved while you browse.</p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-white transition hover:bg-[#222]"
            >
              Shop products
              <ArrowForwardOutlined style={{ fontSize: 14 }} />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#111111] pt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-6">
          <div className="flex-1 rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Shopping Cart</p>
                <h1 className="mt-3 text-3xl font-[Cormorant Garamond] font-semibold tracking-tight">Your bag</h1>
                <p className="mt-2 text-sm text-black/60">You have {cartCount} item{cartCount !== 1 ? 's' : ''} in your bag.</p>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#faf7f1] p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white sm:w-[150px] sm:h-[180px]">
                    <img
                      src={getCartImage(item.img)}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.src = 'https://via.placeholder.com/400x480?text=Product'
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/45">{item.category || 'Product'}</p>
                    <h2 className="mt-2 text-xl font-[Cormorant Garamond] font-semibold leading-tight">{item.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-black/60">
                      <span className="rounded-full border border-black/10 bg-white px-3 py-2">Size {item.size || 'N/A'}</span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-2">{item.color || 'Standard'}</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.key, item.qty - 1)}
                          disabled={item.qty === 1}
                          className="h-9 w-9 text-black/50 disabled:opacity-30"
                        >
                          <RemoveOutlined style={{ fontSize: 16 }} />
                        </button>
                        <span className="min-w-[32px] text-center font-[clash_display] text-sm">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.key, item.qty + 1)}
                          className="h-9 w-9 text-black/50"
                        >
                          <AddOutlined style={{ fontSize: 16 }} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-black/60">
                        <span>{fmt(item.price * item.qty)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.key)}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-black/70"
                        >
                          <DeleteOutlineOutlined style={{ fontSize: 14 }} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex-none rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:w-[360px]">
            <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Order summary</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm text-black/60">
                <span>Subtotal</span>
                <span>{fmt(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-black/60">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-black/[0.08] pt-4 flex items-center justify-between text-lg font-semibold text-[#0a0a0a]">
                <span>Total</span>
                <span>{fmt(cartTotal)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-white transition hover:bg-[#222]"
            >
              Checkout
              <ArrowForwardOutlined style={{ fontSize: 14 }} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

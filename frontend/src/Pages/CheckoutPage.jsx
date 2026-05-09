import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LockOutlined,
  ChevronRightOutlined,
  CheckOutlined,
  LocalShippingOutlined,
  CreditCardOutlined,
  UploadFileOutlined,
  ArrowBackOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material'
import { PaystackButton } from 'react-paystack'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────
const fmt = (v) => `₦${Number(v || 0).toLocaleString('en-NG')}`

const getImageSrc = (src) => {
  if (!src) return 'https://via.placeholder.com/160x160/f5f5f5/111111?text=Item'
  const url = typeof src === 'object'
    ? src?.src || src?.url || src?.source_url || null
    : src
  if (!url) return 'https://via.placeholder.com/160x160/f5f5f5/111111?text=Item'
  return url.startsWith('http')
    ? `/api/proxy-image?src=${encodeURIComponent(url)}`
    : url
}

// ─── Constants ────────────────────────────────────────────────────────
const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
]

const DELIVERY_FEES = { Lagos: 1200, FCT: 1500, Abuja: 1500, default: 1800 }
const getDeliveryFee = (state) => DELIVERY_FEES[state] ?? DELIVERY_FEES.default

// ─── Step config ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Contact'  },
  { id: 2, label: 'Shipping' },
  { id: 3, label: 'Payment'  },
]

// ─── Sub-components ───────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((step, i) => (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center
            font-[clash_display] text-[10px] tracking-wider transition-all duration-300
            ${current > step.id
              ? 'bg-[#0a0a0a] text-white'
              : current === step.id
                ? 'bg-[#0a0a0a] text-white ring-4 ring-black/10'
                : 'bg-transparent text-black/30 border border-black/15'
            }
          `}>
            {current > step.id
              ? <CheckOutlined style={{ fontSize: 13 }} />
              : step.id
            }
          </div>
          <span className={`
            font-[clash_display] text-[8.5px] tracking-[0.18em] uppercase hidden sm:block
            ${current === step.id ? 'text-[#0a0a0a]' : 'text-black/30'}
          `}>
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`
            w-16 sm:w-24 h-px mx-2 mb-3 transition-all duration-500
            ${current > step.id + 0 ? 'bg-[#0a0a0a]' : 'bg-black/10'}
          `} />
        )}
      </div>
    ))}
  </div>
)

const Field = ({ label, error, children, half }) => (
  <div className={half ? '' : 'col-span-2'}>
    {label && (
      <label className="block font-[clash_display] text-[9px] tracking-[0.18em] uppercase text-black/45 mb-1.5">
        {label}
      </label>
    )}
    {children}
    {error && (
      <p className="mt-1 font-[clash_display] text-[9px] tracking-[0.12em] uppercase text-red-500">
        {error}
      </p>
    )}
  </div>
)

const inputCls = `
  w-full h-11 px-3.5 bg-white border border-black/12
  font-[clash_display] text-[11px] tracking-[0.04em] text-[#0a0a0a]
  placeholder:text-black/25 placeholder:normal-case placeholder:tracking-normal
  outline-none transition-all duration-200
  focus:border-black/45 disabled:bg-[#f5f5f5] disabled:text-black/35
  rounded-none
`

// ─── Order Summary ────────────────────────────────────────────────────
const OrderSummary = ({ cart, cartTotal, deliveryFee, totalPayable, collapsed, removeFromCart }) => {
  const [open, setOpen] = useState(!collapsed)

  return (
    <div className="bg-[#faf9f7] border border-black/8">
      {/* Mobile toggle header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 lg:hidden"
      >
        <div className="flex items-center gap-2">
          <span className="font-[clash_display] text-[12px] tracking-[0.2em] uppercase text-black/70">
            Order summary
          </span>
          <span className="font-[clash_display] text-[9px] tracking-[0.1em] text-black/35">
            ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[Cormorant_Garamond,serif] italic font-light text-lg text-[#0a0a0a]">
            {fmt(totalPayable)}
          </span>
          <ChevronRightOutlined
            style={{ fontSize: 16 }}
            className={`text-black/30 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/6">
        <span className="font-[clash_display] text-[9px] tracking-[0.22em] uppercase text-black/80">
          Your order
        </span>
        <span className="font-[clash_display] text-[10px] tracking-[0.12em] uppercase text-black/80">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {(open || !collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Items */}
            <div className="px-5 lg:px-6 py-4 space-y-4 border-b border-black/6 lg:border-b-0 lg:pb-0">
              {cart.map((item) => (
                <div key={item.key} className="flex gap-3.5 items-start">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getImageSrc(item.img)}
                      alt={item.name}
                      className="w-14 h-16 object-cover object-top bg-[#f0ece6]"
                    />
                    <span className="
                      absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full
                      bg-[#0a0a0a] text-white flex items-center justify-center
                      font-[clash_display] text-[8px] font-semibold leading-none
                      w-[18px] h-[18px]
                    ">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-[Cormorant_Garamond,serif] italic font-light text-lg text-[#0a0a0a] leading-snug truncate">
                      {item.name}
                    </p>
                    <p className="font-[clash_display] text-[8px] tracking-[0.12em] uppercase text-black/75 mt-0.5">
                      {[item.size, item.color || item.category].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.key ?? item.id)}
                      aria-label="Remove item"
                      className="text-black/30 hover:text-[#c8472b] transition-colors p-1"
                    >
                      <DeleteOutlineOutlined style={{ fontSize: 18 }} />
                    </button>
                    <p className="font-[Cormorant_Garamond,serif] text-[14px] text-[#0a0a0a] pt-0.5">
                      {fmt(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 lg:px-6 py-4 space-y-2.5 border-t border-black/6">
              <div className="flex justify-between">
                <span className="font-[clash_display] text-[9.5px] tracking-[0.14em] uppercase text-black/60">
                  Subtotal
                </span>
                <span className="font-[Cormorant_Garamond,serif] text-[14px] text-[#0a0a0a]">
                  {fmt(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-[clash_display] text-[9.5px] tracking-[0.14em] uppercase text-black/60">
                  Delivery
                </span>
                <span className="font-[Cormorant_Garamond,serif] text-sm text-[#0a0a0a]">
                  {deliveryFee ? fmt(deliveryFee) : (
                    <span className="text-black/30 text-xs">Calculated next</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-black/8">
                <span className="font-[clash_display] text-[10px] tracking-[0.18em] uppercase text-[#0a0a0a]">
                  Total
                </span>
                <div className="text-right">
                  <span className="font-[clash_display] text-[12px] tracking-widest uppercase text-black/65 mr-1.5">
                    NGN
                  </span>
                  <span className="font-[Cormorant_Garamond,serif] italic font-light text-xl text-[#0a0a0a]">
                    {fmt(totalPayable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust signal */}
            <div className="px-5 lg:px-6 pb-5 flex items-center gap-2">
              <LockOutlined style={{ fontSize: 12 }} className="text-black/25" />
              <span className="font-[clash_display] text-[10px] tracking-[0.12em] uppercase text-black/65">
                Secure checkout · SSL encrypted
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────
const CheckoutPage = () => {
  const { cart, cartTotal, cartCount, clearCart, removeFromCart } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [step,          setStep]          = useState(1)
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('paystack')
  const [receiptFile,   setReceiptFile]   = useState(null)
  const [errors,        setErrors]        = useState({})

  const [form, setForm] = useState({
    email:     '',
    firstName: '',
    lastName:  '',
    address:   '',
    apartment: '',
    city:      '',
    country:   'Nigeria',
    state:     '',
    zipCode:   '',
    phone:     '',
  })

  const deliveryFee   = getDeliveryFee(form.state)
  const totalPayable  = cartTotal + (step >= 2 && form.state ? deliveryFee : 0)
  const publicKey     = import.meta.env.VITE_PUBLIC_KEY || 'pk_test_2863ca74c49da5b15efc7790010243021e8c1726'

  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: user.email }))
  }, [user])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }))
  }

  // ── Validation ──────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {}
    if (!form.email)  e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (user?.email && form.email.toLowerCase() !== user.email.toLowerCase())
      e.email = 'Use your registered email address'
    if (!form.phone) e.phone = 'Phone number is required'
    return e
  }

  const validateStep2 = () => {
    const e = {}
    if (!form.firstName) e.firstName = 'Required'
    if (!form.lastName)  e.lastName  = 'Required'
    if (!form.address)   e.address   = 'Address is required'
    if (!form.city)      e.city      = 'City is required'
    if (!form.state)     e.state     = 'Select your state'
    return e
  }

  const goNext = (e) => {
    e.preventDefault()
    const errs = step === 1 ? validateStep1() : validateStep2()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Order builders ──────────────────────────────────────────────────
  const buildWooPayload = (method = 'paystack', receiptPayload = null) => {
    const fee = getDeliveryFee(form.state)
    const payload = {
      payment_method:       method === 'paystack' ? 'paystack' : 'opay_transfer',
      payment_method_title: method === 'paystack' ? 'Paystack'  : 'OPay Transfer',
      set_paid:             method === 'paystack',
      status:               method !== 'paystack' ? 'on-hold' : undefined,
      billing: {
        first_name: form.firstName, last_name: form.lastName,
        address_1:  form.address,   address_2: form.apartment,
        city:       form.city,      state:     form.state,
        country:    form.country,   postcode:  form.zipCode,
        email:      form.email,     phone:     form.phone,
      },
      shipping: {
        first_name: form.firstName, last_name: form.lastName,
        address_1:  form.address,   address_2: form.apartment,
        city:       form.city,      state:     form.state,
        country:    form.country,   postcode:  form.zipCode,
      },
      line_items:     cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      shipping_total: fee.toFixed(2),
      shipping_lines: [{ method_id: 'flat_rate', method_title: 'Delivery', total: fee.toFixed(2) }],
    }
    if (method === 'opay_transfer') {
      payload.customer_note = 'OPay transfer payment. Receipt uploaded for review.'
      payload.meta_data = [{ key: 'opay_payment_type', value: 'OPay Transfer' }]
    }
    if (receiptPayload) {
      payload.receiptFilename = receiptPayload.filename
      payload.receiptBase64   = receiptPayload.base64
    }
    return payload
  }

  const createWooOrder = async (payload) => {
    const res = await fetch('/api/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Unable to create order.')
    }
    return res.json()
  }

  const saveLocalOrder = (wooOrder, method = 'Paystack') => {
    const order = {
      id:          wooOrder?.id ? `WC-${wooOrder.id}` : `ORD-${Date.now()}`,
      wooOrderId:  wooOrder?.id ?? null,
      createdAt:   wooOrder?.date_created || new Date().toISOString(),
      userId:      user?.id || null,
      userEmail:   user?.email || form.email,
      paymentMethod: wooOrder?.payment_method_title || method,
      status:      wooOrder?.status || 'paid',
      total:       Number(wooOrder?.total ?? totalPayable),
      shippingFee: deliveryFee,
      shippingAddress: {
        street:    form.address,   apartment: form.apartment,
        city:      form.city,      state:     form.state,
        country:   form.country,
      },
      orderItems: cart.map(i => ({
        product: i.name, image: i.img,
        price: i.price,  quantity: i.qty,
        size: i.size,    color: i.color,
      })),
    }
    const saved = JSON.parse(localStorage.getItem('kv_orders') || '[]')
    localStorage.setItem('kv_orders', JSON.stringify([...saved, order]))
    return order
  }

  const readAsBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = () => res(r.result.split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })

  const handleOpaySubmit = async () => {
    if (!receiptFile) { toast.error('Please upload your OPay payment receipt'); return }
    setIsSubmitting(true)
    try {
      const base64    = await readAsBase64(receiptFile)
      const wooOrder  = await createWooOrder(
        buildWooPayload('opay_transfer', { filename: receiptFile.name, base64 })
      )
      const order = saveLocalOrder(wooOrder, 'OPay Transfer')
      clearCart()
      toast.success('Order submitted successfully!')
      navigate('/order-confirmation', { state: { orderId: order.id } })
    } catch (err) {
      toast.error('Could not submit order. Please try again.')
      console.log(err);
      
    } finally {
      setIsSubmitting(false)

    }

  }

  // Paystack config
  const paystackProps = {
    email:     form.email,
    amount:    Math.max(0, Math.round(totalPayable * 100)),
    metadata:  { firstName: form.firstName, lastName: form.lastName, phone: form.phone },
    publicKey,
    text:      'Pay now',
    onSuccess: async () => {
      try {
        const wooOrder = await createWooOrder(buildWooPayload('paystack'))
        const order    = saveLocalOrder(wooOrder, 'Paystack')
        clearCart()
        toast.success('Payment successful!')
        navigate('/order-confirmation', { state: { orderId: order.id } })
      } catch {
        toast.error('Payment succeeded but order save failed. Contact support.')
      }
    },
    onClose: () => toast.info('Payment cancelled'),
  }

  // ── Empty cart ──────────────────────────────────────────────────────
  if (!cartCount) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-sm"
        >
          <p className="font-[clash_display] text-[9px] tracking-[0.26em] uppercase text-black/30 mb-3">
            Nothing here
          </p>
          <h1 className="font-[Cormorant_Garamond,serif] italic font-light text-4xl text-[#0a0a0a] mb-4">
            Your bag is empty
          </h1>
          <p className="font-[clash_display] text-[10px] tracking-[0.06em] text-black/40 mb-8 leading-relaxed">
            Add items to your cart before checking out.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 h-12 px-8 bg-[#0a0a0a] text-white font-[clash_display] text-[10px] tracking-[0.22em] uppercase hover:bg-[#2a2a2a] transition-colors duration-300"
          >
            Shop collection
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Main checkout layout ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf9f7] pt-32 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <Link to="/" className="font-[Cormorant_Garamond,serif] italic font-light text-2xl text-[#0a0a0a] tracking-tight">
            KayVogue
          </Link>
          <p className="font-[clash_display] text-[8.5px] tracking-[0.22em] uppercase text-black/30 mt-1">
            Secure checkout
          </p>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">

          {/* ── LEFT: Form ── */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* Mobile order summary */}
            <div className="lg:hidden mb-6">
              <OrderSummary
                cart={cart}
                cartTotal={cartTotal}
                deliveryFee={form.state ? deliveryFee : 0}
                totalPayable={totalPayable}
                removeFromCart={removeFromCart}
                collapsed
              />
            </div>

            <form onSubmit={step < 3 ? goNext : undefined}>
              {/* ── STEP 1: Contact ── */}
              {step === 1 && (
                <div className="bg-white border border-black/8 p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="font-[clash_display] text-[12px] tracking-[0.24em] uppercase text-black/70 mb-1">
                      Step 1 of 3
                    </p>
                    <h2 className="font-[Cormorant_Garamond,serif] italic font-light text-2xl text-[#0a0a0a]">
                      Contact details
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email address" error={errors.email}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="your@email.com" 
                        disabled={!!user?.email}
                        className={`${inputCls} ${errors.email ? 'border-red-400' : ''}  text-[12px] text-black/80 tracking-tight`}
                      />
                    </Field>
                    <Field label="Phone number" error={errors.phone}>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="080 0000 0000"
                        className={`${inputCls} ${errors.phone ? 'border-red-400' : ''} text-black/80 tracking-tight`}
                      />
                    </Field>
                  </div>

                  {/* Info note */}
                  <p className="mt-4 font-[clash_display] text-[12px] tracking-[0.1em] text-black/70 leading-relaxed">
                    Order confirmation will be sent to your email address.
                  </p>

                  <button
                    type="submit"
                    className="mt-8 w-full h-13 bg-[#0a0a0a] text-white font-[clash_display] text-[10px] tracking-[0.24em] uppercase hover:bg-[#2a2a2a] transition-colors duration-300 flex items-center justify-center gap-2 group h-12"
                  >
                    Continue to shipping
                    <ChevronRightOutlined
                      style={{ fontSize: 15 }}
                      className="group-hover:translate-x-0.5 transition-transform duration-200"
                    />
                  </button>
                </div>
              )}

              {/* ── STEP 2: Shipping ── */}
              {step === 2 && (
                <div className="bg-white border border-black/8 p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="font-[clash_display] text-[12px] tracking-[0.24em] uppercase text-black/70 mb-1">
                      Step 2 of 3
                    </p>
                    <h2 className="font-[Cormorant_Garamond,serif] italic font-light text-2xl text-[#0a0a0a]">
                      Delivery address
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First name" error={errors.firstName} half>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={set('firstName')}
                        placeholder="First name"
                        autoComplete="given-name"
                        className={`${inputCls} ${errors.firstName ? 'border-red-400' : 'text-black/80'}  text-[12px] text-black/80 tracking-tight`}
                      />
                    </Field>
                    <Field label="Last name" error={errors.lastName} half>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={set('lastName')}
                        placeholder="Last name"
                        autoComplete="family-name"
                        className={`${inputCls} ${errors.lastName ? 'border-red-400' : ''}`}
                      />
                    </Field>
                    <Field label="Street address" error={errors.address}>
                      <input
                        type="text"
                        value={form.address}
                        onChange={set('address')}
                        placeholder="House number and street name"
                        autoComplete="street-address"
                        className={`${inputCls} ${errors.address ? 'border-red-400' : ''}`}
                      />
                    </Field>
                    <Field label="Apartment, suite etc. (optional)">
                      <input
                        type="text"
                        value={form.apartment}
                        onChange={set('apartment')}
                        placeholder="Optional"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="City" error={errors.city} half>
                      <input
                        type="text"
                        value={form.city}
                        onChange={set('city')}
                        placeholder="City"
                        autoComplete="address-level2"
                        className={`${inputCls} ${errors.city ? 'border-red-400' : ''}`}
                      />
                    </Field>
                    <Field label="Country" half>
                      <input
                        type="text"
                        value={form.country}
                        disabled
                        className={inputCls}
                      />
                    </Field>
                    <Field label="State" error={errors.state} half>
                      <select
                        value={form.state}
                        onChange={set('state')}
                        className={`${inputCls} ${errors.state ? 'border-red-400' : ''} bg-white`}
                      >
                        <option value="">Select state</option>
                        {NIGERIA_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Postcode (optional)" half>
                      <input
                        type="text"
                        value={form.zipCode}
                        onChange={set('zipCode')}
                        placeholder="Postcode"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Delivery fee preview */}
                  {form.state && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 flex items-center gap-3 p-3.5 bg-[#faf9f7] border border-black/8"
                    >
                      <LocalShippingOutlined style={{ fontSize: 15 }} className="text-black/30 flex-shrink-0" />
                      <p className="font-[clash_display] text-[9.5px] tracking-[0.1em] text-black/50">
                        Delivery to {form.state} —{' '}
                        <span className="text-[#0a0a0a]">{fmt(deliveryFee)}</span>
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="h-12 px-5 border border-black/12 font-[clash_display] text-[9px] tracking-[0.18em] uppercase text-black/45 hover:border-black/30 hover:text-black/70 transition-all duration-200 flex items-center gap-1.5"
                    >
                      <ArrowBackOutlined style={{ fontSize: 13 }} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 bg-[#0a0a0a] text-white font-[clash_display] text-[10px] tracking-[0.24em] uppercase hover:bg-[#2a2a2a] transition-colors duration-300 flex items-center justify-center gap-2 group"
                    >
                      Continue to payment
                      <ChevronRightOutlined
                        style={{ fontSize: 15 }}
                        className="group-hover:translate-x-0.5 transition-transform duration-200"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Payment ── */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Delivery summary */}
                  <div className="bg-white border border-black/8 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-[clash_display] text-[8.5px] tracking-[0.2em] uppercase text-black/30 mb-1">
                          Delivering to
                        </p>
                        <p className="font-[clash_display] text-[11px] tracking-[0.04em] text-[#0a0a0a]">
                          {form.firstName} {form.lastName}
                        </p>
                        <p className="font-[clash_display] text-[10px] tracking-[0.04em] text-black/45 mt-0.5">
                          {form.address}{form.apartment ? `, ${form.apartment}` : ''}, {form.city}, {form.state}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={goBack}
                        className="font-[clash_display] text-[8.5px] tracking-[0.16em] uppercase text-black/35 hover:text-black/70 transition-colors underline underline-offset-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="bg-white border border-black/8 p-6 sm:p-8">
                    <div className="mb-6">
                      <p className="font-[clash_display] text-[9px] tracking-[0.24em] uppercase text-black/35 mb-1">
                        Step 3 of 3
                      </p>
                      <h2 className="font-[Cormorant_Garamond,serif] italic font-light text-2xl text-[#0a0a0a]">
                        Payment method
                      </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 mb-6">
                      {[
                        {
                          value:    'paystack',
                          label:    'Paystack',
                          sublabel: 'Card, bank transfer, USSD — instant payment',
                          Icon:     CreditCardOutlined,
                        },
                        {
                          value:    'opay_transfer',
                          label:    'OPay Transfer',
                          sublabel: 'Transfer to our OPay account and upload receipt',
                          Icon:     UploadFileOutlined,
                        },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className={`
                            flex items-center gap-4 p-4 cursor-pointer
                            border transition-all duration-200
                            ${paymentMethod === opt.value
                              ? 'border-[#0a0a0a] bg-[#0a0a0a]/[0.02]'
                              : 'border-black/10 hover:border-black/25'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={opt.value}
                            checked={paymentMethod === opt.value}
                            onChange={() => setPaymentMethod(opt.value)}
                            className="sr-only"
                          />
                          <div className={`
                            w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                            transition-all duration-150
                            ${paymentMethod === opt.value ? 'border-[#0a0a0a]' : 'border-black/20'}
                          `}>
                            {paymentMethod === opt.value && (
                              <div className="w-2 h-2 rounded-full bg-[#0a0a0a]" />
                            )}
                          </div>
                          <opt.Icon style={{ fontSize: 18 }} className="text-black/35 flex-shrink-0" />
                          <div>
                            <p className="font-[clash_display] text-[10.5px] tracking-[0.1em] uppercase text-[#0a0a0a]">
                              {opt.label}
                            </p>
                            <p className="font-[clash_display] text-[9px] tracking-[0.06em] text-black/35 mt-0.5">
                              {opt.sublabel}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* OPay instructions */}
                    <AnimatePresence>
                      {paymentMethod === 'opay_transfer' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-[#faf9f7] border border-black/8 p-5 mb-6 space-y-4">
                            <div>
                              <p className="font-[clash_display] text-[9px] tracking-[0.18em] uppercase text-black/40 mb-2">
                                Transfer details
                              </p>
                              <p className="font-[clash_display] text-[11px] tracking-[0.06em] text-[#0a0a0a]">
                                OPay Account: <span className="font-semibold">912 627 2971</span>
                              </p>
                              <p className="font-[clash_display] text-[10px] tracking-[0.06em] text-[#0a0a0a] mt-1">
                                Amount: <span className="font-semibold">{fmt(totalPayable)}</span>
                              </p>
                            </div>
                            <div>
                              <label className="block font-[clash_display] text-[9px] tracking-[0.18em] uppercase text-black/80 mb-2">
                                Upload payment receipt
                              </label>
                              <label className="flex items-center gap-3 h-11 px-4 border border-dashed border-black/20 cursor-pointer hover:border-black/40 transition-colors duration-200">
                                <UploadFileOutlined style={{ fontSize: 16 }} className="text-black/70" />
                                <span className="font-[clash_display] text-[10px] tracking-[0.06em] text-black/80">
                                  {receiptFile ? receiptFile.name : 'Choose file (image or PDF)'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="sr-only"
                                  onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                                />
                              </label>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Order total line */}
                    <div className="flex items-center justify-between py-4 border-t border-b border-black/8 mb-6">
                      <span className="font-[clash_display] text-[10px] tracking-[0.18em] uppercase text-black/70">
                        Total payable
                      </span>
                      <span className="font-[Cormorant_Garamond,serif] italic font-light text-2xl text-black/90">
                        {fmt(totalPayable)}
                      </span>
                    </div>

                    {/* CTA */}
                    {paymentMethod === 'paystack' ? (
                      <PaystackButton
                        {...paystackProps}
                        className="w-full h-13 bg-[#0a0a0a] text-white font-[clash_display] text-[10px] tracking-[0.26em] uppercase hover:bg-[#2a2a2a] transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 h-12"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpaySubmit}
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#0a0a0a] text-white font-[clash_display] text-[10px] tracking-[0.26em] uppercase hover:bg-[#2a2a2a] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting…' : 'Submit OPay order'}
                      </button>
                    )}

                    {/* Security badge */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <LockOutlined style={{ fontSize: 12 }} className="text-black/20" />
                      <span className="font-[clash_display] text-[10px] tracking-[0.12em] uppercase text-black/50">
                        SSL encrypted · Your info is safe
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 font-[clash_display] text-[10px] tracking-[0.16em] uppercase text-black/70 hover:text-black/60 transition-colors duration-200"
                  >
                    <ArrowBackOutlined style={{ fontSize: 13 }} />
                    Back to shipping
                  </button>
                </div>
              )}
            </form>
          </motion.div>

          {/* ── RIGHT: Order summary (desktop) ── */}
          <div className="hidden lg:block sticky top-28">
            <OrderSummary
              cart={cart}
              cartTotal={cartTotal}
              deliveryFee={form.state ? deliveryFee : 0}
              totalPayable={totalPayable}
              removeFromCart={removeFromCart}
              collapsed={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage;
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────── */
const clash = { fontFamily: 'Clash Display, sans-serif' }
const cg    = { fontFamily: 'Cormorant Garamond, serif' }

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const css = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .hero-line {
    opacity:0;
    animation: fadeUp 0.65s cubic-bezier(.22,.68,0,1.1) forwards;
  }
  .d0 { animation-delay:.08s; }
  .d1 { animation-delay:.20s; }
  .d2 { animation-delay:.34s; }
  .d3 { animation-delay:.48s; }

  .reveal {
    opacity:0;
    transform:translateY(22px);
    transition: opacity .65s cubic-bezier(.22,.68,0,1.1),
                transform .65s cubic-bezier(.22,.68,0,1.1);
  }
  .reveal.in { opacity:1; transform:translateY(0); }

  /* accordion answer slide */
  .answer-wrap {
    display:grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.34s cubic-bezier(.22,.68,0,1.1);
  }
  .answer-wrap.open { grid-template-rows: 1fr; }
  .answer-inner { overflow:hidden; }

  /* category pill active */
  .cat-pill {
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }
  .cat-pill.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .cat-pill:not(.active):hover {
    border-color: #111;
    color: #111;
  }

  /* chevron rotate */
  .chevron {
    transition: transform .3s cubic-bezier(.22,.68,0,1.1);
  }
  .chevron.open { transform: rotate(180deg); }

  .cta-btn {
    position:relative; overflow:hidden; transition:color .3s ease;
  }
  .cta-btn::before {
    content:''; position:absolute; inset:0; background:#333;
    transform:translateX(-101%);
    transition:transform .38s cubic-bezier(.22,.68,0,1.1);
  }
  .cta-btn:hover::before { transform:translateX(0); }
  .cta-btn span { position:relative; z-index:1; }

  .ghost-btn { transition: background .22s ease, color .22s ease; }
  .ghost-btn:hover { background:#111; color:#fff; }
`

/* ─────────────────────────────────────────────
   INTERSECTION HOOK
───────────────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const IconChevron = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 flex-shrink-0">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="1"/>
    <path d="M2 4l10 9 10-9" strokeLinecap="round"/>
  </svg>
)
const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round"/>
  </svg>
)
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
    <circle cx="11" cy="11" r="7"/>
    <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
  </svg>
)

/* ─────────────────────────────────────────────
   DATA  — updated for KayVogue (Nigerian thrift)
───────────────────────────────────────────── */
const FAQ_DATA = [
  {
    id: 'general',
    label: 'General',
    faqs: [
      {
        id: 1,
        q: 'What is KayVogue?',
        a: 'KayVogue is a Nigerian preloved fashion brand built on the belief that great style shouldn\'t cost the earth — financially or environmentally. We hand-pick premium thrifted pieces — hoodies, sweatshirts, jerseys, joggers and more — and deliver them straight to your door.',
      },
      {
        id: 2,
        q: 'Do I need an account to shop?',
        a: 'You can browse and purchase as a guest. However, creating an account lets you track orders, access your purchase history, save items to your wishlist, and get early access to new Friday drops.',
      },
      {
        id: 3,
        q: 'How often do you add new pieces?',
        a: 'Every Friday. Our team sources and lists new pieces weekly — follow our Instagram or subscribe to our newsletter so you never miss a drop.',
      },
    ],
  },
  {
    id: 'orders',
    label: 'Orders & Shipping',
    faqs: [
      {
        id: 4,
        q: 'Where do you deliver?',
        a: 'We currently ship nationwide across Nigeria. Delivery typically takes 2–5 business days depending on your location. Lagos orders are often faster.',
      },
      {
        id: 5,
        q: 'How much does delivery cost?',
        a: 'Standard delivery is a flat fee applied at checkout. Orders above ₦55,000 qualify for free delivery. Express options are available at checkout for select locations.',
      },
      {
        id: 6,
        q: 'How do I track my order?',
        a: 'Once your order ships, you\'ll receive tracking information via email and WhatsApp. You can also check your order status anytime in your account under "My Orders."',
      },
      {
        id: 7,
        q: 'Can I change or cancel my order?',
        a: 'You can request changes or cancellations within 2 hours of placing your order. Contact us immediately via WhatsApp for the fastest response.',
      },
    ],
  },
  {
    id: 'returns',
    label: 'Returns & Refunds',
    faqs: [
      {
        id: 8,
        q: 'What is your return policy?',
        a: 'We offer a 14-day return policy on all items, provided they are unworn and in their original condition. Items showing signs of wear or damage cannot be returned.',
      },
      {
        id: 9,
        q: 'How do I start a return?',
        a: 'Go to your account, find the order, and select "Return item." You\'ll receive instructions on how to send it back. Alternatively, message us directly on WhatsApp.',
      },
      {
        id: 10,
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 3–5 business days after we receive and inspect your returned item. Refunds are issued via your original payment method.',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products & Condition',
    faqs: [
      {
        id: 11,
        q: 'How do you assess item condition?',
        a: 'Every item goes through a 12-point inspection covering fabric integrity, stitching, colour, odour, and overall wearability. We grade items honestly — you\'ll see condition notes on every product listing.',
      },
      {
        id: 12,
        q: 'Are the items cleaned before shipping?',
        a: 'Yes. All items are professionally cleaned and steamed before being photographed and listed. Your piece arrives fresh, not just thrifted.',
      },
      {
        id: 13,
        q: 'How do I find my size?',
        a: 'Each product page includes measurements photographed in real light. Since sizes vary by brand and era, we recommend comparing the listed measurements to a garment you already own and love.',
      },
      {
        id: 14,
        q: 'What if the item doesn\'t fit when it arrives?',
        a: 'If an unworn item doesn\'t fit, you can return or exchange it within 14 days. Follow our standard return process outlined above.',
      },
    ],
  },
  {
    id: 'payment',
    label: 'Payment',
    faqs: [
      {
        id: 15,
        q: 'What payment methods do you accept?',
        a: 'We accept all major cards via Paystack, bank transfers, and USSD payments. All transactions are encrypted and secure.',
      },
      {
        id: 16,
        q: 'Is my payment information safe?',
        a: 'Yes. We process all payments through Paystack, a PCI-compliant payment gateway. We never store card details on our servers.',
      },
      {
        id: 17,
        q: 'Why was my payment declined?',
        a: 'This is usually a bank-side issue. Check that your card is enabled for online transactions, has sufficient funds, and that the billing details match. If the issue persists, contact your bank or try a different payment method.',
      },
    ],
  },
]

/* ─────────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────────── */
const FaqItem = ({ faq, isOpen, onToggle }) => (
  <div className="border-b border-black/[0.08]">
    <button
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-5 py-5 sm:py-6 text-left group"
      aria-expanded={isOpen}
    >
      <span
        className="text-[14px] sm:text-[15px] leading-[1.6] text-[#111] group-hover:opacity-60 transition-opacity"
        style={clash}
      >
        {faq.q}
      </span>
      <span className={`chevron mt-0.5 text-black/40 flex-shrink-0 ${isOpen ? 'open' : ''}`}>
        <IconChevron />
      </span>
    </button>

    <div className={`answer-wrap ${isOpen ? 'open' : ''}`}>
      <div className="answer-inner">
        <p
          className="pb-6 text-[13.5px] sm:text-[14px] text-black/55 leading-[1.9] max-w-2xl"
          style={clash}
        >
          {faq.a}
        </p>
      </div>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const Faqs = () => {
  const [activeCategory, setActiveCategory] = useState('general')
  const [openId, setOpenId]                 = useState(null)
  const [searchQuery, setSearchQuery]       = useState('')

  const currentCat  = FAQ_DATA.find(c => c.id === activeCategory)
  const filteredFaqs = searchQuery.trim()
    ? FAQ_DATA.flatMap(c => c.faqs).filter(
        f =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentCat?.faqs ?? []

  const toggle = (id) => setOpenId(prev => (prev === id ? null : id))

  const heroRef = useReveal()
  const bodyRef = useReveal()

  return (
    <>
      <style>{css}</style>
      <main className="bg-[#f9f8f6] text-[#111] min-h-screen" style={clash}>

        {/* ── HERO ── */}
        <section className="px-5 sm:px-10 lg:px-20 pt-32 sm:pt-40 pb-16 sm:pb-20 max-w-[1400px] mx-auto">
          <p className="hero-line d0 text-[9px] tracking-[0.55em] uppercase text-black/35 mb-6">
            Help centre
          </p>
          <h1
            className="hero-line d1 leading-[1.07] tracking-[-0.02em] text-[#111] max-w-3xl mb-7"
            style={{ ...cg, fontSize: 'clamp(2.8rem, 7vw, 6rem)', fontWeight: 600 }}
          >
            Frequently asked questions.
          </h1>
          <p className="hero-line d2 text-[14px] sm:text-[15px] text-black/50 leading-[1.8] max-w-xl mb-10">
            Everything you need to know about shopping, shipping, and returns at KayVogue.
          </p>

          {/* Search bar */}
          <div className="hero-line d3 relative max-w-lg">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
              <IconSearch />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setOpenId(null) }}
              placeholder="Search questions…"
              className="w-full bg-white border border-black/[0.1] pl-11 pr-5 py-4 text-[13px] text-[#111] placeholder:text-black/25 outline-none focus:border-black/30 transition-colors"
              style={clash}
            />
          </div>
        </section>

        {/* Hairline divider */}
        <div className="border-t border-black/[0.07]" />

        {/* ── BODY ── */}
        <section className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-20 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">

            {/* LEFT — category nav */}
            <aside>
              {/* Mobile: horizontal scroll pills */}
              <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
                {FAQ_DATA.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setOpenId(null); setSearchQuery('') }}
                    className={`cat-pill flex-shrink-0 h-9 px-4 border text-[10px] tracking-[0.25em] uppercase whitespace-nowrap ${
                      activeCategory === cat.id && !searchQuery ? 'active' : 'border-black/15 text-black/45'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Desktop: vertical list */}
              <nav className="hidden lg:block sticky top-28">
                <p className="text-[8.5px] tracking-[0.45em] uppercase text-black/30 mb-5">Topics</p>
                <ul className="space-y-1">
                  {FAQ_DATA.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => { setActiveCategory(cat.id); setOpenId(null); setSearchQuery('') }}
                        className={`w-full text-left px-0 py-2.5 text-[12.5px] tracking-[0.06em] transition-opacity border-l-2 pl-4 ${
                          activeCategory === cat.id && !searchQuery
                            ? 'border-[#111] text-[#111] font-medium'
                            : 'border-transparent text-black/40 hover:text-black/70'
                        }`}
                        style={clash}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Quick links */}
                <div className="mt-12 border-t border-black/[0.07] pt-8">
                  <p className="text-[8.5px] tracking-[0.45em] uppercase text-black/28 mb-5">Get help</p>
                  <a
                    href="mailto:support@kayvogue.com"
                    className="flex items-center gap-2.5 text-[12px] text-black/45 hover:text-[#111] transition-colors mb-3"
                    style={clash}
                  >
                    <IconMail />
                    support@kayvogue.com
                  </a>
                  <a
                    href="https://wa.me/2340000000000"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-[12px] text-black/45 hover:text-[#111] transition-colors"
                    style={clash}
                  >
                    <IconWhatsapp />
                    WhatsApp us
                  </a>
                </div>
              </nav>
            </aside>

            {/* RIGHT — FAQ list */}
            <div ref={bodyRef} className="reveal">
              {/* Section heading */}
              {!searchQuery && (
                <div className="mb-2">
                  <h2
                    className="text-[#111] mb-1"
                    style={{ ...cg, fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 600 }}
                  >
                    {currentCat?.label}
                  </h2>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-black/30">
                    {currentCat?.faqs.length} questions
                  </p>
                </div>
              )}

              {searchQuery && (
                <div className="mb-4">
                  <p className="text-[12px] text-black/40" style={clash}>
                    {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}

              {filteredFaqs.length > 0 ? (
                <div>
                  {filteredFaqs.map(faq => (
                    <FaqItem
                      key={faq.id}
                      faq={faq}
                      isOpen={openId === faq.id}
                      onToggle={() => toggle(faq.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p style={{ ...cg, fontSize: '1.4rem', fontWeight: 600 }} className="text-[#111] mb-2">
                    No results found
                  </p>
                  <p className="text-[13px] text-black/40" style={clash}>
                    Try a different keyword or browse the categories on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── STILL NEED HELP ── */}
        <section className="border-t border-black/[0.07] bg-white">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-20 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <p className="text-[9px] tracking-[0.52em] uppercase text-black/30 mb-3" style={clash}>
                  Still have questions?
                </p>
                <h2
                  className="text-[#111] mb-3"
                  style={{ ...cg, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 600 }}
                >
                  We're here to help.
                </h2>
                <p className="text-[13.5px] text-black/50 leading-[1.8] max-w-md" style={clash}>
                  Our team responds within a few hours on WhatsApp, and within 24 hours by email.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                <a
                  href="https://wa.me/2340000000000"
                  target="_blank"
                  rel="noreferrer"
                  className="cta-btn inline-flex items-center justify-center gap-2.5 bg-[#111] text-white px-7 py-4 text-[10px] tracking-[0.38em] uppercase"
                >
                  <span className="flex items-center gap-2.5">
                    <IconWhatsapp />
                    WhatsApp us
                  </span>
                </a>
                <Link
                  to="/contact"
                  className="ghost-btn inline-flex items-center justify-center gap-2 border border-black/20 px-7 py-4 text-[10px] tracking-[0.38em] uppercase text-[#111]"
                >
                  Contact form
                  <IconArrow />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}

export default Faqs
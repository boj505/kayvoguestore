import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────── */
const clash = { fontFamily: 'Clash Display, sans-serif' }
const cg    = { fontFamily: 'Cormorant Garamond, serif' }

/* ─────────────────────────────────────────────
   CSS — keyframes + utilities
───────────────────────────────────────────── */
const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes counterUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.72s cubic-bezier(.22,.68,0,1.1),
                transform 0.72s cubic-bezier(.22,.68,0,1.1);
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-fade {
    opacity: 0;
    transition: opacity 0.8s ease;
  }
  .reveal-fade.visible { opacity: 1; }

  .hero-line {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.75s cubic-bezier(.22,.68,0,1.1) forwards;
  }
  .d0 { animation-delay: 0.1s; }
  .d1 { animation-delay: 0.22s; }
  .d2 { animation-delay: 0.36s; }
  .d3 { animation-delay: 0.50s; }
  .d4 { animation-delay: 0.64s; }
  .d5 { animation-delay: 0.78s; }

  .line-grow {
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.9s cubic-bezier(.22,.68,0,1.1);
  }
  .line-grow.visible { transform: scaleX(1); }

  .value-card {
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  .value-card:hover {
    box-shadow: 0 12px 40px -12px rgba(0,0,0,0.14);
    transform: translateY(-3px);
  }

  .process-num {
    font-variant-numeric: tabular-nums;
  }

  .cta-btn {
    position: relative;
    overflow: hidden;
    transition: color 0.3s ease;
  }
  .cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #333;
    transform: translateX(-101%);
    transition: transform 0.38s cubic-bezier(.22,.68,0,1.1);
  }
  .cta-btn:hover::before { transform: translateX(0); }
  .cta-btn span { position: relative; z-index: 1; }

  .secondary-btn {
    transition: background 0.25s ease, color 0.25s ease;
  }
  .secondary-btn:hover { background: #111; color: #fff; }

  /* Marquee */
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex;
    animation: marquee 22s linear infinite;
    width: max-content;
  }
  .marquee-wrap { overflow: hidden; }

  /* Stagger children */
  .stagger > *:nth-child(1) { transition-delay: 0s;    }
  .stagger > *:nth-child(2) { transition-delay: 0.1s;  }
  .stagger > *:nth-child(3) { transition-delay: 0.2s;  }
  .stagger > *:nth-child(4) { transition-delay: 0.3s;  }
  .stagger > *:nth-child(5) { transition-delay: 0.4s;  }
  .stagger > *:nth-child(6) { transition-delay: 0.5s;  }
`

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
───────────────────────────────────────────── */
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ─────────────────────────────────────────────
   ICONS — inline SVG, no dependencies
───────────────────────────────────────────── */
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M12 2C6 2 3 8 3 12c0 5 4 9 9 9s9-4 9-9c0-4-1.5-8-5-10" strokeLinecap="round"/>
    <path d="M12 22V12M12 12C12 8 15 5 19 4" strokeLinecap="round"/>
  </svg>
)
const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round"/>
    <circle cx="7" cy="7" r="1" fill="currentColor"/>
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round"/>
  </svg>
)
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round"/>
  </svg>
)
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 4v5h-7V8z" strokeLinecap="round"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconRecycle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round"/>
  </svg>
)
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round"/>
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
    <circle cx="8" cy="8" r="7.5" stroke="#111" strokeWidth="1"/>
    <path d="M5 8l2.2 2.2 3.8-4.4" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
)
const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round"/>
  </svg>
)

/* ─────────────────────────────────────────────
   SECTION WRAPPER — reveal on scroll
───────────────────────────────────────────── */
const Section = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal(0.12)
  return (
    <div
      ref={ref}
      className={`reveal stagger ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
const Counter = ({ end, suffix = '', duration = 1800 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = performance.now()
        const tick = (now) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // easeOutExpo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const VALUES = [
  {
    icon: <IconLeaf />,
    title: 'Sustainable fashion',
    body: 'Every piece we sell keeps clothing out of landfill. We believe fashion can be circular — beautiful, affordable, and kind to the planet.',
  },
  {
    icon: <IconTag />,
    title: 'Honest pricing',
    body: 'Premium quality without the premium markup. Our pricing reflects the true value of each piece — nothing more, nothing less.',
  },
  {
    icon: <IconShield />,
    title: 'Quality guaranteed',
    body: 'Every item is inspected, cleaned, and authenticated before it reaches you. If it doesn\'t meet our standard, it doesn\'t ship.',
  },
  {
    icon: <IconStar />,
    title: 'Curated with care',
    body: 'We don\'t list everything — we list the best. Our team hand-picks every piece for style, condition, and wearability.',
  },
]

const PROCESS = [
  {
    num: '01',
    title: 'We source',
    body: 'Our team scours markets, estates, and trusted suppliers every week to find standout preloved pieces with a story.',
  },
  {
    num: '02',
    title: 'We inspect',
    body: 'Each item goes through a 12-point quality check. We grade condition honestly — no surprises on delivery.',
  },
  {
    num: '03',
    title: 'We clean & prep',
    body: 'Professionally cleaned, steamed, and photographed so you see exactly what you\'re getting, in real light.',
  },
  {
    num: '04',
    title: 'We deliver',
    body: 'Carefully packaged and shipped straight to your door across Nigeria, with tracking every step of the way.',
  },
]

const TRUST = [
  { icon: <IconTruck />,   label: 'Fast nationwide delivery',    sub: 'Orders dispatched within 24–48 hrs' },
  { icon: <IconRecycle />, label: 'Easy returns',                sub: '14-day hassle-free return policy'   },
  { icon: <IconShield />,  label: 'Authenticity guaranteed',     sub: 'Every piece hand-inspected'         },
  { icon: <IconHeart />,   label: 'Thousands of happy customers', sub: 'Join a growing community'          },
]

const MARQUEE_ITEMS = [
  'Preloved', '·', 'Sustainable', '·', 'Curated', '·', 'Affordable', '·',
  'Premium quality', '·', 'New drops Fridays', '·', 'Nationwide delivery', '·',
]

const STATS = [
  { value: 2000, suffix: '+', label: 'Pieces sold'       },
  { value: 98,   suffix: '%', label: 'Happy customers'   },
  { value: 500,  suffix: '+', label: 'Kgs kept from landfill' },
  { value: 4,    suffix: 'yrs', label: 'In the game'     },
]

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const About = () => {
  return (
    <>
      <style>{css}</style>

      <main
        className="bg-[#f9f8f6] text-[#111] overflow-x-hidden"
        style={clash}
      >
        {/* ════════════════════════════════════════
            01 · HERO
        ════════════════════════════════════════ */}
        <section className="min-h-[90vh] sm:min-h-screen flex flex-col justify-end px-5 sm:px-10 lg:px-20 pb-16 sm:pb-20 pt-32 sm:pt-36 relative">
          {/* Vertical rule */}
          

          {/* Label */}
          <p
            className="hero-line d0 text-[9px] tracking-[0.55em] uppercase text-black/35 mb-8"
            style={clash}
          >
            About KayVogue
          </p>

          {/* Headline */}
          <div className="max-w-5xl">
            <h1
              className="hero-line d1 leading-[1.06] tracking-[-0.02em] text-[#111]"
              style={{ ...cg, fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 600 }}
            >
              Fashion that&apos;s
            </h1>
            <h1
              className="hero-line d2 leading-[1.06] tracking-[-0.02em] text-[#111]"
              style={{ ...cg, fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 600, fontStyle: 'italic' }}
            >
              already been loved.
            </h1>
          </div>

          {/* Sub */}
          <div className="hero-line d3 mt-8 max-w-xl">
            <p className="text-[14px] sm:text-[15px] text-black/55 leading-[1.8]" style={clash}>
              KayVogue is a Nigerian preloved fashion brand built on the belief that
              great style shouldn't cost the earth — financially or environmentally.
            </p>
          </div>

          {/* CTAs */}
          <div className="hero-line d4 flex flex-col sm:flex-row gap-3 mt-10">
            <Link
              to="/shop"
              className="cta-btn inline-flex items-center justify-center gap-2.5 bg-[#111] text-white px-8 py-4 text-[10.5px] tracking-[0.38em] uppercase"
            >
              <span>Shop the collection</span>
              <IconArrow />
            </Link>
            <a
              href="#story"
              className="secondary-btn inline-flex items-center justify-center gap-2 border border-black/20 px-8 py-4 text-[10.5px] tracking-[0.38em] uppercase text-[#111]"
            >
              Our story
            </a>
          </div>

          {/* Scroll hint */}
          <div className="hero-line d5 absolute bottom-8 right-8 sm:right-12 hidden sm:flex flex-col items-center gap-2 opacity-25">
            <div className="w-px h-10 bg-[#111] animate-pulse" />
            <p className="text-[8px] tracking-[0.35em] uppercase" style={clash}>Scroll</p>
          </div>
        </section>

        {/* ════════════════════════════════════════
            MARQUEE STRIP
        ════════════════════════════════════════ */}
        <div className="bg-[#111] py-4 marquee-wrap border-y border-[#111]">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="text-[10px] tracking-[0.32em] uppercase text-white/45 px-5 whitespace-nowrap"
                style={clash}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            02 · STORY
        ════════════════════════════════════════ */}
        <section id="story" className="px-5 sm:px-10 lg:px-20 py-20 sm:py-28 lg:py-36">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">

            {/* Left — text */}
            <Section>
              <p className="text-[9px] tracking-[0.52em] uppercase text-black/35 mb-6" style={clash}>Our story</p>
              <h2
                className="leading-[1.1] tracking-[-0.015em] mb-8 text-[#111]"
                style={{ ...cg, fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 600 }}
              >
                Born from a love of great clothes at honest prices.
              </h2>
              <div className="space-y-5 text-[13.5px] sm:text-[14px] text-black/60 leading-[1.9]" style={clash}>
                <p>
                  KayVogue started as a simple idea: why should incredible fashion be out of reach
                  for most people? We saw rails of beautiful, barely-worn clothing being discarded —
                  and decided to do something about it.
                </p>
                <p>
                  We built a brand that sits at the intersection of accessibility and aspiration.
                  A place where you can discover premium preloved pieces — hoodies, sweatshirts,
                  jerseys, joggers — at prices that actually make sense.
                </p>
                <p>
                  Every Friday we drop new pieces. Every piece has been chosen by hand.
                  Every customer matters to us — we're not a warehouse, we're a community.
                </p>
              </div>

              {/* Checklist */}
              <ul className="mt-8 space-y-3">
                {[
                  'Hand-picked from trusted sources across Nigeria',
                  'Every piece cleaned, inspected, and photographed',
                  'Shipped with care — not stuffed in a bag',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[12.5px] text-black/65" style={clash}>
                    <IconCheck />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Right — image mosaic */}
            <Section delay={0.12}>
              <div className="grid grid-cols-2 gap-3 h-[420px] sm:h-[520px]">
                {/* Tall left card */}
                <div className="row-span-2 bg-[#e8e3dc] overflow-hidden relative">
                  <img
                    src="../../src/assets/hd9.jpg"
                    alt="KayVogue piece"
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                {/* Short top-right */}
                <div className="bg-[#ddd8d0] overflow-hidden relative">
                  <img
                    src="../../src/assets/sw1.jpg"
                    alt="KayVogue style"
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
                {/* Short bottom-right */}
                <div className="bg-[#111] flex items-center justify-center p-6">
                  <p
                    className="text-white/80 text-center leading-snug"
                    style={{ ...cg, fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontStyle: 'italic', fontWeight: 400 }}
                  >
                    "Style is for everyone."
                  </p>
                </div>
              </div>
            </Section>
          </div>
        </section>

        {/* ════════════════════════════════════════
            03 · STATS
        ════════════════════════════════════════ */}
        <section className="bg-[#111] px-5 sm:px-10 lg:px-20 py-16 sm:py-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
              {STATS.map(({ value, suffix, label }) => (
                <div key={label} className="bg-[#111] px-6 sm:px-10 py-10 sm:py-12">
                  <p
                    className="process-num leading-none text-white mb-2"
                    style={{ ...cg, fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 600 }}
                  >
                    <Counter end={value} suffix={suffix} />
                  </p>
                  <p className="text-[10px] tracking-[0.32em] uppercase text-white/35" style={clash}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            04 · VALUES
        ════════════════════════════════════════ */}
        <section className="px-5 sm:px-10 lg:px-20 py-20 sm:py-28 lg:py-36">
          <div className="max-w-[1400px] mx-auto">
            <Section>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
                <div>
                  <p className="text-[9px] tracking-[0.52em] uppercase text-black/35 mb-4" style={clash}>What we stand for</p>
                  <h2
                    className="leading-tight tracking-[-0.015em] text-[#111]"
                    style={{ ...cg, fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 600 }}
                  >
                    Our values
                  </h2>
                </div>
                <p className="text-[12.5px] text-black/45 max-w-xs leading-[1.8]" style={clash}>
                  These aren't just words. They shape every decision we make, from sourcing to shipping.
                </p>
              </div>
            </Section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/[0.07]">
              {VALUES.map(({ icon, title, body }, i) => (
                <Section key={title} delay={i * 0.08}>
                  <div className="value-card bg-[#f9f8f6] px-6 sm:px-7 py-8 sm:py-10 h-full">
                    <div className="w-10 h-10 border border-black/12 flex items-center justify-center mb-7 text-[#111]">
                      {icon}
                    </div>
                    <h3
                      className="mb-4 leading-snug text-[#111]"
                      style={{ ...cg, fontSize: '1.35rem', fontWeight: 600 }}
                    >
                      {title}
                    </h3>
                    <p className="text-[12.5px] text-black/55 leading-[1.8]" style={clash}>
                      {body}
                    </p>
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            05 · PROCESS
        ════════════════════════════════════════ */}
        <section className="bg-white px-5 sm:px-10 lg:px-20 py-20 sm:py-28 lg:py-36 border-y border-black/[0.07]">
          <div className="max-w-[1400px] mx-auto">
            <Section>
              <p className="text-[9px] tracking-[0.52em] uppercase text-black/35 mb-4" style={clash}>How it works</p>
              <h2
                className="leading-tight tracking-[-0.015em] text-[#111] mb-16"
                style={{ ...cg, fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 600 }}
              >
                From source to your wardrobe.
              </h2>
            </Section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5">
              {PROCESS.map(({ num, title, body }, i) => (
                <Section key={num} delay={i * 0.1}>
                  <div className="relative">
                    {/* Connector line — desktop only */}
                    {i < PROCESS.length - 1 && (
                      <div className="hidden lg:block absolute top-5 left-[calc(100%+10px)] right-[-10px] h-px bg-black/10" />
                    )}
                    <p
                      className="process-num text-black/10 mb-5 leading-none"
                      style={{ ...cg, fontSize: '3.5rem', fontWeight: 600 }}
                    >
                      {num}
                    </p>
                    <div className="w-8 h-px bg-[#111] mb-5" />
                    <h3
                      className="mb-3 text-[#111]"
                      style={{ ...cg, fontSize: '1.3rem', fontWeight: 600 }}
                    >
                      {title}
                    </h3>
                    <p className="text-[12.5px] text-black/50 leading-[1.85]" style={clash}>
                      {body}
                    </p>
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            06 · TRUST SIGNALS
        ════════════════════════════════════════ */}
        <section className="px-5 sm:px-10 lg:px-20 py-20 sm:py-28">
          <div className="max-w-[1400px] mx-auto">
            <Section>
              <p className="text-[9px] tracking-[0.52em] uppercase text-black/35 mb-4" style={clash}>Why shop with us</p>
              <h2
                className="leading-tight tracking-[-0.015em] text-[#111] mb-14"
                style={{ ...cg, fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: 600 }}
              >
                Built around you.
              </h2>
            </Section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/[0.07]">
              {TRUST.map(({ icon, label, sub }, i) => (
                <Section key={label} delay={i * 0.08}>
                  <div className="bg-[#f9f8f6] px-7 py-8 sm:py-10 flex items-start gap-5">
                    <div className="w-11 h-11 bg-[#111] flex items-center justify-center flex-shrink-0 text-white">
                      {icon}
                    </div>
                    <div>
                      <p
                        className="mb-1.5 text-[#111]"
                        style={{ ...cg, fontSize: '1.25rem', fontWeight: 600 }}
                      >
                        {label}
                      </p>
                      <p className="text-[12px] text-black/45 leading-[1.75]" style={clash}>
                        {sub}
                      </p>
                    </div>
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            07 · SOCIAL PROOF QUOTE
        ════════════════════════════════════════ */}
        <section className="bg-[#111] px-5 sm:px-10 lg:px-20 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <Section>
              <p className="text-[9px] tracking-[0.52em] uppercase text-white/25 mb-10" style={clash}>
                What people are saying
              </p>
              <blockquote
                className="text-white/90 leading-[1.4] tracking-[-0.01em] mb-8"
                style={{ ...cg, fontSize: 'clamp(1.7rem, 4vw, 3rem)', fontWeight: 400, fontStyle: 'italic' }}
              >
                "I never thought I'd be a thrift shopper until KayVogue changed everything. The quality is genuinely unreal."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-8 h-px bg-white/20" />
                <p className="text-[10px] tracking-[0.38em] uppercase text-white/35" style={clash}>
                  Verified customer · Lagos
                </p>
                <div className="w-8 h-px bg-white/20" />
              </div>

              {/* Star rating */}
              <div className="flex items-center justify-center gap-1 mt-8">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} viewBox="0 0 12 12" fill="#fff" className="w-3 h-3 opacity-80">
                    <polygon points="6 1 7.5 4.5 11 4.8 8.5 7.1 9.2 11 6 9.2 2.8 11 3.5 7.1 1 4.8 4.5 4.5"/>
                  </svg>
                ))}
                <span className="text-[10px] text-white/30 ml-2 tracking-[0.2em]" style={clash}>5.0 from 200+ reviews</span>
              </div>
            </Section>
          </div>
        </section>

        {/* ════════════════════════════════════════
            08 · SUSTAINABILITY NOTE
        ════════════════════════════════════════ */}
        <section className="px-5 sm:px-10 lg:px-20 py-20 sm:py-28 border-b border-black/[0.07]">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20 items-center">
            <Section>
              <div className="w-10 h-10 border border-black/12 flex items-center justify-center mb-8 text-[#111]">
                <IconLeaf />
              </div>
              <p className="text-[9px] tracking-[0.52em] uppercase text-black/35 mb-5" style={clash}>Sustainability</p>
              <h2
                className="leading-[1.1] tracking-[-0.015em] text-[#111] mb-7"
                style={{ ...cg, fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 600 }}
              >
                Every piece you buy is one less piece in a landfill.
              </h2>
              <p className="text-[13.5px] text-black/55 leading-[1.9]" style={clash}>
                The fashion industry is one of the most polluting in the world.
                By choosing preloved, you're actively reducing waste, lowering carbon
                emissions, and giving great clothes a second life. At KayVogue, sustainability
                isn't a trend — it's built into our DNA.
              </p>
            </Section>

            <Section delay={0.1}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { num: '70%',  label: 'Less water used vs new garment production' },
                  { num: '3×',   label: 'Longer a garment lasts when loved twice'    },
                  { num: '50%',  label: 'Lower carbon footprint per item sold'       },
                  { num: '500+', label: 'Kilograms of clothing saved from landfill'  },
                ].map(({ num, label }) => (
                  <div key={label} className="bg-white border border-black/[0.07] px-5 py-7">
                    <p
                      className="text-[#111] mb-2 leading-none"
                      style={{ ...cg, fontSize: '2.2rem', fontWeight: 600 }}
                    >
                      {num}
                    </p>
                    <p className="text-[11px] text-black/45 leading-[1.65]" style={clash}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ════════════════════════════════════════
            09 · CONNECT
        ════════════════════════════════════════ */}
        <section className="px-5 sm:px-10 lg:px-20 py-16 sm:py-20 bg-white border-b border-black/[0.07]">
          <div className="max-w-[1400px] mx-auto">
            <Section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-[9px] tracking-[0.52em] uppercase text-black/35 mb-3" style={clash}>Stay connected</p>
                  <h3
                    className="text-[#111]"
                    style={{ ...cg, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 600 }}
                  >
                    Follow the drops.
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://instagram.com/kayvogue"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-btn inline-flex items-center gap-2.5 border border-black/15 px-6 py-3.5 text-[10.5px] tracking-[0.32em] uppercase text-[#111]"
                  >
                    <IconInstagram />
                    Instagram
                  </a>
                  <a
                    href="https://wa.me/2340000000000"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-btn inline-flex items-center gap-2.5 border border-black/15 px-6 py-3.5 text-[10.5px] tracking-[0.32em] uppercase text-[#111]"
                  >
                    <IconWhatsapp />
                    WhatsApp
                  </a>
                </div>
              </div>
            </Section>
          </div>
        </section>

        {/* ════════════════════════════════════════
            10 · FINAL CTA
        ════════════════════════════════════════ */}
        <section className="px-5 sm:px-10 lg:px-20 py-24 sm:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <Section>
              <p className="text-[9px] tracking-[0.55em] uppercase text-black/30 mb-8" style={clash}>
                Ready to explore?
              </p>
              <h2
                className="leading-[1.08] tracking-[-0.02em] text-[#111] mb-10"
                style={{ ...cg, fontSize: 'clamp(2.8rem, 7vw, 6.5rem)', fontWeight: 600 }}
              >
                Your next favourite<br />
                <span style={{ fontStyle: 'italic' }}>piece is waiting.</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/shop"
                  className="cta-btn inline-flex items-center justify-center gap-3 bg-[#111] text-white px-10 py-5 text-[11px] tracking-[0.4em] uppercase"
                >
                  <span>Shop now</span>
                  <IconArrow />
                </Link>
                <Link
                  to="/reviews"
                  className="secondary-btn inline-flex items-center justify-center gap-2 border border-black/20 px-10 py-5 text-[11px] tracking-[0.4em] uppercase text-[#111]"
                >
                  Read reviews
                </Link>
              </div>

              {/* Micro trust strip */}
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mt-12">
                {['Free delivery above ₦55k', '14-day returns', 'Quality guaranteed', 'New drops weekly'].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-black/25" />
                    <span className="text-[10px] tracking-[0.22em] uppercase text-black/40" style={clash}>{t}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </section>

      </main>
    </>
  )
}

export default About
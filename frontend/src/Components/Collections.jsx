import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowForwardOutlined } from '@mui/icons-material'

// ─── Images — swap freely ─────────────────────────────────────────────
const IMAGES = [
  { src: '../../src/assets/wm1.jpg',  alt: 'Woman in curated thrift wear'       },
  { src: '../../src/assets/sw20.jpg', alt: 'Styled sweatshirt from collection'  },
  { src: '../../src/assets/bg1.jpg',  alt: 'Brand editorial shot'               },
  { src: '../../src/assets/sw14.jpg', alt: 'Oversized silhouette lookbook'      },
]

// ─── Stats ────────────────────────────────────────────────────────────
const STATS = [
  { value: '2,400+', label: 'Pieces curated' },
  { value: '98%',    label: 'Satisfied buyers' },
  { value: '3-day',  label: 'Avg. delivery'    },
]

// ─── Animation helpers ────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  },
})

const fadeIn = (delay = 0) => ({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay } },
})

// ─────────────────────────────────────────────────────────────────────
export default function About() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // pick a stable random image per mount
  const hero = IMAGES[Math.floor(Math.random() * IMAGES.length)]
  // secondary: the one after hero in the array
  const secondary = IMAGES[(IMAGES.indexOf(hero) + 1) % IMAGES.length]

  return (
    <section
      ref={ref}
      aria-label="About Kayswear"
      style={{
        width: '100%',
        background: '#faf9f7',
        padding: 'clamp(3.5rem, 9vw, 7rem) clamp(1rem, 4vw, 2rem)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: 'clamp(2.5rem, 6vw, 6rem)',
          alignItems: 'center',
        }}
      >

        {/* ════ LEFT — Image composition ════ */}
        <motion.div
          variants={fadeIn(0.05)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ position: 'relative' }}
        >
          {/* ── Primary image ── */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '3/4',
              overflow: 'hidden',
              background: '#ede9e3',
            }}
          >
            <img
              src={hero.src}
              alt={hero.alt}
              loading="eager"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top',
                display: 'block',
              }}
            />

            {/* Floating label — bottom left */}
            <div
              style={{
                position: 'absolute', bottom: '1.5rem', left: '1.5rem',
                background: 'rgba(250,249,247,0.92)',
                backdropFilter: 'blur(6px)',
                padding: '0.65rem 1rem',
                display: 'flex', flexDirection: 'column', gap: 2,
                maxWidth: 160,
              }}
            >
              <span
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: 'italic', fontWeight: 300,
                  fontSize: '1.05rem', color: '#0a0a0a', lineHeight: 1.2,
                }}
              >
                Curated thrift.
              </span>
              <span
                style={{
                  fontFamily: '"clash_display", sans-serif',
                  fontSize: 8, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.4,
                }}
              >
                Lagos, Nigeria
              </span>
            </div>
          </div>

          {/* ── Inset secondary image — overlaps primary ── */}
          <div
            style={{
              position: 'absolute',
              bottom: '-1.75rem',
              right: '-1rem',
              width: 'clamp(130px, 32%, 190px)',
              aspectRatio: '2/3',
              overflow: 'hidden',
              background: '#d5cfc5',
              border: '4px solid #faf9f7',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={secondary.src}
              alt={secondary.alt}
              loading="lazy"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top',
                display: 'block',
              }}
            />
          </div>

          {/* ── Year badge ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', top: '1.25rem', right: '-0.5rem',
              background: '#0a0a0a',
              padding: '0.6rem 0.85rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic', fontWeight: 300,
                fontSize: '1.3rem', color: '#fff', lineHeight: 1,
              }}
            >
              Est.
            </span>
            <span
              style={{
                fontFamily: '"clash_display", sans-serif',
                fontSize: 10, letterSpacing: '0.12em',
                color: '#fff', opacity: 0.6,
              }}
            >
              2022
            </span>
          </div>
        </motion.div>

        {/* ════ RIGHT — Copy ════ */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Eyebrow */}
          <motion.p
            variants={fadeUp(0.15)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              fontFamily: '"clash_display", sans-serif',
              fontSize: 9, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.35,
              margin: '0 0 1.1rem',
            }}
          >
            Our story
          </motion.p>

          {/* Headline */}
          <motion.h2
            variants={fadeUp(0.2)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 'clamp(2.4rem, 5vw, 3.4rem)',
              lineHeight: 1.08, color: '#0a0a0a',
              margin: '0 0 1.4rem',
            }}
          >
            Dressed in quality,<br />priced for everyone.
          </motion.h2>

          {/* Rule */}
          <motion.div
            variants={fadeIn(0.27)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ width: 40, height: 1, background: 'rgba(10,10,10,0.15)', marginBottom: '1.4rem' }}
          />

          {/* Body */}
          <motion.p
            variants={fadeUp(0.3)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              fontFamily: '"clash_display", sans-serif',
              fontSize: 11, letterSpacing: '0.04em',
              lineHeight: 1.9, color: '#0a0a0a', opacity: 0.5,
              margin: '0 0 1rem',
            }}
          >
            KayVogue started with a simple idea — great style should never be
            out of reach. We hand-pick every piece from trusted sources so you
            get premium quality at a fraction of the original price.
          </motion.p>

          <motion.p
            variants={fadeUp(0.35)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              fontFamily: '"clash_display", sans-serif',
              fontSize: 11, letterSpacing: '0.04em',
              lineHeight: 1.9, color: '#0a0a0a', opacity: 0.4,
              margin: '0 0 2.2rem',
            }}
          >
            From oversized hoodies to clean-cut sweatshirts, every item is
            inspected, styled, and shipped with care. This is thrifting, refined.
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={fadeUp(0.4)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '2.2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid rgba(10,10,10,0.08)',
            }}
          >
            {STATS.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: 'italic', fontWeight: 300,
                    fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                    color: '#0a0a0a', lineHeight: 1,
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 8.5, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.3,
                    lineHeight: 1.4,
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeUp(0.45)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
          >
            <Link
              to="/shop"
              aria-label="Shop the full collection"
              style={{
                height: 50,
                padding: '0 1.75rem',
                background: '#0a0a0a',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                textDecoration: 'none',
                fontFamily: '"clash_display", sans-serif',
                fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: '#fff',
                transition: 'background 0.25s',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}
            >
              Shop collection
              <ArrowForwardOutlined style={{ fontSize: 13 }} />
            </Link>

            <Link
              to="/about"
              aria-label="Read our full story"
              style={{
                fontFamily: '"clash_display", sans-serif',
                fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#0a0a0a', opacity: 0.4,
                textDecoration: 'none',
                borderBottom: '1px solid rgba(10,10,10,0.2)',
                paddingBottom: 2,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            >
              Our story
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Mobile: pull inset image down so it doesn't clip ── */}
      <style>{`
        @media (max-width: 640px) {
          [data-about-img-wrap] { margin-bottom: 2.5rem; }
        }
      `}</style>
    </section>
  )
}
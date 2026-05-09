import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloseOutlined, ArrowForwardOutlined, LocalOfferOutlined } from '@mui/icons-material'

// ─── Animation variants ───────────────────────────────────────────────
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.28 } },
}

const modalVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 32, mass: 0.9, delay: 0.06 },
  },
  exit: {
    opacity: 0, y: 20, scale: 0.97,
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
  },
}

const contentVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.22 } },
}

const lineVariant = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Main Component ───────────────────────────────────────────────────
const ScrollPopup = () => {
  const [visible, setVisible]   = useState(false)
  const [triggered, setTriggered] = useState(false)
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 1000 && !triggered) {
        setVisible(true)
        setTriggered(true)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [triggered])

  // Lock body scroll while open
  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [visible])

  const close = () => setVisible(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!valid) { setError(true); return }
    setError(false)
    setSubmitted(true)
    setTimeout(close, 2200)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(10,10,10,0.55)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />

          {/* ── Modal ── */}
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Exclusive offer"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '780px',
                background: '#fff',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                pointerEvents: 'all',
                position: 'relative',
              }}
              className="scroll-popup-inner"
            >

              {/* ── Close button ── */}
              <button
                onClick={close}
                aria-label="Close offer"
                style={{
                  position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
                  width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0a0a0a', opacity: 0.35, cursor: 'pointer',
                  background: 'transparent', border: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.35'}
              >
                <CloseOutlined style={{ fontSize: 18 }} />
              </button>

              {/* ── Left image panel ── */}
              <div
                className="popup-image-panel"
                style={{
                  width: '42%',
                  minHeight: '480px',
                  position: 'relative',
                  flexShrink: 0,
                  overflow: 'hidden',
                  background: '#f0ece6',
                }}
              >
                <img
                  src="../../src/assets/hd10.jpg"
                  alt="Collection preview"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'top',
                    display: 'block',
                  }}
                />
                {/* Overlay badge */}
                <div
                  style={{
                    position: 'absolute', bottom: '1.5rem', left: '1.5rem',
                    background: '#0a0a0a',
                    padding: '0.5rem 0.85rem',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <LocalOfferOutlined style={{ fontSize: 11, color: '#fff', opacity: 0.6 }} />
                  <span
                    style={{
                      color: '#fff', fontSize: 9, letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontFamily: '"clash_display", sans-serif',
                    }}
                  >
                    Limited Offer
                  </span>
                </div>
              </div>

              {/* ── Right content panel ── */}
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                style={{
                  flex: 1,
                  padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0,
                  background: '#faf9f7',
                }}
              >
                {/* Eyebrow */}
                <motion.p
                  variants={lineVariant}
                  style={{
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 9, letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: '#0a0a0a', opacity: 0.35,
                    margin: '0 0 1.1rem',
                  }}
                >
                  Members only
                </motion.p>

                {/* Headline */}
                <motion.h2
                  variants={lineVariant}
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(2rem, 4vw, 2.6rem)',
                    lineHeight: 1.12,
                    color: '#0a0a0a',
                    margin: '0 0 0.75rem',
                  }}
                >
                  Unlock free gifts<br />on your first order.
                </motion.h2>

                {/* Divider */}
                <motion.div
                  variants={lineVariant}
                  style={{
                    width: 36, height: 1,
                    background: '#0a0a0a', opacity: 0.15,
                    margin: '0 0 1.1rem',
                  }}
                />

                {/* Body copy */}
                <motion.p
                  variants={lineVariant}
                  style={{
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 10.5, letterSpacing: '0.06em',
                    color: '#0a0a0a', opacity: 0.45,
                    lineHeight: 1.8,
                    margin: '0 0 2rem',
                    textTransform: 'none',
                  }}
                >
                  Spend above ₦50,000 and choose a free item — hoodies, joggers,
                  shorts, and more. Join the list to claim yours before it sells out.
                </motion.p>

                {/* Form / Success */}
                <motion.div variants={lineVariant}>
                  <AnimatePresence mode="wait">
                    {!submitted ? (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.18 } }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            border: error
                              ? '1px solid rgba(200, 71, 43, 0.6)'
                              : '1px solid rgba(10,10,10,0.15)',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(false) }}
                            style={{
                              flex: 1,
                              padding: '0 1rem',
                              height: 48,
                              border: 'none',
                              outline: 'none',
                              background: 'transparent',
                              fontFamily: '"clash_display", sans-serif',
                              fontSize: 11,
                              letterSpacing: '0.06em',
                              color: '#0a0a0a',
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              height: 48,
                              padding: '0 1.25rem',
                              background: '#0a0a0a',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              flexShrink: 0,
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                            onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}
                          >
                            <span
                              style={{
                                fontFamily: '"clash_display", sans-serif',
                                fontSize: 9, letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: '#fff',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Claim
                            </span>
                            <ArrowForwardOutlined style={{ fontSize: 13, color: '#fff' }} />
                          </button>
                        </div>

                        {/* Error message */}
                        <AnimatePresence>
                          {error && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              style={{
                                fontFamily: '"clash_display", sans-serif',
                                fontSize: 9, letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: '#c8472b',
                                marginTop: 8,
                              }}
                            >
                              Please enter a valid email address
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                        style={{
                          padding: '1.2rem 1.4rem',
                          background: 'rgba(42, 122, 75, 0.07)',
                          borderLeft: '2px solid #2a7a4b',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            fontSize: '1.25rem',
                            color: '#2a7a4b',
                            margin: '0 0 4px',
                          }}
                        >
                          You're on the list.
                        </p>
                        <p
                          style={{
                            fontFamily: '"clash_display", sans-serif',
                            fontSize: 9, letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: '#2a7a4b', opacity: 0.7,
                            margin: 0,
                          }}
                        >
                          Check your inbox for your offer code
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Dismiss */}
                {!submitted && (
                  <motion.button
                    variants={lineVariant}
                    onClick={close}
                    style={{
                      marginTop: '1.25rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: '"clash_display", sans-serif',
                      fontSize: 9, letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#0a0a0a', opacity: 0.3,
                      padding: 0, textAlign: 'left',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                  >
                    No thanks, I'll pass
                  </motion.button>
                )}

                {/* Trust line */}
                <motion.p
                  variants={lineVariant}
                  style={{
                    marginTop: '2rem',
                    fontFamily: '"clash_display", sans-serif',
                    fontSize: 8.5, letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#0a0a0a', opacity: 0.2,
                    paddingTop: '1.2rem',
                    borderTop: '1px solid rgba(10,10,10,0.07)',
                  }}
                >
                  No spam, ever. Unsubscribe any time.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 600px) {
          .popup-image-panel { display: none !important; }
          .scroll-popup-inner {
            flex-direction: column !important;
            max-height: 90dvh;
            overflow-y: auto;
          }
        }
      `}</style>
    </AnimatePresence>
  )
}

export default ScrollPopup
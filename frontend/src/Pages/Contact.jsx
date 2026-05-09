import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

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

  /* floating label field */
  .field-wrap { position:relative; }
  .field-label {
    position:absolute;
    left:0; top:50%; transform:translateY(-50%);
    font-size:10px; letter-spacing:.42em; text-transform:uppercase;
    color:#9ca3af; pointer-events:none;
    transition: top .2s ease, font-size .2s ease, color .2s ease, transform .2s ease;
    font-family: 'Clash Display', sans-serif;
  }
  .field-wrap textarea ~ .field-label { top:14px; transform:none; }
  .field-wrap input:focus ~ .field-label,
  .field-wrap input:not(:placeholder-shown) ~ .field-label,
  .field-wrap textarea:focus ~ .field-label,
  .field-wrap textarea:not(:placeholder-shown) ~ .field-label {
    top:2px; transform:translateY(0);
    font-size:8px; color:#111;
  }
  .field-input {
    width:100%; background:transparent; border:none;
    border-bottom:1px solid #d1d5db;
    padding:22px 0 8px; outline:none;
    font-size:14px; color:#111;
    transition:border-color .2s ease;
    font-family:'Clash Display',sans-serif;
    resize:none;
  }
  .field-input:focus { border-bottom-color:#111; }
  .field-input.error { border-bottom-color:#dc2626; }
  textarea.field-input { min-height:120px; padding-top:22px; }

  /* select — match input style */
  .field-select {
    width:100%; background:transparent; border:none;
    border-bottom:1px solid #d1d5db;
    padding:22px 0 8px; outline:none;
    font-size:13px; color:#111;
    transition:border-color .2s ease;
    font-family:'Clash Display',sans-serif;
    appearance:none;
    cursor:pointer;
  }
  .field-select:focus { border-bottom-color:#111; }

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
  .cta-btn:disabled { opacity:.55; cursor:not-allowed; }
  .cta-btn:disabled::before { display:none; }

  .ghost-btn { transition:background .22s ease, color .22s ease; }
  .ghost-btn:hover { background:#111; color:#fff; }

  .info-card { transition:box-shadow .22s ease, transform .22s ease; }
  .info-card:hover { box-shadow:0 8px 32px -10px rgba(0,0,0,.12); transform:translateY(-2px); }

  @keyframes spin {
    to { transform:rotate(360deg); }
  }
  .spinner { animation:spin .8s linear infinite; }
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
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="1"/>
    <path d="M2 4l10 9 10-9" strokeLinecap="round"/>
  </svg>
)
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.52 10.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012.44 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.13 6.13l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round"/>
  </svg>
)
const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round"/>
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2" strokeLinecap="round"/>
  </svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 spinner">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconChevronDown = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 pointer-events-none">
    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

/* ─────────────────────────────────────────────
   FLOATING FIELD
───────────────────────────────────────────── */
const Field = ({ label, type = 'text', name, value, onChange, multiline = false, hasError }) => (
  <div className="field-wrap">
    {multiline ? (
      <>
        <textarea
          name={name}
          placeholder=" "
          value={value}
          onChange={onChange}
          className={`field-input${hasError ? ' error' : ''}`}
          rows={5}
        />
        <span className="field-label">{label}</span>
      </>
    ) : (
      <>
        <input
          type={type}
          name={name}
          placeholder=" "
          value={value}
          onChange={onChange}
          className={`field-input${hasError ? ' error' : ''}`}
          autoComplete="off"
        />
        <span className="field-label">{label}</span>
      </>
    )}
  </div>
)

/* ─────────────────────────────────────────────
   CONTACT INFO CARD
───────────────────────────────────────────── */
const InfoCard = ({ icon, label, sub, href, external }) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noreferrer' : undefined}
    className="info-card flex items-start gap-4 bg-white border border-black/[0.07] px-6 py-6 block"
  >
    <div className="w-10 h-10 bg-[#111] flex items-center justify-center flex-shrink-0 text-white">
      {icon}
    </div>
    <div>
      <p className="text-[13.5px] font-medium text-[#111] mb-1" style={clash}>{label}</p>
      <p className="text-[12px] text-black/45 leading-[1.7]" style={clash}>{sub}</p>
    </div>
  </a>
)

/* ─────────────────────────────────────────────
   SUCCESS STATE
───────────────────────────────────────────── */
const SuccessState = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 bg-[#111] flex items-center justify-center mb-7 text-white">
      <IconCheck />
    </div>
    <h3
      className="text-[#111] mb-3"
      style={{ ...cg, fontSize: '2rem', fontWeight: 600 }}
    >
      Message received.
    </h3>
    <p className="text-[13.5px] text-black/50 leading-[1.8] max-w-sm mb-10" style={clash}>
      We'll get back to you within 24 hours. For faster help, reach us on WhatsApp.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href="https://wa.me/2340000000000"
        target="_blank"
        rel="noreferrer"
        className="cta-btn inline-flex items-center gap-2.5 bg-[#111] text-white px-7 py-4 text-[10px] tracking-[0.38em] uppercase"
      >
        <span className="flex items-center gap-2.5">
          <IconWhatsapp />
          Open WhatsApp
        </span>
      </a>
      <button
        onClick={onReset}
        className="ghost-btn border border-black/15 px-7 py-4 text-[10px] tracking-[0.38em] uppercase text-[#111]"
      >
        Send another
      </button>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   SUBJECTS
───────────────────────────────────────────── */
const SUBJECTS = [
  'Order enquiry',
  'Return / refund',
  'Product question',
  'Delivery issue',
  'Payment problem',
  'Other',
]

const HOURS = [
  { day: 'Monday – Friday', time: '9:00 AM – 8:00 PM WAT' },
  { day: 'Saturday',        time: '10:00 AM – 6:00 PM WAT' },
  { day: 'Sunday',          time: 'WhatsApp only'           },
]

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent]           = useState(false)

  const formRef = useReveal()
  const infoRef = useReveal()

  const change = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: false }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = true
    if (!form.email.trim())   e.email   = true
    if (!form.message.trim()) e.message = true
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = true
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
        setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        toast.error('Failed to send. Please try again or contact us on WhatsApp.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <main className="bg-[#f9f8f6] text-[#111] min-h-screen" style={clash}>

        {/* ── HERO ── */}
        <section className="px-5 sm:px-10 lg:px-20 pt-32 sm:pt-40 pb-16 sm:pb-20 max-w-[1400px] mx-auto">
          <p className="hero-line d0 text-[9px] tracking-[0.55em] uppercase text-black/35 mb-6">
            Contact
          </p>
          <h1
            className="hero-line d1 leading-[1.07] tracking-[-0.02em] text-[#111] max-w-3xl mb-7"
            style={{ ...cg, fontSize: 'clamp(2.8rem, 7vw, 6rem)', fontWeight: 600 }}
          >
            Let's talk.
          </h1>
          <p className="hero-line d2 text-[14px] sm:text-[15px] text-black/50 leading-[1.8] max-w-lg">
            Questions, orders, returns — we're here for all of it. Send us a message and we'll get back to you fast.
          </p>
        </section>

        <div className="border-t border-black/[0.07]" />

        {/* ── BODY ── */}
        <section className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-20 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-12 lg:gap-20">

            {/* ── LEFT: Form ── */}
            <div ref={formRef} className="reveal">
              {sent ? (
                <SuccessState onReset={() => setSent(false)} />
              ) : (
                <>
                  <div className="mb-10">
                    <p className="text-[9px] tracking-[0.52em] uppercase text-black/30 mb-3">Send a message</p>
                    <h2
                      className="text-[#111]"
                      style={{ ...cg, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', fontWeight: 600 }}
                    >
                      We typically reply within 24 hours.
                    </h2>
                  </div>

                  {/* Error notice */}
                  {Object.keys(errors).length > 0 && (
                    <div className="mb-7 border border-red-200 bg-red-50 px-5 py-3">
                      <p className="text-[12px] text-red-600" style={clash}>
                        Please fill in all required fields.
                      </p>
                    </div>
                  )}

                  <form onSubmit={submit} noValidate className="space-y-8">
                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <Field label="Full name *" name="name" value={form.name} onChange={change} hasError={errors.name} />
                      <Field label="Email address *" type="email" name="email" value={form.email} onChange={change} hasError={errors.email} />
                    </div>

                    {/* Phone + Subject row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <Field label="Phone (optional)" type="tel" name="phone" value={form.phone} onChange={change} />

                      {/* Custom select */}
                      <div className="field-wrap relative">
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={change}
                          className="field-select"
                        >
                          <option value="" disabled hidden>Select topic</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
                          <IconChevronDown />
                        </span>
                        <div
                          className="absolute left-0 bottom-0 h-px bg-black/12 w-full"
                          style={{ pointerEvents: 'none' }}
                        />
                        <span
                          className="absolute left-0 top-[3px] text-[8px] tracking-[0.42em] uppercase text-[#111] pointer-events-none"
                          style={clash}
                        >
                          {form.subject ? 'Topic' : ''}
                        </span>
                        {!form.subject && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.42em] uppercase text-black/30 pointer-events-none"
                            style={clash}
                          >
                            Topic
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <Field
                      label="Your message *"
                      name="message"
                      value={form.message}
                      onChange={change}
                      multiline
                      hasError={errors.message}
                    />

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="cta-btn w-full flex items-center justify-center gap-3 bg-[#111] text-white py-5 text-[10.5px] tracking-[0.42em] uppercase"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2.5">
                          <IconSpinner />
                          Sending…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2.5">
                          Send message
                          <IconArrow />
                        </span>
                      )}
                    </button>

                    <p className="text-[10px] text-black/28 text-center leading-[1.7]" style={clash}>
                      For fastest help, reach us directly on{' '}
                      <a href="https://wa.me/2340000000000" target="_blank" rel="noreferrer" className="underline underline-offset-2 text-black/45 hover:text-[#111] transition-colors">
                        WhatsApp
                      </a>
                      .
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div ref={infoRef} className="reveal space-y-4" style={{ transitionDelay: '.1s' }}>

              <div className="mb-8">
                <p className="text-[9px] tracking-[0.52em] uppercase text-black/30 mb-3">Reach us directly</p>
                <h2
                  className="text-[#111]"
                  style={{ ...cg, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 600 }}
                >
                  Contact information.
                </h2>
              </div>

              <InfoCard
                icon={<IconWhatsapp />}
                label="WhatsApp"
                sub="Fastest response — usually within the hour"
                href="https://wa.me/2340000000000"
                external
              />
              <InfoCard
                icon={<IconMail />}
                label="Email"
                sub="support@kayvogue.com"
                href="mailto:support@kayvogue.com"
              />
              <InfoCard
                icon={<IconInstagram />}
                label="Instagram"
                sub="DM us @kayvogue — we're always there"
                href="https://instagram.com/kayvogue"
                external
              />
              <InfoCard
                icon={<IconPhone />}
                label="Phone"
                sub="+234 800 000 0000 · Mon–Fri, 9am–8pm"
                href="tel:+2348000000000"
              />

              {/* Business hours */}
              <div className="bg-white border border-black/[0.07] px-6 py-6 mt-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#111] flex items-center justify-center flex-shrink-0 text-white">
                    <IconClock />
                  </div>
                  <p className="text-[13px] font-medium text-[#111]" style={clash}>Business hours</p>
                </div>
                <div className="space-y-3">
                  {HOURS.map(({ day, time }) => (
                    <div key={day} className="flex justify-between items-baseline gap-4">
                      <span className="text-[11.5px] text-black/45" style={clash}>{day}</span>
                      <span className="text-[11.5px] text-[#111] font-medium text-right" style={clash}>{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-[#111] px-6 py-7 mt-2">
                <p className="text-[8.5px] tracking-[0.4em] uppercase text-white/30 mb-4" style={clash}>Quick links</p>
                <div className="space-y-3">
                  {[
                    { label: 'FAQs',     to: '/faqs' },
                    { label: 'My orders', to: '/profile' },
                    { label: 'Shop',     to: '/shop' },
                  ].map(({ label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      className="flex items-center justify-between group py-2 border-b border-white/[0.08]"
                    >
                      <span className="text-[12px] tracking-[0.06em] uppercase text-white/55 group-hover:text-white/90 transition-colors" style={clash}>
                        {label}
                      </span>
                      <span className="text-white/25 group-hover:text-white/55 group-hover:translate-x-0.5 transition-all duration-200">
                        <IconArrow />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}

export default Contact
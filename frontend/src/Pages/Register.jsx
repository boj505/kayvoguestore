import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  findUserByEmail,
  findUserByName,
  getSavedUsers,
  hashPassword,
  normalizeEmail,
  normalizeName,
  saveUsers,
  validateEmail,
  generateAuthToken,
} from '../utils/authHelpers'

/* ── Pick a random brand image each mount ── */
const IMGS = [
  '../../src/assets/hd10.jpg',
  '../../src/assets/sw1.jpg',
  '../../src/assets/sw5.jpg',
  '../../src/assets/hd9.jpg',
  '../../src/assets/hd6.jpg',
  '../../src/assets/hd7.jpg',
]
const randomImg = IMGS[Math.floor(Math.random() * IMGS.length)]

/* ── inline keyframes (shared subset) ── */
const css = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes shake {
    0%,100% { transform:translateX(0); }
    20%,60% { transform:translateX(-6px); }
    40%,80% { transform:translateX(6px); }
  }
  .anim-fade-up { animation: fadeUp .55s cubic-bezier(.22,.68,0,1.15) both; }
  .anim-fade-in { animation: fadeIn .7s ease both; }
  .delay-1 { animation-delay:.08s; }
  .delay-2 { animation-delay:.16s; }
  .delay-3 { animation-delay:.24s; }
  .delay-4 { animation-delay:.32s; }
  .delay-5 { animation-delay:.40s; }
  .delay-6 { animation-delay:.48s; }
  .shake    { animation: shake .35s ease; }

  .field-wrap { position:relative; }
  .field-label {
    position:absolute; left:0; top:50%; transform:translateY(-50%);
    font-size:10px; letter-spacing:.4em; text-transform:uppercase;
    color:#9ca3af; pointer-events:none;
    transition: top .2s ease, font-size .2s ease, color .2s ease, transform .2s ease;
  }
  .field-wrap input:focus ~ .field-label,
  .field-wrap input:not(:placeholder-shown) ~ .field-label {
    top:2px; transform:translateY(0);
    font-size:8px; color:#111;
  }
  .field-input {
    width:100%; background:transparent; border:none; border-bottom:1px solid #d1d5db;
    padding:22px 0 8px; outline:none; font-size:14px; color:#111;
    transition: border-color .2s ease;
    font-family: inherit;
  }
  .field-input:focus { border-bottom-color:#111; }
  .field-input.error { border-bottom-color:#dc2626; }

  .eye-btn {
    position:absolute; right:0; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px;
  }
  .eye-btn:hover { color:#111; }

  .strength-bar {
    height:2px; transition: width .35s ease, background .35s ease;
  }

  .submit-btn {
    width:100%; background:#111; color:#fff;
    font-size:10px; letter-spacing:.45em; text-transform:uppercase;
    padding:18px 0; border:none; cursor:pointer;
    transition: background .2s ease;
    font-family: inherit;
  }
  .submit-btn:hover  { background:#333; }
  .submit-btn:active { transform:scale(.99); }
  .submit-btn:disabled { background:#888; cursor:not-allowed; }

  .check-item { display:flex; align-items:center; gap:6px; }
  .check-icon { flex-shrink:0; transition: color .2s ease; }
`

/* ── password strength ── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: '',        color: 'transparent', pct: '0%'   },
    { label: 'Weak',    color: '#dc2626',     pct: '25%'  },
    { label: 'Fair',    color: '#b45309',     pct: '50%'  },
    { label: 'Good',    color: '#2563eb',     pct: '75%'  },
    { label: 'Strong',  color: '#0d7a5f',     pct: '100%' },
  ]
  return { score, ...map[score] }
}

/* ── Eye icons ── */
const EyeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

/* ── Check icon ── */
const Check = ({ active }) => (
  <svg viewBox="0 0 12 12" fill="none" className={`w-3 h-3 check-icon ${active ? 'text-[#0d7a5f]' : 'text-gray-300'}`}>
    <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" />
    <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

/* ── Floating label field ── */
const Field = ({ label, type = 'text', value, onChange, autoComplete, showToggle, hasError }) => {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="field-wrap mb-7">
      <input
        type={isPassword && show ? 'text' : type}
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`field-input${hasError ? ' error' : ''}`}
      />
      <span className="field-label">{label}</span>
      {isPassword && showToggle && (
        <button type="button" className="eye-btn" onClick={() => setShow(p => !p)} tabIndex={-1}>
          {show ? <EyeOff /> : <EyeOn />}
        </button>
      )}
    </div>
  )
}

/* ─────────────────────── Register ─────────────────────── */

const Register = () => {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [shaking, setShaking]   = useState(false)
  const [agree, setAgree]       = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()
  const strength  = getStrength(password)

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const pwChecks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'Number',        pass: /[0-9]/.test(password) },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      triggerShake(); return
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      triggerShake(); return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      triggerShake(); return
    }
    if (!agree) {
      setError('Please agree to the terms to continue.')
      triggerShake(); return
    }

    const normalizedEmail = normalizeEmail(email)
    const normalizedName  = normalizeName(name)

    const existingEmail = findUserByEmail(normalizedEmail)
    const existingName  = findUserByName(normalizedName)

    if (existingEmail && existingEmail.name !== name.trim()) {
      setError('This email is already linked to a different account.')
      triggerShake(); return
    }
    if (existingName && existingName.email !== normalizedEmail) {
      setError('This name is already linked to a different account.')
      triggerShake(); return
    }
    if (existingEmail || existingName) {
      setError('An account already exists. Please sign in.')
      triggerShake(); return
    }

    setLoading(true)
    try {
      const passwordHash = await hashPassword(password)
      const userId = crypto.randomUUID?.() || `user-${Date.now()}`
      const userData = {
        id: userId,
        name: name.trim(),
        firstName: name.trim().split(' ')[0],
        lastName: name.trim().split(' ')[1] || '',
        email: normalizedEmail,
        passwordHash,
        token: generateAuthToken(),
        createdAt: new Date().toISOString(),
      }

      saveUsers([...getSavedUsers(), userData])
      login({ id: userData.id, name: userData.name, firstName: userData.firstName, lastName: userData.lastName, email: userData.email }, userData.token)
      navigate('/profile', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen bg-[#f9f8f6] flex" style={{ fontFamily: 'Clash Display, sans-serif' }}>

        {/* ── Left: editorial image (shown on xl only, opposite side from Login) ── */}
        <div className="hidden xl:block xl:w-[44%] relative overflow-hidden order-first">
          <img
            src={randomImg}
            alt="Brand editorial"
            className="anim-fade-in absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Perks overlay */}
          <div className="absolute bottom-10 left-10 right-10">
            <div className="bg-white/90 backdrop-blur-sm px-7 py-6 space-y-4">
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-400">Member benefits</p>
              {[
                'Exclusive early access to new arrivals',
                'Order tracking & seamless returns',
                'Personalised style recommendations',
              ].map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#111] mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-[#111] leading-5">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-14">
          <div className="w-full max-w-sm mx-auto">

            {/* Back link */}
            <div className="anim-fade-up mb-10">
              <Link to="/" className="text-[9px] uppercase tracking-[0.6em] text-gray-400 hover:text-[#111] transition-colors">
                ← Back to shop
              </Link>
            </div>

            {/* Heading */}
            <div className="anim-fade-up delay-1 mb-9">
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-400 mb-3">Create account</p>
              <h1
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-tight text-[#111]"
              >
                Join us.
              </h1>
              <p className="mt-3 text-xs text-gray-400 leading-6">
                Already a member?{' '}
                <Link to="/login" className="text-[#111] underline underline-offset-2 hover:no-underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-6 border border-red-200 bg-red-50 px-4 py-3 ${shaking ? 'shake' : ''}`}>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="anim-fade-up delay-2">
                <Field label="Full name" type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="anim-fade-up delay-3">
                <Field label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="anim-fade-up delay-4">
                <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" showToggle />

                {/* Strength bar */}
                {password && (
                  <div className="-mt-5 mb-6">
                    <div className="h-[2px] w-full bg-black/[0.06] mb-2">
                      <div
                        className="strength-bar h-full"
                        style={{ width: strength.pct, background: strength.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        {pwChecks.map(({ label, pass }) => (
                          <div key={label} className="check-item">
                            <Check active={pass} />
                            <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400">{label}</span>
                          </div>
                        ))}
                      </div>
                      {strength.label && (
                        <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="anim-fade-up delay-5 mb-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={e => setAgree(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-4 h-4 border transition-colors duration-150"
                      style={{ borderColor: agree ? '#111' : '#d1d5db', background: agree ? '#111' : 'transparent' }}
                    >
                      {agree && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 leading-5 group-hover:text-gray-600 transition-colors">
                    I agree to the{' '}
                    <span className="text-[#111] underline underline-offset-2 cursor-pointer hover:no-underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-[#111] underline underline-offset-2 cursor-pointer hover:no-underline">Privacy Policy</span>
                  </span>
                </label>
              </div>

              <div className="anim-fade-up delay-6">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </div>
            </form>

            {/* Trust signals */}
            <div className="anim-fade-up delay-6 mt-9 pt-8 border-t border-black/[0.07]">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {['Secure checkout', 'Encrypted data', 'No spam'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5 flex-shrink-0">
                      <circle cx="6" cy="6" r="5.5" stroke="#9ca3af" strokeWidth="1" />
                      <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400">{t}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}

export default Register
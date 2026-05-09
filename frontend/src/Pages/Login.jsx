import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { findUserByEmail, hashPassword, validateEmail } from '../utils/authHelpers'

/* ── Pick a random brand image each mount ── */
const IMGS = [
  '../../src/assets/hd10.jpg',
  '../../src/assets/sw1.jpg',
  '../../src/assets/sw5.jpg',
  '../../src/assets/sw8.jpg',
  '../../src/assets/sw9.jpg',
  '../../src/assets/hd7.jpg',
]
const randomImg = IMGS[Math.floor(Math.random() * IMGS.length)]

/* ── inline keyframes ── */
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
  .delay-2 { animation-delay:.18s; }
  .delay-3 { animation-delay:.28s; }
  .delay-4 { animation-delay:.38s; }
  .delay-5 { animation-delay:.48s; }
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
  .eye-btn { position:absolute; right:0; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px; }
  .eye-btn:hover { color:#111; }
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
`

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

/* ── Floating label field ── */
const Field = ({ label, type = 'text', value, onChange, autoComplete, showToggle }) => {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="field-wrap mb-8">
      <input
        type={isPassword && show ? 'text' : type}
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="field-input"
      />
      <span className="field-label">{label}</span>
      {isPassword && showToggle && (
        <button type="button" className="eye-btn" onClick={() => setShow(p => !p)} tabIndex={-1}>
          {show ? <EyeOff /> : <EyeOn />}
        </button>
      )}
      <div className="h-[1px] w-0 bg-[#111] transition-all duration-300 group-focus-within:w-full" />
    </div>
  )
}

/* ─────────────────────── Login ─────────────────────── */

const Login = () => {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)
  const formRef = useRef(null)

  const { login }   = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const from        = location.state?.from?.pathname || '/profile'

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      triggerShake(); return
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      triggerShake(); return
    }

    setLoading(true)
    try {
      const user = findUserByEmail(email)
      if (!user) {
        setError('Account not found. Please register first.')
        triggerShake(); return
      }

      const passwordHash = await hashPassword(password)
      if (passwordHash !== user.passwordHash) {
        setError('Incorrect password. Please try again.')
        triggerShake(); return
      }

      login({ id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, email: user.email }, user.token)
      navigate(from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen pt-20 bg-[#f9f8f6] flex" style={{ fontFamily: 'Clash Display, sans-serif' }}>

        {/* ── Left: form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
          <div className="w-full max-w-sm mx-auto">

            {/* Brand word-mark */}
            <div className="anim-fade-up mb-12">
              <Link to="/" className="text-[9px] uppercase tracking-[0.6em] text-gray-400 hover:text-[#111] transition-colors">
                ← Back to shop
              </Link>
            </div>

            <div className="anim-fade-up delay-1 mb-10">
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-400 mb-3">Welcome back</p>
              <h1
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-tight text-[#111]"
              >
                Sign in.
              </h1>
              <p className="mt-3 text-xs text-gray-400 leading-6">
                New here?{' '}
                <Link to="/register" className="text-[#111] underline underline-offset-2 hover:no-underline transition-all">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-6 border border-red-200 bg-red-50 px-4 py-3 ${shaking ? 'shake' : ''}`}>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="anim-fade-up delay-2">
                <Field label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="anim-fade-up delay-3">
                <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" showToggle />
              </div>

              {/* Forgot password row */}
              <div className="anim-fade-up delay-4 flex justify-end mb-8 -mt-4">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] text-gray-400 hover:text-[#111] transition-colors underline underline-offset-2">
                  Forgot password?
                </button>
              </div>

              <div className="anim-fade-up delay-5">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Trust signals */}
            <div className="anim-fade-up delay-5 mt-10 pt-8 border-t border-black/[0.07]">
              <div className="flex items-center gap-6">
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

        {/* ── Right: editorial image ── */}
        <div className="hidden lg:block lg:w-[46%] xl:w-[50%] relative overflow-hidden">
          <img
            src={randomImg}
            alt="Brand editorial"
            className="anim-fade-in absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Overlay quote */}
          <div className="absolute bottom-10 left-10 right-10">
            <div className="bg-white/90 backdrop-blur-sm px-7 py-6">
              <p
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-xl font-semibold text-[#111] leading-snug"
              >
                "Crafted for those who wear their confidence."
              </p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-gray-400">The Brand</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default Login
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

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

/* ── Password strength indicator ── */
const getStrength = (password) => [
  { label: '8+ characters', pass: password.length >= 8 },
  { label: 'Uppercase',     pass: /[A-Z]/.test(password) },
  { label: 'Lowercase',     pass: /[a-z]/.test(password) },
  { label: 'Number',        pass: /[0-9]/.test(password) },
]

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [tokenValid, setTokenValid] = useState(null) // null = checking, true = valid, false = invalid

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const key = searchParams.get('key') // WordPress uses 'key' parameter

  const strength = getStrength(password)

  useEffect(() => {
    if (!token && !key) {
      setTokenValid(false)
      setError('Invalid reset link. Please request a new password reset.')
    } else {
      // For now, assume token is valid. The server will validate it during password reset
      setTokenValid(true)
    }
  }, [token, key])

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!password.trim()) {
      setError('Please enter a new password.')
      triggerShake()
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      triggerShake()
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      triggerShake()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          token: token || key // Use whichever parameter is present
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update localStorage with the new password hash
        if (data.passwordHash && data.email) {
          const { findUserByEmail, getSavedUsers, saveUsers, normalizeEmail } = await import('../utils/authHelpers')
          
          const user = findUserByEmail(normalizeEmail(data.email))
          if (user) {
            const updatedUser = { ...user, passwordHash: data.passwordHash }
            
            const allUsers = getSavedUsers()
            const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u)
            saveUsers(updatedUsers)
            
            setSuccess('Password reset successfully! You can now sign in with your new password.')
            setTimeout(() => navigate('/login'), 3000)
          } else {
            setError('User not found. Please try registering again.')
            triggerShake()
          }
        } else {
          setError('Invalid response from server.')
          triggerShake()
        }
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.')
        triggerShake()
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen pt-20 bg-[#f9f8f6] flex" style={{ fontFamily: 'Clash Display, sans-serif' }}>
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
          <div className="w-full max-w-sm mx-auto text-center">
            <div className="anim-fade-up mb-8">
              <Link to="/" className="text-[9px] uppercase tracking-[0.6em] text-gray-400 hover:text-[#111] transition-colors">
                ← Back to shop
              </Link>
            </div>

            <div className="anim-fade-up delay-1 mb-10">
              <h1
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-tight text-[#111] mb-4"
              >
                Invalid Link
              </h1>
              <p className="text-xs text-gray-400 leading-6">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <div className="anim-fade-up delay-2">
              <Link to="/forgot-password" className="submit-btn inline-block text-center">
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-400 mb-3">Reset password</p>
              <h1
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-tight text-[#111]"
              >
                Set new password
              </h1>
              <p className="mt-3 text-xs text-gray-400 leading-6">
                Enter your new password below.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-6 border border-red-200 bg-red-50 px-4 py-3 ${shaking ? 'shake' : ''}`}>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-xs text-green-600">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="anim-fade-up delay-2">
                <Field label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" showToggle />
              </div>

              <div className="anim-fade-up delay-3">
                <Field label="Confirm password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" showToggle />
              </div>

              {/* Password strength */}
              {password && (
                <div className="anim-fade-up delay-4 mb-6">
                  <div className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-2">Password requirements</div>
                  <div className="space-y-1">
                    {strength.map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${req.pass ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-[9px] uppercase tracking-[0.2em] ${req.pass ? 'text-green-600' : 'text-gray-400'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="anim-fade-up delay-5">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </div>
            </form>

            {/* Back to login */}
            <div className="anim-fade-up delay-5 mt-8 text-center">
              <p className="text-xs text-gray-400">
                Remember your password?{' '}
                <Link to="/login" className="text-[#111] underline underline-offset-2 hover:no-underline transition-all">
                  Sign in
                </Link>
              </p>
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
                "Strong passwords keep your account secure."
              </p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-gray-400">Password Security</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default ResetPassword
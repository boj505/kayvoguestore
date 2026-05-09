import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ContentCopy } from '@mui/icons-material'

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

/* ── Floating label field ── */
const Field = ({ label, type = 'text', value, onChange, autoComplete }) => {
  return (
    <div className="field-wrap mb-8">
      <input
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="field-input"
      />
      <span className="field-label">{label}</span>
      <div className="h-[1px] w-0 bg-[#111] transition-all duration-300 group-focus-within:w-full" />
    </div>
  )
}

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'security'
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [copied, setCopied] = useState(false)

  const navigate = useNavigate()

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy password:', err)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      triggerShake()
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      triggerShake()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        // For demo purposes, we'll use a simple security question
        setSecurityQuestion("What is your favorite color?")
        setStep('security')
        setSuccess('Email verified. Please answer the security question.')
      } else {
        setError(data.message || 'An error occurred. Please try again.')
        triggerShake()
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!securityAnswer.trim()) {
      setError('Please answer the security question.')
      triggerShake()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-security-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          securityQuestion, 
          securityAnswer 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setNewPassword(data.newPassword)
        setSuccess(`Password reset successful! Your new password is: ${data.newPassword}`)
        
        // Update localStorage with the new password hash
        const { findUserByEmail, getSavedUsers, saveUsers, normalizeEmail } = await import('../utils/authHelpers')
        
        const user = findUserByEmail(normalizeEmail(email))
        if (user) {
          const updatedUser = { ...user, passwordHash: data.passwordHash }
          
          const allUsers = getSavedUsers()
          const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u)
          saveUsers(updatedUsers)
        }

        setTimeout(() => navigate('/login'), 5000)
      } else {
        setError(data.message || 'Security answer verification failed.')
        triggerShake()
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
      triggerShake()
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
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-400 mb-3">Reset password</p>
              <h1
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold leading-tight text-[#111]"
              >
                Forgot your password?
              </h1>
              <p className="mt-3 text-xs text-gray-400 leading-6">
                {step === 'email' 
                  ? 'Enter your email address to start the password reset process.'
                  : 'Answer the security question to reset your password.'
                }
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
                <p className="text-xs text-green-600 mb-2">{success}</p>
                {newPassword && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded border">
                    <code className="text-sm font-mono text-[#111] flex-1">{newPassword}</code>
                    <button
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy password"
                    >
                      <ContentCopy style={{ fontSize: 16, color: copied ? '#10b981' : '#6b7280' }} />
                    </button>
                    {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={step === 'email' ? handleEmailSubmit : handleSecuritySubmit} noValidate>
              {step === 'email' ? (
                <div className="anim-fade-up delay-2">
                  <Field label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
              ) : (
                <div className="anim-fade-up delay-2">
                  <div className="mb-6">
                    <p className="text-xs text-gray-600 mb-2">Security Question:</p>
                    <p className="text-sm font-medium text-[#111] mb-4">{securityQuestion}</p>
                  </div>
                  <Field 
                    label="Your Answer" 
                    type="text" 
                    value={securityAnswer} 
                    onChange={e => setSecurityAnswer(e.target.value)} 
                    autoComplete="off" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setStep('email')} 
                    className="text-xs text-gray-400 hover:text-[#111] mt-2 underline"
                  >
                    ← Back to email
                  </button>
                </div>
              )}

              <div className="anim-fade-up delay-3">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading 
                    ? (step === 'email' ? 'Verifying…' : 'Resetting…') 
                    : (step === 'email' ? 'Continue' : 'Reset Password')
                  }
                </button>
              </div>
            </form>

            {/* Back to login */}
            <div className="anim-fade-up delay-4 mt-8 text-center">
              <p className="text-xs text-gray-400">
                Remember your password?{' '}
                <Link to="/login" className="text-[#111] underline underline-offset-2 hover:no-underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust signals */}
            <div className="anim-fade-up delay-5 mt-10 pt-8 border-t border-black/[0.07]">
              <div className="flex items-center gap-6">
                {['Secure reset', 'Encrypted email', 'No spam'].map((t) => (
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
                "Your security is our priority."
              </p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.4em] text-gray-400">Password Reset</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default ForgotPassword
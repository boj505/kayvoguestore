import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MyOrders from './MyOrders'

/* ─────────────────────────── CSS ─────────────────────────── */

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-fade-up { animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.15) both; }
  .delay-1 { animation-delay: .08s; }
  .delay-2 { animation-delay: .18s; }
  .delay-3 { animation-delay: .28s; }
  .sidebar-link { transition: color .15s ease; }
  .sidebar-link:hover { color: #111; }
  .logout-btn { transition: background .2s ease, color .2s ease; }
  .logout-btn:hover { background: #333; }
  .logout-btn:active { transform: scale(.98); }
`

/* ─────────────────────────── Icons ─────────────────────────── */

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-5 h-5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
    <rect x="3" y="5" width="18" height="16" rx="1" />
    <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
    <rect x="2" y="5" width="20" height="14" rx="1" />
    <path d="M2 5l10 9 10-9" strokeLinecap="round" />
  </svg>
)

/* ─────────────────────────── Profile ─────────────────────────── */

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const firstName  = user?.firstName  || user?.first_name  || user?.name?.split(' ')[0] || 'Guest'
  const lastName   = user?.lastName   || user?.last_name   || ''
  const fullName   = [firstName, lastName].filter(Boolean).join(' ')
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <>
      <style>{css}</style>
      <div
        className="min-h-screen bg-[#f9f8f6] pt-20"
        style={{ fontFamily: 'Clash Display, sans-serif' }}
      >

        {/* ── Top accent bar ── */}
        <div className="h-[3px] w-full bg-[#111]" />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

            {/* ──────── Sidebar ──────── */}
            <aside className="anim-fade-up delay-1 lg:sticky lg:top-8 space-y-4">

              {/* Identity card */}
              <div className="bg-[#111] text-white px-6 py-8">
                {/* Avatar monogram */}
                <div className="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <span
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    className="text-2xl font-semibold text-white leading-none"
                  >
                    {firstName[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                <p className="text-[9px] uppercase tracking-[0.5em] text-white/40 mb-2">Account</p>
                <h2
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  className="text-3xl sm:text-4xl font-semibold leading-tight text-white"
                >
                  {fullName}
                </h2>

                {/* Meta rows */}
                <div className="mt-6 space-y-3">
                  {user?.email && (
                    <div className="flex items-center gap-2.5 text-white/55">
                      <MailIcon />
                      <span className="text-xs truncate">{user.email}</span>
                    </div>
                  )}
                  {memberSince && (
                    <div className="flex items-center gap-2.5 text-white/55">
                      <CalendarIcon />
                      <span className="text-xs">Member since {memberSince}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info tiles */}
              <div className="grid grid-cols-2 gap-px bg-black/[0.07] border border-black/[0.07]">
                {[
                  { label: 'First name', value: firstName },
                  { label: 'Last name',  value: lastName || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white px-4 py-4">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-medium text-[#111] truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="logout-btn w-full bg-[#111] text-white text-[10px] uppercase tracking-[0.4em] py-4 hover:bg-[#333]"
              >
                Sign out
              </button>

              {/* Help link */}
              <div className="bg-white border border-black/[0.07] px-5 py-5 text-center">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mb-2">Need help?</p>
                <a
                  href="mailto:support@yourbrand.com"
                  className="text-xs text-[#111] underline underline-offset-2 hover:no-underline transition-all"
                >
                  Contact support
                </a>
              </div>
            </aside>

            {/* ──────── Main content ──────── */}
            <main className="anim-fade-up delay-2 min-w-0">
              <MyOrders />
            </main>

          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
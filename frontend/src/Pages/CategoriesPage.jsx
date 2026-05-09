import React from 'react'
import { Link } from 'react-router-dom'
import Categories from '../Components/Categories'
import { ArrowBackOutlined } from '@mui/icons-material'

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#9a9590] mb-5">All categories</p>
            <h1 className="text-[clamp(3rem,9vw,6rem)] font-light leading-[0.9] tracking-[-0.02em] text-[#111]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Explore every category
            </h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#111] hover:text-[#888] transition-colors">
            <ArrowBackOutlined style={{ fontSize: 14 }} />
            Back to Home
          </Link>
        </div>

        <Categories />
      </div>
    </main>
  )
}

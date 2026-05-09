import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import black from '../../src/assets/newblack.jpg'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material'

const slides = [
  {
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070',
    tag: 'New Season',
    title: 'Elevated',
    accent: 'Wardrobe',
    desc: 'Premium thrift pieces curated for modern style, confidence and individuality.',
    cta: 'Shop Collection',
    alt: 'Premium fashion collection',
  },
  {
    img: black,
    tag: 'Limited Drop',
    title: 'Refined',
    accent: 'Essentials',
    desc: 'Distinct everyday staples selected for quality, comfort and timeless appeal.',
    cta: 'Explore Now',
    alt: 'Premium essentials',
  },
  {
    img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2071',
    tag: 'Exclusive Edit',
    title: 'Rare',
    accent: 'Finds',
    desc: 'Statement pieces sourced in limited quantities for those who move differently.',
    cta: 'Discover More',
    alt: 'Rare fashion finds',
  },
]

const AUTO_DURATION = 6500

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  const rafRef = useRef(null)
  const startRef = useRef(null)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
    setProgress(0)
    startRef.current = null
  }, [])

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
    startRef.current = null
  }

  const goTo = (index) => {
    setCurrent(index)
    setProgress(0)
    startRef.current = null
  }

  useEffect(() => {
    const animate = (time) => {
      if (!startRef.current) startRef.current = time

      const elapsed = time - startRef.current
      const pct = Math.min((elapsed / AUTO_DURATION) * 100, 100)

      setProgress(pct)

      if (pct >= 100) {
        nextSlide()
      } else {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [current, nextSlide])

  const slide = slides[current]

  return (
    <section className="relative lg:pt-25 h-[80vh] min-h-[620px] w-full overflow-hidden bg-black text-white sm:h-screen">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          <img
            src={slide.img}
            alt={slide.alt}
            className="h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-end px-5 pb-24 sm:px-6 md:items-center md:pb-0 lg:px-10">
        <div className="max-w-xl sm:max-w-2xl">
          {/* Tag */}
          <motion.span
            key={`tag-${current}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-white/80 backdrop-blur-md sm:text-[11px]"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {slide.tag}
          </motion.span>

          {/* Heading */}
          <motion.div
            key={`title-${current}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-4 sm:mt-5"
          >
            <h1 className="leading-[0.9]">
              <span
                className="block text-[2.7rem] sm:text-6xl lg:text-8xl"
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontWeight: 600,
                }}
              >
                {slide.title}
              </span>

              <span
                className="block text-[2.7rem] italic text-[#efe5d2] sm:text-6xl lg:text-8xl"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 600,
                }}
              >
                {slide.accent}
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            key={`desc-${current}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:mt-5 sm:text-base"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {slide.desc}
          </motion.p>

          {/* CTA */}
          <motion.div
            key={`cta-${current}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-6 sm:mt-8"
          >
            <a
              href="/shop"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-black transition duration-300 hover:bg-[#e9dfcb] sm:px-7"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              {slide.cta}
              <ArrowRight style={{ fontSize: 16 }} />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-5 left-0 right-0 z-30 px-5 sm:bottom-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Progress */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className="text-xs text-white/80 sm:text-sm"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              {String(current + 1).padStart(2, '0')}
            </span>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                    current === index
                      ? 'w-8 sm:w-10 bg-white/20'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                >
                  {current === index && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              <ChevronLeft style={{ fontSize: 18 }} />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              <ChevronRight style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
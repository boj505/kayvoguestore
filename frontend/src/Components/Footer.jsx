import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, FacebookOutlined } from '@mui/icons-material'

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 ">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-5 lg:px-20 py-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-[cormorant_garamond] text-2xl tracking-wide">
              Stay Updated
            </h3>

            <p className="font-[clash_display] text-sm text-gray-500 leading-relaxed">
              Get exclusive drops, discounts, and early access to new thrift pieces.
            </p>

            <form className="flex w-full mt-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm font-[clash_display] border border-gray-200 focus:outline-none focus:border-black transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-sm font-[clash_display] hover:bg-gray-900 transition"
              >
                Join
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-[clash_display] uppercase text-sm tracking-widest text-gray-700">
              Quick Links
            </h4>

            <div className="flex flex-col space-y-2 text-sm text-gray-500 font-[clash_display]">
              <Link to="/" className="hover:text-black transition">Home</Link>
              <Link to="/about" className="hover:text-black transition">About</Link>
              <Link to="/login" className="hover:text-black transition">Login</Link>
              <Link to="/register" className="hover:text-black transition">Register</Link>
              <Link to="/faq" className="hover:text-black transition">FAQs</Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-[clash_display] uppercase text-sm tracking-widest text-gray-700">
              Categories
            </h4>

            <div className="flex flex-col space-y-2 text-sm text-gray-500 font-[clash_display]">
              <Link to="#">Hoodies</Link>
              <Link to="#">Sweatshirts</Link>
              <Link to="#">Cargo Pants</Link>
              <Link to="#">Joggers</Link>
              <Link to="#">Bags</Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-[clash_display] uppercase text-sm tracking-widest text-gray-700">
              Connect
            </h4>

            <div className="flex items-center space-x-4">
              <a href="#" className="group">
                <Instagram className="text-gray-500 group-hover:text-black transition" />
              </a>
              <a href="#" className="group">
                <FacebookOutlined className="text-gray-500 group-hover:text-black transition" />
              </a>
            </div>

            <p className="text-xs text-gray-400 font-[clash_display]">
              Follow us for style inspiration and new arrivals.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400 font-[clash_display] tracking-wide">
          © {new Date().getFullYear()} KayVogue. All rights reserved.
        </p>
      </div>

    </footer>
  )
}

export default Footer
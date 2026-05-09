import React from 'react'
import {
  AddShoppingCartOutlined,
  SupportAgent,
  MonetizationOnOutlined,
  LocalShippingOutlined
} from '@mui/icons-material'

const features = [
  {
    icon: <LocalShippingOutlined />,
    title: 'Fast Delivery',
    desc: 'Swift and reliable delivery across Nigeria.'
  },
  {
    icon: <SupportAgent />,
    title: 'Customer Support',
    desc: 'Quick responses and seamless order assistance.'
  },
  {
    icon: <MonetizationOnOutlined />,
    title: '30 Days Guarantee',
    desc: 'Easy returns within 30 days of purchase.'
  },
  {
    icon: <AddShoppingCartOutlined />,
    title: 'Exclusive Rewards',
    desc: 'Enjoy free items on orders above ₦50,000.'
  }
]

const Features = () => {
  return (
    <section className="w-full px-5 md:px-10 lg:px-20 py-16 md:py-24">
      
      {/* Heading */}
      <div className="text-center max-w-xl mx-auto mb-12">
         <h2
              className="text-[#0a0a0a] leading-none"
              style={{
                fontFamily:  '"Cormorant Garamond", serif',
                fontStyle:   'italic',
                fontWeight:  300,
                fontSize:    'clamp(1.9rem, 4vw, 3.2rem)',
                letterSpacing: '-0.01em',
              }}
            >
              Why Shop with Us?
            </h2>
        <p className="font-[clash_display] text-sm text-gray-500 mt-3">
          A seamless thrift shopping experience tailored for style, speed, and trust.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 max-w-6xl mx-auto">
        
        {features.map((item, index) => (
          <div
            key={index}
            className="group rounded-2xl p-5 md:p-6 bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            
            {/* Icon */}
            <div className="mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white text-lg group-hover:scale-105 transition">
                {item.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-[clash_display] text-sm md:text-base tracking-wide text-gray-800 mb-1">
              {item.title}
            </h3>

            {/* Description */}
            <p className="font-[clash_display] text-xs text-gray-500 leading-relaxed">
              {item.desc}
            </p>

          </div>
        ))}

      </div>
    </section>
  )
}

export default Features
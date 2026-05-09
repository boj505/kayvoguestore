import React, { useMemo, useState } from 'react'
import { ShoppingBagOutlined } from '@mui/icons-material'
import { Link } from 'react-router-dom'

const ProductDetails = () => {
  const productdata=[
    {
      id:1,
      title:'Men Hoodie',  
      images:['../../src/assets/hd2.jpg',
      '../../src/assets/hd5.jpg'],
      price:'12000',
    },
    {
      id:2,
      title:'Sweatshirt',  
      images:['../../src/assets/sw1.jpg',
      '../../src/assets/sw2.jpg'],
      price:'10000',
    },
    {
      id:3,
      title:'Men Sweatshirt',  
      images:['../../src/assets/show1.jpg',
      '../../src/assets/show2.jpg'],
      price:'15000',
    },
    {
      id:4,
      title:'Ladies Sweatshirt',  
      images:['../../src/assets/sw8.jpg',
      '../../src/assets/sw9.jpg'],
      price:'12000',
    },
    {
      id:5,
      title:'Men Sweatshirt',  
      images:['../../src/assets/sw5.jpg',
      '../../src/assets/sw6.jpg'],
      price:'12000',
    },
    {
      id:6,
      title:'Ladies Sweatshirt',  
      images:['../../src/assets/sw7.jpg',
      '../../src/assets/sw10.jpg'],
      price:'12000',
    },
    {
      id:7,
      title:'Men Hoodie',  
      images:['../../src/assets/hd9.jpg',
      '../../src/assets/hd10.jpg'],
      price:'12000',
    },
    {
      id:8,
      title:'Couple Sweatshirt',  
      images:['../../src/assets/cp8.jpg',
      '../../src/assets/cp8.jpg'],
      price:'12000',
    }
    
  ]


  const [visibleCount, setVisibleCount] = useState(12)
  const visibleProducts = useMemo(
    () => productdata.slice(0, visibleCount),
    [productdata, visibleCount]
  )
  const hasMore = productdata.length > visibleCount

  return (
    <div>
      <div className='w-full animated-slides relative gap-2 md:gap-5 py-5 px-2 grid md:grid-cols-4 grid-cols-2'>
        {
          visibleProducts.map((item, index)=>(
          <div key={index} className=''>
            <Link to={`/product/${item.id}`}>
            <div className='flex flex-col space-y-2 cursor-pointer group mb-10'>
              <div className='md:w-[300px] md:h-[350px] w-[150px] h-[200px]  relative border border-gray-500 '>
                <img src={item.images[0]} className='w-full h-full object-cover object-top absolute inset-0 opacity-100 transition-opacity duration-300  group-hover:opacity-0' alt="" />
                <img src={item.images[1]} className='w-full h-full object-cover object-top absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' alt="" />
                
              </div>
              <div className='flex items-center justify-between w-full relative'>
              <div className='flex flex-col space-y-1'>
                  <h3 className='text-gray-700 font-[cormorant_garamond] text-[14px] md:text-[18px] font-medium'>{item.title}</h3>
                  <h3 className='font-[clash_display] text-gray-900 md:text-sm text-xs'><span className='font-[clash_display] text-gray-800'>&#8358;</span>{item.price}</h3>
                </div>
                  <ShoppingBagOutlined  className='absolute  bottom-0 md:right-7 right-4 scale-80 md:scale-100 text-gray-400 hover:scale-105 transition-hover duration-300 cursor-pointer'/>
                  </div>
            </div>
            </Link>
          </div>
        ))
      }
      </div>
      {hasMore && (
        <div className='mt-6 flex justify-center'>
          <button
            onClick={() => setVisibleCount(productdata.length)}
            className='rounded-full border border-black px-6 py-3 text-sm uppercase tracking-[0.25em] font-[clash_display] text-black transition hover:bg-black hover:text-white'
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
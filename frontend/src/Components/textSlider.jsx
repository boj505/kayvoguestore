import Marquee from "react-fast-marquee";
import React from 'react'
import {LocalShippingOutlined, ThumbUpOutlined, HighQualityOutlined, LockOutlined} from '@mui/icons-material'

const textSlider = () => {
  return (
    <div className="mt-10">
        <Marquee gradient={false} speed={50} className="bg-black text-white md:py-10 py-5 font-[clash_display] text-sm md:text-xl">
            <div className="flex items-center space-x-2 font-bold"><span><LocalShippingOutlined/></span><span className="mr-20 ">FREE SHIPPING</span></div> <div className="mr-20 h-5 w-5 rounded-full bg-white"></div>
            <div className="flex items-center space-x-2 font-bold"><span><ThumbUpOutlined/></span><span className="mr-20 ">100% SATISFACTION GUARANTEED</span></div><div className="mr-20 h-5 w-5 rounded-full bg-white"></div>
            <div className="flex items-center space-x-2 font-bold"><span><HighQualityOutlined/></span><span className="mr-20 ">DURABLE AND AFFORDABLE</span></div><div className="mr-20 h-5 w-5 rounded-full bg-white"></div>
            <div className="flex items-center space-x-2 font-bold"><span><LockOutlined/></span><span className="mr-20 ">SECURE PAYMENT</span></div><div className="mr-20 h-5 w-5 rounded-full bg-white"></div>

           
        </Marquee>
    </div>
  )
}

export default textSlider
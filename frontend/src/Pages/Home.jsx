import React from 'react'
import Hero from '../Components/Hero'
import Categories from '../Components/Categories'
import ProductCarousel from '../Components/ProductCarousel'
import BestSeller from '../Components/BestSeller'
import NewArrivals from '../Components/NewArrivals'
import Features from '../Components/Features'
import Collections from '../Components/Collections'
import ScrollPopup from '../Components/ScrollPopup'
import textSlider from '../Components/textSlider';




const Home = () => {
    
 

 
 


  return (
    <div className='pb-20 md:pb-0'>
        
        <Hero/>
        
      
          
          
        <Categories maxItems={5} showViewAll viewAllPath='/categories' />
        <NewArrivals />
        
          
           <div className='flex flex-col container mx-auto justify-center'>
            <BestSeller/>
           </div>
         
         {textSlider()}
          <Collections/>
           
          <ScrollPopup/>

        

         <div className='mt-0  h-full   '>

           <ProductCarousel />
          </div>
         
          
          <div className='container mx-auto w-full mt-20'>
        
          
          <Features/>
         </div>
         
        
    </div>
  )
}

export default Home
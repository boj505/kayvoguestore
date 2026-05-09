import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const FilterSideBar = () => {
  const [searchParams, setSearchParams]=useSearchParams()
 const navigate = useNavigate()
  const [filters, setFilters]=useState({
    category:'',
    color:'',
    gender:'',
    size:[],
    brand:[],
    minPrice:0,
    maxPrice:8000,
  })

  const [priceRange, setPriceRange]= useState([0, 8000]);
   const categories=['Hoodies', 'Sweatshirts', 'Joggers', 'Shorts', 'Cargo Pants', 'Roundnecks','Collarnecks', 'Jerseys', 'Bags'];
   const genders= ['Men', 'Women'];
   const colors=["Red", "Blue", "Black", "White", "Grey", "Green", "Orange" , "Brown"]
   const sizes=['M', 'L', 'XL','XXL'];
   const brands=['Nike', 'Puma', 'Addidas'];
   const minPrice=0;
   const maxPrice=8000;

   useEffect(()=>{
    const params= Object.fromEntries([...searchParams])
    setFilters({
      
       category: params.category || '',
       color:params.color || '',
       gender:params.gender || '',
       size:params.size?params.size.split(' , ') : [],
       brand:params.brand?params.brand.split(' , ') :[],
    });setPriceRange([0, params.maxPrice || 8000])

   }, [searchParams])

   const handleFilterChange=(e)=>{
   const {name, value, checked, type} = e.target;
   let newFilters = {...filters};
   if(type==="checkbox"){
    if(checked){
      newFilters[name]= [...(newFilters[name] || []), value];
    }else {
      newFilters[name] = newFilters[name].filter((item)=> item !== value);
    }
   }else {newFilters[name]= value};

   setFilters(newFilters);
   updateURLParams(newFilters)
   
   
   
    
    
   }

   const updateURLParams = (newFilters)=>{
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key)=>{
      if(Array.isArray(newFilters[key]) && newFilters[key].length>0){
        params.append(key, newFilters[key].join(" , "))
      }else if (newFilters[key]){
        params.append(key, newFilters[key])
      }
    })
    setSearchParams(params);
    navigate(`?${params.toString()}`)

   }

   const handlePriceChange=(e)=>{
    const value = e.target.value;
    setPriceRange([0, value]);
    const newFilters= {...filters, maxPrice:value}
    setFilters({...filters, maxPrice: value});
    updateURLParams(newFilters)
    
   }
   

  
 

  
   
  return (
    <div className='font-[clash_display]'>
      <h3 className='block text-gray-500 font-medium mb-9 text-2xl '>Filters</h3>
      <div className='mb-5'>
        <label className='text-gray-600 font-medium mb-5 '>Category</label>
        {categories.map((category)=>(
          <div key={category} className='flex items-center mt-2'>
            <input type="radio" name='category' value={category} 
              onChange={handleFilterChange} 
              checked={filters.category===category}
               className='h-4 w-4 cursor-pointer mr-2' />
            <span className='text-gray-600 text-sm'>{category}</span>
          </div>
          
        ))}
      </div>
      <div>
        <label className='text-gray-600 font-medium mb-5 '>Gender</label>
        {genders.map((gender)=>(
          <div key={gender} className='flex items-center'>
            <input type="radio" name='gender' value={gender}
             checked={filters.gender===gender}
             onChange={handleFilterChange} className='h-4 w-4 cursor-pointer mr-2' />
            <span className='text-gray-600 text-sm'>{gender}</span>
          </div>
          
        ))}
      </div>
      <div className='mt-4'>
        <label className='text-gray-600 font-medium mb-5'>Colors</label>
        <div className='flex items-center flex-wrap gap-2 mt-2' >
         {colors.map((color)=>(
           <button key={color} style={{backgroundColor:color.toLowerCase()}}  onClick={() => {
      const newFilters = { ...filters, color };
      setFilters(newFilters);
      updateURLParams(newFilters);
    }} name='color' value={color} title={color} className={`h-8 w-8 rounded-full cursor-pointer border focus:ring  border-gray-300 ${filters.color===color?'ring ring-blue-600':''} `}></button>
         ))}
        </div>
      </div>

      <div className='mt-5'>
        <label className='text-gray-600 font-medium mb-5'>Size</label>
        <div>
          {
            sizes.map((size)=>(
              <div key={size}>
                <input type="checkbox" name='size' value={size} onChange={handleFilterChange} className='w-3 h-3 border mr-2  border-gray-300 cursor-pointer ' />
                <span className='text-xs'>{size}</span>
              </div>
            ))
          }
        </div>
      </div>
      <div className='mt-5'>
        <label className='text-gray-600 font-medium mb-5'>Brand</label>
        <div>
          {
            brands.map((brand)=>(
              <div key={brand}>
                <input type="checkbox" name='brand' value={brand} onChange={handleFilterChange} className='w-3 h-3 border mr-2  border-gray-300 cursor-pointer ' />
                <span className='text-xs'>{brand}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div className='mt-5 mb-8'>
        <input type="range" name='price'  min={0} max={8000} value={priceRange[1]} onChange={handlePriceChange}   className='w-full h-2 bg-gray-300'  />
        <div className='flex justify-between items-center text-xs text-gray-700'>
          <span>&#8358;0</span>
          <span>&#8358;{priceRange[1]}</span>
        </div>
      </div>
    </div>
  )
}

export default FilterSideBar
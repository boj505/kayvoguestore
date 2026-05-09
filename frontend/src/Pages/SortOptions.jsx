import React from 'react'
import { useSearchParams } from 'react-router-dom'

const SortOptions = () => {
  const [searchParams, setSearchParams]=useSearchParams()

  const handleSortChange = (e) => {
    const sortBy = e.target.value;
    // Implement sorting logic based on sortBy value
    console.log(`Sorting by: ${sortBy}`);
    // Update URL parameters if needed
    searchParams.set('sort', sortBy);
    setSearchParams(searchParams);

  }
  return (
    <div className='mt-4'>
      <select 
      onChange={handleSortChange}
      value={searchParams.get('sort') || 'newest'}
      className='border border-gray-300 text-gray-600 font-[clash_display] font-medium p-2 rounded-md mb-4 focus:outline-none focus:ring focus:ring-blue-400'>
        <option value="newest">Sort by Newest</option>
        <option value="priceIsLowToHigh">Sort by Price: Low to High</option>
        <option value="priceIsHighToLow">Sort by Price: High to Low</option>
        <option value="popularity">Sort by Popularity</option>
      </select>
    </div>
  )
}

export default SortOptions
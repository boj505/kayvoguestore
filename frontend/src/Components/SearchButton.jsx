import React, { useState } from 'react'
import { SearchOutlined, CloseOutlined } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const SearchButton = ({ iconColor = 'text-white/90' }) => {
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const handleSearch = () => {
        setSearchOpen(!searchOpen)
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        setSearchTerm(e.target.value)
        e.reset()
    }

    const slideVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 80, mass:10 } },
        exit: { y: -100, opacity: 0, transition: { duration: 0.2 } }
    }

    return (
        <div  >
            <AnimatePresence>
                {searchOpen ? (
                    <motion.form
                        className='w-full absolute top-0 left-0 right-0 bottom-0 z-100 bg-white/15 backdrop-blur-lg '
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={slideVariants}
                    >
                        <div className='w-full md:w-1/2 relative bg-transparent ml-auto mr-auto z-50 translate-y-10 flex items-center justify-between py-2 px-6'>
                            <input
                                type="text"
                                placeholder='e.g hoodie, sweatshirt, joggers'
                                value={searchTerm}
                                onChange={handleFormSubmit}
                                className='w-full h-10 bg-stone-900 rounded-lg relative focus:outline-none focus:text-white font-[clash_display] py-2 px-6 placeholder:text-white/80'
                            />
                            <SearchOutlined className='absolute h-6 w-6 text-black/90 top-4 right-8' />
                        </div>
                        <CloseOutlined onClick={handleSearch} className='absolute top-4 right-7 h-6 w-6 text-black cursor-pointer' />
                    </motion.form>
                ) : (
                    <button onClick={handleSearch}>
                        <SearchOutlined className={`h-6 w-6 rounded-full bg-transparent cursor-pointer ${iconColor}`} />
                    </button>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SearchButton
import React, { useState } from 'react'
import { StarRounded, CloseOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const { user, isLoggedIn } = useAuth()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState(user?.first_name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      alert('Please log in to write a review')
      return
    }

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const newReview = {
        id: Date.now(),
        author: authorName || 'Anonymous',
        rating,
        date: 'just now',
        title,
        content,
        verified: true,
        helpful: 0,
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      
      onSubmit(newReview)
      
      // Reset form
      setTitle('')
      setContent('')
      setRating(5)
      setAuthorName(user?.first_name || '')
      
      onClose()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (!isLoggedIn) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseOutlined style={{ fontSize: 20 }} />
            </button>
            
            <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">You must be logged in to write a review.</p>
            
            <a 
              href="/login" 
              className="block w-full bg-black text-white text-center py-3 rounded font-medium hover:bg-gray-800 transition-colors mb-3"
            >
              Sign In
            </a>
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Share your experience</p>
              <h2 className="text-2xl sm:text-3xl font-semibold">How was your experience with KayVogue?</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <CloseOutlined style={{ fontSize: 20 }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <StarRounded
                      style={{ fontSize: 40 }}
                      className={
                        star <= (hoverRating || rating)
                          ? 'text-black'
                          : 'text-gray-200'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your detailed experience..."
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{content.length}/1000</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ReviewModal

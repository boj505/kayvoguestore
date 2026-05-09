import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  StarRounded,
  ArrowBackOutlined,
  ThumbUpOutlined,
  CheckCircleOutline,
  KeyboardArrowDownOutlined
} from '@mui/icons-material';
import ReviewModal from '../Components/ReviewModal';

const Reviews = () => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Sarah M.',
      rating: 5,
      date: '2 days ago',
      title: 'Absolutely Love It!',
      content:
        "The quality is incredible and the fit is perfect. I've ordered 3 times already and never disappointed.",
      verified: true,
      helpful: 234,
    },
    {
      id: 2,
      author: 'Jessica K.',
      rating: 5,
      date: '1 week ago',
      title: 'Best Purchase Ever',
      content:
        'Fast shipping, beautiful packaging, and the clothes are exactly as described. Highly recommend!',
      verified: true,
      helpful: 189,
    },
    {
      id: 3,
      author: 'Emma L.',
      rating: 4,
      date: '2 weeks ago',
      title: 'Great Quality',
      content:
        'Love the style and material. Sizing ran a bit small, but customer service was very helpful.',
      verified: true,
      helpful: 145,
    },
    {
      id: 4,
      author: 'Maya P.',
      rating: 5,
      date: '3 weeks ago',
      title: 'Perfect for the Season',
      content:
        'Found exactly what I was looking for. The collection is curated beautifully.',
      verified: true,
      helpful: 267,
    },
    {
      id: 5,
      author: 'Nicole R.',
      rating: 4,
      date: '1 month ago',
      title: 'Very Happy',
      content:
        'Great selection and reasonable prices. Will definitely shop here again.',
      verified: true,
      helpful: 98,
    },
    {
      id: 6,
      author: 'Rachel T.',
      rating: 5,
      date: '1 month ago',
      title: 'Exceptional Service',
      content:
        'Customer service went above and beyond to help me find the right size. Top-notch experience!',
      verified: true,
      helpful: 312,
    },
  ]);

  const allReviews = reviews;

  const handleNewReview = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  const totalReviews = allReviews.length;
  const avgRating = (
    allReviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
  ).toFixed(1);

  const ratingDistribution = {
    5: allReviews.filter((r) => r.rating === 5).length,
    4: allReviews.filter((r) => r.rating === 4).length,
    3: allReviews.filter((r) => r.rating === 3).length,
    2: allReviews.filter((r) => r.rating === 2).length,
    1: allReviews.filter((r) => r.rating === 1).length,
  };

  const filteredReviews = useMemo(() => {
    let data = [...allReviews];

    if (filterRating !== 'all') {
      const min = parseInt(filterRating);
      data = data.filter((r) => r.rating === min); // Changed to exact match for standard e-com filtering
    }

    switch (sortBy) {
      case 'helpful':
        data.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating-high':
        data.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        data.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break; // Assuming 'recent' relies on default array order or a date sort
    }

    return data;
  }, [sortBy, filterRating]);

  const Stars = ({ rating, size = 18 }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarRounded
          key={i}
          style={{ fontSize: size }}
          className={i < rating ? 'text-black' : 'text-gray-200'}
        />
      ))}
    </div>
  );

  const RatingBar = ({ star, count }) => {
    const width = (count / totalReviews) * 100;

    return (
      <div className="flex items-center gap-4 text-sm group cursor-pointer" onClick={() => setFilterRating(star.toString())}>
        <span className="w-12 text-gray-600 underline-offset-4 group-hover:underline">{star} Stars</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-sm overflow-hidden">
          <div
            className="h-full bg-black rounded-sm transition-all duration-500"
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="w-8 text-right text-gray-500">{count}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans antialiased">
      {/* HEADER */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Customer Reviews
          </h1>
          <Link
            to="/"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            <ArrowBackOutlined style={{ fontSize: 18 }} />
            <span className="hidden sm:inline">Back to Product</span>
          </Link>
        </div>
      </header>

      {/* SUMMARY DASHBOARD */}
      <section className="bg-gray-50/50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left: Overall Score */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="text-6xl font-bold tracking-tighter mb-2">
                {avgRating}
              </div>
              <div className="mb-2">
                <Stars rating={Math.round(avgRating)} size={24} />
              </div>
              <p className="text-sm text-gray-500">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Middle: Rating Breakdown */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={ratingDistribution[star]}
                />
              ))}
            </div>

            {/* Right: Call to Action */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-end">
              <h3 className="text-lg font-medium mb-2">Share your thoughts</h3>
              <p className="text-sm text-gray-500 mb-6 text-center lg:text-right">
                If you've used this product, we'd love to hear about your experience.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                Write a Review
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* REVIEWS LIST SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Controls: Filter & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterRating === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(star.toString())}
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors ${
                  filterRating === star.toString()
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {star} <StarRounded style={{ fontSize: 16 }} className={filterRating === star.toString() ? 'text-white' : 'text-gray-500'} />
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full sm:w-auto bg-transparent border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-none cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating-high">Highest to Lowest</option>
              <option value="rating-low">Lowest to Highest</option>
            </select>
            <KeyboardArrowDownOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" style={{ fontSize: 20 }} />
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-8">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <article key={review.id} className="pb-8 border-b border-gray-100 last:border-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                  
                  {/* Review Meta (Left on desktop) */}
                  <div className="md:col-span-3 flex flex-col space-y-1">
                    <span className="font-semibold text-base">{review.author}</span>
                    {review.verified && (
                      <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircleOutline style={{ fontSize: 14 }} />
                        <span>Verified Buyer</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 pt-1">{review.date}</span>
                  </div>

                  {/* Review Content (Right on desktop) */}
                  <div className="md:col-span-9">
                    <div className="mb-3">
                      <Stars rating={review.rating} size={16} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {review.content}
                    </p>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors font-medium">
                      <ThumbUpOutlined style={{ fontSize: 16 }} />
                      Helpful ({review.helpful})
                    </button>
                  </div>

                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No reviews found for this rating.
            </div>
          )}
        </div>

        {/* Load More CTA */}
        {filteredReviews.length > 0 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 border-2 border-black text-black font-medium text-sm hover:bg-black hover:text-white transition-colors">
              Load More Reviews
            </button>
          </div>
        )}
      </section>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewReview}
      />
    </main>
  );
};

export default Reviews;
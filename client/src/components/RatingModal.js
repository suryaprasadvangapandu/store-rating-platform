import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const RatingModal = ({ store, onClose, onRatingSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [existingRating, setExistingRating] = useState(null);

    useEffect(() => {
        if (store.user_rating) {
            setRating(store.user_rating);
            setExistingRating(store.user_rating);
        }
    }, [store]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setLoading(true);
            await axios.post('/api/ratings', {
                store_id: store.id,
                rating: rating
            });

            toast.success(existingRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
            onRatingSubmitted();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit rating';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleStarClick = (starRating) => {
        setRating(starRating);
    };

    const handleStarHover = (starRating) => {
        setHoveredRating(starRating);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    const renderStars = () => {
        const stars = [];
        const displayRating = hoveredRating || rating;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => handleStarHover(i)}
                    onMouseLeave={handleStarLeave}
                    className={`w-8 h-8 transition-colors duration-200 ${i <= displayRating
                            ? 'text-yellow-400 hover:text-yellow-500'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                >
                    <Star className="w-full h-full fill-current" />
                </button>
            );
        }

        return stars;
    };

    const getRatingText = (rating) => {
        switch (rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select a rating';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {existingRating ? 'Update Rating' : 'Rate Store'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{store.name}</h4>
                        <p className="text-sm text-gray-600">{store.address}</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Your Rating
                        </label>
                        <div className="flex items-center space-x-1 mb-2">
                            {renderStars()}
                        </div>
                        <p className="text-sm text-gray-600">
                            {getRatingText(hoveredRating || rating)}
                        </p>
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                existingRating ? 'Update Rating' : 'Submit Rating'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;

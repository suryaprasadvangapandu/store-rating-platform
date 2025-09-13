import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Store, Star, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const StoreModal = ({ store, mode, onClose, onStoreSaved }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        owner_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [storeDetails, setStoreDetails] = useState(null);
    const [owners, setOwners] = useState([]);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [userRating, setUserRating] = useState(null);

    useEffect(() => {
        if (store && mode === 'view') {
            fetchStoreDetails();
        } else if (store && mode === 'edit') {
            setFormData({
                name: store.name || '',
                email: store.email || '',
                address: store.address || '',
                owner_id: store.owner_id || ''
            });
        }

        if (mode === 'add' || mode === 'edit') {
            fetchStoreOwners();
        }
    }, [store, mode]);

    const fetchStoreDetails = async () => {
        try {
            setLoading(true);
            // For now, we'll use the store data directly since we don't have a specific endpoint
            setStoreDetails(store);

            // Fetch user's rating for this store
            try {
                const response = await axios.get(`/api/stores/${store.id}`);
                if (response.data.store.user_rating) {
                    setUserRating(response.data.store.user_rating);
                    setRating(response.data.store.user_rating);
                }
            } catch (error) {
                // User might not be logged in or no rating exists
                console.log('No user rating found');
            }
        } catch (error) {
            console.error('Error fetching store details:', error);
            toast.error('Failed to fetch store details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreOwners = async () => {
        try {
            const response = await axios.get('/api/admin/users?role=store_owner&limit=100');
            setOwners(response.data.users);
        } catch (error) {
            console.error('Error fetching store owners:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.address) {
            toast.error('All fields are required');
            return;
        }

        if (formData.address.length > 400) {
            toast.error('Address must not exceed 400 characters');
            return;
        }

        try {
            setLoading(true);

            // Prepare data for submission - convert empty owner_id to null
            const submitData = {
                ...formData,
                owner_id: formData.owner_id === '' ? null : formData.owner_id
            };

            if (mode === 'add') {
                await axios.post('/api/admin/stores', submitData);
                toast.success('Store created successfully!');
            } else if (mode === 'edit') {
                // For edit, we would need to implement an update endpoint
                toast.error('Edit functionality not implemented yet');
                return;
            }

            onStoreSaved();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save store';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setRatingLoading(true);
            await axios.post('/api/ratings', {
                store_id: store.id,
                rating: rating
            });

            toast.success(userRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
            setUserRating(rating);

            // Refresh store details to get updated average rating
            if (storeDetails) {
                const response = await axios.get('/api/admin/stores');
                const updatedStore = response.data.stores.find(s => s.id === store.id);
                if (updatedStore) {
                    setStoreDetails(updatedStore);
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit rating';
            toast.error(message);
        } finally {
            setRatingLoading(false);
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

    const renderRatingStars = () => {
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

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
                );
            } else {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-gray-300" />
                );
            }
        }

        return stars;
    };

    if (mode === 'view' && loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="large" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {mode === 'view' ? 'Store Details' : mode === 'add' ? 'Add New Store' : 'Edit Store'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {mode === 'view' && storeDetails ? (
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Store Info */}
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Store className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900">{storeDetails.name}</h4>
                                    <p className="text-gray-600">{storeDetails.email}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900">{storeDetails.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Average Rating</label>
                                    <div className="flex items-center">
                                        <div className="flex items-center">
                                            {renderStars(parseFloat(storeDetails.average_rating))}
                                        </div>
                                        <span className="ml-2 text-gray-900">
                                            {parseFloat(storeDetails.average_rating).toFixed(1)}/5.0
                                        </span>
                                        <span className="ml-1 text-sm text-gray-500">
                                            ({storeDetails.total_ratings} ratings)
                                        </span>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Address</label>
                                    <p className="text-gray-900">{storeDetails.address}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Created</label>
                                    <p className="text-gray-900">{new Date(storeDetails.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Total Ratings</label>
                                    <p className="text-gray-900">{storeDetails.total_ratings}</p>
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h5 className="text-lg font-medium text-gray-900 mb-4">Rate This Store</h5>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Your Rating
                                        </label>
                                        <div className="flex items-center space-x-1 mb-2">
                                            {renderRatingStars()}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {getRatingText(hoveredRating || rating)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={handleRatingSubmit}
                                            disabled={ratingLoading || rating === 0}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {ratingLoading ? (
                                                <LoadingSpinner size="small" />
                                            ) : (
                                                userRating ? 'Update Rating' : 'Submit Rating'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="form-label">
                                    Store Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter store name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="form-label">
                                    Store Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter store email"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="form-label">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="form-input resize-none"
                                    placeholder="Enter store address"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.address.length}/400 characters
                                </p>
                            </div>

                            <div>
                                <label htmlFor="owner_id" className="form-label">
                                    Store Owner (Optional)
                                </label>
                                <select
                                    id="owner_id"
                                    name="owner_id"
                                    value={formData.owner_id}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">No owner assigned</option>
                                    {owners.map((owner) => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name} ({owner.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select a store owner from existing users with store_owner role
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    mode === 'add' ? 'Create Store' : 'Update Store'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StoreModal;

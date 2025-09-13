import React, { useState, useEffect } from 'react';
import {
    Store,
    Star,
    Users,
    TrendingUp,
    Eye,
    Calendar,
    MapPin,
    X
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const StoreOwnerDashboard = () => {
    const [stores, setStores] = useState([]);
    const [recentRatings, setRecentRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);
    const [showRatings, setShowRatings] = useState(false);

    useEffect(() => {
        fetchStoreData();
    }, []);

    const fetchStoreData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/ratings/my-stores');
            setStores(response.data.stores);
        } catch (error) {
            console.error('Error fetching store data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreRatings = async (storeId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/ratings/store/${storeId}`);
            setRecentRatings(response.data.ratings);
            setShowRatings(true);
        } catch (error) {
            console.error('Error fetching store ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewRatings = (store) => {
        setSelectedStore(store);
        fetchStoreRatings(store.store_id);
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

    const getTotalStats = () => {
        const totalStores = stores.length;
        const totalRatings = stores.reduce((sum, store) => sum + store.total_ratings, 0);
        const averageRating = totalRatings > 0
            ? stores.reduce((sum, store) => sum + (store.average_rating * store.total_ratings), 0) / totalRatings
            : 0;

        return { totalStores, totalRatings, averageRating: averageRating.toFixed(1) };
    };

    const stats = getTotalStats();

    if (loading && stores.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Manage your stores and view customer ratings
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">My Stores</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalStores}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalRatings}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Rating</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* My Stores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">My Stores</h3>
                    <p className="text-sm text-gray-600 mt-1">View and manage your store listings</p>
                </div>

                <div className="p-6">
                    {stores.length > 0 ? (
                        <div className="space-y-4">
                            {stores.map((store) => (
                                <div key={store.store_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Store className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{store.store_name}</h4>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {store.store_address}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        {renderStars(store.average_rating)}
                                                    </div>
                                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                                        {store.average_rating.toFixed(1)}/5.0
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {store.total_ratings} rating{store.total_ratings !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleViewRatings(store)}
                                                className="btn-outline flex items-center space-x-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View Ratings</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                            <p className="text-gray-600">You don't have any stores assigned to your account</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Store Ratings Modal */}
            {showRatings && selectedStore && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Store Ratings</h3>
                                <p className="text-sm text-gray-600">{selectedStore.store_name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowRatings(false);
                                    setSelectedStore(null);
                                    setRecentRatings([]);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoadingSpinner size="large" />
                                </div>
                            ) : recentRatings.length > 0 ? (
                                <div className="space-y-4">
                                    {recentRatings.map((rating) => (
                                        <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{rating.user_name}</p>
                                                        <p className="text-sm text-gray-600">{rating.user_email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        {renderStars(rating.rating)}
                                                    </div>
                                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                                        {rating.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(rating.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
                                    <p className="text-gray-600">This store hasn't received any ratings yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreOwnerDashboard;

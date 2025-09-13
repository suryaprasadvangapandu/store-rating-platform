import React, { useState, useEffect } from 'react';
import { Star, Search, MapPin, Mail, Filter, SortAsc, SortDesc, Store } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingModal from '../components/RatingModal';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        address: '',
        sortBy: 'name',
        sortOrder: 'ASC'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [selectedStore, setSelectedStore] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);

    useEffect(() => {
        fetchStores();
    }, [filters, pagination.page]);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            const response = await axios.get('/api/stores', { params });
            setStores(response.data.stores);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
    };

    const handleSort = (sortBy) => {
        const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder
        }));
    };

    const handleRateStore = (store) => {
        setSelectedStore(store);
        setShowRatingModal(true);
    };

    const handleRatingSubmitted = () => {
        fetchStores(); // Refresh stores to show updated ratings
        setShowRatingModal(false);
        setSelectedStore(null);
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

    const SortButton = ({ field, children }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
            <span>{children}</span>
            {filters.sortBy === field ? (
                filters.sortOrder === 'ASC' ? (
                    <SortAsc className="w-4 h-4" />
                ) : (
                    <SortDesc className="w-4 h-4" />
                )
            ) : (
                <div className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
                <p className="mt-2 text-gray-600">
                    Discover and rate stores in your area
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="form-label">Search by Name</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="form-input pl-10"
                                placeholder="Store name..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Search by Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.address}
                                onChange={(e) => handleFilterChange('address', e.target.value)}
                                className="form-input pl-10"
                                placeholder="Address..."
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ name: '', address: '', sortBy: 'name', sortOrder: 'ASC' })}
                            className="btn-outline w-full"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Stores List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="large" />
                    </div>
                ) : stores.length > 0 ? (
                    <>
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-4">
                                    <SortButton field="name">Store Name</SortButton>
                                </div>
                                <div className="col-span-3">
                                    <SortButton field="address">Address</SortButton>
                                </div>
                                <div className="col-span-2">
                                    <SortButton field="average_rating">Rating</SortButton>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm font-medium text-gray-600">My Rating</span>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-sm font-medium text-gray-600">Actions</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-200">
                            {stores.map((store) => (
                                <div key={store.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{store.name}</h3>
                                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {store.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex items-start">
                                                <MapPin className="w-3 h-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">{store.address}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="flex items-center">
                                                <div className="flex items-center">
                                                    {renderStars(parseFloat(store.average_rating))}
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-900">
                                                    {parseFloat(store.average_rating).toFixed(1)}
                                                </span>
                                                <span className="ml-1 text-xs text-gray-500">
                                                    ({store.total_ratings})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            {store.user_rating ? (
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        {renderStars(store.user_rating)}
                                                    </div>
                                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                                        {store.user_rating}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not rated</span>
                                            )}
                                        </div>

                                        <div className="col-span-1">
                                            <button
                                                onClick={() => handleRateStore(store)}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                                            >
                                                {store.user_rating ? 'Update' : 'Rate'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                        {pagination.total} results
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-3 py-1 text-sm text-gray-700">
                                            Page {pagination.page} of {pagination.pages}
                                        </span>

                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && selectedStore && (
                <RatingModal
                    store={selectedStore}
                    onClose={() => {
                        setShowRatingModal(false);
                        setSelectedStore(null);
                    }}
                    onRatingSubmitted={handleRatingSubmitted}
                />
            )}
        </div>
    );
};

export default Stores;

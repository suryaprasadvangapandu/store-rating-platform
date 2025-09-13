import React, { useState, useEffect } from 'react';
import {
    Store,
    Search,
    Filter,
    Plus,
    Eye,
    Mail,
    MapPin,
    Star,
    SortAsc,
    SortDesc
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import StoreModal from '../../components/StoreModal';

const AdminStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        email: '',
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
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'

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

            const response = await axios.get('/api/admin/stores', { params });
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

    const handleViewStore = (store) => {
        setSelectedStore(store);
        setModalMode('view');
        setShowStoreModal(true);
    };

    const handleAddStore = () => {
        setSelectedStore(null);
        setModalMode('add');
        setShowStoreModal(true);
    };

    const handleStoreSaved = () => {
        fetchStores();
        setShowStoreModal(false);
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
                        <p className="mt-2 text-gray-600">
                            Manage stores and their information
                        </p>
                    </div>
                    <button
                        onClick={handleAddStore}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Store</span>
                    </button>
                </div>
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
                        <label className="form-label">Search by Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.email}
                                onChange={(e) => handleFilterChange('email', e.target.value)}
                                className="form-input pl-10"
                                placeholder="Store email..."
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ name: '', email: '', address: '', sortBy: 'name', sortOrder: 'ASC' })}
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
                                <div className="col-span-3">
                                    <SortButton field="name">Store Name</SortButton>
                                </div>
                                <div className="col-span-3">
                                    <SortButton field="email">Email</SortButton>
                                </div>
                                <div className="col-span-3">
                                    <SortButton field="address">Address</SortButton>
                                </div>
                                <div className="col-span-2">
                                    <SortButton field="average_rating">Rating</SortButton>
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
                                        <div className="col-span-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Store className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{store.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Created {new Date(store.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600">{store.email}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-600 truncate">{store.address}</span>
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

                                        <div className="col-span-1">
                                            <button
                                                onClick={() => handleViewStore(store)}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                                            >
                                                <Eye className="w-4 h-4" />
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

            {/* Store Modal */}
            {showStoreModal && (
                <StoreModal
                    store={selectedStore}
                    mode={modalMode}
                    onClose={() => {
                        setShowStoreModal(false);
                        setSelectedStore(null);
                    }}
                    onStoreSaved={handleStoreSaved}
                />
            )}
        </div>
    );
};

export default AdminStores;

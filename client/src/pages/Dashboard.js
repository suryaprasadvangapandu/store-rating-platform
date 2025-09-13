import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Store,
    Star,
    Users,
    TrendingUp,
    Plus,
    Eye,
    Settings
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStores: 0,
        myRatings: 0,
        averageRating: 0
    });
    const [recentStores, setRecentStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch stores
            const storesResponse = await axios.get('/api/stores?limit=5');
            setRecentStores(storesResponse.data.stores);

            // Fetch user's ratings if not admin
            if (user.role !== 'admin') {
                const ratingsResponse = await axios.get('/api/ratings/my-ratings?limit=100');
                const ratings = ratingsResponse.data.ratings;

                setStats(prev => ({
                    ...prev,
                    myRatings: ratings.length,
                    averageRating: ratings.length > 0
                        ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length).toFixed(1)
                        : 0
                }));
            }

            setStats(prev => ({
                ...prev,
                totalStores: storesResponse.data.pagination.total
            }));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBasedContent = () => {
        switch (user.role) {
            case 'admin':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Administrator Panel</h3>
                                    <p className="text-red-100">Manage users, stores, and system settings</p>
                                </div>
                                <Settings className="w-8 h-8 text-red-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Stores</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
                                    </div>
                                    <Store className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalRatings || 0}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a
                                    href="/admin/users"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <Users className="w-5 h-5 text-blue-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Manage Users</p>
                                        <p className="text-sm text-gray-600">Add, edit, and view users</p>
                                    </div>
                                </a>

                                <a
                                    href="/admin/stores"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <Store className="w-5 h-5 text-green-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Manage Stores</p>
                                        <p className="text-sm text-gray-600">Add, edit, and view stores</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                );

            case 'store_owner':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Store Owner Dashboard</h3>
                                    <p className="text-blue-100">Manage your stores and view ratings</p>
                                </div>
                                <Store className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">My Stores</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.myStores || 0}</p>
                                    </div>
                                    <Store className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Average Rating</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a
                                    href="/store-owner"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <Eye className="w-5 h-5 text-blue-500 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">View Store Ratings</p>
                                        <p className="text-sm text-gray-600">See who rated your stores</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Welcome to StoreRate</h3>
                                    <p className="text-green-100">Discover and rate your favorite stores</p>
                                </div>
                                <Store className="w-8 h-8 text-green-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Stores</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
                                    </div>
                                    <Store className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">My Ratings</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.myRatings}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stores</h3>
                            {recentStores.length > 0 ? (
                                <div className="space-y-3">
                                    {recentStores.map((store) => (
                                        <div key={store.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{store.name}</p>
                                                <p className="text-sm text-gray-600">{store.address}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm font-medium text-gray-900 ml-1">
                                                        {parseFloat(store.average_rating).toFixed(1)}
                                                    </span>
                                                </div>
                                                <a
                                                    href={`/stores`}
                                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No stores available</p>
                            )}
                        </div>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome back, {user.name}! Here's what's happening with your account.
                </p>
            </div>

            {getRoleBasedContent()}
        </div>
    );
};

export default Dashboard;

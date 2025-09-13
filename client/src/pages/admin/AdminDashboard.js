import React, { useState, useEffect } from 'react';
import { Users, Store, Star, TrendingUp, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
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
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Manage users, stores, and system settings
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <a
                            href="/admin/users"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all users →
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Stores</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalStores}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <a
                            href="/admin/stores"
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            View all stores →
                        </a>
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
                    <div className="mt-4">
                        <span className="text-sm text-gray-500">All user ratings</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage users and their roles</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <a
                                href="/admin/users"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Users className="w-5 h-5 text-blue-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">View All Users</p>
                                    <p className="text-sm text-gray-600">Browse and manage user accounts</p>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>

                            <a
                                href="/admin/users?action=add"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5 text-green-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">Add New User</p>
                                    <p className="text-sm text-gray-600">Create a new user account</p>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Store Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Store Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage stores and their information</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <a
                                href="/admin/stores"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Store className="w-5 h-5 text-green-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">View All Stores</p>
                                    <p className="text-sm text-gray-600">Browse and manage store listings</p>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>

                            <a
                                href="/admin/stores?action=add"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5 text-green-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">Add New Store</p>
                                    <p className="text-sm text-gray-600">Create a new store listing</p>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Overview */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                    <p className="text-sm text-gray-600 mt-1">Key metrics and system health</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                            <div className="text-sm text-gray-600">Registered Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.totalStores}</div>
                            <div className="text-sm text-gray-600">Active Stores</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.totalRatings}</div>
                            <div className="text-sm text-gray-600">Total Ratings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {stats.totalStores > 0 ? (stats.totalRatings / stats.totalStores).toFixed(1) : 0}
                            </div>
                            <div className="text-sm text-gray-600">Avg Ratings per Store</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

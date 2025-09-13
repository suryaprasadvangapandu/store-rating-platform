import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Shield, Building2, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const UserModal = ({ user, mode, onClose, onUserSaved }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        if (user && mode === 'view') {
            fetchUserDetails();
        } else if (user && mode === 'edit') {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                address: user.address || '',
                role: user.role || 'user'
            });
        }
    }, [user, mode]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/users/${user.id}`);
            setUserDetails(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to fetch user details');
        } finally {
            setLoading(false);
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

        if (mode === 'add') {
            // Validate form for new user
            if (!formData.name || !formData.email || !formData.password || !formData.address) {
                toast.error('All fields are required');
                return;
            }

            if (formData.name.length < 20 || formData.name.length > 60) {
                toast.error('Name must be between 20 and 60 characters');
                return;
            }

            if (formData.address.length > 400) {
                toast.error('Address must not exceed 400 characters');
                return;
            }

            if (formData.password.length < 8 || formData.password.length > 16) {
                toast.error('Password must be between 8 and 16 characters');
                return;
            }

            if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
                toast.error('Password must contain at least one uppercase letter and one special character');
                return;
            }
        }

        try {
            setLoading(true);

            if (mode === 'add') {
                await axios.post('/api/admin/users', formData);
                toast.success('User created successfully!');
            } else if (mode === 'edit') {
                // For edit, we would need to implement an update endpoint
                toast.error('Edit functionality not implemented yet');
                return;
            }

            onUserSaved();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save user';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-5 h-5 text-red-500" />;
            case 'store_owner':
                return <Building2 className="w-5 h-5 text-blue-500" />;
            default:
                return <User className="w-5 h-5 text-green-500" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'text-red-600 bg-red-100';
            case 'store_owner':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-green-600 bg-green-100';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'store_owner':
                return 'Store Owner';
            default:
                return 'User';
        }
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
                        {mode === 'view' ? 'User Details' : mode === 'add' ? 'Add New User' : 'Edit User'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {mode === 'view' && userDetails ? (
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                    {getRoleIcon(userDetails.role)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900">{userDetails.name}</h4>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userDetails.role)}`}>
                                        {getRoleIcon(userDetails.role)}
                                        <span className="ml-2">{getRoleLabel(userDetails.role)}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900">{userDetails.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Role</label>
                                    <p className="text-gray-900">{getRoleLabel(userDetails.role)}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Address</label>
                                    <p className="text-gray-900">{userDetails.address}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Joined</label>
                                    <p className="text-gray-900">{new Date(userDetails.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Store Owner Store Info */}
                            {userDetails.role === 'store_owner' && userDetails.store && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h5 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h5>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Store Name</label>
                                                <p className="text-gray-900">{userDetails.store.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Average Rating</label>
                                                <p className="text-gray-900">{parseFloat(userDetails.store.average_rating).toFixed(1)}/5.0</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Total Ratings</label>
                                                <p className="text-gray-900">{userDetails.store.total_ratings}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="form-label">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter full name (20-60 characters)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.name.length}/60 characters
                                </p>
                            </div>

                            <div>
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required={mode === 'add'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-input pr-10"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {mode === 'add' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        8-16 characters, must include uppercase and special character
                                    </p>
                                )}
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
                                    placeholder="Enter address"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.address.length}/400 characters
                                </p>
                            </div>

                            <div>
                                <label htmlFor="role" className="form-label">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="user">User</option>
                                    <option value="store_owner">Store Owner</option>
                                    <option value="admin">Administrator</option>
                                </select>
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
                                    mode === 'add' ? 'Create User' : 'Update User'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserModal;

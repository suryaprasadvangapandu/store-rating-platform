import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Plus,
    Eye,
    Mail,
    MapPin,
    Shield,
    Building2,
    User,
    SortAsc,
    SortDesc
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserModal from '../../components/UserModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        address: '',
        role: '',
        sortBy: 'name',
        sortOrder: 'ASC'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'

    useEffect(() => {
        fetchUsers();
    }, [filters, pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            const response = await axios.get('/api/admin/users', { params });
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
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

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setModalMode('view');
        setShowUserModal(true);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setModalMode('add');
        setShowUserModal(true);
    };

    const handleUserSaved = () => {
        fetchUsers();
        setShowUserModal(false);
        setSelectedUser(null);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-4 h-4 text-red-500" />;
            case 'store_owner':
                return <Building2 className="w-4 h-4 text-blue-500" />;
            default:
                return <User className="w-4 h-4 text-green-500" />;
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
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-2 text-gray-600">
                            Manage users and their roles
                        </p>
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="form-label">Search by Name</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="form-input pl-10"
                                placeholder="User name..."
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
                                placeholder="Email address..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Filter by Role</label>
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="form-input"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Administrator</option>
                            <option value="user">User</option>
                            <option value="store_owner">Store Owner</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ name: '', email: '', address: '', role: '', sortBy: 'name', sortOrder: 'ASC' })}
                            className="btn-outline w-full"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="large" />
                    </div>
                ) : users.length > 0 ? (
                    <>
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-3">
                                    <SortButton field="name">Name</SortButton>
                                </div>
                                <div className="col-span-3">
                                    <SortButton field="email">Email</SortButton>
                                </div>
                                <div className="col-span-3">
                                    <SortButton field="address">Address</SortButton>
                                </div>
                                <div className="col-span-2">
                                    <SortButton field="role">Role</SortButton>
                                </div>
                                <div className="col-span-1">
                                    <span className="text-sm font-medium text-gray-600">Actions</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                    {getRoleIcon(user.role)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600">{user.email}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-600 truncate">{user.address}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                <span className="ml-1">{getRoleLabel(user.role)}</span>
                                            </span>
                                        </div>

                                        <div className="col-span-1">
                                            <button
                                                onClick={() => handleViewUser(user)}
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
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <UserModal
                    user={selectedUser}
                    mode={modalMode}
                    onClose={() => {
                        setShowUserModal(false);
                        setSelectedUser(null);
                    }}
                    onUserSaved={handleUserSaved}
                />
            )}
        </div>
    );
};

export default AdminUsers;

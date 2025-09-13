const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { userValidation, storeValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const [usersResult, storesResult, ratingsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM users'),
            pool.query('SELECT COUNT(*) as count FROM stores'),
            pool.query('SELECT COUNT(*) as count FROM ratings')
        ]);

        res.json({
            totalUsers: parseInt(usersResult.rows[0].count),
            totalStores: parseInt(storesResult.rows[0].count),
            totalRatings: parseInt(ratingsResult.rows[0].count)
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add new user
router.post('/users', userValidation, handleValidationErrors, async (req, res) => {
    try {
        const { name, email, password, address, role = 'user' } = req.body;

        // Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at',
            [name, email, passwordHash, address, role]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all users with filters and sorting
router.get('/users', async (req, res) => {
    try {
        const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;

        let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
        const params = [];
        let paramCount = 0;

        // Apply filters
        if (name) {
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            params.push(`%${name}%`);
        }
        if (email) {
            paramCount++;
            query += ` AND email ILIKE $${paramCount}`;
            params.push(`%${email}%`);
        }
        if (address) {
            paramCount++;
            query += ` AND address ILIKE $${paramCount}`;
            params.push(`%${address}%`);
        }
        if (role) {
            paramCount++;
            query += ` AND role = $${paramCount}`;
            params.push(role);
        }

        // Apply sorting
        const validSortColumns = ['name', 'email', 'address', 'role', 'created_at'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortColumn} ${order}`;

        // Apply pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await pool.query(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
        const countParams = [];
        let countParamCount = 0;

        if (name) {
            countParamCount++;
            countQuery += ` AND name ILIKE $${countParamCount}`;
            countParams.push(`%${name}%`);
        }
        if (email) {
            countParamCount++;
            countQuery += ` AND email ILIKE $${countParamCount}`;
            countParams.push(`%${email}%`);
        }
        if (address) {
            countParamCount++;
            countQuery += ` AND address ILIKE $${countParamCount}`;
            countParams.push(`%${address}%`);
        }
        if (role) {
            countParamCount++;
            countQuery += ` AND role = $${countParamCount}`;
            countParams.push(role);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            users: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user details
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // If user is a store owner, get their store details
        if (user.role === 'store_owner') {
            const storeResult = await pool.query(
                `SELECT s.id, s.name, s.email, s.address, 
         COALESCE(AVG(r.rating), 0) as average_rating,
         COUNT(r.id) as total_ratings
         FROM stores s 
         LEFT JOIN ratings r ON s.id = r.store_id 
         WHERE s.owner_id = $1 
         GROUP BY s.id, s.name, s.email, s.address`,
                [id]
            );

            user.store = storeResult.rows[0] || null;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add new store
router.post('/stores', storeValidation, handleValidationErrors, async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        // Check if store email already exists
        const existingStore = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
        if (existingStore.rows.length > 0) {
            return res.status(400).json({ message: 'Store already exists with this email' });
        }

        // Handle owner_id - convert empty string to null
        const processedOwnerId = (owner_id === '' || owner_id === null || owner_id === undefined) ? null : parseInt(owner_id);

        // Verify owner exists and is a store owner
        if (processedOwnerId) {
            const ownerResult = await pool.query('SELECT role FROM users WHERE id = $1', [processedOwnerId]);
            if (ownerResult.rows.length === 0) {
                return res.status(400).json({ message: 'Owner not found' });
            }
            if (ownerResult.rows[0].role !== 'store_owner') {
                return res.status(400).json({ message: 'Owner must have store_owner role' });
            }
        }

        // Create store
        const result = await pool.query(
            'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id, created_at',
            [name, email, address, processedOwnerId]
        );

        res.status(201).json({
            message: 'Store created successfully',
            store: result.rows[0]
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all stores with filters and sorting
router.get('/stores', async (req, res) => {
    try {
        const { name, email, address, sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;

        let query = `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
                 COALESCE(AVG(r.rating), 0) as average_rating,
                 COUNT(r.id) as total_ratings
                 FROM stores s 
                 LEFT JOIN ratings r ON s.id = r.store_id 
                 WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        // Apply filters
        if (name) {
            paramCount++;
            query += ` AND s.name ILIKE $${paramCount}`;
            params.push(`%${name}%`);
        }
        if (email) {
            paramCount++;
            query += ` AND s.email ILIKE $${paramCount}`;
            params.push(`%${email}%`);
        }
        if (address) {
            paramCount++;
            query += ` AND s.address ILIKE $${paramCount}`;
            params.push(`%${address}%`);
        }

        query += ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at';

        // Apply sorting
        const validSortColumns = ['name', 'email', 'address', 'average_rating', 'created_at'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortColumn} ${order}`;

        // Apply pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await pool.query(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as count FROM stores WHERE 1=1';
        const countParams = [];
        let countParamCount = 0;

        if (name) {
            countParamCount++;
            countQuery += ` AND name ILIKE $${countParamCount}`;
            countParams.push(`%${name}%`);
        }
        if (email) {
            countParamCount++;
            countQuery += ` AND email ILIKE $${countParamCount}`;
            countParams.push(`%${email}%`);
        }
        if (address) {
            countParamCount++;
            countQuery += ` AND address ILIKE $${countParamCount}`;
            countParams.push(`%${address}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            stores: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

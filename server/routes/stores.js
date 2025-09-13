const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all stores (public endpoint)
router.get('/', async (req, res) => {
    try {
        const { name, address, sortBy = 'name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;

        let query = `SELECT s.id, s.name, s.email, s.address, s.created_at,
                 COALESCE(AVG(r.rating), 0) as average_rating,
                 COUNT(r.id) as total_ratings`;
        
        // Add user rating if user is authenticated
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let userId = null;
        
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
                userId = decoded.userId;
            } catch (error) {
                // Token invalid, continue without user rating
            }
        }

        if (userId) {
            query += `, ur.rating as user_rating`;
        }

        query += ` FROM stores s 
                 LEFT JOIN ratings r ON s.id = r.store_id`;

        if (userId) {
            query += ` LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1`;
        }

        query += ` WHERE 1=1`;
        
        const params = [];
        let paramCount = 0;

        if (userId) {
            params.push(userId);
            paramCount = 1;
        }

        // Apply filters
        if (name) {
            paramCount++;
            query += ` AND s.name ILIKE $${paramCount}`;
            params.push(`%${name}%`);
        }
        if (address) {
            paramCount++;
            query += ` AND s.address ILIKE $${paramCount}`;
            params.push(`%${address}%`);
        }

        query += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at';
        
        if (userId) {
            query += ', ur.rating';
        }

        // Apply sorting
        const validSortColumns = ['name', 'address', 'average_rating', 'created_at'];
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

// Get store details with user's rating
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get store details with average rating
        const storeResult = await pool.query(
            `SELECT s.id, s.name, s.email, s.address, s.created_at,
       COALESCE(AVG(r.rating), 0) as average_rating,
       COUNT(r.id) as total_ratings
       FROM stores s 
       LEFT JOIN ratings r ON s.id = r.store_id 
       WHERE s.id = $1 
       GROUP BY s.id, s.name, s.email, s.address, s.created_at`,
            [id]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const store = storeResult.rows[0];

        // Get user's rating for this store
        const userRatingResult = await pool.query(
            'SELECT rating FROM ratings WHERE user_id = $1 AND store_id = $2',
            [userId, id]
        );

        store.user_rating = userRatingResult.rows[0]?.rating || null;

        res.json({ store });
    } catch (error) {
        console.error('Get store details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

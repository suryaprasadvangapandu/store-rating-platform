const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ratingValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Submit or update rating
router.post('/', ratingValidation, handleValidationErrors, async (req, res) => {
    try {
        const { store_id, rating } = req.body;
        const userId = req.user.id;

        // Verify store exists
        const storeResult = await pool.query('SELECT id FROM stores WHERE id = $1', [store_id]);
        if (storeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Check if user already rated this store
        const existingRating = await pool.query(
            'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
            [userId, store_id]
        );

        if (existingRating.rows.length > 0) {
            // Update existing rating
            await pool.query(
                'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [rating, existingRating.rows[0].id]
            );

            res.json({
                message: 'Rating updated successfully',
                rating: {
                    id: existingRating.rows[0].id,
                    user_id: userId,
                    store_id: store_id,
                    rating: rating
                }
            });
        } else {
            // Create new rating
            const result = await pool.query(
                'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING id, user_id, store_id, rating, created_at',
                [userId, store_id, rating]
            );

            res.status(201).json({
                message: 'Rating submitted successfully',
                rating: result.rows[0]
            });
        }
    } catch (error) {
        console.error('Rating submission error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user's ratings
router.get('/my-ratings', async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const result = await pool.query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
       s.id as store_id, s.name as store_name, s.address as store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.updated_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, parseInt(limit), offset]
        );

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM ratings WHERE user_id = $1',
            [userId]
        );

        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            ratings: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Store owner dashboard - get store ratings
router.get('/store/:storeId', requireRole(['store_owner', 'admin']), async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user.id;

        // Verify store exists and user owns it (unless admin)
        let storeQuery = 'SELECT id, owner_id FROM stores WHERE id = $1';
        const storeParams = [storeId];

        if (req.user.role !== 'admin') {
            storeQuery += ' AND owner_id = $2';
            storeParams.push(userId);
        }

        const storeResult = await pool.query(storeQuery, storeParams);
        if (storeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Store not found or access denied' });
        }

        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Get ratings for the store
        const ratingsResult = await pool.query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
       u.id as user_id, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
            [storeId, parseInt(limit), offset]
        );

        // Get average rating
        const avgResult = await pool.query(
            'SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = $1',
            [storeId]
        );

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM ratings WHERE store_id = $1',
            [storeId]
        );

        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            store_id: storeId,
            average_rating: parseFloat(avgResult.rows[0].average_rating),
            total_ratings: parseInt(avgResult.rows[0].total_ratings),
            ratings: ratingsResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get store ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Store owner dashboard - get all their stores' ratings
router.get('/my-stores', requireRole(['store_owner']), async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all stores owned by the user with their ratings
        const result = await pool.query(
            `SELECT s.id as store_id, s.name as store_name, s.address as store_address,
       COALESCE(AVG(r.rating), 0) as average_rating,
       COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id, s.name, s.address
       ORDER BY s.name`,
            [userId]
        );

        res.json({
            stores: result.rows.map(store => ({
                ...store,
                average_rating: parseFloat(store.average_rating),
                total_ratings: parseInt(store.total_ratings)
            }))
        });
    } catch (error) {
        console.error('Get my stores ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

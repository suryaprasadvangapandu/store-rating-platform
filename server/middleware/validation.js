const { body, validationResult } = require('express-validator');

// Validation rules
const userValidation = [
    body('name')
        .isLength({ min: 20, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email'),
    body('password')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
        .withMessage('Password must contain at least one uppercase letter and one special character'),
    body('address')
        .isLength({ max: 400 })
        .withMessage('Address must not exceed 400 characters'),
    body('role')
        .optional()
        .isIn(['admin', 'user', 'store_owner'])
        .withMessage('Role must be admin, user, or store_owner')
];

const storeValidation = [
    body('name')
        .notEmpty()
        .withMessage('Store name is required'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email'),
    body('address')
        .isLength({ max: 400 })
        .withMessage('Address must not exceed 400 characters'),
    body('owner_id')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true; // Allow empty values
            }
            if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                throw new Error('Owner ID must be a positive integer');
            }
            return true;
        })
        .withMessage('Owner ID must be a positive integer or empty')
];

const ratingValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const passwordUpdateValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
        .withMessage('Password must contain at least one uppercase letter and one special character')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    userValidation,
    storeValidation,
    ratingValidation,
    loginValidation,
    passwordUpdateValidation,
    handleValidationErrors
};

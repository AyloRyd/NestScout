import { Router } from 'express';
import { check, body } from 'express-validator';

import AuthenticationController from '../controllers/AuthenticationController.js';
import User from '../models/User.js';

const router = Router();

router.get('/login', AuthenticationController.getLoginPage);

router.post(
    '/login',
    [
        body('email', 'Please enter a valid email address.')
            .isEmail()
            .normalizeEmail(),
    ],
    AuthenticationController.login
);

router.get('/signup', AuthenticationController.getSignupPage);

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom(async (email) => {
                const [user] = await User.read({ email });
                if (user) {
                    throw new Error('E-Mail already exists, please pick a different one.');
                }
            })
            .normalizeEmail(),
        body('firstName')
            .trim()
            .isLength({ min: 2 })
            .withMessage('First name must be at least 2 characters long.'),
        body('lastName')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ min: 2 })
            .withMessage('Last name must be at least 2 characters long, if provided.'),
        body('password')
            .isLength({ min: 7 })
            .withMessage('Password must be at least 7 characters.')
            .matches(/\d/)
            .withMessage('Password must include at least one number.')
            .matches(/[a-zA-Z]/)
            .withMessage('Password must include at least one letter.')
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match.');
                }
                return true;
            }),
    ],
    AuthenticationController.signup
);

router.post('/logout', AuthenticationController.logout);

export default router;
import { Router } from 'express';
import { body } from 'express-validator';

import UserController from '../controllers/UserController.js';
import User from '../models/User.js';

const router = Router();

router.get('/edit', UserController.getEditPage);

router.put(
    '/edit',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom(async (email, { req }) => {
                const [user] = await User.read({ email });
                if (user && user.id !== req.session.user.id) {
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
            .notEmpty()
            .withMessage('Current password is required.'),
        body('newPassword')
            .optional({ checkFalsy: true })
            .isLength({ min: 7 })
            .withMessage('New password must be at least 7 characters.')
            .matches(/\d/)
            .withMessage('New password must include at least one number.')
            .matches(/[a-zA-Z]/)
            .withMessage('New password must include at least one letter.')
            .trim(),
        body('confirmNewPassword')
            .trim()
            .custom((value, { req }) => {
                if (req.body.newPassword && value !== req.body.newPassword) {
                    throw new Error('Passwords do not match.');
                }
                return true;
            }),
    ],
    UserController.editUser
);

router.get('/delete', UserController.getDeletePage);

router.delete(
    '/delete',
    [
        body('password')
            .notEmpty()
            .withMessage('Password is required.')
    ],
    UserController.deleteUser
);

export default router;
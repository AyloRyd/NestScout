import bcrypt from 'bcryptjs';
import { validationResult } from "express-validator";
import User from '../models/user.js';

class UsersController {
    static async getEditPage(req, res) {
        const [user] = await User.read({ id: req.session.user.id });

        res.render('user/edit', {
            title: 'NestScout | Edit account',
            error: null,
            oldInput: {
                firstName: user.first_name,
                lastName: user.last_name || '',
                email: user.email,
                password: '',
                newPassword: '',
                confirmNewPassword: '',
            },
            validationErrors: [],
        });
    }

    static async editUser(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render('user/edit', {
                title: 'NestScout | Edit account',
                error: null,
                oldInput: req.body,
                validationErrors: errors.array(),
            });
        }

        const { firstName, lastName, email, password, newPassword } = req.body;

        try {
            const [user] = await User.read({ id: req.session.user.id });

            const doMatch = await bcrypt.compare(password, user.password);
            if (!doMatch) {
                return res.status(401).render('user/edit', {
                    title: 'NestScout | Edit account',
                    error: {
                        msg: 'Invalid current password.',
                        path: 'password' }
                    ,
                    oldInput: { ...req.body, password: '', newPassword: '', confirmNewPassword: '' },
                    validationErrors: [],
                });
            }

            const updatedUser = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: newPassword ? await bcrypt.hash(newPassword, 12) : user.password,
            };

            await User.update(updatedUser, { id: req.session.user.id });

            req.session.user.firstName = firstName;
            req.session.user.lastName = lastName;
            req.session.user.email = email;

            req.session.save((err) => {
                if (err) {
                    console.error('Failed to save session:', err);
                    return next(err);
                }
                req.flash('success', 'Profile updated successfully.');
                res.redirect('/');
            });
        } catch (err) {
            next(err);
        }
    }

    static getDeletePage(req, res) {
        res.render('user/delete', {
            title: 'NestScout | Delete account',
            error: null,
            oldInput: { password: '' },
            validationErrors: [],
        });
    }

    static async deleteUser(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render('user/delete', {
                title: 'NestScout | Delete account',
                error: null,
                oldInput: req.body,
                validationErrors: errors.array(),
            });
        }

        const { password } = req.body;

        try {
            const [user] = await User.read({ id: req.session.user.id });

            const doMatch = await bcrypt.compare(password, user.password);
            if (!doMatch) {
                return res.status(401).render('user/delete', {
                    title: 'NestScout | Delete account',
                    error: {
                        msg: 'Invalid password.',
                        path: 'password'
                    },
                    oldInput: { password: '' },
                    validationErrors: [],
                });
            }

            await User.delete({ id: req.session.user.id });

            req.session.destroy((err) => {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                res.redirect('/');
            });
        } catch (err) {
            next(err);
        }
    }
}

export default UsersController;
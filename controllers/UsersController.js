import bcrypt from 'bcryptjs';
import { validationResult } from "express-validator";

import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';

class UsersController {
    static getEditPage(req, res) {
        res.render('user/edit', {
            title: 'NestScout | Edit account',
            error: null,
            oldInput: {
                firstName: req.session.user.firstName,
                lastName: req.session.user.lastName || '',
                email: req.session.user.email,
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
            const [user] = await User.read({ where: { id: req.session.user.id } });

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

            await User.update({
                data: updatedUser,
                where: { id: req.session.user.id }
            });

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
            const [user] = await User.read({ where: { id: req.session.user.id } });

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

            await User.delete({ where: { id: req.session.user.id } });

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

    static async getProfilePage(req, res) {
        const listings = await Listing.read({ where: { host_id: req.session.user.id } });
        const bookings = await Booking.read({ where: { guest_id: req.session.user.id } });
        for (const booking of bookings) {
            const listing = await Listing.read({ where: { id: booking.listing_id } });
            booking.listing = listing[0];
        }
        res.render('user/profile', {
            title: 'NestScout | Profile',
            listings,
            bookings
        });
    }
}

export default UsersController;
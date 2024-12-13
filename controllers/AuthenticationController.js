import bcrypt from 'bcryptjs';
import { validationResult } from "express-validator";

import User from '../models/User.js';

class AuthenticationController {
    static getLoginPage(req, res) {
        const error = req.flash('error')[0] || null;
        res.render('authentication/login', {
            title: 'NestScout | Log in',
            error,
            oldInput: {
                email: '',
                password: ''
            },
            validationErrors: [],
        });
    }

    static async login(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render('authentication/login', {
                title: 'NestScout | Log in',
                error: null,
                oldInput: req.body,
                validationErrors: errors.array(),
            });
        }

        const { email, password } = req.body;

        try {
            const [user] = await User.read({ where: { email } });
            if (!user) {
                req.flash('error', {
                    msg: 'There\'s no user with that e-mail address.',
                    path: 'email'
                });
                return res.redirect('/authentication/login');
            }

            const doMatch = await bcrypt.compare(password, user.password);
            if (!doMatch) {
                return res.status(401).render('authentication/login', {
                    title: 'NestScout | Log in',
                    error: {
                        msg: 'Invalid password.',
                        path: 'password'
                    },
                    oldInput: {
                        email,
                        password: ''
                    },
                    validationErrors: [],
                });
            }

            req.session.isLoggedIn = true;
            req.session.user = {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                createdAt: user.created_at
            };
            req.session.save((err) => {
                if (err) console.error(err);
                res.redirect('/');
            });
        } catch (err) {
            next(err);
        }
    }

    static getSignupPage(req, res) {
        const error = req.flash('error')[0] || null;
        res.render('authentication/signup', {
            title: 'NestScout | Sign up',
            error,
            oldInput: {
                email: '',
                password: '',
                confirmPassword: '',
            },
            validationErrors: [],
        });
    }

    static async signup(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render('authentication/signup', {
                title: 'NestScout | Sign up',
                error: null,
                oldInput: req.body,
                validationErrors: errors.array(),
            });
        }

        const { firstName, lastName, email, password } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            await User.create({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: hashedPassword
                }
            });

            req.flash('success', 'Signup successful. Please log in.');
            res.redirect('/authentication/login');
        } catch (err) {
            next(err);
        }
    }

    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) console.error(err);
            res.redirect('/');
        });
    }
}

export default AuthenticationController;
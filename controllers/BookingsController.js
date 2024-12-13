import { validationResult, Result } from 'express-validator';

import Booking from '../models/Booking.js';

import ListingsController from './ListingsController.js';

class BookingsController {
    static async makeBooking(req, res) {
        try {
            const { check_in, check_out, guests_count, listing_id } = req.body;
            const user_id = req.session.user.id;

            let errors = validationResult(req);

            if (!errors.isEmpty()) {
                return await ListingsController.getListingPage(req, res, {
                    validationErrors: errors.array(),
                    check_in,
                    check_out,
                    guests_count,
                    listing_id,
                });
            }

            const newBooking = await Booking.create({
                data: {
                    guest_id: user_id,
                    listing_id,
                    check_in,
                    check_out,
                    guests_count
                }
            });

            res.redirect(`/users/${user_id}/bookings`);
        } catch (error) {
            console.error('Error in makeBooking:', error);
            res.status(500).send('An error occurred while creating the booking');
        }
    }
}

export default BookingsController;
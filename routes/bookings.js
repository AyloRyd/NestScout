import { Router } from 'express';
import { body } from 'express-validator';

import BookingsController from '../controllers/BookingsController.js';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';

const router = Router();

router.post(
    '/book',
    [
        body('check_in')
            .custom((value, { req }) => {
                if (new Date(value) >= new Date(req.body.check_out)) {
                    throw new Error('Check-in date must be earlier than check-out date.');
                }
                return true;
            }),
        body('check_in')
            .custom(async (value, { req }) => {
            const { listing_id, check_in, check_out } = req.body;
            const hasOverlaps = await Booking.hasOverlappingBookings(listing_id, check_in, check_out);

            if (hasOverlaps) {
                throw new Error('The selected dates overlap with an existing booking.');
            }
            return true;
        }),
        body('guests_count')
            .custom(async (value, { req }) => {
                const { listing_id, guests_count } = req.body;
                const [listing] = await Listing.read({ where: { id: listing_id } });

                if (!listing) {
                    throw new Error('Listing not found.');
                }
                if (guests_count > listing.maximum_guests) {
                    throw new Error(`Guests count cannot exceed the maximum allowed (${listing.maximum_guests}).`);
                }
                return true;
            })
    ],
    BookingsController.makeBooking
);

export default router;

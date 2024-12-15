import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

import PDFDocument from 'pdfkit';

import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

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

            const total_price =
                (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24) *
                (await Listing.read({ where: { id: listing_id } }))[0].price_per_night;

            const newBooking = await Booking.create({
                data: {
                    guest_id: user_id,
                    listing_id,
                    check_in,
                    check_out,
                    total_price,
                    guests_count
                }
            });

            await BookingsController.generateBookingDocument(newBooking.id, res);
        } catch (error) {
            console.error('Error in makeBooking:', error);
            res.status(500).send('An error occurred while creating the booking');
        }
    }

    static async generateBookingDocument(bookingID, res) {
        try {
            const [booking] = await Booking.read({ where: { id: bookingID } });

            const [listing] = await Listing.read({ where: { id: booking.listing_id } });
            const [host] = await User.read({ where: { id: listing.host_id } });
            const [booker] = await User.read({ where: { id: booking.guest_id } });

            const nights = (new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24);

            const downloadsFolder = path.join(process.cwd(), 'downloads');

            if (!fs.existsSync(downloadsFolder)) {
                fs.mkdirSync(downloadsFolder, { recursive: true });
            }

            const pdfPath = path.join(
                downloadsFolder,
                `Reservation by ${booker.first_name} ${booker.last_name} for ${listing.title}.pdf`
            );

            const doc = new PDFDocument();
            const pdfStream = fs.createWriteStream(pdfPath);

            doc.pipe(pdfStream);
            doc.fontSize(30).text('Booking Confirmation');
            doc.moveDown();
            doc.moveDown();

            doc.fontSize(14).text(`Booking ID: ${booking.id}`);
            doc.moveDown();

            doc.fontSize(20).text(`${listing.title} by ${host.first_name} ${host.last_name}`);
            doc.moveDown();

            doc.fontSize(18).text(`${listing.country}, ${listing.city}`);
            doc.text(`Address: ${listing.street}, ${listing.house_number}, ${listing.city}, ${listing.postal_code}`);
            doc.moveDown();
            doc.moveDown();

            doc.fontSize(14).text(`Booker: ${booker.first_name} ${booker.last_name}`);
            doc.moveDown();

            doc.fontSize(14).text(`Guests Count: ${booking.guests_count}`);
            doc.fontSize(14).text(`Check-in date: ${new Date(booking.check_in).toLocaleDateString('uk-UA')}`);
            doc.fontSize(14).text(`Check-out date: ${new Date(booking.check_out).toLocaleDateString('uk-UA')}`);
            doc.fontSize(14).text(`Nights: ${nights}`);
            doc.moveDown();
            doc.fontSize(14).text(`Price per night: $${listing.price_per_night}`);
            doc.moveDown();

            doc.fontSize(24).text(`Total price: $${booking.total_price}`);
            doc.moveDown();
            doc.moveDown();
            doc.moveDown();

            doc.fontSize(24).text('Thank you for booking with NestScout!');
            doc.moveDown();
            doc.fontSize(12).text(`Booking date: ${new Date(booking.booking_date).toLocaleDateString('uk-UA')}`);
            doc.end();

            pdfStream.on('finish', () => {
                res.download(
                    pdfPath,
                    `Reservation by ${booker.first_name} ${booker.last_name} for ${listing.title}.pdf`,
                    (err) => {
                        if (err) {
                            console.error('Error sending file:', err);
                            res.status(500).send('Failed to download the booking confirmation.');
                        }

                        fs.rm(downloadsFolder, { recursive: true, force: true }, (removeErr) => {
                            if (removeErr) {
                                console.error(`Failed to remove folder: ${downloadsFolder}`, removeErr);
                            } else {
                                console.log(`Folder removed: ${downloadsFolder}`);
                            }
                        });
                    }
                );
            });
        } catch (error) {
            console.error('Error in generateBookingDocument:', error);
            res.status(500).send('An error occurred while generating the booking document');
        }
    }

    static async downloadBookingCheck(req, res) {
        try {
            const { id } = req.params;
            await BookingsController.generateBookingDocument(id, res);
        } catch (error) {
            console.error('Error in downloadBookingCheck:', error);
            res.status(500).send('Failed to generate the booking document.');
        }
    }

    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;

            await Booking.update({
                data: { status: 'cancelled' },
                where: { id }
            });

            res.status(200).send({ message: 'Booking successfully cancelled.' });
        } catch (error) {
            console.error('Error in cancelBooking:', error);
            res.status(500).send('Failed to cancel the booking.');
        }
    }
}

export default BookingsController;
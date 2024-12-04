import BaseModel from './BaseModel.js';

class Listing extends BaseModel {
    static table = 'listings';

    static async search(city, check_in, check_out, guests_count) {
        const query = `
            SELECT
                listing.*
            FROM
                ${this.table} listing
            WHERE
                listing.city = ?
            AND listing.maximum_guests >= ?
            AND NOT EXISTS (
                SELECT 1
                FROM
                    Bookings booking
                WHERE
                    booking.listing_id = listing.id
                AND (booking.check_in <= ? AND booking.check_out >= ?)
            )
        `;

        try {
            const [rows] = await this.db.execute(query, [
                city,
                guests_count,
                check_out,
                check_in,
            ]);
            return rows;
        } catch (error) {
            console.error('Error executing search query:', error);
            throw error;
        }
    }
}

export default Listing;
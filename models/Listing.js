import BaseModel from './BaseModel.js';

class Listing extends BaseModel {
    static table = 'listings';

    static async search(filters) {
        const {
            city,
            check_in,
            check_out,
            guests_count,
            amenities,
            property_type,
            rooms_count_from,
            rooms_count_up_to,
            beds_count_from,
            beds_count_up_to,
            price_per_night_from,
            price_per_night_up_to,
            sort_order
        } = filters;

        let whereClauses = [];
        let values = [];

        if (city) {
            whereClauses.push('listing.city = ?');
            values.push(city);
        }
        if (guests_count) {
            whereClauses.push('listing.maximum_guests >= ?');
            values.push(guests_count);
        }
        if (check_in && check_out) {
            whereClauses.push(`NOT EXISTS 
        (SELECT 1 
        FROM Bookings booking 
        WHERE booking.listing_id = listing.id 
        AND (booking.check_in <= ? AND booking.check_out >= ?))`);
            values.push(check_in, check_out);
        }

        if (property_type) {
            whereClauses.push('listing.property_type = ?');
            values.push(property_type);
        }
        if (rooms_count_from) {
            whereClauses.push('listing.rooms_count >= ?');
            values.push(rooms_count_from);
        }
        if (rooms_count_up_to) {
            whereClauses.push('listing.rooms_count <= ?');
            values.push(rooms_count_up_to);
        }
        if (beds_count_from) {
            whereClauses.push('listing.beds_count >= ?');
            values.push(beds_count_from);
        }
        if (beds_count_up_to) {
            whereClauses.push('listing.beds_count <= ?');
            values.push(beds_count_up_to);
        }
        if (price_per_night_from) {
            whereClauses.push('listing.price_per_night >= ?');
            values.push(price_per_night_from);
        }
        if (price_per_night_up_to) {
            whereClauses.push('listing.price_per_night <= ?');
            values.push(price_per_night_up_to);
        }

        if (amenities && amenities.length > 0) {
            whereClauses.push(`
            listing.id IN (
                SELECT listing_id
                FROM listing_amenities
                WHERE amenity_id IN (${amenities.map(() => '?').join(', ')})
                GROUP BY listing_id
                HAVING COUNT(DISTINCT amenity_id) = ?
            )
        `);
            values.push(...amenities, amenities.length);
        }

        let sql = `
            SELECT listing.*
            FROM ${this.table} listing
            WHERE ${whereClauses.join(' AND ')}
        `;

        if (sort_order) {
            if (sort_order === 'by price ascending') {
                sql += ' ORDER BY listing.price_per_night ASC';
            } else if (sort_order === 'by price descending') {
                sql += ' ORDER BY listing.price_per_night DESC';
            } else if (sort_order === 'by rating') {
                sql += ' ORDER BY listing.rating DESC';
            } else {
                sql += ' ORDER BY listing.created_at DESC';
            }
        }

        try {
            const [rows] = await this.db.execute(sql, values);
            return rows;
        } catch (error) {
            console.error('Error executing search query:', error);
            throw error;
        }
    }
}

export default Listing;
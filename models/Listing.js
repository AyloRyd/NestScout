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

        const whereClauses = [];
        const values = [];

        const addCondition = (condition, value) => {
            if (value !== undefined && value !== null && value !== '') {
                whereClauses.push(condition);
                values.push(value);
            }
        };

        addCondition('listing.city = ?', city);
        addCondition('listing.maximum_guests >= ?', guests_count);
        addCondition('listing.property_type = ?', property_type);
        addCondition('listing.rooms_count >= ?', rooms_count_from);
        addCondition('listing.rooms_count <= ?', rooms_count_up_to);
        addCondition('listing.beds_count >= ?', beds_count_from);
        addCondition('listing.beds_count <= ?', beds_count_up_to);
        addCondition('listing.price_per_night >= ?', price_per_night_from);
        addCondition('listing.price_per_night <= ?', price_per_night_up_to);

        if (check_in && check_out) {
            whereClauses.push(`
            NOT EXISTS (
                SELECT 1 
                FROM Bookings booking 
                WHERE booking.listing_id = listing.id 
                AND booking.check_in <= ? AND booking.check_out >= ?
            )
        `);
            values.push(check_in, check_out);
        }

        if (amenities && amenities.length > 0) {
            const placeholders = amenities.map(() => '?').join(', ');
            whereClauses.push(`
            listing.id IN (
                SELECT listing_id
                FROM listing_amenities
                WHERE amenity_id IN (${placeholders})
                GROUP BY listing_id
                HAVING COUNT(DISTINCT amenity_id) = ?
            )
        `);
            values.push(...amenities, amenities.length);
        }

        let sql = `
            SELECT listing.*
            FROM ${this.table} listing
            ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
        `;

        const sortOptions = {
            'by price ascending': 'listing.price_per_night ASC',
            'by price descending': 'listing.price_per_night DESC',
            'by creation date': 'listing.created_at DESC'
        };
        sql += ` ORDER BY ${sortOptions[sort_order] || 'listing.created_at DESC'}`;

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
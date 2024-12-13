import BaseModel from './BaseModel.js';

class Booking extends BaseModel {
    static table = 'bookings';

    static async hasOverlappingBookings(listing_id, check_in, check_out) {
        const query = `
            SELECT 1
            FROM ${this.table}
            WHERE listing_id = ?
              AND (check_in < ? AND check_out > ?)
            LIMIT 1
        `;
        const [rows] = await this.db.query(query, [listing_id, check_out, check_in]);
        return rows.length > 0;
    }

}

export default Booking;
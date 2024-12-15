import pool from '../db.js';

class Statistics {
    static async getHostStatistics(hostId) {
        const sql = `
            SELECT
                l.title AS listing_title,
                COALESCE(SUM(b.total_price), 0) AS total_earnings,
                COALESCE(COUNT(b.id), 0) AS total_bookings,
                COALESCE(AVG(DATEDIFF(b.check_out, b.check_in)), 0) AS avg_booking_duration
            FROM listings l
                     LEFT JOIN bookings b
                               ON l.id = b.listing_id AND b.status = 'Confirmed'
            WHERE l.host_id = ?
            GROUP BY l.id
            ORDER BY total_earnings DESC;
        `;
        const [rows] = await pool.query(sql, [hostId]);
        return rows;
    }

    static async getHostAggregateStatistics(hostId) {
        const sql = `
        SELECT
            COALESCE(SUM(b.total_price), 0) AS total_earnings,
            COALESCE(COUNT(b.id), 0) AS total_bookings,
            COALESCE(AVG(DATEDIFF(b.check_out, b.check_in)), 0) AS avg_booking_duration
        FROM listings l
        LEFT JOIN bookings b 
            ON l.id = b.listing_id AND b.status = 'Confirmed'
        WHERE l.host_id = ?
    `;
        const [rows] = await pool.query(sql, [hostId]);
        return rows[0];
    }

    static async getCityStatistics() {
        const sql = `
            SELECT
                l.city AS city,
                AVG(l.price_per_night) AS avg_price_per_night,
                COUNT(l.id) AS total_listings,
                COUNT(b.id) AS total_bookings
            FROM listings l
                     LEFT JOIN bookings b ON l.id = b.listing_id
            GROUP BY l.city
            ORDER BY total_bookings DESC;
        `;
        const [rows] = await pool.query(sql);
        return rows;
    }

    static async getAllHostsStatistics() {
        const sql = `
            SELECT
                CONCAT(u.first_name, ' ', u.last_name) AS host_name,
                COUNT(l.id) AS total_listings,
                SUM(b.total_price) AS total_earnings,
                AVG(DATEDIFF(b.check_out, b.check_in)) AS avg_booking_duration
            FROM users u
                     LEFT JOIN listings l ON u.id = l.host_id
                     LEFT JOIN bookings b ON l.id = b.listing_id
            WHERE b.status = 'Confirmed'
            GROUP BY u.id
            ORDER BY total_earnings DESC;
        `;
        const [rows] = await pool.query(sql);
        return rows;
    }

    static async getPropertyTypeStatistics() {
        const sql = `
            SELECT
                l.property_type AS property_type,
                AVG(l.price_per_night) AS avg_price_per_night,
                COUNT(b.id) AS total_bookings,
                SUM(b.total_price) AS total_earnings
            FROM listings l
                     LEFT JOIN bookings b ON l.id = b.listing_id
            WHERE b.status = 'Confirmed'
            GROUP BY l.property_type
            ORDER BY total_bookings DESC;
        `;
        const [rows] = await pool.query(sql);
        return rows;
    }
}

export default Statistics;

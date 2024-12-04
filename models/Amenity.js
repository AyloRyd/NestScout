import BaseModel from './BaseModel.js';

class Amenity extends BaseModel {
    static table = 'amenities';

    static async getAmenitiesByListingId(listingId) {
        try {
            const query = `
                SELECT amenities.name, amenities.icon_name
                FROM amenities
                JOIN listing_amenities ON amenities.id = listing_amenities.amenity_id
                WHERE listing_amenities.listing_id = ?
            `;

            const [rows] = await this.db.query(query, [listingId]);
            return rows;
        } catch (error) {
            console.error('Error in Listing.getAmenitiesByListingId:', error);
            throw error;
        }
    }
}

export default Amenity;
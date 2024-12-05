import BaseModel from './BaseModel.js';

class SavedListing extends BaseModel {
    static table = 'saved_listings';

    static async getSavedListingsByUserId(userId) {
        try {
            const savedEntries = await this.read({ user_id: userId });

            if (!savedEntries || savedEntries.length === 0) return [];

            const listingIds = savedEntries.map(entry => entry.listing_id);
            const placeholders = listingIds.map(() => '?').join(', ');

            const query = `
                SELECT * 
                FROM listings 
                WHERE id IN (${placeholders})`;

            const [listings] = await this.db.query(query, listingIds);
            return listings;
        } catch (error) {
            console.error('Error in SavedListing.getSavedListingsByUser:', error);
            throw error;
        }
    }
}

export default SavedListing;
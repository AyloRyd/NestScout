import BaseModel from './BaseModel.js';

class SavedListing extends BaseModel {
    static table = 'saved_listings';

    static async fetchListingsBySavedEntries(savedEntries) {
        if (!savedEntries || savedEntries.length === 0) return [];

        const listingIds = savedEntries.map(entry => entry.listing_id);
        const placeholders = listingIds.map(() => '?').join(', ');

        const query = `
            SELECT * 
            FROM listings 
            WHERE id IN (${placeholders})`;

        const [listings] = await this.db.query(query, listingIds);
        return listings;
    }
}

export default SavedListing;

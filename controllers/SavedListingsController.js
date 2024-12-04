import SavedListing from '../models/SavedListing.js';

class SavedListingsController {
    static async addSavedListing(req, res, next) {
        const { userId, listingId } = req.body;

        try {
            const savedListing = await SavedListing.create({ user_id: userId, listing_id: listingId });
            res.status(200).json({ message: 'Listing saved successfully!', data: savedListing });
        } catch (error) {
            console.error('Error saving listing:', error);
            res.status(500).json({ message: 'Failed to save listing.' });
        }
    }

    static async removeSavedListing(req, res, next) {
        const { userId, listingId } = req.body;

        try {
            const result = await SavedListing.delete({ user_id: userId, listing_id: listingId });
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Saved listing not found.' });
            }
            res.status(200).json({ message: 'Listing removed from saved list.' });
        } catch (error) {
            console.error('Error removing saved listing:', error);
            res.status(500).json({ message: 'Failed to remove listing.' });
        }
    }

    static async getSavedListings(req, res, next) {
        const { userId } = req.params;

        try {
            const savedEntries = await SavedListing.read({ user_id: userId });
            const listings = await SavedListing.fetchListingsBySavedEntries(savedEntries);
            res.render('listings/found-listings', {
                title: `NestScout | Saved listings`,
                listings,
                check_in: '',
                check_out: '',
                nights: '',
                guests_count: ''
            });
        } catch (error) {
            console.error('Error fetching saved listings:', error);
            res.status(500).json({ message: 'Failed to fetch saved listings.' });
        }
    }
}

export default SavedListingsController;
import SavedListing from '../models/SavedListing.js';
import Listing from '../models/Listing.js';

class SavedListingsController {
    static async addSavedListing(req, res) {
        const { userId, listingId } = req.body;

        try {
            const savedListing = await SavedListing.create({
                data: {
                    user_id: userId,
                    listing_id: listingId
                }
            });
            res.status(200).json({ message: 'Listing saved successfully!', data: savedListing });
        } catch (error) {
            console.error('Error saving listing:', error);
            res.status(500).json({ message: 'Failed to save listing.' });
        }
    }

    static async removeSavedListing(req, res) {
        console.log(req.body);
        const { userId, listingId } = req.body;

        try {
            const result = await SavedListing.delete({
                where: {
                    user_id: userId,
                    listing_id: listingId
                }
            });
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Saved listing not found.' });
            }
            res.status(200).json({ message: 'Listing removed from saved list.' });
        } catch (error) {
            console.error('Error removing saved listing:', error);
            res.status(500).json({ message: 'Failed to remove listing.' });
        }
    }

    static async getSavedListings(req, res) {
        const { userId } = req.params;

        try {
            const savedListings = await SavedListing.read({ where: { user_id: userId } });

            const listingIds = savedListings.length > 0
                ? savedListings.map(savedListing => savedListing.listing_id)
                : [];

            const listings = listingIds.length > 0
                ? await Promise.all(
                    listingIds.map(async id => {
                        const [listing] = await Listing.read({ where: { id } });
                        return listing;
                    })
                ).then(results => results.filter(Boolean))
                : [];

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
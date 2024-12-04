import Listing from '../models/Listing.js';
import Amenity from '../models/Amenity.js';
import SavedListing from '../models/SavedListing.js';

class ListingsController {
    static async search(req, res) {
        try {
            const { city, check_in, check_out, guests_count } = req.query;
            if (!city || !check_in || !check_out || !guests_count) {
                return res.status(400).send('Missing required search parameters.');
            }

            const listings = await Listing.search(city, check_in, check_out, guests_count);
            const nights = (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24);
            res.render('listings/found-listings', {
                title: `NestScout | ${city}`,
                listings,
                check_in,
                check_out,
                nights,
                guests_count
            });
        } catch (error) {
            console.error('Error in ListingsController.search:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getListingPage(req, res) {
        try {
            const [listing] = await Listing.read({ id: req.params.id });
            if (!listing) {
                return res.status(404).send('Listing not found');
            }
            listing.amenities = await Amenity.getAmenitiesByListingId(req.params.id);
            const isSaved = await SavedListing.read({
                user_id: req.session.user.id,
                listing_id: req.params.id,
            });
            res.render('listings/listing-page', {
                title: `NestScout | ${listing.title}`,
                listing,
                check_in: req.query.check_in,
                check_out: req.query.check_out,
                nights: req.query.nights,
                guests_count: req.query.guests_count,
                amenitiesFullList: await Amenity.read(),
                isSaved: isSaved.length > 0
            });
        } catch (error) {
            console.error('Error in ListingsController.getListingPage:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

export default ListingsController;
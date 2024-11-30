import Listing from '../models/listing.js';

class ListingsController {
    static async search(req, res) {
        try {
            const { city, check_in, check_out, guests_count } = req.query;
            if (!city || !check_in || !check_out || !guests_count) {
                return res.status(400).send('Missing required search parameters.');
            }

            const listings = await Listing.search(city, check_in, check_out, guests_count);
            const nights = (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24);
            res.render('listings', {
                title: `NestScout | ${city}`,
                listings,
                nights
            });
        } catch (error) {
            console.error('Error in ListingsController.search:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

export default ListingsController;
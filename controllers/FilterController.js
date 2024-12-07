import Amenity from '../models/Amenity.js';

class FilterController {
    static async getFilterPage(req, res) {
        try {
            const {
                city,
                check_in,
                check_out,
                guests_count,
                property_type,
                rooms_count_from,
                rooms_count_up_to,
                beds_count_from,
                beds_count_up_to,
                price_per_night_from,
                price_per_night_up_to,
                sort_order,
                amenities } = req.query;

            const allAmenities = await Amenity.read();

            const selectedAmenities = amenities ? amenities.split(',') : [];

            res.render('listings/filter-page', {
                title: 'NestScout | Filter listings',
                city,
                check_in,
                check_out,
                guests_count,
                property_type,
                rooms_count_from,
                rooms_count_up_to,
                beds_count_from,
                beds_count_up_to,
                price_per_night_from,
                price_per_night_up_to,
                sort_order,
                allAmenities,
                selectedAmenities
            });
        } catch (error) {
            console.error('Error fetching amenities:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

export default FilterController;
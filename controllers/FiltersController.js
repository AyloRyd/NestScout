import Amenity from '../models/Amenity.js';
import SavedSearch from '../models/SavedSearch.js';
import SavedSearchAmenities from "../models/SavedSearchAmenities.js";

class FiltersController {
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
                // title: 'NestScout | Filter listings',
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

    static async saveFilter(user_id, query) {
        const {
            city,
            check_in,
            check_out,
            guests_count,
            amenities,
            property_type,
            rooms_count_from,
            rooms_count_up_to,
            beds_count_from,
            beds_count_up_to,
            price_per_night_from,
            price_per_night_up_to,
            sort_order
        } = query;

        const lastSavedSearches = await SavedSearch.read({
            where: { user_id },
            limit: 3,
            orderBy: 'created_at DESC'
        });

        const savedSearchData = {
            user_id,
            city,
            check_in,
            check_out,
            guests_count,
            property_type: property_type || null,
            rooms_count_from: rooms_count_from || null,
            rooms_count_up_to: rooms_count_up_to || null,
            beds_count_from: beds_count_from || null,
            beds_count_up_to: beds_count_up_to || null,
            price_per_night_from: price_per_night_from || null,
            price_per_night_up_to: price_per_night_up_to || null,
            sort_order: sort_order || 'by creation date',
            created_at: new Date()
        };

        const matchingSearch = lastSavedSearches.find(search =>
            search.city === city &&
            search.check_in.toLocaleDateString('en-CA') === check_in &&
            search.check_out.toLocaleDateString('en-CA') === check_out
        );

        if (matchingSearch) {
            await SavedSearch.update({
                data: savedSearchData,
                where: { id: matchingSearch.id }
            });

            await SavedSearchAmenities.delete({
                where: { saved_search_id: matchingSearch.id }
            });

            if (amenities && amenities.length > 0) {
                for (const amenityId of amenities.split(',').map(id => parseInt(id))) {
                    await SavedSearchAmenities.create({
                        data: {
                            saved_search_id: matchingSearch.id,
                            amenity_id: amenityId
                        }
                    });
                }
            }
        } else {
            const newSavedSearch = await SavedSearch.create({ data: savedSearchData });

            if (amenities && amenities.length > 0) {
                for (const amenityId of amenities.split(',').map(id => parseInt(id))) {
                    await SavedSearchAmenities.create({
                        data:{
                            saved_search_id: newSavedSearch.id,
                            amenity_id: amenityId
                        }
                    });
                }
            }
        }
    }
}

export default FiltersController;
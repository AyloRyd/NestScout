import SavedSearch from "../models/SavedSearch.js";
import SavedSearchAmenities from "../models/SavedSearchAmenities.js";

class IndexController {
    static async getIndexPage(req, res) {
        let savedSearches;
        if (req.session.isLoggedIn) {
            savedSearches = await SavedSearch.read(
                { user_id: req.session.user.id },
                3,
                'created_at DESC'
            );

            for (const search of savedSearches) {
                const amenities = await SavedSearchAmenities.read({ saved_search_id: search.id });
                search.amenities = amenities.map(amenity => amenity.amenity_id);
            }
        }

        res.render('index', {
            layout: 'layout',
            title: 'NestScout | Find your nest now!',
            savedSearches
        });
    }
}

export default IndexController;
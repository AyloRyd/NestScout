import Listing from '../models/Listing.js';
import Amenity from '../models/Amenity.js';
import SavedListing from '../models/SavedListing.js';
import ListingAmenities from '../models/ListingAmenities.js';

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

            const listingAmenities = await ListingAmenities.read({ listing_id: req.params.id });
            listing.amenities = listingAmenities.map(item => item.amenity_id);

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
                isSaved: isSaved.length > 0,
            });
        } catch (error) {
            console.error('Error in ListingsController.getListingPage:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getListingCreatingPage(req, res) {
        res.render('listings/create', {
            title: 'NestScout | Create listing',
            amenities: await Amenity.read(),
        });
    }

    static async createListing(req, res) {
        const { title, description, price_per_night, country, city, postal_code, street, house_number, property_type, etage, area, rooms_count, beds_count, maximum_guests } = req.body;

        const amenities = req.body['amenities[]'] ? req.body['amenities[]'].split(',').map(id => parseInt(id)) : [];

        try {
            const newListing = await Listing.create({
                host_id: req.session.user.id,
                title,
                description,
                price_per_night,
                country,
                city,
                postal_code,
                street,
                house_number,
                property_type,
                etage: etage === '' ? null : etage,
                area: area === '' ? null : area,
                rooms_count,
                beds_count,
                maximum_guests
            });

            if (amenities.length > 0) {
                for (const amenityId of amenities) {
                    await ListingAmenities.create({ listing_id: newListing.id, amenity_id: amenityId });
                }
            }

            res.redirect(`/listings/${newListing.id}`);
        } catch (error) {
            console.error('Error creating listing:', error);
            res.status(500).json({ message: 'Failed to create listing.' });
        }
    }

    static async getListingEditingPage(req, res) {
        try {
            const { id } = req.params;

            const [listing] = await Listing.read({ id });
            if (!listing) {
                return res.status(404).send('Listing not found');
            }

            const amenities = await Amenity.read();

            const listingAmenities = await ListingAmenities.read({ listing_id: id });
            const listingAmenityIds = listingAmenities.map(item => item.amenity_id);

            res.render('listings/edit', {
                title: `NestScout | Edit listing`,
                listing,
                amenities,
                listingAmenityIds,
            });
        } catch (error) {
            console.error('Error in ListingsController.getListingEditingPage:', error);
            res.status(500).send('Server Error');
        }
    }

    static async updateListing(req, res) {
        try {
            const { id } = req.params;
            const { title, description, price_per_night, rooms_count, beds_count, maximum_guests } = req.body;

            const amenities = req.body['amenities[]'] ? req.body['amenities[]'].split(',').map(id => parseInt(id)) : [];

            const updatedData = {
                title,
                description,
                price_per_night,
                rooms_count,
                beds_count,
                maximum_guests
            };

            await Listing.update(updatedData, { id });
            if (amenities && Array.isArray(amenities)) {
                await ListingAmenities.delete({ listing_id: id });

                for (const amenityId of amenities) {
                    await ListingAmenities.create({ listing_id: id, amenity_id: amenityId });
                }
            }

            res.redirect(`/listings/${id}`);
        } catch (error) {
            console.error('Error in ListingsController.updateListing:', error);
            res.status(500).send('Server Error');
        }
    }
}

export default ListingsController;
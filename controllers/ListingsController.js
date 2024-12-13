import fs from 'fs';
import path from 'path';

import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Amenity from '../models/Amenity.js';
import SavedListing from '../models/SavedListing.js';
import ListingAmenities from '../models/ListingAmenities.js';

import FiltersController from './FiltersController.js';

class ListingsController {
    static async search(req, res) {
        try {
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
            } = req.query;

            if (!city || !check_in || !check_out || !guests_count) {
                return res.status(400).send('Missing required search parameters.');
            }

            const listings = await Listing.search({
                city,
                check_in,
                check_out,
                guests_count,
                amenities: amenities ? amenities.split(',').map(id => parseInt(id)) : [],
                property_type,
                rooms_count_from,
                rooms_count_up_to,
                beds_count_from,
                beds_count_up_to,
                price_per_night_from,
                price_per_night_up_to,
                sort_order
            });

            if (req.session.isLoggedIn) {
                await FiltersController.saveFilter(req.session.user.id, req.query);
            }

            const additionalFiltersApplied = !!(
                (amenities && amenities !== '') ||
                (property_type && property_type !== '') ||
                (rooms_count_from && rooms_count_from !== '') ||
                (rooms_count_up_to && rooms_count_up_to !== '') ||
                (beds_count_from && beds_count_from !== '') ||
                (beds_count_up_to && beds_count_up_to !== '') ||
                (price_per_night_from && price_per_night_from !== '') ||
                (price_per_night_up_to && price_per_night_up_to !== '') ||
                (sort_order && sort_order !== 'by creation date')
            );

            res.render('listings/found-listings', {
                title: `NestScout | ${city}`,
                showFilterButton: true,
                listings,
                city,
                check_in,
                check_out,
                guests_count,
                amenities: amenities ? amenities.split(',').map(id => parseInt(id)) : [],
                property_type,
                rooms_count_from,
                rooms_count_up_to,
                beds_count_from,
                beds_count_up_to,
                price_per_night_from,
                price_per_night_up_to,
                sort_order,
                nights: (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24),
                additionalFiltersApplied,
            });
        } catch (error) {
            console.error('Error in ListingsController.search:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getListingPage(req, res, additionalData = {}) {
        try {
            const [listing] = await Listing.read({ where: { id: req.params.id || additionalData.listing_id } });
            if (!listing) {
                return res.status(404).send('Listing not found');
            }

            const listingAmenities = await ListingAmenities.read({
                where: { listing_id: listing.id }
            });
            listing.amenities = listingAmenities.map(item => item.amenity_id);

            const isSaved = await SavedListing.read({
                where: {
                    user_id: req.session.user.id,
                    listing_id: listing.id
                }
            });

            const [host] = await User.read({ where: { id: listing.host_id } });

            const imagesFolder = listing.path_to_images_folder || '';
            let imagePaths = [];
            if (fs.existsSync(imagesFolder)) {
                imagePaths = fs.readdirSync(imagesFolder).map(file => `/storage/listings-images/${listing.id}/${file}`);
            }

            res.render('listings/listing-page', {
                title: `NestScout | ${listing.title}`,
                listing,
                host,
                check_in: req.query.check_in || additionalData.check_in || '',
                check_out: req.query.check_out || additionalData.check_out || '',
                nights: req.query.nights || additionalData.nights || NaN,
                guests_count: req.query.guests_count || additionalData.guests_count || '',
                amenitiesFullList: await Amenity.read(),
                isSaved: isSaved.length > 0,
                imagePaths,
                ...additionalData
            });
        } catch (error) {
            console.error('Error rendering listing page:', error);
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
        const {
            title,
            description,
            price_per_night,
            country,
            city,
            postal_code,
            street,
            house_number,
            property_type,
            floor,
            area,
            rooms_count,
            beds_count,
            maximum_guests
        } = req.body;

        const amenities = req.body.amenities ? req.body.amenities.split(',').map(id => parseInt(id)) : [];

        try {
            const newListing = await Listing.create({
                data: {
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
                    floor: floor === '' ? null : floor,
                    area: area === '' ? null : area,
                    rooms_count,
                    beds_count,
                    maximum_guests
                }
            });

            const imagesFolderPath = path.join('storage', 'listings-images', `${newListing.id}`);
            if (!fs.existsSync(imagesFolderPath)) {
                fs.mkdirSync(imagesFolderPath, { recursive: true });
            }

            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    const targetPath = path.join(imagesFolderPath, file.originalname);
                    fs.renameSync(file.path, targetPath);
                });

                fs.rm('uploads', { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error(`Failed to remove temporary folder: uploads`, err);
                    } else {
                        console.log(`Temporary folder removed: uploads`);
                    }
                });
            }

            await Listing.update({
                    data: { path_to_images_folder: imagesFolderPath },
                    where: { id: newListing.id }
            });

            if (amenities.length > 0) {
                for (const amenityId of amenities) {
                    await ListingAmenities.create({
                        data: {
                            listing_id: newListing.id,
                            amenity_id: amenityId
                        }
                    });
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

            const [listing] = await Listing.read({ where: { id } });
            if (!listing) {
                return res.status(404).send('Listing not found');
            }

            const amenities = await Amenity.read();

            const listingAmenities = await ListingAmenities.read({ where: { listing_id: id } });
            const listingAmenityIds = listingAmenities.map(item => item.amenity_id);

            const imagesFolder = listing.path_to_images_folder || '';
            let imagePaths = [];
            if (fs.existsSync(imagesFolder)) {
                imagePaths = fs.readdirSync(imagesFolder).map(file => `/storage/listings-images/${listing.id}/${file}`);
            }

            res.render('listings/edit', {
                title: `NestScout | Edit listing`,
                listing,
                amenities,
                listingAmenityIds,
                imagePaths
            });
        } catch (error) {
            console.error('Error in ListingsController.getListingEditingPage:', error);
            res.status(500).send('Server Error');
        }
    }

    static async updateListing(req, res) {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                price_per_night,
                rooms_count,
                beds_count,
                maximum_guests
            } = req.body;

            const amenities = req.body.amenities ? req.body.amenities.split(',').map(id => parseInt(id)) : [];

            const updatedData = {
                title,
                description,
                price_per_night,
                rooms_count,
                beds_count,
                maximum_guests
            };

            await Listing.update({ data: updatedData, where: { id } });

            if (amenities && Array.isArray(amenities)) {
                await ListingAmenities.delete({ where: { listing_id: id } });

                for (const amenityId of amenities) {
                    await ListingAmenities.create({ data: { listing_id: id, amenity_id: amenityId } });
                }
            }

            const imagesFolderPath = path.join('storage', 'listings-images', `${id}`);
            const existingImages = req.body.existingImages
                ? JSON.parse(req.body.existingImages).map(fullPath => path.basename(fullPath))
                : [];

            if (!fs.existsSync(imagesFolderPath)) {
                fs.mkdirSync(imagesFolderPath, { recursive: true });
            }

            const currentImages = fs.readdirSync(imagesFolderPath);

            currentImages.forEach(file => {
                if (!existingImages.includes(file)) {
                    const filePath = path.join(imagesFolderPath, file);
                    fs.unlinkSync(filePath);
                }
            });


            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    const targetPath = path.join(imagesFolderPath, file.originalname);
                    fs.renameSync(file.path, targetPath);
                });
            }

            const uploadFolderPath = path.join(process.cwd(), 'uploads');
            fs.readdir(uploadFolderPath, (err, files) => {
                if (err) {
                    console.error(`Failed to read temporary folder: ${uploadFolderPath}`, err);
                    return;
                }

                files.forEach(file => {
                    const filePath = path.join(uploadFolderPath, file);
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(`Failed to delete file: ${filePath}`, err);
                        } else {
                            console.log(`Deleted file: ${filePath}`);
                        }
                    });
                });
            });


            res.redirect(`/listings/${id}`);
        } catch (error) {
            console.error('Error in ListingsController.updateListing:', error);
            res.status(500).send('Server Error');
        }
    }
}

export default ListingsController;
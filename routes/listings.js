import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import FiltersController from '../controllers/FiltersController.js';
import SavedListingsController from '../controllers/SavedListingsController.js';
import ListingsController from '../controllers/ListingsController.js';

const router = Router();

const uploadPath = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    limits: { files: 5 }
});

router.get('/search', ListingsController.search);

router.get('/create', ListingsController.getListingCreatingPage);

router.post('/create', upload.array('images', 5), ListingsController.createListing);

router.get('/edit/:id', ListingsController.getListingEditingPage);

router.post('/edit/:id', upload.array('images', 5), ListingsController.updateListing);

router.post('/save', SavedListingsController.addSavedListing);

router.delete('/saved-listings/remove', SavedListingsController.removeSavedListing);

router.get('/saved-listings/:userId', SavedListingsController.getSavedListings);

router.get('/filter', FiltersController.getFilterPage);

router.get('/:id', ListingsController.getListingPage)

export default router;
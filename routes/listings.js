import { Router } from 'express';

import ListingsController from '../controllers/ListingsController.js';
import SavedListingsController from "../controllers/SavedListingsController.js";
import FilterController from "../controllers/FilterController.js";

const router = Router();

router.get('/search', ListingsController.search);

router.get('/create', ListingsController.getListingCreatingPage);

router.post('/create', ListingsController.createListing);

router.get('/edit/:id', ListingsController.getListingEditingPage);

router.post('/edit/:id', ListingsController.updateListing);

router.post('/save', SavedListingsController.addSavedListing);

router.delete('/saved-listings/remove', SavedListingsController.removeSavedListing);

router.get('/saved-listings/:userId', SavedListingsController.getSavedListings);

router.get('/filter', FilterController.getFilterPage);

router.get('/:id', ListingsController.getListingPage)

export default router;
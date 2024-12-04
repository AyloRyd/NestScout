import { Router } from 'express';

import SavedListingsController from '../controllers/SavedListingsController.js';

const router = Router();

router.post('/save', SavedListingsController.addSavedListing);

router.delete('/remove', SavedListingsController.removeSavedListing);

router.get('/all-listings/:userId', SavedListingsController.getSavedListings);

export default router;
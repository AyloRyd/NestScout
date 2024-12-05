import express from 'express';
import ListingsController from '../controllers/ListingsController.js';

const router = express.Router();

router.get('/search', ListingsController.search);

router.get('/create', ListingsController.getListingCreatingPage);

router.post('/create', ListingsController.createListing);

router.get('/:id', ListingsController.getListingPage)

router.get('/edit/:id', ListingsController.getListingEditingPage);

router.put('/edit/:id', ListingsController.updateListing);

export default router;
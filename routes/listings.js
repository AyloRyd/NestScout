import express from 'express';
import ListingsController from '../controllers/ListingsController.js';

const router = express.Router();

router.get('/search', ListingsController.search);

router.get('/:id', ListingsController.getListingPage)

export default router;
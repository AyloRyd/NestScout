import express from 'express';
import ListingsController from '../controllers/listings.js';

const router = express.Router();

router.get('/search', ListingsController.search);

export default router;
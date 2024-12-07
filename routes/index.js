import { Router } from 'express';

import IndexController from '../controllers/IndexController.js';

const router = Router();

router.get('/', IndexController.getIndexPage);

export default router;
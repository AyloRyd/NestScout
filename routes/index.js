import { Router } from 'express';
const router = Router();

router.get('/', function(req, res, next) {
  res.render('index', {
    layout: 'layout',
    title: 'NestScout | Find your nest now!'
  });
});

export default router;
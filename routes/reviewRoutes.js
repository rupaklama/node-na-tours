const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({
  // to get access of Tour router url 'params' in this reviewRouter
  // .route('/:tourId/reviews')
  mergeParams: true,
});

// note: all the routes after this middleware are protected routes now
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
  .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;

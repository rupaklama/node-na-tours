const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({
  // to get access of Tour router url 'params' in this reviewRouter
  // .route('/:tourId/reviews')
  mergeParams: true,
});

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;

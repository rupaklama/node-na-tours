const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// note: Nested Routes
// router
//   .route('/:tourId/reviews')
//   .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

// note: Creating nested routes like above with 'mergeParams' feature to share current url 'params' to next router
// This tour router should use review router when - '/:tourId/reviews'
router.use('/:tourId/reviews', reviewRouter);

// router.get('/api/v1/tours', getAllTours);
// router.route('/api/v1/tours').get(getAllTours); SAME AS ABOVE

// note - Aliasing - assigning optional name for a popular api route
// Need to create a middleware to do this in tourController
router
  .route('/top-5-cheap')
  // chaining getAllTours with our middleware endpoint
  .get(tourController.aliasTopTours, tourController.getAllTours);

// Aggregate data endpoints
router.route('/tour-stats').get(tourController.getTourStats);
// router.route('/monthly-tours/:year').get(tourController.getMonthlyTours);

router.route('/').get(authController.protect, tourController.getAllTours).post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;

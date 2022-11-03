const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

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
router.route('/monthly-tours/:year').get(tourController.getMonthlyTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

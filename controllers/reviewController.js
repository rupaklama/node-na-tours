const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  // route('/:id') - console.log(req.params);
  const review = await Review.findById(req.params.id);
  // same as above with filter object
  // const review = await Review.findOne({ _id: req.params.id });

  // review is null
  if (!review) {
    return next(new AppError('No review found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  // id with req.body to update our data
  // third arg is option object
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    // this will make sure the new updated document is the one that gets return
    // true to return the modified document rather than the original. defaults to false
    new: true,
    // to validate data against our schema
    runValidators: true,
  });

  if (!review) {
    return next(new AppError('No review found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that Id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

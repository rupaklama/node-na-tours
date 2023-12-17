const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });

  next();
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync((req, res, next) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' https://cdnjs.cloudflare.com")
    .render('login', {
      title: 'Log into your account',
    });
});

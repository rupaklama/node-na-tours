const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

// Reusable Class Module APIs
const APIFeatures = require('./../utils/apiFeatures');

// memoryStorage - store files in memory as Buffer objects
const multerStorage = multer.memoryStorage();

const errorOutputFn = () => {
  const err = new Error('Not an image. Please upload only images.');
  err.status = 'fail';
  err.statusCode = 400;
  return err;
};

// to filter out if the uploaded file is an image type
const multerFilter = (req, file, cb) => {
  // if image type file, pass 'true' to cb else false
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // cb(new Error('Not an image. Please upload only images.'), false);
    cb(errorOutputFn(), false);
  }
};

// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//  processes multiple files associated with the given form fields
exports.uploadTourImages =
  // upload.array('images', 5) - only on having one field
  upload.fields([
    // objects describing multipart form fields to process
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // req.files since processing multiple uploaded files
  // console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  // 1. Cover image to be 3:2 ratio resize size
  // Upload in our server
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer) // image buffer data
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  // Add into req.body object to update the name in db
  req.body.imageCover = imageCoverFilename;

  // 2. Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// note - Creating an alias route for popular endpoint like '/tours/top-5-cheap'
// note - this will run before below endpoints
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  // incase the items have save ratingsAverage then sort also by price
  req.query.sort = '-ratingsAverage,price';
  // fields we want
  // req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // try {
  // accessing query params
  console.log('Request Body:', req.query);

  // Creates a find query: gets a list of documents that match filter
  // FIRST WAY TO QUERY USING FILTER OBJECT
  // note - using filter object inside method to query
  // const tours = await Tour.find({
  //   duration: 5,
  //   difficulty: 'easy',
  // });

  // 1. BUILD QUERY - filtering
  // const queryObj = { ...req.query };

  // to ignore these fields from the query object
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];

  // to delete or ignore above fields if they are present in our query object to avoid issues
  // excludedFields.forEach((el) => delete queryObj[el]);

  // step 1 is to apply all queries
  // const query = Tour.find(queryObj).filter().sort()

  // step 2 - execute query at the end with await to send a response object
  // const testTours = await query;

  // NOTE -  SECOND WAY TO QUERY WITH MONGOOSE METHODS
  // API Query object - Query.prototype.sort()
  // 2. Execute QUERY
  // Args - schema query `Model.find()`, queryString
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

  // note - apply await at the end result of final query
  // note - all the queries are store in this prop variable in class
  const tours = await features.query;
  // const tours = await query;

  // 3. SEND RESPONSE
  res.status(200).json({
    status: 'success',
    // requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
});

//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

exports.getTour = catchAsync(async (req, res, next) => {
  // route('/:id') - console.log(req.params);
  // populate() is to fill up with actual data from related documents through child referencing
  // .populate('guides') - populate with guide documents & best place to add it in Query Middleware for performance
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // same as above with filter object
  // const tour = await Tour.findOne({ _id: req.params.id });

  // tour is null
  if (!tour) {
    return next(new AppError('No tour found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // to create a document
  // const newTour = new Tour({});
  // newTour.save();

  // note - instead of doing above
  // Accessing Create method directly of Modal class
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // id with req.body to update our data
  // third arg is option object
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    // this will make sure the new updated document is the one that gets return
    // true to return the modified document rather than the original. defaults to false
    new: true,
    // to validate data against our schema
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that Id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 Aggregation is a way of processing a large number of documents in a collection by means of passing them through different stages. The stages make up what is known as a pipeline. The stages in a pipeline can filter, sort, group, reshape and modify documents that pass through the pipeline
 */

// Aggregation function
exports.getTourStats = catchAsync(async (req, res, next) => {
  // note - this pipeline is a mongoDB feature but mongoose give us access to mongodb aggregation
  // using aggregation is doing a regular query to manipulate data in couple of steps - array of stages
  const stats = await Tour.aggregate([
    // defining stages - https://www.mongodb.com/docs/manual/meta/aggregation-quick-reference/

    // note - each of the stages is an Object, first object is first stage
    {
      // first stage
      // $match uses standard MongoDB queries to filter the documents
      // ratingsAverage should be greater than or equal to
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      // second stage is to query based on average values of fields for all our tours
      // it allows us to group documents together using accumulator - calculated value
      $group: {
        // displaying stats based on 'difficulty' field
        _id: { $toUpper: '$difficulty' },

        // adding numTours field to store documents count
        numTours: { $sum: 1 },

        numRatings: { $sum: '$ratingsQuantity' },

        // calculating average rating with Mongodb Operator
        // $avg - mongoDB operator returns the average value of the numeric values
        // have to use '$'ratingsAverage in mongoDB to query by ratingsAverage field
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    // to sort the response by avgPrice field & 1 is to display by ascending
    {
      $sort: { avgPrice: 1 },
    },

    // NOTE - we can also REPEAT STAGES using 'match' to filter out again
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);

  // sending response in our new route - route('/tour-stats').get(tourController.getTourStats);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.errmsg,
//     });
//   }
// };

// route('/monthly-tours/:year').get(tourController.getMonthlyTours);
// This is to count how many tours in a month for the given year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      // $unwind - Deconstructs an array field from the input documents to output a document for each element
      // Creating SINGLE Document object from each dates in the array
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          // between first & last day of the year
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // it allows us to group documents together using accumulator - calculated value
      $group: {
        // $month operator Returns the month of a date as a number between 1 and 12
        _id: { $month: '$startDates' }, // 1 or 7 or 3

        // adding variable to store count tours, update count by 1
        numTourStarts: { $sum: 1 },

        // which tours
        // $push is to create an array with tour names
        tours: { $push: '$name' },
      },
    },
    {
      // to add field
      $addFields: { month: '$_id' },
    },
    {
      // $project is to get rid of the field, it can also add, reset etc
      $project: {
        // 0 is to hide this field
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 }, // descending
    },
    {
      // display 12 items
      $limit: 12,
    },
  ]);

  // sending response
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

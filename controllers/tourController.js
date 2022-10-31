const Tour = require('../models/tourModel');

// Reusable Class Module APIs
const APIFeatures = require('./../utils/apiFeatures');

// alias middleware to rename api endpoint
// note - this will run before below endpoints
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  // fields we want
  // req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
    // Query object - Query.prototype.sort()
    // 2. Execute QUERY
    // accessing class methods with query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // route('/:id') - console.log(req.params);
    const tour = await Tour.findById(req.params.id);
    // same as above with filter object
    // const tour = await Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // id with req.body to update our data
    // third arg is option object
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // this will make sure the new updated document is the one that gets return
      // true to return the modified document rather than the original. defaults to false
      new: true,
      // to validate data against our schema
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid data sent',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

/**
 Aggregation is a way of processing a large number of documents in a collection by means of passing them through different stages. The stages make up what is known as a pipeline. The stages in a pipeline can filter, sort, group, reshape and modify documents that pass through the pipeline
 */

// Aggregation function
exports.getTourStats = async (req, res) => {
  try {
    // note - mongoose give us access to mongodb aggregation
    // using aggregation is doing a regular query to manipulate data in couple of steps - array of stages
    const stats = await Tour.aggregate([
      // defining stages - https://www.mongodb.com/docs/manual/meta/aggregation-quick-reference/

      {
        // note - each of the stages is an Object

        // first stage
        // ratingsAverage should be greater than or equal to
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        // second stage
        // it allows us to group document together using accumulator - calculated value
        $group: {
          // creating new query object for new query api endpoint
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },

          // calculating average rating with Mongodb Operator
          // $avg - returns the average value of the numeric values
          //$ratingsAverage by ratingsAverage field
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },

      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.errmsg,
    });
  }
};

const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // accessing query params
    // console.log(req.query);

    // 1. BUILD QUERY
    const queryObj = { ...req.query };

    // to ignore these fields from the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // delete operator removes a property from an object
    excludedFields.forEach((el) => delete queryObj[el]);

    // Creates a find query: gets a list of documents that match filter

    // note - using filter object inside method
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    // note - req.query is same as pass abject above { duration: '5', difficulty: 'easy' }
    // simple filter with query params
    const query = Tour.find(queryObj);

    // note - other method is by chaining methods, same as above with Mongoose methods
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // 2. Execute QUERY
    // note - apply await at the end result of final query
    const tours = await query;

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

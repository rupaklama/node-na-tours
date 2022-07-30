const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // Creates a find query: gets a list of documents that match filter
    const tours = await Tour.find();

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

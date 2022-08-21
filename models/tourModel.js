const mongoose = require('mongoose');

// basic schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    // validator
    // note - an error to display when missing this field with an array
    required: [true, 'A tour must have a name'],
    // to be unique
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    // enum: {
    //   values: ['easy', 'medium', 'difficult'],
    //   message: 'Difficulty is either: easy, medium, difficult',
    // },
  },
  ratingsAverage: {
    type: Number,
    // to set default value
    default: 4.5,
    // min: [1, 'Rating must be above 1.0'],
    // max: [5, 'Rating must be below 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     // this only points to current doc on NEW document creation
    //     return val < this.price;
    //   },
    //   message: 'Discount price ({VALUE}) should be below regular price',
    // },
  },
  summary: {
    type: String,
    // to remove white spaces in start and end
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  // array of strings
  images: [String],
  createdAt: {
    // javascript built in data type - Date object
    type: Date,
    // To get a current Timestamp of right now
    // In mongoose, this will be immediately converted to current date
    default: Date.now(),
    select: false, // hide this field
  },
  startDates: [Date],
  // secretTour: {
  //   type: Boolean,
  //   default: false,
  // },
});

// convention to always use uppercase for Modal Names & related variables
// telling mongoose to create new model class instance - Tour
// first arg - name of the collection & second arg - name of the the Schema, data model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
  },
  // second arg is Option Object

  // Virtuals are document properties that you can get and set in our Schema
  // but that do not get persisted/registered to MongoDB or database to save some memory space.
  // Mostly use to create some utility operations on our schema
  // NOTE - The Virtual Property can't be use in a Query since it is not part of a database

  {
    // Each time data is send back as a json, we want virtuals to be true
    // Basically, this is to include virtuals in the response as a JSON data
    toJSON: { virtuals: true },
    // response data to be an object
    toObject: { virtuals: true },
  }
);

// Creating Virtual Property named 'durationWeeks' in the output response
// Need to define get method because this virtual property will get created each time we get data from db - getter
// reviewSchema.virtual('durationWeeks').get(function () {});

// PreFind hook is a middleware executed before any Find Query is executed
// /^find/ - regular expression to execute all kinds of Find Queries, strings start with 'find'
// note: This will apply automatically in all Find Queries eg. findAll, find etc
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   // to display tour documents
  //   path: 'tour',
  //   // select only tour names to display
  //   select: 'name',
  // })
  //   // to display user documents, chaining here
  //   .populate({
  //     path: 'user',
  //     // select name & photo only
  //     select: 'name photo',
  //   });

  this
    // to display user documents, chaining here
    .populate({
      path: 'user',
      // select name & photo only
      select: 'name photo',
    });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

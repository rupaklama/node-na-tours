const mongoose = require('mongoose');
const slugify = require('slugify');

// basic schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // validator
      // note - an error to display when missing this field with an array
      required: [true, 'A tour must have a name'],
      // to be unique
      unique: true,
      trim: true,

      // string validators
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: String,
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

      // enum validator for strings only
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      // to set default value
      default: 4.5,
      // it also works for dates, not just numbers
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
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

      // custom validator with 'validate' property
      // note - we need to return true or false from this validator
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          // not going to work on update
          return val < this.price;
        },
        // val === value
        // this message occurs if false in above condition
        message: 'Discount price ({VALUE}) should be below regular price',
      },
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

      // hide this field or don't send it back on the response
      select: false,
    },
    startDates: [Date],
    // secretTour: {
    //   type: Boolean,
    //   default: false,
    // },

    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // second arg is Option Object
  {
    // Each time data is send back as a json, we want virtuals to be true
    // Basically, this is include virtuals in the response
    toJSON: { virtuals: true },
    // response data to be an object
    toObject: { virtuals: true },
  }
);

// Virtuals are document properties that you can get and set in our Schema
// but that do not get persisted/registered to MongoDB or database to save some memory space.
// Mostly use to create some utility operations on our schema
// NOTE - The Virtual Property can't be use in a Query since it is not part of a database

// NOTE -  we can do this in our Controller but that is not a best practice since
// we have to keep our Application Logic & Business Logic 'Model' separated as possible.

// creating Virtual Property named 'durationWeeks'
// Need to define get method because this virtual property will get created each time we get data from db - getter
tourSchema.virtual('durationWeeks').get(function () {
  // note - arrow function won't work here since arrow function does not get its own 'this' keyword
  // 'this' points to a current document
  return this.duration / 7; // 1 === 7 days
});

// NOTE -  Mongoose also have four types of middleware
// 1. Document 2. Query 3. Aggregate
// we can run middleware before or after certain event like
// saving document in db and this process is known as Pre or Post hook.

/* 1. Document Middleware */
// note - using Document middleware on current processed document to do something
// This runs only before .save() & .create() events, before saving document in the db
// next arg - preSave middleware has access to 'next' to call next middleware in stack
tourSchema.pre('save', function (next) {
  // crating new property for slug
  // this.name - use name property for slug
  this.slug = slugify(this.name, { lower: true });

  // calling pass arg 'next' middleware here
  next();
});

// tourSchema.pre('save', (next) => {
//   console.log('Will save document!');

//   next();
// });

// // after saving in db, post method has access on currently saved document in db which is 'doc' as arg
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);

//   next();
// });

/* 2. Query Middleware */
// This middleware allows us to run Function before or after certain query is executed
// PreFind hook is a middleware executed before any Find Query is executed
// /^find/ - regular expression to execute all kinds of Find Queries, strings start with 'find'
tourSchema.pre(/^find/, function (next) {
  // note - 'this' here refers to the current query since we are not processing any document object here
  // running an additional query here before executing a Main Controller Query to filter out
  this.find({ secretTour: { $ne: true } });

  // to find how long the query took to get executed
  this.start = Date.now();
  next();
});

// after query has been executed where we have an access to document object
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);

  next();
});

/* 3. Aggregate Middleware */
// allows us to add hooks before or after an Aggregation happens

// convention to always use uppercase for Modal Names & related variables
// telling mongoose to create new model class instance - Tour
// first arg - name of the collection & second arg - name of the the Schema, data model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

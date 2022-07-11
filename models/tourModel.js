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
  },
  rating: {
    type: Number,
    // to set default value
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// convention to always use uppercase for Modal Names & related variables
// telling mongoose to create new model class instance - Tour
// first arg - name of the collection & second arg - name of the the Schema, data model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

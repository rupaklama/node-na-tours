/* Server related */
const mongoose = require('mongoose');

// to access Env variables
const dotenv = require('dotenv');

// note - by default, env variable is set to development in express
// console.log(app.get('env')); // development

// object to specify the path to our config file
// this will set env variables in Node process module
dotenv.config({ path: './config.env' });

// connect to database
const db = process.env.DATABASE;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // connection object
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

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

// document - object
const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.7,
  price: 499,
});

// env variables set by Node which comes from Process Core Modules
// console.log(process.env);

const app = require('./app');

const port = process.env.PORT || 4000;

app.listen(port, '127.0.0.1', () => {
  console.log(`App running on port ${port}`);
});

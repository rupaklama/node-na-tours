/* Express related */

const express = require('express');
const morgan = require('morgan');

const toursRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

/* Middleware */
/* express app instance */
const app = express();

if (process.env.NODE_ENV === 'development') {
  // to debug, 'arg' is how we want the logging to look like in console
  app.use(morgan('dev'));
}

// Middleware to consume Request Body Object - default body parser package
app.use(express.json());

// Middleware to server Static files from local directory
app.use(express.static(`${__dirname}/public`));

// note - we have access to Request/Response & Next function on any middleware
// creating our own custom middleware which gets executed on each single request
app.use((req, res, next) => {
  // console.log('Hello from the middleware!');

  // note - must call next() here otherwise req/res cycle will stuck or stop here
  next();
});

// another custom middleware to manipulate Request
app.use((req, res, next) => {
  // adding current time to the request
  req.requestTime = new Date().toISOString();
  next();
});

/* ROUTES */
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', userRouter);

// default exporting this module
module.exports = app;

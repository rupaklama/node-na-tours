/* Express related */

const express = require('express');
const morgan = require('morgan');

const toursRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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

// unhandled routes
app.all('*', (req, res, next) => {
  // creating error object with msg & defining the status, statusCode
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // note - when next() receives any argument, express will know automatically there is an error
  // it will skip all the middleware in the middleware stacks & send error into global error handling middleware
  // next(err);

  // using error class with msg & status code args
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// NOTE - global error handling middleware
// app.use((err, req, res, next) => {
// stack trace are details where the error occurred
//   console.log(err.stack);

// default status code & status message
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'server error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

// created separated error handler for above global error handling middleware
app.use(globalErrorHandler);

// default exporting this module
module.exports = app;

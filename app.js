/* Express related */

const express = require('express');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const morgan = require('morgan');
const path = require('path');

const toursRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

/* Global Middleware */
/* express app instance */
const app = express();

// Set security HTTP Headers
app.use(helmet());

// defining pug view engine here
app.set('view engine', 'pug');

// define path to 'views' in our file system
app.set('views', path.join(__dirname, 'views'));

// Middleware to server Static files from local directory
// app.use(express.static(`${__dirname}/public`));
// note - sane as above but approach
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  // to debug, 'arg' is how we want the logging to look like in console
  app.use(morgan('dev'));
}

// Rate Limiting: to allow number of http request from particular IP address
const limiter = rateLimit({
  // 100 requests from same IP per Hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try in an hour!',
});
app.use('/api', limiter);

// Middleware to consume Request Body Object - default body parser package
app.use(express.json());

// Data sanitization against NoSQL database query injection.
// NoSQL injection occurs when a db query, most commonly delivered by an end-user,
// is not sanitized, allowing the attacker to include malicious input that
// executes an unwanted command on the database.
// This will remove mongo syntax - '$' to make it invalid from the request object.
app.use(mongoSanitize());

// Data sanitization against XSS attack
// To clean any user input from malicious html/js code basically by converting the html data
app.use(xss());

// Preventing parameter pollution which is to remove extra unwanted query params
app.use(
  hpp({
    // to allow following query param duplicates in the query string which we defined ourself
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  })
);

// note - we have access to Request/Response & Next function on any middleware
// creating our own custom middleware which gets executed on each single request
app.use((req, res, next) => {
  // console.log('Hello from the middleware!');
  // console.log(req.headers);

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
app.get('/', (req, res) => {
  // render base pug template
  res.status(200).render('base', {
    // this option object is to pass any data to render in pug template
    // Object Properties are known as Locals in pug file
    tour: 'The Forest Hiker',
    user: 'Jonas',
  });
});

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

// NOTE - global Operational Error handling middleware
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

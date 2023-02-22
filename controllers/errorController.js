// note - Controllers are handlers in MVC

const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// mongodb duplicate field error
const handleDuplicateFieldsDB = (err) => {
  // 'errmsg' error created by mongodb
  // using regular expression to string inside of ""
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// note - Mongoose Validation errors are inside of 'error.errors' property
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  // note - when we are in dev, we want all the information to debug
  res.status(err.statusCode).json({
    status: err.status,
    // print entire error
    error: err,
    message: err.message,
    // output error stack
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Sending only Operational errors to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// note - Global Error handling middleware to catch errors coming from express, mongoose & mongodb
// The goal is to catch and handle all errors in one central middleware
// Separation of concern - where we don't have to worry about handling of errors anywhere in our app
module.exports = (err, req, res, next) => {
  // stack trace are details where the error occurred
  // console.log(err.stack);

  // default status code & status message
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'server error';

  // note - outputting less errors in our prod env & more in the dev env
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Not a good practice to override function arg - 'err'
    let error = Object.assign(err);

    // note - Three types of Mongoose Errors that needs to be marked as Operation Error

    // 1. Invalid id
    // handling mongoose default cast error
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // 2. Duplicate property names: mongodb error
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // 3. Mongoose Validation errors: are inside of 'error.errors' property
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

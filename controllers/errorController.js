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

// jwt error
const handleJWTError = () => new AppError('Invalid token. Please login in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please login in again!', 401);

// Dev Env
const sendErrorDev = (err, req, res) => {
  // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
  // originalUrl - '/api/v1/tours'
  if (req.originalUrl.startsWith('/api')) {
    // note - when we are in dev, we want all the information to debug
    return res.status(err.statusCode).json({
      status: err.status,
      // print entire error
      error: err,
      message: err.message,
      // output error stack
      stack: err.stack,
    });
  }
  // pug template
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

// Prod Env
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Sending only Operational errors to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    }
    // 1) Log original error
    console.error('ERROR 💥', err);

    // 2) default error message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // Prod: render error in template based on 'isOperational'
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // 1) Log original error
  console.error('ERROR 💥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later.',
  });
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
    sendErrorDev(err, req, res);
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
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    // 4. jsonwebtoken package error
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Extending built in Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    // note - message is the only param built in Error Object accepts
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // programming errors but not bugs
    this.isOperational = true;

    // constructor function won't be call in the stack trace to not to pollute with more details
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

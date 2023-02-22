// note - this is to get rid of try/catch block to keep code dry

// func to catch errors on any async function
module.exports = (fn) => (req, res, next) => {
  // if successful, resolve promise
  // if error, pass error in our global error handle middleware
  // fn(req, res, next).catch(err => next(err));
  fn(req, res, next).catch(next);
};

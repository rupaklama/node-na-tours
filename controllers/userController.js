/* MVC architecture - Model, View, Controller */

const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

// helper function
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

// Get Current User
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  console.log(req.params);
  next();
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateAuthUser = catchAsync(async (req, res, next) => {
  // 1. Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /update-password', 400));
  }

  // 2. Filtered out unwanted fields names that are not allowed to be updated
  // note - since we don't want to update everything in the request body for safety
  // body.role: 'admin' - if presents in the req.body, any malicious user can change a role to the administrator
  // This function allows us to filter properties that we want to only update
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // display new updated document
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

// delete user - The user account gets removed but the in-active user data still remains in the db
exports.deleteAuthUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // route('/:id') - console.log(req.params);
  const user = await User.findById(req.params.id);
  // same as above with filter object
  // const User = await User.findOne({ _id: req.params.id });

  // user is null
  if (!user) {
    return next(new AppError('No user found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// note: do not update passwords with this
exports.updateUser = catchAsync(async (req, res, next) => {
  // id with req.body to update our data
  // third arg is option object
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    // this will make sure the new updated document is the one that gets return
    // true to return the modified document rather than the original. defaults to false
    new: true,
    // to validate data against our schema
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'server error',
    message: 'This route is not yet defined',
  });
};

/* MVC architecture - Model, View, Controller */
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

// to store in our file system with custom file name
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb is similar to 'next' middleware
//     // callback func - first arg is for 'error' if any, second arg is the storage destination
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // generating unique file names with file extension to avoid name issues
//     // user-id-timestamp.jpeg
//     const ext = file.mimetype.split('/')[1];

//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// memoryStorage - store files in memory as Buffer objects
const multerStorage = multer.memoryStorage();

const errorOutputFn = () => {
  const err = new Error('Not an image. Please upload only images.');
  err.status = 'fail';
  err.statusCode = 400;
  return err;
};

// to filter out if the uploaded file is an image type
const multerFilter = (req, file, cb) => {
  // if image type file, pass 'true' to cb else false
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // cb(new Error('Not an image. Please upload only images.'), false);
    cb(errorOutputFn(), false);
  }
};

// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // image buffer data
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;

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

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// NOTE: Always use 'user.save()' on authentication, not user.update as a good practice

const generateToken = (id) =>
  // jwt.sign(payload, secretOrPrivateKey, [options, callback]) - create jwt
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// reusable function
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = generateToken(newUser._id);

  res.status(201).json({
    status: 'success',
    // sending token to the client to login user right away
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // by default 'password' property is set to hidden on the response output
  // Overriding that here to get the password value to compare in the user object
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // check if token exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // verify user jwt token
  // jwt.verify is iife calling with pass arguments
  // const verify = promisify(jwt.verify);
  // verify(token, process.env.JWT_SECRET).then().catch();
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user with the token does not exists.', 401));
  }

  // check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // for future use
  req.user = currentUser;

  // grant access to protected route
  next();
});

// authorization: User roles & permissions
// note - need wrapper function since can't pass args into middleware function
exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  });

// Note: first step is to send Reset Token which is not jwt token
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on Posted email in request body
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  // 'validateBeforeSave': de-active validators in the User model
  await user.save({ validateBeforeSave: false });

  // 3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}. 
  \nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    // reset changes
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get User based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // mongodb 'greater' compare operator: greater than current timestamp
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. Set new password if token has not expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update 'changedPasswordAt' property for the user

  // 5. Log the user in sending jwt token to the client
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// password update for current auth user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get User form collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if the provided current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3. If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log user in, send jwt
  // const token = generateToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  createSendToken(user, 200, res);
});

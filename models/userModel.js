const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    // converts to lowercase
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    // to not to send this property value in the response
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    validate: {
      // this only works on user.create & user.save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    // hide this prop since we don't want any users to know
    select: false,
  },
});

// using mongoose pre save document middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // auto hashing/encrypt & salting password with cost or rounds of 12
  this.password = await bcrypt.hash(this.password, 12);

  // to not to persist in db after validation, deleting this field
  this.passwordConfirm = undefined;

  next();
});

// Query middleware 'schema.pre' is to add any extra steps before any ongoing query somewhere in our app
// Update 'changedPasswordAt' property for the user after password reset
userSchema.pre('save', async function (next) {
  // if password prop is not modified or a new document
  if (!this.isModified('password') || this.isNew) return next();

  // note: It is to prevent any time delays in creating the token and updating the changed at field in db.
  // This is to make sure that token is always created after the password gets updated in db
  // By saying the changed at field was done a second earlier, we are fixing the bug which is
  // 'passwordChangedAt' timestamp might set before jwt token gets created
  this.passwordChangedAt = Date.now() - 1000; // 1s
  next();
});

// Query middleware to remove deleted user in the response list on any User.find() query
userSchema.pre(/^find/, function (next) {
  // send only active users in the response object
  // this.find({ active: true });
  this.find({ active: { $ne: false } });

  next();
});

// note - creating mongoose 'instance' methods for extra functionalities
userSchema.methods.correctPassword = async function (inputPassword, userPassword) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const dateTimestampSecs = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(dateTimestampSecs, JWTtimestamp);
    return JWTtimestamp < dateTimestampSecs; // 100 < 200
  }

  // password not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // NOTE: Reset token can be just a basic random string,
  // not cryptographically strong as hashed password like with jwt token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // MUST need to 'encrypt' resetToken to store in db for safety issues
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  // password expire time - 10 mins, converting to millie seconds
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // sending un-encrypt basic plain text token
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

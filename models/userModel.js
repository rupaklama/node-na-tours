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
  photo: String,
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

const User = mongoose.model('User', userSchema);

module.exports = User;

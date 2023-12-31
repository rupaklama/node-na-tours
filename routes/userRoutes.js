const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get Current User
router.get('/me', authController.protect, userController.getMe, userController.getUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// note: all the routes after this middleware are protected routes now
router.use(authController.protect);
router.patch('/update-password', authController.updatePassword);
router.patch('/update-user', userController.uploadUserPhoto, userController.updateAuthUser);
router.delete('/delete-user', userController.deleteAuthUser);
// note: only 'admin' has access to all the protected routes below
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers, userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

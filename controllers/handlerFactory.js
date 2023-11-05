const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Factory Factory simply returns a new object which is another function for reusable code
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('No tour found with that Id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

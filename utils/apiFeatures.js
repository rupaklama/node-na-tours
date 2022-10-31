// creating reusable module
class APIFeatures {
  constructor(query, queryString) {
    // mongoose query object
    this.query = query;
    // api query params
    this.queryString = queryString;
  }

  // methods for endpoint features
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    // [] is to specify Operator like here - api/v1/tours?duration[gte]
    // MongoDB requires the use of '$' with Operator by appending '$' to 'gte' operator to execute queries
    // duration: { '$gte': '5'}, \b us to match exact word
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));

    // to return entire object to call chained methods
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // api/v1/tours?sort=price,ratingsAverage - since can't have whitespace in the url so using ','
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // '-' for descending order as newest first
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

// creating reusable module
class APIFeatures {
  constructor(query, queryString) {
    // mongoose schema query object
    this.query = query;
    // api query params
    this.queryString = queryString;
  }

  // methods for endpoint features
  filter() {
    // creating new object to modify the query
    const queryObj = { ...this.queryString };
    // exclude these fields in query object by default to avoid issues
    // these fields are use in other functionalities below
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    // [] is to specify Operator like here - api/v1/tours?duration[gte]
    // MongoDB requires the use of '$' with Operator by appending '$' to 'gte' operator to execute queries
    // duration: { '$gte': '5'}, \b us to match exact word
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    console.log(JSON.parse(queryStr));

    // this is mongoose api query object
    this.query = this.query.find(JSON.parse(queryStr));

    // Returning current query object to have access on other chained methods
    // Won't work without doing this
    // new APIFeatures(Tour.find(), req.query).filter().sort()
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);

      // api/v1/tours?sort=price,ratingsAverage - since can't have whitespace in the url so using ','
      // ratings Average
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // '-' for descending order as newest first
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // note - this process is known as projecting
  // in order for client to choose which fields to get back in response
  // to receive as little data as possible to reduce the bandwidth which is consumed on each request
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // limiting the fields here
      this.query = this.query.select(fields);
    } else {
      // '-' is to exclude this field in the response
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    // 100 items by default
    const limit = this.queryString.limit * 1 || 100;

    // skip is to amount of results to be skip like 10 item in prevPage before querying data again
    // page=2&limit=10, 1-10 = page 1, 2-20 = page 2
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

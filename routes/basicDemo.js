const express = require('express');

const fs = require('fs');

const router = express.Router();

/* File Reading should be done outside of Route handler */
// __dirname - current root folder 'NA-TOURS'
const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Param middleware - only runs when there is query param id value in the url
// In Param middleware, since it is a middleware we have access to 'next' &
// we also have access to fourth arg 'val' - value of query param
router.param('id', (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  // NOTE - rather than creating simple function that checks id and calling it inside of
  // each route handlers which is will go against philosophy of Express where we should
  // always work with middleware stack pipeline like below as much as we can

  // check if id is valid
  if (req.params.id * 1 > toursData.length) {
    // note - 'return' statement is needed here to avoid
    // error 'Not allowed to send Headers after the response has already been send'
    // 'return' makes sure that after sending this response, the function will return/exit
    // & never to call 'next' middleware to send another response to the client
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  // to move on to next middleware so to avoid stopping request/response cycle
  next();
});

// validator middleware on request object to validate data
const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

/* Routes - Only one purpose & No validation here,
the validation must be done inside of the middleware stack or pipeline in Express as above
*/

/* Get */
/* Keeping Api endpoints exactly the SAME as a good practice with related Route handler */
router.get('/', (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    // our custom middleware is sending this data
    requestedAt: req.requestTime,
    // sending additional data for client side
    results: toursData.length,
    data: {
      // matching endpoint
      tours: toursData,
    },
  });
});

/* Detail */
// :id? is to make it optional
router.get('/:id', (req, res) => {
  // to access req.params object
  // console.log(req.params);

  const id = Number(req.params.id);
  const tour = toursData.find((i) => i.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

/* Post */
// note - chaining multiple middlewares for the same route
router.post('/', checkBody, (req, res) => {
  // Express does not put Body data/object in the request by default

  // app.use(express.json());
  // We have to use above Middleware to have Request Body Object available
  // console.log(req.body); NOTE - the Request Body gets parsed into an Object

  // note - accessing object's id property & adding 1 to create a new id
  const newId = toursData[toursData.length - 1].id + 1;
  const newTour = { id: newId, ...req.body }; // or Object.assign({id: newId}, req.body)

  toursData.push(newTour);

  // NOTE - now this Route handler runs inside of the event loop & we should not block the event loop
  // therefore, we are going to use the Async write func and not the Synchronous one
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,

    // note - parsing toursData object into JSON Strings since our local data is json
    JSON.stringify(toursData),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );

  // Note - we always need to send back something to finish Request/Response Cycle
  // res.send('Done');
});

/* Patch */
router.patch('/:id', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
});

/* Delete */
router.delete('/:id', (req, res) => {
  // if (req.params.id * 1 > toursData.length) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }

  res.status(204).json({
    status: 'success',
    // data no longer exists
    data: null,
  });
});

// default export to use Router Class in the entry file
// module.exports = router;

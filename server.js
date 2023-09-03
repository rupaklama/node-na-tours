/* Server related */
const mongoose = require('mongoose');

// to access Env variables
const dotenv = require('dotenv');

// note - uncaughtException should be on the top level to detect Bugs
process.on('uncaughtException', (err) => {
  console.log('uncaught exception...shutting down');

  console.log(err.name, ':', err.message);

  // note - This is not optional with uncaughtException
  // After error, entire Node Process is in unclean state.
  // To fix it, the process needs to terminate & restarted.
  process.exit(1);
});

// note - by default, env variable is set to development by express
// console.log(app.get('env')); // development

// note - Node also sets default Env Variables
// NODE_ENV is automatically set & detected based on the current environment like dev, test or prod
// It is very helpful on setting configurations & application logic based on the NODE_ENV variable
console.log('env: ', process.env.NODE_ENV);

// object to specify the path to our config file
// this will set env variables in Node process module to make it available throughout our app
dotenv.config({ path: './config.env' });

// connect to database
const db = process.env.DATABASE;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // connection object
    // console.log(con.connections);
    console.log('DB connection successful!');
  });
// .catch((err) => console.error(err));

// note - dotenv must call before app is initialized like above
const app = require('./app');

const port = process.env.PORT || 4000;

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`App running on port ${port}`);
});

// note - Unhandled Rejections are related to Promises
// Uncaught Exceptions are bugs related to Synchronous Code

// note - global unhandled promise rejections, async code
// subscribing unhandled rejection object here
// The on() method requires name of the event to handle and callback function which is called when an event is raised.
process.on('unhandledRejection', (err) => {
  // The process.exit() method instructs Node.js to terminate the process synchronously with an exit status of code.
  // Node normally exits with a 0 status code when no more async operations are pending.

  // 0 is a success code and 1 (or another number) can be a failure code.
  // 0 will be used if nothing is specified, 1 will stop the current process
  console.log('unhandled rejection...shutting down');

  console.log(err.name, ':', err.message);

  // shutting down the server gracefully
  server.close(() => {
    // doing this will give server some time to finish current tasks and handle current requests pending
    // Only after that the server will be shut down
    process.exit(1);
  });
});

// note - In Production, we should have a tool to restart our app after shutting down
// many hosting services do it out of the box with zero config

/* NOTE - this will run completely independent from Express app & 
  only going to run once in the beginning to populate data in our data base
*/

// to read our local file
const fs = require('fs');

// tour model to populate with data

/* Server related */
const mongoose = require('mongoose');

// to access Env variables
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

// object to specify the path to our config file
// this will set env variables in Node process module
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

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// import data into db
const importData = async () => {
  try {
    // create method always accepts array of objects
    await Tour.create(tours);
    console.log('Data successfully created!');
  } catch (err) {
    console.error(err);
  }

  // to terminate the process synchronously with an exit status of code
  process.exit();
};

// delete all data from collection
const deleteData = async () => {
  try {
    // to delete all of the documents in the collection
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error(err);
  }

  process.exit();
};

// process.argv property returns an array containing the command-line
// arguments passed when the Node.js process was launched
// console.log(process.argv);  default scripts

// note - creating our custom Scripts
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

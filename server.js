/* Server related */
const mongoose = require('mongoose');

// to access Env variables
const dotenv = require('dotenv');

// note - by default, env variable is set to development in express
// console.log(app.get('env')); // development

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

// note - dotenv must call before app is initialized like above
const app = require('./app');

const port = process.env.PORT || 4000;

app.listen(port, '127.0.0.1', () => {
  console.log(`App running on port ${port}`);
});

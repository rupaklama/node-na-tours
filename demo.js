const fs = require('fs');

// note - Blocking Synchronous way to read & write

// read file: fs.readFileSync(path[, options])
// utf-8: to return Strings instead of default Buffer data
const textIn = fs.readFileSync('./dev-data/data/txt/input.txt', 'utf-8');

// write file: fs.writeFileSync(file, data[, options])
const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on  ${Date.now()}`;
fs.writeFileSync('./dev-data/data/txt/output.txt', textOut);

// note - Non-Blocking Asynchronous way to read & write

// read file: fs.readFile(path[, options], callback)
// callback takes an arg (err, data)
fs.readFile('./dev-data/data/txt/start.txt', 'utf-8', (err, data) => {
  if (err) return console.log('error');

  console.log(data);
});
console.log('Will ready file. Please wait');

// write file: fs.writeFile(file, data[, options], callback)
const appendData = 'Appended Again!!!!';
fs.writeFile('./dev-data/data/txt/append.txt', appendData, 'utf-8', (err) => {
  console.log('file written');
});

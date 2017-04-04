const assert = require('assert');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const PATH = process.argv[process.argv.length-1];

assert.ok(fs.existsSync(PATH), 'The supplied file does not exist.');

const data = fs.readFileSync(PATH);
const collageName = path.basename(PATH).split('.')[0];
const collage = JSON.parse(data);

request({
  url: 'http://localhost:3000/' + collageName,
  method: 'POST',
  json: true,
  body: collage
}).then(body => {
  console.log('Done ...', body);
});

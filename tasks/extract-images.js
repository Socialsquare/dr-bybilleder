const assert = require('assert');
const fs = require('fs');
const path = require('path');
const dataurl = require('dataurl');

const PATH = process.argv[process.argv.length-1];

assert.ok(fs.existsSync(PATH), 'The supplied file does not exist.');

const data = fs.readFileSync(PATH);
const collageName = path.basename(PATH).split('.')[0];
const collage = JSON.parse(data);

const parsedImage = dataurl.parse(collage.image);
fs.writeFileSync(PATH + '-image', parsedImage.data);

const parsedThumbnail = dataurl.parse(collage.thumbnail);
fs.writeFileSync(PATH + '-thumbnail', parsedThumbnail.data);

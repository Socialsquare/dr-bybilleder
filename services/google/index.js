const assert = require('assert');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

let CREDENTIALS_PATH = path.join(
  __dirname, '..', '..', 'google-key.json'
);
// Check if the key-file exists.
CREDENTIALS_PATH = fs.existsSync(CREDENTIALS_PATH) && CREDENTIALS_PATH;

assert.ok(PROJECT_ID, 'Missing Google project id');
assert.ok(CREDENTIALS || CREDENTIALS_PATH, 'Missing Google credentials');

const gcloud = require('google-cloud')({
  projectId: PROJECT_ID,
  credentials: CREDENTIALS && JSON.parse(CREDENTIALS),
  keyFilename: CREDENTIALS_PATH
});

const BUCKET_NAME = process.env.GOOGLE_IMAGES_BUCKET_NAME || 'bybilleder';
gcloud.defaultStorageBucket = () => {
  return gcloud.storage().bucket(BUCKET_NAME);
};

const dataurl = require('dataurl');
gcloud.saveEncodedFile = (fileName, contents) => {
  const parsedImage = dataurl.parse(contents);
  if(parsedImage) {
    const file = gcloud.defaultStorageBucket().file(fileName);
    return file.save(parsedImage.data).then(() => file);
  } else {
    throw new Error('Could not decode the file contents');
  }
};

gcloud.getPublicUrl = filename => {
  return 'https://storage.googleapis.com/' + BUCKET_NAME + '/' + filename;
}

module.exports = gcloud;

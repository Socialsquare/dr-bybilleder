const dotenv = require('dotenv');
dotenv.config();

const google = require('../services/google');
const storage = google.storage();

// Create a bucket
const BUCKET_NAME = process.argv[process.argv.length-1];

storage.createBucket(BUCKET_NAME, {
  location: 'EUROPE-WEST1',
  regional: true
}).then(([bucket, response]) => {
  // Make any new objects added to a bucket publicly readable
  return bucket.acl.default.add({
    entity: 'allUsers',
    role: storage.acl.READER_ROLE
  }).then(() => {
    return bucket;
  });
}).then(bucket => {
  console.log('Created bucket:', bucket.name);
});

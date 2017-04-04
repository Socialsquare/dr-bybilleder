const mongoose = require('mongoose');

// See http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/bybilleder';

if(process.env.NODE_ENV === 'production') {
  mongoose.connect(MONGODB_URI);
} else {
  // Wait two seconds
  setTimeout(() => {
    mongoose.connect(MONGODB_URI);
  }, 2000);
}

const models = require('./models');

mongoose.model('Collage', models.collage);

module.exports = mongoose;

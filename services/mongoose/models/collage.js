const mongoose = require('mongoose');

const google = require('../../google');

const Schema = mongoose.Schema;

const Collage = new Schema({
  id: {
    type: String,
    unique: true,
    index: true
  },
  eventName: {
    type: String,
    index: true
  },
  image: String,
  thumbnail: String,
  created: Date,
  videos: [
    {
      xPos: Number,
      yPos: Number,
      height: Number,
      width: Number,
      rotation: Number,
      videoData: {
        MAitemID: Number,
        title: String,
        description: String
      }
    }
  ]
});

Collage.statics.createWithEncodedImages = function(id, data) {
  // Add the id to the collage object
  Object.assign(data, {
    id
  });

  // Check if a collage with this name exists
  return this.findOne({ id })
  .then(existingCollage => {
    if(existingCollage) {
      throw new Error('A collage with this id already exists');
    } else {
      return Promise.all([
        google.saveEncodedFile(id + '-image', data.image),
        google.saveEncodedFile(id + '-thumbnail', data.thumbnail)
      ]).then(([imageFile, thumbnailFile]) => {
        data.image = google.getPublicUrl(imageFile.name);
        data.thumbnail = google.getPublicUrl(thumbnailFile.name);
        return new this(data).save();
      });
    }
  });
};

module.exports = Collage;

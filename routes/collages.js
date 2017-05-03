const assert = require('assert');
const express = require('express');
const router = express.Router();
const schemas = require('../schemas');

const chaos = require('../services/chaos');
const mongoose = require('../services/mongoose');
const Collage = mongoose.model('Collage');

const index = require('../index.js');

const absoluteUrl = (req, path) => {
  const host = req.get('x-forwarded-host') || req.get('host');
  return req.protocol + '://' + host + path;
};

const deriveVideoUrls = (req, collage) => {
  return Promise.all(collage.videos.map(video => {
    return chaos.getVideoFiles(video).then(files => {
      video.videoData.files = files;
      return video;
    });
  })).then((videos) => {
    return collage;
  });
};

/* Upload a new collage */
router.post('/:id', function(req, res, next) {
  const id = req.params.id;
  const collageData = req.body;

  const valid = schemas.validate('Collage', collageData);
  assert.ok(valid, schemas.errorsText());

  Collage.createWithEncodedImages(id, collageData)
  .then(collage => {
    res.json({
      collage,
      valid
    });
  }, next);
});

router.delete('/:id', function(req, res, next) {
  const id = req.params.id;
  Collage.remove({ id }).then(response => {
    res.json(response);
  }, next);
});

router.get('/collages', function(req, res, next) {
  if(req.accepts(['html', 'json']) === 'json') {
    Collage.find().then(collages => {
      res.json(collages);
    });
  } else {
    next();
  }
});

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  Collage.findOne({id}).then(collage => {
    if(collage) {
      return deriveVideoUrls(req, collage.toObject());
    }
  }).then(collage => {
    if(req.accepts(['html', 'json']) === 'json') {
      // Disable caching of the JSON to prevent browsers from showing JSON
      // instead of a cached HTML version of this route
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.json(collage);
    } else {
      const html = index.appendMetatags({
        'og:title': 'Mit bybillede fra ' + collage.eventName,
        'og:image': collage.thumbnail,
        'og:description': '',
        'og:url': absoluteUrl(req, '/' + collage.id)
      });
      res.send(html);
    }
  }, next).then(null, next);
});

module.exports = router;

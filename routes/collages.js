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
    return chaos.getVideoFiles(video).then(videoData => {
      Object.assign(video.videoData, videoData);
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
  const { id } = req.params;
  const upperCaseId = id.toUpperCase();
  if(id !== upperCaseId) return res.redirect('/' + upperCaseId);

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
        'og:title': 'Her har du mit bybillede med tv-klip fra min by, husker du det også?',
        'og:image': collage.thumbnail,
        'og:description': 'Bybilledet er en interaktiv collage af arkivklip, hvor vi inviterer alle til at fortælle en historie om deres by i vores telt.',
        'og:url': absoluteUrl(req, '/' + collage.id)
      });
      res.send(html);
    }
  }, next).then(null, next);
});

module.exports = router;

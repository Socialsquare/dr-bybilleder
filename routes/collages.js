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

const RTMP_PATTERN = /^rtmp:\/\/vod-kulturarv\.dr\.dk\/bonanza\/mp4:bonanza\/(.+\.mp4)$/;
const generateHLSUrlFromRTMP = (req, url) => {
  assert.equal(url.substring(0,4), 'rtmp', 'Expected a url over the RTMP');
  const match = RTMP_PATTERN.exec(url);
  if(match) {
    const filename = match[1];
    return 'http://vod-kulturarv.dr.dk/bonanza/mp4:bonanza/bonanza/' + filename + '/Playlist.m3u8';
  } else {
    throw new Error('Malformed URL');
  }
}

const deriveVideoUrls = (req, collage) => {
  return Promise.all(collage.videos.map(video => {
    return chaos.getVideoFiles(video).then(files => {
      if(files.rtmpMpeg4) {
        files.hls = generateHLSUrlFromRTMP(req, files.rtmpMpeg4);
      }
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
      res.json(collage);
    } else {
      const html = index.appendMetatags({
        'og:title': '',
        'og:image': '',
        'og:description': '',
        'og:url': ''
      });
      res.send(html);
    }
  }, next).then(null, next);
});

module.exports = router;

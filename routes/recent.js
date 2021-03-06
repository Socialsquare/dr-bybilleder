const express = require('express');
const router = express.Router({mergeParams:true});

const chaos = require('../services/chaos');
const mongoose = require('../services/mongoose');
const Collage = mongoose.model('Collage');

function getLatestCollage(eventName, index) {
  return Collage.findOne({eventName}).sort('-created').skip(parseInt(index)).limit(1).then(collage => {
    return collage;
  });
}

router.get('/:event/:index', function(req, res, next) {
  const { event, index } = req.params;

  getLatestCollage(event, index).then(collage => {
    res.redirect('/' + collage.id);
  }).catch(error => {
    res.status(404).send('recent not found');
  });
});

router.get('/:event/:index/thumbnail', function(req, res, next) {
  const { event, index } = req.params;

  getLatestCollage(event, index).then(collage => {
    res.redirect(collage.thumbnail);
  }).catch(error => {
    res.status(404).send('recent not found');
  });
});

module.exports = router;

const assert = require('assert');
const express = require('express');
const router = express.Router();
const schemas = require('../schemas');

const mongoose = require('../services/mongoose');
const Collage = mongoose.model('Collage');

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
  Collage.find().then(collages => {
    res.json(collages);
  });
});

module.exports = router;

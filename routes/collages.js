const express = require('express');
const router = express.Router();

/* GET home page. */
router.post('/:id', function(req, res, next) {
  res.json({
    id: req.params.id
  })
});

module.exports = router;

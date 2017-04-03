var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/:id', function(req, res, next) {
  res.json({
    id: req.params.id
  })
});

module.exports = router;

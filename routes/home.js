const express = require('express');
let router = express.Router();

/* GET login page */
router.get('/home', (req, res, next) => {
  res.render('/home', {fname: 'Daniel'});
});

module.exports = router;

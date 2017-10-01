const express = require('express');
let router = express.Router();

/* GET login page */
router.get('/home', (req, res, next) => {
  res.render('localhost:3000/home');
});

module.exports = router;

const express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/managePatients', (req, res, next) => {
    res.render('managePatients', {title: 'Manage Patients'}) ;
});

module.exports = router;

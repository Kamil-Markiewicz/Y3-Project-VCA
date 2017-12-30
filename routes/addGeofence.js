const express = require("express");
let router = express.Router();
//const $ = require('../public/javascript/modules/bling');
//const geoAutocomplete = require('../public/javascript/modules/geoAutocomplete');

/* GET home page. */
router.get("/", (req, res, next) => {
    //geoAutocomplete( $('#address'), $('#lat'), $('#long') );
    res.render("addGeofence", {title: "Add a Geofence"}) ;
});

module.exports = router;

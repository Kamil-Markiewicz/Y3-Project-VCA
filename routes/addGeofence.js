const express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/addGeofence", (req, res, next) => {
    res.render("addGeofence", {title: "Add a Geofence"}) ;
});

module.exports = router;

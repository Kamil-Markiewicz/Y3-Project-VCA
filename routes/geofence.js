const express = require("express");
const url = require('url');
const firebase = require("firebase-admin");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const axios = require("axios");
let router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
    let data = url.parse(req.url, true).query;
    let hrefQuery = "?uid="+ data.uid;

    res.render("geofence", {title: "Add a Geofence", userQuery: hrefQuery});
});

router.post("/add", urlencodedParser, (req, res) => {
    let addr_input = req.body.address;
    let api_req = "https://maps.google.com/maps/api/geocode/json?address=" + addr_input;

    axios.get("https://maps.google.com/maps/api/geocode/json", {
        params: {
            address: addr_input
        }
    })
    .then(function (response) {
        console.log(response.data.results[0].geometry);
        let lat = response.data.results[0].geometry.location.lat;
        let long = response.data.results[0].geometry.location.lng;

    })
    .catch(function (error) {
        console.log(error);
    });

    res.render("geofence")
});

module.exports = router;

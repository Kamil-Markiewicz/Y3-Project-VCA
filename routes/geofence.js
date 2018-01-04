const express = require("express");
const url = require("url");
const firebase = require("firebase-admin");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const axios = require("axios");
let router = express.Router();

/* GET geofence page. */
router.get("/", (req, res, next) => {
    let data = url.parse(req.url, true).query;
    let hrefQuery = "?uid="+ data.uid;
    
    res.render("geofence", {title: "Add a Geofence", userQuery: hrefQuery});
});

router.post("/add", urlencodedParser, (req, res) => {
    let data = url.parse(req.url, true).query;
    let hrefQuery = "?uid="+ data.uid;

    let addr_input = req.body.address + " , Ireland";
    console.log(req.body);
    let patient_uid = req.body.patient_uid;

    axios.get("https://maps.google.com/maps/api/geocode/json", {
        params: {
            address: addr_input
        }
    })
    .then((response) => {
        console.log(response.data.results[0].formatted_address);
        console.log(response.data.results[0].geometry.location.lat);
        console.log(response.data.results[0].geometry.location.lng);

        let lat = response.data.results[0].geometry.location.lat;
        let long = response.data.results[0].geometry.location.lng;

        // if lat is undefined, so is long. Checks if address query returned valid result
        if (lat !== "undefined") {
            let long_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/geofenceLong");
            long_ref.set(long);
            let lat_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/geofenceLat");
            lat_ref.set(lat);
        }
    })
    .then(()=> {
        res.render(home, {title: "Add a Geofence", userQuery: hrefQuery});
    })
    .catch((error) => {
        console.log(error);
        res.render("geofence", {title: "Add a Geofence", userQuery: hrefQuery});
    });
});

module.exports = router;

const express = require("express");
let router = express.Router();
const firebase = require("firebase-admin");
const app = express();
const url = require('url');

function getPatients() {
    const ref = firebase.database().ref("patients_flattened/");
    return ref.once("value").then(snap => snap.val())
}

getPatients().then(patients => {
   console.log(JSON.stringify(patients, null, 2));
});

router.get("/", (req, res, next) => {
    let data = url.parse(req.url, true).query;
    let hrefQuery = "?uid="+ data.uid;

    let patient_objs = {};
    getPatients().then(patients => {
        for (patient in patients){
            if (patients[patient].carerID === data.uid){
                patient_objs[patient] = patients[patient];
            }
        }
    }).then(() => {
        res.render("home", {title: "Carer Home", patients: patient_objs, userQuery: hrefQuery});
    });

});

module.exports = router;

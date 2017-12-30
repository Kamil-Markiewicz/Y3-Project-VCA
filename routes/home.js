const express = require("express");
let router = express.Router();
const firebase = require("firebase-admin");
const app = express();

function getPatients() {
    const ref = firebase.database().ref("patients_flattened");
    return ref.once("value").then(snap => snap.val())
}

getPatients().then(patients => {
    console.log(JSON.stringify(patients, null, 2));
   app.locals.patients = patients;
});

/* GET login page */
router.get("/", (req, res, next) => {
  getPatients().then(patients => {
      app.locals.patients = patients;
  }).then(() => {
      res.render("home");
  });

});

module.exports = router;

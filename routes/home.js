const express = require("express");
let router = express.Router();
const firebase = require("firebase-admin");
const app = express();
const url = require('url');

function getPatients() {
    const ref = firebase.database().ref("patients_flattened/");
    return ref.once("value").then(snap => snap.val());
}

getPatients().then(patients => {
    console.log(JSON.stringify(patients, null, 2));
});

function getPatient(patient_uid) {
    if (patient_uid !== ""){
        let db_ref = firebase.database().ref("patients_flattened/" + patient_uid);
        return db_ref.once("value").then(snapshot => snapshot.val());
    }
}

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
        res.render("home", {title: "Carer Home", patients: patient_objs, userQuery: hrefQuery, carerId: data.uid});
    });

});

router.post("/editPatient", (req, res, next) => {
    let data = req.body;
    let carer_uid = data.carerId;
    let patient_uid = data.patientId;
    let fname = data.fname;
    let lname = data.lname;
    let condition = data.condition;
    let contact_no = data.contactNo;
    let age = data.age;

    getPatient(patient_uid).then(patient => {
        if (patient !== null){
            if (fname !== "") {
                let patient_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/fname");
                patient_ref.set(fname);
            }
            if (lname !== "") {
                let patient_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/lname");
                patient_ref.set(lname);
            }
            if (age !== "" && !isNaN(age)) {
                let patient_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/age");
                patient_ref.set(age);
            }
            if (condition !== "") {
                let patient_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/condition");
                patient_ref.set(condition);
            }
            if (contact_no !== "") {
                let patient_ref = firebase.database().ref("patients_flattened/" + patient_uid + "/contactNo");
                patient_ref.set(contact_no);
            }
        }
    }).then( () => {
        let redir_url = "/home?uid=" + carer_uid;
        res.redirect(redir_url);
    });
});

module.exports = router;

const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const sassMiddleware = require("node-sass-middleware");
const firebase = require("firebase-admin");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const app = express();
const serviceAccount = require("./bin/serviceAccountKey.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://y3-project-vca.firebaseio.com/"
});

const index = require("./routes/index");
const home = require("./routes/home");
const addPatient = require("./routes/addPatient");
const geofence = require('./routes/geofence');
const manageBusinesses = require("./routes/manageBusinesses");

function carerLogin() {
    const ref = firebase.database().ref("carers_flattened");
    return ref.once("value").then(snap => snap);
}

carerLogin().then(carers => {
    console.log(JSON.stringify(carers, null, 2));
});

function getPatients() {
    const ref = firebase.database().ref("patients_flattened");
    return ref.once("value").then(snap => snap.val())
}

getPatients().then(patients => {
    console.log(JSON.stringify(patients, null, 2));
    app.locals.patients = patients;
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "public", "favicon.png")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    indentedSyntax: false,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/home", home);
app.use("/addPatient", addPatient);
app.use("/geofence", geofence);
app.use("/manageBusinesses", manageBusinesses);

//auto.getAutocomplete( $$('#address'), $$('#lat'), $$('#long') );

// add patient endpoint
app.post("/addPatient", urlencodedParser, (req, res) => {
    console.log(req.body);
    let user_data = req.body;
    firebase.auth().createUser({
        email: user_data.user_email,
        password: user_data.user_password
    })
        .then((userRecord) => {
            let path = "patients_flattened/" + userRecord.uid;
            let patient_ref = firebase.database().ref(path);
            patient_ref.set({
                carerID: user_data.carerId,
                fname: user_data.fname,
                lname: user_data.lname,
                contactNo: user_data.tel,
                condition: user_data.condition,
                age: parseInt(user_data.age)
            });

            //finally, add the patient to carer's list
            let carer_ref = firebase.database().ref("carers_flattened/" + user_data.carerId + "/patients");
            carer_ref.push(userRecord.uid);
        }).then(() => {
            res.redirect("/home?uid=" + user_data.carerId);
        })
        .catch((error) => {
            console.log("Error creating user:", error);
            let hrefQuery = "?uid="+ data.uid;
            res.render("addPatient", {title: "Add a Patient", userQuery: hrefQuery, carerId: user_data.carerId, error: "Error creating new user :("}) ;
        });
});

// add restaurant endpoint
app.post("/manageBusinesses", urlencodedParser, (req, res) => {
    console.log(req.body);
    let ref = firebase.database().ref("businesses");

    switch (req.body.type) {
        case "restaurants":
            ref.child("restaurants").push(req.body);
            break;
        case "shopping":
            ref.child("shopping").push(req.body);
            break;
        default:
            ref.child("taxis").push(req.body);
    }
    res.render("manageBusinesses");
});

// remove patient endpoint
app.post("/removePatient", urlencodedParser, (req, res) => {
    let ref = firebase.database().ref("patients_flattened");
    let carer_ref;
    let carer_uid = req.body.uid;

    if (req.body.uid){
        carer_ref = firebase.database().ref("carers_flattened/" + carer_uid + "/patients");
    }

    ref.child(req.body.patientId).remove().then(() => {
        getPatients().then((patients) => {
            app.locals.patients = patients
        }).then(() => {
            if (carer_ref){
                carer_ref.orderByValue().equalTo(req.body.patientId).once("child_added").then(function(snapshot){
                    if (snapshot.val()){
                        let patient_ref = firebase.database().ref("carers_flattened/" + carer_uid + "/patients/" + snapshot.key);
                        patient_ref.remove();
                    }
                })
            }
            res.redirect("/home?uid=" + req.body.uid);
        });
    });
    firebase.auth().deleteUser(req.body.patientId);
    console.log(`Removed patient ${req.body.patientId}`);
});

// carer login endpoint
app.post("/loginCarer", urlencodedParser, (req, res) => {
    data = req.body;
    uID = data.uID;
    console.log("Login uID Received: " + uID);

    let redir_url = "/home?uid=" + uID;
    res.redirect(redir_url);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
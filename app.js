const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const sassMiddleware = require("node-sass-middleware");
const firebase = require("firebase-admin");
const functions = require("firebase-functions");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
//const router = express.Router;
const app = express();
const serviceAccount = require("./bin/serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://y3-project-vca.firebaseio.com/"
});

const index = require("./routes/index");
const home = require("./routes/home");
const addPatient = require("./routes/addPatient");
const addGeofence = require('./routes/addGeofence');
const manageBusinesses = require("./routes/manageBusinesses");

//const $$ = require('./public/javascript/modules/bling');
//const auto = require('./public/javascript/modules/geoAutocomplete');

function carerLogin() {
  const ref = firebase.database().ref("carers_flattened");
  return ref.once("value").then(snap => snap)
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
app.use("/addGeofence", addGeofence);
app.use("/manageBusinesses", manageBusinesses);

//auto.getAutocomplete( $$('#address'), $$('#lat'), $$('#long') );

// add patient endpoint
app.post("/addPatient", urlencodedParser, (req, res) => {
  console.log(req.body);
  let user_data = req.body;

  firebase.auth().createUser({
      email: user_data.user_email,
      password: user_data.user_password
  }).then(function(userRecord) {
      let path = "patients_flattened/" + userRecord.uid;
      let patient_ref = firebase.database().ref(path);
      patient_ref.set({
          fname: user_data.fname,
          lname: user_data.lname,
          contactNo: user_data.tel,
          condition: user_data.condition,
          age: user_data.age
      })

  }).catch(function(error){
      console.log("Error creating user:", error);
  });

  // let newPatient = firebase.database().ref("patients_flattened");
  // newPatient.push(req.body);
  // console.log(newPatient.ref.key);
  res.render("addPatient");
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
  ref.child(req.body.patientId).remove().then(() => {
      getPatients().then((patients) => {
          app.locals.patients = patients
      }).then(() => {
          res.redirect("/home");
      });
  });

  console.log(`Removed patient ${req.body.patientId}`);
});

// carer login endpoint
app.post("/loginCarer", urlencodedParser, (req, res) => {
  data = req.body;
  uID = data.uID;
  console.log("uID Received: " + uID);

  res.redirect("/home");
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

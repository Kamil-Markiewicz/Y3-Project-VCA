const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
//const shortid = require('shortid');
const firebase = require('firebase-admin');
const functions = require('firebase-functions');

const index = require('./routes/index');
const home = require('./routes/home');
const managePatients = require('./routes/managePatients');
const manageBusinesses = require('./routes/manageBusinesses');

const app = express();

const serviceAccount = require("./bin/serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://y3-project-vca.firebaseio.com/"
});

function carerLogin() {
  const ref = firebase.database().ref('carers_flattened');
  return ref.once('value').then(snap => snap)
}

carerLogin().then(carers => {
  console.log(JSON.stringify(carers, null, 2));
});

function getPatients() {
  console.log("231");
  const ref = firebase.database().ref('patients_flattened');
  return ref.once('value').then(snap => snap.val())

  .then(patients => {
      console.log(JSON.stringify(patients, null, 2));
      app.locals.patients = patients;
  });
}


let urlencodedParser = bodyParser.urlencoded({ extended: false });

// example of generation of unique login code for android app
// console.log(shortid.generate());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/home', home);
app.use('/managePatients', managePatients);
app.use('/manageBusinesses', manageBusinesses);

// Route homepage
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  getPatients();
  res.render('home');
});

app.get('/managePatients', (req, res) => {
  res.render('managePatients');
});

app.get('/manageBusinesses', (req, res) => {
  res.render('manageBusinesses');
});

// add patient endpoint
app.post('/managePatients', urlencodedParser, (req, res) => {
  console.log(req.body);

  let newPatient = firebase.database().ref('patients_flattened');
  newPatient.push(req.body);
  console.log(newPatient.ref.key);
  res.render('managePatients');
});

// add restaurant endpoint
app.post('/manageBusinesses', urlencodedParser, (req, res) => {
  console.log(req.body);
  let ref = firebase.database().ref('businesses');

  if (req.body.type === 'restaurants') {
    ref.child('restaurants').push(req.body);
    //ref.child('restaurants').child().set(ref.body);
  } else if (req.body.type === 'shopping') {
      ref.child('shopping').push(req.body);
  } else {
    // todo: Maybe some error checking?
    ref.child('taxis').push(req.body);
  }

  res.render('manageBusinesses');
});

// remove patient endpoint
app.post('/removePatient', urlencodedParser, (req, res) => {
  let ref = firebase.database().ref('patients_flattened');
  ref.child(req.body.patientId).remove();
  console.log(`Removed patient ${req.body.patientId}`);
  res.render('home');
});

// carer login endpoint
app.post('/loginCarer', urlencodedParser, (req, res) => {
  data = req.body;
  uID = data.uID;
  console.log("uID Received: " + uID);

  res.render('home');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

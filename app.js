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
const managePatients = require('./routes/managePatients')

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
  app.locals.loggedInCarer = 'OuEriORcMkZIdX510lRnYdc7ksF2';
  console.log(JSON.stringify(carers, null, 2));
});

function getPatients() {
  const ref = firebase.database().ref('patients_flattened');
  return ref.once('value').then(snap => snap.val())
}

getPatients().then(patients => {
  //console.log(JSON.stringify(patients, null, 2));
  app.locals.patients = patients;
});

let urlencodedParser = bodyParser.urlencoded({ extended: false })

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

// Route homepage
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/managePatients', (req, res) => {
  res.render('managePatients');
});

app.post('/managePatients', urlencodedParser, (req, res) => {
  console.log(req.body);

  //const ref = firebase.database().ref('patients_flattened');
  let newPatient = firebase.database().ref('patients_flattened');
  newPatient.push(req.body);
  res.render('managePatients');
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

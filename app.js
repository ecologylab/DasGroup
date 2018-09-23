const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();
const logger = require('./utils/logger');
const cors = require('cors');
app.use(cors())
require('dotenv').config()
require('./passport.js')(passport);

app.use(favicon(path.join(__dirname, 'public', 'coolGuy.ico')))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if ( !process.env.test ) { app.use(morgan('dev')); }
app.use(cookieParser());

app.use(session({
  secret: process.env.SESS_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.DB_CONN_DEV, { useNewUrlParser : true }).then(
  () => { logger.notice("Connected to database!") },
  err => { logger.error("ERROR - Database connection failed")}
)


app.use(passport.initialize() );
app.use(passport.session() )

app.use('/', require('./routing/root') );
app.use('/a', require('./routing/api') );

app.use( (req, res, next) => {
  let err = new Error('Not found');
  err.status = 404;
  next(err);
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (err.status === 404) {
    logger.error('Path not found %j %O', req.url, err);
  } else {
    logger.error('%O', err);
  }
  next()
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // res.status(err.status || 500);
  // res.render('error');
});

module.exports = app;

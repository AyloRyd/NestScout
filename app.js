import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import expressLayouts from 'express-ejs-layouts';
import session from "express-session";
import express_mysql_session from "express-mysql-session";
import flash from 'connect-flash';

import { config } from 'dotenv';

import indexRouter from './routes/index.js';
import authenticationRouter from './routes/authentication.js';
import userRouter from './routes/user.js';
import listingsRouter from './routes/listings.js';
import savedListingsRouter from './routes/saved-listings.js';

config();

const app = express();

app.set('views', path.join(path.resolve(), 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

const MySQLStore = express_mysql_session(session);
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

const sessionStore = new MySQLStore(options);
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
});

app.use(sessionMiddleware);
app.use(flash());
app.use((req, res, next) => {
  res.locals.title = 'NestScout | Find your nest now!';
  res.locals.isAuthenticated = req.session.isLoggedIn;
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  } else {
    res.locals.user = null;
  }
  next();
});

app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);
app.use('/user', userRouter)
app.use('/listings', listingsRouter);
app.use('/saved-listings', savedListingsRouter)

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default app;
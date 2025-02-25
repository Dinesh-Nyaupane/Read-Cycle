const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const Swal = require('sweetalert2');

// Create Express app
const app = express();
const port = process.env.PORT || 3333;

// Handlebars setup
const handlebars = exphbs.create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts/')
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Static file serving
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/statics", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dinesh@123',
  resave: false,
  saveUninitialized: true,
}));

// Database connection pool
const dbPool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
});

// Middleware to check if user is logged in
const checkLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.userLoggedIn = true;
    res.locals.user = req.session.user;
  } else {
    res.locals.userLoggedIn = false;
  }
  next();
};

// Apply middleware to all routes
app.use(checkLoggedIn);

// Use logger middleware with 'dev' format
app.use(logger('dev'));

// Array to store response time logs
const responseTimes = [];

// Custom middleware to log response time for all routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    responseTimes.push({ method: req.method, url: req.originalUrl, responseTime });
  });
  next();
});

// Import and use routes
const loginRoute = require('./routes/login')(dbPool);
app.use('/login', loginRoute);

const signupRoute = require('./routes/signup')(dbPool);
app.use('/signup', signupRoute);

const addBooksRoute = require('./routes/addBooks')(dbPool);
app.use('/addBooks', addBooksRoute);

const booksRoute = require('./routes/featuredBooks')(dbPool);
app.use('/books', booksRoute);

const categoryRoute = require('./routes/category')(dbPool);
app.use('/category', categoryRoute);

const myBooksRoute = require('./routes/myBooks')(dbPool);
app.use('/myBooks', myBooksRoute);

const bookDescriptionRoute = require('./routes/bookdescription')(dbPool);
app.use('/bookdescription', bookDescriptionRoute);

const comicsRoute = require('./routes/comics')(dbPool);
app.use('/comics', comicsRoute);

const academicRoute = require('./routes/academic')(dbPool);
app.use('/academic', academicRoute);

const poetryRoute = require('./routes/poetry')(dbPool);
app.use('/poetry', poetryRoute);

const scifiRoute = require('./routes/sci-fi')(dbPool);
app.use('/sci-fi', scifiRoute);

const motivationalRoute = require('./routes/motivational')(dbPool);
app.use('/motivational', motivationalRoute);

const mythologicalRoute = require('./routes/mythological')(dbPool);
app.use('/mythological', mythologicalRoute);

const classicRoute = require('./routes/classic')(dbPool);
app.use('/classic', classicRoute);

const literatureRoute = require('./routes/literature')(dbPool);
app.use('/literature', literatureRoute);

const nonfictionRoute = require('./routes/non-fiction')(dbPool);
app.use('/non-fiction', nonfictionRoute);

const romanceRoute = require('./routes/romance')(dbPool);
app.use('/romance', romanceRoute);

const mysteryRoute = require('./routes/mystery')(dbPool);
app.use('/mystery', mysteryRoute);

const fantasyRoute = require('./routes/fantasy')(dbPool);
app.use('/fantasy', fantasyRoute);

const deleteRoute = require('./routes/delete')(dbPool);
app.use('/delete', deleteRoute);

const updateRoute = require('./routes/update')(dbPool);
app.use('/update', updateRoute);

const searchBooksRoute = require('./routes/searchBooks')(dbPool);
app.use('/', searchBooksRoute); // Register the searchBooks route

// Root route
app.get('/', (req, res) => {
  const userLoggedIn = req.session && req.session.user;

  if (userLoggedIn) {
    res.render('home', {
      userLoggedIn: true,
      user: req.session.user,
      message: null
    });
  } else {
    const message = req.session.message;
    delete req.session.message;

    res.render('home', {
      userLoggedIn: false,
      message: message || 'Welcome to Read Cycle! Please log in to access your account.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Something went wrong! Error: ${err.message}`);
});

// Start the server and log response times
const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);

  console.log('Response times for routes:');
  responseTimes.forEach((log, index) => {
    console.log(`${index + 1}. ${log.method} ${log.url}: ${log.responseTime}ms`);
  });
});

module.exports = server;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const Swal = require('sweetalert2');

module.exports = (db) => {
  router.use(session({
    secret: 'dinesh@123',
    resave: false,
    saveUninitialized: true
  }));

  // Login route
  router.get('/', (req, res) => {
    const alreadyLoggedIn = req.session.user ? true : false;
    const successMessage = req.session.successMessage;
    const icon = req.session.icon; // Retrieve icon from session data
    delete req.session.successMessage;
    delete req.session.icon;
    const color = req.session.color; // Retrieve icon from session data
    delete req.session.color;


    return res.render('users/login', { alreadyLoggedIn, successMessage, icon });
  });

  router.post('/', async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;

      if (!usernameOrEmail || !password) {
        return res.render('users/login', { message: 'E-mail and password are required', icon: 'error', color:'red' });
      }

      const selectQuery = 'SELECT * FROM users WHERE email = ?';
      db.query(selectQuery, [usernameOrEmail], async (err, results) => {
        if (err) {
          console.error('Error querying database:', err);
          return res.render('users/login', { message: 'Internal Server Error', icon: 'error', color:'red' });
        }

        if (results.length === 0) {
          return res.render('users/login', { message: 'Invalid e-mail or password', icon: 'error', color:'red' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.render('users/login', { message: 'Invalid e-mail or password', icon: 'error', color:'red' });
        }

        req.session.user = user;
        req.session.successMessage = 'Logged in successfully';
        req.session.icon = 'success'; // Set icon to 'success' for successful login

        // Redirect to success page after 1 second
        setTimeout(() => {
          return res.redirect('/');
        }, 1000);
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.render('users/login', { message: 'Internal Server Error', icon: 'error', color:'red' });
    }
  });

  // Logout route
  router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error logging out:', err);
      }
      return 
      
      setTimeout(()=>{res.redirect('/login'),5000});
    });
  });

  return router;
};

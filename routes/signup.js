const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const validator = require('validator');

module.exports = (db) => {
  // GET request to render the signup form
  router.get('/', (req, res) => {
    res.render('users/signup', { message: req.query.message }); // Pass message data to the frontend
  });

  // POST request to handle form submission
  router.post('/', async (req, res) => {
    try {
      const { name, address, email, phone, password, confirmPassword } = req.body;

      let errors = {}; // Initialize the errors object

      // Backend validation using validator
      if (!validator.isLength(name, { min: 1, max: 255 })) {
        errors.name = 'Name is required';
      }
      if (!validator.isLength(address, { min: 1, max: 255 })) {
        errors.address = 'Address is required';
      }
      if (!validator.isEmail(email)) {
        errors.email = 'Invalid email';
      }
      if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
        errors.phone = 'Invalid phone number';
      }
      if (!validator.isLength(password, { min: 8 })) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length > 0) {
        // If there are validation errors, redirect to the signup page with error query parameters
        return res.redirect(`/signup?message=${encodeURIComponent('Please fill all the form fields.')}`);
      }

      // Check if the email already exists in the database
      const emailExistsQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
      db.query(emailExistsQuery, [email], (err, results) => {
        if (err) {
          console.error('Error checking email existence:', err);
          return res.redirect(`/signup?message=${encodeURIComponent('Internal Server Error')}`);
        }
        const emailExists = results[0].count > 0;
        if (emailExists) {
          // If the email already exists, redirect to the signup page with error query parameters
          return res.redirect(`/signup?message=${encodeURIComponent('Email already exists. Please proceed to login.')}`);
        }
        // Hash the password using bcrypt
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.redirect(`/signup?message=${encodeURIComponent('Internal Server Error')}`);
          }
          // Insert user data into the database
          const insertQuery = 'INSERT INTO users (name, address, email, phone, password) VALUES (?, ?, ?, ?, ?)';
          db.query(
            insertQuery,
            [name, address, email, phone, hashedPassword],
            (err, results) => {
              if (err) {
                console.error('Error inserting user data:', err);
                return res.redirect(`/signup?message=${encodeURIComponent('Internal Server Error')}`);
              }

              // Redirect to the signup success page
              res.redirect('/signup/success');
            }
          );
        });
      });
    } catch (error) {
      console.error('Error during signup:', error);
      res.redirect(`/signup?message=${encodeURIComponent('Internal Server Error')}`);
    }
  });

  // GET request for displaying signup success page
  router.get('/success', (req, res) => {
    res.redirect('/login'); // Assuming you have a login page HTML file
  });

  return router;
};

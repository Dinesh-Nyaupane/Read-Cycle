const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Middleware function to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login'); // Redirect to login page if user is not logged in
    }
    next(); // Proceed to the next middleware or route handler
  };

  // Route to display the books added by the logged-in user
  router.get('/', isAuthenticated, (req, res) => {
    // Retrieve the user ID from the session
    const user_id = req.session.user.userId;

    // Query the database to fetch books added for sale by the logged-in user
    const selectQuery = 'SELECT * FROM books WHERE userId = ? ORDER BY RAND()';
    db.query(selectQuery, [user_id], (err, results) => {
      if (err) {
        console.error('Error querying books data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const books = results; // Assuming the result contains an array of books

      // Render the 'myBooks' view with the filtered books data
      res.render('books/myBooks', { books });
    });
  });
  
  return router;
};

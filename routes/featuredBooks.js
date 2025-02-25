const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res) => {
    
    const selectQuery = 'SELECT * FROM books ORDER BY RAND()';
    
    db.query(selectQuery, (err, results) => {
      if (err) {
        console.error('Error querying books data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const books = results; // Assuming the result contains an array of books
      const isLoggedIn = req.session && req.session.user; // Check if user is logged in

      res.render('books/books', { books, isLoggedIn });
    });
  });

  return router;
};

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res) => {
    
    const selectQuery = 'SELECT * FROM books WHERE LOWER(genre) = "mythological" ORDER BY RAND()';
    
    db.query(selectQuery, (err, results) => {
      if (err) {
        console.error('Error querying books data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const books = results; // Assuming the result contains an array of books

      res.render('books/books', { books });
    });
  });

  return router;
};

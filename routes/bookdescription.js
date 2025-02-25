const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const getBookDetails = (bookId, callback) => {
    // console.log('Requested Book ID:', bookId);

    if (!bookId) {
      const error = new Error('Book ID is required');
      callback(error, null);
      return;
    }

    const selectQuery = `
      SELECT books.*, users.name AS sellerName, users.address AS sellerAddress, users.phone AS sellerPhone
      FROM books 
      INNER JOIN users ON books.userId = users.userId 
      WHERE books.book_id = ?`;
    db.query(selectQuery, [bookId], (error, results, fields) => {
      if (error) {
        console.error('Error executing database query:', error.message);
        callback(error, null);
        return;
      }

      if (!results || results.length === 0) {
        callback(null, null);
        return;
      }

      const book = results[0];
      callback(null, book);
    });
  };

  // Route to handle displaying individual book details
  router.get('/:bookId', async (req, res) => {
    try {
      const bookId = req.params.bookId;
      const isLoggedIn = req.session && req.session.user; // Check if user is logged in

      getBookDetails(bookId, (error, book) => {
        if (error) {
          res.status(500).send('Internal Server Error');
          return;
        }

        if (!book) {
          res.status(404).send('Book not found');
          return;
        }

        res.render('books/bookdescription', { book, isLoggedIn }); // Pass isLoggedIn to the template
      });
    } catch (error) {
      console.error('Error fetching book details:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  return router;
};

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Route to handle book deletion
  router.post('/:book_id', (req, res) => {
    // Retrieve the book ID from the request parameters
    const bookId = req.params.book_id;
  
    // Delete the book from the database
    const deleteQuery = 'DELETE FROM books WHERE book_id = ?';
    db.query(deleteQuery, [bookId], (err, result) => {
      if (err) {
        console.error('Error deleting book:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Redirect to the myBooks page after deleting the book
      res.redirect('/myBooks');
    });
  });

  return router;
};

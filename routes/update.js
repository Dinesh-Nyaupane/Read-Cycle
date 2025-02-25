const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Route to handle rendering the update form
  router.get('/:book_id', (req, res) => {
    const bookId = req.params.book_id;

    // Fetch the details of the book from the database
    const selectQuery = 'SELECT * FROM books WHERE book_id = ?';
    db.query(selectQuery, [bookId], (err, results) => {
      if (err) {
        console.error('Error fetching book details:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      if (results.length === 0) {
        res.status(404).send('Book not found');
        return;
      }

      // Render the update form with the book details pre-filled
      res.render('books/updateBook', { book: results[0] });
    });
  });

  // Route to handle updating a book
  router.post('/:book_id', (req, res) => {
    const bookId = req.params.book_id;

    // Extract updated book details from the form submission
    const { title, author, ISBN, genre, synopsis, price, image_url } = req.body;

    // Update the book details in the database
    const updateQuery = `
      UPDATE books 
      SET title = ?, author = ?, ISBN = ?, genre = ?, synopsis = ?, price = ?, image_url = ? 
      WHERE book_id = ?`;

    const values = [title, author, ISBN, genre, synopsis, price, image_url, bookId];

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error('Error updating book details:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Redirect to the myBooks page after updating the book
      setTimeout(() => {
        res.redirect('/myBooks');
      }, 1500);
          });
  });

  return router;
};

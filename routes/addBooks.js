const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      // If user is not authenticated, send unauthorized response
      res.redirect("/login");
    }
    // If user is authenticated, proceed to next middleware or route handler
    next();
  };

  // Apply the isAuthenticated middleware to the add books route
  router.use(isAuthenticated);

  router.get('/', (req, res) => {
    res.render('books/addBooks', { user: req.session.user });
  });

  router.post('/', (req, res) => {
    try {
      const {
        title,
        author,
        ISBN,
        genre,
        synopsis,
        price,
        image_url,
      } = req.body;

      const user_id = req.session.user.userId; // Extract user ID from session

      const insertQuery = `
        INSERT INTO books (title, author, ISBN, genre, synopsis, price, image_url, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          title,
          author,
          ISBN,
          genre,
          synopsis,
          price,
          image_url,
          user_id
        ],
        (err, results) => {
          if (err) {
            console.error('Error inserting book data:', err);
            return res.status(500).send('Internal Server Error');
          }

          res.redirect('/myBooks');
        }
      );
    } catch (error) {
      console.error('Error inserting book data:', error.sqlMessage);
      res.status(500).send('Internal Server Error');
    }
  });

  return router;
};

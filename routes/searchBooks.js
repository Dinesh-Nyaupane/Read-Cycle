const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

module.exports = (db) => {
    router.use(bodyParser.json());

    router.get('/searchBooks', (req, res) => {
        const searchQuery = req.query.q;

        if (!searchQuery) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const query = `SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?`;
        const values = [`%${searchQuery}%`, `%${searchQuery}%`,`%${searchQuery}%`];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error executing query:', err.stack);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length > 0) {
                res.render('books/books', { books: results, count: results.length });
            } else {
                res.render('books/books', { books: [], count: 0 });
            }
        });
    });

    return router;
};

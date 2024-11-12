const express = require('express');
const router = express.Router();

const {addBook, updateBook, deleteBook, getBooks} = require('../controllers/bookController');
const {auth} = require('../middleware/Auth');

router.post('/add', auth, addBook);
router.put('/update/:id', auth, updateBook);
router.delete('/delete/:id', auth, deleteBook);
router.get('/get', auth, getBooks);

module.exports = router;
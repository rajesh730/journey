const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const books = await Book.find({});
        console.log('All Books:', books);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

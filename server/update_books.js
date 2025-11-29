const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const result = await Book.updateMany({}, { isPublic: true });
        console.log('Update Result:', result);
        const books = await Book.find({});
        console.log('All Books after update:', books);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

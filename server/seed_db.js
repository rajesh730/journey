require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const sampleBook = new Book({
            title: "The Moon's Secret",
            author: "Luna",
            pages: ["Once upon a time, the moon had a secret...", "It was made of cheese!"],
            category: "Story",
            isPublic: true,
            owner: new mongoose.Types.ObjectId() // Random owner ID
        });

        await sampleBook.save();
        console.log('Sample book created!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

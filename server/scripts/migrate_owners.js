require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Find a user to assign books to
            const user = await User.findOne();
            if (!user) {
                console.error('No users found. Please create a user first.');
                process.exit(1);
            }
            console.log(`Assigning orphan books to user: ${user.username} (${user._id})`);

            // Update books with no owner
            const result = await Book.updateMany(
                { owner: { $exists: false } },
                { $set: { owner: user._id } }
            );

            console.log(`Updated ${result.modifiedCount} books.`);
        } catch (err) {
            console.error('Migration error:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

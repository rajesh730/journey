require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');

async function testConnection() {
    console.log('Testing MongoDB connection...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully!');

        const userCount = await User.countDocuments();
        console.log(`Users count: ${userCount}`);

        const bookCount = await Book.countDocuments();
        console.log(`Books count: ${bookCount}`);

        const books = await Book.find({});
        console.log('Sample books:', books.slice(0, 2));

    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

testConnection();

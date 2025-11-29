require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/Book');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Configure CORS for production
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // Fail after 5 seconds if cannot connect
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const stickerRoutes = require('./routes/stickers');

app.use('/api/auth', authRoutes);
app.use('/api/stickers', stickerRoutes);

// GET all books (with optional filters)
app.get('/api/books', async (req, res) => {
    console.log('GET /api/books request received');
    try {
        const { category, author, mine } = req.query;
        console.log('Query params:', { category, author, mine });
        let filter = {};

        // If 'mine' is true, we need to verify the user token manually here since this route is public
        if (mine === 'true') {
            const token = req.header('x-auth-token');
            if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
                filter.owner = decoded.id;
            } catch (err) {
                return res.status(401).json({ message: 'Token is not valid' });
            }
        } else {
            // Default behavior: show public books
            filter.isPublic = true;
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (author) {
            filter.author = { $regex: author, $options: 'i' }; // Case-insensitive search
        }

        console.log('Filter:', filter);
        const books = await Book.find(filter).sort({ updatedAt: -1 });
        console.log(`Found ${books.length} books`);
        res.json(books);
    } catch (err) {
        console.error('Error in GET /api/books:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST a new book
app.post('/api/books', auth, async (req, res) => {
    try {
        const { title, author, pages, category, isPublic } = req.body;
        const newBook = new Book({
            title,
            author,
            pages,
            category,
            isPublic,
            owner: req.user.id
        });
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a book
app.put('/api/books/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        // Check ownership
        if (!book.owner || book.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this book' });
        }

        const { title, author, pages, category, isPublic } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, pages, category, isPublic },
            { new: true }
        );
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a book
app.delete('/api/books/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        // Check ownership
        if (!book.owner || book.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this book' });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

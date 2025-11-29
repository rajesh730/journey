const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    pages: [{
        type: String,
        default: ''
    }],
    category: {
        type: String,
        enum: ['Story', 'Poem', 'Novel', 'Journal', 'Adventure', 'Fantasy', 'Romance', 'Other'],
        default: 'Story'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

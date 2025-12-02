const mongoose = require('mongoose');

const stickerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        required: false // Optional for sticky notes
    },
    color: {
        type: String,
        default: 'bg-pink-100'
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    rotation: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['sticker', 'note'],
        default: 'sticker'
    },
    size: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.5
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Sticker', stickerSchema);

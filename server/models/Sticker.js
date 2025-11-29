const mongoose = require('mongoose');

const stickerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        required: true
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Sticker', stickerSchema);

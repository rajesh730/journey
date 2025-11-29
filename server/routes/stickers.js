const express = require('express');
const router = express.Router();
const Sticker = require('../models/Sticker');
const auth = require('../middleware/auth');

// GET all stickers for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const stickers = await Sticker.find({ owner: req.user.id });
        res.json(stickers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new sticker
router.post('/', auth, async (req, res) => {
    try {
        const { text, emoji, color, x, y, rotation } = req.body;
        const newSticker = new Sticker({
            text,
            emoji,
            color,
            x,
            y,
            rotation,
            owner: req.user.id
        });
        const savedSticker = await newSticker.save();
        res.json(savedSticker);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a sticker (position, rotation, etc.)
router.put('/:id', auth, async (req, res) => {
    try {
        const sticker = await Sticker.findById(req.params.id);
        if (!sticker) return res.status(404).json({ message: 'Sticker not found' });

        if (sticker.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedSticker = await Sticker.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedSticker);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a sticker
router.delete('/:id', auth, async (req, res) => {
    try {
        const sticker = await Sticker.findById(req.params.id);
        if (!sticker) return res.status(404).json({ message: 'Sticker not found' });

        if (sticker.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Sticker.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sticker deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

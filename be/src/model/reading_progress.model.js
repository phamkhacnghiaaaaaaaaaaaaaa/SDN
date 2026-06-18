const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    current_page: { type: Number, default: 1 },
    last_read: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.models.ReadingProgress || mongoose.model('ReadingProgress', readingProgressSchema, 'reading_progress');

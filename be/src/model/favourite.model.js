const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.models.Favourite || mongoose.model('Favourite', favouriteSchema, 'favourites');

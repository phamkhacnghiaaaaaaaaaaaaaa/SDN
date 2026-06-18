const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    isbn: { type: String, required: true, unique: true },
    cover_image: { type: String },
    pdf_url: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    available_quantity: { type: Number, default: 0 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    publisher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
}, {
    timestamps: true
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema, 'books');

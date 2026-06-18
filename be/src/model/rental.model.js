const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rent_date: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    return_date: { type: Date },
    status: { type: String, enum: ['Pending', 'Giao sách', 'Đã trả', 'Hủy'], default: 'Pending' },
    items: [{
        book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        quantity: { type: Number, default: 1 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.models.Rental || mongoose.model('Rental', rentalSchema, 'rentals');

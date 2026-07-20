const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rent_date: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    return_date: { type: Date },
    status: { type: String, enum: ['pending', 'accepted', 'cancelled', 'borrowed', 'returned'], default: 'pending' },
    items: [{
        book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        quantity: { type: Number, default: 1 },
        // Phí thuê 1 bản tại thời điểm thuê (đóng băng để lịch sử không đổi khi admin sửa giá)
        unit_fee: { type: Number, default: 0 }
    }],
    // Tổng phí thuê của đơn (= sum(quantity * unit_fee)) cho 1 kỳ hạn
    fee: { type: Number, default: 0 },
    // Phí phạt trễ hạn, chốt khi trả sách
    late_fee: { type: Number, default: 0 },
    // Trạng thái thanh toán phí thuê
    payment_status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paid_at: { type: Date },
    // Số lần đã gia hạn
    extensions: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.models.Rental || mongoose.model('Rental', rentalSchema, 'rentals');

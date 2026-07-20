const mongoose = require('mongoose');
const { RENTAL_PERIOD_DAYS, LATE_FEE_PER_DAY } = require('../config/rental.config');

/**
 * Cấu hình hệ thống (singleton — chỉ có 1 document duy nhất).
 * Cho phép Admin chỉnh kỳ hạn thuê và phí trễ hạn mà không cần sửa code.
 */
const settingSchema = new mongoose.Schema({
    rental_period_days: { type: Number, default: RENTAL_PERIOD_DAYS, min: 1 },
    late_fee_per_day: { type: Number, default: LATE_FEE_PER_DAY, min: 0 },
}, {
    timestamps: true
});

// Lấy (hoặc tạo nếu chưa có) document cấu hình duy nhất
settingSchema.statics.getSingleton = async function () {
    let setting = await this.findOne();
    if (!setting) setting = await this.create({});
    return setting;
};

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema, 'settings');

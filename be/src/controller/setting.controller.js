const Setting = require('../model/setting.model');

// GET /settings - đọc cấu hình hiện tại (công khai để FE hiển thị kỳ hạn/phí đúng)
const getSettings = async (req, res) => {
    try {
        const setting = await Setting.getSingleton();
        res.status(200).json({
            rental_period_days: setting.rental_period_days,
            late_fee_per_day: setting.late_fee_per_day,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /settings - cập nhật cấu hình (chỉ Admin)
const updateSettings = async (req, res) => {
    try {
        const { rental_period_days, late_fee_per_day } = req.body;
        const setting = await Setting.getSingleton();

        if (rental_period_days !== undefined) {
            const v = Number(rental_period_days);
            if (Number.isNaN(v) || v < 1) {
                return res.status(400).json({ message: 'Rental period must be at least 1 day' });
            }
            setting.rental_period_days = v;
        }

        if (late_fee_per_day !== undefined) {
            const v = Number(late_fee_per_day);
            if (Number.isNaN(v) || v < 0) {
                return res.status(400).json({ message: 'Late fee must be >= 0' });
            }
            setting.late_fee_per_day = v;
        }

        await setting.save();
        res.status(200).json({
            message: 'Settings updated',
            rental_period_days: setting.rental_period_days,
            late_fee_per_day: setting.late_fee_per_day,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSettings, updateSettings };

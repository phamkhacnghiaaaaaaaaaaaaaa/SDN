/**
 * Cấu hình chung cho nghiệp vụ cho thuê sách.
 * Định hướng: thuê theo kỳ, tính phí thuê mỗi lượt + phí phạt trễ hạn.
 * Xem docs/dinh-huong-san-pham.md
 */
module.exports = {
    // Kỳ hạn thuê mặc định (ngày)
    RENTAL_PERIOD_DAYS: 14,
    // Phí phạt trễ hạn: VND / ngày / bản sách
    LATE_FEE_PER_DAY: 5000,
};

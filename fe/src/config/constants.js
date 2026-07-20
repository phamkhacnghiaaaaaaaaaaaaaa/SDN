// Giá trị mặc định phía client (khớp với be/src/config/rental.config.js).
// Giá trị thực tế lấy từ SettingsContext (API /settings) khi chạy.
export const RENTAL_PERIOD_DAYS = 14;
export const LATE_FEE_PER_DAY = 5000;

// Định dạng tiền VND
export const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

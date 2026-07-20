import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Settings, CalendarClock, AlertTriangle, Save } from "lucide-react";
import * as adminService from "../../service/admin.service";
import { useSettings } from "../../context/SettingsContext";
import { formatVND } from "../../config/constants";

const SystemSettings = () => {
    const { refresh } = useSettings();
    const [form, setForm] = useState({ rental_period_days: "", late_fee_per_day: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await adminService.getSettings();
                setForm({
                    rental_period_days: data.rental_period_days,
                    late_fee_per_day: data.late_fee_per_day,
                });
            } catch (err) {
                toast.error(err.response?.data?.message || "Không tải được cấu hình");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const period = Number(form.rental_period_days);
        const lateFee = Number(form.late_fee_per_day);
        if (Number.isNaN(period) || period < 1) {
            toast.error("Kỳ hạn thuê phải >= 1 ngày");
            return;
        }
        if (Number.isNaN(lateFee) || lateFee < 0) {
            toast.error("Phí trễ hạn phải >= 0");
            return;
        }
        setSaving(true);
        try {
            await adminService.updateSettings({
                rental_period_days: period,
                late_fee_per_day: lateFee,
            });
            await refresh();
            toast.success("Đã lưu cấu hình");
        } catch (err) {
            toast.error(err.response?.data?.message || "Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return <div className="py-24 text-center text-text-muted animate-pulse">Đang tải cấu hình...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Settings size={24} className="text-primary" /> Cấu hình hệ thống
                </h1>
                <p className="text-text-muted text-sm mt-1">
                    Thiết lập kỳ hạn thuê và phí phạt trễ hạn áp dụng toàn hệ thống.
                </p>
            </div>

            <form onSubmit={handleSave} className="bg-bg-secondary border border-border rounded-2xl shadow-md p-6 space-y-6">
                {/* Kỳ hạn thuê */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <CalendarClock size={16} className="text-primary" /> Kỳ hạn thuê (ngày)
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={form.rental_period_days}
                        onChange={(e) => setForm((f) => ({ ...f, rental_period_days: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-text-muted mt-1.5">
                        Số ngày mỗi lượt thuê. Áp dụng cho đơn mới và mỗi lần gia hạn.
                    </p>
                </div>

                {/* Phí trễ hạn */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                        <AlertTriangle size={16} className="text-warning" /> Phí trễ hạn (₫ / ngày / bản)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="1000"
                        value={form.late_fee_per_day}
                        onChange={(e) => setForm((f) => ({ ...f, late_fee_per_day: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-text-muted mt-1.5">
                        Hiện tại: <span className="text-white font-semibold">{formatVND(Number(form.late_fee_per_day) || 0)}</span> / ngày / mỗi bản sách quá hạn.
                    </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-border">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all disabled:opacity-60"
                    >
                        <Save size={16} /> {saving ? "Đang lưu..." : "Lưu cấu hình"}
                    </button>
                </div>
            </form>

            <div className="text-xs text-text-muted bg-bg-secondary border border-border rounded-xl p-4">
                <p className="font-semibold text-text-secondary mb-1">Lưu ý</p>
                Thay đổi chỉ ảnh hưởng tới các đơn <b>tạo mới</b> và các lần <b>gia hạn</b> sau khi lưu.
                Đơn đã tạo trước đó vẫn giữ kỳ hạn/phí đã chốt.
            </div>
        </div>
    );
};

export default SystemSettings;

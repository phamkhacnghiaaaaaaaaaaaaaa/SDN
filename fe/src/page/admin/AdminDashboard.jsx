import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Users,
    ClipboardList,
    DollarSign,
    Layers,
    UserCog,
    AlertTriangle,
    Clock,
    TrendingUp,
    PackageX,
} from "lucide-react";
import * as adminService from "../../service/admin.service";

const STATUS_META = {
    pending: { label: "Chờ duyệt", color: "#f59e0b" },
    accepted: { label: "Đã duyệt", color: "#4f8cff" },
    borrowed: { label: "Đang mượn", color: "#8b5cf6" },
    returned: { label: "Đã trả", color: "#22c55e" },
    cancelled: { label: "Đã hủy", color: "#ef4444" },
};

const currency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
        n || 0
    );

const coverUrl = (img) => (img ? `/images/${img}.jpg` : null);

/* ---------- Sub-components ---------- */

const StatCard = ({ icon: Icon, label, value, sub, tint }) => (
    <div className="bg-bg-secondary border border-border rounded-2xl p-5 shadow-md hover:border-primary/40 transition-colors">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {label}
                </p>
                <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
                {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
            </div>
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${tint}1a`, color: tint }}
            >
                <Icon size={22} />
            </div>
        </div>
    </div>
);

const Panel = ({ title, icon: Icon, action, children }) => (
    <div className="bg-bg-secondary border border-border rounded-2xl shadow-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                {Icon && <Icon size={16} className="text-primary" />}
                {title}
            </h3>
            {action}
        </div>
        <div className="p-5 flex-1">{children}</div>
    </div>
);

// Biểu đồ cột đơn thuê theo tháng (SVG thuần)
const MonthlyChart = ({ data }) => {
    const max = Math.max(1, ...data.map((d) => d.count));
    return (
        <div className="flex items-end justify-between gap-3 h-48 pt-4">
            {data.map((d, i) => {
                const h = (d.count / max) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-xs font-bold text-white">{d.count}</span>
                        <div className="w-full flex items-end h-full">
                            <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary transition-all"
                                style={{ height: `${h}%`, minHeight: d.count > 0 ? 4 : 0 }}
                                title={`${d.label}: ${d.count}`}
                            />
                        </div>
                        <span className="text-[11px] text-text-muted">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

// Donut trạng thái đơn thuê (conic-gradient)
const StatusDonut = ({ rentalsByStatus }) => {
    const entries = Object.entries(rentalsByStatus).filter(([, v]) => v > 0);
    const total = entries.reduce((s, [, v]) => s + v, 0);

    let acc = 0;
    const segments = entries.map(([key, val]) => {
        const start = (acc / total) * 360;
        acc += val;
        const end = (acc / total) * 360;
        return `${STATUS_META[key].color} ${start}deg ${end}deg`;
    });
    const gradient =
        total > 0
            ? `conic-gradient(${segments.join(", ")})`
            : "conic-gradient(#334155 0deg 360deg)";

    return (
        <div className="flex items-center gap-6">
            <div className="relative shrink-0">
                <div
                    className="w-32 h-32 rounded-full"
                    style={{ background: gradient }}
                />
                <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-bg-secondary flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-white">{total}</span>
                    <span className="text-[10px] text-text-muted">đơn</span>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                {Object.entries(STATUS_META).map(([key, meta]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ background: meta.color }}
                        />
                        <span className="text-text-muted flex-1">{meta.label}</span>
                        <span className="font-bold text-white">
                            {rentalsByStatus[key] || 0}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BookThumb = ({ title, cover }) => {
    const url = coverUrl(cover);
    return url ? (
        <img
            src={url}
            alt={title}
            className="w-8 h-11 object-cover rounded shrink-0"
            onError={(e) => (e.currentTarget.style.display = "none")}
        />
    ) : (
        <div className="w-8 h-11 rounded bg-surface flex items-center justify-center shrink-0">
            <BookOpen size={14} className="text-text-muted" />
        </div>
    );
};

/* ---------- Main page ---------- */

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || "Không tải được số liệu dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading)
        return (
            <div className="py-24 text-center text-text-muted animate-pulse">
                Đang tải số liệu...
            </div>
        );

    if (error)
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
            </div>
        );

    const { totals, inventory, rentalsByStatus, estimatedRevenue, overdueCount } =
        stats;
    const lateFeeRevenue = stats.lateFeeRevenue || 0;
    const activeRentals = rentalsByStatus.pending + rentalsByStatus.accepted + rentalsByStatus.borrowed;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Tổng quan hệ thống</h1>
                <p className="text-text-muted text-sm mt-1">
                    Số liệu toàn bộ thư viện SDN302 — cập nhật theo thời gian thực.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={BookOpen}
                    label="Đầu sách"
                    value={totals.totalTitles}
                    sub={`${inventory.totalCopies} bản • ${inventory.availableCopies} sẵn có`}
                    tint="#4f8cff"
                />
                <StatCard
                    icon={Users}
                    label="Người dùng"
                    value={totals.totalUsers}
                    sub={`${totals.totalStaff} nhân sự (Staff/Admin)`}
                    tint="#8b5cf6"
                />
                <StatCard
                    icon={ClipboardList}
                    label="Đơn thuê"
                    value={totals.totalRentals}
                    sub={`${activeRentals} đơn đang xử lý`}
                    tint="#22c55e"
                />
                <StatCard
                    icon={DollarSign}
                    label="Doanh thu ước tính"
                    value={currency(estimatedRevenue)}
                    sub={`Gồm ${currency(lateFeeRevenue)} phí trễ hạn`}
                    tint="#f59e0b"
                />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Layers} label="Thể loại" value={totals.totalCategories} tint="#38bdf8" />
                <StatCard icon={UserCog} label="Tác giả" value={totals.totalAuthors} tint="#38bdf8" />
                <StatCard icon={BookOpen} label="NXB" value={totals.totalPublishers} tint="#38bdf8" />
                <StatCard icon={PackageX} label="Bản đang mượn" value={inventory.borrowedCopies} tint="#8b5cf6" />
                <StatCard icon={AlertTriangle} label="Sách sắp hết" value={stats.lowStockBooks.length} tint="#f59e0b" />
                <StatCard icon={Clock} label="Đơn quá hạn" value={overdueCount} tint="#ef4444" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Panel title="Đơn thuê 6 tháng gần nhất" icon={TrendingUp}>
                        <MonthlyChart data={stats.monthlyRentals} />
                    </Panel>
                </div>
                <Panel title="Đơn thuê theo trạng thái" icon={ClipboardList}>
                    <StatusDonut rentalsByStatus={rentalsByStatus} />
                </Panel>
            </div>

            {/* Tables row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low stock */}
                <Panel
                    title="Sách sắp hết hàng"
                    icon={AlertTriangle}
                    action={
                        <Link to="/admin/books" className="text-xs text-primary hover:underline">
                            Quản lý sách
                        </Link>
                    }
                >
                    {stats.lowStockBooks.length === 0 ? (
                        <p className="text-sm text-text-muted italic">Không có sách nào sắp hết.</p>
                    ) : (
                        <ul className="space-y-3">
                            {stats.lowStockBooks.map((b) => (
                                <li key={b._id} className="flex items-center gap-3">
                                    <BookThumb title={b.title} cover={b.cover_image} />
                                    <span className="flex-1 text-sm text-white truncate">{b.title}</span>
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full border ${b.available_quantity === 0
                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                            }`}
                                    >
                                        {b.available_quantity}/{b.quantity} còn
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                {/* Top books */}
                <Panel title="Top sách được mượn" icon={TrendingUp}>
                    {stats.topBooks.length === 0 ? (
                        <p className="text-sm text-text-muted italic">Chưa có dữ liệu mượn sách.</p>
                    ) : (
                        <ul className="space-y-3">
                            {stats.topBooks.map((b, i) => (
                                <li key={b._id} className="flex items-center gap-3">
                                    <span className="w-5 text-center font-extrabold text-text-muted">{i + 1}</span>
                                    <BookThumb title={b.title} cover={b.cover_image} />
                                    <span className="flex-1 text-sm text-white truncate">{b.title}</span>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {b.borrowCount} lượt
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            {/* Tables row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue */}
                <Panel
                    title="Đơn quá hạn chưa trả"
                    icon={Clock}
                    action={
                        <Link to="/admin/rentals" className="text-xs text-primary hover:underline">
                            Xem đơn thuê
                        </Link>
                    }
                >
                    {stats.overdueRentals.length === 0 ? (
                        <p className="text-sm text-text-muted italic">Không có đơn quá hạn. 🎉</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {stats.overdueRentals.map((r) => (
                                <li key={r._id} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {r.user_id?.fullname || "Ẩn danh"}
                                        </p>
                                        <p className="text-xs text-text-muted truncate">
                                            {r.items?.map((i) => i.book_id?.title).filter(Boolean).join(", ")}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-red-400 shrink-0">
                                        Hạn: {new Date(r.due_date).toLocaleDateString("vi-VN")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                {/* Recent */}
                <Panel
                    title="Đơn thuê gần đây"
                    icon={ClipboardList}
                    action={
                        <Link to="/admin/rentals" className="text-xs text-primary hover:underline">
                            Tất cả
                        </Link>
                    }
                >
                    {stats.recentRentals.length === 0 ? (
                        <p className="text-sm text-text-muted italic">Chưa có đơn thuê nào.</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {stats.recentRentals.map((r) => (
                                <li key={r._id} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {r.user_id?.fullname || "Ẩn danh"}
                                        </p>
                                        <p className="text-xs text-text-muted truncate">
                                            {new Date(r.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                    <span
                                        className="text-xs font-bold px-2 py-1 rounded-full border capitalize shrink-0"
                                        style={{
                                            background: `${STATUS_META[r.status]?.color}1a`,
                                            color: STATUS_META[r.status]?.color,
                                            borderColor: `${STATUS_META[r.status]?.color}33`,
                                        }}
                                    >
                                        {STATUS_META[r.status]?.label || r.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </div>
    );
};

export default AdminDashboard;

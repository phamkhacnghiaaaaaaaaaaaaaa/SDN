import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Tags, Check } from "lucide-react";
import * as taxonomyService from "../../service/taxonomy.service";

const TABS = [
    { key: "categories", label: "Thể loại", hasBio: false },
    { key: "authors", label: "Tác giả", hasBio: true },
    { key: "publishers", label: "Nhà xuất bản", hasBio: false },
];

const emptyForm = { name: "", bio: "" };

const ManageTaxonomy = () => {
    const [tab, setTab] = useState("categories");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = create
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const activeTab = TABS.find((t) => t.key === tab);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await taxonomyService.getAll(tab);
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Không tải được dữ liệu");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({ name: item.name || "", bio: item.bio || "" });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Tên không được để trống");
            return;
        }
        setSaving(true);
        try {
            const payload = { name: form.name.trim() };
            if (activeTab.hasBio) payload.bio = form.bio.trim();

            if (editing) {
                await taxonomyService.update(tab, editing._id, payload);
                toast.success("Đã cập nhật");
            } else {
                await taxonomyService.create(tab, payload);
                toast.success("Đã thêm mới");
            }
            setModalOpen(false);
            fetchItems();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Xóa "${item.name}"? Hành động này không thể hoàn tác.`)) return;
        try {
            await taxonomyService.remove(tab, item._id);
            toast.success("Đã xóa");
            setItems((prev) => prev.filter((x) => x._id !== item._id));
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa thất bại");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Tags size={24} className="text-primary" /> Danh mục dữ liệu
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        Quản lý thể loại, tác giả và nhà xuất bản.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Thêm {activeTab.label.toLowerCase()}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all ${tab === t.key
                            ? "border-primary text-primary"
                            : "border-transparent text-text-muted hover:text-white"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-bg-secondary rounded-2xl border border-border shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-surface/30">
                                <th className="p-4 text-xs font-bold uppercase text-text-muted w-16">#</th>
                                <th className="p-4 text-xs font-bold uppercase text-text-muted">Tên</th>
                                {activeTab.hasBio && (
                                    <th className="p-4 text-xs font-bold uppercase text-text-muted">Tiểu sử</th>
                                )}
                                <th className="p-4 text-xs font-bold uppercase text-text-muted text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab.hasBio ? 4 : 3} className="p-8 text-center text-text-muted animate-pulse">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab.hasBio ? 4 : 3} className="p-8 text-center text-text-muted italic">
                                        Chưa có dữ liệu. Bấm "Thêm" để tạo mới.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, idx) => (
                                    <tr key={item._id} className="hover:bg-surface/10 transition-colors">
                                        <td className="p-4 text-text-muted text-sm">{idx + 1}</td>
                                        <td className="p-4 font-semibold text-white text-sm">{item.name}</td>
                                        {activeTab.hasBio && (
                                            <td className="p-4 text-text-muted text-sm max-w-md truncate">
                                                {item.bio || <span className="italic">—</span>}
                                            </td>
                                        )}
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-bg-secondary border border-border rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h3 className="font-bold text-white">
                                {editing ? "Chỉnh sửa" : "Thêm mới"} · {activeTab.label}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-surface"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-muted mb-1.5">Tên *</label>
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder={`Nhập tên ${activeTab.label.toLowerCase()}`}
                                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary"
                                />
                            </div>
                            {activeTab.hasBio && (
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted mb-1.5">Tiểu sử</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                        rows={3}
                                        placeholder="Giới thiệu ngắn về tác giả..."
                                        className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-border text-text-muted hover:text-white hover:bg-surface text-sm font-semibold transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-60"
                                >
                                    <Check size={16} /> {saving ? "Đang lưu..." : "Lưu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTaxonomy;

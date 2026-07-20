import React, { useState, useEffect, useRef } from "react";
import { X, Save, Search, User, BookOpen, Trash2, Plus, Minus, ShoppingBag, ChevronRight, RefreshCw, Star } from "lucide-react";
import * as rentalService from "../../service/rental.service";
import * as authService from "../../service/auth.service";
import * as bookService from "../../service/books.service";
import { formatVND } from "../../config/constants";

const CreateRental = ({ isOpen, onClose, onRentalCreated }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [bookInput, setBookInput] = useState("");
    const [status, setStatus] = useState("accepted");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [dbUsers, setDbUsers] = useState([]);
    const [dbBooks, setDbBooks] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [showUserSuggestions, setShowUserSuggestions] = useState(false);
    const [showBookSuggestions, setShowBookSuggestions] = useState(false);

    const userRef = useRef();
    const bookRef = useRef();

    useEffect(() => {
        if (isOpen) fetchInitialData();
    }, [isOpen]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userRef.current && !userRef.current.contains(event.target)) setShowUserSuggestions(false);
            if (bookRef.current && !bookRef.current.contains(event.target)) setShowBookSuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchInitialData = async () => {
        try {
            const [users, booksData] = await Promise.all([
                authService.getAllUsers().catch(() => []),
                bookService.getAllBooks(1, 200).then(res => res.data).catch(() => []),
            ]);
            setDbUsers(users);
            setDbBooks(booksData);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    if (!isOpen) return null;

    // --- LOGIC GỢI Ý NGƯỜI DÙNG ---
    const handleUserFocus = () => {
        if (!userInput.trim()) {
            // Nếu chưa nhập gì, hiện 10 người đầu tiên
            setFilteredUsers(dbUsers.slice(0, 10));
        }
        setShowUserSuggestions(true);
    };

    const handleUserInputChange = (e) => {
        const value = e.target.value;
        setUserInput(value);
        if (!value.trim()) {
            setFilteredUsers(dbUsers.slice(0, 10));
        } else {
            const filtered = dbUsers.filter(u =>
                (u.fullname || "").toLowerCase().includes(value.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(value.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
        setShowUserSuggestions(true);
    };

    // --- LOGIC GỢI Ý SÁCH ---
    const handleBookFocus = () => {
        if (!bookInput.trim()) {
            // Nếu chưa nhập gì, hiện 10 quyển sách đầu tiên
            setFilteredBooks(dbBooks.slice(0, 10));
        }
        setShowBookSuggestions(true);
    };

    const handleBookInputChange = (e) => {
        const value = e.target.value;
        setBookInput(value);
        if (!value.trim()) {
            setFilteredBooks(dbBooks.slice(0, 10));
        } else {
            const filtered = dbBooks.filter(b =>
                (b.title || "").toLowerCase().includes(value.toLowerCase()) ||
                (b.isbn || "").includes(value)
            );
            setFilteredBooks(filtered);
        }
        setShowBookSuggestions(true);
    };

    const handleSelectBook = (book) => {
        if (selectedItems.find(item => item.book._id === book._id)) return;
        setSelectedItems([...selectedItems, { book, quantity: 1 }]);
        setBookInput("");
        setShowBookSuggestions(false);
    };

    const handleQuantityChange = (bookId, delta, max) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.book._id === bookId) {
                const newQty = Math.min(max, Math.max(1, item.quantity + delta));
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || selectedItems.length === 0) {
            setError("Please select a customer and at least one book.");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                user_id: selectedUser._id,
                items: selectedItems.map(item => ({ book_id: item.book._id, quantity: item.quantity })),
                status
            };
            await rentalService.createRentalByStaff(payload);
            onRentalCreated();
            onClose();
            setSelectedItems([]);
            setSelectedUser(null);
            setUserInput("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create rental");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-bg-secondary w-full max-w-4xl rounded-[32px] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white leading-none">New Rental Order</h2>
                            <p className="text-sm text-text-muted mt-1">Staff Dashboard Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-all text-text-muted hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-8">
                    {/* SECTION 1: CUSTOMER */}
                    <section>
                        <label className="flex items-center gap-2 text-xs font-black uppercase text-primary tracking-widest mb-4">
                            <User size={14} /> 1. Select Customer
                        </label>

                        {!selectedUser ? (
                            <div className="relative" ref={userRef}>
                                <input
                                    value={userInput}
                                    onFocus={handleUserFocus}
                                    onChange={handleUserInputChange}
                                    className="w-full bg-surface/30 border border-border rounded-2xl px-6 py-4 text-white focus:border-primary transition-all"
                                    placeholder="Search or select from suggested customers..."
                                />
                                {showUserSuggestions && filteredUsers.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-2 bg-bg-secondary border border-border rounded-2xl shadow-2xl max-h-60 overflow-auto divide-y divide-border">
                                        {!userInput && <li className="px-4 py-2 bg-surface/30 text-[10px] font-black text-primary uppercase tracking-tighter flex items-center gap-2"><Star size={10} /> Latest Members</li>}
                                        {filteredUsers.map(u => (
                                            <li key={u._id} onClick={() => { setSelectedUser(u); setShowUserSuggestions(false) }} className="p-4 hover:bg-primary/10 cursor-pointer flex items-center justify-between group">
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-primary">{u.fullname}</p>
                                                    <p className="text-xs text-text-muted">{u.email}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-text-muted" />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-5 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xl">
                                        {selectedUser.fullname[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-white">{selectedUser.fullname}</p>
                                        <p className="text-xs text-text-muted">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-xs font-bold text-primary hover:underline">Change Customer</button>
                            </div>
                        )}
                    </section>

                    {/* SECTION 2: ADD BOOKS */}
                    <section>
                        <label className="flex items-center gap-2 text-xs font-black uppercase text-primary tracking-widest mb-4">
                            <BookOpen size={14} /> 2. Add Books to Order
                        </label>
                        <div className="relative" ref={bookRef}>
                            <div className="relative">
                                <Search className="absolute left-5 top-4 text-text-muted" size={20} />
                                <input
                                    value={bookInput}
                                    onFocus={handleBookFocus}
                                    onChange={handleBookInputChange}
                                    className="w-full bg-surface/30 border border-border rounded-2xl pl-14 pr-6 py-4 text-white focus:border-primary transition-all"
                                    placeholder="Type to search or select from latest books..."
                                />
                            </div>
                            {showBookSuggestions && filteredBooks.length > 0 && (
                                <ul className="absolute z-50 w-full mt-2 bg-bg-secondary border border-border rounded-2xl shadow-2xl max-h-60 overflow-auto">
                                    {!bookInput && <li className="px-4 py-2 bg-surface/30 text-[10px] font-black text-primary uppercase tracking-tighter flex items-center gap-2"><Star size={10} /> Latest Books in Stock</li>}
                                    {filteredBooks.map(b => (
                                        <li key={b._id} onClick={() => handleSelectBook(b)} className="p-4 hover:bg-primary/10 cursor-pointer flex items-center gap-4 border-b border-border last:border-0">
                                            <img src={`/images/${b.cover_image}.jpg`} className="w-10 h-14 object-cover rounded shadow" alt="" />
                                            <div className="flex-1">
                                                <p className="font-bold text-white text-sm">{b.title}</p>
                                                <p className="text-[10px] text-text-muted uppercase font-bold">Stock: {b.available_quantity}</p>
                                            </div>
                                            <Plus size={18} className="text-primary" />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* LIST OF SELECTED BOOKS */}
                        {selectedItems.length > 0 && (
                            <div className="mt-6 border border-border rounded-2xl overflow-hidden bg-surface/10">
                                <table className="w-full text-left">
                                    <thead className="bg-surface/30 text-[10px] uppercase font-black text-text-muted">
                                        <tr>
                                            <th className="px-6 py-3">Book Info</th>
                                            <th className="px-6 py-3 text-center">Quantity</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {selectedItems.map(item => (
                                            <tr key={item.book._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={`/images/${item.book.cover_image}.jpg`} className="w-10 h-14 object-cover rounded" alt="" />
                                                        <div>
                                                            <p className="font-bold text-white text-sm line-clamp-1">{item.book.title}</p>
                                                            <p className="text-[10px] text-text-muted">ISBN: {item.book.isbn}</p>
                                                            <p className="text-[11px] text-primary font-bold mt-0.5">{formatVND(item.book.price)} × {item.quantity} = {formatVND((item.book.price || 0) * item.quantity)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button type="button" onClick={() => handleQuantityChange(item.book._id, -1, 100)} className="w-8 h-8 rounded-lg bg-bg border border-border flex items-center justify-center text-text-muted hover:text-white"><Minus size={14} /></button>
                                                        <span className="font-black text-white w-4">{item.quantity}</span>
                                                        <button type="button" onClick={() => handleQuantityChange(item.book._id, 1, item.book.available_quantity)} className="w-8 h-8 rounded-lg bg-bg border border-border flex items-center justify-center text-text-muted hover:text-white"><Plus size={14} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button type="button" onClick={() => setSelectedItems(selectedItems.filter(i => i.book._id !== item.book._id))} className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* SECTION 3: STATUS */}
                    <section className="pt-4 border-t border-border">
                        <label className="block text-xs font-black uppercase text-primary tracking-widest mb-4">3. Set Order Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-surface/50 border border-border rounded-2xl px-6 py-4 text-white font-bold focus:border-primary outline-none appearance-none"
                        >
                            <option value="pending">⏳ Pending (Review Required)</option>
                            <option value="accepted">✅ Accepted (Deduct Stock Instantly)</option>
                            <option value="borrowed">📖 Borrowed (Mark as Handed Over)</option>
                        </select>
                    </section>
                </div>

                {/* Footer Action */}
                <div className="p-8 border-t border-border flex items-center justify-between bg-surface/20">
                    <div className="text-text-muted text-sm font-medium">
                        Total Items: <span className="text-white font-black">{selectedItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
                        <span className="mx-3 text-border">|</span>
                        Rental Fee: <span className="text-primary font-black">{formatVND(selectedItems.reduce((acc, i) => acc + i.quantity * (i.book.price || 0), 0))}</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-3 rounded-2xl font-bold text-text-muted hover:bg-surface transition-all">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedUser || selectedItems.length === 0}
                            className="px-10 py-3 rounded-2xl bg-primary text-white font-black flex items-center gap-2 hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? "Processing..." : "Create Rental Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRental;
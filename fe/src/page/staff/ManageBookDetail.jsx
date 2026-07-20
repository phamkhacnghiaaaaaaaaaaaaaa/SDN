import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Minus, RefreshCw, User, Building2, Tag, BookType, Image, DollarSign, Layers } from "lucide-react";
import * as bookService from "../../service/books.service";

const ManageBookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    // State lưu trữ dữ liệu để chỉnh sửa
    const [formData, setFormData] = useState({
        title: "",
        author_name: "",     // Sửa tên tác giả
        publisher_name: "",  // Sửa tên nhà xuất bản
        category_name: "",   // Sửa tên thể loại
        description: "",
        isbn: "",
        cover_image: "",
        pdf_url: "",
        price: 0,
        quantity: 0,
        available_quantity: 0,
    });

    // Autocomplete states
    const [dbAuthors, setDbAuthors] = useState([]);
    const [dbPublishers, setDbPublishers] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);

    const [filteredAuthors, setFilteredAuthors] = useState([]);
    const [filteredPublishers, setFilteredPublishers] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);
    const [showPublisherSuggestions, setShowPublisherSuggestions] = useState(false);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

    // Refs for outside click detection
    const authorRef = useRef();
    const publisherRef = useRef();
    const categoryRef = useRef();

    useEffect(() => {
        fetchBook();
        fetchSuggestionsData();
    }, [id]);

    // Close suggestion dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (authorRef.current && !authorRef.current.contains(event.target)) {
                setShowAuthorSuggestions(false);
            }
            if (publisherRef.current && !publisherRef.current.contains(event.target)) {
                setShowPublisherSuggestions(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setShowCategorySuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestionsData = async () => {
        try {
            const [authors, publishers, categories] = await Promise.all([
                bookService.getAllAuthors().catch(() => []),
                bookService.getAllPublishers().catch(() => []),
                bookService.getAllCategories().catch(() => []),
            ]);
            setDbAuthors(authors);
            setDbPublishers(publishers);
            setDbCategories(categories);
        } catch (err) {
            console.error("Failed to load suggestion lists", err);
        }
    };

    const fetchBook = async () => {
        setLoading(true);
        try {
            const data = await bookService.getBookById(id);
            setBook(data);
            // Ánh xạ dữ liệu từ API vào Form
            setFormData({
                title: data.title || "",
                author_name: data.author_id?.name || "",
                publisher_name: data.publisher_id?.name || "",
                category_name: data.category_id?.name || "",
                description: data.description || "",
                isbn: data.isbn || "",
                cover_image: data.cover_image || "",
                pdf_url: data.pdf_url || "",
                price: data.price || 0,
                quantity: data.quantity || 0,
                available_quantity: data.available_quantity || 0,
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load book");
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra thay đổi để sáng nút Save
    const isChanged = book && (
        formData.title !== book.title ||
        formData.author_name !== (book.author_id?.name || "") ||
        formData.publisher_name !== (book.publisher_id?.name || "") ||
        formData.category_name !== (book.category_id?.name || "") ||
        formData.description !== (book.description || "") ||
        formData.isbn !== book.isbn ||
        formData.cover_image !== (book.cover_image || "") ||
        formData.pdf_url !== (book.pdf_url || "") ||
        formData.price !== book.price ||
        formData.quantity !== book.quantity ||
        formData.available_quantity !== book.available_quantity
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === "price" || name === "quantity" || name === "available_quantity" ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));

        // Filter lists on input change
        if (name === "author_name") {
            const filtered = dbAuthors.filter((a) =>
                a.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredAuthors(filtered);
            setShowAuthorSuggestions(true);
        } else if (name === "publisher_name") {
            const filtered = dbPublishers.filter((p) =>
                p.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredPublishers(filtered);
            setShowPublisherSuggestions(true);
        } else if (name === "category_name") {
            const filtered = dbCategories.filter((c) =>
                c.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCategories(filtered);
            setShowCategorySuggestions(true);
        }
    };

    const handleSelectSuggestion = (fieldName, value, setSuggestionsShow) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
        setSuggestionsShow(false);
    };

    const handleUpdateBook = async () => {
        if (!isChanged) return;
        setUpdating(true);
        try {
            await bookService.updateBook(id, formData);
            alert("All changes saved successfully!");
            // Refresh book state
            fetchBook();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="py-20 text-center animate-pulse">Loading management console...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-white mb-8 transition-all">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="bg-bg-secondary rounded-3xl shadow-2xl border border-border overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">

                    {/* CỘT TRÁI: ẢNH BÌA */}
                    <div className="lg:col-span-4 bg-surface/30 p-8 border-r border-border">
                        <div className="sticky top-8">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-bg">
                                <img
                                    src={formData.cover_image ? `/images/${formData.cover_image}.jpg` : "https://via.placeholder.com/400x600?text=No+Cover"}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x600?text=No+Cover" }}
                                />
                            </div>
                            <div className="mt-6 p-4 bg-bg/50 rounded-xl border border-border">
                                <label className="text-[10px] uppercase font-bold text-text-muted block mb-2">Internal Cover ID</label>
                                <input
                                    name="cover_image"
                                    value={formData.cover_image}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-primary text-sm focus:outline-none focus:border-primary"
                                    placeholder="e.g. clean_code"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: FORM CHỈNH SỬA */}
                    <div className="lg:col-span-8 p-8 lg:p-12 space-y-8">
                        {/* Category with autocomplete */}
                        <div className="relative" ref={categoryRef}>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <Tag size={14} /> Category
                            </label>
                            <input
                                name="category_name"
                                value={formData.category_name}
                                onChange={handleInputChange}
                                onFocus={() => {
                                    setFilteredCategories(dbCategories.filter(c => c.name.toLowerCase().includes(formData.category_name.toLowerCase())));
                                    setShowCategorySuggestions(true);
                                }}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none transition-all"
                                placeholder="Category name..."
                                autoComplete="off"
                            />
                            {showCategorySuggestions && filteredCategories.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-bg border border-border rounded-lg shadow-xl divide-y divide-border">
                                    {filteredCategories.map((cat) => (
                                        <li
                                            key={cat._id}
                                            onClick={() => handleSelectSuggestion("category_name", cat.name, setShowCategorySuggestions)}
                                            className="px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-primary/20 cursor-pointer transition-colors"
                                        >
                                            {cat.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Tên sách */}
                        <div>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <BookType size={14} /> Book Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-transparent text-4xl font-extrabold text-white border-b-2 border-transparent focus:border-primary focus:outline-none py-2 transition-all"
                                placeholder="Enter book title"
                            />
                        </div>

                        {/* Author with autocomplete */}
                        <div className="relative" ref={authorRef}>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <User size={14} /> Author Name
                            </label>
                            <input
                                name="author_name"
                                value={formData.author_name}
                                onChange={handleInputChange}
                                onFocus={() => {
                                    setFilteredAuthors(dbAuthors.filter(a => a.name.toLowerCase().includes(formData.author_name.toLowerCase())));
                                    setShowAuthorSuggestions(true);
                                }}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-lg text-primary font-medium focus:border-primary focus:outline-none transition-all"
                                placeholder="Who wrote this?"
                                autoComplete="off"
                            />
                            {showAuthorSuggestions && filteredAuthors.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-bg border border-border rounded-lg shadow-xl divide-y divide-border">
                                    {filteredAuthors.map((author) => (
                                        <li
                                            key={author._id}
                                            onClick={() => handleSelectSuggestion("author_name", author.name, setShowAuthorSuggestions)}
                                            className="px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-primary/20 cursor-pointer transition-colors"
                                        >
                                            {author.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Synopsis */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3">Book Synopsis</h3>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full bg-surface/30 border border-border rounded-xl p-5 text-text-muted leading-relaxed focus:border-primary focus:outline-none transition-all resize-none"
                                placeholder="Describe the masterpiece..."
                            />
                        </div>

                        {/* Grid Publisher & ISBN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Publisher with autocomplete */}
                            <div className="p-5 bg-bg rounded-2xl border border-border relative" ref={publisherRef}>
                                <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-3">
                                    <Building2 size={14} /> Publisher
                                </label>
                                <input
                                    name="publisher_name"
                                    value={formData.publisher_name}
                                    onChange={handleInputChange}
                                    onFocus={() => {
                                        setFilteredPublishers(dbPublishers.filter(p => p.name.toLowerCase().includes(formData.publisher_name.toLowerCase())));
                                        setShowPublisherSuggestions(true);
                                    }}
                                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                                    placeholder="Publisher name"
                                    autoComplete="off"
                                />
                                {showPublisherSuggestions && filteredPublishers.length > 0 && (
                                    <ul className="absolute z-50 left-5 right-5 mt-1 max-h-40 overflow-y-auto bg-bg border border-border rounded-lg shadow-xl divide-y divide-border">
                                        {filteredPublishers.map((pub) => (
                                            <li
                                                key={pub._id}
                                                onClick={() => handleSelectSuggestion("publisher_name", pub.name, setShowPublisherSuggestions)}
                                                className="px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-primary/20 cursor-pointer transition-colors"
                                            >
                                                {pub.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="p-5 bg-bg rounded-2xl border border-border">
                                <label className="text-xs text-text-muted uppercase font-bold mb-3 block">ISBN Identifier</label>
                                <input
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white font-mono focus:border-primary focus:outline-none"
                                    placeholder="e.g. 978-0..."
                                />
                            </div>
                        </div>

                        {/* Extra Grid Fields: Rental Fee */}
                        <div className="grid grid-cols-1 gap-8">
                            <div className="p-5 bg-bg rounded-2xl border border-border">
                                <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-3">
                                    <DollarSign size={14} /> Rental Fee (₫ / 14 days)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Quantity management */}
                        <div className="bg-surface p-8 rounded-2xl border border-primary/20 shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm text-text-muted mb-3 font-bold">Total Stock (Quantity)</label>
                                    <div className="flex items-center gap-5">
                                        <button
                                            type="button"
                                            className="w-14 h-14 rounded-xl bg-bg border border-border flex items-center justify-center hover:border-error text-error transition-all active:scale-90"
                                            onClick={() => setFormData(p => ({ ...p, quantity: Math.max(0, p.quantity - 1) }))}
                                        >
                                            <Minus size={24} />
                                        </button>

                                        <input
                                            type="number"
                                            name="quantity"
                                            className="w-24 text-center bg-bg border-2 border-primary/20 h-14 rounded-xl font-black text-2xl text-primary focus:outline-none focus:border-primary"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData(p => ({ ...p, quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
                                        />

                                        <button
                                            type="button"
                                            className="w-14 h-14 rounded-xl bg-bg border border-border flex items-center justify-center hover:border-success text-success transition-all active:scale-90"
                                            onClick={() => setFormData(p => ({ ...p, quantity: p.quantity + 1 }))}
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-text-muted mb-3 font-bold">Available Quantity</label>
                                    <div className="flex items-center gap-5">
                                        <button
                                            type="button"
                                            className="w-14 h-14 rounded-xl bg-bg border border-border flex items-center justify-center hover:border-error text-error transition-all active:scale-90"
                                            onClick={() => setFormData(p => ({ ...p, available_quantity: Math.max(0, p.available_quantity - 1) }))}
                                        >
                                            <Minus size={24} />
                                        </button>

                                        <input
                                            type="number"
                                            name="available_quantity"
                                            className="w-24 text-center bg-bg border-2 border-primary/20 h-14 rounded-xl font-black text-2xl text-primary focus:outline-none focus:border-primary"
                                            value={formData.available_quantity}
                                            onChange={(e) => setFormData(p => ({ ...p, available_quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
                                        />

                                        <button
                                            type="button"
                                            className="w-14 h-14 rounded-xl bg-bg border border-border flex items-center justify-center hover:border-success text-success transition-all active:scale-90"
                                            onClick={() => setFormData(p => ({ ...p, available_quantity: p.available_quantity + 1 }))}
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    className={`flex items-center justify-center gap-3 px-12 h-14 rounded-xl font-black text-lg transition-all w-full md:w-auto shadow-2xl
                                        ${!isChanged || updating
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                            : 'bg-primary hover:bg-primary-hover text-white hover:-translate-y-1 active:translate-y-0'}`}
                                    onClick={handleUpdateBook}
                                    disabled={!isChanged || updating}
                                >
                                    {updating ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
                                    {updating ? 'SAVING DATA...' : 'SAVE ALL CHANGES'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBookDetail;
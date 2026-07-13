import React, { useState, useEffect, useRef } from "react";
import { X, Save, FileText, Image, DollarSign, Layers, User, Building2, Tag, BookOpen } from "lucide-react";
import * as bookService from "../../service/books.service";

const CreateBook = ({ isOpen, onClose, onBookCreated }) => {
    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        author_name: "",
        publisher_name: "",
        category_name: "",
        description: "",
        cover_image: "",
        pdf_url: "",
        price: 0,
        quantity: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        if (isOpen) {
            fetchSuggestionsData();
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" || name === "quantity" ? Number(value) : value,
        }));

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.isbn) {
            setError("Title and ISBN are required!");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await bookService.createBook(formData);
            alert("Book created successfully!");
            onBookCreated();
            onClose();
            // Reset form
            setFormData({
                title: "",
                isbn: "",
                author_name: "",
                publisher_name: "",
                category_name: "",
                description: "",
                cover_image: "",
                pdf_url: "",
                price: 0,
                quantity: 0,
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-bg-secondary w-full max-w-3xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface/20">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-primary" size={24} />
                        <h2 className="text-2xl font-extrabold text-white">Create New Book</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-white hover:bg-surface/50 p-2 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <BookOpen size={14} /> Book Title *
                            </label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                                placeholder="Enter book title"
                            />
                        </div>

                        {/* ISBN */}
                        <div>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <FileText size={14} /> ISBN *
                            </label>
                            <input
                                required
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleInputChange}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white font-mono focus:border-primary focus:outline-none transition-all"
                                placeholder="e.g. 978-0-123456-47-2"
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
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                                placeholder="Enter author name"
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

                        {/* Publisher with autocomplete */}
                        <div className="relative" ref={publisherRef}>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
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
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                                placeholder="Enter publisher name"
                                autoComplete="off"
                            />
                            {showPublisherSuggestions && filteredPublishers.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-bg border border-border rounded-lg shadow-xl divide-y divide-border">
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
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                                placeholder="Enter category"
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

                        {/* Cover Image Name */}
                        <div>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <Image size={14} /> Cover Image Name
                            </label>
                            <input
                                name="cover_image"
                                value={formData.cover_image}
                                onChange={handleInputChange}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                                placeholder="e.g. clean_code"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <DollarSign size={14} /> Price ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                                <Layers size={14} /> Quantity
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* PDF URL */}
                    <div>
                        <label className="flex items-center gap-2 text-xs text-text-muted uppercase font-bold mb-2">
                            <FileText size={14} /> PDF Document URL
                        </label>
                        <input
                            name="pdf_url"
                            value={formData.pdf_url}
                            onChange={handleInputChange}
                            className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                            placeholder="https://example.com/book.pdf"
                        />
                    </div>

                    {/* Synopsis / Description */}
                    <div>
                        <label className="text-xs text-text-muted uppercase font-bold mb-2 block">
                            Book Synopsis
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full bg-surface/30 border border-border rounded-xl p-4 text-white leading-relaxed focus:border-primary focus:outline-none transition-all resize-none"
                            placeholder="Describe the book..."
                        />
                    </div>

                    {/* Footer / Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-border text-text-muted hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 transition-all"
                        >
                            <Save size={18} />
                            {loading ? "Creating..." : "Save Book"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBook;

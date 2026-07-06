import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  Search,
  ShoppingCart,
  User,
  LogOut,
  BookOpen,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Heart,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import * as booksService from "../service/books.service";

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await booksService.searchBooks(searchQuery);
        // Display up to 5 results
        setSearchResults(results.slice(0, 5));
      } catch (error) {
        console.error("Failed to search books", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectBook = (bookId) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/books/${bookId}`);
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="main-header">
        <div className="main-header__inner">
          {/* Logo */}
          <Link to="/" className="main-logo">
            <div className="main-logo__icon">
              <BookOpen size={22} />
            </div>
            <span className="main-logo__text">Library SDN302</span>
          </Link>

          {/* Search */}
          <div className="main-search relative" ref={searchRef}>
            <Search className="main-search__icon" size={17} />
            <input
              className="main-search__input w-full"
              placeholder="Search books by title..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if (searchQuery) setShowDropdown(true); }}
            />

            {/* Search Dropdown */}
            {showDropdown && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <ul className="max-h-80 overflow-y-auto">
                    {searchResults.map((book) => (
                      <li key={book._id} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => handleSelectBook(book._id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          {book.cover_image ? (
                            <img src={`/images/${book.cover_image}.jpg`} alt={book.title} className="w-10 h-14 object-cover rounded-sm" />
                          ) : (
                            <div className="w-10 h-14 bg-gray-200 rounded-sm flex items-center justify-center">
                              <BookOpen size={16} className="text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800 line-clamp-2 flex-1">{book.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No books found matching "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="main-nav">
            <Link
              to="/"
              className={`main-nav__link ${isActive("/") ? "main-nav__link--active" : ""}`}
            >
              <House size={17} />
              <span>Home</span>
            </Link>

            <div className="main-nav__divider" />

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="main-nav__user">
                  <div className="main-nav__avatar">
                    {getInitials(user?.fullname)}
                  </div>
                  <span>{user?.fullname || "User"}</span>
                </Link>

                <button
                  className="main-nav__logout"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="main-nav__link">
                  <User size={17} />
                  <span>Log in</span>
                </Link>
                <Link to="/register" className="main-nav__link">
                  <span>Sign up</span>
                </Link>
              </>
            )}

            <div className="main-nav__divider" />

            <Link to="/cart" className="main-nav__cart">
              <ShoppingCart size={19} />
              {getCartCount() > 0 && (
                <span className="main-nav__badge">{getCartCount()}</span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="main-content">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="main-footer__inner">
          <div className="main-footer__grid">
            {/* Brand */}
            <div className="main-footer__brand">
              <div className="main-footer__brand-logo">
                <div className="main-footer__brand-icon">
                  <BookOpen size={20} />
                </div>
                <span className="main-footer__brand-name">Library SDN302</span>
              </div>
              <p className="main-footer__brand-desc">
                Your digital library companion. Discover, rent, and read
                thousands of books from our curated collection. Built with ❤️
                for book lovers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="main-footer__section-title">Quick Links</h4>
              <ul className="main-footer__links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/books">All Books</Link>
                </li>
                <li>
                  <Link to="/categories">Categories</Link>
                </li>
                <li>
                  <Link to="/authors">Authors</Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="main-footer__section-title">Account</h4>
              <ul className="main-footer__links">
                <li>
                  <Link to="/login">Log In</Link>
                </li>
                <li>
                  <Link to="/register">Sign Up</Link>
                </li>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="main-footer__section-title">Contact</h4>
              <div className="main-footer__contact-item">
                <Mail size={15} />
                <span>library@sdn302.edu.vn</span>
              </div>
              <div className="main-footer__contact-item">
                <Phone size={15} />
                <span>+84 123 456 789</span>
              </div>
              <div className="main-footer__contact-item">
                <MapPin size={15} />
                <span>FPT University, Hà Nội</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="main-footer__bottom">
            <p className="main-footer__copyright">
              © 2026 Library SDN302. All rights reserved.
            </p>
            <div className="main-footer__socials">
              <a href="#" className="main-footer__social-link" title="Source">
                <ExternalLink size={16} />
              </a>
              <a href="#" className="main-footer__social-link" title="Support">
                <Heart size={16} />
              </a>
              <a href="#" className="main-footer__social-link" title="Website">
                <Globe size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

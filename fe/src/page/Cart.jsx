import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, AlertCircle, Calendar } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import * as rentalService from "../service/rental.service";
import * as authService from "../service/auth.service";
import toast from "react-hot-toast";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalBooksCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const info = await authService.getUserInfo();
        setUserInfo(info);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUserInfo();
  }, []);

  const totalBooks = getTotalBooksCount();
  const rentalQuota = userInfo?.rental_available || 0;
  const isOverQuota = totalBooks > rentalQuota;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (isOverQuota) {
      setError(`You only have ${rentalQuota} rental quota remaining, but your cart has ${totalBooks} books.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const itemsPayload = cartItems.map(item => ({
        book_id: item.book._id,
        quantity: item.quantity
      }));

      await rentalService.createRental(user.id || user._id, itemsPayload);
      clearCart();
      toast.success("Rental request submitted successfully! Pending staff approval.");
      navigate("/profile", { state: { tab: "rentals" } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rental request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-text-muted mb-8">Looks like you haven't added any books to your cart yet.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Browse Books
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Calculate return date (7 days from now)
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 7);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.book._id} className="bg-surface rounded-xl p-4 border border-border flex gap-4 relative pr-12">
              <img
                src={`/images/${item.book.cover_image}.jpg`}
                alt={item.book.title}
                className="w-20 h-28 object-cover rounded-md"
                onError={(e) => { e.target.src = "https://via.placeholder.com/80x120?text=No+Cover" }}
              />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <Link to={`/books/${item.book._id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">{item.book.title}</h3>
                  </Link>
                  <p className="text-text-muted text-sm">{item.book.author_id?.name || "Unknown Author"}</p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center bg-bg border border-border rounded-lg overflow-hidden">
                    <button
                      className="px-3 py-1 hover:bg-surface transition-colors"
                      onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span className="px-3 font-medium text-sm">{item.quantity}</span>
                    <button
                      className="px-3 py-1 hover:bg-surface transition-colors"
                      onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                      disabled={item.quantity >= item.book.available_quantity}
                    >+</button>
                  </div>
                  <span className="text-xs text-text-muted">
                    {item.book.available_quantity} available
                  </span>
                </div>
              </div>

              <button
                className="absolute top-4 right-4 text-text-muted hover:text-error transition-colors p-2"
                onClick={() => removeFromCart(item.book._id)}
                title="Remove from cart"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Rental Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Books</span>
                <span className="font-semibold">{totalBooks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Rental Quota Remaining</span>
                <span className={`font-semibold ${isOverQuota ? 'text-error' : 'text-success'}`}>
                  {rentalQuota}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-text-muted flex items-center gap-1">
                  <Calendar size={14} /> Expected Return
                </span>
                <span className="font-semibold text-right">
                  {returnDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br />
                  <span className="text-xs text-text-muted font-normal">(Max 7 days)</span>
                </span>
              </div>
            </div>

            {isOverQuota && (
              <div className="text-xs text-error mb-4 bg-error/10 p-2 rounded">
                Cannot checkout. Exceeds your rental quota.
              </div>
            )}

            <button
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={loading || isOverQuota}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Submit Rental Request <ArrowRight size={18} /></>
              )}
            </button>
            <p className="text-xs text-center text-text-muted mt-4">
              Pending staff approval after submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

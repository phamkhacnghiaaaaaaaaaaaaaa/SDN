import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, CheckCircle, XCircle, Heart, BookOpen } from "lucide-react";
import * as bookService from "../service/books.service";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getMyFavourites, toggleFavourite } from "../service/favourites.service";
import toast from "react-hot-toast";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart, updateQuantity, cartItems } = useCart();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchBookAndFavs = async () => {
      try {
        const data = await bookService.getBookById(id);
        setBook(data);
        
        // If already in cart, sync quantity
        const cartItem = cartItems.find(item => item.book._id === id);
        if (cartItem) {
            setQuantity(cartItem.quantity);
        }

        if (isAuthenticated) {
          try {
            const favData = await getMyFavourites();
            if (favData.success && favData.favourites) {
              const favIds = favData.favourites.map(f => typeof f.book_id === 'object' ? f.book_id._id : f.book_id);
              setIsFavorite(favIds.includes(id));
            }
          } catch (err) {
            console.error("Failed to fetch favorites", err);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndFavs();
  }, [id, cartItems, isAuthenticated]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
        navigate("/login", { state: { from: `/books/${id}` } });
        return;
    }

    if (isInCart(id)) {
        updateQuantity(id, quantity);
        toast.success("Cart updated!");
    } else {
        addToCart(book);
        if (quantity > 1) {
            setTimeout(() => updateQuantity(id, quantity), 0);
        }
        toast.success("Added to cart!");
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }
    try {
      const data = await toggleFavourite(id);
      if (data.success) {
        setIsFavorite(data.isFavourite);
        if (data.isFavourite) {
          toast.success("Added to favourites!");
        } else {
          toast.success("Removed from favourites!");
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="py-20 text-center">
        <p className="text-error mb-4">{error || "Book not found"}</p>
        <button onClick={() => navigate("/")} className="text-primary hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  const isAvailable = book.available_quantity > 0;
  const inCart = isInCart(id);

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="book-detail-container">
        {/* Left: Image */}
        <div className="book-detail-image-col">
          <div className="book-detail-image-wrap">
            <img 
              src={`/images/${book.cover_image}.jpg`} 
              alt={book.title} 
              className="book-detail-image"
              onError={(e) => { e.target.src = "https://via.placeholder.com/400x600?text=No+Cover" }}
            />
          </div>
        </div>

        {/* Right: Info */}
        <div className="book-detail-info-col">
          <div className="book-detail-badges">
            <span className="book-badge bg-surface text-primary border border-primary/20">
              {book.category_id?.name || "General"}
            </span>
            {isAvailable ? (
              <span className="book-badge bg-success/10 text-success border border-success/20">
                <CheckCircle size={14} className="mr-1" /> In Stock ({book.available_quantity})
              </span>
            ) : (
              <span className="book-badge bg-error/10 text-error border border-error/20">
                <XCircle size={14} className="mr-1" /> Out of Stock
              </span>
            )}
          </div>

          <h1 className="book-detail-title">{book.title}</h1>
          <p className="book-detail-author">by <span>{book.author_id?.name || "Unknown Author"}</span></p>

          <div className="book-detail-desc">
            <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
            <p className="text-text-muted leading-relaxed">
              {book.description || "No description available for this book."}
            </p>
          </div>

          <div className="book-detail-meta grid grid-cols-2 gap-4 my-8">
             <div>
                <span className="text-text-muted block text-sm mb-1">Publisher</span>
                <span className="font-medium">{book.publisher_id?.name || "Unknown"}</span>
             </div>
             <div>
                <span className="text-text-muted block text-sm mb-1">ISBN</span>
                <span className="font-medium">{book.isbn}</span>
             </div>
          </div>

          {/* Actions */}
          <div className="book-detail-actions bg-surface p-6 rounded-xl border border-border mt-auto flex flex-col gap-4">
            {isAvailable ? (
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                   <label className="block text-sm text-text-muted mb-2">Quantity</label>
                   <div className="flex items-center gap-3">
                      <button 
                        className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                      >-</button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <button 
                        className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-50"
                        onClick={() => setQuantity(q => Math.min(book.available_quantity, q + 1))}
                        disabled={quantity >= book.available_quantity}
                      >+</button>
                   </div>
                </div>

                <button 
                  className={`book-btn w-full sm:w-auto ${inCart ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary-hover'}`}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={20} />
                  {inCart ? 'Update Cart' : 'Add to Cart'}
                </button>
              </div>
            ) : (
               <button disabled className="book-btn w-full bg-surface border border-border text-text-muted cursor-not-allowed">
                  <XCircle size={20} />
                  Currently Unavailable
               </button>
            )}

            <div className="flex gap-4 w-full">
               <button 
                 className={`book-btn flex-1 sm:flex-none bg-surface border border-border hover:bg-surface-hover ${isFavorite ? 'text-red-500' : 'text-text'}`}
                 onClick={handleToggleFavorite}
               >
                 <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
                 Favorite
               </button>
               
               {book.pdf_url && (
                 <a 
                   href={book.pdf_url}
                   target="_blank"
                   rel="noreferrer"
                   className="book-btn flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white flex justify-center items-center gap-2"
                 >
                   <BookOpen size={20} />
                   Read Online
                 </a>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;

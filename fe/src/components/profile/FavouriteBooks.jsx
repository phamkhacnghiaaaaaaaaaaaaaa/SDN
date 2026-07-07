import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyFavourites } from "../../service/favourites.service";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, Check } from "lucide-react";

const FavouriteBooks = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getMyFavourites();
        setFavorites(data.favourites || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load favorite books");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleAddToCart = (e, book) => {
    e.stopPropagation();
    addToCart(book);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-error bg-error/10 p-4 rounded-md border border-error/20">{error}</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-md p-10 text-center flex flex-col items-center justify-center">
        <img src="/images/empty_books.svg" alt="No favorites" className="w-32 h-32 opacity-20 mb-4" onError={(e) => e.target.style.display = 'none'}/>
        <h3 className="text-xl font-bold mb-2">No Favorite Books Yet</h3>
        <p className="text-text-muted mb-6">You haven't added any books to your favorites.</p>
        <button onClick={() => navigate('/books')} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md transition-colors font-medium">
          Explore Books
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary p-6 rounded-md shadow-shadow-sm">
      <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Favorite Books</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((fav) => {
          const b = fav.book_id;
          if (!b) return null;
          const inCart = isInCart(b._id);
          
          return (
            <div key={b._id} className="p-4 bg-bg rounded-md hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => navigate(`/books/${b._id}`)}>
              <img
                className="w-full h-40 object-cover rounded-sm mb-3"
                src={`/images/${b.cover_image}.jpg`}
                alt={b.title}
                onError={(e) => { e.target.src = "https://via.placeholder.com/64x96?text=No+Cover" }}
              />
              <div className="mb-3">
                <Link to={`/books/${b._id}`} onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-semibold text-white hover:text-primary line-clamp-1">
                    {b.title}
                  </h3>
                </Link>
                <Link to={`/authors/${b.author_id?._id}`} onClick={(e) => e.stopPropagation()}>
                  <p className="text-text-muted text-xs hover:text-primary-hover line-clamp-1">
                    {b.author_id?.name || "Unknown"}
                  </p>
                </Link>
              </div>
              <button 
                className={`w-full flex items-center justify-center gap-2 text-sm rounded-sm py-1.5 transition-all duration-300 ${inCart ? 'bg-secondary hover:bg-secondary/90 text-white' : 'bg-primary hover:bg-primary-hover text-white'}`} 
                onClick={(e) => handleAddToCart(e, b)}
                disabled={b.available_quantity <= 0}
              >
                {inCart ? <><Check size={14} /> In Cart</> : <><ShoppingCart size={14} /> Add to Cart</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavouriteBooks;

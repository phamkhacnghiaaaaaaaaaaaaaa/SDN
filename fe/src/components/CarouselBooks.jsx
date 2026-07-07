import { ChevronRight, ShoppingCart, Check, Heart } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getMyFavourites, toggleFavourite } from "../service/favourites.service";
import toast from "react-hot-toast";

const CarouselBooks = ({ books, carouselType, limit, showSeeAll = true }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [favoritedBooks, setFavoritedBooks] = React.useState(new Set());

  React.useEffect(() => {
    const fetchFavorites = async () => {
      if (isAuthenticated) {
        try {
          const data = await getMyFavourites();
          if (data.success && data.favourites) {
            const favIds = new Set(data.favourites.map(f => typeof f.book_id === 'object' ? f.book_id._id : f.book_id));
            setFavoritedBooks(favIds);
          }
        } catch (error) {
          console.error("Failed to fetch favorites", error);
        }
      } else {
        setFavoritedBooks(new Set());
      }
    };
    fetchFavorites();
  }, [isAuthenticated]);

  const displayedBooks = limit ? books.slice(0, limit) : books;

  const handleAddToCart = (e, book) => {
    e.stopPropagation(); // Prevent navigating to book detail if clicking cart
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(book);
    toast.success("Added to cart!");
  };

  const handleToggleFavorite = async (e, bookId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const data = await toggleFavourite(bookId);
      if (data.success) {
        setFavoritedBooks(prev => {
          const newSet = new Set(prev);
          if (data.isFavourite) {
            newSet.add(bookId);
            toast.success("Added to favourites!");
          } else {
            newSet.delete(bookId);
            toast.success("Removed from favourites!");
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  return (
    <div className="bg-bg-secondary p-10 rounded-md shadow-shadow-sm">
      <div className="flex justify-between h-max items-end">
        <h1 className="font-bold text-4xl pb-5">{carouselType}</h1>
        {showSeeAll && (
          <button
            className="bg-bg text-primary text-bold text-[14px] px-3 py-2 rounded-md hover:scale-110 hover:text-primary-hover transition-all duration-300 flex items-center"
            onClick={() => {
              navigate("/books");
            }}
          >
            <span>See All</span>
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-10 pt-5">
        {displayedBooks.map((b) => {
          const inCart = isInCart(b._id);
          return (
            <div key={b._id} className="relative group p-5 bg-bg rounded-md hover:scale-110 transition-all duration-300 overflow-hidden hover:z-10 cursor-pointer" onClick={() => navigate(`/books/${b._id}`)}>
              <button
                className="absolute top-7 right-7 p-2 bg-black/50 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110 hover:bg-black/70"
                onClick={(e) => handleToggleFavorite(e, b._id)}
              >
                <Heart size={20} className={favoritedBooks.has(b._id) ? "fill-red-500 text-red-500" : "text-red-500"} />
              </button>
              <img
                className="w-full h-48 object-cover"
                src={`/images/${b.cover_image}.jpg`}
                alt={b.title}
                onError={(e) => { e.target.src = "https://via.placeholder.com/64x96?text=No+Cover" }}
              />
              <div className="pt-2">
                <Link to={`/books/${b._id}`} onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-semibold text-white hover:text-primary line-clamp-1">
                    {b.title}
                  </h3>
                </Link>
                <Link to={`/authors/${b.author_id?._id}`} onClick={(e) => e.stopPropagation()}>
                  <p className="text-gray-400 text-sm hover:text-primary-hover">
                    {b.author_id?.name || "Unknown"}
                  </p>
                </Link>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  className={`flex items-center justify-center gap-2 text-text rounded-sm py-1 transition-all duration-300 ${inCart ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary-hover'}`}
                  onClick={(e) => handleAddToCart(e, b)}
                  disabled={b.available_quantity <= 0}
                >
                  {inCart ? <><Check size={16} /> In Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
                </button>
                <button
                  className="bg-surface text-text rounded-sm hover:bg-surface-hover border border-border py-1 transition-all duration-300"
                  onClick={(e) => { e.stopPropagation(); navigate(`/books/${b._id}`); }}
                >
                  Details
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default CarouselBooks;

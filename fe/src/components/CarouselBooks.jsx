import { ChevronRight, ShoppingCart, Check } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CarouselBooks = ({ books, carouselType, limit, showSeeAll = true }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const isManagement = user?.role === "Staff" || user?.role === "Admin";
  const displayedBooks = limit ? books.slice(0, limit) : books;

  const handleAddToCart = (e, book) => {
    e.stopPropagation(); // Staff không chạy vào đây, nhưng vẫn giữ cho User
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(book);
  };

  // Hàm điều hướng chuẩn
  const goToDetail = (bookId) => {
    if (isManagement) {
      navigate(`/staff/books/${bookId}`);
    } else {
      navigate(`/books/${bookId}`);
    }
  };

  return (
    <div className="bg-bg-secondary p-10 rounded-md shadow-shadow-sm">
      <div className="flex justify-between h-max items-end">
        <h1 className="font-bold text-4xl pb-5">{carouselType}</h1>
        {showSeeAll && (
          <button
            className="bg-bg text-primary text-bold text-[14px] px-3 py-2 rounded-md hover:scale-110 hover:text-primary-hover transition-all duration-300 flex items-center"
            onClick={() => navigate(isManagement ? "/staff/books" : "/books")}
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
            <div
              key={b._id}
              className="p-5 bg-bg rounded-md hover:scale-105 transition-all duration-300 overflow-hidden hover:z-10 cursor-pointer flex flex-col h-full"
              onClick={() => goToDetail(b._id)} // Click vào bất cứ đâu trên card đều chuyển trang
            >
              <img
                className="w-full h-48 object-cover rounded-sm"
                src={`/images/${b.cover_image}.jpg`}
                alt={b.title}
                onError={(e) => { e.target.src = "https://via.placeholder.com/64x96?text=No+Cover" }}
              />

              <div className="pt-3 flex-1">
                <h3 className="font-semibold text-white hover:text-primary line-clamp-2">
                  {b.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {b.author_id?.name || "Unknown Author"}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4 mt-auto">
                {/* 1. Nút Add to cart (Chỉ dành cho User khách) */}
                {!isManagement && (
                  <button
                    className={`flex items-center justify-center gap-2 text-text rounded-sm py-1.5 transition-all duration-300 ${inCart ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary-hover'
                      }`}
                    onClick={(e) => handleAddToCart(e, b)}
                    disabled={b.available_quantity <= 0}
                  >
                    {inCart ? <><Check size={16} /> In Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
                  </button>
                )}

                {/* 2. Nút Detail (Sửa lại: Không cần onClick riêng nữa vì thẻ cha đã handle) */}
                <div
                  className={`flex items-center justify-center bg-surface text-text rounded-sm border border-border py-1.5 transition-all duration-300 pointer-events-none ${isManagement ? 'font-bold text-primary border-primary/50 bg-primary/5' : ''
                    }`}
                >
                  {isManagement ? "Manage Details" : "Details"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CarouselBooks;
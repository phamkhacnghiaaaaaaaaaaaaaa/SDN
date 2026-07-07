import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error("Failed to parse cart from local storage", error);
          setCartItems([]);
        }
      } else {
        setCartItems([]); // Reset if no cart for user
      }
    } else {
      setCartItems([]); // Clear cart when logged out
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, user]);

  const addToCart = (book) => {
    if (!isAuthenticated) {
      // Allow adding to state, but let UI handle redirect
      return false;
    }
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.book._id === book._id);
      
      if (existingItem) {
        // If it exists, increase quantity if not exceeding available stock
        if (existingItem.quantity < book.available_quantity) {
          return prevItems.map((item) =>
            item.book._id === book._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevItems; // Exceeds available stock
      }
      
      // New item, add with quantity 1
      if (book.available_quantity > 0) {
         return [...prevItems, { book, quantity: 1 }];
      }
      return prevItems;
    });
    return true;
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.book._id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.book._id === bookId) {
           // Ensure quantity doesn't exceed available stock
           const validQuantity = Math.min(newQuantity, item.book.available_quantity);
           return { ...item, quantity: validQuantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
        localStorage.removeItem(`cart_${user._id}`);
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalBooksCount = () => {
     return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  const checkAvailability = (bookId) => {
     const item = cartItems.find(i => i.book._id === bookId);
     return item ? item.book.available_quantity - item.quantity > 0 : true;
  }
  
  const isInCart = (bookId) => {
      return cartItems.some(item => item.book._id === bookId);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getTotalBooksCount,
        checkAvailability,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

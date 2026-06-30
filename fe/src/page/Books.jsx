import React, { useEffect, useState } from "react";
import * as bookService from "../service/books.service";
import CarouselBooks from "../components/CarouselBooks";

const Books = () => {
  const [books, setBooks] = useState([]);

  const getAllBooks = async () => {
    const data = await bookService.getAllBooks();
    setBooks(data);
  };

  useEffect(() => {
    getAllBooks();
  }, []);

  return (
    <div className="">
      <CarouselBooks books={books} carouselType={"ALL BOOKS"} showSeeAll={false} />
    </div>
  );
};

export default Books;

import React, { useEffect, useState } from "react";
import * as bookService from "../service/books.service";
import { Link } from "react-router-dom";
import CarouselBooks from "../components/CarouselBooks";

const Home = () => {
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
      <CarouselBooks books={books} carouselType={"POPULAR"}/>
    </div>
  );
};

export default Home;

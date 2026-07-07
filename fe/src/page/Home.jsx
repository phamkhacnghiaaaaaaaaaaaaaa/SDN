import React, { useEffect, useState } from "react";
import * as bookService from "../service/books.service";
import CarouselBooks from "../components/CarouselBooks";
import FilterSidebar from "../components/FilterSidebar";
import { useBookFilter } from "../hooks/useBookFilter";

const Home = () => {
  const [books, setBooks] = useState([]);
  
  const { filteredBooks, isFiltering, filterProps } = useBookFilter(books);

  const getAllBooks = async () => {
    const res = await bookService.getAllBooks();
    setBooks(res.data);
  };

  useEffect(() => {
    getAllBooks();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar - col-span-2 */}
      <div className="col-span-2">
        <FilterSidebar {...filterProps} />
      </div>

      {/* Main Content - col-span-10 */}
      <div className="col-span-10">
        {isFiltering ? (
          <CarouselBooks
            books={filteredBooks}
            carouselType={`Search Results (${filteredBooks.length})`}
            showSeeAll={false}
          />
        ) : (
          <div className="flex flex-col gap-10">
            <CarouselBooks
              books={books}
              carouselType={"POPULAR"}
              limit={5}
              showSeeAll={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

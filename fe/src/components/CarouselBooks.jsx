import { ChevronRight } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const CarouselBooks = ({ books, carouselType }) => {

    const navigate = useNavigate();
  return (
    <div className="bg-bg-secondary p-10 rounded-md shadow-shadow-sm">
      <div className="flex justify-between h-max items-end">
        <h1 className="font-bold text-4xl pb-5">{carouselType}</h1>
        <button className="bg-bg text-primary text-bold text-[14px] px-3 py-2 rounded-md hover:scale-110 hover:text-primary-hover transition-all duration-300 flex items-center"
            onClick={()=>{navigate("/books/popular")}}
        >
          <span>See All</span>
          <ChevronRight className="size-4"/>
        </button>
      </div>
      <div className="flex grid-rows-6 gap-10">
        {books.map((b) => (
          <div className="p-5 bg-bg rounded-md hover:scale-110 transition-all duration-300 overflow-hidden hover:z-10 cursor-pointer">
            <Link to={`/books/${b._id}`}>
              <img
                className="w-full h-56 object-cover"
                src={`/images/${b.cover_image}.jpg`}
              />
            </Link>
            <div className="pt-2">
              <Link to={`/books/${b._id}`}>
                <h3 className="font-semibold text-white hover:text-primary">
                  {b.title}
                </h3>
              </Link>
              <Link to={`/authors/${b.author_id._id}`}>
                <p className="text-gray-400 text-sm hover:text-primary-hover">
                  {b.author_id.name}
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselBooks;

import React, { useEffect, useState } from "react";
import * as bookService from "../../service/books.service";
import CarouselBooks from "../../components/CarouselBooks";
import FilterSidebar from "../../components/FilterSidebar";
import { useBookFilter } from "../../hooks/useBookFilter";
import CreateBook from "./CreeateBook";

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { filteredBooks, isFiltering, filterProps } = useBookFilter(books);

    const getAllBooks = async (page) => {
        const res = await bookService.getAllBooks(page, 10);
        setBooks(res.data);
        setTotalPages(res.totalPages || 1);
    };

    useEffect(() => {
        getAllBooks(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 relative pb-16 min-h-[calc(100vh-100px)]">
            {/* Sidebar */}
            <div className="col-span-2">
                <FilterSidebar {...filterProps} />
            </div>

            {/* Main Content */}
            <div className="col-span-10 flex flex-col h-full relative">
                {/* Create Book Button - Top Right */}
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        + Create New Book
                    </button>
                </div>

                <div className="flex-grow">
                    <CarouselBooks
                        books={isFiltering ? filteredBooks : books}
                        carouselType={isFiltering ? `Search Results (${filteredBooks.length})` : "ALL BOOKS"}
                        showSeeAll={false}
                    />
                </div>

                {/* Pagination at bottom right */}
                {!isFiltering && totalPages > 1 && (
                    <div className="flex justify-end mt-8 self-end w-full">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-md ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 border rounded-md ${currentPage === page
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded-md ${currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Book Modal */}
            <CreateBook
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onBookCreated={() => getAllBooks(currentPage)}
            />
        </div>
    );
};

export default ManageBooks;

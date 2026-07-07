import { useState } from "react";

export const useBookFilter = (books) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  const filteredBooks = books.filter((b) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(b.category_id?.name);
    const publisherMatch =
      selectedPublishers.length === 0 ||
      selectedPublishers.includes(b.publisher_id?.name);
    const authorMatch =
      selectedAuthors.length === 0 ||
      selectedAuthors.includes(b.author_id?.name);
    return categoryMatch && publisherMatch && authorMatch;
  });

  const isFiltering =
    selectedCategories.length > 0 ||
    selectedPublishers.length > 0 ||
    selectedAuthors.length > 0;

  return {
    filteredBooks,
    isFiltering,
    filterProps: {
      books,
      selectedCategories,
      setSelectedCategories,
      selectedPublishers,
      setSelectedPublishers,
      selectedAuthors,
      setSelectedAuthors,
    },
  };
};

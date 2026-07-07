import React, { useState } from "react";
import { Search, Check, ChevronDown, ChevronUp } from "lucide-react";

// Reusable Section Component
const FilterSection = ({ title, items, selectedItems, onToggle, search = false, authorSearch, setAuthorSearch }) => {
  const [showAll, setShowAll] = useState(false);

  let displayItems = items;
  if (search && authorSearch) {
    displayItems = items.filter((item) =>
      item.toLowerCase().includes(authorSearch.toLowerCase())
    );
  }

  const hasMore = displayItems.length > 8;
  const visibleItems = showAll ? displayItems : displayItems.slice(0, 8);

  return (
    <div>
      <h3 className="font-semibold mb-3">{title}</h3>
      {search && (
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full bg-bg border border-border rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
            value={authorSearch}
            onChange={(e) => setAuthorSearch(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
        </div>
      )}
      
      {/* NO overflow and scrollbar here as requested */}
      <div className="flex flex-col gap-3">
        {visibleItems.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4">
                <input
                  type="checkbox"
                  className="peer appearance-none w-4 h-4 border border-border rounded-sm bg-bg checked:bg-primary checked:border-primary cursor-pointer transition-all focus:outline-none"
                  checked={isSelected}
                  onChange={() => onToggle(item)}
                />
                <Check size={12} strokeWidth={3} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className={`text-sm line-clamp-1 transition-colors ${isSelected ? 'text-primary' : 'text-text-secondary group-hover:text-primary'}`}>
                {item}
              </span>
            </label>
          );
        })}
        
        {visibleItems.length === 0 && search && (
          <p className="text-sm text-gray-400 italic">No {title.toLowerCase()} found</p>
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-primary hover:text-primary-hover text-sm font-medium mt-3 flex items-center gap-1 transition-colors"
        >
          {showAll ? (
            <><ChevronUp size={16} /> Show less</>
          ) : (
            <><ChevronDown size={16} /> See all</>
          )}
        </button>
      )}
    </div>
  );
};

const FilterSidebar = ({
  books,
  selectedCategories,
  setSelectedCategories,
  selectedPublishers,
  setSelectedPublishers,
  selectedAuthors,
  setSelectedAuthors,
}) => {
  const [authorSearch, setAuthorSearch] = useState("");

  const categories = Array.from(
    new Set(books.map((b) => b.category_id?.name).filter(Boolean))
  ).sort();
  
  const publishers = Array.from(
    new Set(books.map((b) => b.publisher_id?.name).filter(Boolean))
  ).sort();
  
  const authors = Array.from(
    new Set(books.map((b) => b.author_id?.name).filter(Boolean))
  ).sort();

  const handleToggle = (setList) => (item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="bg-bg-secondary p-5 rounded-md shadow-shadow-sm w-full h-fit flex flex-col gap-6 text-text">
      <h2 className="text-xl font-bold border-b border-border pb-2">Filter Books</h2>

      <FilterSection
        title="Categories"
        items={categories}
        selectedItems={selectedCategories}
        onToggle={handleToggle(setSelectedCategories)}
      />

      <FilterSection
        title="Publishers"
        items={publishers}
        selectedItems={selectedPublishers}
        onToggle={handleToggle(setSelectedPublishers)}
      />

      <FilterSection
        title="Authors"
        items={authors}
        selectedItems={selectedAuthors}
        onToggle={handleToggle(setSelectedAuthors)}
        search={true}
        authorSearch={authorSearch}
        setAuthorSearch={setAuthorSearch}
      />
    </div>
  );
};

export default FilterSidebar;

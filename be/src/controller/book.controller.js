const Book = require("../model/book.model");
const Rental = require("../model/rental.model");
const Category = require("../model/category.model");
const mongoose = require("mongoose");

const getAllBooks = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};

    if (category && category.trim() !== "") {
      query = {
        category_id: {
          $in: (
            await Category.find({
              name: { $regex: category, $options: "i" },
            }).select("_id")
          ).map((c) => c._id),
        },
      };
    }

    const books = await Book.find(query).populate(
      "category_id author_id publisher_id",
    );

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "category_id author_id publisher_id",
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchBook = async (req, res) => {
  try {
    const { category, author, publisher } = req.query;
    const books = await Book.find().populate(
      "category_id author_id publisher_id",
    );

    const filteredBooks = books.filter((b) => {
      const categoryFilter = category
        ? b.category_id.name.toLowerCase().includes(category.toLowerCase())
        : true;
      const authorFilter = author
        ? b.author_id.name.toLowerCase().includes(author.toLowerCase())
        : true;
      const publisherFilter = publisher
        ? b.publisher_id.name.toLowerCase().includes(publisher.toLowerCase())
        : true;
      return categoryFilter && authorFilter && publisherFilter;
    });

    if (filteredBooks.length === 0)
      return res.status(404).json({
        message: `Can't not find book with category: ${category}, author: ${author}, publisher: ${publisher}`,
      });

    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// fixed: 1. check isbn trùng -> hỏi merge, 2. check số lượng sách đang ngoài đường,
// 3. check số lượng sách sau chỉnh sửa >= số lượng sách đang ngoài đường, 4. check available_quantity >= 0,
// 5. check available_quantity + số lượng sách đang ngoài đường <= quantity
const createBook = async (req, res) => {
  try {
    const { isbn, quantity, price, ...otherData } = req.body;

    if (!isbn || !isbn.trim()) {
      return res.status(400).json({
        message: "ISBN is required",
      });
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({
        message: "Quantity must be greater or equal to 0",
      });
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    const normalizedISBN = isbn.trim();

    const existingBook = await Book.findOne({
      isbn: normalizedISBN,
    });

    // ISBN đã tồn tại -> chỉ nhập thêm số lượng
    if (existingBook) {
      existingBook.quantity += quantity;
      existingBook.available_quantity += quantity;

      await existingBook.save();

      return res.status(200).json({
        message: "Quantity increased successfully",
        book: existingBook,
      });
    }

    // ISBN chưa tồn tại -> tạo mới
    const newBook = new Book({
      isbn: normalizedISBN,
      quantity,
      available_quantity: quantity,
      price,
      ...otherData,
    });

    await newBook.save();

    return res.status(201).json({
      message: "Book created successfully",
      book: newBook,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// valdate lớn hơn >= 0 hết.
// số lượng sách sau chỉnh sửa ít nhất phải lớn hơn số lượng sách đang ở bên ngoài rental.

// fixed : 1. validate số lượng sách >= số lượng sách đang ngoài đường,
// 2. validate available_quantity >= 0 ; 3. validate available_quantity + số lượng sách đang ngoài đường <= quantity
const updateBook = async (req, res) => {
  try {
    const { quantity, available_quantity, isbn, ...otherData } = req.body;
    const bookId = req.params.id;

    const currentBook = await Book.findById(bookId);
    if (!currentBook)
      return res.status(404).json({ message: "Book not found" });

    // --- 1. Xử lý ISBN (Check trùng & Hỏi Merge) ---
    if (isbn && isbn.trim() !== currentBook.isbn) {
      const normalizedISBN = isbn.trim();

      const existingBook = await Book.findOne({ isbn: normalizedISBN });

      if (existingBook) {
        return res.status(409).json({
          message: "ISBN conflict: Another book already exists with this ISBN.",
          conflictBookId: existingBook._id,
          action: "MERGE_REQUIRED",
        });
      }
    }

    // --- 2. Tính số lượng sách đang "ngoài đường" ---
    const activeRentals = await Rental.aggregate([
      { $match: { status: { $in: ["accepted", "borrowed"] } } },
      { $unwind: "$items" },
      {
        $match: {
          "items.book_id": new mongoose.Types.ObjectId(bookId),
        },
      },
      {
        $group: {
          _id: null,
          totalBorrowed: { $sum: "$items.quantity" },
        },
      },
    ]);

    const borrowedCount =
      activeRentals.length > 0 ? activeRentals[0].totalBorrowed : 0;

    // --- 3. LOGIC TÍNH INVENTORY ---
    let newQuantity = currentBook.quantity;
    let newAvailable = currentBook.available_quantity;

    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({
          message: "Quantity must be >= 0",
        });
      }

      const delta = quantity - currentBook.quantity;

      newQuantity = quantity;

      if (available_quantity === undefined) {
        newAvailable = currentBook.available_quantity + delta;
      }
    }

    if (available_quantity !== undefined) {
      if (typeof available_quantity !== "number" || available_quantity < 0) {
        return res.status(400).json({
          message: "Available quantity must be >= 0",
        });
      }

      newAvailable = available_quantity;
    }

    // --- 4. VALIDATION CHẶT ---
    if (newQuantity < borrowedCount) {
      return res.status(400).json({
        message: `Invalid quantity: cannot be less than borrowed amount (${borrowedCount})`,
      });
    }

    if (newAvailable < 0) {
      return res.status(400).json({
        message: "Available quantity cannot be negative",
      });
    }

    if (newAvailable + borrowedCount > newQuantity) {
      return res.status(400).json({
        message: `Invalid inventory: available (${newAvailable}) + borrowed (${borrowedCount}) cannot exceed total (${newQuantity})`,
      });
    }

    // --- 5. UPDATE ---
    const updateData = {
      ...otherData,
      isbn: isbn ? isbn.trim() : currentBook.isbn,
      quantity: newQuantity,
      available_quantity: newAvailable,
    };

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: updateData },
      { new: true },
    );

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//cái này thì check xem trong tất cả các cái Rental
// xem có còn cái nào chứa id đó mà nó vẫn chưa được trả ko ?
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // 1. Kiểm tra xem sách này có đang được mượn không
    // Tìm bất kỳ đơn hàng nào chứa bookId này mà status KHÔNG PHẢI là 'returned' hoặc 'cancelled'
    const activeRental = await Rental.findOne({
      "items.book_id": bookId,
      status: { $nin: ["returned", "cancelled"] },
    });

    // 2. Nếu tìm thấy, chặn không cho xóa
    if (activeRental) {
      return res.status(400).json({
        message:
          "Cannot delete book: It is currently being borrowed or pending in an active rental.",
      });
    }

    // 3. Nếu an toàn, tiến hành xóa
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableQuantityByBookId = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select(
      "title available_quantity quantity",
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      bookId: book._id,
      title: book.title,
      totalQuantity: book.quantity,
      availableQuantity: book.available_quantity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAvailableQuantityByBookId,
  searchBook,
};

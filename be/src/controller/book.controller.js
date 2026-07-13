const Book = require("../model/book.model");
const Rental = require("../model/rental.model");
const Author = require("../model/author.model");
const Publisher = require("../model/publisher.model");
const Category = require("../model/category.model");
const mongoose = require("mongoose"); // <--- Thêm dòng này vào đầu file

const getAllBooks = async (req, res) => {
  try {
    const { category } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || (page - 1) * limit;

    let query = {};

    // Lọc theo tên category (nếu có)
    if (category && category.trim() !== "") {
      const categories = await Category.find({
        name: { $regex: category, $options: "i" },
      }).select("_id");

      query = {
        category_id: {
          $in: categories.map((c) => c._id),
        },
      };
    }

    // Đếm tổng số sách theo điều kiện
    const totalBooks = await Book.countDocuments(query);

    // Lấy danh sách sách theo điều kiện + phân trang
    const books = await Book.find(query)
      .populate("category_id author_id publisher_id")
      .skip(offset)
      .limit(limit);

    res.status(200).json({
      data: books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: page,
    });
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
    const { category, author, publisher, title } = req.query;
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
      const titleFilter = title
        ? b.title.toLowerCase().includes(title.toLowerCase())
        : true;

      return categoryFilter && authorFilter && publisherFilter && titleFilter;
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

// fixed
const createBook = async (req, res) => {
  try {
    const {
      isbn,
      quantity,
      price,
      author_name,
      publisher_name,
      category_name,
      ...otherData
    } = req.body;

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
      return res
        .status(200)
        .json({ message: "Quantity increased", book: existingBook });
    } else {
      // Find or create Author
      let author_id = null;
      if (author_name) {
        let author = await Author.findOne({ name: author_name });
        if (!author) {
          author = await Author.create({ name: author_name });
        }
        author_id = author._id;
      }

      // Find or create Publisher
      let publisher_id = null;
      if (publisher_name) {
        let publisher = await Publisher.findOne({ name: publisher_name });
        if (!publisher) {
          publisher = await Publisher.create({ name: publisher_name });
        }
        publisher_id = publisher._id;
      }

      // Find or create Category
      let category_id = null;
      if (category_name) {
        let category = await Category.findOne({ name: category_name });
        if (!category) {
          category = await Category.create({ name: category_name });
        }
        category_id = category._id;
      }

      const newBook = new Book({
        isbn,
        quantity,
        available_quantity: quantity,
        price,
        author_id,
        publisher_id,
        category_id,
        ...otherData,
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
    const bookId = req.params.id;
    const {
      quantity,
      available_quantity,
      isbn,
      author_name,
      publisher_name,
      category_name,
      ...otherData
    } = req.body;

    // 0. Tìm sách hiện tại
    const currentBook = await Book.findById(bookId);
    if (!currentBook)
      return res.status(404).json({ message: "Book not found" });

    // --- 1. XỬ LÝ TÁC GIẢ, NHÀ XUẤT BẢN, THỂ LOẠI (Find or Create) ---
    // Xử lý Author
    let author_id = currentBook.author_id;
    if (author_name) {
      let author = await Author.findOne({ name: author_name });
      if (!author) {
        author = await Author.create({ name: author_name });
      }
      author_id = author._id;
    }

    // Xử lý Publisher
    let publisher_id = currentBook.publisher_id;
    if (publisher_name) {
      let publisher = await Publisher.findOne({ name: publisher_name });
      if (!publisher) {
        publisher = await Publisher.create({ name: publisher_name });
      }
      publisher_id = publisher._id;
    }

    // Xử lý Category
    let category_id = currentBook.category_id;
    if (category_name) {
      let category = await Category.findOne({ name: category_name });
      if (!category) {
        category = await Category.create({ name: category_name });
      }
      category_id = category._id;
    }

    // --- 2. XỬ LÝ ISBN (Check trùng) ---
    if (isbn && isbn !== currentBook.isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(409).json({
          message: "ISBN conflict: Another book already exists with this ISBN.",
          conflictBookId: existingBook._id,
        });
      }
    }

    // --- 3. TÍNH SỐ LƯỢNG SÁCH ĐANG ĐƯỢC MƯỢN ---
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

    // --- 4. LOGIC TÍNH INVENTORY ---
    let newQuantity = currentBook.quantity;
    let newAvailable = currentBook.available_quantity;

    // Cập nhật tổng số lượng
    if (quantity !== undefined) {
      const qty = Number(quantity);

      if (Number.isNaN(qty) || qty < 0) {
        return res.status(400).json({
          message: "Quantity must be >= 0",
        });
      }

      const delta = qty - currentBook.quantity;
      newQuantity = qty;

      // Nếu không truyền available_quantity thì tự động điều chỉnh
      if (available_quantity === undefined) {
        newAvailable = currentBook.available_quantity + delta;
      }
    }

    // Cập nhật số lượng có sẵn
    if (available_quantity !== undefined) {
      const availQty = Number(available_quantity);

      if (Number.isNaN(availQty) || availQty < 0) {
        return res.status(400).json({
          message: "Available quantity must be >= 0",
        });
      }

      newAvailable = availQty;
    }

    // --- 5. VALIDATION ---
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

    // --- 6. UPDATE ---
    const updateData = {
      ...otherData,
      isbn: isbn ? isbn.trim() : currentBook.isbn,
      quantity: newQuantity,
      available_quantity: newAvailable,
      author_id,
      publisher_id,
      category_id,
    };

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: updateData },
      { new: true },
    ).populate("author_id publisher_id category_id");

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// fixed: 1. check còn rental nào chưa trả sách này không, nếu có thì không cho xóa
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Kiểm tra sách có tồn tại không
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Kiểm tra còn Rental nào chưa trả sách này không
    const activeRental = await Rental.exists({
      "items.book_id": bookId,
      status: {
        $nin: ["returned", "cancelled"],
      },
    });

    if (activeRental) {
      return res.status(400).json({
        message:
          "Cannot delete book because it is referenced by an active rental.",
      });
    }

    await Book.findByIdAndDelete(bookId);

    return res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
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

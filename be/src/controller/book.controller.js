const Book = require("../model/book.model");
const Rental = require("../model/rental.model");
const Author = require("../model/author.model");
const Publisher = require("../model/publisher.model");
const Category = require("../model/category.model");
const mongoose = require('mongoose'); // <--- Thêm dòng này vào đầu file

const getAllBooks = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || (page - 1) * limit;

    const totalBooks = await Book.countDocuments();
    const books = await Book.find().populate(
      "category_id author_id publisher_id",
    ).skip(offset).limit(limit);

    res.status(200).json({
      data: books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: page
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
      return res
        .status(404)
        .json({
          message: `Can't not find book with the given criteria`,
        });

    res.status(200).json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// check isbn xem exist chưa, nếu rồi thì + quantity, ko thì tạo mới luôn.
// cho phép tạo sách mới để quantity = 0 ???  - nghe hơi ngu, Nhưng ke me vay

const createBook = async (req, res) => {
  try {
    const { isbn, quantity, price, author_name, publisher_name, category_name, ...otherData } = req.body;

    // Validation nghiêm ngặt cho việc nhập mới
    if (!isbn) return res.status(400).json({ message: "ISBN is required" });
    if (typeof quantity !== "number" || quantity < 0)
      return res
        .status(400)
        .json({ message: "Quantity must be greater or equal 0" });
    if (typeof price !== "number" || price < 0)
      return res.status(400).json({ message: "Price cannot be negative" });

    const existingBook = await Book.findOne({ isbn });

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
      await newBook.save();
      return res.status(201).json(newBook);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// valdate lớn hơn >= 0 hết.
// số lượng sách sau chỉnh sửa ít nhất phải lớn hơn số lượng sách đang ở bên ngoài rental.
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
    if (!currentBook) return res.status(404).json({ message: "Book not found" });

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
          conflictBookId: existingBook._id
        });
      }
    }

    // --- 3. TÍNH SỐ LƯỢNG SÁCH ĐANG ĐƯỢC MƯỢN ---
    const activeRentals = await Rental.aggregate([
      { $match: { status: { $in: ["accepted", "borrowed"] } } },
      { $unwind: "$items" },
      { $match: { "items.book_id": new mongoose.Types.ObjectId(bookId) } },
      { $group: { _id: null, totalBorrowed: { $sum: "$items.quantity" } } },
    ]);


    const borrowedCount = activeRentals.length > 0 ? activeRentals[0].totalBorrowed : 0;

    // --- 4. LOGIC TÍNH TOÁN INVENTORY ---
    let newQuantity = quantity !== undefined ? Number(quantity) : currentBook.quantity;
    let newAvailable = available_quantity !== undefined ? Number(available_quantity) : currentBook.available_quantity;

    // Nếu chỉ cập nhật tổng số lượng, tự động điều chỉnh số lượng sẵn có (available)
    if (quantity !== undefined && available_quantity === undefined) {
      const delta = newQuantity - currentBook.quantity;
      newAvailable = currentBook.available_quantity + delta;
    }

    // --- 5. KIỂM TRA ĐIỀU KIỆN RÀNG BUỘC (Validation) ---
    if (newQuantity < 0 || newAvailable < 0) {
      return res.status(400).json({ message: "Quantities cannot be negative" });
    }
    if (newQuantity < borrowedCount) {
      return res.status(400).json({
        message: `Invalid total quantity: Cannot be less than currently borrowed books (${borrowedCount})`,
      });
    }
    if (newAvailable + borrowedCount > newQuantity) {
      return res.status(400).json({
        message: `Invalid inventory: Available (${newAvailable}) + Borrowed (${borrowedCount}) exceeds Total (${newQuantity})`,
      });
    }

    // --- 6. THỰC HIỆN CẬP NHẬT ---
    const updatePayload = {
      ...otherData,
      isbn,
      quantity: newQuantity,
      available_quantity: newAvailable,
      author_id,
      publisher_id,
      category_id
    };

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: updatePayload },
      { new: true }
    ).populate('author_id publisher_id category_id');

    res.status(200).json(updatedBook);

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
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
  searchBook
};

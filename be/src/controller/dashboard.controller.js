const Book = require("../model/book.model");
const User = require("../model/user.model");
const Rental = require("../model/rental.model");
const Category = require("../model/category.model");
const Author = require("../model/author.model");
const Publisher = require("../model/publisher.model");

/**
 * GET /api/dashboard/stats
 * Tổng hợp toàn bộ số liệu cho trang Dashboard của Admin.
 * Trả về 1 payload duy nhất để FE không phải gọi nhiều lần.
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // --- 1. Đếm nhanh các collection ---
    const [
      totalTitles,
      totalUsers,
      totalStaff,
      totalRentals,
      totalCategories,
      totalAuthors,
      totalPublishers,
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: { $in: ["User", "Visitor"] } }),
      User.countDocuments({ role: { $in: ["Staff", "Admin"] } }),
      Rental.countDocuments(),
      Category.countDocuments(),
      Author.countDocuments(),
      Publisher.countDocuments(),
    ]);

    // --- 2. Tổng hợp kho sách (tổng bản, bản có sẵn, giá trị kho) ---
    const inventoryAgg = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: "$quantity" },
          availableCopies: { $sum: "$available_quantity" },
          catalogValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]);
    const inventory = inventoryAgg[0] || {
      totalCopies: 0,
      availableCopies: 0,
      catalogValue: 0,
    };
    inventory.borrowedCopies = inventory.totalCopies - inventory.availableCopies;

    // --- 3. Đơn thuê theo trạng thái ---
    const statusAgg = await Rental.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const rentalsByStatus = {
      pending: 0,
      accepted: 0,
      borrowed: 0,
      returned: 0,
      cancelled: 0,
    };
    statusAgg.forEach((s) => {
      if (s._id) rentalsByStatus[s._id] = s.count;
    });

    // --- 4. Doanh thu: phí thuê (đơn đã duyệt/đang mượn/đã trả) + phí trễ hạn ---
    // Phí thuê: ưu tiên dùng rental.fee đã đóng băng; nếu đơn cũ chưa có fee thì
    // tính dội lại từ giá sách hiện tại (đảm bảo hiển thị đúng cho dữ liệu cũ).
    const feeAgg = await Rental.aggregate([
      { $match: { status: { $in: ["accepted", "borrowed", "returned"] } } },
      {
        $lookup: {
          from: "books",
          localField: "items.book_id",
          foreignField: "_id",
          as: "books",
        },
      },
      {
        $project: {
          fee: 1,
          late_fee: 1,
          // Phí tính dội lại từ items nếu fee chưa được lưu
          computedFee: {
            $sum: {
              $map: {
                input: "$items",
                as: "it",
                in: {
                  $multiply: [
                    "$$it.quantity",
                    {
                      $ifNull: [
                        "$$it.unit_fee",
                        {
                          $let: {
                            vars: {
                              matched: {
                                $first: {
                                  $filter: {
                                    input: "$books",
                                    as: "b",
                                    cond: { $eq: ["$$b._id", "$$it.book_id"] },
                                  },
                                },
                              },
                            },
                            in: { $ifNull: ["$$matched.price", 0] },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          rentalRevenue: {
            $sum: {
              $cond: [{ $gt: ["$fee", 0] }, "$fee", "$computedFee"],
            },
          },
          lateFeeRevenue: { $sum: { $ifNull: ["$late_fee", 0] } },
        },
      },
    ]);
    const rentalRevenue = feeAgg[0]?.rentalRevenue || 0;
    const lateFeeRevenue = feeAgg[0]?.lateFeeRevenue || 0;
    const estimatedRevenue = rentalRevenue + lateFeeRevenue;

    // --- 5. Sách sắp hết hàng (available_quantity thấp) ---
    const lowStockBooks = await Book.find({ available_quantity: { $lte: 5 } })
      .sort({ available_quantity: 1 })
      .limit(6)
      .select("title cover_image quantity available_quantity")
      .lean();

    // --- 6. Đơn quá hạn (đang mượn nhưng đã qua due_date) ---
    const overdueRentals = await Rental.find({
      status: "borrowed",
      due_date: { $lt: now },
    })
      .populate("user_id", "fullname email")
      .populate("items.book_id", "title")
      .sort({ due_date: 1 })
      .limit(6)
      .lean();
    const overdueCount = await Rental.countDocuments({
      status: "borrowed",
      due_date: { $lt: now },
    });

    // --- 7. Đơn thuê gần đây ---
    const recentRentals = await Rental.find()
      .populate("user_id", "fullname email")
      .populate("items.book_id", "title")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // --- 8. Top sách được mượn nhiều nhất ---
    const topBooks = await Rental.aggregate([
      { $match: { status: { $in: ["accepted", "borrowed", "returned"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.book_id",
          borrowCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 1,
          borrowCount: 1,
          title: "$book.title",
          cover_image: "$book.cover_image",
        },
      },
    ]);

    // --- 9. Số đơn thuê 6 tháng gần nhất (dữ liệu cho biểu đồ cột) ---
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyAgg = await Rental.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    // Chuẩn hoá thành đủ 6 tháng liên tục (kể cả tháng không có đơn)
    const monthlyRentals = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const found = monthlyAgg.find(
        (m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
      );
      monthlyRentals.push({
        label: `${d.getMonth() + 1}/${d.getFullYear()}`,
        count: found ? found.count : 0,
      });
    }

    res.status(200).json({
      totals: {
        totalTitles,
        totalUsers,
        totalStaff,
        totalRentals,
        totalCategories,
        totalAuthors,
        totalPublishers,
      },
      inventory,
      rentalsByStatus,
      estimatedRevenue,
      rentalRevenue,
      lateFeeRevenue,
      overdueCount,
      lowStockBooks,
      overdueRentals,
      recentRentals,
      topBooks,
      monthlyRentals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };

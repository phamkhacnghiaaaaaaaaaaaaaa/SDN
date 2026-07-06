const Favourite = require("../model/favourite.model");

const getFavouriteCountByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      const result = await Favourite.aggregate([
        {
          $group: {
            _id: "$book_id",
            totalLikes: { $sum: 1 },
          },
        },
      ]);

      return res.json(result);
    }

    const totalLikes = await Favourite.countDocuments({
      book_id: bookId,
    });

    return res.json({
      totalLikes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getFavouriteCountByBookId,
};

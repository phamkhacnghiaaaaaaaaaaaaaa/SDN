const ReadingProgress = require("../model/reading_progress.model");

const getReadingProgressByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await ReadingProgress.find({ user_id: userId })
      .populate({
        path: "book_id",
        populate: {
          path: "author_id category_id publisher_id",
        },
      })
      .sort({ last_read: -1 });

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReadingProgressByUser,
};

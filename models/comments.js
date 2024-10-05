const mongoose = require("mongoose");

const comment = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    blog: {
      type: mongoose.ObjectId,
      required: true,
      ref: "Blog",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", comment);

module.exports = Comment;

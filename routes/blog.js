const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comments");

const route = Router();

route.post("/", async (req, res) => {
  try {
    const { title, body, createdBy } = req.body;
    if (!title || !body)
      return res.json({ message: "Title and body are required" }).status(400);
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user.sub,
    });
    return res
      .json({ message: "Blog created successfully", data: blog })
      .status(201);
  } catch (error) {
    return res.json({ message: "Failed to create blog" }).status(500);
  }
});

route.get("/", async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const page = req.query.page || 1;
    const skip = limit * (page - 1);
    const sort = req.query.sort || "createdAt";
    const sortBy = req.query.sortBy?.toLowerCase() === "asc" ? 1 : -1;

    // const blog = await Blog.find()
    //   .skip(skip)
    //   .limit(limit)
    //   .sort({ [sort]: sortBy })
    //   .populate("createdBy", "name");
    // const totalCount = await Blog.find().countDocuments();

    const [blog, totalCount] = await Promise.all([
      //Both heavy operations can run together that is why we are using Promise
      Blog.find()
        .skip(skip)
        .limit(limit)
        .sort({ [sort]: sortBy })
        .populate("createdBy", "name"),
      Blog.find().countDocuments(),
    ]);

    if (!blog) return res.json({ message: "No blog found" }).status(204);
    return res.json({
      data: blog,
      meta: {
        count: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Failed to load blogs" }).status(500);
  }
});

route.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);

    if (!blog)
      return res.json({ message: "Id invalid/ id not found" }).status(204);
    const comments = await Comment.find({ blog: id }).populate("user", "name");
    return res.json({ data: blog, comments });
  } catch (error) {
    return res.json({ message: "Failed to find id" }).status(500);
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const loggedinUserId = req.user.sub;
    const blog = await Blog.findById(id);

    console.log(blog.createdBy);

    if (!blog)
      return res.json({ message: "Id invalid/ id not found" }).status(204);
    if (blog.createdBy.toString() !== loggedinUserId)
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this blog" });
    await Blog.findByIdAndDelete(id);

    return res.status(204).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res.json({ message: "Failed to find id" }).status(500);
  }
});

route.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    const { title, body } = req.body;

    if (!blog)
      return res.status(404).json({ message: "Invalid id/blog not found" });
    const loggedinUser = req.user.sub;

    if (blog.createdBy.toString() !== loggedinUser)
      return res
        .status(401)
        .json({ message: "You are not authorized to update this blog" });
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, body },
      { new: true }
    );

    return res.json({
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    return res.status(404).json({ message: "Invalid id/blog not found" });
  }
});

route.post("/:blogId/comment", async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const { comment } = req.body;
    const loggedinUser = req.user.sub;

    const blog = await Blog.findById(blogId);
    console.log(blogId, blog);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    const content = await Comment.create({
      user: loggedinUser,
      content: comment,
      blog: blogId,
    });
    return res
      .status(200)
      .json({ message: "Comment added successfully", data: content });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

route.delete("/comment/:commentId", async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId).populate("blog");

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const loggedinUser = req.user.sub;

    if (
      !(
        comment.user.toString() === loggedinUser ||
        comment.blog.createdBy.toString() === loggedinUser
      )
    )
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this comment" });

    const deleteComment = await Comment.findByIdAndDelete(commentId);
    if (deleteComment)
      return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

route.patch("/comment/:commentId", async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    const { content } = req.body;

    if (!comment)
      return res.status(404).json({ message: "Comment not found/Id invalid" });
    const loggedinUser = req.user.sub;

    if (loggedinUser !== comment.user.toString())
      return res
        .status(401)
        .json({ message: "You are not authorised to update this comment" });

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Comment updated successfully", data: updatedComment });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = route;

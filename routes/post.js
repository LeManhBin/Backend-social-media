import express, { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  commentPost,
  deleteComment,
  deletePost,
  getFeedPosts,
  getPostById,
  getUserPosts,
  likePost,
  updateComment,
  updatePost,
} from "../controllers/post.js";
const router = express.Router();

// Read posts
router.get("/", verifyToken, getFeedPosts);

//get post by ID
router.get("/:id", verifyToken, getPostById);

//Read user post
router.get("/:userId/posts", verifyToken, getUserPosts);

//likePost (like - unlike)
router.patch("/:id/like", verifyToken, likePost);

//delete post
router.delete("/user/:userId/post/:postId", verifyToken, deletePost);

//comment post
router.post("/comment/:postId", verifyToken, commentPost);

//delete comment
router.delete("/comment/:commentId", verifyToken, deleteComment);

//update comment
router.put("/comment/:commentId", verifyToken, updateComment);
export default router;

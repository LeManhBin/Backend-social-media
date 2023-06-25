import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  updateProfile,
  getAllUser,
} from "../controllers/user.js";

const router = express.Router();
//Get all user
router.get("/", verifyToken, getAllUser);
// Get user
router.get("/:id", verifyToken, getUser);

// Get user friends
router.get("/:id/friends", verifyToken, getUserFriends);

//Remove friends
router.patch("/:id/:friendId", addRemoveFriend);

//Update user
router.put("/:userId", verifyToken, updateProfile);
export default router;

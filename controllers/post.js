import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { uuid } from "uuidv4";
//create
export const createPost = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, description } = req.body;
    const picturePath = req.file ? `/assets/${req.file.filename}` : "";
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: "User not found",
        data: 404,
      });
    }
    const newPost = new Post({
      userId,
      description,
      picturePath,
      likes: {},
      comment: [],
    });
    await newPost.save();
    res.status(200).json({
      data: newPost,
      message: "Create post success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get posts
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId")
      .populate({
        path: "comment",
        populate: {
          path: "userId",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({
      data: posts,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get post by id
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.find({ _id: postId })
      .populate("userId")
      .populate({
        path: "comment",
        populate: {
          path: "userId",
        },
      });
    if (!post) {
      res.status(404).json({
        message: "Post not fount",
        status: 404,
      });
    }
    res.status(200).json({
      data: post,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get user post
export const getUserPosts = async (req, res) => {
  try {
    const post = await Post.find({ userId: req.params.userId })
      .populate("userId")
      .populate({
        path: "comment",
        populate: {
          path: "userId",
        },
      });
    if (!post) {
      res.status(404).json({
        message: "Post not fount",
        status: 404,
      });
    }
    res.status(200).json({
      data: post,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Like unlike
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId;
    const post = await Post.findById(postId);
    // Kiểm tra xem likes đã có id user hay chưa bằng phương thức get của Map và trả lại true false
    const isLiked = post.likes.get(userId);
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }
    // update post tại post có id là postId và đổi dữ liệu likes trong Post (Post.likes)
    //new : true phương thức findByIdAndUpdate() sẽ trả về bản ghi sau khi thay đổi
    // nếu không dùng thì phương thức findByIdAndUpdate() sẽ trả về bản ghi trước khi áp dụng các thay đổi, v
    const updatePost = await Post.findByIdAndUpdate(
      postId,
      {
        likes: post.likes,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      data: updatePost,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const userId = req.params.userId;
    const postId = req.params.postId;
    const posts = await Post.findById(postId);
    if (!posts) {
      res.status(404).json({
        message: "Cannot find a post",
        status: 404,
      });
    }
    const userPost = posts.userId.toString();

    if (userId !== userPost) {
      res.status(400).json({
        message: "Delete fail",
        status: 400,
      });
    } else {
      const newPost = await Post.findByIdAndDelete(postId);
      res.status(200).json({
        message: "Delete post success",
        status: 200,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Update post

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Cannot find a post",
        status: 404,
      });
    }

    const postUserId = post.userId.toString();

    if (userId !== postUserId) {
      return res.status(400).json({
        message: "Update fail",
        status: 400,
      });
    }

    const { description } = req.body;
    const picturePath = req.file
      ? `/assets/${req.file.filename}`
      : post.picturePath;

    console.log("file", req.file);
    console.log("req.body", req.body);
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { description, picturePath },
      {
        new: true,
      }
    );

    res.status(200).json({
      data: updatedPost,
      message: "Update post success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Comment
export const commentPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId, description } = req.body;
    console.log("postId", req.body);
    // console.log("userId", userId);
    // console.log("description", description);
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        status: 404,
      });
    }
    const newComment = new Comment({
      postId: postId,
      userId,
      description,
    });
    await newComment.save();

    post.comment.push(newComment._id);
    await post.save();
    res.status(201).json({
      message: "Comment created successfully",
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete Comment
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const deleteCommentDelete = await Comment.findByIdAndDelete(commentId);
    res.status(200).json({
      message: "Delete success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Update commment
export const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { userId, description } = req.body;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Cannot find a comment",
        status: 404,
      });
    }

    if (!description) {
      description = comment.description;
    }

    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      { userId, description },
      {
        new: true,
      }
    );

    res.status(200).json({
      data: updateComment,
      message: "Update success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

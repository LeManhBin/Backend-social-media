import User from "../models/User.js";

//Get all users

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      data: users,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// Get user
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json({
      data: user,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// Get user friends

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return {
          _id,
          firstName,
          lastName,
          occupation,
          location,
          picturePath,
        };
      }
    );
    res.status(200).json({
      data: formattedFriends,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//add remove friends
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    console.log("id", id);
    console.log("friendId", friendId);
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return {
          _id,
          firstName,
          lastName,
          occupation,
          location,
          picturePath,
        };
      }
    );
    res.status(200).json({
      data: formattedFriends,
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Update user

export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { firstName, lastName, location, occupation } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Cannot find a user",
        status: 404,
      });
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, location, occupation },
      {
        new: true,
      }
    );
    console.log("updateUser", updateUser);
    res.status(201).json({
      data: updateUser,
      message: "Update success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Change avatar

export const changeAvatar = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const picturePath = req.file
      ? `/assets/${req.file.filename}`
      : user.picturePath;
    if (!user) {
      return res.status(404).json({
        message: "Cannot find a user",
        status: 404,
      });
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { picturePath },
      {
        new: true,
      }
    );
    console.log(updateUser);
    res.status(201).json({
      data: updateUser,
      message: "Update success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

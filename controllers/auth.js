import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
    } = req.body;

    const picturePath = req.file ? `/assets/${req.file.filename}` : "";

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
        status: 400,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    res.status(200).json({
      data: savedUser,
      message: "Register success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 500,
    });
  }
};

//Login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    /**
     *  isMatch trả về boolean
     * hàm này so sánh password (người dùng nhập) với user.password (mật khẩu bị mã hoá trong db)
     */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    /* đăng ký 1 token với giá trị truyền vào là id user là định danh duy nhất cho người dùng
     * process.env.JWT_SECRET là khoá bí mật dùng để đăng ký và xác thực token
     */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 500,
    });
  }
};

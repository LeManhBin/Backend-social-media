import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import postRoute from "./routes/post.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import { createPost, updatePost } from "./controllers/post.js";
import { changeAvatar } from "./controllers/user.js";
// Configurations
dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 8081;

// Mongo DB connect
mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => {
    console.log("Connect DB success");
  })
  .catch((error) => {
    console.log("Connect DB Fail");
  });

//  Lấy đường dẫn thư mục server.js
const __filename = fileURLToPath(import.meta.url);

//Lấy thư mục tra của __filename
const __dirname = path.dirname(__filename);

//thiết lập bảo mật tạo ra headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

/**
 * bodyParser.json() cấu hình body dạng json
 * limit: giới hạn kích thước phần thân
 * extended: cấp quyền cho các đối tượng phức tạp được phân tích
 */
app.use(bodyParser.json({ limit: "30mb", extended: true }));
// Đây là cấu hình cho phân tích và xử lý dữ liệu dạng x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());

// cấu hình tài nguyên /assets = public/assets
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// File storage

/**
 * diskStorage: xác định cách lưu trữ và đặt tên cho các tệp tin được tải lên từ client
 * destination: định nghĩa thư mục để lưu
 * cb: là 1 callback
 * cb(null, "public/assets"): truyền null sẽ không gặp lỗi
 * filename: định nghĩa tên tệp tin khi lưu trữ.
 * file.originalname: giữ nguyên tên file
 *
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Khởi tạo đối tượng upload, đối tượng này sẽ được sử dụng để xử lý các yêu cầu tải lên file
const upload = multer({ storage });

// Router with File
/**
 * Khai báo 1 route dùng phương thức post
 * upload.single("picture") để chỉ định chỉ tải lên 1 file có tên là picture
 * hàm register được gọi để xử lý yêu cầu đăng ký
 */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
//update  post
app.put(
  "/posts/user/:userId/post/:postId",
  verifyToken,
  upload.single("picture"),
  updatePost
);
app.put(
  "/users/avatar/:userId",
  verifyToken,
  upload.single("picture"),
  changeAvatar
);

// Routers
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

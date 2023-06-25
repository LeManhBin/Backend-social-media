import jwt from "jsonwebtoken";

//  kiểm tra và xác minh token JWT (JSON Web Token) trong các yêu cầu HTTP.
export const verifyToken = async (req, res, next) => {
  try {
    //lấy token từ tiêu đề "Authorization" trong yêu cầu HTTP
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ error: "Access Denied" });
    }
    /**
     * Nếu token tồn tại, đoạn code kiểm tra xem nó có bắt đầu bằng chuỗi "Bearer "
     * sau đó nó cắt bỏ chuỗi "Bearer " để lấy phần token thực sự.
     * Bearer là tiền tố  thường được sử dụng để chỉ ra loại xác thực (trong trường hợp này là JWT).
     *
     */
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    //sử dụng thư viện jsonwebtoken để xác minh tính hợp lệ của token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Nếu token được xác minh thành công, thông tin người dùng được trích xuất từ token và gán vào req.user.
    req.user = verified;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

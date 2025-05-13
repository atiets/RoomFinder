const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const axios = require("axios");

async function getCoordinates(addressString) {
  const encodedAddress = encodeURIComponent(addressString);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1`;

  console.log("📌 URL gửi đến Nominatim:", url);

  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "PhongTroXinh/1.0 (nguyenanhtuyet03.nbk@gmail.com)",
      },
    });

    const results = res.data;

    if (results.length === 0) {
      console.warn(
        "⚠️ Không tìm thấy kết quả tọa độ cho địa chỉ:",
        addressString
      );
      return null;
    }

    const { lat, lon } = results[0];
    console.log("📍 Tọa độ lấy được từ Nominatim:", {
      latitude: lat,
      longitude: lon,
    });

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi Nominatim API:", error.message);
    return null;
  }
}

const sendEmail = require("../services/emailService");
const { checkPostModeration } = require("./aiController");
const { onlineUsers, getIO } = require("../congfig/websocket");

function sendSocketNotification(userId, data) {
  const io = getIO();
  const socketId = onlineUsers[userId];
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit("notification", data);
    } else {
      console.log(`[Socket] Không tìm thấy socket cho userId=${userId}`);
    }
  } else {
    console.log(`[Socket] Người dùng không trực tuyến: ${userId}`);
  }
}

const sendEmailToAdmin = (post) => {
  const subject = "Bài đăng có nghi vấn cần kiểm duyệt";
  const message = `Có một bài đăng mới cần được kiểm duyệt. Chi tiết bài đăng:

  - Tiêu đề: ${post.title}
  - Nội dung: ${post.content}
  - Tình trạng: Chờ duyệt

  Vui lòng xem và duyệt bài đăng này.`;
  sendEmail("tranthituongvy9012003@gmail.com", subject, message);
};

exports.createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      transactionType,
      address,
      projectName,
      locationDetails,
      propertyDetails,
      features,
      legalContract,
      furnitureStatus,
      areaUse,
      area = "m²",
      dimensions,
      price,
      deposit,
      userType,
      contactInfo,
      defaultDaysToShow = 7,
      latitude,
      longitude,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (
      !title ||
      !content ||
      !address ||
      !category ||
      !transactionType ||
      !price ||
      !contactInfo ||
      !userType
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Parse các trường nếu là chuỗi JSON
    const safeParse = (value, fallback = {}) => {
      try {
        return typeof value === "string" ? JSON.parse(value) : value;
      } catch (e) {
        return fallback;
      }
    };

    const parsedAddress = safeParse(address);
    const fullAddress = `${parsedAddress.exactaddress}, ${parsedAddress.ward}, ${parsedAddress.district}, ${parsedAddress.province}`;
    console.log("📌 Địa chỉ đầy đủ gửi tới getCoordinates:", fullAddress);

    console.log("🏃‍♂️ Gọi hàm getCoordinates với địa chỉ:", fullAddress);
    const coordinates = await getCoordinates(fullAddress);
    const parsedLocationDetails = safeParse(locationDetails);
    const parsedPropertyDetails = safeParse(propertyDetails);
    const parsedDimensions = safeParse(dimensions);
    const parsedFeatures = Array.isArray(features)
      ? features
      : safeParse(features, []);
    const parsedContactInfo = safeParse(contactInfo);

    // Lấy user từ token
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.postQuota <= 0) {
      return res.status(403).json({
        message:
          "Bạn đã hết lượt đăng bài miễn phí trong tháng này. Vui lòng đợi tới tháng sau hoặc nâng cấp tài khoản.",
      });
    }

    if (!req.files?.images || req.files.images.length === 0) {
      return res
        .status(400)
        .json({ message: "Thiếu ảnh, vui lòng tải lên ít nhất một ảnh." });
    }

    // Xử lý hình ảnh
    const imageUrls = (req.files?.images || []).map((file) => file.path);

    const videoUrls = (req.files?.videoUrl || []).map((file) => file.path);
    const videoUrl = videoUrls[0] || null;

    // Tạo bài đăng mới
    const newPost = new Post({
      title,
      content,
      category,
      transactionType,
      address: parsedAddress,
      projectName,
      locationDetails: parsedLocationDetails,
      propertyDetails: parsedPropertyDetails,
      features: parsedFeatures,
      legalContract,
      furnitureStatus,
      areaUse,
      area,
      dimensions: parsedDimensions,
      price,
      deposit,
      userType,
      videoUrl: videoUrl,
      images: imageUrls,
      contactInfo: {
        user: parsedContactInfo.user,
        username: parsedContactInfo.username,
        phoneNumber: parsedContactInfo.phoneNumber || "",
      },
      defaultDaysToShow,
      daysRemaining: defaultDaysToShow,
      hoursRemaining: 0,
      expiryDate: null,
      latitude: coordinates?.latitude || null,
      longitude: coordinates?.longitude || null,
    });

    // Trừ quota và lưu user
    user.postQuota -= 1;
    await user.save();

    // Lưu bài đăng

    const savedPost = await newPost.save();
    res.status(201).json({
      message: "Tạo bài đăng thành công",
      post: savedPost,
    });

    (async () => {
      try {
        const moderationResult = await checkPostModeration(savedPost);

        savedPost.status = moderationResult.status;
        savedPost.rejectionReason = moderationResult.reason;

        if (moderationResult.status === "approved") {
          savedPost.visibility = "visible";
        }

        await savedPost.save();

        if (moderationResult.status === "approved") {
          sendSocketNotification(userId, {
            message: `Bài đăng của bạn với tiêu đề "${savedPost.title}" đã được duyệt và sẽ hiển thị công khai.`,
          });
        } else if (moderationResult.status === "rejected") {
          sendSocketNotification(userId, {
            message: `Bài đăng của bạn với tiêu đề "${savedPost.title}" bị từ chối. Lý do: ${moderationResult.reason}`,
          });
        } else if (moderationResult.status === "pending") {
          sendSocketNotification(userId, {
            message: `Bài đăng của bạn với tiêu đề "${savedPost.title}" đang đợi admin duyệt. `,
          });
        }
      } catch (err) {
        console.error("Lỗi xử lý hậu kiểm duyệt:", err);
      }
    })();
  } catch (error) {
    console.error("Lỗi khi tạo bài đăng:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Lỗi xác thực dữ liệu", error: error.message });
    }
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const visibility = req.query.visibility || "";
    const startIndex = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query).skip(startIndex).limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPostById = async (req, res) => {
  try {
    console.log("Request ID:", req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    let post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }
    console.log("views", post.views);
    res.status(200).json(post);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài đăng:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật bài đăng
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }

    Object.assign(post, req.body);
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delete post successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPostsByStatus = async (req, res) => {
  try {
    const { status, visibility } = req.query;

    if (!status || !visibility) {
      return res
        .status(400)
        .json({ message: "State and visibility are required" });
    }

    const posts = await Post.find({
      status,
      visibility,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Lấy bài đăng(new)
exports.getUserPostsByStateAndVisibility = async (req, res) => {
  try {
    const { status, visibility } = req.query;

    if (!status || !visibility) {
      return res
        .status(400)
        .json({ message: "State and visibility are required" });
    }

    const posts = await Post.find({
      "contactInfo.user": req.user.id,
      status,
      visibility,
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts by state and visibility:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Cập nhật bài đăng
exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  let updateData = req.body;

  updateData.status = "update";
  updateData.visibility = "hidden";

  try {
    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ message: "Bài đăng không tồn tại" });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.toggleVisibility = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại" });
    }
    post.visibility = post.visibility === "visible" ? "hidden" : "visible";
    await post.save();

    res.json({
      message: "Trạng thái hiển thị đã được cập nhật",
      visibility: post.visibility,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const {
      keyword,
      province,
      category,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
    } = req.query;
    console.log("minPrice từ request:", minPrice);

    // Hàm chuyển đổi chuỗi thành số
    const convertToNumber = (value) => {
      if (!value) return null;
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, "")); // Loại bỏ tất cả ký tự không phải số
      return isNaN(numericValue) ? null : numericValue;
    };

    const filter = {
      visibility: "visible",
      status: "approved",
    };

    const filtersExpr = [];

    // Lọc theo tỉnh
    if (province) filter["address.province"] = province;

    // Lọc theo từ khóa
    if (keyword) {
      filter.$or = [
        { category: { $regex: keyword, $options: "i" } },
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ];
    }

    // Lọc theo category
    if (category) filter.category = category;

    // Lọc theo rentalPrice
    if (minPrice || maxPrice) {
      const numericMinPrice = convertToNumber(minPrice);
      const numericMaxPrice = convertToNumber(maxPrice);

      if (numericMinPrice !== null || numericMaxPrice !== null) {
        const rentalPriceFilter = {};

        if (numericMinPrice !== null) rentalPriceFilter.$gte = numericMinPrice;
        if (numericMaxPrice !== null) rentalPriceFilter.$lte = numericMaxPrice;

        filtersExpr.push(
          numericMinPrice !== null
            ? {
                $gte: [
                  {
                    $toDouble: {
                      $replaceAll: {
                        input: {
                          $arrayElemAt: [{ $split: ["$rentalPrice", " "] }, 0],
                        },
                        find: ",",
                        replacement: ".",
                      },
                    },
                  },
                  numericMinPrice,
                ],
              }
            : null,
          numericMaxPrice !== null
            ? {
                $lte: [
                  {
                    $toDouble: {
                      $replaceAll: {
                        input: {
                          $arrayElemAt: [{ $split: ["$rentalPrice", " "] }, 0],
                        },
                        find: ",",
                        replacement: ".",
                      },
                    },
                  },
                  numericMaxPrice,
                ],
              }
            : null
        );
      }
    }

    // Lọc theo area
    if (minArea || maxArea) {
      const numericMinArea = convertToNumber(minArea);
      const numericMaxArea = convertToNumber(maxArea);

      if (numericMinArea !== null || numericMaxArea !== null) {
        filtersExpr.push(
          numericMinArea !== null
            ? {
                $gte: [
                  {
                    $toDouble: {
                      $replaceAll: {
                        input: {
                          $arrayElemAt: [{ $split: ["$area", " "] }, 0],
                        },
                        find: ",",
                        replacement: ".",
                      },
                    },
                  },
                  numericMinArea,
                ],
              }
            : null,
          numericMaxArea !== null
            ? {
                $lte: [
                  {
                    $toDouble: {
                      $replaceAll: {
                        input: {
                          $arrayElemAt: [{ $split: ["$area", " "] }, 0],
                        },
                        find: ",",
                        replacement: ".",
                      },
                    },
                  },
                  numericMaxArea,
                ],
              }
            : null
        );
      }
    }

    if (filtersExpr.length > 0) {
      filter.$expr = { $and: filtersExpr.filter(Boolean) };
    }

    const posts = await Post.find(filter).sort({ createdAt: -1 }); // Sắp xếp theo thứ tự từ mới nhất đến cũ nhất
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Lấy post của admin theo trạng thái có phân trang
exports.getUserPostAd = async (req, res) => {
  try {
    const { status, visibility, page = 1, limit = 10 } = req.query;

    if (!status || !visibility) {
      return res
        .status(400)
        .json({ message: "State and visibility are required" });
    }
    const startIndex = (page - 1) * limit;
    const total = await Post.countDocuments({
      "contactInfo.user": req.user.id,
      status,
      visibility,
    });

    const posts = await Post.find({
      "contactInfo.user": req.user.id,
      status,
      visibility,
    })
      .skip(startIndex)
      .limit(parseInt(limit))
      .exec();

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts by state and visibility:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Duyệt bài viết của admin
exports.approvePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại" });
    }
    const daysToShow = post.defaultDaysToShow;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToShow);

    post.status = "approved";
    post.visibility = "visible";
    post.expiryDate = expiryDate;
    post.daysRemaining = daysToShow;
    post.hoursRemaining = 0;

    await post.save();
    const owner = await User.findById(post.contactInfo.user);
    if (owner) {
      const notification = {
        message: `Bài viết "${post.title}" của bạn đã được phê duyệt.`,
        type: "post",
        post_id: postId,
        status: "unread",
      };
      owner.notifications.push(notification);
      await owner.save();
    }

    res
      .status(200)
      .json({ message: "Bài viết đã được phê duyệt thành công.", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi phê duyệt bài đăng", error: error.message });
  }
};

//Từ chối bài viết
exports.rejectPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: "rejected", visibility: "hidden" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post rejected successfully", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting post", error: error.message });
  }
};

//Ẩn bài đăng
exports.hiddenPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: "approved", visibility: "hidden" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post hidden successfully", post });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res
      .status(500)
      .json({ message: "Error hiding post", error: error.message });
  }
};

//Hiện bài đăng của admin
exports.visiblePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: "approved", visibility: "visible" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post visible successfully", post });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res
      .status(500)
      .json({ message: "Error visible post", error: error.message });
  }
};

exports.getUserPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({
      "contactInfo.user": userId,
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts by user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Thống kê số lượng bài đăng theo ngày
exports.getPostCountByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const postsByDate = await Post.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          visibility: "visible",
          status: "approved",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(postsByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thống kê 7 loại hình cho thuê có nhiều bài đăng nhất
exports.getTopCategories = async (req, res) => {
  try {
    const topCategories = await Post.aggregate([
      {
        $match: {
          visibility: "visible",
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 7 },
    ]);

    res.status(200).json(topCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thống kê 7 tỉnh/thành phố có nhiều bài đăng nhất
exports.getTopProvinces = async (req, res) => {
  try {
    const topProvinces = await Post.aggregate([
      {
        $match: {
          visibility: "visible",
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$address.province",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 7 },
    ]);

    res.status(200).json(topProvinces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToFavorites = async (req, res) => {
  const postId = req.params.id;
  try {
    // Kiểm tra người dùng
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra postId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log(postId);
      return res.status(400).json({ message: "ID bài đăng không hợp lệ" });
    }

    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    // Kiểm tra nếu bài đăng đã có trong favorites
    if (user.favorites.includes(postId)) {
      return res
        .status(400)
        .json({ message: "Bài đăng đã có trong danh sách yêu thích" });
    }

    // Thêm bài đăng vào danh sách yêu thích của người dùng
    user.favorites.push(postId);
    await user.save();

    res.status(200).json({
      message: "Đã thêm bài đăng vào danh sách yêu thích",
      favorites: user.favorites,
    });
    console.log(postId);
  } catch (error) {
    console.error(error); // In lỗi ra console để kiểm tra chi tiết
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//xóa yêu thích
exports.removeFromFavorites = async (req, res) => {
  const postId = req.params.id;

  try {
    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra xem bài đăng có trong danh sách yêu thích không
    console.log("Favorites before removing:", user.favorites);
    user.favorites = user.favorites.filter((fav) => fav.toString() !== postId);

    // Lưu lại thông tin người dùng sau khi thay đổi
    await user.save();
    console.log("User after save:", user);

    res.status(200).json({
      message: "Đã xóa bài đăng khỏi danh sách yêu thích",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("Error during removing from favorites:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//Lấy danh sách post yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateDefaultDaysToShow = async (req, res) => {
  const { days } = req.body;

  try {
    const now = new Date();
    const posts = await Post.find({});

    const operations = posts.map((post) => {
      const oldDaysToShow = post.defaultDaysToShow;

      // Kiểm tra expiryDate hợp lệ
      const expiryDate =
        post.expiryDate && !isNaN(new Date(post.expiryDate).getTime())
          ? new Date(post.expiryDate)
          : now; // Nếu không hợp lệ, dùng ngày hiện tại

      const remainingTime = expiryDate - now; // Thời gian còn lại
      const remainingDays = Math.max(
        0,
        Math.floor(remainingTime / (1000 * 60 * 60 * 24))
      );
      const remainingHours = Math.max(
        0,
        Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      );

      let newDaysRemaining, newHoursRemaining;

      if (days > oldDaysToShow) {
        newDaysRemaining = remainingDays + (days - oldDaysToShow);
        newHoursRemaining = remainingHours;
      } else {
        newDaysRemaining = Math.max(0, remainingDays - (oldDaysToShow - days));
        newHoursRemaining = remainingHours;
      }

      const newExpiryDate = new Date(
        now.getTime() +
          newDaysRemaining * (1000 * 60 * 60 * 24) +
          newHoursRemaining * (1000 * 60 * 60)
      );

      return {
        updateOne: {
          filter: { _id: post._id },
          update: {
            $set: {
              defaultDaysToShow: days,
              daysRemaining: newDaysRemaining,
              hoursRemaining: newHoursRemaining,
              expiryDate: newExpiryDate,
              visibility:
                newDaysRemaining === 0 && newHoursRemaining === 0
                  ? "hidden"
                  : "visible",
            },
          },
        },
      };
    });

    // Thực hiện cập nhật
    if (operations.length > 0) {
      await Post.bulkWrite(operations);
    }

    res
      .status(200)
      .json({ message: "Updated default days to show for all posts" });
  } catch (error) {
    console.error("Error updating posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
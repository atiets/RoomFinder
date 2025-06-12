const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const axios = require("axios");
const { io } = require("../congfig/websocket");

const sendEmail = require("../services/emailService");
const { checkPostModeration } = require("./aiController");
const { onlineUsers } = require("../congfig/websocket");
const { checkAlertSubscriptions } = require("./alertSubscription");
const SubscriptionService = require('../services/subscriptionService');

function sendSocketNotification(userId, data) {
  const socketId = onlineUsers[userId];

  if (socketId) {
    const userSocket = io().sockets.sockets.get(socketId);
    if (userSocket) {
      userSocket.emit("notification", data);
      console.log(`[Socket] Đã gửi thông báo tới userId=${userId}`);
    } else {
      console.log(`[Socket] Không tìm thấy socket với socketId=${socketId} cho userId=${userId}`);
    }
  } else {
    console.log(`[Socket] Người dùng không trực tuyến: userId=${userId}`);
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

// async function getCoordinates(addressString) {
//   const encodedAddress = encodeURIComponent(addressString);
//   const apiKey = process.env.GOOGLE_MAPS_API_KEY;
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

//   console.log("📌 URL gửi đến Google Maps API:", url);

//   try {
//     const res = await axios.get(url);
//     const results = res.data.results;

//     if (!results || results.length === 0) {
//       console.warn("⚠️ Không tìm thấy tọa độ cho địa chỉ:", addressString);
//       return null;
//     }

//     const { lat, lng } = results[0].geometry.location;
//     console.log("📍 Tọa độ lấy được từ Google Maps:", {
//       latitude: lat,
//       longitude: lng,
//     });

//     return {
//       latitude: lat,
//       longitude: lng,
//     };
//   } catch (error) {
//     console.error("❌ Lỗi khi gọi Google Maps API:", error.message);
//     return null;
//   }
// }

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
      area,
      typeArea,
      dimensions,
      price,
      deposit,
      userType,
      contactInfo,
      defaultDaysToShow = 7,
      latitude,
      longitude,
      isVip = false,
    } = req.body;

    // Parse isVip từ string thành boolean nếu cần
    const isVipPost = isVip === 'true' || isVip === true;

    console.log("🔍 CreatePost Debug:", {
      isVip,
      isVipPost,
      userId: req.user.id
    });

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

    const coordinates = await getCoordinates(fullAddress);
    const parsedLocationDetails = safeParse(locationDetails);
    const parsedPropertyDetails = safeParse(propertyDetails);
    const parsedDimensions = safeParse(dimensions);
    const parsedFeatures = Array.isArray(features) ? features : safeParse(features, []);
    const parsedContactInfo = safeParse(contactInfo);

    // Lấy user từ token
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    try {
      if (isVipPost) {
        const vipQuotaResponse = await axios.get(
          `${process.env.API_BASE_URL || 'http://localhost:8000'}/v1/payments/usage/check?action=vip_post`,
          {
            headers: { Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}` }
          }
        );

        if (!vipQuotaResponse.data.success || !vipQuotaResponse.data.data.canUse) {
          return res.status(403).json({
            message: "Bạn đã hết lượt đăng tin VIP trong tháng này hoặc gói của bạn không hỗ trợ tin VIP.",
          });
        }
      } else {
        const postQuotaResponse = await axios.get(
          `${process.env.API_BASE_URL || 'http://localhost:8000'}/v1/payments/usage/check?action=post`,
          {
            headers: { Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}` }
          }
        );

        if (!postQuotaResponse.data.success || !postQuotaResponse.data.data.canUse) {
          return res.status(403).json({
            message: "Bạn đã hết lượt đăng tin trong tháng này. Vui lòng nâng cấp gói để đăng thêm.",
          });
        }
      }
    } catch (quotaError) {
      console.error("Error checking quota:", quotaError);
      return res.status(500).json({
        message: "Lỗi khi kiểm tra quota đăng tin",
      });
    }

    if (!req.files?.images || req.files.images.length === 0) {
      return res.status(400).json({ message: "Thiếu ảnh, vui lòng tải lên ít nhất một ảnh." });
    }

    // Xử lý images
    let bodyImages = req.body.images;
    if (!Array.isArray(bodyImages)) {
      bodyImages = bodyImages ? [bodyImages] : [];
    }

    const imageFiles = req.files?.images || [];
    const imageUrls = [...bodyImages];
    imageFiles.forEach((file) => {
      imageUrls.push(file.path);
    });

    // Xử lý videoUrl
    let videoUrl = null;
    if (req.files?.videoUrl?.[0]) {
      videoUrl = req.files.videoUrl[0].path;
    } else if (typeof req.body.videoUrl === 'string' && req.body.videoUrl.startsWith('http')) {
      videoUrl = req.body.videoUrl;
    }

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
      typeArea,
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
      isVip: isVipPost,
      userId: userId,
    });

    // Lưu bài đăng
    const savedPost = await newPost.save();

    try {
      if (isVipPost) {
        await axios.post(
          `${process.env.API_BASE_URL || 'http://localhost:8000'}/v1/payments/usage/update`,
          { action: 'vip_post' },
          {
            headers: { Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}` }
          }
        );
        console.log(`✅ Updated VIP usage for user ${userId}`);
      } else {
        await axios.post(
          `${process.env.API_BASE_URL || 'http://localhost:8000'}/v1/payments/usage/update`,
          { action: 'post' },
          {
            headers: { Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}` }
          }
        );
        console.log(`✅ Updated post usage for user ${userId}`);
      }
    } catch (usageError) {
      console.error("Error updating usage tracking:", usageError);
      // Không throw error để không ảnh hưởng đến việc tạo post
    }

    res.status(201).json({
      message: "Tạo bài đăng thành công",
      post: savedPost,
    });

    // Background processing for moderation
    (async () => {
      try {
        const moderationResult = await checkPostModeration(savedPost);

        savedPost.status = moderationResult.status;
        savedPost.rejectionReason = moderationResult.reason;

        if (moderationResult.status === "approved") {
          savedPost.visibility = "visible";
          await checkAlertSubscriptions(savedPost);
        }

        await savedPost.save();
        const postTypeText = isVipPost ? 'VIP ' : '';

        const owner = await User.findById(savedPost.contactInfo.user);
        if (owner) {
          let message = "";

          if (moderationResult.status === "approved") {
            message = `Bài đăng ${postTypeText}của bạn với tiêu đề "${savedPost.title}" đã được duyệt và sẽ hiển thị công khai.`;
          } else if (moderationResult.status === "rejected") {
            message = `Bài đăng ${postTypeText}của bạn với tiêu đề "${savedPost.title}" bị từ chối. Lý do: ${moderationResult.reason}`;
          } else if (moderationResult.status === "pending") {
            message = `Bài đăng ${postTypeText}của bạn với tiêu đề "${savedPost.title}" đang đợi admin duyệt.`;
          }

          const notification = {
            message,
            type: "post",
            post_id: savedPost._id,
            status: "unread",
            createdAt: new Date(),
          };

          owner.notifications.push(notification);
          await owner.save();

          // Gửi socket
          const socket = io();
          socket.to(owner._id.toString()).emit("notification", notification);
        }
      } catch (err) {
        console.error("Lỗi xử lý hậu kiểm duyệt:", err);
      }
    })();
  } catch (error) {
    console.error("Lỗi khi tạo bài đăng:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Lỗi xác thực dữ liệu", error: error.message });
    }
    res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

// Hàm chung để xử lý dữ liệu quận/huyện
const processDistrictData = async () => {
  // Chỉnh lại để lấy dữ liệu cho tháng 5/2025
  const currentYear = 2025;
  const currentMonth = 4; // Tháng 5 (index 4 vì tháng bắt đầu từ 0)

  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
  const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);

  console.log(`Tháng hiện tại: ${firstDayCurrentMonth.toISOString()} (Tháng 5/2025)`);
  console.log(`Tháng trước: ${firstDayPreviousMonth.toISOString()} (Tháng 4/2025)`);

  // Lấy tất cả bài đăng đã được phê duyệt và hiển thị với các trường cần thiết
  const posts = await Post.find(
    {
      status: "approved",
      visibility: "visible",
      latitude: { $ne: null },
      longitude: { $ne: null },
      price: { $gt: 0 },
      area: { $gt: 0 },
    },
    {
      "address.province": 1,
      "address.district": 1,
      latitude: 1,
      longitude: 1,
      price: 1,
      area: 1,
      createdAt: 1,
      category: 1,
      transactionType: 1,
    }
  );

  console.log(`Tổng số bài đăng tìm thấy: ${posts.length}`);

  // Cấu trúc dữ liệu mới để lưu trữ theo từng loại BĐS và loại giao dịch
  const districtData = {};

  // Danh sách các loại bất động sản và giao dịch
  const categories = [
    "Căn hộ/chung cư",
    "Nhà ở",
    "Đất",
    "Văn phòng, mặt bằng kinh doanh",
    "phòng trọ",
  ];

  const transactionTypes = ["Cho thuê", "Cần bán"];

  // Xử lý từng bài đăng
  posts.forEach((post) => {
    const province = post.address.province;
    const district = post.address.district;
    const category = post.category;
    const transactionType = post.transactionType;
    const postDate = new Date(post.createdAt);
    const pricePerSqM = post.price / post.area;

    // Khởi tạo dữ liệu tỉnh/thành nếu chưa tồn tại
    if (!districtData[province]) {
      districtData[province] = {};
    }

    // Khởi tạo dữ liệu quận/huyện nếu chưa tồn tại
    if (!districtData[province][district]) {
      districtData[province][district] = {
        lat: post.latitude,
        lng: post.longitude,
        latestTimestamp: 0,
        byCategoryAndTransaction: {},
      };

      // Khởi tạo cho từng cặp loại BĐS + loại giao dịch
      categories.forEach((cat) => {
        districtData[province][district].byCategoryAndTransaction[cat] = {};
        transactionTypes.forEach((trans) => {
          districtData[province][district].byCategoryAndTransaction[cat][
            trans
          ] = {
            currentMonth: { total: 0, count: 0 },
            previousMonth: { total: 0, count: 0 },
          };
        });
      });
    }

    // Cập nhật tọa độ nếu đây là bài đăng mới nhất cho quận/huyện
    const postTimestamp = postDate.getTime();
    if (postTimestamp > districtData[province][district].latestTimestamp) {
      districtData[province][district].lat = post.latitude;
      districtData[province][district].lng = post.longitude;
      districtData[province][district].latestTimestamp = postTimestamp;
    }

    // Xác định thời gian của bài đăng
    const isCurrentMonth = postDate >= firstDayCurrentMonth;
    const isPreviousMonth =
      postDate >= firstDayPreviousMonth && postDate < firstDayCurrentMonth;

    // Cập nhật dữ liệu theo loại BĐS và loại giao dịch
    if (isCurrentMonth) {
      districtData[province][district].byCategoryAndTransaction[category][
        transactionType
      ].currentMonth.total += pricePerSqM;
      districtData[province][district].byCategoryAndTransaction[category][
        transactionType
      ].currentMonth.count += 1;
    } else if (isPreviousMonth) {
      districtData[province][district].byCategoryAndTransaction[category][
        transactionType
      ].previousMonth.total += pricePerSqM;
      districtData[province][district].byCategoryAndTransaction[category][
        transactionType
      ].previousMonth.count += 1;
    }
  });

  // Tính toán giá trung bình và biến động giá
  const result = {};

  for (const province in districtData) {
    result[province] = {};

    for (const district in districtData[province]) {
      const data = districtData[province][district];

      // Khởi tạo kết quả cho quận/huyện
      result[province][district] = {
        lat: data.lat,
        lng: data.lng,
        byCategoryAndTransaction: {},
      };

      // Tính toán giá trung bình và biến động giá cho từng cặp loại BĐS + giao dịch
      for (const cat of categories) {
        result[province][district].byCategoryAndTransaction[cat] = {};

        for (const trans of transactionTypes) {
          const combinedData = data.byCategoryAndTransaction[cat][trans];
          const combinedCurrentAvg =
            combinedData.currentMonth.count > 0
              ? combinedData.currentMonth.total /
              combinedData.currentMonth.count
              : 0;

          const combinedPrevAvg =
            combinedData.previousMonth.count > 0
              ? combinedData.previousMonth.total /
              combinedData.previousMonth.count
              : 0;

          let combinedPriceFluctuation = 0;
          if (combinedCurrentAvg > 0 && combinedPrevAvg > 0) {
            combinedPriceFluctuation =
              ((combinedCurrentAvg - combinedPrevAvg) / combinedPrevAvg) *
              100;
          }

          // Chỉ thêm vào kết quả nếu có dữ liệu
          if (combinedCurrentAvg > 0 || combinedData.currentMonth.count > 0) {
            result[province][district].byCategoryAndTransaction[cat][trans] =
            {
              commonPrice: parseFloat(combinedCurrentAvg.toFixed(2)),
              priceFluctuation: parseFloat(
                combinedPriceFluctuation.toFixed(2)
              ),
              count: combinedData.currentMonth.count,
            };
          }
        }

        // Xóa loại BĐS nếu không có dữ liệu
        if (
          Object.keys(
            result[province][district].byCategoryAndTransaction[cat]
          ).length === 0
        ) {
          delete result[province][district].byCategoryAndTransaction[cat];
        }
      }
    }
  }

  return result;
};

// API endpoint 1: Lấy danh sách bài đăng để so sánh giá
exports.getDistrictCoordinatesByCity = async (req, res) => {
  try {
    const result = await processDistrictData();
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi trong getDistrictCoordinatesByCity:", error);
    res.status(500).json({ message: error.message });
  }
};

// API endpoint 2: Lấy data cho compare chart
exports.getCompareChartData = async (req, res) => {
  try {
    const { province, district, category, transactionType } = req.query;

    // Kiểm tra các tham số bắt buộc
    if (!province || !district || !category || !transactionType) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin tỉnh, quận, loại BĐS và loại giao dịch"
      });
    }

    // Chỉnh lại thời gian để lấy dữ liệu từ tháng 5/2025
    const currentYear = 2025;
    const currentMonth = 4; // Tháng 5 (index 4)

    console.log(`Đang lấy dữ liệu cho tháng 5/2025`);

    // Tạo mảng chứa 12 tháng gần nhất tính từ tháng 5/2025
    const last12Months = [];
    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      last12Months.push({
        month: month + 1,
        year,
        startDate,
        endDate,
        label: `${month + 1}/${year}`,
        data: {
          count: 0,
          totalPrice: 0,
          minPrice: Infinity,
          maxPrice: 0
        }
      });
    }

    console.log(`Lấy dữ liệu từ ${last12Months[11].label} đến ${last12Months[0].label}`);

    // Lấy tất cả bài đăng trong 12 tháng qua theo điều kiện lọc
    const startDate = new Date(last12Months[11].startDate);
    const endDate = new Date(currentYear, currentMonth + 1, 0); // Cuối tháng 5/2025

    const posts = await Post.find({
      status: "approved",
      visibility: "visible",
      'address.province': province,
      'address.district': district,
      category: category,
      transactionType: transactionType,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      price: { $gt: 0 },
      area: { $gt: 0 }
    }, {
      price: 1,
      area: 1,
      createdAt: 1,
      'address.ward': 1
    });

    console.log(`Tìm thấy ${posts.length} bài đăng phù hợp từ ${startDate.toLocaleDateString()} đến ${endDate.toLocaleDateString()}`);

    // Xử lý dữ liệu tổng quan
    let totalPosts = 0;
    let totalPricePerSqm = 0;
    let minPrice = Infinity;
    let maxPrice = 0;
    let wardData = {};

    // Xử lý dữ liệu biểu đồ theo thời gian
    posts.forEach(post => {
      const pricePerSqm = post.price / post.area;
      const postDate = new Date(post.createdAt);

      // Cập nhật thống kê tổng quan
      totalPosts++;
      totalPricePerSqm += pricePerSqm;
      minPrice = Math.min(minPrice, pricePerSqm);
      maxPrice = Math.max(maxPrice, pricePerSqm);

      // Cập nhật dữ liệu theo phường/xã
      const ward = post.address.ward;
      if (!wardData[ward]) {
        wardData[ward] = {
          count: 0,
          totalPrice: 0,
          minPrice: Infinity,
          maxPrice: 0
        };
      }
      wardData[ward].count++;
      wardData[ward].totalPrice += pricePerSqm;
      wardData[ward].minPrice = Math.min(wardData[ward].minPrice, pricePerSqm);
      wardData[ward].maxPrice = Math.max(wardData[ward].maxPrice, pricePerSqm);

      // Cập nhật dữ liệu theo tháng
      for (const monthData of last12Months) {
        if (postDate >= monthData.startDate && postDate <= monthData.endDate) {
          monthData.data.count++;
          monthData.data.totalPrice += pricePerSqm;
          monthData.data.minPrice = Math.min(monthData.data.minPrice, pricePerSqm);
          monthData.data.maxPrice = Math.max(monthData.data.maxPrice, pricePerSqm);
          break;
        }
      }
    });

    // Tính giá trung bình và định dạng dữ liệu theo tháng
    const timelineData = last12Months.reverse().map(monthData => {
      const avgPrice = monthData.data.count > 0
        ? monthData.data.totalPrice / monthData.data.count
        : null;

      return {
        label: monthData.label,
        avgPrice: avgPrice ? parseFloat(avgPrice.toFixed(2)) : null,
        minPrice: monthData.data.minPrice !== Infinity ? parseFloat(monthData.data.minPrice.toFixed(2)) : null,
        maxPrice: monthData.data.maxPrice > 0 ? parseFloat(monthData.data.maxPrice.toFixed(2)) : null,
        count: monthData.data.count
      };
    });

    // Định dạng dữ liệu theo phường/xã
    const formattedWardData = {};
    for (const ward in wardData) {
      const data = wardData[ward];
      formattedWardData[ward] = {
        avgPrice: data.count > 0 ? parseFloat((data.totalPrice / data.count).toFixed(2)) : 0,
        minPrice: data.minPrice !== Infinity ? parseFloat(data.minPrice.toFixed(2)) : 0,
        maxPrice: data.maxPrice > 0 ? parseFloat(data.maxPrice.toFixed(2)) : 0,
        count: data.count
      };
    }

    // Lấy dữ liệu các quận/huyện lân cận
    const districtData = await processDistrictData();
    const neighboringDistricts = {};

    if (districtData[province]) {
      for (const [neighborDistrict, data] of Object.entries(districtData[province])) {
        if (neighborDistrict !== district && data.byCategoryAndTransaction &&
          data.byCategoryAndTransaction[category] &&
          data.byCategoryAndTransaction[category][transactionType]) {

          neighboringDistricts[neighborDistrict] = {
            commonPrice: data.byCategoryAndTransaction[category][transactionType].commonPrice,
            priceFluctuation: data.byCategoryAndTransaction[category][transactionType].priceFluctuation,
            count: data.byCategoryAndTransaction[category][transactionType].count
          };
        }
      }
    }

    // Lấy dữ liệu phân tích theo loại BĐS
    const categoryAnalysis = {};
    if (districtData[province] && districtData[province][district]) {
      const districtInfo = districtData[province][district];
      for (const [cat, transactions] of Object.entries(districtInfo.byCategoryAndTransaction)) {
        for (const [trans, data] of Object.entries(transactions)) {
          if (!categoryAnalysis[cat]) {
            categoryAnalysis[cat] = {};
          }
          categoryAnalysis[cat][trans] = {
            commonPrice: data.commonPrice,
            priceFluctuation: data.priceFluctuation,
            count: data.count
          };
        }
      }
    }

    // Tính toán giá trung bình và xu hướng
    const avgPrice = totalPosts > 0 ? parseFloat((totalPricePerSqm / totalPosts).toFixed(2)) : 0;
    const currentPriceData = districtData[province]?.[district]?.byCategoryAndTransaction?.[category]?.[transactionType];
    const trend = currentPriceData?.priceFluctuation > 0 ? "up" :
      currentPriceData?.priceFluctuation < 0 ? "down" : "stable";

    // Cấu trúc dữ liệu trả về
    const result = {
      overview: {
        province,
        district,
        category,
        transactionType,
        currentPrice: currentPriceData?.commonPrice || avgPrice,
        priceFluctuation: currentPriceData?.priceFluctuation || 0,
        trend,
        totalPosts,
        minPrice: minPrice !== Infinity ? parseFloat(minPrice.toFixed(2)) : 0,
        maxPrice: parseFloat(maxPrice.toFixed(2)),
        wardCount: Object.keys(wardData).length,
        analysisMonth: "5/2025", // Thêm thông tin tháng phân tích
        analysisRange: `${last12Months[0]?.label} - 5/2025` // Thêm thông tin khoảng thời gian
      },
      timelineData,
      neighboringDistricts,
      wardAnalysis: formattedWardData,
      categoryAnalysis
    };

    console.log(`Kết quả phân tích cho ${province} - ${district}, ${category}, ${transactionType} trong tháng 5/2025`);

    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi trong getCompareChartData:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const visibility = req.query.visibility || "";
    const search = req.query.search || "";
    const startIndex = (page - 1) * limit;

    const query = {};

    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    // Nếu có từ khóa tìm kiếm
    if (search) {
      const searchRegex = new RegExp(search, "i"); // không phân biệt hoa/thường

      query.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { "contactInfo.username": { $regex: searchRegex } },
        { "contactInfo.phoneNumber": { $regex: searchRegex } },
        { "address.province": { $regex: searchRegex } },
        { "address.district": { $regex: searchRegex } },
      ];
    }

    const total = await Post.countDocuments(query);
    
    // ⭐ VIP Posts lên đầu
    const posts = await Post.find(query)
      .populate('contactInfo.user', 'username phoneNumber email')
      .sort({
        isVip: -1,        // VIP posts lên đầu
        priorityLevel: -1, // Priority level cao hơn
        createdAt: -1     // Mới nhất
      })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      posts,
    });
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    let post = await Post.findById(req.params.id)
      .populate('contactInfo.user', 'username phoneNumber email');

    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }

    // ⭐ Tăng view với boost cho tin VIP
    let viewIncrement = 1;
    if (post.isVip) {
      // VIP posts có boost view 3-5x
      viewIncrement = Math.floor(Math.random() * 3) + 3; // Random 3-5
    }

    // Update view count
    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { views: viewIncrement }
    });

    // Update post object để return đúng số view
    post.views += viewIncrement;

    // console.log(`📈 Post view updated: ${post.title}, VIP: ${post.isVip}, View boost: ${viewIncrement}`);

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
        .json({ message: "Status and visibility are required" });
    }

    // ⭐ VIP posts lên đầu
    const posts = await Post.find({
      status,
      visibility,
    })
    .populate('contactInfo.user', 'username phoneNumber email')
    .sort({
      isVip: -1,        // VIP lên đầu
      priorityLevel: -1,
      createdAt: -1
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPostsByStatus:", error);
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
        .json({ message: "Status and visibility are required" });
    }

    // ⭐ VIP posts của user lên đầu
    const posts = await Post.find({
      "contactInfo.user": req.user.id,
      status,
      visibility,
    })
    .populate('contactInfo.user', 'username phoneNumber email')
    .sort({
      isVip: -1,        // VIP posts lên đầu
      createdAt: -1     // Mới nhất
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
      district,
      ward,
      category,
      transactionType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
    } = req.query;

    console.log("🔍 Search params:", req.query);

    const convertToNumber = (value) => {
      if (!value) return null;
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(numericValue) ? null : numericValue;
    };

    const filter = {
      visibility: "visible",
      status: "approved",
    };

    // **Lọc theo địa điểm phân cấp**
    if (province) filter["address.province"] = province;
    if (district) filter["address.district"] = district;
    if (ward) filter["address.ward"] = ward;

    // **Lọc theo category**
    if (category) filter.category = category;

    // **Lọc theo transactionType**
    if (transactionType) filter.transactionType = transactionType;

    // **Lọc theo từ khóa**
    if (keyword) {
      filter.$or = [
        { category: { $regex: keyword, $options: "i" } },
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
        { transactionType: { $regex: keyword, $options: "i" } },
        { "address.exactaddress": { $regex: keyword, $options: "i" } },
        { "address.province": { $regex: keyword, $options: "i" } },
        { "address.district": { $regex: keyword, $options: "i" } },
        { "address.ward": { $regex: keyword, $options: "i" } },
        { projectName: { $regex: keyword, $options: "i" } },
        { "propertyDetails.propertyCategory": { $regex: keyword, $options: "i" } },
        { "propertyDetails.apartmentType": { $regex: keyword, $options: "i" } },
      ];
    }

    // **Lọc theo price**
    if (minPrice || maxPrice) {
      const numericMinPrice = convertToNumber(minPrice);
      const numericMaxPrice = convertToNumber(maxPrice);

      if (numericMinPrice !== null || numericMaxPrice !== null) {
        const priceFilter = {};
        if (numericMinPrice !== null) priceFilter.$gte = numericMinPrice;
        if (numericMaxPrice !== null) priceFilter.$lte = numericMaxPrice;
        filter.price = priceFilter;
      }
    }

    // **Lọc theo area**
    if (minArea || maxArea) {
      const numericMinArea = convertToNumber(minArea);
      const numericMaxArea = convertToNumber(maxArea);

      if (numericMinArea !== null || numericMaxArea !== null) {
        const areaFilter = {};
        if (numericMinArea !== null) areaFilter.$gte = numericMinArea;
        if (numericMaxArea !== null) areaFilter.$lte = numericMaxArea;
        filter.area = areaFilter;
      }
    }

    console.log("🎯 Final filter:", JSON.stringify(filter, null, 2));

    // ⭐ VIP posts luôn lên đầu trong tìm kiếm
    const posts = await Post.find(filter)
      .populate('contactInfo.user', 'username phoneNumber email')
      .sort({
        isVip: -1,           // ⭐ VIP posts lên đầu tuyệt đối
        priorityLevel: -1,   // Priority level
        views: -1,           // Posts có nhiều view hơn
        createdAt: -1        // Mới nhất
      });

    console.log(`✅ Found ${posts.length} posts (VIP first)`);
    
    // ⭐ Log số tin VIP
    const vipCount = posts.filter(post => post.isVip).length;
    console.log(`🌟 VIP posts: ${vipCount}/${posts.length}`);

    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Search error:", error);
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
        .json({ message: "Status and visibility are required" });
    }
    
    const startIndex = (page - 1) * limit;
    const total = await Post.countDocuments({
      "contactInfo.user": req.user.id,
      status,
      visibility,
    });

    // ⭐ VIP posts của user lên đầu
    const posts = await Post.find({
      "contactInfo.user": req.user.id,
      status,
      visibility,
    })
      .populate('contactInfo.user', 'username phoneNumber email')
      .sort({
        isVip: -1,        // VIP lên đầu
        createdAt: -1     // Mới nhất
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
    await checkAlertSubscriptions(post);

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

      const socket = io();
      socket.to(owner._id.toString()).emit('notification', notification);
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

    // 1. Cập nhật bài viết
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: "rejected", visibility: "hidden" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 2. Kiểm tra thông tin người dùng của bài viết
    const userId = post?.contactInfo?.user;
    if (!userId) {
      return res.status(400).json({ message: "Không tìm thấy thông tin người đăng." });
    }

    const owner = await User.findById(userId);
    if (!owner) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Thêm thông báo
    const notification = {
      message: `Bài viết "${post.title}" của bạn đã bị từ chối.`,
      type: "post",
      post_id: postId,
      status: "unread",
      createdAt: new Date(),
    };

    owner.notifications.push(notification);
    await owner.save();

    const socket = io();

    if (socket) {
      socket.to(owner._id.toString()).emit("notification", notification);
    }

    // 5. Trả về phản hồi
    res.status(200).json({
      message: "Post rejected successfully",
      post,
    });

  } catch (error) {
    console.error("Reject Post Error:", error);
    res.status(500).json({
      message: "Error rejecting post",
      error: error.message,
    });
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

// Hàm tính điểm tương đồng giữa 2 bài đăng
function calculateSimilarityScore(postA, postB) {
  let score = 0;

  if (postA.category === postB.category) score += 3;
  if (postA.transactionType === postB.transactionType) score += 2;
  if (postA.address.district === postB.address.district) score += 3;

  const wordsA = (postA.title + " " + postA.content).toLowerCase().split(/\s+/);
  const wordsB = (postB.title + " " + postB.content).toLowerCase().split(/\s+/);
  const commonWords = wordsA.filter(word => wordsB.includes(word));
  const uniqueCommon = [...new Set(commonWords)];
  score += Math.min(uniqueCommon.length, 5);

  if (postA.features && postB.features) {
    const commonFeatures = postA.features.filter(f => postB.features.includes(f));
    score += commonFeatures.length;
  }

  return score;
}

exports.getSuggestedPosts = async (req, res) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;

  try {
    const currentPost = await Post.findById(postId);
    if (!currentPost) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng." });
    }

    // Lấy 15 bài trước
    const previousPosts = await Post.find({
      _id: { $lt: new mongoose.Types.ObjectId(postId) },
      status: "approved",
      visibility: "visible",
    })
      .sort({ _id: -1 })
      .limit(15);

    // Lấy 15 bài sau
    const nextPosts = await Post.find({
      _id: { $gt: new mongoose.Types.ObjectId(postId) },
      status: "approved",
      visibility: "visible",
    })
      .sort({ _id: 1 })
      .limit(15);

    const nearbyPosts = [...previousPosts.reverse(), ...nextPosts];

    // Tính điểm tương đồng với boost cho VIP
    const scoredPosts = nearbyPosts.map(post => {
      let score = calculateSimilarityScore(currentPost, post);
      
      // ⭐ VIP posts có điểm bonus cao
      if (post.isVip) {
        score += 1000; // Bonus lớn cho VIP posts
      }
      
      return { post, score };
    });

    // Sắp xếp giảm dần theo điểm (VIP sẽ lên đầu)
    const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score);

    // Tổng số trang
    const totalItems = sortedPosts.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy 5 bài tương ứng trang
    const paginatedPosts = sortedPosts
      .slice((page - 1) * limit, page * limit)
      .map(item => item.post);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalItems,
      posts: paginatedPosts,
    });
  } catch (err) {
    console.error("Lỗi gợi ý bài đăng:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi truy xuất bài đăng gợi ý." });
  }
};

//Đếm số bài đăng 5 tỉnh
exports.countPostsByCity = async (req, res) => {
  try {
    const { transactionType, category } = req.query;

    if (!transactionType || !category) {
      return res.status(400).json({ message: "Thiếu transactionType hoặc category" });
    }

    const cities = [
      "Thành phố Hồ Chí Minh",
      "Thành phố Đà Nẵng",
      "Thành phố Cần Thơ",
      "Tỉnh Bình Dương",
      "Thành phố Hà Nội",
    ];

    const results = {};

    for (const city of cities) {
      const count = await Post.countDocuments({
        "address.province": city,
        transactionType,
        category,
        status: "approved",
        visibility: "visible",
      });

      results[city] = count;
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Lỗi khi đếm bài viết theo thành phố:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

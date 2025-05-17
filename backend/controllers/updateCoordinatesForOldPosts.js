const mongoose = require("mongoose");
const axios = require("axios");
const Post = require("../models/Post"); // đường dẫn model của bạn
const getCoordinates = require("./getCoordinates");

const MONGO_URI = "mongodb+srv://nguyenanhtuyet03nbk:Q2VFgaEmIWTaY7fA@findrentalrooms.wk22n.mongodb.net/?retryWrites=true&w=majority&appName=FindRentalRooms";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateCoordinatesForOldPosts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    const posts = await Post.find({
      $or: [{ latitude: null }, { longitude: null }],
    });

    console.log(`🔍 Tìm thấy ${posts.length} bài đăng thiếu tọa độ`);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const address = post.address;

      if (!address?.exactaddress || !address?.ward || !address?.district || !address?.province) {
        console.warn(`⛔️ Bỏ qua post ${post._id} vì thiếu thông tin địa chỉ`);
        continue;
      }

      const fullAddress = `${address.exactaddress}, ${address.ward}, ${address.district}, ${address.province}`;
      console.log(`[${i + 1}/${posts.length}] 📍 Đang xử lý: ${fullAddress}`);

      const coordinates = await getCoordinates(fullAddress);

      if (coordinates) {
        post.latitude = coordinates.latitude;
        post.longitude = coordinates.longitude;
        await Post.updateOne(
  { _id: post._id },
  {
    $set: {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
  }
);

        console.log(`✅ Đã cập nhật tọa độ cho post ${post._id}`);
      } else {
        console.warn(`⚠️ Không lấy được tọa độ cho post ${post._id}`);
      }

      // Chờ 1.5 giây trước khi gọi tiếp
      await sleep(1500);
    }

    console.log("🎉 Đã hoàn tất cập nhật tọa độ cho các bài viết cũ");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật tọa độ:", err);
    process.exit(1);
  }
}

updateCoordinatesForOldPosts();
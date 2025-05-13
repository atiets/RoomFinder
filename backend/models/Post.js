const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Căn hộ/chung cư",
        "Nhà ở",
        "Đất",
        "Văn phòng, mặt bằng kinh doanh",
        "phòng trọ",
      ],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["Cho thuê", "Cần bán"],
      required: true,
    },
    address: {
      exactaddress: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      ward: {
        type: String,
        required: true,
      },
    },
    projectName: {
      type: String, // Tên dự án đất nền hoặc tòa nhà
    },
    locationDetails: {
      apartmentCode: { type: String }, // Mã căn
      block: { type: String }, // Block, Tháp
      floor: { type: String }, // Tầng số
      subArea: { type: String }, // Tên phân khu/lô
    },
    propertyDetails: {
      propertyCategory: { type: String }, // Loại hình nhà ở, đất, văn phòng
      apartmentType: { type: String }, // Loại hình căn hộ
      bedroomCount: { type: String }, // Số phòng ngủ
      bathroomCount: { type: String }, // Số phòng vệ sinh
      floorCount: { type: Number }, // Tổng số tầng
      balconyDirection: { type: String }, // Hướng ban công
      mainDoorDirection: { type: String }, // Hướng cửa chính
      landDirection: { type: String }, // Hướng đất
    },
    features: {
      type: [String], // Các đặc điểm như "Hẻm xe hơi", "Nhà tóp hậu", v.v.
    },
    legalContract: {
      type: String, // Giấy tờ pháp lý
    },
    furnitureStatus: {
      type: String, // Tình trạng nội thất
    },
    areaUse: {
      type: Number, // Diện tích đất sử dụng
    },
    area: {
      type: Number, // Diện tích đất
    },
    typeArea: {
      type: String,
      enum: ["m²", "hecta"],
      default: "m²",
    },
    dimensions: {
      width: { type: Number }, // Chiều ngang
      length: { type: Number }, // Chiều dài
    },
    price: {
      type: Number, // Giá bán hoặc giá thuê
      required: true,
    },
    deposit: {
      type: Number, // Tiền cọc (nếu có)
    },
    userType: {
      type: String,
      enum: ["Cá nhân", "Mô giới"],
      required: true,
    },
    images: {
      type: [String], // Danh sách URL hình ảnh
    },
    videoUrl: {
      type: String,
    },
    contactInfo: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "update"],
      default: "pending",
    },
    visibility: {
      type: String,
      enum: ["visible", "hidden"],
      default: "hidden",
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    daysRemaining: {
      type: Number,
      default: 0,
    },
    hoursRemaining: {
      type: Number,
      default: 0,
    },
    defaultDaysToShow: {
      type: Number,
      default: 7,
    },
    views: {
      type: Number,
      default: 0,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    report_count: {
      type: Number,
      default: 0,
    },
    is_flagged: {
      type: Boolean,
      default: false,
    },
    is_priority: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);

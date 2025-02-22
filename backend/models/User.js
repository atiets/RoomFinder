const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 20,
    unique: true,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  profile: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    picture: {
      type: String,
    },
    isBlocked: {   
      type: Boolean,
      default: false,
    },  
    bio:{
      type: String,
    },
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    }
  ],
  notifications: [
    {
      message: {
        type: String, // Nội dung thông báo
        required: true,
      },
      type: {
        type: String, // Loại thông báo (ví dụ: 'review', 'message', v.v.)
        required: true,
      },
      post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // Liên kết với bài đăng nếu cần
      },
      review_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review', // Liên kết với đánh giá nếu cần
      },
      status: {
        type: String, 
        enum: ['read', 'unread'], // Trạng thái thông báo
        default: 'unread',
      },
      createdAt: {
        type: Date,
        default: Date.now, // Thời gian tạo thông báo
      },
    }
  ],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
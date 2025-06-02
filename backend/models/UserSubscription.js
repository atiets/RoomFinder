const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  // Theo dõi usage trong tháng hiện tại
  currentUsage: {
    postsCreated: {
      type: Number,
      default: 0
    },
    vipPostsUsed: {
      type: Number,
      default: 0
    },
    phoneViewsUsed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index cho query hiệu quả
userSubscriptionSchema.index({ userId: 1, isActive: 1 });
userSubscriptionSchema.index({ endDate: 1, isActive: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);

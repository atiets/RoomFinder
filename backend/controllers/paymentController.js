const Payment = require("../models/Payment");
const User = require("../models/User");
const crypto = require("crypto");
const axios = require("axios");
const qs = require("qs");
const moment = require("moment");
const Subscription = require("../models/Subscription");
const UserSubscription = require("../models/UserSubscription");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

// MoMo Payment Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  returnUrl: "http://localhost:8000/v1/payments/momo/callback",
  ipnUrl: "http://localhost:8000/v1/payments/momo/ipn",
  requestType: "captureWallet",
};

// VNPay Payment Configuration
const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
  vnp_Url:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl:
    process.env.VNPAY_RETURN_URL || `${process.env.CLIENT_URL}/payment-success`,
  vnp_Api:
    process.env.VNPAY_API_URL ||
    "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
};

// Plan Configuration
const PLANS = {
  BASIC: {
    id: "basic",
    name: "Basic Plan",
    price: 99000, // 99,000 VND
    duration: 30, // 30 days
    features: ["basic_features"],
  },
  PREMIUM: {
    id: "premium",
    name: "Premium Plan",
    price: 299000, // 299,000 VND
    duration: 30, // 30 days
    features: ["premium_features", "advanced_features"],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 999000, // 999,000 VND
    duration: 30, // 30 days
    features: ["enterprise_features", "all_features"],
  },
};

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, subscriptionId } = req.body;

    // Get subscription details
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói đăng ký",
      });
    }

    // Create payment record
    const payment = new Payment({
      userId: userId,
      subscriptionId: subscriptionId,
      amount: subscription.price,
      paymentMethod: paymentMethod,
      description: `Thanh toán gói ${subscription.displayName}`,
      status: "pending",
    });

    await payment.save();

    // Create payment URL based on method
    let paymentUrl = "";

    try {
      switch (paymentMethod) {
        case "momo":
          paymentUrl = await this.createMoMoPayment(payment, subscription);
          break;
        case "vnpay":
          paymentUrl = await this.createVNPayPayment(payment, subscription);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Phương thức thanh toán không được hỗ trợ",
          });
      }

      res.status(200).json({
        success: true,
        data: {
          paymentUrl,
        },
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi tạo thanh toán",
      });
    }
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn thanh toán",
      error: error.message,
    });
  }
};

// Create MoMo payment
exports.createMoMoPayment = async (payment, subscription) => {
  const requestId = MOMO_CONFIG.partnerCode + Date.now();
  const orderInfo = `Thanh toán gói ${subscription.displayName}`;
  const extraData = "";
  const amount = payment.amount.toString();
  const orderId = `MOMO_${uuidv4()}`;

  // Create raw signature string exactly matching MoMo's expected order
  const rawSignature =
    "accessKey=" +
    MOMO_CONFIG.accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    MOMO_CONFIG.ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    MOMO_CONFIG.partnerCode +
    "&redirectUrl=" +
    MOMO_CONFIG.returnUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    MOMO_CONFIG.requestType;

  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);

  // Create signature using HMAC SHA256
  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  // Create request body
  const requestBody = {
    partnerCode: MOMO_CONFIG.partnerCode,
    accessKey: MOMO_CONFIG.accessKey,
    requestId: requestId,
    amount: amount.toString(),
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: MOMO_CONFIG.returnUrl,
    ipnUrl: MOMO_CONFIG.ipnUrl,
    extraData: extraData,
    requestType: MOMO_CONFIG.requestType,
    signature: signature,
    lang: "vi",
  };

  console.log("--------------------REQUEST BODY----------------");
  console.log(JSON.stringify(requestBody, null, 2));

  // Make request to MoMo API using https module
  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);

      let data = "";
      res.setEncoding("utf8");

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", async () => {
        try {
          const response = JSON.parse(data);
          console.log("Response:", response);

          if (!response.payUrl) {
            throw new Error("Failed to create MoMo payment URL");
          }

          // Update payment record
          payment.paymentGatewayId = orderId;
          payment.metadata = {
            requestId,
            orderInfo,
            extraData,
            rawSignature,
            signature,
            requestType: MOMO_CONFIG.requestType,
            momoResponse: response,
          };
          await payment.save();

          resolve(response.payUrl);
        } catch (error) {
          console.error("Error processing MoMo response:", error);
          reject(new Error(error.message || "Failed to create MoMo payment"));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      reject(new Error(error.message || "Failed to create MoMo payment"));
    });

    // Write data to request body
    console.log("Sending request to MoMo...");
    req.write(JSON.stringify(requestBody));
    req.end();
  });
};

// Create VNPay payment
exports.createVNPayPayment = async (payment, subscription) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const ipAddr = "127.0.0.1";

    const vnpAmount = payment.amount * 100;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = VNPAY_CONFIG.vnp_TmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = payment._id.toString();
    vnp_Params["vnp_OrderInfo"] = `Thanh toán gói ${subscription.displayName}`;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = vnpAmount.toString();
    vnp_Params["vnp_ReturnUrl"] = VNPAY_CONFIG.vnp_ReturnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = moment(date)
      .add(15, "minutes")
      .format("YYYYMMDDHHmmss");

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret);
    const signature = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signature;
    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${qs.stringify(vnp_Params, {
      encode: false,
    })}`;

    payment.paymentUrl = paymentUrl;
    payment.metadata = {
      ...vnp_Params,
      signData,
      signature,
      vnpAmount,
    };
    await payment.save();

    return paymentUrl;
  } catch (error) {
    throw new Error("Lỗi khi tạo thanh toán VNPay: " + error.message);
  }
};

// Định nghĩa plan configuration
const PLAN_CONFIGS = {
  pro: {
    name: 'Gói Pro',
    features: {
      posting: {
        monthlyPostLimit: -1, // unlimited
        isUnlimitedPosts: true
      },
      vipFeatures: {
        vipPostsPerMonth: 5,
        isUnlimitedVipPosts: false
      },
      contactFeatures: {
        canViewHiddenPhone: true,
        hiddenPhoneViewsPerMonth: -1 // unlimited
      },
      processingFeatures: {
        approvalTimeHours: 24,
        prioritySupport: true
      },
      premiumFeatures: {
        hasDetailedReports: false,
        hasBrandLogo: false,
        alwaysShowFirst: false
      }
    }
  },
  plus: {
    name: 'Gói Plus',
    features: {
      posting: {
        monthlyPostLimit: -1, // unlimited
        isUnlimitedPosts: true
      },
      vipFeatures: {
        vipPostsPerMonth: -1, // unlimited
        isUnlimitedVipPosts: true
      },
      contactFeatures: {
        canViewHiddenPhone: true,
        hiddenPhoneViewsPerMonth: -1 // unlimited
      },
      processingFeatures: {
        approvalTimeHours: 2,
        prioritySupport: true
      },
      premiumFeatures: {
        hasDetailedReports: true,
        hasBrandLogo: true,
        alwaysShowFirst: true
      }
    }
  }
};

// Update function after successful payment
exports.updateUserPlan = async (payment) => {
  try {
    const subscription = await Subscription.findById(payment.subscriptionId);
    if (!subscription) {
      throw new Error("Invalid subscription");
    }

    const user = await User.findById(payment.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + subscription.duration * 24 * 60 * 60 * 1000);
    
    // Determine plan type based on subscription
    let planType = 'free';
    if (subscription.name === 'pro' || subscription.displayName.includes('Pro')) {
      planType = 'pro';
    } else if (subscription.name === 'plus' || subscription.displayName.includes('Plus')) {
      planType = 'plus';
    }

    const planConfig = PLAN_CONFIGS[planType];
    if (!planConfig) {
      throw new Error("Invalid plan type");
    }

    // Deactivate current subscription
    await UserSubscription.updateMany(
      { userId: payment.userId, isActive: true },
      { isActive: false }
    );

    const userSubscription = new UserSubscription({
      userId: payment.userId,
      userName: user.username,  
      userEmail: user.email,   
      subscriptionId: subscription._id,
      planType: planType,
      planName: planConfig.name,
      startDate: startDate,
      endDate: endDate,
      isActive: true,
      features: planConfig.features,
      currentUsage: {
        periodStartDate: startDate,
        periodEndDate: new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()),
        usage: {
          postsCreated: 0,
          vipPostsUsed: 0,
          hiddenPhoneViews: 0
        },
        lastResetDate: startDate
      },
      paymentInfo: {
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId
      }
    });

    await userSubscription.save();

    // Update user's current plan (simple)
    await User.findByIdAndUpdate(
      payment.userId,
      { 
        currentPlan: planType,
        // Update legacy fields for backward compatibility
        postQuota: planConfig.features.posting.isUnlimitedPosts ? 999999 : 3,
        quotaResetAt: endDate
      }
    );

    // Update payment record
    payment.status = "completed";
    payment.paymentDate = new Date();
    payment.userSubscriptionId = userSubscription._id;
    await payment.save();

    console.log(`✅ User plan updated successfully: ${user.username} (${user.email}) -> ${planType} until ${endDate}`);
    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
};

// Handle MoMo callback
exports.handleMoMoCallback = async (req, res) => {
  try {
    const { orderId, resultCode, message, transId, amount, signature } =
      req.query;
    // Verify signature

    console.log("orderId", orderId);
    console.log("resultCode", resultCode);
    console.log("message", message);
    console.log("transId", transId);
    console.log("amount", amount);
    console.log("signature", signature);

    const payment = await Payment.findOne({ paymentGatewayId: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    console.log("resultCode", resultCode);

    if (resultCode === "0") {
      await this.updateUserPlan(payment);
    } else {
      payment.status = "failed";
      payment.metadata = { ...payment.metadata, ...req.body };
      await payment.save();
    }
    // For callback requests
    const redirectUrl =
      resultCode === "0"
        ? `${process.env.CLIENT_URL}/payment-success`
        : `${process.env.CLIENT_URL}/payment-failed`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("MoMo callback error:", error);

    if (req.method === "POST") {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.redirect(`${process.env.CLIENT_URL}/payment/error`);
  }
};

// Handle VNPay callback
exports.handleVNPayCallback = async (req, res) => {
  try {
    const vnpParams = req.query;
    const {
      vnp_TxnRef,
      vnp_ResponseCode,
      vnp_TransactionNo,
      vnp_Amount,
      vnp_SecureHash,
      vnp_OrderInfo,
      vnp_BankCode,
      vnp_PayDate,
      vnp_TransactionStatus,
    } = vnpParams;

    const payment = await Payment.findById(vnp_TxnRef);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify signature
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify.vnp_SecureHash;
    delete paramsToVerify.vnp_SecureHashType;

    const sortedParams = sortObject(paramsToVerify);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.vnp_HashSecret);
    const signature = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (signature !== vnp_SecureHash) {
      console.error("Invalid VNPay signature");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Verify amount
    const expectedAmount = payment.amount * 100;
    if (parseInt(vnp_Amount) !== expectedAmount) {
      console.error("Invalid payment amount");
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // Update payment status
    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      await this.updateUserPlan(payment);
    } else {
      payment.status = "failed";
      payment.metadata = {
        ...payment.metadata,
        vnpResponse: vnpParams,
        verifiedAt: new Date(),
        bankCode: vnp_BankCode,
        transactionStatus: vnp_TransactionStatus,
      };
      await payment.save();
    }

    // For IPN requests
    if (req.method === "POST") {
      return res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: {
          status: payment.status,
          orderId: vnp_TxnRef,
          transactionId: vnp_TransactionNo,
        },
      });
    }

    // For callback requests
    const redirectUrl =
      payment.status === "completed"
        ? `${process.env.CLIENT_URL}/payment-success`
        : `${process.env.CLIENT_URL}/payment-failed`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("VNPay callback error:", error);

    if (req.method === "POST") {
      return res.status(500).json({
        success: false,
        message: "Error processing payment",
        error: error.message,
      });
    }

    res.redirect(`${process.env.CLIENT_URL}/payment/error`);
  }
};

// Helper function to sort object for VNPay
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        payments,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử thanh toán",
      error: error.message,
    });
  }
};

// Get monthly payment total
exports.getMonthlyPaymentTotal = async (year, status) => {
  try {
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year + 1, 0, 1); // January 1st of next year

    const matchQuery = {
      createdAt: { $gte: startDate, $lt: endDate },
    };

    if (status) {
      matchQuery.status = status;
    }

    const monthlyStats = await Payment.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format the results to include all months
    const formattedStats = Array(12)
      .fill(null)
      .map((_, index) => {
        const monthData = monthlyStats.find((stat) => stat._id === index + 1);
        return {
          month: index + 1,
          total: monthData ? monthData.total : 0,
          count: monthData ? monthData.count : 0,
        };
      });

    return formattedStats;
  } catch (error) {
    console.error("Error getting monthly payment total:", error);
    throw error;
  }
};

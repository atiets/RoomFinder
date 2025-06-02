const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const UserSubscription = require('../models/UserSubscription');
const crypto = require('crypto');
const axios = require('axios');

// Tạo đơn thanh toán
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId, paymentMethod } = req.body;

    // Kiểm tra gói đăng ký
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'Gói đăng ký không tồn tại'
      });
    }

    // Tạo payment record
    const payment = new Payment({
      userId: userId,
      subscriptionId: subscriptionId,
      amount: subscription.price,
      paymentMethod: paymentMethod,
      description: `Thanh toán gói ${subscription.displayName}`,
      status: 'pending'
    });

    await payment.save();

    // Tạo payment URL dựa vào method
    let paymentUrl = '';
    
    switch (paymentMethod) {
      case 'momo':
        paymentUrl = await this.createMoMoPayment(payment, subscription);
        break;
      case 'vnpay':
        paymentUrl = await this.createVNPayPayment(payment, subscription);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Phương thức thanh toán không được hỗ trợ'
        });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        paymentUrl: paymentUrl,
        amount: payment.amount,
        subscription: subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn thanh toán',
      error: error.message
    });
  }
};

// Tạo MoMo payment
exports.createMoMoPayment = async (payment, subscription) => {
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const orderInfo = `Thanh toán gói ${subscription.displayName}`;
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const redirectUrl = `${process.env.CLIENT_URL}/payment/success`;
  const ipnUrl = `${process.env.SERVER_URL}/v1/webhook/momo`;
  const requestType = "payWithMethod";
  const amount = payment.amount.toString();
  const orderId = payment._id.toString();
  const requestId = orderId;
  const extraData = "";
  const orderGroupId = "";
  const autoCapture = true;
  const lang = "vi";

  // Tạo signature
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature
  };

  try {
    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody
    );

    // Lưu payment gateway ID
    payment.paymentGatewayId = response.data.orderId;
    payment.metadata = response.data;
    await payment.save();

    return response.data.payUrl;
  } catch (error) {
    throw new Error('Lỗi khi tạo thanh toán MoMo: ' + error.message);
  }
};

// Xử lý callback từ MoMo
exports.handleMoMoCallback = async (req, res) => {
  try {
    const {
      orderId,
      resultCode,
      message,
      transId,
      amount,
      signature
    } = req.body;

    // Verify signature
    const secretKey = process.env.MOMO_SECRET_KEY;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&message=${message}&orderId=${orderId}&orderInfo=${req.body.orderInfo}&orderType=${req.body.orderType}&partnerCode=${process.env.MOMO_PARTNER_CODE}&payType=${req.body.payType}&requestId=${req.body.requestId}&responseTime=${req.body.responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Tìm payment
    const payment = await Payment.findById(orderId);
    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Cập nhật trạng thái payment
    if (resultCode === 0) {
      payment.status = 'completed';
      payment.paymentDate = new Date();
      payment.transactionId = transId;
      payment.metadata = { ...payment.metadata, ...req.body };
      
      await payment.save();
      
      // Kích hoạt subscription
      await this.activateSubscription(payment);
    } else {
      payment.status = 'failed';
      payment.metadata = { ...payment.metadata, ...req.body };
      await payment.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('MoMo callback error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Kích hoạt subscription sau khi thanh toán thành công
exports.activateSubscription = async (payment) => {
  try {
    // Vô hiệu hóa subscription cũ
    await UserSubscription.updateMany(
      { userId: payment.userId, isActive: true },
      { isActive: false }
    );

    // Tạo subscription mới
    const subscription = await Subscription.findById(payment.subscriptionId);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + subscription.duration * 24 * 60 * 60 * 1000);

    const userSubscription = new UserSubscription({
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      startDate: startDate,
      endDate: endDate,
      isActive: true
    });

    await userSubscription.save();
    
    // Cập nhật payment với userSubscriptionId
    payment.userSubscriptionId = userSubscription._id;
    await payment.save();

    return userSubscription;
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error;
  }
};

// Lấy lịch sử thanh toán
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ userId })
      .populate('subscriptionId', 'name displayName price')
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
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử thanh toán',
      error: error.message
    });
  }
};

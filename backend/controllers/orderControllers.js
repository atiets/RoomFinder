
const Order = require('../models/Order');

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    try {
      const { orderCode, amount } = req.body;
      const order = await Order.create({ orderCode, amount });
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ error: "Tạo đơn hàng thất bại" });
    }
  };

//nhận thông báo từ sepay: webhook
exports.sepayWebhook = async (req, res) => {
    const { description, amount, status } = req.body;
  
    // Lấy orderCode từ description hoặc custom field Sepay gửi về
    const orderCode = description;
  
    if (status === "thanh_cong") {
      const order = await Order.findOne({ orderCode });
      if (!order) return res.status(404).send("Order not found");
  
      order.status = "PAID";
      await order.save();
      return res.status(200).send("OK");
    }
  
    res.status(400).send("Invalid status");
  };
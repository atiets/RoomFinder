import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import qr_momo from "../../../assets/images/qr_momo.jpg";
import qr_bidv from "../../../assets/images/qr_bidv.jpg";
import "./PaymentPage.css";

const planDetails = {
  "Gói 50K": { price: 50000, description: "Đăng thêm 5 tin trong 30 ngày" },
  "Gói 100K": { price: 100000, description: "Đăng không giới hạn trong 30 ngày" },
};

const PaymentPage = () => {
  const { plan } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [isPending, setIsPending] = useState(false);

  const currentPlan = plan ? planDetails[plan] : undefined;

  useEffect(() => {
    if (!currentPlan) navigate("/");
  }, [currentPlan, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPayment = () => {
    // Giả lập gửi thông tin về server, bạn có thể gọi API ở đây
    setIsPending(true);
  };

  return (
    <div className="payment-container">
      <h2>🎉 Thanh toán gói dịch vụ</h2>

      <div className="plan-info">
        <h3>{plan}</h3>
        <p><strong>Giá:</strong> {currentPlan.price.toLocaleString()}đ</p>
        <p>{currentPlan.description}</p>
      </div>

      {!isPending ? (
        <>
          <div className="payment-form">
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email (nếu có)"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="payment-methods">
            <h4>💳 Chọn phương thức thanh toán:</h4>

            <div className="method-card">
              <h5>Momo</h5>
              <img src={qr_momo} alt="QR Momo" className="qr-image" />
              <p>Chủ TK: NGUYEN ANH TUYET</p>
              <p>SĐT: 0857735832</p>
              <p><strong>Nội dung CK:</strong> {plan} - {formData.phone || "SĐT của bạn"}</p>
              <button onClick={() => { setSelectedMethod("momo"); handleConfirmPayment(); }}>
                Tôi đã chuyển khoản Momo
              </button>
            </div>

            <div className="method-card">
              <h5>BIDV</h5>
              <img src={qr_bidv} alt="QR BIDV" className="qr-image" />
              <p>Chủ TK: NGUYEN ANH TUIYET</p>
              <p>STK: 5622255130 - BIDV CN Quang Nam</p>
              <p><strong>Nội dung CK:</strong> {plan} - {formData.phone || "SĐT của bạn"}</p>
              <button onClick={() => { setSelectedMethod("bidv"); handleConfirmPayment(); }}>
                Tôi đã chuyển khoản BIDV
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="pending-section">
          <div className="loader"></div>
          <h3>🕐 Đang chờ xác nhận thanh toán...</h3>
          <p>Chúng tôi sẽ kiểm tra giao dịch của bạn và kích hoạt gói trong vài phút.</p>
          <p>Nếu có vấn đề, vui lòng liên hệ <strong>0123 456 789</strong> (Zalo)</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
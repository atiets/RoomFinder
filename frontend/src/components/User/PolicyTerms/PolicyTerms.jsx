import React, { useEffect, useState } from "react";
import "./PolicyTerms.css";
import termsImage from "../../../assets/images/terms.jpg";
import privacyImage from "../../../assets/images/privacy.png";
import serviceImage from "../../../assets/images/service.png";

const PolicyTerms = () => {
  document.title = "Điều khoản và Chính sách";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="policy-container">
      {/* TIÊU ĐỀ */}
      <h1 className="section-title">ĐIỀU KHOẢN VÀ CHÍNH SÁCH</h1>

      {/* ĐIỀU KHOẢN SỬ DỤNG */}
      <div className="policy-section">
        <div className="policy-text">
          <h2>Điều khoản sử dụng</h2>
          <p>
            Khi truy cập <span>Phòng Trọ Xinh</span>, bạn sẽ được trải nghiệm
            nền tảng tìm kiếm phòng trọ nhanh chóng, tiện lợi và chính xác.
            Chúng tôi đặt sự minh bạch và trải nghiệm người dùng lên hàng đầu.
          </p>
          <p>
            Người dùng vui lòng cung cấp thông tin chính xác và trung thực trong
            quá trình đăng ký tài khoản, đăng tin và giao dịch. Việc vi phạm
            điều khoản có thể dẫn đến khóa tài khoản hoặc xử lý theo quy định
            pháp luật.
          </p>
        </div>
        <div className="policy-image-container">
          <img
            src={termsImage}
            alt="Điều khoản sử dụng"
            className="policy-image"
          />
        </div>
      </div>

      {/* CHÍNH SÁCH BẢO MẬT */}
      <div className="policy-section">
        <div className="policy-image-container">
          <img
            src={privacyImage}
            alt="Chính sách bảo mật"
            className="policy-image"
          />
        </div>
        <div className="policy-text">
          <h2>Chính sách bảo mật</h2>
          <p>
            <span>Phòng Trọ Xinh</span> cam kết bảo mật mọi thông tin cá nhân
            của khách hàng. Chúng tôi chỉ sử dụng dữ liệu cho mục đích cung cấp
            dịch vụ tìm kiếm phòng trọ tốt nhất và cải thiện trải nghiệm người
            dùng.
          </p>
          <p>
            Thông tin như tên, email, số điện thoại sẽ không được chia sẻ cho
            bên thứ ba nếu không có sự đồng ý từ khách hàng, trừ trường hợp có
            yêu cầu từ cơ quan chức năng.
          </p>
        </div>
      </div>

      {/* CAM KẾT DỊCH VỤ */}
      <div className="policy-section">
        <div className="policy-text">
          <h2>Cam kết dịch vụ</h2>
          <p>
            Chúng tôi luôn nỗ lực mang lại trải nghiệm tìm kiếm phòng trọ hiệu
            quả, minh bạch và công bằng nhất. Mọi thông tin phòng trọ được kiểm
            duyệt chặt chẽ trước khi hiển thị trên hệ thống.
          </p>
          <p>
            Chúng tôi cam kết hỗ trợ người thuê và chủ trọ trong việc giải quyết
            các khiếu nại, đảm bảo quyền lợi tốt nhất cho tất cả các bên tham
            gia.
          </p>
        </div>
        <div className="policy-image-container">
          <img
            src={serviceImage}
            alt="Cam kết dịch vụ"
            className="policy-image"
          />
        </div>
      </div>

      {/* THANK YOU */}
      <div className="thank-you">
        <h2>Cảm ơn bạn đã tin tưởng và đồng hành cùng Phòng Trọ Xinh!</h2>
        <p>Chúc bạn tìm được phòng trọ ưng ý và thuận tiện nhất!</p>
      </div>
    </div>
  );
};

export default PolicyTerms;

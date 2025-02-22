import React, { useEffect, useState } from "react";
import brandStory from "../../../assets/images/brandStory.jpg";
import productImage2 from "../../../assets/images/house.png";
import productImage3 from "../../../assets/images/imgInImgage.png";
import productImage1 from "../../../assets/images/introPic2.png";
import aboutUsImage from "../../../assets/images/luckycat.png";
import teamImage from "../../../assets/images/teamImage.jpg";
import "./AboutUs.css";

const AboutUs = () => {
  document.title = "Về chúng tôi";
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
    <div className="aboutus-container">
      {/* VỀ CHÚNG TÔI */}
      <h1 className="section-title">VỀ CHÚNG TÔI</h1>
      <div className="aboutus-content">
        <div className="aboutus-text">
          <h2>Về chúng tôi</h2>
          <p>
            <span>Phòng Trọ Xinh</span> là nền tảng công nghệ tiên phong trong
            lĩnh vực tìm kiếm và cho thuê phòng trọ tại Việt Nam. Chúng tôi kết
            nối hàng triệu người thuê trọ, chủ nhà và nhà môi giới một cách
            nhanh chóng và minh bạch, biến việc tìm kiếm một không gian sống lý
            tưởng trở nên đơn giản, thuận tiện và đáng tin cậy.
          </p>
          <p>
            Ra đời vào năm 2024, Phòng Trọ Xinh cam kết mang đến giải pháp công
            nghệ vượt trội, giúp mọi người tìm phòng trọ dễ dàng hơn bao giờ
            hết, đồng thời tạo ra hệ sinh thái bất động sản thân thiện với mọi
            đối tượng người dùng.
          </p>
        </div>
        <div className="aboutus-image-container">
          <img
            src={aboutUsImage}
            alt="Về chúng tôi"
            className="aboutus-image"
          />
        </div>
      </div>

      {/* TẦM NHÌN VÀ SỨ MỆNH */}
      <h1 className="section-title">TẦM NHÌN VÀ SỨ MỆNH</h1>
      <div className="aboutus-content">
        <div className="aboutus-text">
          <p>
            <strong>Tầm nhìn:</strong> Trở thành nền tảng tìm kiếm phòng trọ số
            1 tại Việt Nam, nơi mỗi người đều có thể tìm thấy một không gian
            sống phù hợp với nhu cầu và khả năng tài chính.
          </p>
          <p>
            <strong>Sứ mệnh:</strong> Chúng tôi không ngừng đổi mới để mang đến
            công nghệ hiện đại, dữ liệu chính xác và dịch vụ tận tâm giúp người
            thuê và chủ nhà kết nối dễ dàng, thuận tiện.
          </p>
        </div>
      </div>

      {/* CÂU CHUYỆN THƯƠNG HIỆU */}
      <div className="aboutus-content">
        <div className="aboutus-image-container">
          <img
            src={brandStory}
            alt="Câu chuyện thương hiệu"
            className="aboutus-image"
          />
        </div>
        <div className="aboutus-text">
          <h2>Câu chuyện thương hiệu</h2>
          <p>
            Khởi nguồn từ khát vọng đơn giản hóa việc tìm phòng trọ,{" "}
            <span>Phòng Trọ Xinh</span> ra đời như một cánh tay đắc lực, đồng
            hành cùng bạn trên hành trình tìm kiếm chốn an cư lý tưởng.
          </p>
          <p>
            Năm 2024 đánh dấu bước phát triển lớn khi chúng tôi kết hợp công
            nghệ AI thông minh, tối ưu hóa trải nghiệm tìm phòng trọ, giúp người
            dùng tiết kiệm thời gian và công sức.
          </p>
        </div>
      </div>

      {/* ĐỘI NGŨ NHÂN SỰ */}
      <div className="aboutus-content">
        <div className="aboutus-text">
          <h2>Đội ngũ nhân sự</h2>
          <p>
            Tại <span>Phòng Trọ Xinh</span>, đội ngũ chuyên gia trẻ trung, nhiệt
            huyết và giàu kinh nghiệm trong lĩnh vực công nghệ và bất động sản
            luôn không ngừng sáng tạo.
          </p>
          <p>
            Chúng tôi đặt trải nghiệm người dùng làm ưu tiên hàng đầu, cam kết
            cung cấp dịch vụ tốt nhất với tinh thần tận tâm và sự chuyên nghiệp
            vượt trội.
          </p>
        </div>
        <div className="aboutus-image-container">
          <img
            src={teamImage}
            alt="Đội ngũ nhân sự"
            className="aboutus-image"
          />
        </div>
      </div>

      {/* HỆ SINH THÁI SẢN PHẨM */}
        <h1 className="section-title">HỆ SINH THÁI SẢN PHẨM</h1>
        <div className="aboutus-content">
          <div className="aboutus-text">
            <p>
          Phòng Trọ Xinh mang đến một hệ sinh thái toàn diện và độc đáo, bao gồm:
            </p>
            <ul className="product-features">
          <li>
            • <strong><b>Công cụ tìm kiếm phòng trọ thông minh:</b></strong> Lọc phòng theo tiêu chí rõ ràng như vị trí, giá cả, diện tích và tiện nghi.
          </li>
          <li>
            • <strong><b>Đăng tin dễ dàng:</b></strong> Hỗ trợ chủ nhà đăng tin miễn phí với các công cụ tối ưu để tiếp cận khách hàng nhanh chóng.
          </li>
          <li>
            • <strong><b>Dữ liệu thị trường cập nhật:</b></strong> Cung cấp thông tin chính xác về thị trường thuê phòng trọ, giúp bạn đưa ra quyết định phù hợp.
          </li>
            </ul>
          </div>
          <div className="product-images">
            <img src={productImage1} alt="Sản phẩm 1" className="product-image" />
            <img src={productImage2} alt="Sản phẩm 2" className="product-image" />
            <img src={productImage3} alt="Sản phẩm 3" className="product-image" />
          </div>
        </div>

        {/* GIẢI PHÁP NGHIÊN CỨU THỊ TRƯỜNG */}
      <div className="aboutus-text">
        <h2>Giải pháp nghiên cứu thị trường</h2>
        <p>
          Với nền tảng dữ liệu mạnh mẽ, <span>Phòng Trọ Xinh</span> giúp bạn nắm
          bắt thông tin thị trường thuê phòng một cách nhanh chóng và đầy đủ.
          Chúng tôi cung cấp các báo cáo chuyên sâu về xu hướng, giá cả và nhu
          cầu, hỗ trợ khách hàng có cái nhìn toàn diện và ra quyết định thông
          minh hơn.
        </p>
      </div>

      {/* CAM KẾT */}
      <div className="aboutus-text">
        <h2>Cam kết của chúng tôi</h2>
        <ul>
          <li>✅ Tiện lợi: Tìm phòng trọ phù hợp chỉ trong vài cú click.</li>
          <li>✅ Minh bạch: Thông tin rõ ràng, chính xác, đáng tin cậy.</li>
          <li>✅ Tận tâm: Đội ngũ hỗ trợ sẵn sàng đồng hành cùng bạn 24/7.</li>
        </ul>
      </div>

      {/* THANK YOU */}
      <div className="thank-you">
        <h2>Cảm ơn bạn đã đồng hành cùng Phòng Trọ Xinh!</h2>
        <p>
          Với Phòng Trọ Xinh, việc tìm kiếm phòng trọ chưa bao giờ dễ dàng và
          nhanh chóng đến thế!
        </p>
      </div>
    </div>
  );
};

export default AboutUs;

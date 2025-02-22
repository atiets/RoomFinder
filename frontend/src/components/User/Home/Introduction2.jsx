import { Typography } from "@mui/material";
import React from "react";
import introPic2 from "../../../assets/images/introPic2.png";
import quality from "../../../assets/images/quality.png";
import security2 from "../../../assets/images/security2.png";
import "./Introduction2.css";

const Introduction2 = () => {
  return (
    <div className="intro-container">
      <div className="intro-right">
        <img src={introPic2} alt="Tìm trọ" className="intro-image" />
        <div className="introduction-intro-right-text">
          <div className="introduction-border">
            <h3 className="intro-text-in-img">Trải Nghiệm Tuyệt Vời</h3>
            <p className="intro-text-in-img-content">
              Lựa Chọn Thông Minh Cho Cuộc Sống Tốt Hơn
            </p>
          </div>
        </div>
      </div>
      <div className="intro-left">
        <Typography className="intro-left-title">
          Khám Phá Những Lựa Chọn Trọ Tuyệt Vời
        </Typography>
        <div className="feature-item">
          <img src={security2} alt="An toàn" className="feature-icon" />
          <div className="feature-text">
            <h3 className="intro-left-title1">An Toàn Là Chìa Khóa</h3>
            <p className="intro-left-content">
              Với hệ thống bảo mật hiện đại và các phòng trọ được kiểm tra kỹ
              lưỡng, sự an toàn của bạn là ưu tiên hàng đầu của chúng tôi.
            </p>
          </div>
        </div>
        <div className="feature-item">
          <img
            src={quality}
            alt="Đảm bảo chất lượng"
            className="feature-icon"
          />
          <div className="feature-text">
            <h3 className="intro-left-title1">Đảm Bảo Chất Lượng</h3>
            <p className="intro-left-content">
              Chúng tôi mang đến những căn phòng với mức giá phải chăng, nhưng
              vẫn đảm bảo sự thoải mái và tiện nghi cho bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction2;

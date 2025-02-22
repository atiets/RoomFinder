import { Typography } from "@mui/material";
import React from "react";
import contactIcon from "../../../assets/images/contactIcon.png";
import imgHouse from "../../../assets/images/house.png";
import costIcon from "../../../assets/images/iconCost.png";
import imgInImage from "../../../assets/images/imgInImgage.png";
import securityIcon from "../../../assets/images/Security.png";
import "./Introduction.css";

const Introduction = () => {
  return (
    <div className="intro-container">
      <div className="intro-left">
        <Typography className="intro-left-title">
          Tìm Trọ Đơn Giản và Tiện Lợi
        </Typography>
        <div className="feature-item">
          <img src={securityIcon} alt="An toàn" className="feature-icon" />
          <div className="feature-text">
            <h3 className="intro-left-title1">An toàn và Uy tín</h3>
            <p className="intro-left-content">
              Chúng tôi cam kết cung cấp thông tin phòng trọ chính xác và đáng
              tin cậy từ các chủ nhà có uy tín.
            </p>
          </div>
        </div>
        <div className="feature-item">
          <img src={costIcon} alt="Giá cả hợp lý" className="feature-icon" />
          <div className="feature-text">
            <h3 className="intro-left-title1">Giá Cả Hợp Lý</h3>
            <p className="intro-left-content">
              Chúng tôi luôn tìm kiếm các phòng trọ với mức giá phù hợp với nhu
              cầu của bạn, đảm bảo tính cạnh tranh và hợp lý.
            </p>
          </div>
        </div>
        <div className="feature-item">
          <img
            src={contactIcon}
            alt="Dễ dàng liên hệ"
            className="feature-icon"
          />
          <div className="feature-text">
            <h3 className="intro-left-title1">Dễ Dàng Liên Hệ</h3>
            <p className="intro-left-content">
              Liên hệ trực tiếp với chủ nhà thông qua nền tảng của chúng tôi để
              đàm phán và thỏa thuận nhanh chóng.
            </p>
          </div>
        </div>
      </div>
      <div className="intro-right">
        <img src={imgHouse} alt="Tìm trọ" className="intro-image" />
        <div className="introduction-intro-right-img">
          <img src={imgInImage} alt="Tìm trọ" className="img-intr-in-img" />
        </div>
        <div className="introduction-intro-right-text">
          <div className="introduction-border">
            <h3 className="intro-text-in-img">Tiện lợi</h3>
            <p className="intro-text-in-img-content">Đáng tin cậy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;

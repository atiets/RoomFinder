import { Typography, Box, Container, Fade, Zoom } from "@mui/material";
import React, { useEffect, useState } from "react";
import contactIcon from "../../../assets/images/contactIcon.png";
import imgHouse from "../../../assets/images/house.png";
import costIcon from "../../../assets/images/iconCost.png";
import imgInImage from "../../../assets/images/imgInImgage.png";
import securityIcon from "../../../assets/images/Security.png";
import "./Introduction.css";

const Introduction = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  const features = [
    {
      id: 1,
      icon: securityIcon,
      title: "An toàn và Uy tín",
      content: "Chúng tôi cam kết cung cấp thông tin phòng trọ chính xác và đáng tin cậy từ các chủ nhà có uy tín.",
      delay: 200
    },
    {
      id: 2,
      icon: costIcon,
      title: "Giá Cả Hợp Lý",
      content: "Chúng tôi luôn tìm kiếm các phòng trọ với mức giá phù hợp với nhu cầu của bạn, đảm bảo tính cạnh tranh và hợp lý.",
      delay: 400
    },
    {
      id: 3,
      icon: contactIcon,
      title: "Dễ Dàng Liên Hệ",
      content: "Liên hệ trực tiếp với chủ nhà thông qua nền tảng của chúng tôi để đàm phán và thỏa thuận nhanh chóng.",
      delay: 600
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 8, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 4, md: 8 },
          flexDirection: { xs: "column", md: "row" },
          minHeight: "600px",
        }}
      >
        {/* Left Section */}
        <Fade in={visible} timeout={1000}>
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "50%" },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#2E7D32",
                mb: 6,
                fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
                lineHeight: 1.2,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-12px",
                  left: 0,
                  width: "80px",
                  height: "4px",
                  backgroundColor: "#FFD1A9",
                  borderRadius: "2px",
                },
              }}
            >
              Tìm Trọ Đơn Giản và Tiện Lợi
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {features.map((feature) => (
                <Fade
                  key={feature.id}
                  in={visible}
                  timeout={1000}
                  style={{ transitionDelay: `${feature.delay}ms` }}
                >
                  <Box
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 3,
                      p: 3,
                      borderRadius: "16px",
                      backgroundColor: hoveredFeature === feature.id ? "#E8F5E8" : "transparent",
                      border: "2px solid transparent",
                      borderColor: hoveredFeature === feature.id ? "#A8E6CF" : "transparent",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: hoveredFeature === feature.id ? "translateY(-4px)" : "translateY(0)",
                      boxShadow: hoveredFeature === feature.id 
                        ? "0 8px 32px rgba(46, 125, 50, 0.15)" 
                        : "0 2px 8px rgba(0, 0, 0, 0.05)",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "20px",
                        backgroundColor: "#FFF2E8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.3s ease",
                        transform: hoveredFeature === feature.id ? "scale(1.1) rotate(5deg)" : "scale(1)",
                        boxShadow: hoveredFeature === feature.id 
                          ? "0 8px 24px rgba(255, 193, 169, 0.3)" 
                          : "0 4px 12px rgba(255, 193, 169, 0.2)",
                      }}
                    >
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: "#2E7D32",
                          mb: 1.5,
                          fontSize: { xs: "1.25rem", md: "1.5rem" },
                          transition: "color 0.3s ease",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#555",
                          lineHeight: 1.6,
                          fontSize: { xs: "0.95rem", md: "1rem" },
                        }}
                      >
                        {feature.content}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Right Section */}
        <Zoom in={visible} timeout={1200}>
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "50%" },
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: "500px",
                "&:hover .main-image": {
                  transform: "scale(1.05) rotate(2deg)",
                },
                "&:hover .floating-card": {
                  transform: "translateY(-10px) scale(1.05)",
                },
                "&:hover .overlay-image": {
                  transform: "scale(1.1) rotate(-5deg)",
                },
              }}
            >
              {/* Main House Image */}
              <Box
                className="main-image"
                sx={{
                  width: "100%",
                  height: "400px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 16px 64px rgba(46, 125, 50, 0.2)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg, rgba(168, 230, 207, 0.1) 0%, rgba(255, 209, 169, 0.1) 100%)",
                    zIndex: 1,
                  },
                }}
              >
                <img
                  src={imgHouse}
                  alt="Tìm trọ"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              {/* Floating Overlay Image */}
              <Box
                className="overlay-image"
                sx={{
                  position: "absolute",
                  top: "20px",
                  right: "-20px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(255, 193, 169, 0.4)",
                  border: "4px solid #fff",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 3,
                }}
              >
                <img
                  src={imgInImage}
                  alt="Tìm trọ"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              {/* Floating Info Card */}
              <Box
                className="floating-card"
                sx={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  backgroundColor: "#fff",
                  borderRadius: "20px",
                  p: 3,
                  boxShadow: "0 16px 48px rgba(46, 125, 50, 0.15)",
                  border: "2px solid #E8F5E8",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 3,
                  minWidth: "200px",
                }}
              >
                <Box
                  sx={{
                    width: "60px",
                    height: "4px",
                    backgroundColor: "#A8E6CF",
                    borderRadius: "2px",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#2E7D32",
                    mb: 1,
                    fontSize: "1.25rem",
                  }}
                >
                  Tiện lợi
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#FF8A65",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                >
                  Đáng tin cậy
                </Typography>
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: "-10px",
                  left: "-10px",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#FFE4D1",
                  borderRadius: "50%",
                  zIndex: 2,
                  animation: "float 3s ease-in-out infinite",
                  "@keyframes float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                  },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: "50px",
                  right: "-15px",
                  width: "30px",
                  height: "30px",
                  backgroundColor: "#C8E6C9",
                  borderRadius: "50%",
                  zIndex: 2,
                  animation: "float 3s ease-in-out infinite 1s",
                }}
              />
            </Box>
          </Box>
        </Zoom>
      </Box>
    </Container>
  );
};

export default Introduction;

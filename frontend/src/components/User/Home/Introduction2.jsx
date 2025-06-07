import { Typography, Box, Container, Fade, Slide } from "@mui/material";
import React, { useEffect, useState } from "react";
import introPic2 from "../../../assets/images/introPic2.png";
import quality from "../../../assets/images/quality.png";
import security2 from "../../../assets/images/security2.png";
import "./Introduction.css";

const Introduction2 = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  const features = [
    {
      id: 1,
      icon: security2,
      title: "An Toàn Là Chìa Khóa",
      content: "Với hệ thống bảo mật hiện đại và các phòng trọ được kiểm tra kỹ lưỡng, sự an toàn của bạn là ưu tiên hàng đầu của chúng tôi.",
      delay: 200
    },
    {
      id: 2,
      icon: quality,
      title: "Đảm Bảo Chất Lượng",
      content: "Chúng tôi mang đến những căn phòng với mức giá phải chăng, nhưng vẫn đảm bảo sự thoải mái và tiện nghi cho bạn.",
      delay: 400
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 8, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 4, md: 8 },
          flexDirection: { xs: "column-reverse", md: "row" },
          minHeight: "600px",
        }}
      >
        {/* Left Section - Image */}
        <Slide direction="right" in={visible} timeout={1200}>
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
                  transform: "scale(1.05) rotate(-2deg)",
                },
                "&:hover .floating-card": {
                  transform: "translateY(-15px) scale(1.1)",
                },
              }}
            >
              {/* Main Image */}
              <Box
                className="main-image"
                sx={{
                  width: "100%",
                  height: "450px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 20px 80px rgba(255, 138, 101, 0.25)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg, rgba(255, 209, 169, 0.15) 0%, rgba(168, 230, 207, 0.15) 100%)",
                    zIndex: 1,
                  },
                }}
              >
                <img
                  src={introPic2}
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
                  bottom: "-40px",
                  right: "-40px",
                  backgroundColor: "#fff",
                  borderRadius: "24px",
                  p: 4,
                  boxShadow: "0 20px 60px rgba(255, 138, 101, 0.2)",
                  border: "3px solid #FFE4D1",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: 3,
                  minWidth: "250px",
                  background: "linear-gradient(135deg, #fff 0%, #FFF2E8 100%)",
                }}
              >
                <Box
                  sx={{
                    width: "80px",
                    height: "5px",
                    backgroundColor: "#FF8A65",
                    borderRadius: "3px",
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#FF6F00",
                    mb: 1.5,
                    fontSize: "1.4rem",
                  }}
                >
                  Trải Nghiệm Tuyệt Vời
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#2E7D32",
                    fontWeight: 500,
                    fontSize: "1rem",
                    lineHeight: 1.4,
                  }}
                >
                  Lựa Chọn Thông Minh Cho Cuộc Sống Tốt Hơn
                </Typography>
              </Box>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: "30px",
                  left: "-20px",
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#C8E6C9",
                  borderRadius: "12px",
                  zIndex: 2,
                  animation: "bounce 2s ease-in-out infinite",
                  "@keyframes bounce": {
                    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                    "50%": { transform: "translateY(-15px) rotate(10deg)" },
                  },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "-15px",
                  right: "80px",
                  width: "35px",
                  height: "35px",
                  backgroundColor: "#FFD1A9",
                  borderRadius: "50%",
                  zIndex: 2,
                  animation: "pulse 2s ease-in-out infinite 0.5s",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.2)" },
                  },
                }}
              />
            </Box>
          </Box>
        </Slide>

        {/* Right Section - Content */}
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
                color: "#FF6F00",
                mb: 6,
                fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
                lineHeight: 1.2,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-12px",
                  left: 0,
                  width: "100px",
                  height: "4px",
                  backgroundColor: "#A8E6CF",
                  borderRadius: "2px",
                },
              }}
            >
              Khám Phá Những Lựa Chọn Trọ Tuyệt Vời
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {features.map((feature) => (
                <Slide
                  key={feature.id}
                  direction="left"
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
                      gap: 4,
                      p: 4,
                      borderRadius: "20px",
                      backgroundColor: hoveredFeature === feature.id ? "#FFF2E8" : "transparent",
                      border: "2px solid transparent",
                      borderColor: hoveredFeature === feature.id ? "#FFD1A9" : "transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: hoveredFeature === feature.id ? "translateX(10px)" : "translateX(0)",
                      boxShadow: hoveredFeature === feature.id 
                        ? "0 12px 40px rgba(255, 111, 0, 0.15)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.05)",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: "24px",
                        backgroundColor: "#E8F5E8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.4s ease",
                        transform: hoveredFeature === feature.id ? "scale(1.15) rotate(-5deg)" : "scale(1)",
                        boxShadow: hoveredFeature === feature.id 
                          ? "0 12px 32px rgba(46, 125, 50, 0.25)" 
                          : "0 6px 16px rgba(46, 125, 50, 0.15)",
                      }}
                    >
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        style={{
                          width: "45px",
                          height: "45px",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: "#FF6F00",
                          mb: 2,
                          fontSize: { xs: "1.3rem", md: "1.6rem" },
                          transition: "color 0.3s ease",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#555",
                          lineHeight: 1.7,
                          fontSize: { xs: "1rem", md: "1.1rem" },
                        }}
                      >
                        {feature.content}
                      </Typography>
                    </Box>
                  </Box>
                </Slide>
              ))}
            </Box>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default Introduction2;
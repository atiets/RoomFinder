import {
  ArrowForward,
  Email,
  Facebook,
  Info,
  Instagram,
  LinkedIn,
  LocationOn,
  NewReleases,
  Phone,
  Policy,
} from "@mui/icons-material";
import FeedbackIcon from '@mui/icons-material/Feedback';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Fade, 
  Zoom,
  IconButton,
  Divider
} from "@mui/material";
import React, { useState, useEffect } from "react";
import Signup from "./Signup.jsx";

const Footer = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/anh.tuyet.679568/", name: "facebook" },
    { icon: Instagram, href: "https://www.instagram.com/_atiet.t_/", name: "instagram" },
    { icon: LinkedIn, href: "https://www.linkedin.com/in/tuyet-nguyen-3ab193320/", name: "linkedin" }
  ];

  const footerLinks = [
    { icon: Info, text: "Về chúng tôi", href: "/about-us" },
    { icon: NewReleases, text: "Tin tức mới", href: "/TinTuc" },
    { icon: Policy, text: "Điều khoản chính sách", href: "/policy-terms" },
    { icon: FeedbackIcon, text: "Khiếu nại", href: "/complaints" }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Signup />
      
      <Box
        sx={{
          backgroundColor: '#e9fae6', // Thay đổi background thành màu yêu cầu
          color: '#2E7D32', // Đổi text color cho phù hợp với background sáng
          position: 'relative',
          overflow: 'hidden',
          // Bỏ shimmer effect
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ py: 6 }}>
            <Grid container spacing={4}>
              {/* Logo & Description */}
              <Grid item xs={12} md={3}>
                <Fade in={visible} timeout={1000}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#2E7D32', // Đổi thành màu xanh đậm
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-8px',
                          left: 0,
                          width: '60px',
                          height: '3px',
                          background: 'linear-gradient(135deg, #FFD1A9 0%, #FF8A65 100%)',
                          borderRadius: '2px',
                        }
                      }}
                    >
                      PHÒNG TRỌ XINH
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4CAF50', // Đổi màu text
                        lineHeight: 1.6,
                        mb: 3,
                        fontSize: '0.95rem',
                      }}
                    >
                      Tìm phòng trọ chưa bao giờ dễ dàng đến thế! Hãy đến với Phòng trọ xinh
                      - vô vàn thông tin hữu ích được mang lại.
                    </Typography>
                    
                    {/* Social Media */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {socialLinks.map((social, index) => (
                        <Zoom in={visible} timeout={1200 + index * 200} key={social.name}>
                          <IconButton
                            component="a"
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHoveredSocial(social.name)}
                            onMouseLeave={() => setHoveredSocial(null)}
                            sx={{
                              color: '#4CAF50',
                              fontSize: '2rem',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: hoveredSocial === social.name ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
                              backgroundColor: hoveredSocial === social.name ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                              boxShadow: hoveredSocial === social.name ? '0 8px 24px rgba(76, 175, 80, 0.3)' : 'none',
                              '&:hover': {
                                color: '#FF6F00',
                              }
                            }}
                          >
                            <social.icon fontSize="large" />
                          </IconButton>
                        </Zoom>
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </Grid>

              {/* Links */}
              <Grid item xs={12} md={2.5}>
                <Fade in={visible} timeout={1400}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 3,
                        color: '#2E7D32',
                        fontSize: '1.2rem',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-8px',
                          left: 0,
                          width: '40px',
                          height: '2px',
                          background: '#FFD1A9',
                          borderRadius: '1px',
                        }
                      }}
                    >
                      Liên kết
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {footerLinks.map((link, index) => (
                        <Box
                          key={index}
                          onClick={() => window.open(link.href)}
                          onMouseEnter={() => setHoveredLink(index)}
                          onMouseLeave={() => setHoveredLink(null)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            transform: hoveredLink === index ? 'translateX(8px)' : 'translateX(0)',
                            backgroundColor: hoveredLink === index ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                            border: hoveredLink === index ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid transparent',
                            '&:hover': {
                              boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)',
                            }
                          }}
                        >
                          <link.icon 
                            sx={{ 
                              color: hoveredLink === index ? '#FF6F00' : '#4CAF50', 
                              mr: 1.5,
                              fontSize: '1.2rem',
                              transition: 'color 0.3s ease'
                            }} 
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: hoveredLink === index ? '#FF6F00' : '#2E7D32',
                              fontWeight: hoveredLink === index ? 600 : 400,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {link.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </Grid>

              {/* Newsletter */}
              <Grid item xs={12} md={3.5}>
                <Fade in={visible} timeout={1600}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 3,
                        color: '#2E7D32',
                        fontSize: '1.2rem',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-8px',
                          left: 0,
                          width: '40px',
                          height: '2px',
                          background: '#FFD1A9',
                          borderRadius: '1px',
                        }
                      }}
                    >
                      Bản tin
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4CAF50',
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                      }}
                    >
                      🏡 Đăng ký ngay để nâng cao trải nghiệm tìm phòng trọ nào 😎
                    </Typography>
                    
                    <Button
                      onClick={() => window.open("/register")}
                      endIcon={<ArrowForward />}
                      sx={{
                        background: 'linear-gradient(135deg, #FFF2E8 0%, #FFE4D1 100%)',
                        color: '#FF6F00',
                        border: '2px solid #FFD1A9',
                        borderRadius: '16px',
                        padding: '12px 24px',
                        fontWeight: 600,
                        textTransform: 'none',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF8A65 0%, #FF6F00 100%)',
                          color: '#fff',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(255, 111, 0, 0.3)',
                        }
                      }}
                    >
                      Đăng ký ngay
                    </Button>

                    {/* Bỏ phần mail icon */}
                  </Box>
                </Fade>
              </Grid>

              {/* Contact */}
              <Grid item xs={12} md={3}>
                <Fade in={visible} timeout={1800}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 3,
                        color: '#2E7D32',
                        fontSize: '1.2rem',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-8px',
                          left: 0,
                          width: '40px',
                          height: '2px',
                          background: '#FFD1A9',
                          borderRadius: '1px',
                        }
                      }}
                    >
                      Liên hệ
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Phone */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          }
                        }}
                      >
                        <Phone sx={{ color: '#4CAF50', mr: 1.5, fontSize: '1.2rem' }} />
                        <Typography
                          component="a"
                          href="tel:+840313728397"
                          variant="body2"
                          sx={{
                            color: '#2E7D32',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            '&:hover': {
                              color: '#FF6F00',
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          (+84) 0313-728-397
                        </Typography>
                      </Box>

                      {/* Email */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          }
                        }}
                      >
                        <Email sx={{ color: '#4CAF50', mr: 1.5, fontSize: '1.2rem' }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#2E7D32',
                            fontSize: '0.95rem',
                            wordBreak: 'break-word'
                          }}
                        >
                          PhongTroXinh@gmail.com
                        </Typography>
                      </Box>

                      {/* Location */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          padding: '8px 0',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          }
                        }}
                      >
                        <LocationOn sx={{ color: '#4CAF50', mr: 1.5, fontSize: '1.2rem', mt: 0.2 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#2E7D32',
                            fontSize: '0.95rem',
                            lineHeight: 1.5
                          }}
                        >
                          01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, Hồ Chí Minh
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              </Grid>
            </Grid>

            {/* Bottom Divider */}
            <Fade in={visible} timeout={2000}>
              <Box sx={{ mt: 6 }}>
                <Divider 
                  sx={{ 
                    borderColor: 'rgba(76, 175, 80, 0.3)',
                    mb: 3
                  }} 
                />
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#4CAF50',
                    fontSize: '0.9rem',
                  }}
                >
                  © 2024 Phòng Trọ Xinh. Tất cả quyền được bảo lưu. 
                  <span style={{ marginLeft: '8px' }}>🏠</span>
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
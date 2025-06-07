import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Fade, 
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Person, 
  Lock, 
  Google, 
  Home,
  Email as EmailIcon
} from '@mui/icons-material';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box className="footer-signup-section">
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                <Fade in={visible} timeout={1000}>
                    <Box className="signup-wrapper">
                        {/* Main Title */}
                        <Typography
                            variant="h4"
                            className="main-title"
                            sx={{
                                fontSize: { xs: '1.5rem', md: '2rem' },
                                fontWeight: 600,
                                color: '#333',
                                textAlign: 'center',
                                mb: 1,
                                lineHeight: 1.3,
                            }}
                        >
                            Đăng bài cho thuê trọ miễn phí!{' '}
                        </Typography>

                        {/* Form Section */}
                        <Box className="form-section">
                            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                {/* Username Input */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Tên đăng nhập"
                                        size="medium"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person sx={{ color: '#999', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                backgroundColor: '#fff',
                                                fontSize: '0.95rem',
                                                '&:hover fieldset': {
                                                    borderColor: '#4CAF50',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4CAF50',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Password Input */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        placeholder="Mật khẩu"
                                        size="medium"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock sx={{ color: '#999', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleTogglePassword}
                                                        edge="end"
                                                        size="small"
                                                        sx={{ color: '#666' }}
                                                    >
                                                        {showPassword ? 
                                                            <span style={{ fontSize: '16px' }}>🙈</span> : 
                                                            <span style={{ fontSize: '16px' }}>👁️</span>
                                                        }
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                backgroundColor: '#fff',
                                                fontSize: '0.95rem',
                                                '&:hover fieldset': {
                                                    borderColor: '#4CAF50',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4CAF50',
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Login Button */}
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onMouseEnter={() => setHoveredButton('login')}
                                        onMouseLeave={() => setHoveredButton(null)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #FFA726 0%, #FF8F00 100%)',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            padding: '12px 24px',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 16px rgba(255, 167, 38, 0.3)',
                                            transition: 'all 0.3s ease',
                                            transform: hoveredButton === 'login' ? 'translateY(-2px)' : 'translateY(0)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #FF8F00 0%, #E65100 100%)',
                                                boxShadow: '0 6px 20px rgba(255, 167, 38, 0.4)',
                                            }
                                        }}
                                    >
                                        ĐĂNG NHẬP
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* OR Divider */}
                            <Box className="or-separator">
                                <Typography variant="body2" sx={{ 
                                    color: '#999', 
                                    fontWeight: 500, 
                                    fontSize: '0.9rem',
                                    background: '#f8f9fa',
                                    padding: '0 16px'
                                }}>
                                    HOẶC
                                </Typography>
                            </Box>

                            {/* Register and Google Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                {/* Register Button */}
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    onMouseEnter={() => setHoveredButton('register')}
                                    onMouseLeave={() => setHoveredButton(null)}
                                    sx={{
                                        flex: 1,
                                        borderColor: '#4CAF50',
                                        color: '#4CAF50',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#4CAF50',
                                            color: '#fff',
                                            borderColor: '#4CAF50',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
                                        }
                                    }}
                                >
                                    <Home sx={{ mr: 1, fontSize: 18 }} />
                                    Đăng ký miễn phí
                                </Button>

                                {/* Google Sign In */}
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onMouseEnter={() => setHoveredButton('google')}
                                    onMouseLeave={() => setHoveredButton(null)}
                                    sx={{
                                        flex: 1,
                                        backgroundColor: '#fff',
                                        border: '1px solid #dadce0',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        color: '#3c4043',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa',
                                            borderColor: '#4285f4',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        }
                                    }}
                                >
                                    <Google sx={{ mr: 1, color: '#4285F4', fontSize: 18 }} />
                                    Đăng nhập với Google
                                </Button>
                            </Box>
                        </Box>

                        {/* Illustration Section */}
                        <Box className="illustration-section">
                            <img 
                                loading="lazy" 
                                src="https://marketing-assets.wheniwork-production.com/2020/01/16143317/footer-group-illustration-optimized.svg" 
                                alt="drawing of employees at work cheering and waving" 
                                className="illustration-img"
                            />
                        </Box>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default Signup;

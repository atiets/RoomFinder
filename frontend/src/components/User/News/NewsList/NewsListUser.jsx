import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Container,
  Chip,
  Paper
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { Article, Schedule } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#A8E6CF",
      light: "#C8E6C9",
      dark: "#81C784"
    },
    secondary: {
      main: "#FFCC80",
      light: "#FFD3A5",
      dark: "#FFB74D"
    }
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "16px",
  overflow: "hidden",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 32px rgba(168, 230, 207, 0.4)"
  }
}));

const NewsImage = styled(CardMedia)({
  height: "220px",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)"
  }
});

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    borderRadius: "12px",
    margin: "0 4px",
    "&.Mui-selected": {
      backgroundColor: "#A8E6CF",
      color: "white",
      "&:hover": {
        backgroundColor: "#81C784"
      }
    },
    "&:hover": {
      backgroundColor: "#FFCC80"
    }
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  borderRadius: "0 0 32px 32px",
  marginTop: theme.spacing(2.5)
}));

const NewsListUser = () => {
  document.title = "Danh sách tin tức";
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;
  const baseURL = process.env.REACT_APP_BASE_URL_API;
  
  const axiosJWT = axios.create({ baseURL });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosJWT.get("/v1/news");
        setNewsList(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải tin tức.");
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress 
          size={80} 
          sx={{ color: "#A8E6CF", mb: 2 }} 
        />
        <Typography variant="h6" sx={{ color: "#2E7D32" }}>
          Đang tải tin tức...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: "16px",
            fontSize: "1.1rem"
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const sortedNewsList = [...newsList].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = sortedNewsList.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(sortedNewsList.length / newsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "#FAFFFE", minHeight: "100vh" }}>
        <HeaderSection>
          <Container maxWidth="lg">
            <Box textAlign="center">
              <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                <Article sx={{ fontSize: 40, color: "#2E7D32", mr: 2 }} />
                <Typography 
                  variant="h3" 
                  component="h1"
                  sx={{ 
                    color: "#2E7D32",
                    fontWeight: "bold"
                  }}
                >
                  Tin Tức
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: "#4CAF50",
                  mb: 3,
                  fontWeight: "medium",
                  maxWidth: "800px",
                  margin: "0 auto 24px auto"
                }}
              >
                Tin tức thị trường mới nhất và chia sẻ kinh nghiệm tìm trọ
              </Typography>
              <Box display="flex" justifyContent="center" gap={2}>
                <Chip 
                  icon={<Schedule />}
                  label={`${sortedNewsList.length} bài viết`}
                  sx={{ 
                    backgroundColor: "#A8E6CF", 
                    color: "white",
                    fontWeight: "medium",
                    fontSize: "1rem",
                    height: "36px"
                  }} 
                />
                <Chip 
                  label="Cập nhật hàng ngày"
                  sx={{ 
                    backgroundColor: "#FFCC80", 
                    color: "#333",
                    fontWeight: "medium",
                    fontSize: "1rem",
                    height: "36px"
                  }} 
                />
              </Box>
            </Box>
          </Container>
        </HeaderSection>

        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Grid container spacing={4}>
            {currentNews.map((news) => (
              <Grid item xs={12} sm={6} md={4} key={news._id}>
                <StyledCard>
                  <Link 
                    to={`/news/${news._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {news.imageUrl && (
                      <NewsImage
                        image={`${baseURL}${news.imageUrl || "/placeholder.jpg"}`}
                        title={news.title}
                      />
                    )}
                    <CardContent sx={{ 
                      flexGrow: 1,
                      backgroundColor: "#F8FFF9",
                      p: 3
                    }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        gutterBottom
                        sx={{ 
                          color: "#2E7D32",
                          fontWeight: "bold",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "3.2em"
                        }}
                      >
                        {news.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6
                        }}
                      >
                        {news.description}
                      </Typography>
                      <Box mt={2}>
                        <Chip 
                          label="Đọc thêm"
                          size="small"
                          sx={{ 
                            backgroundColor: "#FFCC80",
                            color: "#333",
                            "&:hover": {
                              backgroundColor: "#FFB74D"
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Link>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Paper 
              elevation={2}
              sx={{ 
                mt: 6, 
                p: 3, 
                borderRadius: "20px",
                backgroundColor: "#F1F8E9"
              }}
            >
              <Box display="flex" justifyContent="center">
                <StyledPagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
              <Typography 
                variant="body2" 
                textAlign="center" 
                sx={{ 
                  mt: 2, 
                  color: "#4CAF50",
                  fontWeight: "medium"
                }}
              >
                Trang {currentPage} / {totalPages} • Hiển thị {currentNews.length} / {sortedNewsList.length} bài viết
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NewsListUser;
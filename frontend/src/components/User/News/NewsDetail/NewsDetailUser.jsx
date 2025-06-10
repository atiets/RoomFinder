import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Avatar,
  Divider,
  Button
} from "@mui/material";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { 
  ArrowBack, 
  Person, 
  Schedule, 
  Visibility,
  Article 
} from "@mui/icons-material";

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(168, 230, 207, 0.2)"
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#F1F8E9",
  padding: theme.spacing(4),
  borderRadius: "24px 24px 0 0"
}));

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: "#FAFFFE"
}));

const MetaInfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFF8E1",
  padding: theme.spacing(2),
  borderRadius: "16px",
  marginBottom: theme.spacing(3),
  border: "1px solid #FFCC80"
}));

const BackButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#A8E6CF",
  color: "white",
  borderRadius: "20px",
  padding: "10px 24px",
  marginBottom: theme.spacing(3),
  "&:hover": {
    backgroundColor: "#81C784"
  }
}));

const NewsDetailUser = () => {
  document.title = "Chi tiết tin tức";
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await axiosJWT.get(`/v1/news/${id}`);
        setNews(response.data);
        setLoading(false);

        if (!localStorage.getItem(`viewed_${id}`)) {
          const timer = setTimeout(async () => {
            try {
              const updateResponseData = await axiosJWT.get(`/v1/news/${id}`);
              setNews(updateResponseData.data);
              localStorage.setItem(`viewed_${id}`, "true");
            } catch (err) {
              console.log("Lỗi cập nhật lượt xem", err);
            }
          }, 5000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        setError("Không thể tải chi tiết tin tức.");
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
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
            Đang tải bài viết...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    );
  }

  const formattedDate = new Date(news.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "#FAFFFE", minHeight: "100vh", py: 4, mt: 5 }}>
        <Container maxWidth="md">
          <BackButton
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </BackButton>

          {/* <Breadcrumbs sx={{ mb: 3 }}>
            <Link 
              component="button"
              onClick={() => navigate("/")}
              sx={{ 
                color: "#2E7D32",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Trang chủ
            </Link>
            <Link 
              component="button"
              onClick={() => navigate("/TinTuc")}
              sx={{ 
                color: "#2E7D32",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Tin tức
            </Link>
            <Typography color="text.primary">Chi tiết bài viết</Typography>
          </Breadcrumbs> */}

          <StyledPaper>
            <HeaderSection>
              <Box display="flex" alignItems="center" mb={2}>
                <Article sx={{ color: "#2E7D32", mr: 1, fontSize: 28 }} />
                <Chip 
                  label="Bài viết"
                  sx={{ 
                    backgroundColor: "#A8E6CF",
                    color: "white",
                    fontWeight: "medium"
                  }}
                />
              </Box>
              
              <Typography 
                variant="h3" 
                component="h1"
                sx={{ 
                  color: "#2E7D32",
                  fontWeight: "bold",
                  lineHeight: 1.2,
                  mb: 3
                }}
              >
                {news.title}
              </Typography>

              <MetaInfoBox>
                <Box 
                  display="flex" 
                  flexWrap="wrap" 
                  gap={2} 
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: "#FFCC80", width: 32, height: 32, mr: 1 }}>
                      <Person sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {news.author}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Schedule sx={{ color: "#E65100", mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      {formattedDate}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Visibility sx={{ color: "#2E7D32", mr: 1, fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {news.views} lượt xem
                    </Typography>
                  </Box>
                </Box>
              </MetaInfoBox>
            </HeaderSection>

            <Divider />

            <ContentSection>
              <Box
                sx={{
                  "& p": {
                    marginBottom: 2,
                    lineHeight: 1.8,
                    fontSize: "1.1rem"
                  },
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    color: "#2E7D32",
                    marginTop: 3,
                    marginBottom: 2,
                    fontWeight: "bold"
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    margin: "16px 0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                  },
                  "& ul, & ol": {
                    paddingLeft: 3,
                    marginBottom: 2
                  },
                  "& li": {
                    marginBottom: 1,
                    lineHeight: 1.6
                  },
                  "& blockquote": {
                    borderLeft: "4px solid #A8E6CF",
                    paddingLeft: 2,
                    fontStyle: "italic",
                    backgroundColor: "#F1F8E9",
                    padding: 2,
                    borderRadius: "0 8px 8px 0",
                    margin: "16px 0"
                  }
                }}
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </ContentSection>
          </StyledPaper>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/TinTuc")}
              sx={{
                backgroundColor: "#FFCC80",
                color: "#333",
                borderRadius: "20px",
                padding: "12px 32px",
                fontSize: "1.1rem",
                "&:hover": {
                  backgroundColor: "#FFB74D"
                }
              }}
            >
              Xem thêm tin tức khác
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NewsDetailUser;
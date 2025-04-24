import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import posts from "../../../mockData/post"; // Dữ liệu mock bài đăng

// Thư viện màu pastel
const colors = {
  green: "#A8E6CF", // Xanh lá pastel
  orange: "#FFB3B3", // Cam pastel
  lightGreen: "#D4E157", // Xanh lá nhạt
  lightOrange: "#FF7043", // Cam nhạt
};

const UserStatistics = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [filteredPosts, setFilteredPosts] = useState(posts);

  // Lọc bài đăng theo thời gian
  const filterPostsByTime = (range) => {
    const today = new Date();
    const filtered = posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      switch (range) {
        case "day":
          return postDate.getDate() === today.getDate();
        case "week":
          const diff = today.getDate() - postDate.getDate();
          return diff <= 7;
        case "month":
          return postDate.getMonth() === today.getMonth();
        case "year":
          return postDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
    setFilteredPosts(filtered);
  };

  useEffect(() => {
    filterPostsByTime(timeRange);
  }, [timeRange]);

  // Biểu đồ số lượng bài đăng theo thời gian
  const getPostsOverTime = () => {
    const groupedByDate = filteredPosts.reduce((acc, post) => {
      const date = new Date(post.createdAt).toLocaleDateString();
      acc[date] = acc[date] ? acc[date] + 1 : 1;
      return acc;
    }, {});
    
    const labels = Object.keys(groupedByDate);
    const data = Object.values(groupedByDate);

    return {
      labels,
      datasets: [
        {
          label: "Số lượng bài đăng",
          data,
          borderColor: colors.green,
          backgroundColor: colors.lightGreen,
          tension: 0.1,
        },
      ],
    };
  };

  // Biểu đồ lượt xem bài đăng
  const getViewsData = () => {
    const views = filteredPosts.map(post => post.views);
    const labels = filteredPosts.map(post => post.title);

    return {
      labels,
      datasets: [
        {
          label: "Lượt xem",
          data: views,
          backgroundColor: colors.orange,
        },
      ],
    };
  };

  // Biểu đồ đánh giá bài đăng
  const getRatingsData = () => {
    const ratings = [1, 2, 3, 4, 5].map((rating) => {
      return filteredPosts.filter(post => post.ratings === rating).length;
    });

    return {
      labels: ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao"],
      datasets: [
        {
          data: ratings,
          backgroundColor: [
            colors.green,
            colors.lightGreen,
            colors.orange,
            colors.lightOrange,
            colors.green,
          ],
        },
      ],
    };
  };

  return (
    <div className="statistics-container">
      <h2>Thống Kê Bài Đăng</h2>
      
      <div className="filter-controls">
        <label for="timeRange">Chọn thời gian: </label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
      </div>

      <div className="charts">
        {/* Biểu đồ số lượng bài đăng theo thời gian */}
        <div className="chart-item">
          <h3>Số lượng bài đăng theo thời gian</h3>
          <Line data={getPostsOverTime()} />
        </div>

        {/* Biểu đồ lượt xem bài đăng */}
        <div className="chart-item">
          <h3>Lượt xem bài đăng</h3>
          <Bar data={getViewsData()} />
        </div>

        {/* Biểu đồ đánh giá bài đăng */}
{/* Biểu đồ đánh giá bài đăng */}
<div className="chart-item" style={{ width: '250px', height: '250px' }}>
  <h3>Tỷ lệ đánh giá bài đăng</h3>
  <Pie
    data={getRatingsData()}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    }}
  />
</div>

      </div>
    </div>
  );
};

export default UserStatistics;
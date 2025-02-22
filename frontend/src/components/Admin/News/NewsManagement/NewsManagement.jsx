import React from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import NewsBreadcrumbs from "../NewsBreadcrumbs/NewsBreadcrumbs";
import NewsList from "../NewsList/NewsList";
import NewsForm from "../NewsForm/NewsForm";
import "./NewsManagement.css";

const NewsManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="news-management">
      <div className="sidebar">
        <ul>
          <li
            className={
              window.location.pathname === "/manage-news/list" ? "active" : ""
            }
            onClick={() => navigate("/manage-news/list")}
          >
            Danh sách tin tức
          </li>
          <li
            className={
              window.location.pathname === "/manage-news/add" ? "active" : ""
            }
            onClick={() => navigate("/manage-news/add")}
          >
            Thêm tin tức
          </li>
        </ul>
      </div>

      <div className="content">
        <Routes>
          {/* Điều hướng mặc định tới danh sách tin tức */}
          <Route path="/" element={<Navigate to="list" replace />} />
          <Route
            path="list"
            element={
              <>
                <NewsBreadcrumbs current="Danh sách tin tức" />
                <NewsList />
              </>
            }
          />
          <Route
            path="add"
            element={
              <>
                <NewsBreadcrumbs current="Thêm tin tức" />
                <NewsForm />
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default NewsManagement;

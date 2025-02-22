import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./ListNewsHome.css";

const ListNewsHome = () => {
  const [newsList, setNewsList] = useState([]);
  console.log(newsList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let axiosJWT = axios.create({
    baseURL: "https://befindrentalrooms-production.up.railway.app",
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosJWT.get("/v1/news");
        const sortedNews = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNewsList(sortedNews);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải tin tức.");
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  if (error) return <p>{error}</p>;

  return (
    <>
      {newsList && newsList.length >= 4 && (
        <div className="home-news-list-container">
          <h2 className="news-list-title">Tin Tức Mới Nhất</h2>
          <div className="home-news_wrapper">
            <div className="home-news_7">
              <div className="home-news_detail">
                <div className="home-news_main home-news_item">
                  <p className="home-news_image">
                    {newsList[0].imageUrl && (
                      <img
                        src={`https://befindrentalrooms-production.up.railway.app${
                          newsList[0].imageUrl || "/placeholder.jpg"
                        }`}
                        alt={newsList[0].title}
                      />
                    )}
                  </p>
                  <div className="home-news__content">
                    <h3>{newsList[0].title}</h3>
                    <p>{newsList[0].description}</p>
                  </div>
                  <Link to={`/news/${newsList[0]._id}`}></Link>
                </div>
              </div>
              <div className="home-news_row">
                <div className="home-news_6">
                  <div className="home-news_child  home-news_item">
                    <p className="home-news_image">
                      {newsList[1].imageUrl && (
                        <img
                          src={`https://befindrentalrooms-production.up.railway.app${
                            newsList[1].imageUrl || "/placeholder.jpg"
                          }`}
                          alt={newsList[1].title}
                        />
                      )}
                    </p>
                    <div className="home-news__content">
                      <h3>{newsList[1].title}</h3>
                    </div>
                    <Link to={`/news/${newsList[1]._id}`}></Link>
                  </div>
                </div>
                <div className="home-news_6">
                  <div className="home-news_child  home-news_item">
                    <p className="home-news_image">
                      {newsList[2].imageUrl && (
                        <img
                          src={`https://befindrentalrooms-production.up.railway.app${
                            newsList[2].imageUrl || "/placeholder.jpg"
                          }`}
                          alt={newsList[2].title}
                        />
                      )}
                    </p>
                    <div className="home-news__content">
                      <h3>{newsList[2].title}</h3>
                    </div>
                    <Link to={`/news/${newsList[2]._id}`}></Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="home-news_5">
              <ul className="home-news_list">
                {newsList.slice(3, 9).map((item) => (
                  <li>
                    <Link to={`/news/${item._id}`}>{item.title}</Link>
                  </li>
                ))}
                <li className="view-more">
                  <Link to={`/TinTuc`}>Xem thêm</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListNewsHome;

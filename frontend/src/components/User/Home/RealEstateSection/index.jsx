import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import imgBD from "../../../../assets/images/binh-duong.jpg";
import imgCT from "../../../../assets/images/can-tho.jpg";
import imgDN from "../../../../assets/images/da-nang.jpg";
import imgHN from "../../../../assets/images/ha-noi.jpg";
import imgHCM from "../../../../assets/images/ho-chi-minh.jpg";
import { fetchPostCountByCity, searchPosts } from "../../../../redux/postAPI";
import { setError, setLoading, setPosts } from "../../../../redux/postSlice";
import "./index.css";

const imageMap = {
    "Thành phố Hồ Chí Minh": imgHCM,
    "Thành phố Hà Nội": imgHN,
    "Thành phố Đà Nẵng": imgDN,
    "Thành phố Cần Thơ": imgCT,
    "Tỉnh Bình Dương": imgBD,
};

function RealEstateSection() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.login.currentUser);
    const accessToken = user?.accessToken;

    const [transactionType, setTransactionType] = useState("Cho thuê");
    const [category, setCategory] = useState("Căn hộ/chung cư");
    const [counts, setCounts] = useState({});

    useEffect(() => {
        const getCounts = async () => {
            try {
                const data = await fetchPostCountByCity(transactionType, category);
                setCounts(data);
            } catch (error) {
                console.error("Failed to fetch post counts:", error);
            }
        };

        getCounts();
    }, [transactionType, category]);

    const handleTransactionChange = (type) => {
        setTransactionType(type);
        if (type === "Cần bán" && category === "phòng trọ") {
            setCategory("Căn hộ/chung cư");
        }
    };

    const handleCategoryChange = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    const categories = [
        "Căn hộ/chung cư",
        "Nhà ở",
        "Văn phòng, mặt bằng kinh doanh",
        "Đất",
        "phòng trọ",
    ];

    const filteredCategories =
        transactionType === "Cần bán"
            ? categories.filter((cat) => cat !== "phòng trọ")
            : categories;

    const cityOrder = [
        "Thành phố Hồ Chí Minh",
        "Thành phố Hà Nội",
        "Thành phố Đà Nẵng",
        "Thành phố Cần Thơ",
        "Tỉnh Bình Dương",
    ];

    const locations = cityOrder.map((city) => ({
        name: city,
        listings: counts[city] !== undefined ? `${counts[city]} tin đăng` : "Đang tải...",
        img: imageMap[city],
    }));

    const handleLocationClick = async (province) => {
        try {
            const params = {
                transactionType,
                category,
                province,
            };

            const result = await searchPosts(params, accessToken);

            dispatch(setPosts(result));
            navigate("/search", {
                state: { results: result, filters: params },
            });
        } catch (error) {
            dispatch(setError(error.message));
            console.error("Search error:", error);
        } finally {
            dispatch(setLoading(false));
        }
    };


    return (
        <div className="realestate-container">
            <div className="tab-header">
                <span
                    className={`tab ${transactionType === "Cần bán" ? "selected" : ""}`}
                    onClick={() => handleTransactionChange("Cần bán")}
                >
                    Mua bán
                </span>
                <span
                    className={`tab ${transactionType === "Cho thuê" ? "selected" : ""}`}
                    onClick={() => handleTransactionChange("Cho thuê")}
                >
                    Cho thuê
                </span>
            </div>

            <div className="category-buttons">
                {filteredCategories.map((cat) => (
                    <button
                        key={cat}
                        className={`category ${category === cat ? "active" : ""}`}
                        onClick={() => handleCategoryChange(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="location-grid">
                {locations.map((loc, idx) => (
                    <div
                        className={`location-card ${idx === 0 ? "large" : ""}`}
                        key={idx}
                        style={{ backgroundImage: `url(${loc.img})` }}
                        onClick={() => handleLocationClick(loc.name)}
                    >
                        <div className="overlay">
                            <div className="location-name">{loc.name}</div>
                            <div className="listing-count">{loc.listings}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RealEstateSection;

const axios = require("axios");

async function getCoordinates(addressString) {
  const encodedAddress = encodeURIComponent(addressString);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1`;

  console.log("📌 URL gửi đến Nominatim:", url);

  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "PhongTroXinh/1.0 (nguyenanhtuyet03.nbk@gmail.com)",
      },
    });

    const results = res.data;

    if (results.length === 0) {
      console.warn("⚠️ Không tìm thấy kết quả tọa độ cho địa chỉ:", addressString);
      return null;
    }

    const { lat, lon } = results[0];
    console.log("📍 Tọa độ lấy được từ Nominatim:", {
      latitude: lat,
      longitude: lon,
    });

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi Nominatim API:", error.message);
    return null;
  }
}

// 👇 Đây là phần quan trọng để export hàm
module.exports = getCoordinates;
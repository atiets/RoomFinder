// randomAdmin.js
const User = require("../models/User");

let ADMIN_IDS = [];

async function getAllAdminIds() {
    const admins = await User.find({ admin: "true" }).select("_id");
    ADMIN_IDS = admins.map(a => a._id.toString());
}
getAllAdminIds();

function getRandomOnlineAdmin(onlineUsers) {
    const onlineAdminIds = ADMIN_IDS.filter(id => onlineUsers[id]);
    if (onlineAdminIds.length > 0) {
        const randIdx = Math.floor(Math.random() * onlineAdminIds.length);
        return onlineAdminIds[randIdx];
    }

    const defaultAdminId = process.env.DEFAULT_ADMIN_ID;
    if (defaultAdminId && ADMIN_IDS.includes(defaultAdminId)) {
        console.warn("⚠️ Không có admin online, fallback về DEFAULT_ADMIN_ID:", defaultAdminId);
        return defaultAdminId;
    }

    console.error("❌ Không có admin online và DEFAULT_ADMIN_ID không hợp lệ.");
    return null;
}

module.exports = { getRandomOnlineAdmin };

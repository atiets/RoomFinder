const AlertSubscription = require("../models/AlertSubscription");

// Tạo subscription
const createAlertSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const newSubscription = new AlertSubscription({
            ...req.body,
            user: userId,
        });

        const savedSubscription = await newSubscription.save();
        res.status(201).json(savedSubscription);
    } catch (error) {
        console.error("Error creating alert subscription:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Lấy subscriptions theo user
const getUserSubscriptions = async (req, res) => {
    try {
        const subscriptions = await AlertSubscription.find({ user: req.user.id });
        res.json(subscriptions);
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createAlertSubscription,
    getUserSubscriptions,
};

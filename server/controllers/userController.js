const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    if (!["admin", "staff", "patient"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, updateUserRole };
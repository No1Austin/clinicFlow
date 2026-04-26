const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await User.findOne({ email: "admin@clinic.com" });

  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "admin@clinic.com",
      password: hashed,
      role: "admin",
    });

    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }

  process.exit();
});
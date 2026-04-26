const express = require("express");
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);
router.put("/role", protect, authorize("admin"), updateUserRole);

module.exports = router;
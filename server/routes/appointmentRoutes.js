const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getAppointments);

router.post(
  "/",
  protect,
  authorize("admin", "staff"),
  createAppointment
);

router.put(
  "/:id",
  protect,
  authorize("admin", "staff"),
  updateAppointment
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "staff"),
  deleteAppointment
);

module.exports = router;
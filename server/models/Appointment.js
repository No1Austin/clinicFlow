const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },

    patientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    patientPhone: {
      type: String,
      trim: true
    },

    appointmentDate: {
      type: Date,
      required: true
    },

    reason: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "reschedule_requested"],
      default: "pending"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
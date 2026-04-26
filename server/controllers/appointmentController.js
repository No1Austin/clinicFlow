const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");
const AuditLog = require("../models/AuditLog");

const createAppointment = async (req, res) => {
  try {
    const { patientName, patientEmail, patientPhone, appointmentDate, reason } =
      req.body;

    if (!patientName || !patientEmail || !appointmentDate) {
      return res.status(400).json({
        message: "Patient name, email, and appointment date are required",
      });
    }

    const appointment = await Appointment.create({
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      reason,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      action: "APPOINTMENT_CREATED",
      details: `Appointment created for ${patientName}`,
      performedBy: req.user._id,
    });

    try {
      await sendEmail({
        to: patientEmail,
        subject: "ClinicFlow Appointment Confirmation",
        text: `Hello ${patientName},

Your appointment has been scheduled.

Date: ${new Date(appointmentDate).toLocaleString()}
Reason: ${reason || "No reason provided"}

Thank you,
ClinicFlow`,
      });
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError.message);
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error("CREATE APPOINTMENT ERROR:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === "patient") {
      appointments = await Appointment.find({
        patientEmail: req.user.email,
      }).sort({ appointmentDate: 1 });
    } else {
      appointments = await Appointment.find()
        .populate("createdBy", "name email role")
        .sort({ appointmentDate: 1 });
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await AuditLog.create({
      action: "APPOINTMENT_UPDATED",
      details: `Appointment status updated to ${updatedAppointment.status}`,
      performedBy: req.user._id,
    });

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await AuditLog.create({
      action: "APPOINTMENT_DELETED",
      details: `Appointment deleted for ${appointment.patientName}`,
      performedBy: req.user._id,
    });

    await appointment.deleteOne();

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
};
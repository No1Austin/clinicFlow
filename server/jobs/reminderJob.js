const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");

const startReminderJob = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: now,
          $lte: oneHourFromNow,
        },
        status: { $ne: "cancelled" },
        reminderSent: false,
      });

      for (const appointment of appointments) {
        await sendEmail({
          to: appointment.patientEmail,
          subject: "ClinicFlow Appointment Reminder",
          text: `Hello ${appointment.patientName},

This is a reminder for your upcoming appointment.

Date: ${new Date(appointment.appointmentDate).toLocaleString()}
Reason: ${appointment.reason || "No reason provided"}

Thank you,
ClinicFlow`,
        });

        appointment.reminderSent = true;
        await appointment.save();

        console.log(`Reminder sent to ${appointment.patientEmail}`);
      }
    } catch (error) {
      console.error("REMINDER JOB ERROR:", error.message);
    }
  });
};

module.exports = startReminderJob;
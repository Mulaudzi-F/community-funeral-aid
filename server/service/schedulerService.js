const cron = require("node-cron");
const {
  sendPaymentReminders,
  processLatePayments,
  closeVotingPeriods,
  processApprovedPayouts,
} = require("./taskService");

// Function to initialize scheduled jobs
const initializeScheduledJobs = () => {
  console.log("Initializing scheduled jobs...");

  // Schedule daily tasks at 8am
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily scheduled tasks...");

    try {
      // Send payment reminders
      await sendPaymentReminders();

      // Process late payments (suspend accounts)
      await processLatePayments();

      // Close voting periods that have expired
      await closeVotingPeriods();

      // Process approved payouts
      await processApprovedPayouts();

      console.log("Daily tasks completed");
    } catch (error) {
      console.error("Scheduled task error:", error);
    }
  });

  // Schedule hourly tasks
  cron.schedule("0 * * * *", async () => {
    console.log("Running hourly tasks...");

    try {
      // Check for pending notifications
      // Process any immediate tasks
      console.log("Hourly tasks completed");
    } catch (error) {
      console.error("Hourly task error:", error);
    }
  });
};

module.exports = { initializeScheduledJobs };

/* global require, exports */
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.checkAndSendReminders = onSchedule("every 1 hours", async () => {
  const db = admin.firestore();
  const messaging = admin.messaging();
  const now = new Date();
  const currentHour = now.getHours();
  const nowMs = now.getTime();

  console.log(`Starting reminder check at ${now.toISOString()}`);

  // Fetch users who have reminders enabled and have valid FCM tokens
  const usersSnapshot = await db.collection("users")
    .where("reminders.enabled", "==", true)
    .get();

  if (usersSnapshot.empty) {
    console.log("No users with active reminders found.");
    return;
  }

  const batch = db.batch();
  let notificationsSent = 0;

  for (const doc of usersSnapshot.docs) {
    const user = doc.data();
    const reminders = user.reminders;
    const tokens = user.fcmTokens || [];

    if (!tokens || tokens.length === 0) continue;

    // Check silent hours
    const start = reminders.startHour || 8;
    const end = reminders.endHour || 22;
    let isActiveTime = false;

    if (start < end) {
      if (currentHour >= start && currentHour < end) isActiveTime = true;
    } else if (start > end) {
      if (currentHour >= start || currentHour < end) isActiveTime = true;
    } else {
      isActiveTime = true;
    }

    if (!isActiveTime) continue;

    const intervalMs = (reminders.intervalHours || 3) * 60 * 60 * 1000;
    const lastWater = user.lastNotifiedWater || 0;
    const lastFood = user.lastNotifiedFood || 0;

    const shouldSendWater = reminders.remindWater && (nowMs - lastWater >= intervalMs);
    const shouldSendFood = reminders.remindFood && (nowMs - lastFood >= intervalMs);

    if (shouldSendWater || shouldSendFood) {
      let title = "";
      let body = "";

      if (shouldSendWater && shouldSendFood) {
        title = "🍎💧 Beslenme ve Su Zamanı!";
        body = "Vücudunu susuz bırakma ve sağlıklı atıştırmalıklarını unutma.";
      } else if (shouldSendWater) {
        title = "💧 Su İçme Vakti!";
        body = "Vücudunu susuz bırakma. Sağlığın için taze bir bardak su al!";
      } else if (shouldSendFood) {
        title = "🍎 Beslenme Zamanı!";
        body = "Günlük makrolarını tamamlamak ve enerjini korumak için hafifçe atıştır.";
      }

      const payload = {
        notification: {
          title,
          body,
        }
      };

      try {
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: payload.notification
        });

        console.log(`Successfully sent ${response.successCount} messages for user ${doc.id}`);

        if (response.failureCount > 0) {
          // Identify failed tokens (could be expired)
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(tokens[idx]);
            }
          });
          // Remove invalid tokens (optional cleanup)
          if (failedTokens.length > 0) {
            batch.update(doc.ref, {
              fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
            });
          }
        }

        // Update timestamps
        const updates = {};
        if (shouldSendWater) updates.lastNotifiedWater = nowMs;
        if (shouldSendFood) updates.lastNotifiedFood = nowMs;
        
        batch.update(doc.ref, updates);
        notificationsSent++;

      } catch (error) {
        console.error(`Error sending message for user ${doc.id}:`, error);
      }
    }
  }

  if (notificationsSent > 0) {
    await batch.commit();
    console.log(`Batch commit successful. Total active reminders sent: ${notificationsSent}`);
  }
});

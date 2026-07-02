import { storageService } from './storageService';

export const emailService = {
  async sendActivityReport({ profileName, categoryName, amount, unit, totalAllTime, unlockedMilestone, note, date }) {
    const data = storageService.loadData();
    const settings = data.parentSettings || {
      emails: ['chu.duc.tu@gmail.com', 'thanhha.phth@gmail.com'],
      emailService: 'formsubmit'
    };

    const recipientEmails = settings.emails || ['chu.duc.tu@gmail.com', 'thanhha.phth@gmail.com'];
    
    console.log(`📧 Preparing to send activity notification to:`, recipientEmails);

    const dateLabel = date ? ` on ${date}` : '';
    const subject = unlockedMilestone 
      ? `🏆 [MILESTONE UNLOCKED!] ${profileName} completed ${amount} ${unit} of ${categoryName}${dateLabel}!`
      : `⭐ [Activity Log] ${profileName} completed ${amount} ${unit} of ${categoryName}${dateLabel}!`;

    const messageBody = {
      "_subject": subject,
      "Child Name": profileName,
      "Activity Category": categoryName,
      "Date of Activity": date || new Date().toISOString().split('T')[0],
      "Amount Logged": `${amount} ${unit}`,
      "Total Accumulated All-Time": `${totalAllTime} ${unit}`,
      "Milestone Status": unlockedMilestone ? `🎉 UNLOCKED TROPHY: ${unlockedMilestone.name}!` : `Progressing towards next milestone!`,
      "Kid Note / Comment": note || "(No comment added)",
      "Time Recorded": new Date().toLocaleString(),
      "_template": "table",
      "_captcha": "false"
    };

    // Send to all configured parent emails
    const sendPromises = recipientEmails.map(async (email) => {
      const cleanEmail = email.trim();
      if (!cleanEmail) return;

      try {
        if (settings.emailService === 'formsubmit' || !settings.emailService) {
          const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(messageBody)
          });

          const result = await res.json();
          if (res.ok) {
            console.log(`✅ Email sent successfully via FormSubmit to ${cleanEmail}`);
            return { success: true, email: cleanEmail };
          } else {
            console.warn(`⚠️ FormSubmit warning for ${cleanEmail}:`, result);
            return { success: false, email: cleanEmail, error: result };
          }
        }
      } catch (err) {
        console.error(`❌ Error sending email notification to ${cleanEmail}:`, err);
        return { success: false, email: cleanEmail, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);
    return results;
  }
};

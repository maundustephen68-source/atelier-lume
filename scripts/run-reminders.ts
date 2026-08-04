// Run with: npm run cron:reminders
// Wire this to a system crontab (every 10-15 min) if you're not on Vercel:
//   */10 * * * * cd /path/to/app && npm run cron:reminders >> /var/log/atelier-cron.log 2>&1
import { runDueReminders } from "../src/lib/reminders";

runDueReminders()
  .then((r) => {
    console.log(JSON.stringify(r));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

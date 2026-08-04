export const config = {
  studioName: "Atelier Lume Photography",
  workingHours: {
    start: process.env.WORKING_HOURS_START || "09:00",
    end: process.env.WORKING_HOURS_END || "18:00",
    daysOpen: [0, 1, 2, 3, 4, 5, 6], // open every day  
     },
    
  bufferMinutes: Number(process.env.BOOKING_BUFFER_MINUTES || 30),
  holdMinutes: Number(process.env.BOOKING_HOLD_MINUTES || 10),
  rescheduleCutoffHours: Number(process.env.RESCHEDULE_CUTOFF_HOURS || 48),
  depositPercent: Number(process.env.DEPOSIT_PERCENT || 100), // 100 = full payment
  currency: process.env.CURRENCY || "usd",
};

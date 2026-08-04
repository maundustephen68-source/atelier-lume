import { z } from "zod";

// E.164 international phone format, e.g. +254712345678
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Enter phone in international format, e.g. +254712345678");

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: phoneSchema,
  eventType: z.string().trim().min(1).max(80),
  preferredDates: z.string().trim().min(1).max(200),
  budget: z.string().trim().max(80).optional(),
  source: z.string().trim().max(120).optional(),
  // honeypot - real users never fill this in
  website: z.string().max(0, "Bot detected").optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(2000),
  website: z.string().max(0, "Bot detected").optional(),
});

export const holdSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const confirmBookingSchema = z.object({
  bookingId: z.string().min(1),
  clientName: z.string().trim().min(1).max(120),
  clientEmail: z.string().trim().email().max(200),
  clientPhone: phoneSchema,
  whatsappOptIn: z.boolean(),
  notes: z.string().trim().max(1000).optional(),
  website: z.string().max(0, "Bot detected").optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

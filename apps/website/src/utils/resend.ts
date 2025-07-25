import { Resend } from "resend";

// Initialize Resend only if API key is available
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Helper function to check if Resend is available
export const isResendAvailable = () => !!resend;

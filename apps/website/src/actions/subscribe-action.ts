"use server";

import { resend, isResendAvailable } from "@/utils/resend";

export async function subscribeAction(formData: FormData) {
  const email = formData.get("email") as string;

  // Handle case when Resend is not configured
  if (!isResendAvailable()) {
    console.log(`[DEV] Email subscription attempt for: ${email}`);
    return {
      success: true,
      message: "Thank you for subscribing! (Development mode - no email sent)"
    };
  }

  try {
    const result = await resend!.contacts.create({
      email,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    });
    
    return {
      success: true,
      message: "Successfully subscribed!",
      data: result
    };
  } catch (error) {
    console.error("Resend subscription error:", error);
    return {
      success: false,
      message: "Failed to subscribe. Please try again."
    };
  }
}

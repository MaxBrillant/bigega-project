import { z } from "zod";

import { isValidNumber } from "libphonenumber-js";

export const DonationSchema = z
  .object({
    amount: z
      .number({
        required_error: "Please provide an amount",
        invalid_type_error: "Please provide an amount",
      })
      .min(500, "The amount should be more than BIF.500")
      .max(1000000, "The amount should be less than BIF.1,000,000"),
    lumicashNumber: z
      .string()
      .refine((data) => isValidNumber("+257" + data), {
        message: "Write a valid Lumicash number",
      })
      .optional(),
    ecocashNumber: z
      .string()
      .refine((data) => isValidNumber("+257" + data), {
        message: "Write a valid Ecocash number",
      })
      .optional(),
    otp: z.string().length(6, "Write a valid code").optional(),

    donorName: z
      .string({
        required_error: "Write your full name",
        invalid_type_error: "Write your full name",
      })
      .min(5, { message: "Write your full name" })
      .max(70, "Your name should have less than 70 characters"),
    isDonorAnonymous: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.lumicashNumber && !data.ecocashNumber) {
        return false;
      }
      return true;
    },
    {
      message: "Select a payment method",
    }
  )
  .refine(
    (data) => {
      if (data.lumicashNumber && data.ecocashNumber) {
        return false;
      }
      return true;
    },
    {
      message: "Select only one payment method",
    }
  );

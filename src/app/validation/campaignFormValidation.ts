import { z } from "zod";

import { isValidNumber } from "libphonenumber-js";

export const CampaignSchema = z.object({
  title: z
    .string()
    .min(1, { message: "A title is required" })
    .max(100, "The title should have less than 100 characters"),
  category: z.enum(
    [
      "wedding",
      "funerals",
      "gift",
      "event",
      "medical",
      "emergency",
      "business",
      "family",
      "education",
      "travel",
      "other",
    ],
    {
      required_error: "Select a category",
      invalid_type_error: "Select a category",
    }
  ),
  description: z
    .string()
    .max(500, "The description should be less than 500 words")
    .optional(),

  country: z.enum(["burundi", "rwanda"], {
    required_error: "Select a country",
    invalid_type_error: "Select a country",
  }),
  targetAmount: z
    .number({
      required_error: "Please provide an amount",
      invalid_type_error: "Please provide an amount",
    })
    .min(10000, "The amount should be more than BIF.10,000")
    .max(10000000, "The amount should be less than BIF.10,000,000"),
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
  mtnMomoNumber: z
    .string()
    .refine((data) => isValidNumber("+250" + data), {
      message: "Write a valid MTN Momo number",
    })
    .optional(),

  whatsappGroupLink: z
    .string()
    .regex(
      /^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]{22}$/,
      "Please provide a valid Whatsapp group link"
    ),
  languageOfCommunication: z.enum(["en", "fr", "bi", "rw"], {
    required_error: "Select a language of communication",
    invalid_type_error: "Select a language of communication",
  }),

  organizerName: z
    .string()
    .min(1, { message: "Your name is required" })
    .max(70, "Your name should have less than 70 characters"),
  organizerWhatsappNumber: z
    .string()
    .min(1, { message: "Your whatsapp number is required" })
    .refine((data) => isValidNumber(data), {
      message: "Write a valid phone number",
    }),
});

export const BasicDetailsSchema = CampaignSchema.pick({
  title: true,
  category: true,
  description: true,
});

export const PaymentDetailsSchema = CampaignSchema.pick({
  country: true,
  targetAmount: true,
  lumicashNumber: true,
  ecocashNumber: true,
  mtnMomoNumber: true,
})
  .refine(
    (data) => {
      if (!data.lumicashNumber && !data.ecocashNumber && !data.mtnMomoNumber) {
        return false;
      }
      return true;
    },
    {
      message: "Select at least one payment method",
    }
  )
  .refine(
    (data) => {
      if (
        data.country === "rwanda" &&
        (data.lumicashNumber || data.ecocashNumber)
      ) {
        return false;
      }
      if (data.country === "burundi" && data.mtnMomoNumber) {
        return false;
      }
      return true;
    },
    {
      message:
        "Make sure you select the payment methods from the selected country",
      path: ["country"],
    }
  );

export const WhatsappGroupDetailsSchema = CampaignSchema.pick({
  whatsappGroupLink: true,
  languageOfCommunication: true,
});

export const OrganizerDetailsSchema = CampaignSchema.pick({
  organizerName: true,
  organizerWhatsappNumber: true,
});

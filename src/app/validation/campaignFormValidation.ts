import { z } from "zod";

import { isValidNumber } from "libphonenumber-js";

export const CampaignSchema = (dict: any) =>
  z.object({
    title: z
      .string()
      .min(1, { message: dict?.validation?.required_title })
      .max(100, { message: dict?.validation?.max_title }),
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
        required_error: dict?.validation?.required_category,
        invalid_type_error: dict?.validation?.required_category,
      }
    ),
    description: z
      .string()
      .max(500, dict?.validation?.max_description)
      .optional(),

    country: z.enum(["burundi", "rwanda"], {
      required_error: dict?.validation?.country,
      invalid_type_error: dict?.validation?.country,
    }),
    targetAmount: z
      .number({
        required_error: dict?.validation?.amount,
        invalid_type_error: dict?.validation?.amount,
      })
      .min(10000, dict?.validation?.min_amount)
      .max(10000000, dict?.validation?.max_amount),
    lumicashNumber: z
      .string()
      .refine((data) => isValidNumber("+257" + data), {
        message: dict?.validation?.lumicash,
      })
      .optional(),
    ecocashNumber: z
      .string()
      .refine((data) => isValidNumber("+257" + data), {
        message: dict?.validation?.ecocash,
      })
      .optional(),
    mtnMomoNumber: z
      .string()
      .refine((data) => isValidNumber("+250" + data), {
        message: dict?.validation?.mtn_momo,
      })
      .optional(),

    whatsappGroupLink: z
      .string()
      .regex(
        /^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]{22}$/,
        dict?.validation?.link
      ),
    languageOfCommunication: z.enum(["en", "fr", "bi", "rw"], {
      required_error: dict?.validation?.language,
      invalid_type_error: dict?.validation?.language,
    }),

    organizerName: z
      .string()
      .min(1, { message: dict?.validation?.min_organizer })
      .max(70, dict?.validation?.max_organizer),

    organizerWhatsappNumber: z.string().refine((data) => isValidNumber(data), {
      message: dict?.validation?.valid_whatsapp,
    }),
  });

export const BasicDetailsSchema = (dict: any) => {
  return CampaignSchema(dict).pick({
    title: true,
    category: true,
    description: true,
  });
};

export const PaymentDetailsSchema = (dict: any) =>
  CampaignSchema(dict)
    .pick({
      country: true,
      targetAmount: true,
      lumicashNumber: true,
      ecocashNumber: true,
      mtnMomoNumber: true,
    })
    .refine(
      (data) => {
        if (
          !data.lumicashNumber &&
          !data.ecocashNumber &&
          !data.mtnMomoNumber
        ) {
          return false;
        }
        return true;
      },
      {
        message: dict?.validation?.select_method,
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
        message: dict?.validation?.country_method,
        path: ["country"],
      }
    );

export const WhatsappGroupDetailsSchema = (dict: any) =>
  CampaignSchema(dict).pick({
    whatsappGroupLink: true,
    languageOfCommunication: true,
  });

export const OrganizerDetailsSchema = (dict: any) =>
  CampaignSchema(dict).pick({
    organizerName: true,
    organizerWhatsappNumber: true,
  });

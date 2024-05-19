import { z } from "zod";

import { isValidNumber } from "libphonenumber-js";

export const DonationSchema = (dict: any) =>
  z
    .object({
      amount: z
        .number({
          required_error: dict?.validation?.required_amount,
          invalid_type_error: dict?.validation?.required_amount,
        })
        .min(500, dict?.validation?.min_amount)
        .max(1000000, dict?.validation?.max_amount),
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
      otp: z.string().length(6, dict?.validation?.otp).optional(),

      donorName: z
        .string({
          required_error: dict?.validation?.required_name,
          invalid_type_error: dict?.validation?.required_name,
        })
        .min(5, { message: dict?.validation?.required_name })
        .max(70, dict?.validation?.max_name),
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
        message: dict?.validation?.select_method,
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
        message: dict?.validation?.one_method,
      }
    );

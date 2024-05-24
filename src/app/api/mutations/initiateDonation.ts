"use server";

import { DonationSchema } from "@/app/validation/donationFormValidation";
import { getDictionary } from "@/dictionaries/getDictionary";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { headers } from "next/headers";
import fetch from "node-fetch";

type props = {
  campaignId: number;
  amount: number;
  paymentNumber: string | undefined;
  paymentMethod: "ecocash" | "lumicash" | "card" | "mpesa";
  currency: "BIF" | "RWF" | "USD" | "KSH";
  otp: string | undefined;
  donorName: string;
  isDonorAnonymous: boolean;
};
type returnedData = [
  {
    id: number;
  }
];
export async function InitiateDonation(formData: props) {
  try {
    const dict = await getDictionary();
    DonationSchema(dict?.donate).parse({
      amount: formData.amount,
      paymentNumber: formData.paymentNumber,
      paymentMethod: formData.paymentMethod,
      otp: formData.otp,
      donorName: formData.donorName,
      isDonorAnonymous: formData.isDonorAnonymous,
    });

    const supabase = CreateServerClient();
    const { data, error } = await supabase
      .from("donations")
      .insert({
        campaign_id: formData.campaignId,
        donor_name: formData.donorName,
        is_donor_anonymous: formData.isDonorAnonymous,
        amount: formData.amount,
        donor_payment_number: formData.paymentNumber
          ? formData.paymentNumber
          : null,
        payment_method: formData.paymentMethod,
        currency: formData.currency,
      })
      .select()
      .limit(1)
      .returns<returnedData>();

    if (error) {
      throw new Error(
        `Error while initiating a donation from "${formData.donorName}": The error is: "${error.message}"`
      );
    }
    console.log(
      `A new donation of ID: "${data[0].id}" from donor: "${formData.donorName}" has been successfully initiated`
    );

    if (
      formData.paymentMethod === "ecocash" ||
      formData.paymentMethod === "lumicash"
    ) {
      await initiatePayment({
        donationId: String(data[0].id),
        amount: formData.amount,
        paymentMethod: formData.paymentMethod.toUpperCase() as
          | "ECOCASH"
          | "LUMICASH",
        phoneNumber: formData.paymentNumber as string,
        otp: formData.otp,
      });
    }
    return data[0].id;
  } catch (error) {
    throw new Error(
      `Error while initiating a donation from "${formData.donorName}": The error is: "${error}"`
    );
  }
}

type paymentProps = {
  donationId: string;
  amount: number;
  paymentMethod: "ECOCASH" | "LUMICASH";
  phoneNumber: string;
  otp: string | undefined;
};
async function initiatePayment(payment: paymentProps) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname");
  const origin = new URL(pathname as string).origin.replaceAll("https", "http");

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      donation_id: payment.donationId,
      phone_number: payment.phoneNumber,
      payment_method: payment.paymentMethod,
      amount: payment.amount,
      otp: payment.otp,
    }),
  };

  try {
    const paymentData = await fetch(origin + "/api/payment/afripay", options);

    const jsonData: any = await paymentData.json();

    const isPaymentInitiated: boolean = jsonData.includes("success");

    if (!isPaymentInitiated) {
      throw new Error(
        "Error trying to initiate payment. Try checking that your balance is enough or that your phone number is correct"
      );
    }

    return "success";
  } catch (error) {
    throw new Error("Error trying to initiate payment. The error is: " + error);
  }
}

export async function getOTP(amount: number, phoneNumber: string) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname");
  const origin = new URL(pathname as string).origin.replaceAll("https", "http");

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      donation_id: "",
      phone_number: phoneNumber,
      payment_method: "LUMICASH",
      amount: amount,
    }),
  };

  await fetch(origin + "/api/payment/afripay", options)
    .then((response) => {
      if (response.ok) {
        return response;
      } else {
        throw new Error(
          "Error trying to get the OTP payment: " + response.status
        );
      }
    })
    .catch((err) => {
      throw new Error("Error trying to get the OTP. The error is: " + err);
    });
  return "success";
}

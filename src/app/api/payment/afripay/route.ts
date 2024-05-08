// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { stringify } from "flatted";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const donationId: string = body.donation_id;
  const phoneNumber: string = body.phone_number;
  const paymentMethod: "ECOCASH" | "LUMICASH" = body.payment_method;
  const amount: string = body.amount;
  const otp: string | undefined = body.otp;

  console.log("processing payment");
  console.log(body);

  const formData = new FormData();

  formData.append(
    "request",
    paymentMethod === "LUMICASH" && !otp ? "transaction" : "payment"
  );
  formData.append("payment_type", "3");
  formData.append("app_id", process.env.AFRIPAY_APP_ID as string);
  formData.append("app_secret", process.env.AFRIPAY_APP_SECRET as string);
  formData.append("currency", "BIF");
  formData.append("client_token", donationId);
  formData.append("payment_method", paymentMethod);
  formData.append("amount", amount);
  if (paymentMethod === "LUMICASH" && !otp) {
    formData.append("mobile", `257${phoneNumber}`);
  } else {
    formData.append(
      "initiator",
      paymentMethod === "LUMICASH" ? `257${phoneNumber}` : phoneNumber
    );
  }
  if (otp) {
    formData.append("otp", otp);
  }
  if (paymentMethod === "LUMICASH" && !otp) {
    formData.append("action", "getOTP");
  }
  formData.append("comment", "Transaction of donation ID: " + donationId);

  const headers = {
    ...formData.getHeaders(),
  };

  const data = await axios
    .post("https://www.api.afripay.africa", formData, { headers: headers })
    .then((response) => {
      const returnedData = response.data;
      console.log(
        `This is the response: ${stringify({
          returnedData,
        })}`
      );
      return stringify({
        returnedData,
      });
    })
    .catch((err) => {
      throw new Error(
        `Error trying to process the transaction. The error is: ${err}`
      );
    });

  return new NextResponse(data);
}

// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const phoneNumber: string = body.phone_number;
  const paymentMethod: string = body.payment_method;
  const amount: string = body.amount;
  const otp: string | undefined = body.otp;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      request: "payment",
      payment: "3",
      app_id: process.env.AFRIPAY_APP_ID,
      app_secret: process.env.AFRIPAY_APP_SECRET,
      payment_method: paymentMethod,
      amount: amount,
      currency: "BIF",
      initiator: phoneNumber,
      otp: otp,
    }),
  };

  const data = await fetch("https://www.api.afripay.africa", options)
    .then((response) =>
      response.json().then((data: any) => {
        return data;
      })
    )
    .catch((err) => {
      throw new Error(
        `Error trying to process the transaction. The error is: ${err}`
      );
    });

  return new NextResponse(
    JSON.stringify({
      data: data,
    })
  );
}

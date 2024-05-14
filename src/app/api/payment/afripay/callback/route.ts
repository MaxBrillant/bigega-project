// Import necessary types and functions
import { NextApiRequest, NextApiResponse } from "next";
import { headers } from "next/headers";
import NextCors from "nextjs-cors";

export async function POST(request: NextApiRequest, response: NextApiResponse) {
  await NextCors(request, response, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  console.log("The webhook has been received");
  const body = await request.body;
  console.log(body);
  console.log("The webhook has been used");
  // const status: string = body.status;
  // const amount: string = body.amount;
  // const currency: string = body.currency;
  // const reference: string = body.transaction_ref;
  // const paymentMethod: "ECOCASH" | "LUMICASH" = body.payment_method;
  // const donation_id: string = body.donation_id;

  const headerList = headers();
  const pathname = headerList.get("x-pathname");
  const origin = new URL(pathname as string).origin.replaceAll("https", "http");
  return response.redirect(origin);
}

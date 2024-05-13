// Import necessary types and functions
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("The webhook has been received");
  console.log(request.body);
  const body = await request.json();
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
  return NextResponse.redirect(origin);
}

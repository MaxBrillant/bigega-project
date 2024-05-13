// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("The webhook has been received");
  console.log(request);
  console.log(request.body);
  const body = request.json();
  console.log(body);
  console.log(request.body);
  console.log("The webhook has been used");
  // const status: string = body.status;
  // const amount: string = body.amount;
  // const currency: string = body.currency;
  // const reference: string = body.transaction_ref;
  // const paymentMethod: "ECOCASH" | "LUMICASH" = body.payment_method;
  // const donation_id: string = body.donation_id;

  return NextResponse.redirect("www.bigega.com");
}

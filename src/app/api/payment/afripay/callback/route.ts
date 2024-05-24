import { CreateServerClient } from "@/utils/supabase/serverClient";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = CreateServerClient();
  const data = await request.formData();
  console.log(data);
  const status = data.get("status")?.toString();
  const reference = data.get("transaction_ref")?.toString();
  const donation_id = data.get("client_token")?.toString();

  const isPaymentPending = await checkIfPaymentIsPending(donation_id as string);
  if (
    (status === "success" || status === "suc") &&
    reference &&
    donation_id &&
    isPaymentPending
  ) {
    const { data, error } = await supabase
      .from("donations")
      .update({
        reference: reference,
        status: "received",
        transaction_date_and_time: new Date(),
      })
      .eq("id", donation_id)
      .select(
        `id,
      donor_name,
      is_donor_anonymous,
      amount,
      currency,
      donor_payment_number,
      payment_method,
      reference,
      transaction_date_and_time,
      campaigns (
        id,
        title,
        language_of_communication,
        whatsapp_group_id,
        target_amount,
        current_amount,
        number_of_donations,
        organizers (
          whatsapp_number
        )
      )`
      )
      .returns<returnedType>();

    if (error) {
      throw new Error(
        `Error while updating the donation. The error is: "${error.message}"`
      );
    }

    if (data.length > 0) {
      const { error } = await supabase
        .from("campaigns")
        .update({
          current_amount: data[0].campaigns.current_amount + data[0].amount,
          number_of_donations: data[0].campaigns.number_of_donations + 1,
        })
        .eq("id", data[0].campaigns.id);

      if (error) {
        throw new Error(
          `Error while updating the campaign numbers after the donation. The error is: "${error.message}"`
        );
      }
    }

    revalidatePath("/" + data[0].campaigns.id);

    const headerList = headers();
    const pathname = headerList.get("x-pathname");
    const origin = new URL(pathname as string).origin.replaceAll(
      "https",
      "http"
    );

    await fetch(origin + "/api/whatsapp/send-donation-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient_number: data[0].campaigns.organizers.whatsapp_number,
        language: data[0].campaigns.language_of_communication,
        name: data[0].donor_name,
        donation_number: data[0].donor_payment_number,
        title: data[0].campaigns.title,
        amount: data[0].amount,
        currency: data[0].currency,
        payment_method: data[0].payment_method,
        time: data[0].transaction_date_and_time,
        reference: data[0].reference,
        current_amount: data[0].campaigns.current_amount + data[0].amount,
      }),
    });

    await fetch(origin + "/api/whatsapp/groups/send-campaign-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: data[0].campaigns.whatsapp_group_id,
        language: data[0].campaigns.language_of_communication,
        campaign_id: data[0].campaigns.id,
        name: data[0].donor_name,
        is_donor_anonymous: data[0].is_donor_anonymous,
        title: data[0].campaigns.title,
        amount: data[0].amount,
        currency: data[0].currency,
        current_amount: data[0].campaigns.current_amount + data[0].amount,
        target_amount: data[0].campaigns.target_amount,
      }),
    });
  } else {
    throw new Error(
      `Error while confirming the transaction: Status code: ${status}`
    );
  }
  return new NextResponse();
}

type returnedType = [
  {
    id: number;
    donor_name: string;
    is_donor_anonymous: boolean;
    amount: number;
    currency: "BIF" | "RWF" | "USD" | "KSH";
    donor_payment_number: string;
    payment_method: "ecocash" | "lumicash" | "card" | "mpesa";
    reference: string;
    transaction_date_and_time: Date;
    campaigns: {
      id: number;
      title: string;
      language_of_communication: "en" | "fr" | "bi" | "rw";
      whatsapp_group_id: string;
      target_amount: number;
      current_amount: number;
      number_of_donations: number;
      organizers: {
        whatsapp_number: string;
      };
    };
  }
];

const checkIfPaymentIsPending = async (donationId: string) => {
  const supabase = CreateServerClient();
  const { data, error } = await supabase
    .from("donations")
    .select(
      `id,
      status`
    )
    .eq("id", donationId)
    .eq("status", "pending_confirmation")
    .limit(1);

  if (error) {
    throw new Error(
      `Error while checking if payment is pending. The error is: ${error.message}`
    );
  }
  if (data.length === 0) {
    throw new Error(
      `Error while checking if payment is pending. The donation was never initiated`
    );
  }
  return data.length > 0;
};

import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkIfPaymentIsPending } from "../../../afripay/callback/route";

const { PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY } = process.env;
const base = "https://api-m.sandbox.paypal.com";

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET_KEY
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data: any = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

const captureOrder = async (orderID: string) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only).
      // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: "POST",
  });

  try {
    const jsonResponse: any = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
};

export async function POST(request: NextRequest) {
  try {
    // use the cart information passed from the front-end to calculate the order amount detals

    const supabase = CreateServerClient();
    const body = await request.json();
    const { orderID, donationID } = body;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    const reference = jsonResponse.id;

    const isPaymentPending = await checkIfPaymentIsPending(
      donationID as string
    );
    if (
      (httpStatusCode === 200 || httpStatusCode === 201) &&
      isPaymentPending
    ) {
      const { data, error } = await supabase
        .from("donations")
        .update({
          reference: reference,
          status: "received",
          transaction_date_and_time: new Date(),
        })
        .eq("id", donationID)
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
        current_usd_amount,
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
            current_amount:
              data[0].campaigns.current_usd_amount + data[0].amount,
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
    } else {
      throw new Error(
        `Error while confirming the transaction: Status code: ${status}`
      );
    }

    return new NextResponse(JSON.stringify(jsonResponse), {
      status: httpStatusCode,
    });
  } catch (error) {
    console.error("Failed to capture order:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to capture order." }),
      {
        status: 500,
      }
    );
  }
}

type returnedType = [
  {
    id: number;
    donor_name: string;
    is_donor_anonymous: boolean;
    amount: number;
    currency: "BIF" | "USD";
    donor_payment_number: string;
    payment_method: "ecocash" | "lumicash" | "ibbm+" | "card" | "paypal";
    reference: string;
    transaction_date_and_time: Date;
    campaigns: {
      id: number;
      title: string;
      language_of_communication: "en" | "fr" | "bi" | "rw";
      whatsapp_group_id: string;
      target_amount: number;
      current_amount: number;
      current_usd_amount: number;
      number_of_donations: number;
      organizers: {
        whatsapp_number: string;
      };
    };
  }
];

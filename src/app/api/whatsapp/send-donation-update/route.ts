// Import necessary types and functions
import { formatAmount } from "@/utils/formatCurrency";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  const body = await request.json();
  const recipientNumber: string = body.recipient_number.replaceAll("+", "");
  const language: string = body.language;
  const name: string = body.name;
  const donation_number: string = body.donation_number;
  const title: string = body.title;
  const amount: number = body.amount;
  const currency: "BIF" | "RWF" = body.currency;
  const payment_method: "lumicash" | "ecocash" = body.payment_method;
  const time: Date = body.time;
  const reference: string = body.reference;
  const current_amount: number = body.current_amount;

  const burundiTime = convertToBurundiTime(time);
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: recipientNumber,
      body:
        language === "en"
          ? `💸💵You have received a donation of ${currency}.${formatAmount(
              amount,
              "en"
            )} from ${name} (${donation_number}) to your campaign "${title}".
Here are the details of the donation:

- Payment method: ${payment_method}
- Time: ${burundiTime}
- Reference: ${reference}
- Total amount raised: ${currency}.${formatAmount(current_amount, "en")}`
          : `💸💵Vous avez reçu un don de ${formatAmount(
              amount,
              "fr"
            )}.${currency.replace(
              "BIF",
              "FBU"
            )} de la part de ${name} (${donation_number}) pour votre campagne "${title}".
Voici les détails du don :

Mode de paiement : ${payment_method}
Heure : ${burundiTime}
Référence : ${reference}
Montant total collecté : ${formatAmount(
              current_amount,
              "fr"
            )}.${currency.replace("BIF", "FBU")}`,
    }),
  };

  await fetch("https://gate.whapi.cloud/messages/text", options)
    .then((response) =>
      response.json().then((data: any) => {
        if (data.error) {
          console.error(
            "Error trying to send the whatsapp donation message to the organizer."
          );
        }
      })
    )
    .catch((err) => {
      console.error(err);
    });

  return new NextResponse();
}

function convertToBurundiTime(date: Date): string {
  // Create a new Date object to avoid modifying the original date
  const newDate = new Date(date);
  const adjustedDate = new Date(
    newDate.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
  );

  const day = String(adjustedDate.getDate()).padStart(2, "0");
  const month = String(adjustedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = adjustedDate.getFullYear();
  const hours = String(adjustedDate.getHours()).padStart(2, "0");
  const minutes = String(adjustedDate.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Import necessary types and functions
import { formatAmount } from "@/utils/formatCurrency";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  const supabase = CreateServerClient();
  const body = await request.json();
  const groupId: string = body.group_id;
  const language: string = body.language;
  const campaignId: number = body.campaign_id;
  const name: string = body.name;
  const isDonorAnonymous: boolean = body.is_donor_anonymous;
  const title: string = body.title;
  const amount: number = body.amount;
  const currency: "BIF" | "RWF" | "USD" | "KSH" = body.currency;
  const currentAmount: number = body.current_amount;
  const targetAmount: number = body.target_amount;

  const { data, error } = await supabase
    .from("donations")
    .select(
      `id,
      campaign_id,
      donor_name,
      is_donor_anonymous,
      amount,
      currency,
      transaction_date_and_time`
    )
    .eq("campaign_id", campaignId)
    .eq("status", "received")
    .order("transaction_date_and_time", { ascending: false })
    .returns<returnedType>();

  if (error) {
    throw new Error(error.message);
  }

  if (data.length > 0) {
    let currentDate: string;
    let formattedData = "";

    const anonymous =
      language === "en" ? "Anonymous Donor" : "Donateur Anonyme";
    data.slice(0, 25).forEach((donation) => {
      const formatedAmount =
        language === "en"
          ? donation.currency + "." + formatAmount(donation.amount, "en")
          : formatAmount(donation.amount, "fr") +
            "." +
            donation.currency.replace("BIF", "FBU");

      const formattedDate = formatDate(donation.transaction_date_and_time);
      if (currentDate !== formattedDate) {
        currentDate = formattedDate;
        formattedData += `\n${currentDate}\n`;
      }
      formattedData +=
        "- " +
        formatTime(donation.transaction_date_and_time) +
        " - " +
        (donation.is_donor_anonymous ? anonymous : donation.donor_name) +
        " - " +
        formatedAmount +
        " ✅" +
        "\n";
    });

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        body:
          language === "en"
            ? `🎉 🎁 ${
                isDonorAnonymous ? "An Anonymous Donor" : name
              } has donated ${currency}.${formatAmount(
                amount,
                "en"
              )} to "${title}". We are now at ${currency}.${formatAmount(
                currentAmount,
                "en"
              )}, on our way to reaching our target of ${currency}.${formatAmount(
                targetAmount,
                "en"
              )}

Want to help us reach our target? Donate now at  bigega.com/${campaignId}.
    
Here's the latest update:
${formattedData}
${
  data.length > 25
    ? data.length - 25 + " other people donated."
    : "End of the list."
}

If you have any problems or would wish to give us feedback, please tell us in private message.`
            : `🎉 🎁 ${
                isDonorAnonymous ? "Un Donateur Anonyme" : name
              } a fait un don de ${formatAmount(
                amount,
                "fr"
              )}.${currency.replace(
                "BIF",
                "FBU"
              )} pour la campagne "${title}". Nous sommes maintenant à ${formatAmount(
                currentAmount,
                "fr"
              )}.${currency.replace(
                "BIF",
                "FBU"
              )}, en route vers notre objectif de ${formatAmount(
                targetAmount,
                "fr"
              )}.${currency.replace("BIF", "FBU")}.

Aidez nous à atteindre notre objectif en faisant un don maintenant sur bigega.com/${campaignId}.

Voici la dernière mise à jour:
${formattedData}
${
  data.length > 25
    ? data.length - 25 + " autre(s) personne(s) ont(a) contribué(s)."
    : "Fin de la liste."
}

Si vous avez des problèmes ou si vous souhaitez nous donner des retours, veuillez nous écrire en privé.`,
      }),
    };

    await fetch("https://gate.whapi.cloud/messages/text", options)
      .then((response) =>
        response.json().then((data: any) => {
          if (data.error) {
            console.error(
              "Error trying to send the whatsapp donation message to the group."
            );
          }
        })
      )
      .catch((err) => {
        console.error(err);
      });
  }

  return new NextResponse();
}

type returnedType = [
  {
    id: number;
    campaign_id: number;
    donor_name: string;
    is_donor_anonymous: boolean;
    amount: number;
    currency: "BIF" | "RWF";
    transaction_date_and_time: Date;
  }
];

function convertToBurundiTime(date: Date): Date {
  // Create a new Date object to avoid modifying the original date
  const newDate = new Date(date);
  const adjustedDate = new Date(
    newDate.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
  );
  return adjustedDate;
}

// Function to format date
function formatDate(date: Date) {
  const burundiTime = convertToBurundiTime(date);
  const day = String(burundiTime.getDate()).padStart(2, "0");
  const month = String(burundiTime.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = burundiTime.getFullYear();
  return `${day}/${month}/${year}`;
}

// Function to format time
function formatTime(time: Date) {
  const burundiTime = convertToBurundiTime(time);
  const hours = String(burundiTime.getHours()).padStart(2, "0");
  const minutes = String(burundiTime.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

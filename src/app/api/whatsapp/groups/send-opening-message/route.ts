// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  const body = await request.json();
  const campaignTitle: string = body.title;
  const campaignLink: string = body.link;
  const organizerWhatsappNumber: string = body.organizer_whatsapp_number;
  const groupId: string = body.group_id;
  const language: string = body.language;

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
          ? `👋😃 Hello everyone, 
@${organizerWhatsappNumber}  has just created a new fundraising campaign titled "${campaignTitle}".

Make a donation here: ${campaignLink} and support the cause.

We will be sending continuous updates and notifications here when donations are received.`
          : `👋😃 Bonjour à tous, 
@${organizerWhatsappNumber} vient de créer une nouvelle campagne de collecte de fonds intitulée "${campaignTitle}".

Faites un don ici : ${campaignLink} et soutenez la cause.

Nous enverrons des mises à jour et des notifications continues ici lorsque des dons seront reçus.`,
    }),
  };

  await fetch("https://gate.whapi.cloud/messages/text", options)
    .then((response) =>
      response.json().then((data: any) => {
        if (data.error) {
          console.error("Error trying to send the whatsapp message.");
        }
      })
    )
    .catch((err) => {
      console.error(err);
    });

  return new NextResponse();
}

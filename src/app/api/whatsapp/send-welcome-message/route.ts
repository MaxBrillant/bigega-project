// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  const body = await request.json();
  const campaignTitle: string = body.title;
  const campaignLink: string = body.link;
  const organizerName: string = body.name;
  const recipientNumber: string = body.recipient_number.replaceAll("+", "");
  const language: string = body.language;

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
          ? `👋Hello ${organizerName}, 

your campaign "${campaignTitle}" has been successfully created and you are ready to start collecting donations.
We will send updates and notifications of future donations here.

You can see your donation page at ${campaignLink} and share it with friends.

My name is Max from the Bigega team, and you can report any issues or or give feedback here, we will be happy to work on them.

The collected funds will be sent to your Ecocash number twice a week, on Tuesday and Friday. For Lumicash, the money will be sent on the 20th or shortly after, depending on when Lumitel releases the funds. We are continuously requesting for faster and earlier payouts.

Thank you for your trust, 
The Bigega team.`
          : `👋Bonjour ${organizerName},

Votre campagne "${campaignTitle}" a été créée avec succès et vous êtes prêt à commencer à collecter des dons.
Nous enverrons des mises à jour et des notifications des futurs dons ici.

Vous pouvez voir votre page de dons à ${campaignLink} et la partager avec vos amis.

Je m'appelle Max de l'équipe Bigega, et vous pouvez signaler tout problème ou donner votre avis ici, nous serons heureux de les traiter.

Les fonds collectés seront envoyés à votre numéro Ecocash deux fois par semaine, le mardi et le vendredi. Pour Lumicash, l'argent sera envoyé le 20 ou peu après, en fonction de la date de libération des fonds par Lumitel. Nous demandons continuellement des paiements plus rapides de la part de Lumitel.

Nous vous remercions pour votre confiance,
L'équipe Bigega.`,
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

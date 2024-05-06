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

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: recipientNumber,
      media:
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWRtZGhwazBhZzY2ZTh1dWxuYW5ram83MWJlNjY0MmJqem04NW9iZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XD9o33QG9BoMis7iM4/giphy.mp4",
      autoplay: true,
      caption: `Hello ${organizerName}, your campaign "${campaignTitle}" has been successfully created and you are ready to start collecting donations.
We will send updates and notifications of future donations here.
You can see your donation page at ${campaignLink} and share it with friends.
My name is Max from the Bigega team, and you can report any issues or feedback here, we will be happy to work on them.
Thank you for your trust, 
The Bigega team.`,
    }),
  };

  await fetch("https://gate.whapi.cloud/messages/gif", options)
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

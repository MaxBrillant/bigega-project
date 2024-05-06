// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  const recipientNumber: string = await request
    .json()
    .then((data) => data.recipient_number);

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
      caption: "Someone just made a donation to your campaign",
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

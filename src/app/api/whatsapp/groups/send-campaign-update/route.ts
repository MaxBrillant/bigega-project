// Import necessary types and functions
import { supabase } from "@/app/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  const body = await request.json();
  const groupId: string = body.group_id;
  const language: string = body.language;
  const campaignId: number = body.campaign_id;
  const name: string = body.name;
  const isDonorAnonymous: boolean = body.is_donor_anonymous;
  const title: string = body.title;
  const amount: number = body.amount;
  const currency: "BIF" | "RWF" = body.currency;
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

    data.slice(0, 25).forEach((donation, index) => {
      const formattedDate = formatDate(donation.transaction_date_and_time);
      if (currentDate !== formattedDate) {
        currentDate = formattedDate;
        formattedData += `${currentDate}\n`;
      }
      formattedData +=
        data.length -
        index +
        ". " +
        formatTime(donation.transaction_date_and_time) +
        " - " +
        (donation.is_donor_anonymous ? "Anonymous" : donation.donor_name) +
        " - " +
        donation.currency +
        "." +
        donation.amount +
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
        media:
          "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWRtZGhwazBhZzY2ZTh1dWxuYW5ram83MWJlNjY0MmJqem04NW9iZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XD9o33QG9BoMis7iM4/giphy.mp4",
        autoplay: true,
        caption: `New donation of ${currency}.${amount} received from ${
          isDonorAnonymous ? "an Anonymous Donor" : name
        } to the campaign "${title}". The total amount raised so far is ${currentAmount}, from the target of ${targetAmount}.
Donate now by going to bigega.com/${campaignId}
      
Here are the latest donations: 
${formattedData}
${
  data.length > 25
    ? data.length - 25 + " other people donated."
    : "End of the list"
}`,
      }),
    };

    await fetch("https://gate.whapi.cloud/messages/gif", options)
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

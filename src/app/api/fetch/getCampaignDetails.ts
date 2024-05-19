"use server";

import { CreateServerClient } from "@/utils/supabase/serverClient";
import { notFound } from "next/navigation";

type returnedType = [
  {
    id: number;
    title: string;
    category:
      | "wedding"
      | "funerals"
      | "gift"
      | "event"
      | "medical"
      | "emergency"
      | "business"
      | "family"
      | "education"
      | "travel"
      | "other";
    description: string | undefined;
    country: "burundi" | "rwanda";
    target_amount: number;
    current_amount: number;
    number_of_donations: number;
    lumicash_number: string | undefined;
    ecocash_number: string | undefined;
    // mtn_momo_number: string | undefined;
    whatsapp_group_link: string;
    organizers: {
      full_name: string;
    };
  }
];

type campaignType = {
  id: number;
  title: string;
  category:
    | "wedding"
    | "funerals"
    | "gift"
    | "event"
    | "medical"
    | "emergency"
    | "business"
    | "family"
    | "education"
    | "travel"
    | "other";
  description: string | undefined;
  country: "burundi" | "rwanda";
  targetAmount: number;
  currentAmount: number;
  numberOfDonations: number;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
  //   mtnMomoNumber: string | undefined;
  whatsappGroupLink: string;
  organizerName: string;
};

export async function GetCampaignDetails(campaignId: number) {
  const supabase = CreateServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `id,
      title,
        category,
        description,
        country,
        target_amount,
        current_amount,
        number_of_donations,
        lumicash_number,
        ecocash_number,
        whatsapp_group_id,
        whatsapp_group_link,
        language_of_communication,
        organizers (id, full_name)`
    )
    .eq("id", campaignId)
    .eq("status", "open")
    .limit(1)
    .returns<returnedType>();

  if (error) {
    throw new Error(error.message);
  }
  if (data.length < 1) {
    notFound();
  }
  // revalidatePath("/" + data[0].id);

  return {
    id: data[0].id,
    title: data[0].title,
    category: data[0].category,
    description: data[0].description,
    country: data[0].country,
    targetAmount: data[0].target_amount,
    currentAmount: data[0].current_amount,
    numberOfDonations: data[0].number_of_donations,
    lumicashNumber: data[0].lumicash_number,
    ecocashNumber: data[0].ecocash_number,
    whatsappGroupLink: data[0].whatsapp_group_link,
    organizerName: data[0].organizers.full_name,
  } as campaignType;
}

"use server";

import { CreateOrganiser } from "./createOrganiser";
import {
  CampaignSchema,
  PaymentDetailsSchema,
} from "@/app/validation/campaignFormValidation";
import { headers } from "next/headers";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { getDictionary } from "@/dictionaries/getDictionary";
import { randomUUID } from "crypto";

type props = {
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
  coverPhoto: FormData | undefined;
  country: "burundi" | "rwanda";
  targetAmount: number;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
  mtnMomoNumber: string | undefined;
  languageOfCommunication: "en" | "fr" | "bi" | "rw";

  organizerName: string;
  organizerWhatsappNumber: string;
};

type returnedData = [
  {
    id: number;
  }
];

const supabase = CreateServerClient();
export async function CreateCampaign(formData: props) {
  //TODO: Validate this shit

  const dict = await getDictionary();
  const campaignSchema = CampaignSchema(dict?.start)
    .omit({ coverPhoto: true })
    .and(PaymentDetailsSchema(dict));

  try {
    campaignSchema.parse(formData);

    let filePath: string | undefined;
    if (formData.coverPhoto) {
      const coverPhoto = formData.coverPhoto.getAll("cover")[0] as Blob;
      const fileName = randomUUID();

      const { data: fileData, error: fileError } = await supabase.storage
        .from("bigega-resources")
        .upload(
          `cover-photos/${fileName}.${coverPhoto.type
            .split("/")[1]
            .toLowerCase()}`,
          coverPhoto,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (fileError) {
        throw new Error(
          `Error while uploading cover photo of the campaign of title: "${formData.title}": The error is: "${fileError.message}"`
        );
      }
      filePath =
        "https://vsxvyxxqacrabqatnddx.supabase.co/storage/v1/object/public/bigega-resources/" +
        fileData?.path;
    }
    const organizerId = await CreateOrganiser({
      organizerName: formData.organizerName,
      organizerWhatsappNumber: formData.organizerWhatsappNumber,
    });

    let campaignId;
    let isUsed = true;

    while (isUsed) {
      const newId = await generateUniqueCampaignId();
      isUsed = await isCampaignIdUsed(newId);

      if (!isUsed) {
        campaignId = newId;
      }
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        id: campaignId,
        organizer_id: organizerId,
        title: formData.title,
        category: formData.category,
        description:
          formData.description != undefined ? formData.description : null,
        cover_photo_url: filePath,
        country: formData.country,
        target_amount: formData.targetAmount,
        ecocash_number:
          formData.ecocashNumber != undefined ? formData.ecocashNumber : null,
        lumicash_number:
          formData.lumicashNumber != undefined ? formData.lumicashNumber : null,
        mtn_momo_number:
          formData.mtnMomoNumber != undefined ? formData.mtnMomoNumber : null,
        language_of_communication: formData.languageOfCommunication,
      })
      .select()
      .limit(1)
      .returns<returnedData>();

    if (error) {
      throw new Error(
        `Error while creating the campaign of title: "${formData.title}": The error is: "${error.message}"`
      );
    }

    console.log(
      `The campaign of title: "${formData.title}" and ID: "${data[0].id}" has been successfully created`
    );
    await sendCampaignCreationMessages({
      campaignId: data[0].id,
      campaignTitle: formData.title,
      organizerName: formData.organizerName,
      organizerWhatsappNumber: formData.organizerWhatsappNumber,
      languageOfCommunication: formData.languageOfCommunication,
    });
    return data[0].id;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Error while creating the campaign of title: "${formData.title}": The error is: "${error}"`
    );
  }
}

async function generateUniqueCampaignId() {
  // Generate a UUID
  const { v4: uuidv4 } = require("uuid");
  const uuid = uuidv4();

  // Extract the last 6 characters of the UUID
  const lastSixChars = uuid.slice(-6);

  // Convert the extracted characters to a decimal number
  const id = parseInt(lastSixChars, 16);

  return parseInt(String(id).substring(0, 6));
}

// Function to check if the ID exists in the database
async function isCampaignIdUsed(id: number): Promise<boolean> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", id)
    .limit(1);

  if (error) {
    console.error("Error checking if ID is used:", error.message);
    return false;
  }

  return data.length > 0;
}

type messageProps = {
  campaignId: number;
  campaignTitle: string;
  organizerName: string;
  organizerWhatsappNumber: string;
  languageOfCommunication: "en" | "fr" | "bi" | "rw";
};
async function sendCampaignCreationMessages(message: messageProps) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname");
  const origin = new URL(pathname as string).origin.replaceAll("https", "http");
  const id = message.campaignId;
  const link = "bigega.com/" + id;

  await fetch(origin + "/api/whatsapp/send-welcome-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: message.campaignTitle,
      link: link,
      name: message.organizerName,
      recipient_number: message.organizerWhatsappNumber,
      language: message.languageOfCommunication,
    }),
  });
}

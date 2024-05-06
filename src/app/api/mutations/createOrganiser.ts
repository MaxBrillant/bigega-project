"use server";

import { supabase } from "@/app/supabaseClient";

type props = {
  organizerName: string;
  organizerWhatsappNumber: string;
};
type returnedData = [
  {
    id: number;
  }
];
export async function CreateOrganiser(formData: props) {
  const { data, error } = await supabase
    .from("organizers")
    .upsert(
      {
        whatsapp_number: formData.organizerWhatsappNumber,
        full_name: formData.organizerName,
      },
      { onConflict: "whatsapp_number" }
    )
    .select()
    .limit(1)
    .returns<returnedData>();

  if (error) {
    throw new Error(
      `Error while creating or updating information of organizer: "${formData.organizerName}": The error is: "${error.message}"`
    );
  }
  console.log(
    `The information of organizer: "${formData.organizerName}" and ID: "${data[0].id}" has been successfully updated`
  );
  return data[0].id;
}

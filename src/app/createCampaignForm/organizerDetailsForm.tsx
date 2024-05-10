"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OrganizerDetailsSchema } from "../validation/campaignFormValidation";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useContext, useTransition } from "react";
import CampaignFormContext from "./formContext";
import { CreateCampaign } from "../api/mutations/createCampaign";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

type detailsType = z.infer<typeof OrganizerDetailsSchema>;
export default function OrganizerDetailsForm() {
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(OrganizerDetailsSchema),
  });

  const listOfErrors = Object.values(errors).map((error) => error);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: detailsType) =>
    startTransition(async () => {
      try {
        const response = await CreateCampaign({
          title: formState.title as string,
          category:
            formState.category != undefined ? formState.category : "other",
          description: formState.description,
          country: formState.country as "burundi" | "rwanda",
          targetAmount: formState.targetAmount as number,
          ecocashNumber: formState.ecocashNumber,
          lumicashNumber: formState.lumicashNumber,
          mtnMomoNumber: formState.mtnMomoNumber,
          whatsappGroupId: formState.whatsappGroupId as string,
          whatsappGroupLink: formState.whatsappGroupLink as string,
          languageOfCommunication: formState.languageOfCommunication as
            | "en"
            | "fr"
            | "bi"
            | "rw",
          organizerName: data.organizerName,
          organizerWhatsappNumber: data.organizerWhatsappNumber,
        });

        if (response) {
          toast({
            variant: "default",
            title: `The "${formState.title}" campaign has been successfully created`,
            duration: 3000,
          });
        }
      } catch (e) {
        toast({
          variant: "destructive",
          title: `Something went wrong while creating the "${formState.title}" campaign`,
          action: (
            <ToastAction onClick={() => onSubmit(data)} altText="Try again">
              Try again
            </ToastAction>
          ),
          duration: 7000,
        });
      }
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      action={""}
      className="flex flex-col gap-5"
    >
      <div>
        <p>What is your name</p>
        <Input {...register("organizerName")} placeholder="Max Brillant" />
      </div>
      <div>
        <p>Write your Whatsapp number</p>
        <PhoneInput
          defaultCountry={formState.country === "burundi" ? "bi" : "rw"}
          value={watch("organizerWhatsappNumber")}
          onChange={(phone) => setValue("organizerWhatsappNumber", phone)}
        />
      </div>

      {listOfErrors.length > 0 && (
        <div className="flex flex-col bg-red-500 text-white p-3 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Loading..." : "Create Campaign"}
      </Button>
    </form>
  );
}

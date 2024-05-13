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
import { Separator } from "@/components/ui/separator";

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
    mode: "onChange",
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
      className="flex flex-col gap-5 p-5 mt-3 mb-7 bg-background border border-slate-300 rounded-2xl"
    >
      <p className="font-semibold text-2xl text-heading">
        Before we can create your campaign, tell us a little bit about yourself.
      </p>
      <div className="space-y-1">
        <p className="font-semibold text-lg">What is your name?</p>
        <Input {...register("organizerName")} placeholder="Jean Iradukunda" />
      </div>

      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">What is your Whatsapp number?</p>
        <p className="font-medium text-sm text-black/80">
          This is very important. We will use it to send you notifications and
          updates on the donations that you will receive.
        </p>
        <PhoneInput
          defaultCountry={formState.country === "burundi" ? "bi" : "rw"}
          value={watch("organizerWhatsappNumber")}
          onChange={(phone) => setValue("organizerWhatsappNumber", phone)}
        />
      </div>

      {listOfErrors.length > 0 && (
        <div className="flex flex-col p-3 bg-red-200 text-red-700 border border-red-700 rounded-2xl">
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

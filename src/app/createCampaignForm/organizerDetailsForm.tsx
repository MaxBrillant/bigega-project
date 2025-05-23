"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OrganizerDetailsSchema } from "../validation/campaignFormValidation";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useContext, useState, useTransition } from "react";
import CampaignFormContext from "./formContext";
import { CreateCampaign } from "../api/mutations/createCampaign";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Separator } from "@/components/ui/separator";
import Share from "../components/share";
import Confetti from "react-confetti";

type props = {
  dictionary: any;
};

export default function OrganizerDetailsForm(form: props) {
  const schema = OrganizerDetailsSchema(form.dictionary);
  type detailsType = z.infer<typeof schema>;
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(OrganizerDetailsSchema(form.dictionary)),
    mode: "onChange",
  });
  const [newCampaignId, setNewCampaignId] = useState<number | undefined>();

  const listOfErrors = Object.values(errors).map((error) => error);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const dict = form.dictionary;
  const onSubmit = (data: detailsType) =>
    startTransition(async () => {
      try {
        const campaignId = await CreateCampaign({
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

        if (campaignId) {
          setNewCampaignId(campaignId);
          toast({
            variant: "default",
            title: dict.organizer.success.replace("$title", formState.title),
            duration: 3000,
          });
        }
      } catch (e) {
        toast({
          variant: "destructive",
          title: dict.organizer.error.replace("$title", formState.title),
          action: (
            <ToastAction onClick={() => onSubmit(data)} altText="Try again">
              {dict.organizer.try}
            </ToastAction>
          ),
          duration: 7000,
        });
      }
    });

  return !newCampaignId ? (
    <form
      onSubmit={handleSubmit(onSubmit)}
      action={""}
      className="flex flex-col gap-5 p-5 mt-3 mb-7 bg-background border border-slate-300 rounded-2xl"
    >
      <p className="font-semibold text-2xl text-heading">
        {dict.organizer.heading}
      </p>
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.organizer.name}</p>
        <Input {...register("organizerName")} placeholder="Arsene Nduwayo" />
      </div>

      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.organizer.whatsapp}</p>
        <p className="font-medium text-sm text-black/80">
          {dict.organizer.notice}
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
        {isPending ? dict.global.loading : dict.organizer.create_campaign}
      </Button>
    </form>
  ) : (
    <div className="space-y-5">
      <Confetti recycle={false} className="w-full h-full" />
      <p className="font-semibold text-2xl text-heading">
        {dict.organizer.success_heading}
      </p>
      <p className="font-medium">{dict.organizer.success_notice}</p>
      <Share url={"bigega.com/" + newCampaignId} dictionary={dict} />
    </div>
  );
}

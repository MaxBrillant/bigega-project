"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext, useState, useTransition } from "react";
import { WhatsappGroupDetailsSchema } from "../validation/campaignFormValidation";
import CampaignFormContext from "./formContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import OrganizerDetailsForm from "./organizerDetailsForm";
import { Separator } from "@/components/ui/separator";

type props = {};
type detailsType = z.infer<typeof WhatsappGroupDetailsSchema>;
export default function WhatsappGroupDetailsForm(form: props) {
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(WhatsappGroupDetailsSchema),
    mode: "onChange",
  });
  const [selectedLanguageOfCommunication, setSelectedLanguageOfCommunication] =
    useState<"en" | "fr" | "bi" | "rw" | undefined>(
      formState.languageOfCommunication
    );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const listOfErrors = Object.values(errors).map((error) => error);

  const onSubmit = (data: detailsType) =>
    startTransition(async () => {
      setFormState((prevState) => ({
        ...prevState,
        whatsappGroupLink: data.whatsappGroupLink,
        languageOfCommunication: data.languageOfCommunication,
      }));

      if (!isDialogOpen) {
        const response = await fetch("/api/whatsapp/groups/accept-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invite_code: data.whatsappGroupLink.split("/").pop(),
          }),
        });
        if (response.status !== 200) {
          toast({
            variant: "destructive",
            title:
              "Uh oh! Something went wrong while trying to join the Whatsapp group.",
          });
        } else {
          const groupId: string = await response
            .json()
            .then((data) => data.groupId);
          setFormState((prevState) => ({
            ...prevState,
            whatsappGroupId: groupId,
          }));
          setIsDialogOpen(true);
        }
      }
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      action={""}
      className="flex flex-col gap-5 p-5 mb-7 bg-background border border-slate-300 rounded-2xl"
    >
      <div className="space-y-1">
        <p className="font-semibold text-lg">Whatsapp Group Link</p>
        <Input
          defaultValue={formState.whatsappGroupLink}
          {...register("whatsappGroupLink")}
          placeholder="Paste your Whatsapp group link here"
        />
        <p className="font-medium text-sm text-black/80">
          To get the group link, do this:
          <br />
          1. Open the WhatsApp group chat, then tap the group name. Make sure
          you are an Admin.
          <br />
          {`2. Go at the bottom, and Tap "Invite via link".`}
          <br />
          {`3. Tap on "Copy link".`}
        </p>
      </div>

      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">
          What language should we use to communicate with you and group members?
        </p>
        <div className="w-full flex flex-wrap gap-2">
          {["en", "fr", "bi"].map((language) => {
            return (
              <div key={language}>
                <input
                  type="radio"
                  {...register("languageOfCommunication")}
                  className="hidden"
                  value={language}
                  checked={formState.languageOfCommunication === language}
                  id={language}
                />
                <button
                  className={
                    selectedLanguageOfCommunication === language
                      ? "p-3 border border-heading bg-highlight rounded-3xl"
                      : "p-3 border border-slate-400 rounded-3xl"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    document?.getElementById(language)?.click();
                    setSelectedLanguageOfCommunication(
                      language as "en" | "fr" | "bi" | "rw"
                    );
                  }}
                >
                  {language === "en"
                    ? "English"
                    : language === "fr"
                    ? "Francais"
                    : language === "bi"
                    ? "Kirundi"
                    : "Kinyarwanda"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {listOfErrors.length > 0 && (
        <div className="flex flex-col p-3 bg-red-200 text-red-700 border border-red-700 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <div className="flex flex-row items-center ml-auto mt-5 gap-3">
        <Button variant={"secondary"}>Back</Button>
        <Button type="submit" size={"lg"} disabled={isPending}>
          {isPending ? "Loading..." : "Finish"}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className=" max-h-screen overflow-auto">
          <OrganizerDetailsForm />
        </DialogContent>
      </Dialog>
    </form>
  );
}

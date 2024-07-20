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

type props = {
  goPrevious: () => void;
  dictionary: any;
};
export default function WhatsappGroupDetailsForm(form: props) {
  const schema = WhatsappGroupDetailsSchema(form.dictionary);
  type detailsType = z.infer<typeof schema>;
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(WhatsappGroupDetailsSchema(form.dictionary)),
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

  const dict = form.dictionary;
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
            title: dict.whatsapp.error,
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
        <p className="font-semibold text-lg">{dict.whatsapp.link}</p>
        <Input
          defaultValue={formState.whatsappGroupLink}
          {...register("whatsappGroupLink")}
          placeholder={dict.whatsapp.link_placeholder}
        />
        <p className="font-medium text-sm text-black/80">
          {dict.whatsapp.guide_title}
          <br />
          {dict.whatsapp.step_one}
          <br />
          {dict.whatsapp.step_two}
          <br />
          {dict.whatsapp.step_three}
        </p>
      </div>

      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.whatsapp.language}</p>
        <div className="w-full flex flex-wrap gap-2">
          {["en", "fr"].map((language) => {
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
                    ? "Français"
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
        <Button
          variant={"secondary"}
          onClick={(e) => {
            e.preventDefault();
            form.goPrevious();
          }}
        >
          {dict.global.back}
        </Button>
        <Button type="submit" size={"lg"} disabled={isPending}>
          {isPending ? dict.global.loading : dict.whatsapp.finish}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className=" max-h-screen overflow-auto">
          <OrganizerDetailsForm dictionary={dict} />
        </DialogContent>
      </Dialog>
    </form>
  );
}

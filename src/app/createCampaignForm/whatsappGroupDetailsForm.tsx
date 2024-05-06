"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext, useState } from "react";
import { WhatsappGroupDetailsSchema } from "../validation/campaignFormValidation";
import CampaignFormContext from "./formContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OrganizerDetailsForm from "./organizerDetailsForm";

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
  });
  const [selectedLanguageOfCommunication, setSelectedLanguageOfCommunication] =
    useState<"en" | "fr" | "bi" | "rw" | undefined>(
      formState.languageOfCommunication
    );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();

  const listOfErrors = Object.values(errors).map((error) => error);

  const onSubmit = async (data: detailsType) => {
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
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      action={""}
      className="flex flex-col gap-5"
    >
      <div>
        <p>Whatsapp Group Link</p>
        <Input
          defaultValue={formState.whatsappGroupLink}
          {...register("whatsappGroupLink")}
          placeholder="Paste your Whatsapp group link here"
        />
      </div>

      <div>
        <p>Type of fundraising</p>
        <div className="w-full flex flex-wrap">
          {["en", "fr", "bi", "rw"].map((language) => {
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
                      ? "p-3 bg-slate-300 rounded-3xl"
                      : "p-[11px] border rounded-3xl"
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
        <div className="flex flex-col bg-red-500 text-white p-3 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <Button type="submit">Finish</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <OrganizerDetailsForm />
        </DialogContent>
      </Dialog>
    </form>
  );
}

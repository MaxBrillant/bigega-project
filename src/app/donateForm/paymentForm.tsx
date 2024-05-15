"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { DonationSchema } from "../validation/donationFormValidation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InitiateDonation, getOTP } from "../api/mutations/initiateDonation";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import ConfirmationPopup from "../components/paymentConfirmation";

type props = {
  id: number;
  title: string;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
  whatsappGroupLink: string;
};
type formSchemaType = z.infer<typeof DonationSchema>;
export default function PaymentForm(form: props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formSchemaType>({
    resolver: zodResolver(DonationSchema),
    mode: "onChange",
  });

  const [selectedMethod, setSelectedMethod] = useState<
    "lumicash" | "ecocash" | undefined
  >();

  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);

  const listOfErrors = Object.values(errors).map((error) => error);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: formSchemaType) =>
    startTransition(async () => {
      if (data.lumicashNumber != undefined && data.otp == undefined) {
        try {
          const response = await getOTP(data.amount, data.lumicashNumber);
          if (response) {
            setIsOtpRequired(true);
          }
        } catch (error) {
          setIsOtpRequired(false);
          setValue("otp", undefined);
          toast({
            variant: "destructive",
            title: `Error while trying to get the code from Lumicash, please try again`,
            duration: 7000,
          });
        }
      } else {
        try {
          const response = await InitiateDonation({
            campaignId: form.id,
            amount: data.amount,
            ecocashNumber: data.ecocashNumber,
            lumicashNumber: data.lumicashNumber,
            donorName: data.donorName,
            isDonorAnonymous: data.isDonorAnonymous,
            otp: data.otp,
          });

          if (response) {
            setIsOtpRequired(false);
            setValue("otp", undefined);
            setIsWaitingForConfirmation(true);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: data.lumicashNumber
              ? `The payment could not be sent. Make sure that the code is valid, that you have enough balance or that your phone number is correct`
              : `The payment could not be sent. Make sure you have enough balance or that your phone number is correct`,
            duration: 7000,
          });
        }
      }
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 mx-3 p-5 mt-3 mb-7 bg-background border border-slate-300 rounded-2xl"
    >
      <div className="space-y-3">
        <p className="font-semibold text-lg">Choose a Payment Method</p>

        <div className="divide-y divide-heading overflow-hidden border border-heading rounded-2xl">
          <button
            className={
              selectedMethod === "ecocash"
                ? "w-full flex flex-row gap-5 items-center p-4 bg-highlight"
                : "w-full flex flex-row gap-3 items-center p-4"
            }
            onClick={(e) => {
              e.preventDefault();
              if (selectedMethod !== "ecocash") {
                document?.getElementById("ecocash")?.click();
              } else {
                document?.getElementById("ecocash-number")?.focus();
              }
            }}
          >
            <input
              type="radio"
              value="ecocash"
              id="ecocash"
              checked={selectedMethod === "ecocash"}
              className="hidden"
              onClick={() => {
                setSelectedMethod("ecocash");
                setValue("lumicashNumber", undefined);
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                if (selectedMethod !== "ecocash") {
                  document?.getElementById("ecocash")?.click();
                } else {
                  document?.getElementById("ecocash-number")?.focus();
                }
              }}
            >
              <Image
                src={"/ecocash.jpg"}
                width={250}
                height={75}
                alt="ecocash"
                className="w-36 object-contain h-fit mx-auto rounded-lg border border-slate-500"
              />
            </button>
            {selectedMethod === "ecocash" && (
              <Input
                type="number"
                {...register("ecocashNumber", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                id="ecocash-number"
                placeholder="71002024"
                autoFocus
                className="w-36 text-lg bg-white"
              />
            )}
          </button>

          <button
            className={
              selectedMethod === "lumicash"
                ? "w-full flex flex-row gap-5 items-center p-4 bg-highlight"
                : "w-full flex flex-row gap-3 items-center p-4"
            }
            onClick={(e) => {
              e.preventDefault();
              if (selectedMethod !== "lumicash") {
                document?.getElementById("lumicash")?.click();
              } else {
                document?.getElementById("lumicash-number")?.focus();
              }
            }}
          >
            <input
              type="radio"
              value="lumicash"
              id="lumicash"
              checked={selectedMethod === "lumicash"}
              className="hidden"
              onClick={() => {
                setSelectedMethod("lumicash");
                setValue("ecocashNumber", undefined);
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                if (selectedMethod !== "lumicash") {
                  document?.getElementById("lumicash")?.click();
                } else {
                  document?.getElementById("lumicash-number")?.focus();
                }
              }}
            >
              <Image
                src={"/lumicash.jpg"}
                width={250}
                height={75}
                alt="lumicash"
                className="w-36 object-contain h-fit mx-auto rounded-lg border border-slate-500"
              />
            </button>
            {selectedMethod === "lumicash" && (
              <Input
                type="number"
                {...register("lumicashNumber", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                id="lumicash-number"
                placeholder="62002024"
                autoFocus
                className="w-36 text-lg bg-white"
              />
            )}
          </button>
        </div>
      </div>
      {selectedMethod && !errors.ecocashNumber && !errors.lumicashNumber && (
        <Separator />
      )}
      {selectedMethod && !errors.ecocashNumber && !errors.lumicashNumber && (
        <div className="space-y-1">
          <p className="font-semibold text-lg">
            How much do you wish to donate?
          </p>
          <div className="w-full flex flex-row py-2 items-center gap-3">
            <p className="text-lg">BIF</p>
            <Input
              type="number"
              className="py-6 text-3xl"
              {...register("amount", {
                valueAsNumber: true,
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
              placeholder="0.00"
            />
          </div>
        </div>
      )}
      {watch("amount") > 0 &&
        !errors.amount &&
        selectedMethod &&
        !errors.ecocashNumber &&
        !errors.lumicashNumber && <Separator />}
      {watch("amount") > 0 &&
        !errors.amount &&
        selectedMethod &&
        !errors.ecocashNumber &&
        !errors.lumicashNumber && (
          <div className="space-y-1">
            <p className="font-semibold text-lg">What is your name?</p>
            <Input {...register("donorName")} placeholder="Jacques Niyongabo" />

            <div className="flex flex-row gap-2 pt-2">
              <input
                {...register("isDonorAnonymous")}
                type="checkbox"
                id="hide"
                className="w-4 h-4 mt-1"
              />
              <p
                className="text-sm"
                onClick={() => document?.getElementById("hide")?.click()}
              >
                Hide my name (only organizers will be able to see your name)
              </p>
            </div>
          </div>
        )}

      {listOfErrors.length > 0 && (
        <div className="flex flex-col p-3 bg-red-200 text-red-700 border border-red-700 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <Button
        type="submit"
        disabled={
          isPending ||
          watch("amount") === 0 ||
          errors.amount != undefined ||
          errors.ecocashNumber != undefined ||
          errors.lumicashNumber != undefined ||
          !watch("donorName")
        }
      >
        {isPending ? "Loading..." : "Donate"}
      </Button>

      {isWaitingForConfirmation && (
        <ConfirmationPopup
          paymentMethod={selectedMethod as string}
          whatsappGroupLink={form.whatsappGroupLink}
        />
      )}

      <Dialog
        open={isOtpRequired}
        onOpenChange={() => {
          if (isOtpRequired) {
            setIsOtpRequired(false);
            setValue("otp", undefined);
          } else {
            setIsOtpRequired(true);
          }
        }}
      >
        <DialogContent className="space-y-3">
          <p className="font-semibold text-2xl text-heading">
            Lumicash has sent you a verification code via SMS
          </p>
          <div>
            <p className="font-medium text-center mx-auto,">
              Write the code here
            </p>
            <Input
              type="number"
              {...register("otp", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
              autoFocus
              className="mx-auto w-48 text-center py-6 text-3xl"
            />
          </div>
          {listOfErrors.length > 0 && (
            <div className="flex flex-col p-3 bg-red-200 text-red-700 border border-red-700 rounded-2xl">
              {listOfErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </div>
          )}
          <Button
            type="button"
            onClick={() =>
              onSubmit({
                amount: watch("amount"),
                ecocashNumber: watch("ecocashNumber"),
                lumicashNumber: watch("lumicashNumber"),
                donorName: watch("donorName"),
                isDonorAnonymous: watch("isDonorAnonymous"),
                otp: watch("otp"),
              })
            }
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Donate"}
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}

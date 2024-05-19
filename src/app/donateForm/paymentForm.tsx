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
import { ImRadioUnchecked } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";

type props = {
  id: number;
  title: string;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
  whatsappGroupLink: string;
  dictionary: any;
};
export default function PaymentForm(form: props) {
  const schema = DonationSchema(form.dictionary);
  type formSchemaType = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formSchemaType>({
    resolver: zodResolver(DonationSchema(form.dictionary)),
    mode: "onChange",
  });

  const [selectedMethod, setSelectedMethod] = useState<
    "lumicash" | "ecocash" | undefined
  >();

  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);

  const [newDonationId, setNewDonationId] = useState<number | undefined>();

  const listOfErrors = Object.values(errors).map((error) => error);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const dict = form.dictionary;

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
            title: dict.form.otp_error,
            duration: 7000,
          });
        }
      } else {
        try {
          const donationId = await InitiateDonation({
            campaignId: form.id,
            amount: data.amount,
            ecocashNumber: data.ecocashNumber,
            lumicashNumber: data.lumicashNumber,
            donorName: data.donorName,
            isDonorAnonymous: data.isDonorAnonymous,
            otp: data.otp,
          });

          if (donationId) {
            setIsOtpRequired(false);
            setValue("otp", undefined);
            setNewDonationId(donationId);
            setIsWaitingForConfirmation(true);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: data.lumicashNumber
              ? dict.form.lumicash_error
              : dict.form.other_error,
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
        <p className="font-semibold text-lg">{dict.form.heading}</p>

        <div className="divide-y divide-heading overflow-hidden border border-heading rounded-2xl">
          <button
            className={
              selectedMethod === "ecocash"
                ? "w-full flex flex-wrap gap-3 items-center p-4 bg-highlight"
                : "w-full flex flex-wrap gap-3 items-center p-4"
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
            {selectedMethod === "ecocash" ? (
              <FaCheckCircle
                onClick={() => document?.getElementById("ecocash")?.click()}
                className="w-7 h-7 fill-heading"
              />
            ) : (
              <ImRadioUnchecked
                onClick={() => document?.getElementById("ecocash")?.click()}
                className="w-6 h-6 fill-heading/40"
              />
            )}
            <Image
              src={"/ecocash.png"}
              width={500}
              height={150}
              alt="ecocash"
              className="w-36 object-contain h-fit rounded-lg border border-slate-500"
            />
            {selectedMethod === "ecocash" && (
              <div className="w-full flex flex-row items-center gap-1 justify-evenly">
                <p className="font-medium">{dict.form.number}</p>
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
              </div>
            )}
          </button>

          {form.lumicashNumber && (
            <button
              className={
                selectedMethod === "lumicash"
                  ? "w-full flex flex-wrap gap-3 items-center p-4 bg-highlight"
                  : "w-full flex flex-wrap gap-3 items-center p-4"
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
              {selectedMethod === "lumicash" ? (
                <FaCheckCircle
                  onClick={() => document?.getElementById("lumicash")?.click()}
                  className="w-7 h-7 fill-heading"
                />
              ) : (
                <ImRadioUnchecked
                  onClick={() => document?.getElementById("lumicash")?.click()}
                  className="w-6 h-6 fill-heading/40"
                />
              )}
              <Image
                src={"/lumicash.png"}
                width={500}
                height={150}
                alt="lumicash"
                className="w-36 object-contain h-fit rounded-lg border border-slate-500"
              />
              {selectedMethod === "lumicash" && (
                <div className="w-full flex flex-row items-center gap-1 justify-evenly">
                  <p className="font-medium">{dict.form.number}</p>
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
                </div>
              )}
            </button>
          )}
        </div>
      </div>
      {selectedMethod && !errors.ecocashNumber && !errors.lumicashNumber && (
        <Separator />
      )}
      {selectedMethod && !errors.ecocashNumber && !errors.lumicashNumber && (
        <div className="space-y-1">
          <p className="font-semibold text-lg">{dict.form.amount}</p>
          <div className="w-full flex flex-row py-2 items-center gap-3">
            {dict.form.currency === "BIF" && (
              <p className="text-lg">{dict.form.currency}</p>
            )}
            <Input
              type="number"
              className="py-6 text-3xl"
              {...register("amount", {
                valueAsNumber: true,
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
              placeholder="0.00"
            />
            {dict.form.currency !== "BIF" && (
              <p className="text-lg">{dict.form.currency}</p>
            )}
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
            <p className="font-semibold text-lg">{dict.form.name}</p>
            <Input {...register("donorName")} placeholder="Arsene Nduwayo" />

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
                {dict.form.anonymous}
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
        {isPending ? dict.global.loading : dict.global.donate}
      </Button>

      {isWaitingForConfirmation && (
        <ConfirmationPopup
          donationId={newDonationId as number}
          paymentMethod={selectedMethod as "lumicash" | "ecocash"}
          whatsappGroupLink={form.whatsappGroupLink}
          dictionary={dict}
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
            {dict.form.otp_heading}
          </p>
          <div>
            <p className="font-medium text-center mx-auto,">{dict.form.otp}</p>
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
            {isPending ? dict.global.loading : dict.global.donate}
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}

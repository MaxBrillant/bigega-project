"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DonationSchema } from "../validation/donationFormValidation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InitiateDonation, getOTP } from "../api/mutations/initiateDonation";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type props = {
  id: number;
  title: string;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
};
type formSchemaType = z.infer<typeof DonationSchema>;
export default function PaymentForm(form: props) {
  const {
    register,
    handleSubmit,
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

  const listOfErrors = Object.values(errors).map((error) => error);

  const { toast } = useToast();

  const onSubmit = async (data: formSchemaType) => {
    if (data.lumicashNumber != undefined && data.otp == undefined) {
      try {
        const response = await getOTP(data.amount, data.lumicashNumber);
        if (response) {
          setIsOtpRequired(true);
        }
      } catch (error) {
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
          toast({
            variant: "default",
            title: `Payment has been sent`,
            duration: 3000,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: `The payment could not be sent. Make sure you have enough balance or that your phone number is correct`,
          duration: 7000,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <p>Select a Payment Method</p>

        {form.lumicashNumber && (
          <div
            className={
              selectedMethod === "lumicash"
                ? "flex flex-row gap-5 items-center p-3 bg-slate-300 rounded-xl"
                : "flex flex-row gap-5 items-center p-[11px] border rounded-xl"
            }
          >
            <input
              type="radio"
              value="lumicash"
              id="lumicash"
              checked={selectedMethod === "lumicash"}
              className="w-7 h-7"
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
              <p>Lumicash</p>
            </button>
            {selectedMethod === "lumicash" && (
              <Input
                type="number"
                {...register("lumicashNumber", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                id="lumicash-number"
                placeholder="62201233"
                autoFocus
                className="w-36 text-lg bg-white"
              />
            )}
          </div>
        )}
        {form.ecocashNumber && (
          <div
            className={
              selectedMethod === "ecocash"
                ? "flex flex-row gap-5 items-center p-3 bg-slate-300 rounded-xl"
                : "flex flex-row gap-5 items-center p-[11px] border rounded-xl"
            }
          >
            <input
              type="radio"
              value="ecocash"
              id="ecocash"
              checked={selectedMethod === "ecocash"}
              className="w-7 h-7"
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
              <p>Ecocash</p>
            </button>
            {selectedMethod === "ecocash" && (
              <Input
                type="number"
                {...register("ecocashNumber", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                id="ecocash-number"
                placeholder="71020135"
                autoFocus
                className="w-36 text-lg bg-white"
              />
            )}
          </div>
        )}
      </div>
      <div>
        <p>Amount</p>
        <Input
          type="number"
          {...register("amount", {
            valueAsNumber: true,
            setValueAs: (value) => (value === "" ? undefined : value),
          })}
          placeholder="BIF 0"
        />
      </div>
      <div>
        <p>Full name</p>
        <Input {...register("donorName")} placeholder="Jacques Niyongabo" />
        <input {...register("isDonorAnonymous")} type="checkbox" id="hide" />
        <label htmlFor="hide">
          Hide my name (only organizers will be able to see your name)
        </label>
      </div>

      {listOfErrors.length > 0 && (
        <div className="flex flex-col bg-red-500 text-white p-3 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <Button type="submit">Donate</Button>

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
        <DialogContent>
          <p>Write your code here</p>
          <Input
            type="number"
            {...register("otp", {
              setValueAs: (value) => (value === "" ? undefined : value),
            })}
            placeholder="123456"
          />
          <Button type="submit">Donate</Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}

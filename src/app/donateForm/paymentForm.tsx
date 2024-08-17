"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useTransition } from "react";
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
import { FaCheckCircle } from "react-icons/fa";
import { notFound, useRouter, useSearchParams } from "next/navigation";

type props = {
  id: number;
  title: string;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
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
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<formSchemaType>({
    resolver: zodResolver(DonationSchema(form.dictionary)),
    mode: "onChange",
  });

  const [selectedMethod, setSelectedMethod] = useState<
    "lumicash" | "ecocash" | "ibbm+" | "card" | "paypal" | undefined
  >();

  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);
  const [isOtpRequired, setIsOtpRequired] = useState(false);

  const [newDonationId, setNewDonationId] = useState<number | undefined>();

  const searchParams = useSearchParams();

  const { push } = useRouter();

  useEffect(() => {
    if (searchParams.size > 0) {
      // if (
      //   (Number.isNaN(Number(searchParams.get("donation"))) ||
      //     (searchParams.get("method") !== "ecocash" &&
      //       searchParams.get("method") !== "lumicash" &&
      //       searchParams.get("method") !== "ibbm+" &&
      //       searchParams.get("method") !== "card" &&
      //       searchParams.get("method") !== "paypal") ||
      //     Number.isNaN(Number(searchParams.get("amount"))) ||
      //     !searchParams.get("donation") ||
      //     !searchParams.get("method") ||
      //     !searchParams.get("amount")) &&
      //   !searchParams.get("donations") &&
      //   !searchParams.get("share")
      // ) {
      if (
        (Number.isNaN(Number(searchParams.get("donation"))) ||
          !searchParams.get("donation") ||
          !watch("amount") ||
          !watch("paymentMethod")) &&
        !searchParams.get("donations") &&
        !searchParams.get("share")
      ) {
        notFound();
      } else {
        setNewDonationId(Number(searchParams.get("donation")));
        setIsWaitingForConfirmation(true);
      }
    }
  }, [searchParams]);

  const listOfErrors = Object.values(errors).map((error) => error);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const dict = form.dictionary;

  const onSubmit = (data: formSchemaType) =>
    startTransition(async () => {
      if (data.paymentMethod === "lumicash" && data.otp == undefined) {
        try {
          const response = await getOTP(
            data.amount,
            data.paymentNumber as string
          );
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
          const donation = await InitiateDonation({
            campaignId: form.id,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            currency:
              data.paymentMethod === "card" || data.paymentMethod === "paypal"
                ? "USD"
                : "BIF",
            paymentNumber: data.paymentNumber,
            donorName: data.donorName,
            isDonorAnonymous: data.isDonorAnonymous,
            otp: data.otp,
          });

          if (donation) {
            setIsOtpRequired(false);
            setValue("otp", undefined);

            const href = location.pathname.split("/").pop();
            const redi = async () => push(`/${href}?donation=${donation.id}`);
            redi();

            if (donation.link) {
              setTimeout(() => {
                console.log(donation.link);
                push(decodeURIComponent(donation.link));
              }, 2000);
            }
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: dict.form.other_error,
            duration: 7000,
          });
        }
      }
    });

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 mx-3 p-5 mt-3 mb-7 bg-background border border-slate-300 rounded-2xl"
      >
        <div className="space-y-3">
          <p className="font-semibold text-lg">{dict.form.heading}</p>

          <div className="flex flex-wrap bg-white/30 border border-heading/40 overflow-hidden rounded-2xl shadow-xl">
            {["lumicash", "ecocash", "ibbm+", "card", "paypal"].map(
              (method, index) => {
                return (
                  <button
                    className={
                      selectedMethod === method
                        ? `${
                            index > 2
                              ? "w-1/2 aspect-[2/1]"
                              : "w-1/3 aspect-[3/2]"
                          }  relative flex flex-col items-center justify-center bg-highlight border-4 border-heading rounded-2xl`
                        : `${
                            index > 2
                              ? "w-1/2 aspect-[2/1]"
                              : "w-1/3 aspect-[3/2]"
                          } ${
                            (index === 0 || index === 1 || index === 3) &&
                            " border-r border-black/20"
                          } ${
                            (index === 0 || index === 1 || index === 2) &&
                            " border-b border-black/20"
                          }`
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        ?.getElementById(method === "paypal" ? "pypl" : method)
                        ?.click();
                      if (method === "card" || method === "paypal") {
                        setValue("paymentNumber", undefined);
                        setTimeout(() => {
                          document?.getElementById("amount")?.focus();
                        }, 100);
                      } else {
                        setTimeout(() => {
                          document?.getElementById("payment-number")?.focus();
                        }, 100);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      value={method === "paypal" ? "pypl" : method}
                      id={method === "paypal" ? "pypl" : method}
                      checked={selectedMethod === method}
                      className="hidden"
                      onClick={() => {
                        setValue("paymentNumber", undefined);
                        clearErrors();
                        setSelectedMethod(
                          method as
                            | "lumicash"
                            | "ecocash"
                            | "ibbm+"
                            | "card"
                            | "paypal"
                        );
                        setValue(
                          "paymentMethod",
                          method as
                            | "lumicash"
                            | "ecocash"
                            | "ibbm+"
                            | "card"
                            | "paypal"
                        );
                      }}
                    />
                    {selectedMethod === method && (
                      <FaCheckCircle
                        onClick={() =>
                          document
                            ?.getElementById(
                              method === "paypal" ? "pypl" : method
                            )
                            ?.click()
                        }
                        className="absolute bottom-2 right-2 w-5 h-5 fill-heading"
                      />
                    )}
                    <Image
                      src={"/" + method + ".jpg"}
                      width={500}
                      height={index > 2 ? 250 : 333}
                      alt={method}
                      className={`${
                        selectedMethod === method
                          ? "w-[80%] rounded-2xl"
                          : "w-full"
                      } object-contain`}
                    />
                  </button>
                );
              }
            )}
          </div>
        </div>

        {selectedMethod &&
          selectedMethod !== "paypal" &&
          selectedMethod !== "card" && (
            <div className="space-y-1">
              <p className="font-semibold text-lg">{dict.form.number}</p>
              <Input
                type="number"
                {...register("paymentNumber", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                id={"payment-number"}
                placeholder={
                  selectedMethod === "ecocash" ? "71002024" : "62002024"
                }
                autoFocus
              />
            </div>
          )}

        {((!watch("paymentNumber") &&
          (selectedMethod === "paypal" || selectedMethod === "card")) ||
          (selectedMethod &&
            watch("paymentNumber") &&
            !errors.paymentNumber)) && <Separator />}

        {((!watch("paymentNumber") &&
          (selectedMethod === "paypal" || selectedMethod === "card")) ||
          (selectedMethod &&
            watch("paymentNumber") &&
            !errors.paymentNumber)) && (
          <div className="space-y-1">
            <p className="font-semibold text-lg">{dict.form.amount}</p>
            <div className="w-full flex flex-row py-2 items-center gap-3">
              {dict.form.bif_currency === "BIF" && (
                <p className="text-lg font-semibold text-nowrap">
                  {dict.form.bif_currency}
                </p>
              )}
              <Input
                type="number"
                id="amount"
                className="py-6 text-3xl"
                {...register("amount", {
                  valueAsNumber: true,
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                placeholder="0.00"
              />
              {dict.form.bif_currency !== "BIF" && (
                <p className="text-lg font-semibold text-nowrap">
                  {dict.form.bif_currency}
                </p>
              )}
            </div>
            <p>
              {selectedMethod === "ibbm+"
                ? dict.form.bif_threshold
                    .replaceAll("$currency", dict.form.bif_currency)
                    .replace("500", "1000")
                : dict.form.bif_threshold.replaceAll(
                    "$currency",
                    dict.form.bif_currency
                  )}
            </p>
          </div>
        )}
        {((watch("amount") > 0 &&
          !errors.amount &&
          !watch("paymentNumber") &&
          (selectedMethod === "paypal" || selectedMethod === "card")) ||
          (watch("amount") > 0 &&
            !errors.amount &&
            selectedMethod &&
            watch("paymentNumber") &&
            !errors.paymentNumber)) && <Separator />}

        {((watch("amount") > 0 &&
          !errors.amount &&
          !watch("paymentNumber") &&
          (selectedMethod === "paypal" || selectedMethod === "card")) ||
          (watch("amount") > 0 &&
            !errors.amount &&
            selectedMethod &&
            watch("paymentNumber") &&
            !errors.paymentNumber)) && (
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
        {selectedMethod && (
          <Button
            type="submit"
            disabled={
              isPending ||
              watch("amount") === 0 ||
              errors.amount != undefined ||
              errors.donorName != undefined ||
              !watch("donorName")
            }
          >
            {isPending ? dict.global.loading : dict.global.donate}
          </Button>
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
              <p className="font-medium text-center mx-auto,">
                {dict.form.otp}
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
                  paymentNumber: watch("paymentNumber"),
                  paymentMethod: watch("paymentMethod"),
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
      {isWaitingForConfirmation && (
        <ConfirmationPopup
          donationId={newDonationId as number}
          amount={watch("amount")}
          paymentMethod={
            selectedMethod as
              | "lumicash"
              | "ecocash"
              | "ibbm+"
              | "card"
              | "paypal"
          }
          dictionary={dict}
          onSuccess={() => {
            setIsWaitingForConfirmation(false);
            push("/" + form.id);
            reset();
            setSelectedMethod(undefined);
            setValue("amount", 0);
          }}
        />
      )}
    </>
  );
}

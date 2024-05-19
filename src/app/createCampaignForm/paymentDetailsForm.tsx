"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PaymentDetailsSchema } from "../validation/campaignFormValidation";
import CampaignFormContext from "./formContext";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ImCheckboxChecked } from "react-icons/im";
import { ImCheckboxUnchecked } from "react-icons/im";

type props = {
  dictionary: any;
  goNext: () => void;
  goPrevious: () => void;
};
export default function PaymentDetailsForm(form: props) {
  const schema = PaymentDetailsSchema(form.dictionary);
  type detailsType = z.infer<typeof schema>;
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(PaymentDetailsSchema(form.dictionary)),
    mode: "onChange",
  });
  const [selectedCountry, setSelectedCountry] = useState<
    "burundi" | "rwanda" | undefined
  >("burundi");
  setValue("country", "burundi");

  const [isLumicashSelected, setIsLumicashSelected] = useState(
    formState.lumicashNumber != undefined
  );
  const [isEcocashSelected, setIsEcocashSelected] = useState(
    formState.ecocashNumber != undefined
  );
  const [isMtnMomoSelected, setIsMtnMomoSelected] = useState(
    formState.mtnMomoNumber != undefined
  );

  const listOfErrors = Object.values(errors).map((error) => error);
  const onSubmit = (data: detailsType) => {
    setFormState((prevState) => ({
      ...prevState,
      country: data.country,
      targetAmount: data.targetAmount,
      lumicashNumber: data.lumicashNumber,
      ecocashNumber: data.ecocashNumber,
      mtnMomoNumber: data.mtnMomoNumber,
    }));
    form.goNext();
  };

  const dict = form.dictionary;
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-5 mb-7 bg-background border border-slate-300 rounded-2xl"
    >
      {/* <div className="space-y-1">
        <p className="font-semibold text-lg">Where are you raising from?</p>
        <div className="w-full flex flex-wrap gap-2">
          <div>
            <input
              type="radio"
              {...register("country")}
              className="hidden"
              value={"burundi"}
              checked={formState.country === "burundi"}
              id={"burundi"}
            />
            <button
              className={
                selectedCountry === "burundi"
                  ? "p-3 border border-slate-500 bg-slate-300 rounded-3xl"
                  : "p-3 border border-slate-300 rounded-3xl"
              }
              onClick={(e) => {
                e.preventDefault();
                document?.getElementById("burundi")?.click();
                setSelectedCountry("burundi");
                setValue("country", "burundi");
              }}
            >
              Burundi
            </button>
          </div>
          <div>
            <input
              type="radio"
              {...register("country")}
              className="hidden"
              value={"rwanda"}
              checked={formState.country === "rwanda"}
              id={"rwanda"}
            />
            <button
              className={
                selectedCountry === "rwanda"
                  ? "p-3 border border-slate-500 bg-slate-300 rounded-3xl"
                  : "p-3 border border-slate-300 rounded-3xl"
              }
              onClick={(e) => {
                e.preventDefault();
                document?.getElementById("rwanda")?.click();
                setSelectedCountry("rwanda");
                setValue("country", "rwanda");
              }}
            >
              Rwanda
            </button>
          </div>
        </div>
      </div> 
      <Separator />*/}
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.payment.amount}</p>
        <div className="w-full flex flex-row py-2 items-center gap-3">
          {dict.payment.currency === "BIF" && (
            <p className="text-lg">{dict.payment.currency}</p>
          )}
          <Input
            type="number"
            className="py-6 text-3xl"
            {...register("targetAmount", {
              valueAsNumber: true,
              setValueAs: (value) => (value === "" ? undefined : value),
            })}
            defaultValue={formState.targetAmount}
            placeholder="0.00"
          />
          {dict.payment.currency !== "BIF" && (
            <p className="text-lg">{dict.payment.currency}</p>
          )}
        </div>
      </div>
      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.payment.payment_method}</p>
        <div className="space-y-3 py-2">
          {selectedCountry === "burundi" && (
            <div
              className={
                isEcocashSelected
                  ? "flex flex-row gap-5 items-center p-3 bg-highlight border border-heading rounded-xl"
                  : "flex flex-row gap-5 items-center p-[11px] border border-slate-400 rounded-xl"
              }
            >
              <input
                type="checkbox"
                value={"ecocash"}
                id={"ecocash"}
                className="hidden"
                defaultChecked={isEcocashSelected}
                onChange={(e) => {
                  setIsEcocashSelected(e.target.checked);
                  if (e.target.checked) {
                    setValue("mtnMomoNumber", undefined);
                    setIsMtnMomoSelected(false);
                  } else {
                    setValue("ecocashNumber", undefined);
                  }
                }}
              />
              {isEcocashSelected ? (
                <ImCheckboxChecked
                  onClick={() => document?.getElementById("ecocash")?.click()}
                  className="w-6 h-6 fill-heading"
                />
              ) : (
                <ImCheckboxUnchecked
                  onClick={() => document?.getElementById("ecocash")?.click()}
                  className="w-6 h-6 fill-heading/40"
                />
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!isEcocashSelected) {
                    document?.getElementById("ecocash")?.click();
                  } else {
                    document?.getElementById("ecocash-number")?.focus();
                  }
                }}
              >
                <div className="space-y-1">
                  <Image
                    src={"/ecocash.png"}
                    width={500}
                    height={150}
                    alt="ecocash"
                    className="w-32 object-contain h-fit mx-auto rounded-lg border border-slate-500"
                  />
                  {!isEcocashSelected && <p>{dict.payment.add_ecocash}</p>}
                </div>
              </button>
              {isEcocashSelected && (
                <Input
                  type="number"
                  {...register("ecocashNumber", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  id="ecocash-number"
                  placeholder="71002024"
                  autoFocus
                  defaultValue={formState.ecocashNumber}
                  className="w-36 text-lg bg-white"
                />
              )}
            </div>
          )}

          {selectedCountry === "burundi" && (
            <div
              className={
                isLumicashSelected
                  ? "flex flex-row gap-5 items-center p-3 bg-highlight border border-heading rounded-xl"
                  : "flex flex-row gap-5 items-center p-[11px] border border-slate-400 rounded-xl"
              }
            >
              <input
                type="checkbox"
                value={"lumicash"}
                id={"lumicash"}
                className="hidden"
                defaultChecked={isLumicashSelected}
                onChange={(e) => {
                  setIsLumicashSelected(e.target.checked);
                  if (e.target.checked) {
                    setValue("mtnMomoNumber", undefined);
                    setIsMtnMomoSelected(false);
                  } else {
                    setValue("lumicashNumber", undefined);
                  }
                }}
              />
              {isLumicashSelected ? (
                <ImCheckboxChecked
                  onClick={() => document?.getElementById("lumicash")?.click()}
                  className="w-6 h-6 fill-heading"
                />
              ) : (
                <ImCheckboxUnchecked
                  onClick={() => document?.getElementById("lumicash")?.click()}
                  className="w-6 h-6 fill-heading/40"
                />
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLumicashSelected) {
                    document?.getElementById("lumicash")?.click();
                  } else {
                    document?.getElementById("lumicash-number")?.focus();
                  }
                }}
              >
                <div className="space-y-1">
                  <Image
                    src={"/lumicash.png"}
                    width={500}
                    height={150}
                    alt="lumicash"
                    className="w-32 object-contain h-fit mx-auto rounded-lg border border-slate-500"
                  />
                  {!isLumicashSelected && <p>{dict.payment.add_lumicash}</p>}
                </div>
              </button>
              {isLumicashSelected && (
                <Input
                  defaultValue={formState.lumicashNumber}
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
            </div>
          )}
        </div>

        {/* {selectedCountry === "rwanda" && (
          <div
            className={
              isMtnMomoSelected
                ? "flex flex-row gap-5 items-center p-3 bg-slate-300 rounded-xl"
                : "flex flex-row gap-5 items-center p-[11px] border rounded-xl"
            }
          >
            <input
              type="checkbox"
              value={"mtnMomo"}
              id={"mtnMomo"}
              className="w-6 h-6"
              defaultChecked={isMtnMomoSelected}
              onChange={(e) => {
                setIsMtnMomoSelected(e.target.checked);
                if (e.target.checked) {
                  setValue("ecocashNumber", undefined);
                  setValue("lumicashNumber", undefined);
                  setIsEcocashSelected(false);
                  setIsLumicashSelected(false);
                } else {
                  setValue("mtnMomoNumber", undefined);
                }
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!isMtnMomoSelected) {
                  document?.getElementById("mtnMomo")?.click();
                } else {
                  document?.getElementById("mtnMomo-number")?.focus();
                }
              }}
            >
              <p>MTN MoMo</p>
              {!isMtnMomoSelected && (
                <p>Click here to add an MTN MoMo number</p>
              )}
            </button>
            {isMtnMomoSelected && (
              <Input
                type="number"
                {...register("mtnMomoNumber", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                id="mtnMomo-number"
                placeholder="0715898949"
                autoFocus
                defaultValue={formState.mtnMomoNumber}
                className="w-36 text-lg bg-white"
              />
            )}
          </div>
        )} */}
      </div>

      {isLumicashSelected && (
        <p className="font-medium text-sm bg-yellow-100 border border-yellow-700 p-3 rounded-lg">
          {dict.payment.notice}
        </p>
      )}
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
        <Button type="submit" size={"lg"} className="w-fit">
          {dict.global.continue}
        </Button>
      </div>
    </form>
  );
}

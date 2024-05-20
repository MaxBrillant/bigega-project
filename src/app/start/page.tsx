"use client";

import { useEffect, useState } from "react";
import Progress from "../components/progress";
import BasicDetailsForm from "../createCampaignForm/basicDetailsForm";
import PaymentDetailsForm from "../createCampaignForm/paymentDetailsForm";
import WhatsappGroupDetailsForm from "../createCampaignForm/whatsappGroupDetailsForm";
import CampaignFormContext, {
  CampaignFormState,
} from "../createCampaignForm/formContext";
import Image from "next/image";
import { getDictionary } from "@/dictionaries/getDictionary";
import Loading from "../loading";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LanguageSelect } from "../components/languageSelect";

export default function Main() {
  const [formState, setFormState] = useState<CampaignFormState>(
    {} as CampaignFormState
  );

  const [step, setStep] = useState(0);
  const [dict, setdict] = useState<any>();
  const { push } = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to the first step if the current step is less than 1
    if (
      Number.isNaN(Number(searchParams.get("step"))) ||
      Number(searchParams.get("step")) > 2 ||
      Number(searchParams.get("step")) < 0
    ) {
      push("/start");
    } else {
      setStep(Number(searchParams.get("step")));
    }
  }, [searchParams]);

  useEffect(() => {
    const getDict = async () => {
      const dict = await getDictionary();
      setdict(dict);
    };
    getDict();
  }, []);

  const goToNextStep = () => {
    push(`/start?step=${step + 1}`);
  };

  const goToPrevStep = () => {
    push(`/start?step=${step - 1}`);
  };

  return dict ? (
    <CampaignFormContext.Provider value={{ formState, setFormState }}>
      <div className="flex flex-row px-3 items-center justify-between border-b border-highlight">
        <Link href={"/"}>
          <Image
            src={"/bigega.svg"}
            width={120}
            height={20}
            alt="logo"
            className="p-1 m-1"
          />
        </Link>
        {location.href.endsWith("/start") && (
          <LanguageSelect language={dict?.home?.language} />
        )}
      </div>
      <div className="mx-3 my-2">
        <p className="font-semibold text-xl w-fit mx-auto text-heading">
          {dict?.start.start.start}
        </p>
        <Progress step={step}></Progress>
        {step === 0 && (
          <BasicDetailsForm dictionary={dict?.start} goNext={goToNextStep} />
        )}
        {step === 1 && (
          <PaymentDetailsForm
            dictionary={dict?.start}
            goNext={goToNextStep}
            goPrevious={goToPrevStep}
          />
        )}
        {step === 2 && (
          <WhatsappGroupDetailsForm
            goPrevious={goToPrevStep}
            dictionary={dict?.start}
          />
        )}
      </div>
    </CampaignFormContext.Provider>
  ) : (
    <Loading />
  );
}

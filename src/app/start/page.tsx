"use client";

import { useState } from "react";
import Progress from "../components/progress";
import BasicDetailsForm from "../createCampaignForm/basicDetailsForm";
import PaymentDetailsForm from "../createCampaignForm/paymentDetailsForm";
import WhatsappGroupDetailsForm from "../createCampaignForm/whatsappGroupDetailsForm";
import CampaignFormContext, {
  CampaignFormState,
} from "../createCampaignForm/formContext";
import Image from "next/image";

export default function Main() {
  const [formState, setFormState] = useState<CampaignFormState>(
    {} as CampaignFormState
  );
  const [step, setStep] = useState(0);

  return (
    <CampaignFormContext.Provider value={{ formState, setFormState }}>
      <div className="border-b border-highlight">
        <Image
          src={"/bigega.png"}
          width={120}
          height={20}
          alt="logo"
          className="object-contain h-fit m-1"
        />
      </div>
      <div className="mx-3 my-2">
        <p className="font-semibold text-xl w-fit mx-auto text-heading">
          Start a fundraising campaign
        </p>
        <Progress step={step} setStep={setStep}></Progress>
        {step === 0 && <BasicDetailsForm setStep={setStep} />}
        {step === 1 && <PaymentDetailsForm setStep={setStep} />}
        {step === 2 && <WhatsappGroupDetailsForm />}
      </div>
    </CampaignFormContext.Provider>
  );
}

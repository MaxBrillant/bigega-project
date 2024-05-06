"use client";

import { useState } from "react";
import Progress from "../components/progress";
import BasicDetailsForm from "../createCampaignForm/basicDetailsForm";
import PaymentDetailsForm from "../createCampaignForm/paymentDetailsForm";
import WhatsappGroupDetailsForm from "../createCampaignForm/whatsappGroupDetailsForm";
import CampaignFormContext, {
  CampaignFormState,
} from "../createCampaignForm/formContext";

export default function Main() {
  const [formState, setFormState] = useState<CampaignFormState>(
    {} as CampaignFormState
  );
  const [step, setStep] = useState(0);

  return (
    <CampaignFormContext.Provider value={{ formState, setFormState }}>
      <div className="px-5">
        <Progress step={step} setStep={setStep}></Progress>
        {step === 0 && (
          <div>
            <p className="pb-3 text-2xl font-semibold">Basic Information</p>
            <BasicDetailsForm setStep={setStep} />
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="pb-3 text-2xl font-semibold">Payment Information</p>
            <PaymentDetailsForm setStep={setStep} />
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="pb-3 text-2xl font-semibold">Whatsapp Group</p>
            <WhatsappGroupDetailsForm />
          </div>
        )}
      </div>
    </CampaignFormContext.Provider>
  );
}

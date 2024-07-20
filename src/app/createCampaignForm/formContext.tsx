import React from "react";
// Define the shape of your form state
export type CampaignFormState = {
  title: string | undefined;
  category:
    | "wedding"
    | "funerals"
    | "gift"
    | "event"
    | "medical"
    | "emergency"
    | "business"
    | "family"
    | "education"
    | "travel"
    | "other"
    | undefined;
  description: string | undefined;
  coverPhotoUrl: string | undefined;
  country: "burundi" | "rwanda" | undefined;
  targetAmount: number | undefined;
  lumicashNumber: string | undefined;
  ecocashNumber: string | undefined;
  mtnMomoNumber: string | undefined;
  languageOfCommunication: "en" | "fr" | "bi" | "rw" | undefined;
};

// Define the context with initial state and updater function
const CampaignFormContext = React.createContext({
  formState: {} as CampaignFormState,
  setFormState: (() => {}) as React.Dispatch<
    React.SetStateAction<CampaignFormState>
  >,
});

export default CampaignFormContext;

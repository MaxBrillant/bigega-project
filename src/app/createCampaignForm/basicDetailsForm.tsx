"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicDetailsSchema } from "../validation/campaignFormValidation";
import { z } from "zod";
import CampaignFormContext from "./formContext";

type props = {
  setStep: Dispatch<SetStateAction<number>>;
};
type detailsType = z.infer<typeof BasicDetailsSchema>;
export default function BasicDetailsForm(form: props) {
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(BasicDetailsSchema),
  });

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    formState.category
  );

  const listOfErrors = Object.values(errors).map((error) => error);

  const onSubmit = (data: detailsType) => {
    setFormState((prevState) => ({
      ...prevState,
      title: data.title,
      category: data.category,
      description: data.description,
    }));
    form.setStep(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <p>Title</p>
        <Input
          {...register("title")}
          defaultValue={formState.title}
          placeholder="John and Jane's wedding"
        />
      </div>
      <div>
        <p>Type of fundraising</p>
        <div className="w-full flex flex-wrap">
          {categories.map((category) => {
            return (
              <div key={category.id}>
                <input
                  type="radio"
                  {...register("category")}
                  className="hidden"
                  value={category.id}
                  checked={formState.category === category.id}
                  id={category.id}
                />
                <button
                  className={
                    selectedCategory === category.id
                      ? "p-3 bg-slate-300 rounded-3xl"
                      : "p-[11px] border rounded-3xl"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    document?.getElementById(category.id)?.click();
                    setSelectedCategory(category.id);
                  }}
                >
                  {category.value}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p>Description (optional)</p>
        <Textarea
          {...register("description", {
            setValueAs: (value) => (value === "" ? undefined : value),
          })}
          placeholder="We are raising money to help pay for our wedding and various expenses"
        />
      </div>

      {listOfErrors.length > 0 && (
        <div className="flex flex-col bg-red-500 text-white p-3 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <Button type="submit">Next</Button>
    </form>
  );
}

const categories = [
  {
    id: "wedding",
    value: "Wedding Ceremony",
  },
  {
    id: "funerals",
    value: "Funerals & Memorials",
  },
  {
    id: "gift",
    value: "Buy a gift",
  },
  {
    id: "event",
    value: "Event",
  },
  {
    id: "medical",
    value: "Medical",
  },
  {
    id: "emergency",
    value: "Emergency",
  },
  {
    id: "business",
    value: "Business",
  },
  {
    id: "family",
    value: "Family",
  },
  {
    id: "education",
    value: "Education",
  },
  {
    id: "travel",
    value: "Travel",
  },
  {
    id: "other",
    value: "Other",
  },
];

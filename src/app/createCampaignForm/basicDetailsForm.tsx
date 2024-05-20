"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicDetailsSchema } from "../validation/campaignFormValidation";
import { z } from "zod";
import CampaignFormContext from "./formContext";
import { Separator } from "@/components/ui/separator";

type props = {
  dictionary: any;
  goNext: () => void;
};
export default function BasicDetailsForm(form: props) {
  const schema = BasicDetailsSchema(form.dictionary);
  type detailsType = z.infer<typeof schema>;
  const { formState, setFormState } = useContext(CampaignFormContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(BasicDetailsSchema(form.dictionary)),
    mode: "onChange",
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
    form.goNext();
  };

  const dict = form.dictionary;

  const categories = [
    {
      id: "wedding",
      value: dict.basic.wedding,
    },
    {
      id: "gift",
      value: dict.basic.gift,
    },
    {
      id: "funerals",
      value: dict.basic.funerals,
    },
    {
      id: "event",
      value: dict.basic.event,
    },
    {
      id: "medical",
      value: dict.basic.medical,
    },
    {
      id: "emergency",
      value: dict.basic.emergency,
    },
    {
      id: "business",
      value: dict.basic.business,
    },
    {
      id: "family",
      value: dict.basic.family,
    },
    {
      id: "education",
      value: dict.basic.education,
    },
    {
      id: "travel",
      value: dict.basic.travel,
    },
    {
      id: "other",
      value: dict.basic.other,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-5 mb-7 bg-background border border-slate-300 rounded-2xl"
    >
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.basic.title}</p>
        <Input
          {...register("title")}
          defaultValue={formState.title}
          placeholder={dict.basic.title_placeholder}
        />
      </div>
      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.basic.reason}</p>
        <div className="w-full flex flex-wrap gap-2">
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
                      ? "py-1 pl-1 pr-3 border border-heading bg-highlight rounded-3xl"
                      : "py-1 pl-1 pr-3 border border-slate-400 rounded-3xl"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    document?.getElementById(category.id)?.click();
                    setSelectedCategory(category.id);
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <p className="w-10 h-10 pt-1 text-2xl bg-white border border-highlight rounded-full">
                      {category.value.split("-")[0]}
                    </p>
                    <p>{category.value.split("-")[1]}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Separator />
      <div className="space-y-1">
        <p className="font-semibold text-lg">{dict.basic.description}</p>
        <Textarea
          {...register("description", {
            setValueAs: (value) => (value === "" ? undefined : value),
          })}
          placeholder={dict.basic.description_placeholder}
          defaultValue={formState.description}
        />
      </div>

      {listOfErrors.length > 0 && (
        <div className="flex flex-col p-3 bg-red-200 text-red-700 border border-red-700 rounded-2xl">
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </div>
      )}
      <Button type="submit" size={"lg"} className="w-fit ml-auto mt-5">
        {dict.global.continue}
      </Button>
    </form>
  );
}

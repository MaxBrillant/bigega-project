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
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NextImage from "next/image";
import Compressor from "compressorjs";
import { IoMdClose } from "react-icons/io";

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<detailsType>({
    resolver: zodResolver(BasicDetailsSchema(form.dictionary)),
    mode: "onChange",
  });

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    formState.category
  );
  const [imageTobeAdjusted, setImageTobeAdjusted] = useState<
    string | undefined
  >();

  const [crop, setCrop] = useState<Crop>();

  function onImageLoad(e: any) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    const crop = centerCrop(
      makeAspectCrop(
        {
          // You don't need to pass a complete crop into
          // makeAspectCrop or centerCrop.
          unit: "%",
          width: 100,
        },
        2 / 1,
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop);
  }

  const listOfErrors = Object.values(errors).map((error) => error);

  const onSubmit = (data: detailsType) => {
    setFormState((prevState) => ({
      ...prevState,
      title: data.title,
      category: data.category,
      description: data.description,
      coverPhotoUrl: data.coverPhoto,
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

      {selectedCategory && <Separator />}
      {selectedCategory && (
        <div className="space-y-1">
          <p className="font-semibold text-lg">
            Do you have a cover photo for your campaign? (optional)
          </p>
          <p>This will be your cover photo</p>
          <Input
            type="file"
            accept="image/*"
            id="cover"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setImageTobeAdjusted(url);
            }}
          />
          <div className="relative w-full bg-slate-300 rounded-2xl border border-slate-500 overflow-clip">
            {watch("coverPhoto") && (
              <button
                className="absolute top-1 right-1 p-1 bg-white/80 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  setValue("coverPhoto", undefined);
                }}
              >
                <IoMdClose className="w-4 h-4" />
              </button>
            )}
            <NextImage
              src={
                watch("coverPhoto")
                  ? (watch("coverPhoto") as string)
                  : "/" + selectedCategory + ".jpg"
              }
              width={500}
              height={250}
              alt="cover"
              className="w-full aspect-[2/1] object-cover"
            />
            <Button
              variant={"outline"}
              size={"lg"}
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                document?.getElementById("cover")?.click();
              }}
            >
              Change cover photo
            </Button>
          </div>
        </div>
      )}

      {imageTobeAdjusted && (
        <Dialog
          open={true}
          onOpenChange={() => setImageTobeAdjusted(undefined)}
        >
          <DialogContent className="flex flex-col max-h-full">
            <p>Adjust your cover photo</p>
            <ReactCrop
              crop={crop}
              aspect={2 / 1}
              locked
              ruleOfThirds
              onChange={(crop, percentCrop) => setCrop(percentCrop)}
              className="w-fit h-fit max-h-[70vh] mx-auto"
            >
              <img
                src={imageTobeAdjusted}
                onLoad={onImageLoad}
                className="h-fit max-h-[70vh] mx-auto object-contain"
              />
            </ReactCrop>
            <Button
              onClick={async (e) => {
                e.preventDefault();

                const file = await getCroppedImage(imageTobeAdjusted, crop);
                new Compressor(file, {
                  quality: 0.6,
                  maxWidth: 1000,
                  maxHeight: 1000,
                  // The compression process is asynchronous,
                  // which means you have to access the `result` in the `success` hook function.
                  success(result) {
                    const url = URL.createObjectURL(result);
                    setValue("coverPhoto", url);
                    setImageTobeAdjusted(undefined);
                  },
                  error(err) {
                    console.log(err.message);
                  },
                });
              }}
            >
              Continue
            </Button>
          </DialogContent>
        </Dialog>
      )}

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

const getCroppedImage = async (imageSrc: string, crop: any) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  crop.x = (image.width * crop.x) / 100;
  crop.y = (image.height * crop.y) / 100;
  crop.width = (image.width * crop.width) / 100;
  crop.height = (image.height * crop.height) / 100;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width!;
  canvas.height = crop.height!;
  ctx.drawImage(
    image,
    crop.x! * scaleX,
    crop.y! * scaleY,
    crop.width! * scaleX,
    crop.height! * scaleY,
    0,
    0,
    crop.width!,
    crop.height!
  );

  const croppedImageUrl = canvas.toDataURL("image/jpeg");
  const response = await fetch(croppedImageUrl);
  const blob = await response.blob();
  return blob;
};

// Helper function to load image
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

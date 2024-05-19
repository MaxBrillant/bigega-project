import { Button } from "@/components/ui/button";
import { getDictionary } from "@/dictionaries/getDictionary";
import Image from "next/image";
import { BiSolidDonateHeart } from "react-icons/bi";
import { IoMdChatbubbles } from "react-icons/io";
import { LanguageSelect } from "./components/languageSelect";
import Link from "next/link";

export default async function Main() {
  const dict = await getDictionary();
  return (
    <div>
      <div className="flex flex-row max-w-lg px-3 mx-auto items-center justify-between">
        <Image
          src={"/bigega.svg"}
          width={120}
          height={20}
          alt="logo"
          className="object-contain p-1 h-fit m-1"
        />
        <LanguageSelect language={dict.home.language} />
      </div>
      <div className="flex flex-col sm:flex-col-reverse">
        <div className="flex flex-row bg-background py-3 items-center justify-center">
          <Image
            src={dict.home.screenshot}
            width={375}
            height={667}
            alt="landing"
            className="h-[40vh] m-5 w-auto rounded-3xl border-[6px] bg-slate-50 border-slate-50 drop-shadow-2xl"
          />
          <Image
            src={dict.home.whatsapp}
            width={375}
            height={667}
            alt="landing"
            className="h-[45vh] ml-[-70px] w-auto rounded-3xl border-8 bg-slate-50 border-slate-50 drop-shadow-2xl"
          />
        </div>
        <div className="p-5 space-y-2 sm:w-3/5 sm:mx-auto">
          <p className="text-3xl font-bold text-heading">{dict.home.heading}</p>
          <p className="font-medium text-slate-500">{dict.home.description}</p>
          <div className="flex flex-wrap gap-3 py-2 items-center">
            <Link href={"/start"}>
              <Button size={"lg"}>{dict.home.main_cta}</Button>
            </Link>
            <Link href={"/333333"}>
              <Button variant={"secondary"}>{dict.home.second_cta}</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap my-10 gap-5 justify-center p-5 w-full">
        <div className="max-w-lg p-7 space-y-2 rounded-2xl bg-background">
          <BiSolidDonateHeart className="w-20 h-20 fill-heading" />
          <p className="text-2xl font-semibold text-heading">
            {dict.home.feature_one_heading}
          </p>
          <p className="font-medium text-gray-500">
            {dict.home.feature_one_description}
          </p>
        </div>
        <div className="max-w-lg p-7 space-y-2 rounded-2xl bg-background">
          <IoMdChatbubbles className="w-20 h-20 fill-heading" />
          <p className="text-2xl font-semibold text-heading">
            {dict.home.feature_two_heading}
          </p>
          <p className="font-medium text-gray-500">
            {dict.home.feature_two_description}
          </p>
        </div>
      </div>
    </div>
  );
}

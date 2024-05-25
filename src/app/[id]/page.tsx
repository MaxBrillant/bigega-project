import Image from "next/image";
import PaymentForm from "../donateForm/paymentForm";
import { GetCampaignDetails } from "../api/fetch/getCampaignDetails";
import { notFound } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import SharePopup from "../components/sharePopup";
import { getDictionary } from "@/dictionaries/getDictionary";
import Link from "next/link";
import { formatAmount } from "@/utils/formatCurrency";

export default async function Main({ params }: { params: { id: string } }) {
  if (Number.isNaN(Number(params.id))) {
    notFound();
  }

  const data = await GetCampaignDetails(Number(params.id));
  const dictionary = await getDictionary();
  const dict = dictionary?.donate;

  return (
    <div>
      <div className="flex flex-row items-center justify-between border-b border-highlight">
        <Link href={"/"}>
          <Image
            src={"/bigega.svg"}
            width={120}
            height={20}
            alt="logo"
            className="p-1 m-1"
          />
        </Link>
        <SharePopup url={"bigega.com/" + data.id} dictionary={dict} />
      </div>
      <Image
        src={`/${data.category}.jpg`}
        width={500}
        height={250}
        alt={data.category}
        priority
        className="h-32 object-cover rounded-b-2xl"
      />
      <div className="p-3 space-y-1">
        <p className="text-2xl font-bold">{data.title}</p>
        <p className="w-fit px-2 py-1 font-semibold text-nowrap bg-highlight text-heading border border-heading rounded-full">
          {dict.page.target.replace(
            "$amount",
            "" + formatAmount(data.targetAmount, dict.global.language)
          )}
        </p>
        {data.numberOfDonations > 0 && data.currentAmount > 0 ? (
          <p className="font-medium">
            <span className="text-heading font-semibold underline underline-offset-2">
              {dict.page.current.replace(
                "$amount",
                "" + formatAmount(data.currentAmount, dict.global.language)
              )}
            </span>{" "}
            {dict.page.donations.replace(
              "$donations",
              "" + data.numberOfDonations
            )}{" "}
            {data.numberOfDonations === 1
              ? dict.page.singular
              : dict.page.plural}
          </p>
        ) : (
          <p className="font-medium">{dict.page.no_donations}</p>
        )}
        {data.currentAmount > 0 && (
          <div className="flex flex-row gap-2 items-center">
            <Progress
              value={Math.round((data.currentAmount * 100) / data.targetAmount)}
            />
            <p className="font-medium">
              {parseFloat(((data.currentAmount * 100) / data.targetAmount).toFixed(1))}%
            </p>
          </div>
        )}
      </div>
      <PaymentForm
        id={data.id}
        title={data.title}
        lumicashNumber={data.lumicashNumber}
        ecocashNumber={data.ecocashNumber}
        whatsappGroupLink={data.whatsappGroupLink}
        dictionary={dict}
      />
      <div className="p-3 space-y-5 my-7">
        <div className="space-y-2">
          <p className="text-xl font-medium text-heading underline underline-offset-8">
            {dict.page.organizer}
          </p>
          <p className="font-medium text-slate-700">
            {dict.page.creator.replace("$name", data.organizerName)}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-medium text-heading underline underline-offset-8">
            {dict.page.description}
          </p>
          <p className="font-medium text-slate-700">
            {data.description ? data.description : dict.page.no_description}
          </p>
        </div>
      </div>
    </div>
  );
}

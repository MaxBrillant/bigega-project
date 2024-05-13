import Image from "next/image";
import PaymentForm from "../donateForm/paymentForm";
import { GetCampaignDetails } from "../api/fetch/getCampaignDetails";
import { notFound } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default async function Main({ params }: { params: { id: string } }) {
  if (Number.isNaN(Number(params.id))) {
    notFound();
  }
  const data = await GetCampaignDetails(Number(params.id));

  return (
    <div>
      <Image
        src={"/medical.jpg"}
        width={500}
        height={250}
        alt="wedding"
        className="w-full h-32 object-cover rounded-b-2xl"
      />
      <div className="p-3 space-y-1">
        <p className="text-2xl font-bold">{data.title}</p>
        <p className="w-fit px-2 py-1 font-semibold bg-highlight text-heading border border-heading rounded-full">
          🎯Target: {data.country === "burundi" ? "BIF" : "RWF"}.
          {data.targetAmount}
        </p>
        {data.numberOfDonations > 0 && data.currentAmount > 0 ? (
          <p className="font-medium">
            <span className="text-heading font-semibold underline underline-offset-2">
              {data.country === "burundi" ? "BIF" : "RWF"}.{data.currentAmount}
            </span>{" "}
            raised from {data.numberOfDonations}{" "}
            {data.numberOfDonations === 1 ? "donation" : "donations"}
          </p>
        ) : (
          <p className="font-medium">No donations have been received yet.</p>
        )}
        {data.currentAmount > 0 && (
          <div className="flex flex-row gap-2 items-center">
            <Progress
              value={Math.round((data.currentAmount * 100) / data.targetAmount)}
            />
            <p className="font-medium">
              {Math.round((data.currentAmount * 100) / data.targetAmount)}%
            </p>
          </div>
        )}
      </div>
      <PaymentForm
        id={data.id}
        title={data.title}
        lumicashNumber={data.lumicashNumber}
        ecocashNumber={data.ecocashNumber}
      />
      <div className="p-3 space-y-5 my-7">
        <div className="space-y-2">
          <p className="text-xl font-medium text-heading underline underline-offset-8">
            Organizer
          </p>
          <p className="font-medium text-slate-700">
            This campaign was created by {data.organizerName}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-medium text-heading underline underline-offset-8">
            Description
          </p>
          <p className="font-medium text-slate-700">{data.description}</p>
        </div>
      </div>
    </div>
  );
}

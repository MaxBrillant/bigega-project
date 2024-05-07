import Image from "next/image";
import PaymentForm from "../donateForm/paymentForm";
import { GetCampaignDetails } from "../api/fetch/getCampaignDetails";
import { notFound } from "next/navigation";

export default async function Main({ params }: { params: { id: string } }) {
  if (Number.isNaN(Number(params.id))) {
    notFound();
  }
  const data = await GetCampaignDetails(Number(params.id));

  return (
    <div className="px-5">
      <Image src={"/love.png"} width={150} height={150} alt="love"></Image>
      <div>
        <p className="text-2xl font-semibold">{data.title}</p>
        <p className="text-lg font-medium">
          Target: {data.country === "burundi" ? "BIF" : "RWF"}.
          {data.targetAmount}
        </p>
        {data.numberOfDonations > 0 && data.currentAmount > 0 ? (
          <p>
            {data.country === "burundi" ? "BIF" : "RWF"}.{data.currentAmount}{" "}
            raised from {data.numberOfDonations}{" "}
            {data.numberOfDonations === 1 ? "donation" : "donations"}
          </p>
        ) : (
          <p>No donations have been received yet</p>
        )}
        {data.currentAmount > 0 && (
          <p>{Math.round((data.currentAmount * 100) / data.targetAmount)}%</p>
        )}
      </div>
      <PaymentForm
        id={data.id}
        title={data.title}
        lumicashNumber={data.lumicashNumber}
        ecocashNumber={data.ecocashNumber}
      />
      <div>
        <p>Organizer</p>
        <p>{data.organizerName}</p>
      </div>
      <div>
        <p>Description</p>
        <p>{data.description}</p>
      </div>
    </div>
  );
}

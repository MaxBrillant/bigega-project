import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ConfirmationPopup(props: {
  paymentMethod: string;
  whatsappGroupLink: string;
}) {
  return (
    <div>
      <Dialog open={true}>
        <DialogContent className="mb-7">
          <p className="font-semibold text-2xl text-heading">
            {props.paymentMethod.toUpperCase()} needs to confirm your payment
            before we can receive your donation.
          </p>

          <p className="mx-auto text-center bg-highlight p-3 px-5 rounded-full border border-heading">
            dial{" "}
            <span className="font-semibold text-3xl text-heading">*163#</span>{" "}
            then select
            {"  "}
            <span className="font-semibold text-3xl text-heading">4</span>
          </p>
          <a
            href="tel:*163%23"
            className="mx-auto text-center text-heading underline underline-offset-4"
          >
            CLICK HERE to Open your Phone app
          </a>
          <p className="mt-5 text-sm">
            {`After your donation has been successfully received, we will send an
            update to the Whatsapp Group that is linked to this campaign. Make
            sure to join to get updates on this activity's progress.`}
          </p>
          <a
            href={props.whatsappGroupLink}
            className="mx-auto text-center text-heading underline underline-offset-4"
          >
            CLICK HERE to Join the Whatsapp Group
          </a>
        </DialogContent>
      </Dialog>
    </div>
  );
}

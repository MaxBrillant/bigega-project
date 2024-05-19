import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function ConfirmationPopup(props: {
  donationId: number;
  paymentMethod: "lumicash" | "ecocash";
  whatsappGroupLink: string;
  dictionary: any;
}) {
  const [open, setOpen] = useState(true);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  useEffect(() => {
    listenForPaymentConfirmation(props.donationId, setIsPaymentConfirmed);
  }, []);

  const dict = props.dictionary;

  return (
    <div>
      <Dialog
        open={isPaymentConfirmed ? open : true}
        onOpenChange={isPaymentConfirmed ? setOpen : () => setOpen(true)}
      >
        <DialogContent className="mb-7 max-h-screen overflow-auto">
          {isPaymentConfirmed && (
            <Confetti recycle={false} className="w-full h-full" />
          )}
          {isPaymentConfirmed ? (
            <p className="font-semibold text-2xl text-heading">
              {dict.confirmation.success_heading}
            </p>
          ) : (
            <p className="font-semibold text-2xl text-heading">
              {dict.confirmation.confirm_heading.replace(
                "$method",
                props.paymentMethod.toUpperCase()
              )}
            </p>
          )}

          {!isPaymentConfirmed &&
            (props.paymentMethod === "lumicash" ? (
              <p className="mx-auto text-center bg-highlight p-3 px-5 rounded-full border border-heading shadow-2xl">
                {dict.confirmation.dial}{" "}
                <span className="font-semibold text-3xl text-heading">
                  *163#
                </span>{" "}
                {dict.confirmation.then}
                {"  "}
                <span className="font-semibold text-3xl text-heading">4</span>
              </p>
            ) : (
              <div className="mx-auto space-y-1 bg-highlight p-3 px-5 rounded-2xl border border-heading shadow-2xl">
                <p>
                  1. {dict.confirmation.dial}{" "}
                  <span className="font-semibold text-3xl text-heading">
                    *444#
                  </span>
                </p>
                <p>
                  2. {dict.confirmation.select}
                  {"  "}
                  <span className="font-semibold text-3xl text-heading">5</span>
                </p>
                <p>
                  3. {dict.confirmation.select}
                  {"  "}
                  <span className="font-semibold text-3xl text-heading">3</span>
                </p>
              </div>
            ))}
          {!isPaymentConfirmed && (
            <div className="space-y-5 text-center">
              <a
                href={
                  props.paymentMethod === "lumicash"
                    ? "tel:*163%23"
                    : "tel:*444%23"
                }
                className="mx-auto text-center font-medium text-heading underline underline-offset-4"
              >
                {dict.confirmation.phone_app}
              </a>

              <p className="w-full fit px-5 py-10 text-center animate-pulse bg-background border border-highlight">
                {dict.confirmation.waiting}
              </p>
            </div>
          )}
          {isPaymentConfirmed && (
            <div className="flex flex-col gap-3 text-center">
              <p className="mt-5 font-medium">
                {dict.confirmation.success_notice}
              </p>
              <a
                href={props.whatsappGroupLink}
                className="mx-auto font-medium text-center text-heading underline underline-offset-4"
              >
                {dict.confirmation.whatsapp_group}
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const listenForPaymentConfirmation = async (
  donationId: number,
  setIsPaymentConfirmed: Dispatch<SetStateAction<boolean>>
) => {
  const supabase = await CreateBrowserClient();
  supabase
    .channel("room1")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "donations" },
      (payload) => {
        const status = payload.new.status;
        const newDonationId = payload.new.id;
        if (newDonationId === donationId && status === "received") {
          setIsPaymentConfirmed(true);
          supabase.removeAllChannels();
        }
      }
    )
    .subscribe();
};

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Confetti from "react-confetti";
import AfripayButton from "./afripayButton";
import Image from "next/image";

export default function ConfirmationPopup(props: {
  donationId: number;
  amount: number;
  paymentMethod: "lumicash" | "ecocash" | "card" | "mpesa";
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
    <Dialog
      open={isPaymentConfirmed ? open : true}
      onOpenChange={
        isPaymentConfirmed
          ? setOpen
          : () => {
              setOpen(true);
              window.alert(dict.confirmation.close_message);
            }
      }
    >
      {!isPaymentConfirmed ? (
        props.paymentMethod === "ecocash" ||
        props.paymentMethod === "lumicash" ? (
          <DialogContent className="mb-7 max-h-screen overflow-auto">
            <p className="font-semibold text-2xl text-heading">
              {dict.confirmation.confirm_heading.replace(
                "$method",
                props.paymentMethod.toUpperCase()
              )}
            </p>
            (props.paymentMethod === "lumicash" ? (
            <div className="mx-auto space-y-1 bg-highlight p-3 px-5 rounded-2xl border border-heading shadow-2xl">
              <p>
                1. {dict.confirmation.dial}{" "}
                <span className="font-semibold text-3xl text-heading">
                  *163#
                </span>
              </p>
              <p>
                2. {dict.confirmation.select}
                {"  "}
                <span className="font-semibold text-3xl text-heading">4</span>
              </p>
              <p>
                3. {dict.confirmation.select}
                {"  "}
                <span className="font-semibold text-3xl text-heading">2</span>
              </p>
              <p>
                4. {dict.confirmation.select}
                {"  "}
                <span className="font-semibold text-3xl text-heading">1</span>
                {"  "}- AFRIREGISTER
              </p>
            </div>
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
            ))
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
            {props.paymentMethod === "lumicash" && (
              <p className="mx-auto p-3 text-slate-500">
                {dict.confirmation.excuse}
              </p>
            )}
          </DialogContent>
        ) : (
          <DialogContent className="mb-7 max-h-screen overflow-auto">
            <p className="font-semibold text-2xl text-heading">
              {dict.confirmation.guide_heading}
            </p>
            <p className="font-medium">
              {props.paymentMethod === "card"
                ? dict.confirmation.card_guide
                : dict.confirmation.mpesa_guide}
            </p>
            <AfripayButton
              donationId={props.donationId}
              amount={props.amount}
              currency={props.paymentMethod === "card" ? "USD" : "KSH"}
              label={dict.confirmation.guide_cta}
            ></AfripayButton>
            <div className="grid grid-cols-2 gap-2 pt-3 drop-shadow-2xl">
              <Image
                src={
                  props.paymentMethod === "card"
                    ? "/card_payment1.jpg"
                    : "/mpesa_payment1.jpg"
                }
                width={500}
                height={500}
                alt="screenshot1"
                className="h-fit aspect-square object-contain rounded-lg"
              />
              <Image
                src={
                  props.paymentMethod === "card"
                    ? "/card_payment2.jpg"
                    : "/mpesa_payment2.jpg"
                }
                width={500}
                height={500}
                alt="screenshot2"
                className="h-fit aspect-square object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        )
      ) : (
        <DialogContent className="mb-7 max-h-screen overflow-auto">
          <div className="flex flex-col gap-3 text-center">
            <Confetti recycle={false} className="w-full h-full" />
            <p className="font-semibold text-2xl text-heading">
              {dict.confirmation.success_heading}
            </p>
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
        </DialogContent>
      )}
    </Dialog>
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

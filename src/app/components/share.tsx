"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
} from "next-share";
import { FaFacebook, FaWhatsappSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Share(props: { url: string; dictionary: any }) {
  const { toast } = useToast();
  const dict = props.dictionary;
  return (
    <div className="max-w-sm mx-auto space-y-3 p-5 bg-background rounded-2xl">
      <p className="font-semibold text-2xl text-heading">
        {dict.share.heading}
      </p>
      <div className="flex flex-row">
        <Input
          defaultValue={props.url}
          disabled
          className="text-lg font-semibold p-3"
        />
        <Button
          onClick={async () => {
            await copyToClipboard(props.url, () =>
              toast({
                title: dict.share.copied_message,
              })
            );
          }}
        >
          {dict.share.copy}
        </Button>
      </div>
      <div className="grid grid-cols-3 justify-center p-3 gap-3">
        <WhatsappShareButton url={props.url}>
          <FaWhatsappSquare className="w-16 h-16 fill-primary" />
        </WhatsappShareButton>
        <FacebookShareButton url={props.url}>
          <FaFacebook className="w-16 h-16 fill-blue-600" />
        </FacebookShareButton>
        <TwitterShareButton url={props.url}>
          <FaSquareXTwitter className="w-16 h-16 fill-black" />
        </TwitterShareButton>
      </div>
    </div>
  );
}

const copyToClipboard = async (text: string, action: () => void) => {
  try {
    await navigator.clipboard.writeText(text);
    action();
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};

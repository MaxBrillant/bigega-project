"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Share from "./share";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaShare } from "react-icons/fa6";

export default function SharePopup(props: { url: string; dictionary: any }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="text-lg">
          <FaShare /> {props.dictionary.share.share}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-auto">
        <Share url={props.url} dictionary={props.dictionary} />
      </DialogContent>
    </Dialog>
  );
}

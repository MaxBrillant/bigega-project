import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

type progressProps = {
  step: number;
};
export default function Progress(props: progressProps) {
  const { push } = useRouter();
  return (
    <div className="w-fit py-3 px-7 mx-auto flex flex-row items-center">
      <button
        className={
          props.step >= 0
            ? "flex w-14 h-14 items-center justify-center p-5 rounded-full bg-heading text-background"
            : "flex w-14 h-14 items-center justify-center p-5 rounded-full border-4 text-heading/70 border-highlight"
        }
        onClick={() => {
          if (props.step > 0) {
            push(`/start?step=0`);
          }
        }}
      >
        <p className="font-semibold text-2xl">1</p>
      </button>
      <div
        className={
          props.step > 0 ? "w-10 h-2 bg-heading" : "w-10 h-2 bg-highlight"
        }
      ></div>
      <button
        className={
          props.step >= 1
            ? "flex w-14 h-14 items-center justify-center p-5 rounded-full bg-heading text-background"
            : "flex w-14 h-14 items-center justify-center p-5 rounded-full border-4 text-heading/70 border-highlight"
        }
        onClick={() => {
          if (props.step > 1) {
            push(`/start?step=1`);
          }
        }}
      >
        <p className="font-semibold text-2xl">2</p>
      </button>
      <div
        className={
          props.step > 1 ? "w-10 h-2 bg-heading" : "w-10 h-2 bg-highlight"
        }
      ></div>
      <button
        className={
          props.step >= 2
            ? "flex w-14 h-14 items-center justify-center p-5 rounded-full bg-heading text-background"
            : "flex w-14 h-14 items-center justify-center p-5 rounded-full border-4 text-heading/70 border-highlight"
        }
        onClick={() => {
          if (props.step > 2) {
            push(`/start?step=2`);
          }
        }}
      >
        <p className="font-semibold text-2xl">3</p>
      </button>
    </div>
  );
}

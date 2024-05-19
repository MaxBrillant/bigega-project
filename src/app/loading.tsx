import { CgSpinner } from "react-icons/cg";
export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <CgSpinner className="w-20 h-20 animate-spin fill-heading duration-500" />
    </div>
  );
}

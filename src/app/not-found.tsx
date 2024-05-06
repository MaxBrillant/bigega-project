import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">
        {`Oops, the page you are trying to reach doesn't exist.`}
      </h2>
      <Link href="/">
        <Button>Go to Bigega home page</Button>
      </Link>
    </main>
  );
}

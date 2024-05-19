"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function LanguageSelect(props: { language: "en" | "fr" }) {
  const { refresh } = useRouter();
  const setLanguage = (language: "en" | "fr") => {
    document.cookie = "language=" + (language || "") + "; path=/";
    refresh();
  };
  return (
    <Select
      defaultValue={props.language}
      onValueChange={(value) => setLanguage(value as "en" | "fr")}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="kirundi" disabled>
          Kirundi (Coming soon)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

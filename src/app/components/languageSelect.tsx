"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelect(props: { language: "en" | "fr" }) {
  const setLanguage = async (language: "en" | "fr") => {
    document.cookie = "language=" + (language || "") + "; path=/";
    window.location.reload();
  };
  return (
    <Select
      defaultValue={props.language}
      onValueChange={(value) => setLanguage(value as "en" | "fr")}
    >
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Language" />
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

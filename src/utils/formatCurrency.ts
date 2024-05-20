export function formatAmount(amount: number, language: "en" | "fr") {
  if (language === "fr") {
    const formatter = new Intl.NumberFormat("de-DE");
    return formatter.format(amount);
  } else {
    const formatter = new Intl.NumberFormat("en-EN");
    return formatter.format(amount);
  }
}

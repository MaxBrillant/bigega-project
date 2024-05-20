"use server";

import { cookies, headers } from "next/headers";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  fr: () => import("./fr.json").then((module) => module.default),
  kir: () => import("./kir.json").then((module) => module.default),
};

export const getDictionary = async () => {
  let language;
  const cookieStore = cookies();
  if (cookieStore.get("language")) {
    language = cookieStore.get("language").value;
  } else {
    const headerList = headers();
    language = headerList.get("language");
  }

  return await dictionaries[language]();
};

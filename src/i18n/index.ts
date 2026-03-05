import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import viCommon from "./locales/vi/common.json";
import viAuth from "./locales/vi/auth.json";
import jpCommon from "./locales/jp/common.json";
import jpAuth from "./locales/jp/auth.json";
import krCommon from "./locales/kr/common.json";
import krAuth from "./locales/kr/auth.json";
import cnCommon from "./locales/cn/common.json";
import cnAuth from "./locales/cn/auth.json";

import { languages } from "./types";

const resources = {
  en: { common: enCommon, auth: enAuth },
  vi: { common: viCommon, auth: viAuth },
  jp: { common: jpCommon, auth: jpAuth },
  kr: { common: krCommon, auth: krAuth },
  cn: { common: cnCommon, auth: cnAuth },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: languages.map((lang) => lang.code),
  ns: ["common", "auth"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;

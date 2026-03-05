export const languages = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
  { code: "kr", label: "KR" },
  { code: "jp", label: "JP" },
  { code: "cn", label: "CN" },
] as const

export type LanguageCode = (typeof languages)[number]["code"]

export type Namespace = "common" | "auth"

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_UMS_API_URL?: string;
  readonly VITE_VM_API_URL?: string;
  readonly VITE_PAAS_API_URL?: string;
  readonly VITE_DBAAS_API_URL?: string;
  readonly VITE_VM_LIST_PATH?: string;
  readonly VITE_VM_OWNER_USER_ID?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";

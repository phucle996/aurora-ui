export type SSHMethod = "key" | "password";

export type NewVMForm = {
  name: string;
  description: string;
  region: string;
  zone: string;
  image: string;
  flavor: string;
  network: string;
  publicIpEnabled: boolean;
  sshMethod: SSHMethod;
  sshKeyName: string;
  rootPassword: string;
  userData: string;
};

export type FlavorOption = {
  value: string;
  label: string;
  cpu: number;
  ramGB: number;
  diskGB: number;
  monthlyUSD: number;
};

export const REGION_OPTIONS = [
  { value: "ap-southeast-1", label: "Singapore (APAC)" },
  { value: "ap-northeast-1", label: "Tokyo (APAC)" },
  { value: "us-east-1", label: "Virginia (US)" },
  { value: "eu-central-1", label: "Frankfurt (EU)" },
];

export const ZONE_OPTIONS = [
  { value: "zone-a", label: "Zone A" },
  { value: "zone-b", label: "Zone B" },
  { value: "zone-c", label: "Zone C" },
];

export const IMAGE_OPTIONS = [
  { value: "ubuntu-24.04", label: "Ubuntu 24.04 LTS" },
  { value: "debian-12", label: "Debian 12" },
  { value: "rocky-9", label: "Rocky Linux 9" },
  { value: "windows-2022", label: "Windows Server 2022" },
];

export const FLAVOR_OPTIONS: FlavorOption[] = [
  {
    value: "c2-standard-4",
    label: "c2-standard-4",
    cpu: 4,
    ramGB: 8,
    diskGB: 120,
    monthlyUSD: 39,
  },
  {
    value: "c2-standard-8",
    label: "c2-standard-8",
    cpu: 8,
    ramGB: 16,
    diskGB: 240,
    monthlyUSD: 78,
  },
  {
    value: "m2-memory-8",
    label: "m2-memory-8",
    cpu: 8,
    ramGB: 32,
    diskGB: 240,
    monthlyUSD: 106,
  },
  {
    value: "g1-gpu-4",
    label: "g1-gpu-4",
    cpu: 16,
    ramGB: 64,
    diskGB: 480,
    monthlyUSD: 289,
  },
];

export const NETWORK_OPTIONS = [
  { value: "prod-vpc", label: "prod-vpc / subnet-a" },
  { value: "staging-vpc", label: "staging-vpc / subnet-a" },
  { value: "dev-vpc", label: "dev-vpc / subnet-b" },
];

export const DEFAULT_NEW_VM_FORM: NewVMForm = {
  name: "",
  description: "",
  region: REGION_OPTIONS[0].value,
  zone: ZONE_OPTIONS[0].value,
  image: IMAGE_OPTIONS[0].value,
  flavor: FLAVOR_OPTIONS[0].value,
  network: NETWORK_OPTIONS[0].value,
  publicIpEnabled: true,
  sshMethod: "key",
  sshKeyName: "",
  rootPassword: "",
  userData: "#!/bin/bash\napt-get update -y\n",
};

export const findFlavor = (value: string): FlavorOption =>
  FLAVOR_OPTIONS.find((item) => item.value === value) ?? FLAVOR_OPTIONS[0];

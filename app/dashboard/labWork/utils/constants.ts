export const workTypes = [
  { label: "In-house Work", value: "in-house" },
  { label: "Outside Work", value: "outside" },
];



export interface WorkOption {
  label: string;
  value: string;
  type?: "select" | "text";
  children?: WorkOption[];
}

export const labWorkHierarchy: WorkOption[] = [
  {
    label: "Acrylic",
    value: "Acrylic",
    children: [
      { label: "Denture Partial", value: "Denture Partial" },
      { label: "Denture Complete", value: "Denture Complete" },
      { label: "TXT Box", value: "text", type: "text" },
    ],
  },
  {
    label: "Flexible",
    value: "Flexible",
    children: [
      { label: "Denture Partial", value: "Denture Partial" },
      { label: "Denture Complete", value: "Denture Complete" },
      { label: "TXT Box", value: "text", type: "text" },
    ],
  },
  {
    label: "CPD",
    value: "CPD",
    children: [
      { label: "Occlusal Splints", value: "Occlusal Splints" },
    ],
  },
  {
    label: "Repair",
    value: "Repair",
    children: [
      {
        label: "Night Guard",
        value: "Night Guard",
        children: [
          { label: "Upper Arch", value: "Upper Arch" },
          { label: "Lower Arch", value: "Lower Arch" },
          { label: "Upper & Lower", value: "Upper & Lower" },
        ],
      },
      { label: "TXT Box", value: "text", type: "text" },
    ],
  },
  {
    label: "Rebasing",
    value: "Rebasing",
    children: [
      { label: "Acrylic Crown", value: "Acrylic Crown" },
    ],
  },
  {
    label: "Vaccum Press",
    value: "Vaccum Press",
    children: [
      { label: "Snore Guard", value: "Snore Guard" },
      { label: "Night Guard", value: "Night Guard" },
      { label: "Bleaching Trays", value: "Bleaching Trays" },
      { label: "Ortho Retainer", value: "Ortho Retainer" },
      { label: "TXT Box", value: "text", type: "text" },
    ],
  },
  {
    label: "Wax Up",
    value: "Wax Up",
    children: [
      { label: "Single Unit", value: "Single Unit" },
      { label: "Multiple Units", value: "Multiple Units" },
      { label: "TXT Box", value: "text", type: "text" },
    ],
  },
];

export const archOptions = [
  { label: "Upper Arch", value: "Upper Arch" },
  { label: "Lower Arch", value: "Lower Arch" },
  { label: "Upper & Lower", value: "Upper & Lower" },
];

export const shadeSystems = [
  { label: "Vita Classic", value: "vita-classic" },
  { label: "3D Shade Guide", value: "3d-shade-guide" },
  { label: "Custom Text", value: "text" },
];

export const labStatusOptions = [
  { label: "Plan", value: "plan" },
  { label: "Sent", value: "sent" },
  { label: "In-progress", value: "in-progress" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

export const titles = [
  { label: "Mr.", value: "Mr." },
  { label: "Mrs.", value: "Mrs." },
  { label: "Ms.", value: "Ms." },
  { label: "Dr.", value: "Dr." },
]

export const initialValues = {
  title: titles[0],
  name: "",
  backgroundVideo: "",
  username: "",
  experience: "",
  reviews: [{ description: "", rating: "", dateInfo: "", name: "" }],
  expertise: [],
  languages: [],
  licence: "",
  addresses: {
    residential: "",
    office: "",
    other: "",
  },
  availability: [],
  time: "",
  link: "",
  charges: "",
  bio: "",
  password: "",
  confirmPassword: "",
  phones: [
    { number: "", primary: true },
    { number: "", primary: false },
    { number: "", primary: false },
    { number: "", primary: false },
  ],
  emails: [
    { email: "", primary: true },
    { email: "", primary: false },
  ],
  bankAccounts: [
  {
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    primary: true,
  },
],
  code: "",
  qualifications: "",
  professionalInfo: "",
  pic: { file: [] },
  aboutMe: {
    title: "About Me",
    paragraphs: [""],
  },
  affiliations: [],
  services: [],
  conditions: [],
  vaccinations: [
    {
      type: "",
      dateAdministered: "",
      nextDueDate: "",
      reminder: false,
      remarks: "",
    },
  ],
  insurances: [
    {
      type: "",
      startDate: "",
      renewalDate: "",
      amountInsured: "",
      amountPaid: "",
      remarks: "",
    },
  ],
  stats: [
    { value: "", label: "YEARS OF EXPERIENCE" },
    { value: "", label: "HOURS OF THERAPY" },
    { value: "", label: "HOURS IN ASSESSMENT" },
  ],
};



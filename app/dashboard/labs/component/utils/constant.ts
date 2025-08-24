import { genderOptions } from "../../../../config/constant";

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
  dob:"",
  gender:genderOptions[0],
  languages: ['english'],
  addresses: {
    residential: "",
    office: "",
    other: "",
  },
  bio: "",
  password: "",
  confirmPassword: "",
  phones: [
    { number: "", primary: true },
    { number: "", primary: false },
    { number: "", primary: false },
    { number: "", primary: false },
  ],
  staff: [
    {
      name: "",
      email: "",
      phone: "",
    },
  ],
  emails: [
    { email: "", primary: true },
    { email: "", primary: false },
  ],
  code: "",
  pic: { file: [] },
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
  items: [
  {
    itemName: "",
    itemCode: "",
    quantity: 0,
    price: 0,
    total: 0,
  }
]
};
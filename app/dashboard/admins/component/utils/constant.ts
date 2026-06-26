export const titles = [
  { label: "Mr.", value: "Mr." },
  { label: "Mrs.", value: "Mrs." },
  { label: "Ms.", value: "Ms." },
  { label: "Dr.", value: "Dr." },
];

export const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export const initialValues = {
  title: titles[0],
  name: "",
  username: "",
  dob: "",
  age: "",
  gender: genderOptions[0],
  languages: [],
  address: "",
  bio: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  code: "",
  pic: { file: [] },

  // NEW FIELDS
  companyName: "",
  companyCode: "",
  companyType: "company",
  addressInfo: [
    {
      address: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
    },
  ],
};

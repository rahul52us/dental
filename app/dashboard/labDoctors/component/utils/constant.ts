export const initialValues = {
  labDoctorName: "",
  dob: null,
  gender: { label: "Male", value: 1 },
  languages: [],
  address: "",
  mobileNumber: "",
  email: "",
  staffDetails: [],
  pic: {
    name: "",
    url: "",
    type: "",
  },
};

export const genders = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Other", value: 3 },
];

export const languagesList = [
  { label: "English", value: "English" },
  { label: "Hindi", value: "Hindi" },
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
];

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
  refrenceBy:null,
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
  pic: { file: [] },
  insurances: [],
  medicalHistory: {
  allergies: { checked: false, text: "" },
  bloodPressure: { checked: false, text: "" },
  heartDisease: { checked: false, text: "" },
  pacemaker: { checked: false, text: "" },
  diabetes: { checked: false, text: "" },
  asthma: { checked: false, text: "" },
  smoking: { checked: false, text: "" },
  tobacco: { checked: false, text: "" },
  kidneyDisease: { checked: false, text: "" },
  tuberculosis: { checked: false, text: "" },
  hepatitis: { checked: false, text: "" },
  alcohol: { checked: false, text: "" },
  bloodTransfusion: { checked: false, text: "" },
  cancer: { checked: false, text: "" },
  neurologic: { checked: false, text: "" },
  epilepsy: { checked: false, text: "" },
  aids: { checked: false, text: "" },
  hiv: { checked: false, text: "" },
  anaemia: { checked: false, text: "" },
  other: { checked: false, text: "" },
}
};
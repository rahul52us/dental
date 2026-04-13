import * as Yup from "yup";

export const labDoctorValidationSchema = Yup.object({
  labDoctorName: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email"),
  mobileNumber: Yup.string().required("Mobile number is required"),
  dob: Yup.date().required("Date of birth is required"),
  gender: Yup.mixed().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  languages: Yup.array().min(1, "At least one language is required"),
});

 // Updated validation schema for phoneNumbers, emails, addresses
 import * as Yup from "yup";

 export const createValidationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),
        gender: Yup.mixed().required("Gender is required"),
    dob: Yup.mixed().required('dob  is required'),
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username is required"),
    phones: Yup.array().of(
      Yup.object().shape({
        number: Yup.string()
          .matches(
            /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
            "Phone number is not valid"
          )
          .required("Phone number is required"),
      })
    ),
    emails: Yup.array().of(
  Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    primary: Yup.boolean().required("Primary field is required"),
  })
).required("At least one email is required")
 .min(1, "At least one email is required")
 .test(
   "one-primary-email",
   "Exactly one email must be marked as primary",
   (emails) => {
     if (!emails || emails.length === 0) return false;
     const primaryCount = emails.filter((e) => e.primary).length;
     return primaryCount === 1;
   }
 ),
    addresses: Yup.object().shape({
      residential: Yup.string().required("Residential address is required"),
      office: Yup.string().required("Office address is required"),
      other: Yup.string(),
    }),
    languages: Yup.array(),
    bio: Yup.string().required("Bio is required"),
    medicalHistory: Yup.string().required("medical history is required"),
   password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
    code: Yup.string().optional(),
    vaccinations: Yup.array().of(
      Yup.object().shape({
        type: Yup.mixed().required("Vaccine type is required"),
        dateAdministered: Yup.string().required(
          "Date administered is required"
        ),
        nextDueDate: Yup.string().nullable(),
        reminder: Yup.mixed(),
        remarks: Yup.string().nullable(),
      })
    ),
    insurances: Yup.array().of(
      Yup.object().shape({
        type: Yup.mixed().required("Insurance type is required"),
        startDate: Yup.string().required("Start date is required"),
        renewalDate: Yup.string().required("Renewal date is required"),
        amountInsured: Yup.number()
          .required("Amount insured is required")
          .positive("Amount insured must be positive")
          .typeError("Amount insured must be a valid number"),
        amountPaid: Yup.number()
          .required("Amount paid is required")
          .min(0, "Amount paid cannot be negative")
          .typeError("Amount paid must be a valid number"),
        remarks: Yup.string().nullable(),
      })
    ),
    bankAccounts: Yup.array()
    .of(
      Yup.object().shape({
        accountHolder: Yup.string().required("Account holder name is required"),
        bankName: Yup.string().required("Bank name is required"),
        accountNumber: Yup.string()
          .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
          .required("Account number is required"),
        ifscCode: Yup.string()
          .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
          .required("IFSC code is required"),
        branch: Yup.string().required("Branch name is required"),
        primary: Yup.boolean().required("Primary field is required"),
      })
    )
    .required("At least one bank account is required")
    .min(1, "At least one bank account is required")
    .test(
      "one-primary-bank",
      "Exactly one bank account must be marked as primary",
      (accounts) => {
        if (!accounts || accounts.length === 0) return false;
        return accounts.filter((a) => a.primary).length === 1;
      }
    ),
  });

export const updateValidationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),
    gender: Yup.mixed().required("Gender is required"),
    username: Yup.string().required("Username is required"),
    phones: Yup.array().of(
      Yup.object().shape({
        number: Yup.string()
          .matches(
            /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
            "Phone number is not valid"
          )
          .required("Phone number is required"),
      })
    ),
    emails: Yup.array().of(
  Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    primary: Yup.boolean().required("Primary field is required"),
  })
).required("At least one email is required")
 .min(1, "At least one email is required")
 .test(
   "one-primary-email",
   "Exactly one email must be marked as primary",
   (emails) => {
     if (!emails || emails.length === 0) return false;
     const primaryCount = emails.filter((e) => e.primary).length;
     return primaryCount === 1;
   }
 ),
    addresses: Yup.object().shape({
      residential: Yup.string().required("Residential address is required"),
      office: Yup.string().required("Office address is required"),
      other: Yup.string(),
    }),
    languages: Yup.array(),
    bio: Yup.string().required("Bio is required"),
    medicalHistory: Yup.string().required("medical history is required"),
       code: Yup.string().optional(),
    vaccinations: Yup.array().of(
      Yup.object().shape({
        type: Yup.mixed().required("Vaccine type is required"),
        dateAdministered: Yup.string().required(
          "Date administered is required"
        ),
        nextDueDate: Yup.string().nullable(),
        reminder: Yup.mixed(),
        remarks: Yup.string().nullable(),
      })
    ),
    insurances: Yup.array().of(
      Yup.object().shape({
        type: Yup.mixed().required("Insurance type is required"),
        startDate: Yup.string().required("Start date is required"),
        renewalDate: Yup.string().required("Renewal date is required"),
        amountInsured: Yup.number()
          .required("Amount insured is required")
          .positive("Amount insured must be positive")
          .typeError("Amount insured must be a valid number"),
        amountPaid: Yup.number()
          .required("Amount paid is required")
          .min(0, "Amount paid cannot be negative")
          .typeError("Amount paid must be a valid number"),
        remarks: Yup.string().nullable(),
      })
    ),
    bankAccounts: Yup.array()
    .of(
      Yup.object().shape({
        accountHolder: Yup.string().required("Account holder name is required"),
        bankName: Yup.string().required("Bank name is required"),
        accountNumber: Yup.string()
          .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
          .required("Account number is required"),
        ifscCode: Yup.string()
          .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
          .required("IFSC code is required"),
        branch: Yup.string().required("Branch name is required"),
        primary: Yup.boolean().required("Primary field is required"),
      })
    )
    .required("At least one bank account is required")
    .min(1, "At least one bank account is required")
    .test(
      "one-primary-bank",
      "Exactly one bank account must be marked as primary",
      (accounts) => {
        if (!accounts || accounts.length === 0) return false;
        return accounts.filter((a) => a.primary).length === 1;
      }
    ),
  });
import {
  SimpleGrid,
  Button,
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FieldArray, Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { removeDataByIndex } from "../../../config/utils/utils";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import { titles } from "./utils/constant";
import { generateIntialValues } from "./utils/function";
import VaccinationHistorySection from "./formElement/VaccinationHistory";
import InsuranceDetailsSection from "./formElement/InsuranceDetailsSection";
import AvailabilityAuthSection from "./formElement/AvailabilityAuthSection";
import PhoneNumbersInput from "./formElement/PhoneNumbersInputSection";
import EmailsInput from "./formElement/EmailInputs";
import BankDetailsInput from "./formElement/BankDetailsInput";
import AddressesInput from "./formElement/AddressInput";

const Form = ({ initialData, onSubmit, isOpen, onClose, isEdit }: any) => {
  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  // Updated validation schema for phoneNumbers, emails, addresses
  const validationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    backgroundVideo: Yup.mixed(),
    link: Yup.mixed().required("Link is required"),
    pic: Yup.mixed(),
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username is required"),

    phoneNumbers: Yup.array()
      .of(
        Yup.string()
          .matches(
            /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/,
            "Phone number is not valid"
          )
          .required("Phone number is required")
      )
      .length(4, "Exactly 4 phone numbers are required"),

    emails: Yup.array()
      .of(Yup.string().email("Invalid email").required("Email is required"))
      .length(2, "Exactly 2 emails are required"),

    addresses: Yup.object().shape({
      residential: Yup.string().required("Residential address is required"),
      office: Yup.string().required("Office address is required"),
      other: Yup.string(),
    }),

    languages: Yup.array(),
    licence: Yup.string(),
    expertise: Yup.array()
      .min(1, "At least one expertise tag is required")
      .required("Expertise is required"),
    time: Yup.string().required("Time is required"),
    charges: Yup.number()
      .required("Charges are required")
      .positive("Charges must be a positive number")
      .typeError("Charges must be a valid number"),
    bio: Yup.string().required("Bio is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password"), null],
      "Passwords must match"
    ),
    code: Yup.string().optional(),
    qualifications: Yup.string().required("Qualifications are required"),
    professionalInfo: Yup.string().required(
      "Professional Information is required"
    ),
    aboutMe: Yup.object().shape({
      paragraphs: Yup.array().of(
        Yup.string().required("Paragraph is required")
      ),
    }),
    vaccinations: Yup.array().of(
      Yup.object().shape({
        type: Yup.string().required("Vaccine type is required"),
        dateAdministered: Yup.string().required(
          "Date administered is required"
        ),
        nextDueDate: Yup.string().nullable(),
        reminder: Yup.boolean(),
        remarks: Yup.string().nullable(),
      })
    ),
    insurances: Yup.array().of(
      Yup.object().shape({
        type: Yup.string().required("Insurance type is required"),
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
    services: Yup.array().min(1, "At least one service is required"),
    conditions: Yup.array().min(1, "At least one condition is required"),
    affiliations: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required("Affiliation title is required"),
        organization: Yup.string().required("Organization is required"),
        location: Yup.string().required("Location is required"),
      })
    ),
    stats: Yup.array().of(
      Yup.object().shape({
        value: Yup.string().required("Value is required"),
        label: Yup.string().required("Label is required"),
      })
    ),
  });

  return (
    isOpen && (
      <Formik
        initialValues={formData}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={async (values: any) => {
          onSubmit(values);
        }}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          errors,
          touched,
        }: any) => {
          return (
            <FormikForm onSubmit={handleSubmit}>
              <Box display="flex" justifyContent="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  {initialData?.username ? "Edit Therapist" : ""}
                </Text>
                <Button colorScheme="red" size="sm" onClick={onClose}>
                  Close
                </Button>
              </Box>

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                mb={6}
                alignItems="center"
              >
                {/* Section 1: Personal Info */}
                <GridItem colSpan={2}>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Personal Information
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                    {/* Pic Upload */}
                    <Box width="100%">
                      {values?.pic?.file?.length === 0 ? (
                        <CustomInput
                          type="file-drag"
                          name="pic"
                          value={values.pic}
                          isMulti={true}
                          accept="image/*"
                          onChange={(e: any) => {
                            setFieldValue("pic", {
                              ...values.pic,
                              file: e.target.files[0],
                              isAdd: 1,
                            });
                          }}
                          error={errors.pic}
                        />
                      ) : (
                        <Box mt={-5} width="100%">
                          <ShowFileUploadFile
                            files={values.pic?.file}
                            removeFile={() => {
                              setFieldValue("pic", {
                                ...values.image,
                                file: removeDataByIndex(values.pic, 0),
                                isDeleted: 1,
                              });
                            }}
                            edit={isEdit}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Basic Details */}
                    <Grid
                      gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={5}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
                      mt={3}
                    >
                      <CustomInput
                        label="Title"
                        name="title"
                        type="select"
                        options={titles}
                        value={values.title}
                        onChange={(e: any) => setFieldValue("title", e)}
                        error={errors.title && touched.title}
                        showError={errors.title && touched.title}
                      />
                      <CustomInput
                        label="Name"
                        name="name"
                        placeholder="Enter Name"
                        value={values.name}
                        onChange={handleChange}
                        error={errors.name && touched.name}
                        showError={errors.name && touched.name}
                      />
                      <CustomInput
                        label="Username"
                        name="username"
                        placeholder="Enter Username"
                        value={values.username}
                        onChange={handleChange}
                        error={errors.username && touched.username}
                        showError={errors.username && touched.username}
                      />
                      <CustomInput
                        label="Code"
                        name="code"
                        placeholder="Enter Code"
                        value={values.code}
                        onChange={handleChange}
                        error={errors.code && touched.code}
                        showError={errors.code && touched.code}
                      />
                      <CustomInput
                        label="Link"
                        name="link"
                        placeholder="Enter Link"
                        value={values.link}
                        onChange={handleChange}
                        error={errors.link && touched.link}
                        showError={errors.link && touched.link}
                      />
                      <CustomInput
                        label="Background Video"
                        name="backgroundVideo"
                        placeholder="Enter Background Video"
                        value={values.backgroundVideo}
                        onChange={handleChange}
                        error={
                          errors.backgroundVideo && touched.backgroundVideo
                        }
                        showError={
                          errors.backgroundVideo && touched.backgroundVideo
                        }
                      />
                    </Grid>
                    <Box
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
                      fontWeight="bold"
                      mt={3}
                      p={3}
                    >
                      <CustomInput
                        label="Bio"
                        name="bio"
                        type="textarea"
                        placeholder="Enter Bio"
                        value={values.bio}
                        onChange={handleChange}
                        error={errors.bio && touched.bio}
                        showError={errors.bio && touched.bio}
                        style={{ width: "100%" }}
                      />
                    </Box>
                    <Box
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
                      fontWeight="bold"
                      mt={3}
                      p={3}
                    >
                      <CustomInput
                        label="Medical History"
                        name="medicalHistory"
                        type="textarea"
                        placeholder="Enter your medical history here"
                        value={values.medicalHistory}
                        onChange={handleChange}
                        error={errors.medicalHistory && touched.medicalHistory}
                        showError={
                          errors.medicalHistory && touched.medicalHistory
                        }
                      />
                    </Box>
                    <PhoneNumbersInput
                      values={values}
                      setFieldValue={setFieldValue}
                      errors={errors}
                    />
                    <EmailsInput
                      values={values}
                      setFieldValue={setFieldValue}
                      errors={errors}
                    />
                    <AddressesInput
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                    />
                    {/* Bio */}

                    {/* Medical History */}
                  </SimpleGrid>
                </GridItem>

                {/* Section 2: Professional Info */}
                <GridItem colSpan={2}>
                  <Text fontSize="lg" fontWeight="bold" mb={4} color="teal.600">
                    Professional Information
                  </Text>
                  <SimpleGrid
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg="white"
                    mt={3}
                    columns={{ base: 1, md: 2 }}
                    spacing={4}
                  >
                    <CustomInput
                      label="Experience"
                      name="experience"
                      placeholder="Enter Experience"
                      value={values.experience}
                      onChange={handleChange}
                      error={errors.experience && touched.experience}
                      showError={errors.experience && touched.experience}
                    />
                    <CustomInput
                      label="Expertise"
                      name="expertise"
                      placeholder="Add Expertise"
                      value={values.expertise}
                      onChange={(newTags: any) =>
                        setFieldValue("expertise", newTags)
                      }
                      type="tags"
                      error={errors.expertise && touched.expertise}
                      showError={errors.expertise && touched.expertise}
                    />
                    <CustomInput
                      label="Qualifications"
                      name="qualifications"
                      placeholder="Enter Qualifications"
                      value={values.qualifications}
                      onChange={handleChange}
                      error={errors.qualifications && touched.qualifications}
                      showError={
                        errors.qualifications && touched.qualifications
                      }
                    />
                    <CustomInput
                      label="Charges"
                      name="charges"
                      placeholder="Enter Charges"
                      value={values.charges}
                      onChange={handleChange}
                      error={errors.charges && touched.charges}
                      showError={errors.charges && touched.charges}
                    />
                    <CustomInput
                      label="Licence"
                      name="licence"
                      placeholder="Enter Licence"
                      value={values.licence}
                      onChange={handleChange}
                      error={errors.licence && touched.licence}
                      showError={errors.licence && touched.licence}
                    />
                    <CustomInput
                      label="Languages"
                      name="languages"
                      placeholder="Add Language"
                      value={values.languages}
                      onChange={(newTags: any) =>
                        setFieldValue("languages", newTags)
                      }
                      type="tags"
                      error={errors.languages && touched.languages}
                      showError={errors.languages && touched.languages}
                    />
                    <CustomInput
                      label="Professional Information"
                      name="professionalInfo"
                      placeholder="Enter Professional Information"
                      value={values.professionalInfo}
                      onChange={handleChange}
                      error={
                        errors.professionalInfo && touched.professionalInfo
                      }
                      showError={
                        errors.professionalInfo && touched.professionalInfo
                      }
                    />
                  </SimpleGrid>
                </GridItem>

                <VaccinationHistorySection
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                  handleChange={handleChange}
                />
                <InsuranceDetailsSection
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                  handleChange={handleChange}
                />
                <BankDetailsInput
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                />
                <AvailabilityAuthSection
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                  isEdit={isEdit}
                />
              </Grid>

              <Flex justifyContent="flex-end" mt={4}>
                <Flex gap={4}>
                  <Button
                    colorScheme="red"
                    size="lg"
                    onClick={onClose}
                    _hover={{ bg: "red.500" }}
                    width="auto"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={isSubmitting}
                    loadingText="Submitting"
                    size="lg"
                    _hover={{ bg: "teal.500" }}
                    width="auto"
                  >
                    {initialData?.username ? "Update" : "Add"} Therapist
                  </Button>
                </Flex>
              </Flex>
            </FormikForm>
          );
        }}
      </Formik>
    )
  );
};

export default Form;

import {
  SimpleGrid,
  Button,
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import { removeDataByIndex } from "../../../config/utils/utils";
import { titles, genderOptions } from "./utils/constant";
import { generateIntialValues } from "./utils/function";
import { calculateAgeSafe } from "../../../config/utils/function";

const Form = ({ initialData, onSubmit, isOpen, onClose, isEdit, isLoading }: any) => {
  const [formData, setFormData] = useState<any>(initialData);
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  useEffect(() => {
    if (initialData) {
      const generatedValues = generateIntialValues(initialData);
      setFormData(generatedValues);
    }
  }, [initialData]);

  // VALIDATION SCHEMA
  const validationSchema = Yup.object({
    // Personal
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed().required("Picture is required"),

    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username is required"),

    bio: Yup.string().required("Special Details is required"),
    address: Yup.string().required("Address is required"),
    dob: Yup.date().required("Date of Birth is required"),
    gender: Yup.mixed().required("Gender is required"),

    phoneNumber: Yup.string()
      .matches(/^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/, "Phone number is not valid")
      .required("Phone number is required"),

    password: !isEdit
      ? Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required")
      : Yup.string().optional(),

    confirmPassword: !isEdit
      ? Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match")
      : Yup.string().optional(),

    code: Yup.string().required("Code is required"),
    link: Yup.string().required("Link is required"),

    // Company Fields
    companyName: Yup.string().required("Company name is required"),
    companyCode: Yup.string().required("Company code is required"),
    companyType: Yup.string().required("Company type is required"),
  });

  if (!isOpen) return null;

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={async (values: any) => {
        const payload = { ...values };
        // Do not send password if it's an edit or if the password is empty
        if (isEdit || !payload.password) {
          delete payload.password;
          delete payload.confirmPassword;
        }
        onSubmit(payload);
      }}
    >
      {({
        values,
        handleChange,
        handleSubmit,
        setFieldValue,
        errors,
        touched,
      }: any) => {
        return (
          <FormikForm onSubmit={handleSubmit}>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={6}
              mb={6}
              alignItems="center"
            >
              {/* PERSONAL INFORMATION */}
              <GridItem colSpan={2}>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Personal Information
                </Text>

                <SimpleGrid columns={{ base: 1 }} spacing={4}>
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
                      <Box mt={-5}>
                        <ShowFileUploadFile
                          files={values.pic?.file}
                          removeFile={() => {
                            setFieldValue("pic", {
                              ...values.pic,
                              file: removeDataByIndex(values.pic, 0),
                              isDeleted: 1,
                            });
                          }}
                          edit={isEdit}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Grid Fields */}
                  <Grid
                    gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={5}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
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
                      label="Phone Number"
                      name="phoneNumber"
                      placeholder="Enter Phone Number"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      error={errors.phoneNumber && touched.phoneNumber}
                      showError={errors.phoneNumber && touched.phoneNumber}
                    />

                    <CustomInput
                      label="Date of Birth"
                      type="date"
                      name="dob"
                      value={values.dob || ""}
                      onChange={handleChange}
                      error={errors?.dob && touched.dob}
                      showError={errors?.dob && touched.dob}
                    />
                    <CustomInput
                      label="Age"
                      name="age"
                      type="number"
                      value={calculateAgeSafe(values?.dob) ?? ""}
                      disabled={true}
                      placeholder="Auto Calculated"
                    />

                    <CustomInput
                      label="Gender"
                      name="gender"
                      type="select"
                      options={genderOptions}
                      value={values.gender}
                      onChange={(e: any) => setFieldValue("gender", e)}
                      error={errors.gender && touched.gender}
                      showError={errors.gender && touched.gender}
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
                  </Grid>

                  {/* BIO */}
                  <Box
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                    p={3}
                  >
                    <CustomInput
                      label="Special Details"
                      name="bio"
                      type="textarea"
                      placeholder="Enter Special Details"
                      value={values.bio}
                      onChange={handleChange}
                      error={errors.bio && touched.bio}
                      showError={errors.bio && touched.bio}
                    />
                  </Box>

                  {/* ADDRESS */}
                  <Box
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                    p={3}
                  >
                    <CustomInput
                      label="Address"
                      name="address"
                      type="textarea"
                      placeholder="Enter Address"
                      value={values.address}
                      onChange={handleChange}
                      error={errors.address && touched.address}
                      showError={errors.address && touched.address}
                    />
                  </Box>
                </SimpleGrid>
              </GridItem>

              {/* COMPANY INFORMATION */}
              <GridItem colSpan={2}>
                <Box
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  boxShadow="sm"
                  bg={bgBox}
                  mt={3}
                  borderColor={borderColor}
                >
                  <Text fontSize="lg" fontWeight="bold" mb={4} color="brand.600">
                    Company Information
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <CustomInput
                      label="Company Name"
                      name="companyName"
                      placeholder="Enter company name"
                      value={values.companyName}
                      onChange={handleChange}
                      error={errors.companyName && touched.companyName}
                      showError={errors.companyName && touched.companyName}
                    />

                    <CustomInput
                      label="Company Code"
                      name="companyCode"
                      placeholder="Enter company code"
                      value={values.companyCode}
                      onChange={handleChange}
                      error={errors.companyCode && touched.companyCode}
                      showError={errors.companyCode && touched.companyCode}
                    />

                    <CustomInput
                      label="Company Type"
                      name="companyType"
                      placeholder="Enter company type"
                      value={values.companyType}
                      onChange={handleChange}
                      error={errors.companyType && touched.companyType}
                      showError={errors.companyType && touched.companyType}
                    />

                    <CustomInput
                      label="Subscription Start Date"
                      type="date"
                      name="subscriptionStartDate"
                      value={values.subscriptionStartDate || ""}
                      onChange={handleChange}
                      error={errors.subscriptionStartDate && touched.subscriptionStartDate}
                      showError={errors.subscriptionStartDate && touched.subscriptionStartDate}
                    />

                    <CustomInput
                      label="Subscription End Date"
                      type="date"
                      name="subscriptionEndDate"
                      value={values.subscriptionEndDate || ""}
                      onChange={handleChange}
                      error={errors.subscriptionEndDate && touched.subscriptionEndDate}
                      showError={errors.subscriptionEndDate && touched.subscriptionEndDate}
                    />

                    <FormControl display="flex" alignItems="center" mt={6}>
                      <FormLabel htmlFor="is_active" mb="0">
                        Active Status
                      </FormLabel>
                      <Switch
                        id="is_active"
                        name="is_active"
                        colorScheme="green"
                        isChecked={values.is_active}
                        onChange={(e) => setFieldValue("is_active", e.target.checked)}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>
              </GridItem>

              {/* PASSWORD SECTION (Only when adding) */}
              {!isEdit && (
                <GridItem colSpan={2}>
                  <Box
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      mb={4}
                      color="brand.600"
                    >
                      Authentication
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <CustomInput
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter Password"
                        value={values.password}
                        onChange={handleChange}
                        error={errors.password && touched.password}
                        showError={errors.password && touched.password}
                      />
                      <CustomInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        error={
                          errors.confirmPassword && touched.confirmPassword
                        }
                        showError={
                          errors.confirmPassword && touched.confirmPassword
                        }
                      />
                    </SimpleGrid>
                  </Box>
                </GridItem>
              )}
            </Grid>

            {/* BUTTONS */}
            <Flex justifyContent="flex-end" mt={4}>
              <Flex gap={4}>
                <Button colorScheme="red" size="lg" onClick={onClose}>
                  Close
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={isLoading}
                  size="lg"
                >
                  {isEdit ? "Update" : "Add"} Admin
                </Button>
              </Flex>
            </Flex>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

export default Form;

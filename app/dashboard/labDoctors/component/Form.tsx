"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { genderOptions } from "../../../config/constant";
import { languagesList } from "./utils/constant";
import { labDoctorValidationSchema } from "./utils/validation";

const Form = observer(({ loading, initialData, onSubmit, isOpen, onClose, isEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    labDoctorName: "",
    dob: "",
    gender: "",
    languages: [],
    address: "",
    mobileNumber: "",
    email: "",
  });

  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        gender: genderOptions.find((g: any) => g.value === initialData.gender) || "",
        languages: initialData.languages?.map((l: string) => ({ label: l, value: l })) || [],
        dob: initialData.dob ? new Date(initialData.dob).toISOString().split("T")[0] : "",
      });
    } else {
      setFormData({
        labDoctorName: "",
        dob: "",
        gender: "",
        languages: [],
        address: "",
        mobileNumber: "",
        email: "",
      });
    }
  }, [initialData, isOpen]);

  return (
    isOpen && (
      <Formik
        initialValues={formData}
        validationSchema={labDoctorValidationSchema}
        enableReinitialize={true}
        onSubmit={async (values: any) => {
          onSubmit({
            ...values,
            gender: values.gender?.value || values.gender,
            languages: values.languages?.map((l: any) => l.value || l) || [],
          });
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
              <Grid templateColumns="1fr" gap={6} mb={6}>
                <GridItem>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                      {isEdit ? "Edit Lab Doctor" : "New Lab Doctor"}
                    </Text>
                    <HStack spacing={3}>
                      <Button
                        variant="outline"
                        colorScheme="red"
                        onClick={onClose}
                        borderRadius="xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        colorScheme="brand"
                        isLoading={loading}
                        borderRadius="xl"
                        shadow="md"
                        _hover={{
                          bg: "brand.600",
                          shadow: "lg",
                          transform: "translateY(-1px)",
                        }}
                      >
                        {isEdit ? "Update" : "Save"}
                      </Button>
                    </HStack>
                  </Flex>
                </GridItem>

                <GridItem>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} p={5} borderWidth={1} borderRadius="xl" bg={bgBox} borderColor={borderColor} boxShadow="sm">
                    <CustomInput
                      label="Doctor Name"
                      name="labDoctorName"
                      placeholder="Enter Name"
                      value={values.labDoctorName}
                      onChange={handleChange}
                      required={true}
                      error={errors.labDoctorName && touched.labDoctorName}
                      showError={errors.labDoctorName && touched.labDoctorName}
                    />
                    <CustomInput
                      label="Email"
                      name="email"
                      placeholder="Enter Email"
                      value={values.email}
                      onChange={handleChange}
                      error={errors.email && touched.email}
                      showError={errors.email && touched.email}
                    />
                    <CustomInput
                      label="Mobile Number"
                      name="mobileNumber"
                      placeholder="Enter Mobile Number"
                      value={values.mobileNumber}
                      onChange={handleChange}
                      required={true}
                      error={errors.mobileNumber && touched.mobileNumber}
                      showError={errors.mobileNumber && touched.mobileNumber}
                    />
                    <CustomInput
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={values.dob}
                      onChange={handleChange}
                      required={true}
                      error={errors.dob && touched.dob}
                      showError={errors.dob && touched.dob}
                    />
                    <CustomInput
                      label="Gender"
                      name="gender"
                      type="select"
                      options={genderOptions}
                      value={values.gender}
                      onChange={(e: any) => setFieldValue("gender", e)}
                      required={true}
                      error={errors.gender && touched.gender}
                      showError={errors.gender && touched.gender}
                    />
                    <CustomInput
                      label="Languages"
                      name="languages"
                      type="select"
                      isMulti={true}
                      options={languagesList}
                      value={values.languages}
                      onChange={(e: any) => setFieldValue("languages", e)}
                      required={true}
                      error={errors.languages && touched.languages}
                      showError={errors.languages && touched.languages}
                    />
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <CustomInput
                        label="Address"
                        name="address"
                        type="textarea"
                        placeholder="Enter Address"
                        value={values.address}
                        onChange={handleChange}
                        required={true}
                        error={errors.address && touched.address}
                        showError={errors.address && touched.address}
                      />
                    </GridItem>
                  </SimpleGrid>
                </GridItem>
              </Grid>
            </FormikForm>
          );
        }}
      </Formik>
    )
  );
});

export default Form;

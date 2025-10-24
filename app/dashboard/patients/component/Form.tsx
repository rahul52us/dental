'use client'
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
import { Formik, Form as FormikForm } from "formik";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { removeDataByIndex } from "../../../config/utils/utils";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import { generateIntialValues } from "./utils/function";
import InsuranceDetailsSection from "./formElement/InsuranceDetailsSection";
import AvailabilityAuthSection from "./formElement/AvailabilityAuthSection";
import PhoneNumbersInput from "./formElement/PhoneNumbersInputSection";
import EmailsInput from "./formElement/EmailInputs";
import AddressesInput from "./formElement/AddressInput";
import { createValidationSchema, updateValidationSchema } from "./utils/validation";
import { genderOptions } from "../../../config/constant";
import MedicalHistorySection from "./formElement/MedicalHistory";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import DegreeInfo from "./formElement/DegreeInfo";

const Form = observer(({ loading, initialData, onSubmit, isOpen, onClose, isEdit }: any) => {
  const  {dashboardStore : {getMasterOptions}} = stores
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  return (
    isOpen && formData && (
      <Formik
        initialValues={formData}
        validationSchema={isEdit ? updateValidationSchema : createValidationSchema}
        enableReinitialize={true}
        onSubmit={async (values: any) => {
          onSubmit(values);
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
                        options={getMasterOptions('titles')}
                        required={true}
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
                        required={true}
                        onChange={handleChange}
                        error={errors?.name}
                        showError={errors.name && touched.name}
                      />
                      <CustomInput
                        label="Date Of birth"
                        type="date"
                        name={`dob`}
                        value={values.dob || ""}
                        onChange={handleChange}
                        required={true}
                        error={errors?.dob}
                        showError={errors?.dob}
                      />
                      <CustomInput
                        label="Gender"
                        name="gender"
                        type="select"
                        options={genderOptions}
                        required={true}
                        value={values.gender}
                        onChange={(e: any) => setFieldValue("gender", e)}
                        error={errors.gender}
                        showError={errors.gender}
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
                        error={errors.languages}
                        showError={errors.languages}
                      />
                      <CustomInput
                        label="Background Image"
                        name="backgroundVideo"
                        placeholder="Enter Background Image"
                        value={values.backgroundVideo}
                        onChange={handleChange}
                        error={
                          errors.backgroundVideo && touched.backgroundVideo
                        }
                        showError={
                          errors.backgroundVideo && touched.backgroundVideo
                        }
                      />
                      <CustomInput
                          name="refrenceBy"
                          placeholder="Refrence By (Patient)"
                          type="real-time-user-search"
                          label="Refrence By (Patient)"
                          value={values.refrenceBy}
                          options={values?.refrenceBy ? [values?.refrenceBy || {}] : []}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `refrenceBy`,
                              e
                            )
                          }
                          error={errors?.refrenceBy}
                          showError={errors?.refrenceBy}
                          query={{type : "patient"}}
                        />
                    </Grid>
                    <Box
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
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
                        error={errors.bio}
                        showError={errors.bio}
                        style={{ width: "100%" }}
                      />
                    </Box>
                    {/* <Box
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
                      mt={3}
                      p={3}
                    >
                      <CustomInput
                        label="Medical/Dental History"
                        name="medicalHistory"
                        type="textarea"
                        required={true}
                        placeholder="Enter your medical history here"
                        value={values.medicalHistory}
                        onChange={handleChange}
                        error={errors.medicalHistory}
                        showError={errors.medicalHistory}
                      />
                    </Box> */}
                    <MedicalHistorySection values={values} setFieldValue={setFieldValue} />
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
                    {false &&<DegreeInfo
                      setFieldValue={setFieldValue}
                      values={values}
                      errors={errors}
                      handleChange={handleChange}
                    />}
                    <AddressesInput
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                    />
                  </SimpleGrid>
                </GridItem>
                <InsuranceDetailsSection
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                  handleChange={handleChange}
                />
                {false && <AvailabilityAuthSection
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                  isEdit={isEdit}
                />}
              </Grid>

              <Flex justifyContent="flex-end" mt={4}>
                <Flex gap={4}>
                  <Button
                    colorScheme="red"
                    size="lg"
                    onClick={onClose}
                    bgColor="red"
                    _hover={{ bg: "red.500" }}
                    width="auto"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={loading}
                    loadingText="Submitting"
                    size="lg"
                    _hover={{ bg: "teal.500" }}
                    width="auto"
                  >
                    {initialData?.username ? "Update" : "Save"}
                  </Button>
                </Flex>
              </Flex>
            </FormikForm>
          );
        }}
      </Formik>
    )
  );
});

export default Form;

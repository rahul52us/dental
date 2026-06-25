"use client";
import {
  SimpleGrid,
  Button,
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  IconButton,
  useColorModeValue,
  HStack,
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
import {
  createValidationSchema,
  updateValidationSchema,
} from "./utils/validation";
import { genderOptions } from "../../../config/constant";
import MedicalHistorySection from "./formElement/MedicalHistory";
import ReferenceInputSection from "./formElement/ReferenceInputSection";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import DegreeInfo from "./formElement/DegreeInfo";
import { AddIcon } from "@chakra-ui/icons";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import MasterDataForm from "../../masters/page";
import { calculateAgeSafe } from "../../../config/utils/function";
import { useTranslation } from "react-i18next";

const Form = observer(
  ({
    loading,
    initialData,
    onSubmit,
    isOpen,
    onClose,
    isEdit,
    getAllUsers,
  }: any) => {
    const {
      dashboardStore: { getMasterOptions },
    } = stores;
    const [formData, setFormData] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<any>(null);
    const { t } = useTranslation();

    const fetchNameSuggestions = async (query: string) => {
      if (query.length < 2) {
        setNameSuggestions([]);
        return;
      }
      try {
        const res: any = await stores.userStore.getUsersList({
          type: "patient",
          search: query,
          page: 1,
          limit: 8,
        });
        const patients = res?.data?.data?.data || [];
        setNameSuggestions(patients.map((p: any) => p.name).filter(Boolean));
      } catch {
        setNameSuggestions([]);
      }
    };

    const bgBox = useColorModeValue("white", "darkBrand.100");
    const borderColor = useColorModeValue("brand.200", "darkBrand.200");

    const handleCloseDrawer = async () => {
      setIsDrawerOpen(false);
      await getAllUsers();
    };

    useEffect(() => {
      if (initialData) {
        setFormData(generateIntialValues(initialData));
      }
    }, [initialData]);

    return (
      isOpen &&
      formData && (
        <>
          <Formik
            initialValues={formData}
            validationSchema={
              isEdit ? updateValidationSchema : createValidationSchema
            }
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
                    {/* Header with Desktop Actions */}
                    <GridItem colSpan={2} display={{ base: "none", md: "block" }}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                          {isEdit ? t("patients.form.editPatient") : t("patients.form.newPatient")}
                        </Text>
                        <HStack spacing={3}>
                          <Button
                            variant="outline"
                            colorScheme="red"
                            onClick={onClose}
                            size="md"
                            px={6}
                            borderRadius="xl"
                          >
                            {t("patients.form.cancel")}
                          </Button>
                          <Button
                            type="submit"
                            colorScheme="brand"
                            isLoading={loading}
                            size="md"
                            px={8}
                            borderRadius="xl"
                            shadow="md"
                            _hover={{
                              bg: "brand.600",
                              shadow: "lg",
                              transform: "translateY(-1px)",
                            }}
                          >
                            {initialData?._id || isEdit ? t("patients.form.update") : t("patients.form.save")}
                          </Button>
                        </HStack>
                      </Flex>
                    </GridItem>

                    {/* Section 1: Personal Info (Mobile Title) */}
                    <GridItem colSpan={2}>
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        mb={4}
                        display={{ base: "block", md: "none" }}
                      >
                        {t("patients.form.personalInformation")}
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
                          bg={bgBox}
                          mt={3}
                          borderColor={borderColor}
                        >
                          <Flex align={"end"} gap={2}>
                            <CustomInput
                              type="select"
                              label={t("patients.form.title")}
                              name="title"
                              required={true}
                              options={getMasterOptions("titles")}
                              value={values.title}
                              onChange={(e: any) => setFieldValue("title", e)}
                              error={errors.title && touched.title}
                              showError={errors.title && touched.title}
                            />
                            <IconButton
                              aria-label="add"
                              variant={"ghost"}
                              icon={<AddIcon />}
                              colorScheme="brand"
                              onClick={() => setIsDrawerOpen(true)}
                            />
                          </Flex>
                          <Box
                            position="relative"
                            onFocus={() => {
                              if (nameSuggestions.length > 0) setShowSuggestions(true);
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                          >
                            <CustomInput
                              label={t("patients.form.name")}
                              name="name"
                              placeholder={t("patients.form.enterName")}
                              value={values.name}
                              required={true}
                              onChange={(e: any) => {
                                handleChange(e);
                                const val = e.target.value;
                                if (searchTimeout) clearTimeout(searchTimeout);
                                const timeout = setTimeout(() => fetchNameSuggestions(val), 300);
                                setSearchTimeout(timeout);
                                setShowSuggestions(true);
                              }}
                              error={errors?.name}
                              showError={errors.name && touched.name}
                            />
                            {showSuggestions && nameSuggestions.length > 0 && (
                              <Box
                                position="absolute"
                                top="100%"
                                left={0}
                                right={0}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="xl"
                                boxShadow="lg"
                                zIndex={99}
                                maxH="200px"
                                overflowY="auto"
                                mt={1}
                              >
                                {nameSuggestions.map((name: string, idx: number) => (
                                  <Box
                                    key={idx}
                                    px={4}
                                    py={2.5}
                                    cursor="pointer"
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                    _hover={{ bg: "blue.50", color: "blue.600" }}
                                    onMouseDown={() => {
                                      setFieldValue("name", name);
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    {name}
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                          <CustomInput
                            label={t("patients.form.dob")}
                            type="date"
                            name={`dob`}
                            value={values.dob || ""}
                            onChange={handleChange}
                            error={errors?.dob}
                            showError={errors?.dob}
                          />
                          <CustomInput
                            label={t("patients.form.age")}
                            name="age"
                            type="number"
                            value={calculateAgeSafe(values?.dob) ?? ""}
                            disabled={true}
                            placeholder={t("patients.form.autoCalculated")}
                          />
                          <CustomInput
                            label={t("patients.form.gender")}
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
                            label={t("patients.form.languages")}
                            name="languages"
                            placeholder={t("patients.form.addLanguage")}
                            value={values.languages}
                            onChange={(newTags: any) =>
                              setFieldValue("languages", newTags)
                            }
                            type="tags"
                            error={errors.languages}
                            showError={errors.languages}
                          />
                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <ReferenceInputSection
                              values={values}
                              setFieldValue={setFieldValue}
                              errors={errors}
                            />
                          </GridItem>
                        </Grid>
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
                            label={t("patients.form.specialDetails")}
                            name="bio"
                            type="textarea"
                            placeholder={t("patients.form.enterSpecialDetails")}
                            value={values.bio}
                            onChange={handleChange}
                            error={errors.bio}
                            showError={errors.bio}
                            style={{ width: "100%" }}
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
                        {false && (
                          <DegreeInfo
                            setFieldValue={setFieldValue}
                            values={values}
                            errors={errors}
                            handleChange={handleChange}
                          />
                        )}
                        <AddressesInput
                          values={values}
                          handleChange={handleChange}
                          errors={errors}
                        />
                        <MedicalHistorySection
                          values={values}
                          setFieldValue={setFieldValue}
                        />
                      </SimpleGrid>
                    </GridItem>
                    <InsuranceDetailsSection
                      errors={errors}
                      setFieldValue={setFieldValue}
                      values={values}
                      handleChange={handleChange}
                    />
                    {false && (
                      <AvailabilityAuthSection
                        values={values}
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        isEdit={isEdit}
                      />
                    )}
                  </Grid>

                  {/* Mobile Actions Only */}
                  <HStack
                    spacing={3}
                    mt={6}
                    display={{ base: "flex", md: "none" }}
                  >
                    <Button
                      variant="outline"
                      colorScheme="red"
                      onClick={onClose}
                      size="lg"
                      flex={1}
                      borderRadius="xl"
                    >
                      {t("patients.form.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="brand"
                      isLoading={loading}
                      size="lg"
                      flex={2}
                      borderRadius="xl"
                      shadow="md"
                    >
                      {initialData?._id || isEdit ? t("patients.form.update") : t("patients.form.save")}
                    </Button>
                  </HStack>
                </FormikForm>
              );
            }}
          </Formik>
          <CustomDrawer open={isDrawerOpen} close={handleCloseDrawer}>
            <MasterDataForm
              showSidebar={false}
              handleCloseDrawer={handleCloseDrawer}
            />
          </CustomDrawer>
        </>
      )
    );
  }
);

export default Form;

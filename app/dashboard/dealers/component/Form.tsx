"use client";
import {
  SimpleGrid,
  Button,
  Grid,
  GridItem,
  Text,
  Flex,
  Box,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Formik, Form as FormikForm } from "formik";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { generateIntialValues } from "./utils/function";
import AddressesInput from "./formElement/AddressInput";
import {
  createValidationSchema,
  updateValidationSchema,
} from "./utils/validation";
import ItemOrderingInput from "./formElement/ItemOrders";
import BankDetailsInput from "./formElement/BankDetailsInput";
import StaffInput from "./formElement/StaffInput";

const Form = ({
  loading,
  initialData,
  onSubmit,
  isOpen,
  onClose,
  isEdit,
}: any) => {
  const [formData, setFormData] = useState<any>(initialData);
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("brand.200", "gray.700");

  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  return (
    isOpen && (
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
                {/* Header with Actions */}
                <GridItem colSpan={2}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" display={{ base: "none", md: "block" }}>
                      {isEdit ? "Edit Dealer" : "New Dealer"}
                    </Text>
                    <HStack spacing={3} display={{ base: "none", md: "flex" }}>
                      <Button
                        variant="outline"
                        colorScheme="red"
                        onClick={onClose}
                        size="md"
                        px={6}
                        borderRadius="xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        colorScheme="teal"
                        isLoading={loading}
                        loadingText="Saving"
                        size="md"
                        px={8}
                        borderRadius="xl"
                        shadow="md"
                        _hover={{
                          bg: "teal.600",
                          shadow: "lg",
                        }}
                      >
                        {initialData?.name || isEdit ? "Update" : "Save"}
                      </Button>
                    </HStack>
                  </Flex>
                </GridItem>

                {/* Section 1: Dealer Info */}
                <GridItem colSpan={2}>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Dealer Information
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
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
                    </Grid>
                    <AddressesInput
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                    />
                  </SimpleGrid>
                  <StaffInput
                    errors={errors}
                    setFieldValue={setFieldValue}
                    values={values}
                  />
                </GridItem>
                {!initialData.name && (
                  <ItemOrderingInput
                    errors={errors}
                    setFieldValue={setFieldValue}
                    values={values}
                  />
                )}
                <BankDetailsInput
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                />
              </Grid>
              <Flex
                display={{ base: "flex", md: "none" }}
                position="sticky"
                bottom={0}
                zIndex={10}
                mx={{ base: -2, md: 0 }}
                px={{ base: 3, md: 0 }}
                py={3}
                pb="calc(12px + env(safe-area-inset-bottom))"
                gap={2}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.200"
                boxShadow="0 -6px 18px rgba(15, 23, 42, 0.08)"
              >
                <Button
                  flex={1}
                  minH="48px"
                  variant="outline"
                  colorScheme="gray"
                  onClick={onClose}
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button
                  flex={2}
                  minH="48px"
                  type="submit"
                  colorScheme="teal"
                  isLoading={loading}
                  loadingText="Saving"
                  borderRadius="xl"
                  shadow="md"
                >
                  {initialData?.name || isEdit ? "Update dealer" : "Save dealer"}
                </Button>
              </Flex>
            </FormikForm>
          );
        }}
      </Formik>
    )
  );
};

export default Form;
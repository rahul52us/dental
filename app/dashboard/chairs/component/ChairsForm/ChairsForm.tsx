"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Yup from "yup";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import stores from "../../../../store/stores";
import ChairColorPicker from "../ChairColorPicker/ChairColorPicker";
// -------------------------------------------------
// Validation Schema
// -------------------------------------------------
const ChairSchema = Yup.object().shape({
  chairName: Yup.string().required("Chair Name is required"),
  chairColor: Yup.string().required("Chair Color is required"),
  chairDetails: Yup.string().required("Chair Details are required"),
  chairNo: Yup.string().required("Chair Number is required"),
});

const ChairsForm = observer(
  ({ isOpen, onClose, initialValues, isEdit }: any) => {
    if (!isOpen) return null;
    const { chairsStore } = stores;
    const [loading, setLoading] = useState(false);

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        // initialValues={initialValues}
        validationSchema={ChairSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            setLoading(true);

            // const res: any = await chairsStore.createChair(values);
            const res: any = isEdit
              ? await chairsStore.updateChair(values._id, values)
              : await chairsStore.createChair(values);

            if (res.status === "success") {
              stores.auth?.openNotification?.({
                type: "success",
                title: isEdit ? "Chair Updated" : "Chair Added",
                message: isEdit
                  ? "Chair updated successfully!"
                  : "Chair created successfully!",
                // title: "Chair Added",
                // message: "Chair created successfully!",
              });
              resetForm();
              onClose();
            } else {
              stores.auth?.openNotification?.({
                type: "error",
                title: "Failed",
                message: res?.message || "Something went wrong",
              });
            }
          } catch (err: any) {
            stores.auth?.openNotification?.({
              type: "error",
              title: "Failed",
              message: err?.message || "Something went wrong",
            });
          } finally {
            setLoading(false); // 👉 Always stop loading
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }: any) => (
          <FormikForm onSubmit={handleSubmit}>
            <VStack spacing={5} align="stretch" p={{ base: 2, md: 4 }} mb={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box w="100%">
                  <CustomInput
                    label="Chair Name"
                    name="chairName"
                    placeholder="Enter Chair Name"
                    value={values.chairName}
                    onChange={handleChange}
                    required
                    error={errors.chairName}
                    showError={touched.chairName}
                  />
                </Box>
                <Box w="100%">
                  <CustomInput
                    label="Chair Number"
                    name="chairNo"
                    placeholder="Enter Chair Number"
                    value={values.chairNo}
                    onChange={handleChange}
                    required
                    error={errors.chairNo}
                    showError={touched.chairNo}
                  />
                </Box>
              </SimpleGrid>

              <Box w="100%">
                <CustomInput
                  label="Chair Details"
                  name="chairDetails"
                  type="textarea"
                  placeholder="Enter Chair Description"
                  value={values.chairDetails}
                  onChange={handleChange}
                  required
                  error={errors.chairDetails}
                  showError={touched.chairDetails}
                />
              </Box>

              <Box w="100%">
                <ChairColorPicker
                  value={values.chairColor}
                  onChange={(col: string) => setFieldValue("chairColor", col)}
                />

                {errors.chairColor && touched.chairColor && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {errors.chairColor}
                  </Text>
                )}
              </Box>
            </VStack>

            <HStack
              spacing={3}
              mt={6}
              pt={4}
              pb={{ base: 6, md: 2 }}
              px={{ base: 2, md: 4 }}
              borderTop="1px solid"
              borderColor="gray.100"
              w="100%"
              justify="flex-end"
            >
              <Button
                variant="outline"
                borderColor="gray.300"
                color="gray.700"
                bg="white"
                _hover={{ bg: "gray.50" }}
                _active={{ bg: "gray.100" }}
                onClick={onClose}
                borderRadius="xl"
                h="46px"
                flex={{ base: 1, sm: "initial" }}
                px={{ base: 4, sm: 6 }}
                fontWeight="600"
              >
                Close
              </Button>

              <Button
                type="submit"
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                _active={{ transform: "scale(0.98)" }}
                isLoading={loading}
                borderRadius="xl"
                fontWeight="700"
                h="46px"
                px={{ base: 6, sm: 8 }}
                flex={{ base: 2, sm: "initial" }}
                boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
              >
                {isEdit ? "Update Chair" : "Save Chair"}
              </Button>
            </HStack>
          </FormikForm>
        )}
      </Formik>
    );
  }
);

export default ChairsForm;
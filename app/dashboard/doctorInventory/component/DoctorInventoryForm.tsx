"use client";
import {
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
import stores from "../../../store/stores";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  labDoctor: Yup.object().required("Lab Doctor is required"),
  description: Yup.string(),
});

const Form = observer(({ loading, initialData, onSubmit, isOpen, onClose, isEdit }: any) => {
  const [formData, setFormData] = useState<any>({
    labDoctor: "",
    description: "",
  });



  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    } else {
      setFormData({
        labDoctor: "",
        description: "",
      });
    }
  }, [initialData, isOpen]);

  return (
    isOpen && (
      <Formik
        initialValues={formData}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={async (values: any) => {
          onSubmit({
            ...values,
            labDoctor: values.labDoctor?.value || values.labDoctor,
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
                      {isEdit ? "Edit Doctor Inventory" : "New Doctor Inventory"}
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
                  <SimpleGrid columns={1} spacing={5} p={5} borderWidth={1} borderRadius="xl" bg={bgBox} borderColor={borderColor} boxShadow="sm">
                    <CustomInput
                      label="Lab Doctor"
                      name="labDoctor"
                      type="real-time-search"
                      params={{
                        entityName: "labDoctorStore",
                        functionName: "getLabDoctors",
                        key: "labDoctorName",
                      }}
                      value={values.labDoctor}
                      onChange={(e: any) => setFieldValue("labDoctor", e)}
                      required={true}
                      error={errors.labDoctor && touched.labDoctor}
                      showError={errors.labDoctor && touched.labDoctor}
                    />
                    <CustomInput
                      label="Description"
                      name="description"
                      type="textarea"
                      placeholder="Enter Description"
                      value={values.description}
                      onChange={handleChange}
                      error={errors.description && touched.description}
                      showError={errors.description && touched.description}
                    />
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

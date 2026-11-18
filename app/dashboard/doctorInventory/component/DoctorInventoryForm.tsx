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
  labDoctor: Yup.string().required("Name is required"),
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
        labDoctor: typeof initialData.labDoctor === "object" && initialData.labDoctor !== null
          ? initialData.labDoctor.labDoctorName || initialData.labDoctor.label || initialData.labDoctor.value || ""
          : initialData.labDoctor || "",
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
            labDoctor: values.labDoctor,
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
              <Grid templateColumns="1fr" gap={{ base: 4, md: 6 }} mb={6}>
                <GridItem>
                  <Flex justify={{ base: "flex-end", md: "space-between" }} align="center" mb={{ base: 3, md: 6 }}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" display={{ base: "none", md: "block" }}>
                      {isEdit ? "Edit In & Out Ledger" : "New In & Out Ledger"}
                    </Text>
                    <HStack spacing={3} w={{ base: "100%", md: "auto" }}>
                      <Button
                        variant="outline"
                        colorScheme="gray"
                        onClick={onClose}
                        borderRadius="xl"
                        flex={{ base: 1, md: "initial" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                        color="white"
                        _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
                        _active={{ transform: "scale(0.98)" }}
                        isLoading={loading}
                        borderRadius="xl"
                        fontWeight="800"
                        px={6}
                        shadow="md"
                        flex={{ base: 1, md: "initial" }}
                      >
                        {isEdit ? "Update" : "Save"}
                      </Button>
                    </HStack>
                  </Flex>
                </GridItem>

                <GridItem>
                  <SimpleGrid columns={1} spacing={{ base: 3.5, md: 5 }} p={{ base: 3.5, md: 5 }} borderWidth={1} borderRadius="xl" bg={bgBox} borderColor={borderColor} boxShadow="sm">
                    <CustomInput
                      label="Name"
                      name="labDoctor"
                      type="text"
                      placeholder="Enter Name"
                      value={values.labDoctor}
                      onChange={handleChange}
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

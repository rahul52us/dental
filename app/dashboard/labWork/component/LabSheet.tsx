"use client";
import React from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import {
  workTypes,
  labWorkHierarchy,
  labStatusOptions,
} from "../utils/constants";

const LabSheet = observer(({ initialData, onClose, onSuccess }: any) => {
  const { labWorkStore } = stores;
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const initialValues = {
    patient: initialData?.patient || "",
    primaryDoctor: initialData?.primaryDoctor || "",
    workType: initialData?.workType || "outside",
    selectedWorks: initialData?.selectedWorks || [
      {
        selections: [],
        customNotes: "",
        shadeSystem: "vita-classic",
        shadeValue: "",
        teethNumbers: [],
      },
    ],
    labInstructions: initialData?.labInstructions || "",
    lab: initialData?.lab || "",
    labNameManual: initialData?.labNameManual || "",
    sendDate: initialData?.sendDate ? new Date(initialData.sendDate).toISOString().split('T')[0] : "",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
    status: initialData?.status || "plan",
    warrantyCardNumber: initialData?.warrantyCardNumber || "",
    warrantyYears: initialData?.warrantyYears || "",
    price: initialData?.price || 0,
  };

  const handleSubmit = async (values: any) => {
    // Extract IDs from objects before submitting
    const payload = {
      ...values,
      patient: values.patient?.value || values.patient?._id || values.patient,
      primaryDoctor: values.primaryDoctor?.value || values.primaryDoctor?._id || values.primaryDoctor,
      lab: values.lab?.value || values.lab?._id || values.lab,
    };

    let res;
    if (initialData?._id) {
      res = await labWorkStore.updateLabWork(initialData._id, payload);
    } else {
      res = await labWorkStore.createLabWork(payload);
    }

    if (res.status === "success") {
      onSuccess?.();
      onClose?.();
    }
  };


  return (
    <Box p={6} borderRadius="xl" bg={bgColor} border="1px" borderColor={borderColor}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <VStack spacing={6} align="stretch">


              <Divider />

              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                <CustomInput
                  label="Work Type"
                  type="select"
                  name="workType"
                  options={workTypes}
                  value={values.workType}
                  onChange={(val: any) => setFieldValue("workType", val.value)}
                />
                <CustomInput
                  label="Patient"
                  name="patient"
                  type="real-time-user-search"
                  query={{ type: "patient" }}
                  placeholder="Search Patient"
                  value={values.patient}
                  onChange={(val: any) => setFieldValue("patient", val)}
                  required
                />
                <CustomInput
                  label="Doctor"
                  name="primaryDoctor"
                  type="real-time-user-search"
                  query={{ type: "doctor" }}
                  placeholder="Search Doctor"
                  value={values.primaryDoctor}
                  onChange={(val: any) => setFieldValue("primaryDoctor", val)}
                  required
                />
              </Grid>

              <Box bg="white" shadow="sm" p={5} borderRadius="xl" border="1px" borderColor="gray.100">
                {/* Dynamic Hierarchical Dropdowns - Only one work item per user request */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                 {(() => {
                   const dropdowns = [];
                   const work = values.selectedWorks[0];
                   let currentLevel = 0;
                   let currentOptions = labWorkHierarchy;
                   
                   while (currentOptions && currentOptions.length > 0) {
                     const level = currentLevel;
                     const optionsAtThisLevel = currentOptions;
                     const selectedValue = work.selections[level] || "";
                     
                     const selectedOption = optionsAtThisLevel.find(o => o.value === selectedValue);
                     const isTextType = selectedOption?.type === "text" || selectedValue?.startsWith("TXT:");

                     dropdowns.push(
                       <GridItem key={level} colSpan={1}>
                         {isTextType ? (
                            <CustomInput
                              label={level === 0 ? "Work Selection" : `Selection ${level + 1}`}
                              name={`selectedWorks.0.selections.${level}`}
                              placeholder="Type here..."
                              value={selectedValue?.replace("TXT:", "")}
                              highAttention
                              onChange={(e: any) => {
                                const newSels = [...work.selections];
                                newSels[level] = "TXT:" + e.target.value;
                                setFieldValue(`selectedWorks.0.selections`, newSels);
                              }}
                            />
                         ) : (
                            <CustomInput
                              label={level === 0 ? "Work Selection" : `Selection ${level + 1}`}
                              name={`selectedWorks.0.selections.${level}`}
                              type="select"
                              highAttention
                              options={optionsAtThisLevel.map(o => ({ label: o.label, value: o.value }))}
                              value={selectedValue}
                              onChange={(val: any) => {
                                const newSels = [...work.selections];
                                newSels[level] = val.value;
                                newSels.splice(level + 1); // Reset following levels
                                setFieldValue(`selectedWorks.0.selections`, newSels);
                              }}
                            />
                         )}
                       </GridItem>
                     );

                     if (selectedOption && !isTextType) {
                       if (selectedOption.children && selectedOption.children.length > 0) {
                         currentOptions = selectedOption.children;
                         currentLevel++;
                       } else if (selectedValue) {
                         // Reached end of predefined hierarchy, show final custom text box
                         currentLevel++;
                         const nextLevel = currentLevel;
                         const customValue = work.selections[nextLevel] || "";
                         dropdowns.push(
                           <GridItem key={nextLevel} colSpan={1}>
                             <CustomInput
                               label={`Selection ${nextLevel + 1} (Custom)`}
                               name={`selectedWorks.0.selections.${nextLevel}`}
                               placeholder="Specify details..."
                               value={customValue.replace("TXT:", "")}
                               highAttention
                               onChange={(e: any) => {
                                 const newSels = [...work.selections];
                                 newSels[nextLevel] = "TXT:" + e.target.value;
                                 setFieldValue(`selectedWorks.0.selections`, newSels);
                               }}
                             />
                           </GridItem>
                         );
                         break;
                       } else {
                         break;
                       }
                     } else {
                       break;
                     }
                   }
                   return dropdowns;
                 })()}
                </Grid>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "2.5fr 1fr 1fr 1fr" }} gap={6}>
                {values.workType === "outside" && (
                  <CustomInput
                    label="Laboratory"
                    name="lab"
                    type="real-time-lab-search"
                    placeholder="Search Laboratory"
                    value={values.lab}
                    onChange={(val: any) => setFieldValue("lab", val)}
                    required
                  />
                )}
                <CustomInput
                  label="Send Date"
                  name="sendDate"
                  type="date"
                  value={values.sendDate}
                  onChange={(e: any) => setFieldValue("sendDate", e.target.value)}
                />
                <CustomInput
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={values.dueDate}
                  onChange={(e: any) => setFieldValue("dueDate", e.target.value)}
                />
                <CustomInput
                  label="Status"
                  name="status"
                  type="select"
                  options={labStatusOptions}
                  value={values.status}
                  onChange={(val: any) => setFieldValue("status", val.value)}
                />
              </Grid>

              <CustomInput
                label="Global Lab Instructions"
                name="labInstructions"
                type="textarea"
                placeholder="Overall instructions for the entire lab sheet..."
                value={values.labInstructions}
                onChange={(e: any) => setFieldValue("labInstructions", e.target.value)}
              />

              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} bg={stores.themeStore.themeConfig.colors.custom.light.primary + "1A"} p={5} borderRadius="2xl">
                <CustomInput
                  label="Warranty Card #"
                  name="warrantyCardNumber"
                  value={values.warrantyCardNumber}
                  onChange={(e: any) => setFieldValue("warrantyCardNumber", e.target.value)}
                />
                <CustomInput
                  label="Warranty (Years)"
                  name="warrantyYears"
                  type="number"
                  value={values.warrantyYears}
                  onChange={(e: any) => setFieldValue("warrantyYears", e.target.value)}
                />
                <CustomInput
                  label="Price / Billing Amount"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={(e: any) => setFieldValue("price", e.target.value)}
                />
              </Grid>

              <Flex justify="flex-end" pt={4} gap={4}>
                <Button variant="ghost" size="lg" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                    bg={stores.themeStore.themeConfig.colors.custom.light.primary} 
                    color="white"
                    _hover={{ filter: "brightness(0.9)" }}
                    size="lg" 
                    px={12}
                    type="submit" 
                    isLoading={isSubmitting}
                >
                  {initialData?._id ? "Update Lab Sheet" : "Generate Lab Sheet"}
                </Button>
              </Flex>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
});

export default LabSheet;

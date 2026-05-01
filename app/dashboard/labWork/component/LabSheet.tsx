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
  IconButton,
  Text,
  FormLabel,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import {
  workTypes,
  labStatusOptions,
} from "../utils/constants";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const LabSheet = observer(({ initialData, onClose, onSuccess }: any) => {
  const { labWorkStore, labWorkHierarchyStore, labWorkStatusStore } = stores;
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  React.useEffect(() => {
    labWorkHierarchyStore.getAllHierarchies();
    labWorkStatusStore.getLabWorkStatuses();
  }, []);

  const hierarchyData = React.useMemo(() => {
    const tree = labWorkHierarchyStore.getTree();
    const mapNode = (node: any): any => ({
      label: node.name,
      value: node._id,
      isTextInput: node.isTextInput,
      children: node.children?.map(mapNode) || []
    });

    return tree.map(mapNode);
  }, [labWorkHierarchyStore.hierarchies]);

  const initialValues = {
    patient: initialData?.patient || "",
    patientNameManual: initialData?.patientNameManual || "",
    primaryDoctor: initialData?.primaryDoctor || "",
    primaryDoctorModel: initialData?.primaryDoctorModel || (initialData?.workType === "in-house" ? "User" : "LabDoctor"),
    doctorNameManual: initialData?.doctorNameManual || "",
    workType: initialData?.workType || "outside",

    selectedWorks: initialData?.selectedWorks && initialData.selectedWorks.length > 0
      ? initialData.selectedWorks
      : [
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
    statusHistory: initialData?.statusHistory?.length > 0 ? initialData.statusHistory.map((h: any) => ({
      status: h.status,
      date: new Date(h.date).toISOString().split('T')[0],
      note: h.note || ""
    })) : [
      {
        status: "plan",
        date: new Date().toISOString().split('T')[0],
        note: ""
      }
    ],
    warrantyCardNumber: initialData?.warrantyCardNumber || "",
    warrantyYears: initialData?.warrantyYears || "",
    price: initialData?.price || 0,
  };

  const handleSubmit = async (values: any) => {
    const payload: any = {
      ...values,
      patient: values.patient?.value || values.patient?._id || values.patient,
      primaryDoctor: values.primaryDoctor?.value || values.primaryDoctor?._id || values.primaryDoctor,
      primaryDoctorModel: values.workType === "in-house" ? "User" : "LabDoctor",
      lab: values.lab?.value || values.lab?._id || values.lab,
      status: values.statusHistory?.[values.statusHistory.length - 1]?.status || "plan",
      statusDate: values.statusHistory?.[values.statusHistory.length - 1]?.date || new Date()
    };

    // Clean up empty strings for ObjectIds to avoid BSON errors
    ["patient", "primaryDoctor", "lab"].forEach(key => {
      if (payload[key] === "" || payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

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
              {/* Top Header Actions */}
              <Flex justify="space-between" align="center" pb={2}>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="blue.700">
                    {initialData?._id ? "Edit Lab Order" : "New Lab Order"}
                  </Heading>
                  <Text fontSize="xs" color="gray.500">Please fill in the laboratory specifications below</Text>
                </VStack>
                <HStack spacing={3}>
                  <Button variant="outline" colorScheme="red" size="md" px={6} borderRadius="xl" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                    color="white"
                    size="md"
                    px={8}
                    borderRadius="xl"
                    shadow="md"
                    isLoading={isSubmitting}
                    _hover={{ filter: "brightness(0.9)", transform: "translateY(-1px)", shadow: "lg" }}
                  >
                    {initialData?._id ? "Update" : "Save"}
                  </Button>
                </HStack>
              </Flex>

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
                {values.workType === "outside" ? (
                  <CustomInput
                    label="Patient Name"
                    name="patientNameManual"
                    placeholder="Enter Patient Name"
                    value={values.patientNameManual}
                    onChange={(e: any) => setFieldValue("patientNameManual", e.target.value)}
                    required
                  />
                ) : (
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
                )}
                {values.workType === "in-house" ? (
                  <CustomInput
                    label="Doctor (Internal)"
                    name="primaryDoctor"
                    type="real-time-user-search"
                    query={{ type: "doctor" }}
                    placeholder="Search Doctor"
                    value={values.primaryDoctor}
                    onChange={(val: any) => setFieldValue("primaryDoctor", val)}
                    required
                  />
                ) : (
                  <CustomInput
                    label="Lab Doctor (Outside)"
                    name="primaryDoctor"
                    type="real-time-search"
                    params={{
                      entityName: "labDoctorStore",
                      functionName: "getLabDoctors",
                      key: "labDoctorName",
                    }}
                    placeholder="Search Lab Doctor"
                    value={values.primaryDoctor}
                    onChange={(val: any) => setFieldValue("primaryDoctor", val)}
                    required
                  />
                )}


              </Grid>


              <Box bg="gray.50" p={5} borderRadius="2xl" border="1px dashed" borderColor="gray.300">
                <VStack align="stretch" spacing={6}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm" color="blue.700">Selected Works & Specifications</Heading>
                    <Button
                      leftIcon={<FiPlus />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => {
                        const currentWorks = [...values.selectedWorks];
                        currentWorks.push({
                          selections: [],
                          customNotes: "",
                          shadeSystem: "vita-classic",
                          shadeValue: "",
                          teethNumbers: [],
                        });
                        setFieldValue("selectedWorks", currentWorks);
                      }}
                    >
                      Add Another Item
                    </Button>
                  </Flex>

                  {values.selectedWorks.map((work: any, workIndex: number) => (
                    <Box key={workIndex} p={5} bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" position="relative">
                      {values.selectedWorks.length > 1 && (
                        <IconButton
                          icon={<FiTrash2 />}
                          aria-label="Remove"
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={() => {
                            const currentWorks = [...values.selectedWorks];
                            currentWorks.splice(workIndex, 1);
                            setFieldValue("selectedWorks", currentWorks);
                          }}
                        />
                      )}

                      <VStack align="stretch" spacing={4}>
                        {/* Dynamic Dropdown Sequence */}
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                          {(() => {
                            const dropdowns = [];
                            let currentOptions = hierarchyData;
                            let level = 0;

                            // We loop as long as there are options to show
                            // or as long as a selection exists at this level
                            while (currentOptions && currentOptions.length > 0) {
                              const currentLevel = level;
                              const optionsAtThisLevel = currentOptions;
                              const selectedValue = work.selections[currentLevel] || "";

                              // Determine if this level should be a text input
                              const textOption = optionsAtThisLevel.find(o => o.isTextInput);
                              const selectedOption = optionsAtThisLevel.find(o => o.value === selectedValue);

                              // Show input if:
                              // 1. Already selected a text-prefixed value
                              // 2. Selected an option marked as isTextInput
                              // 3. The only option available is marked as isTextInput (auto-trigger)
                              const isTextType =
                                selectedValue?.startsWith("TXT:") ||
                                selectedOption?.isTextInput ||
                                (optionsAtThisLevel.length === 1 && optionsAtThisLevel[0].isTextInput);

                              dropdowns.push(
                                <GridItem key={currentLevel}>
                                  {isTextType ? (
                                    <CustomInput
                                      label={textOption?.label || (currentLevel === 0 ? "Category" : `Step ${currentLevel + 1}`)}
                                      name={`selectedWorks.${workIndex}.selections.${currentLevel}`}
                                      placeholder={`Enter ${textOption?.label || "details"}...`}
                                      value={selectedValue?.replace("TXT:", "")}
                                      onChange={(e: any) => {
                                        const newSels = [...work.selections];
                                        // If it's a known textOption ID, we still prefix with TXT: but keep track
                                        newSels[currentLevel] = "TXT:" + e.target.value;
                                        setFieldValue(`selectedWorks.${workIndex}.selections`, newSels);
                                      }}
                                    />
                                  ) : (
                                    <CustomInput
                                      label={currentLevel === 0 ? "Category" : `Step ${currentLevel + 1}`}
                                      type="select"
                                      name={`selectedWorks.${workIndex}.selections.${currentLevel}`}
                                      options={optionsAtThisLevel.map(o => ({ label: o.label, value: o.value }))}
                                      value={selectedValue}
                                      onChange={(val: any) => {
                                        const newSels = [...work.selections];
                                        newSels[currentLevel] = val.value;
                                        newSels.splice(currentLevel + 1); // Clear levels below
                                        setFieldValue(`selectedWorks.${workIndex}.selections`, newSels);
                                      }}
                                    />
                                  )}
                                </GridItem>
                              );


                              if (selectedOption && !isTextType && selectedOption.children && selectedOption.children.length > 0) {
                                currentOptions = selectedOption.children;
                                level++;
                              } else {
                                break;
                              }
                            }

                            return dropdowns;
                          })()}
                        </Grid>

                        <Divider />

                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                          <CustomInput
                            label="Teeth Numbers"
                            placeholder="e.g. 11, 12, 13"
                            name={`selectedWorks.${workIndex}.teethNumbers`}
                            value={work.teethNumbers?.join(", ")}
                            onChange={(e: any) => {
                              const val = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                              setFieldValue(`selectedWorks.${workIndex}.teethNumbers`, val);
                            }}
                          />
                          <CustomInput
                            label="Shade"
                            placeholder="e.g. A1, B2"
                            name={`selectedWorks.${workIndex}.shadeValue`}
                            value={work.shadeValue}
                            onChange={(e: any) => setFieldValue(`selectedWorks.${workIndex}.shadeValue`, e.target.value)}
                          />
                        </Grid>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: values.workType === "outside" ? "2fr 1fr 1fr" : "1fr 1fr" }} gap={6}>
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
              </Grid>

              <Box bg="blue.50" p={5} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                <VStack align="stretch" spacing={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm" color="blue.700">Status Tracking History</Heading>
                    <Button
                      leftIcon={<FiPlus />}
                      size="xs"
                      colorScheme="blue"
                      onClick={() => {
                        const history = [...values.statusHistory];
                        history.push({
                          status: history[history.length - 1]?.status || "plan",
                          date: new Date().toISOString().split('T')[0],
                          note: ""
                        });
                        setFieldValue("statusHistory", history);
                      }}
                    >
                      Update Status
                    </Button>
                  </Flex>

                  <VStack align="stretch" spacing={3}>
                    {values.statusHistory?.map((h: any, i: number) => (
                      <HStack key={i} spacing={4} align="end" bg="white" p={3} borderRadius="lg" shadow="sm" position="relative">
                        <CustomInput
                          label="Status"
                          name={`statusHistory.${i}.status`}
                          type="select"
                          options={(labWorkStatusStore.statuses || [])
                            .filter(s => s.type === values.workType)
                            .map(s => ({ label: s.status, value: s.status }))}
                          value={h.status}
                          onChange={(val: any) => setFieldValue(`statusHistory.${i}.status`, val.value)}
                        />
                        <CustomInput
                          label="Date"
                          name={`statusHistory.${i}.date`}
                          type="date"
                          value={h.date}
                          onChange={(e: any) => setFieldValue(`statusHistory.${i}.date`, e.target.value)}
                        />
                        <CustomInput
                          label="Update Note"
                          name={`statusHistory.${i}.note`}
                          placeholder="Internal notes..."
                          value={h.note}
                          onChange={(e: any) => setFieldValue(`statusHistory.${i}.note`, e.target.value)}
                        />
                        {values.statusHistory.length > 1 && (
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Remove"
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              const history = [...values.statusHistory];
                              history.splice(i, 1);
                              setFieldValue("statusHistory", history);
                            }}
                          />
                        )}
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Box>

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


            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
});

export default LabSheet;

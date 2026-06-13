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
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
    workType: initialData?.workType || "",

    selectedWorks: initialData?.selectedWorks && initialData.selectedWorks.length > 0
      ? initialData.selectedWorks
      : [
        {
          selections: [],
          customNotes: "",
          shadeSystem: "vita-classic",
          shadeValue: "",
          teethNumbers: [],
          amount: "",
        },
      ],
    labInstructions: initialData?.labInstructions || "",
    lab: initialData?.lab || "",
    labNameManual: initialData?.labNameManual || "",
    sendDate: initialData?.sendDate ? new Date(initialData.sendDate).toISOString().split('T')[0] : "",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
    receivedDate: initialData?.receivedDate ? new Date(initialData.receivedDate).toISOString().split('T')[0] : "",
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
    delay: initialData?.delay !== undefined && initialData?.delay !== null ? initialData.delay : "",
    price: initialData?.price || 0,
    itemsReceived: initialData?.itemsReceived || {
      impressionTraysUpper: false,
      impressionTraysLower: false,
      modelsUpper: false,
      modelsLower: false,
      articulator: false,
      implantAnalog: "",
      implantImpressionCoping: "",
      implantAbutment: "",
      bite: false,
      certificate: false,
      accessories: "",
    },
    itemsSent: initialData?.itemsSent || {
      impressionTraysUpper: false,
      impressionTraysLower: false,
      modelsUpper: false,
      modelsLower: false,
      articulator: false,
      implantAnalog: "",
      implantImpressionCoping: "",
      implantAbutment: "",
      bite: false,
      certificate: false,
      accessories: "",
    },
    returnableItems: initialData?.returnableItems || "",
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
        {({ values, setFieldValue, isSubmitting, resetForm }) => (
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

              <Grid templateColumns={{ base: "1fr", md: values.workType === "outside" ? "repeat(4, 1fr)" : "repeat(3, 1fr)" }} gap={6}>
                <CustomInput
                  label="Work Type"
                  type="select"
                  placeholder="Select Type"
                  isClear={true}
                  name="workType"
                  options={workTypes}
                  value={values.workType}
                  onChange={(val: any) => {
                    setFieldValue("workType", val.value);
                    // Reset fields that depend on workType
                    setFieldValue("patient", "");
                    setFieldValue("patientNameManual", "");
                    setFieldValue("primaryDoctor", "");
                    setFieldValue("lab", "");
                    setFieldValue("labNameManual", "");

                    // Recalculate delay based on workType
                    if (val.value === "in-house" && values.sendDate && values.dueDate) {
                      const s = new Date(values.sendDate).getTime();
                      const d = new Date(values.dueDate).getTime();
                      setFieldValue("delay", Math.round((s - d) / (1000 * 3600 * 24)));
                    } else if (val.value === "outside" && values.receivedDate && values.dueDate) {
                      const r = new Date(values.receivedDate).getTime();
                      const d = new Date(values.dueDate).getTime();
                      setFieldValue("delay", Math.round((r - d) / (1000 * 3600 * 24)));
                    } else {
                      setFieldValue("delay", "");
                    }
                  }}
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
                  <>
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
                    <CustomInput
                      label="Laboratory"
                      name="lab"
                      type="real-time-lab-search"
                      placeholder="Search Laboratory"
                      value={values.lab}
                      onChange={(val: any) => setFieldValue("lab", val)}
                      required
                    />
                  </>
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
                          amount: "",
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
                            const total = currentWorks.reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);
                            setFieldValue("price", total);
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
                                      placeholder="Select..."
                                      isClear={true}
                                      name={`selectedWorks.${workIndex}.selections.${currentLevel}`}
                                      options={optionsAtThisLevel.map(o => ({ label: o.label, value: o.value }))}
                                      value={selectedValue}
                                      onChange={(val: any) => {
                                        const newSels = [...work.selections];
                                        newSels[currentLevel] = val?.value || "";
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

                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                          <CustomInput
                            label="Teeth Numbers"
                            placeholder="e.g. 11, 12, 13"
                            name={`selectedWorks.${workIndex}.teethNumbers`}
                            value={work.teethNumbers}
                            onChange={(e: any) => {
                              const val = e.target.value;
                              setFieldValue(`selectedWorks.${workIndex}.teethNumbers`, val);
                            }}
                            type="text"
                          />
                          <CustomInput
                            label="Shade"
                            placeholder="e.g. A1, B2"
                            name={`selectedWorks.${workIndex}.shadeValue`}
                            value={work.shadeValue}
                            onChange={(e: any) => setFieldValue(`selectedWorks.${workIndex}.shadeValue`, e.target.value)}
                          />
                          <CustomInput
                            label="Amount"
                            placeholder="e.g. 1000"
                            name={`selectedWorks.${workIndex}.amount`}
                            value={work.amount === 0 ? "" : work.amount}
                            onChange={(e: any) => {
                              const val = e.target.value;
                              const amount = val === "" ? "" : Number(val);
                              setFieldValue(`selectedWorks.${workIndex}.amount`, amount);

                              const currentWorks = [...values.selectedWorks];
                              currentWorks[workIndex].amount = amount;
                              const total = currentWorks.reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);
                              setFieldValue("price", total);
                            }}
                            type="number"
                          />
                        </Grid>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                {values.workType === "in-house" && (
                  <CustomInput
                    key="in-house-send"
                    label="Send Date"
                    name="sendDate"
                    type="date"
                    value={values.sendDate}
                    onChange={(e: any) => {
                      const newSendDate = e.target.value;
                      setFieldValue("sendDate", newSendDate);
                      if (newSendDate && values.dueDate) {
                        const s = new Date(newSendDate).getTime();
                        const d = new Date(values.dueDate).getTime();
                        setFieldValue("delay", Math.round((s - d) / (1000 * 3600 * 24)));
                      } else {
                        setFieldValue("delay", "");
                      }
                    }}
                  />
                )}
                {values.workType !== "in-house" && (
                  <CustomInput
                    key="outside-received"
                    label="Received Date"
                    name="receivedDate"
                    type="date"
                    value={values.receivedDate}
                    onChange={(e: any) => {
                      const newReceivedDate = e.target.value;
                      setFieldValue("receivedDate", newReceivedDate);
                      if (newReceivedDate && values.dueDate) {
                        const r = new Date(newReceivedDate).getTime();
                        const d = new Date(values.dueDate).getTime();
                        setFieldValue("delay", Math.round((r - d) / (1000 * 3600 * 24)));
                      } else {
                        setFieldValue("delay", "");
                      }
                    }}
                  />
                )}
                <CustomInput
                  key="due-date"
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={values.dueDate}
                  onChange={(e: any) => {
                    const newDueDate = e.target.value;
                    setFieldValue("dueDate", newDueDate);
                    if (values.workType === "outside" && values.receivedDate && newDueDate) {
                      const r = new Date(values.receivedDate).getTime();
                      const d = new Date(newDueDate).getTime();
                      setFieldValue("delay", Math.round((r - d) / (1000 * 3600 * 24)));
                    } else if (values.workType === "in-house" && values.sendDate && newDueDate) {
                      const s = new Date(values.sendDate).getTime();
                      const d = new Date(newDueDate).getTime();
                      setFieldValue("delay", Math.round((s - d) / (1000 * 3600 * 24)));
                    } else {
                      setFieldValue("delay", "");
                    }
                  }}
                />
                {values.workType === "in-house" && (
                  <CustomInput
                    key="in-house-received"
                    label="Received Date"
                    name="receivedDate"
                    type="date"
                    value={values.receivedDate}
                    onChange={(e: any) => {
                      setFieldValue("receivedDate", e.target.value);
                    }}
                  />
                )}
                {values.workType !== "in-house" && (
                  <CustomInput
                    key="outside-send"
                    label="Send Date"
                    name="sendDate"
                    type="date"
                    value={values.sendDate}
                    onChange={(e: any) => {
                      setFieldValue("sendDate", e.target.value);
                    }}
                  />
                )}
                <CustomInput
                  label="Delay (Days)"
                  name="delay"
                  type="number"
                  readOnly={true}
                  value={values.delay}
                  onChange={(e: any) => setFieldValue("delay", e.target.value)}
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
                      Add Status
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
                  readOnly={true}
                  onChange={(e: any) => setFieldValue("price", e.target.value)}
                />
              </Grid>

              {values.workType === "outside" && (
                <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm">
                  <VStack align="stretch" spacing={5}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="sm" color="blue.800">Items Received / Sent Tracking</Heading>
                        <Text fontSize="xs" color="gray.500">Track all items sent to and received from the laboratory</Text>
                      </VStack>
                    </HStack>

                    <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="xl" bg="white">
                      <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th py={3} color="gray.600">Item Name</Th>
                            <Th textAlign="center" color="green.600">Received</Th>
                            <Th textAlign="center" color="blue.600">Sent</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Impression trays (Upper)</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.impressionTraysUpper || false} onChange={(e) => setFieldValue("itemsReceived.impressionTraysUpper", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.impressionTraysUpper || false} onChange={(e) => setFieldValue("itemsSent.impressionTraysUpper", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Impression trays (Lower)</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.impressionTraysLower || false} onChange={(e) => setFieldValue("itemsReceived.impressionTraysLower", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.impressionTraysLower || false} onChange={(e) => setFieldValue("itemsSent.impressionTraysLower", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Models (Upper)</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.modelsUpper || false} onChange={(e) => setFieldValue("itemsReceived.modelsUpper", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.modelsUpper || false} onChange={(e) => setFieldValue("itemsSent.modelsUpper", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Models (Lower)</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.modelsLower || false} onChange={(e) => setFieldValue("itemsReceived.modelsLower", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.modelsLower || false} onChange={(e) => setFieldValue("itemsSent.modelsLower", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Articulator</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.articulator || false} onChange={(e) => setFieldValue("itemsReceived.articulator", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.articulator || false} onChange={(e) => setFieldValue("itemsSent.articulator", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Implant Analog</Td>
                            <Td><CustomInput name="itemsReceived.implantAnalog" value={values.itemsReceived?.implantAnalog || ""} onChange={(e: any) => setFieldValue("itemsReceived.implantAnalog", e.target.value)} placeholder="Details..." /></Td>
                            <Td><CustomInput name="itemsSent.implantAnalog" value={values.itemsSent?.implantAnalog || ""} onChange={(e: any) => setFieldValue("itemsSent.implantAnalog", e.target.value)} placeholder="Details..." /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Implant Impression Coping</Td>
                            <Td><CustomInput name="itemsReceived.implantImpressionCoping" value={values.itemsReceived?.implantImpressionCoping || ""} onChange={(e: any) => setFieldValue("itemsReceived.implantImpressionCoping", e.target.value)} placeholder="Details..." /></Td>
                            <Td><CustomInput name="itemsSent.implantImpressionCoping" value={values.itemsSent?.implantImpressionCoping || ""} onChange={(e: any) => setFieldValue("itemsSent.implantImpressionCoping", e.target.value)} placeholder="Details..." /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Implant Abutment</Td>
                            <Td><CustomInput name="itemsReceived.implantAbutment" value={values.itemsReceived?.implantAbutment || ""} onChange={(e: any) => setFieldValue("itemsReceived.implantAbutment", e.target.value)} placeholder="Details..." /></Td>
                            <Td><CustomInput name="itemsSent.implantAbutment" value={values.itemsSent?.implantAbutment || ""} onChange={(e: any) => setFieldValue("itemsSent.implantAbutment", e.target.value)} placeholder="Details..." /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Bite</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.bite || false} onChange={(e) => setFieldValue("itemsReceived.bite", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.bite || false} onChange={(e) => setFieldValue("itemsSent.bite", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Certificate</Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsReceived?.certificate || false} onChange={(e) => setFieldValue("itemsReceived.certificate", e.target.checked)} colorScheme="green" /></Td>
                            <Td textAlign="center"><Checkbox isChecked={values.itemsSent?.certificate || false} onChange={(e) => setFieldValue("itemsSent.certificate", e.target.checked)} colorScheme="blue" /></Td>
                          </Tr>
                          <Tr _hover={{ bg: "gray.50" }}>
                            <Td fontWeight="600" color="gray.700">Accessories</Td>
                            <Td><CustomInput name="itemsReceived.accessories" value={values.itemsReceived?.accessories || ""} onChange={(e: any) => setFieldValue("itemsReceived.accessories", e.target.value)} placeholder="Any accessories..." /></Td>
                            <Td><CustomInput name="itemsSent.accessories" value={values.itemsSent?.accessories || ""} onChange={(e: any) => setFieldValue("itemsSent.accessories", e.target.value)} placeholder="Any accessories..." /></Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>
                    <Box bg="blue.50" p={4} borderRadius="xl" border="1px dashed" borderColor="blue.200">
                      <CustomInput
                        label="Returnable Items Note (for Lab Doctor)"
                        name="returnableItems"
                        type="textarea"
                        placeholder="Record any items that must be returned here..."
                        value={values.returnableItems || ""}
                        onChange={(e: any) => setFieldValue("returnableItems", e.target.value)}
                      />
                    </Box>
                  </VStack>
                </Box>
              )}


            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
});

export default LabSheet;

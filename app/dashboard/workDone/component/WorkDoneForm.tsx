"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Button,
  Grid,
  Icon,
  Input,
  Circle,
  Badge,
  IconButton,
  Textarea,
  Spacer,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { Formik, Form } from "formik";
import { FiActivity, FiCheckCircle, FiPlusCircle, FiSearch, FiEye, FiAlertCircle, FiPlus, FiX } from "react-icons/fi";
import stores from "../../../store/stores";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import TreatmentDetailsView from "../../toothTreatment/element/TreatmentDetailsView";
import { TeethChart } from "../../../component/common/TeethModel/DentalChartComponent/component/TeethChart";
import { getTeethByType, ToothData } from "../../../component/common/TeethModel/DentalChartComponent/utils/teethData";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { DentitionToggle } from "../../../component/common/TeethModel/DentalChartComponent/component/DentitionToggle";


interface WorkDoneFormProps {
  patientDetails: any;
  treatmentDetails?: any;
  editData?: any; // Add this prop for editing
  onSuccess?: () => void;
}

// Helper component to handle Procedure Explorer synchronization safely (avoids Hook violations)
const ProcedureSync = ({
  isProcedureOpen,
  treatmentCode,
  setSelectedCategory,
  setSelectedSubcategory,
  setSelectedName1,
  setSelectedName2,
  setSelectedName3,
  setTempTreatmentCode,
}: any) => {
  useEffect(() => {
    if (isProcedureOpen && treatmentCode) {
      setTempTreatmentCode(treatmentCode);
      // Aggressive cleaning: split by any of the separators, then trim and normalize whitespace
      const parts = treatmentCode
        .split(/[·→|]|\s->\s/)
        .map((p: string) => p.trim().replace(/\s+/g, ' '));

      if (parts.length >= 1 && parts[0]) {
        setSelectedCategory(parts[0]);
      }
      if (parts.length >= 2 && parts[1]) setSelectedSubcategory(parts[1]);
      if (parts.length >= 3 && parts[2]) setSelectedName1(parts[2]);
      if (parts.length >= 4 && parts[3]) setSelectedName2(parts[3]);
      if (parts.length >= 5 && parts[4]) setSelectedName3(parts[4]);
    } else if (isProcedureOpen && !treatmentCode) {
      setTempTreatmentCode("");
      setSelectedCategory(null); setSelectedSubcategory(null); setSelectedName1(null); setSelectedName2(null); setSelectedName3(null);
    }
  }, [isProcedureOpen, treatmentCode]);
  return null;
};

const WorkDoneForm = observer(({ patientDetails, treatmentDetails, editData, onSuccess }: WorkDoneFormProps) => {
  const {
    workDoneStore: { createWorkDone, updateWorkDone },
    toothTreatmentStore: { updateToothTreatment },
    procedureStore: { getProcedures, procedures },
    auth: { openNotification },
  } = stores;

  const [loading, setLoading] = useState(false);
  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedName1, setSelectedName1] = useState<string | null>(null);
  const [selectedName2, setSelectedName2] = useState<string | null>(null);
  const [selectedName3, setSelectedName3] = useState<string | null>(null);
  const [tempProcedure, setTempProcedure] = useState<any>(null);
  const [tempTreatmentCode, setTempTreatmentCode] = useState<string>("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("COMPLETE");
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);

  useEffect(() => {
    const singleTooth = treatmentDetails?.tooth || treatmentDetails?.toothNo || editData?.tooth;
    if (singleTooth) {
      setSelectedTeeth([String(singleTooth)]);
    } else {
      setSelectedTeeth([]);
    }
  }, [treatmentDetails, editData]);




  useEffect(() => {
    const companyId = patientDetails?.company?._id || patientDetails?.company || stores.auth.company;
    getProcedures(companyId ? { companyId } : {});
  }, [patientDetails]);

  const groupedData = useMemo(() => {
    const dbData = procedures.data;
    if (dbData.length === 0) return [];

    const map: any = {};
    dbData.forEach((p: any) => {
      const cat = p.category;
      const sub = p.subcategory;
      const n1 = p.name;
      const n2 = p.name2 || "None";
      const n3 = p.name3 || "None";

      if (!map[cat]) map[cat] = { name: cat, subcategories: {} };
      if (!map[cat].subcategories[sub]) {
        map[cat].subcategories[sub] = { name: sub, name1s: {} };
      }
      if (!map[cat].subcategories[sub].name1s[n1]) {
        map[cat].subcategories[sub].name1s[n1] = { name: n1, name2s: {} };
      }
      if (!map[cat].subcategories[sub].name1s[n1].name2s[n2]) {
        map[cat].subcategories[sub].name1s[n1].name2s[n2] = { name: n2, name3s: {} };
      }
      if (!map[cat].subcategories[sub].name1s[n1].name2s[n2].name3s[n3]) {
        map[cat].subcategories[sub].name1s[n1].name2s[n2].name3s[n3] = {
          name: n3,
          procedure: p
        };
      }
    });

    return Object.values(map).map((cat: any) => ({
      ...cat,
      subcategories: Object.values(cat.subcategories).map((sub: any) => ({
        ...sub,
        name1s: Object.values(sub.name1s).map((n1: any) => ({
          ...n1,
          name2s: Object.values(n1.name2s).map((n2: any) => ({
            ...n2,
            name3s: Object.values(n2.name3s)
          }))
        }))
      }))
    }));
  }, [procedures.data]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProcedures = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return procedures.data.filter((proc: any) =>
      proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [procedures.data, searchTerm]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    if (!values.status) {
      openNotification({
        type: "error",
        title: "Status Required",
        message: "Please select a clinical status before saving.",
      });
      setLoading(false);
      return;
    }

    if (selectedTeeth.length === 0 && !values.workDoneNote) {
      openNotification({
        type: "error",
        title: "Incomplete Documentation",
        message: "Please select at least one tooth or enter a General Note to proceed.",
      });
      setLoading(false);
      return;
    }

    try {
      const teethList = selectedTeeth.length > 0 ? selectedTeeth : ["General"];

      const promises = teethList.map(async (toothId) => {
        // Quadrant Detection for each tooth
        const getQuadrantInfo = (tId: string) => {
          const id = parseInt(tId);
          if (isNaN(id)) return { position: "general", side: "general" };
          if ((id >= 11 && id <= 18) || (id >= 51 && id <= 55)) return { position: "upper", side: "right" };
          if ((id >= 21 && id <= 28) || (id >= 61 && id <= 65)) return { position: "upper", side: "left" };
          if ((id >= 31 && id <= 38) || (id >= 71 && id <= 75)) return { position: "lower", side: "left" };
          if ((id >= 41 && id <= 48) || (id >= 81 && id <= 85)) return { position: "lower", side: "right" };
          return { position: "general", side: "general" };
        };

        const quadrant = getQuadrantInfo(toothId);

        const payload = {
          ...values,
          doctor: values.doctor?.value || values.doctor,
          patient: patientDetails._id,
          treatment: treatmentDetails?._id,
          company: stores.auth.company,
          user: stores.auth.user?._id,
          status: values.status,
          amount: Number(values.amount) || 0,
          discount: Number(values.discount) || 0,
          // Standalone Tooth Details
          tooth: toothId === "General" ? "" : toothId,
          toothNotation: values.toothNotation || "fdi",
          dentitionType: values.dentitionType || "adult",
          position: quadrant.position,
          side: quadrant.side,
          toothNote: values.workDoneNote,
          recordType: toothId === "General" ? "note" : "tooth",
          examiningDoctor: values.examiningDoctor?.value || values.examiningDoctor,
        };

        if (editData?._id) {
          return updateWorkDone(editData._id, payload);
        } else {
          return createWorkDone(payload);
        }
      });

      await Promise.all(promises);

      // Sync Treatment Status if linked
      const tId = treatmentDetails?._id || editData?.treatment?._id || editData?.treatment;
      if (tId) {
        await updateToothTreatment({
          treatmentId: tId,
          status: values.status
        });
      }

      openNotification({
        type: "success",
        title: editData?._id ? "Record Updated" : "Work Done Saved",
        message: editData?._id
          ? "Clinical documentation has been updated successfully."
          : `Clinical documentation for ${teethList.length} teeth and Treatment Plan updated successfully.`,
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      openNotification({
        type: "error",
        title: "Save Failed",
        message: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    complaintType: editData?.complaintType || treatmentDetails?.complaintType || "CHIEF COMPLAINT",
    doctor: (() => {
      const doc = editData?.doctor; // Only use editData for doctors on new records to keep it empty
      if (!doc) return "";
      if (typeof doc === 'object' && doc.name) return { label: doc.name, value: doc._id };
      return doc;
    })(),
    workDoneNote: editData?.workDoneNote || "",
    status: String(editData?.status || "complete").toLowerCase(),
    amount: editData?.amount ?? "", // Keep empty for new records
    discount: editData?.discount ?? "", // Keep empty for new records
    treatmentCode: editData?.treatmentCode || treatmentDetails?.treatmentPlan || "",
    // Standalone Fields
    tooth: editData?.tooth || treatmentDetails?.tooth || treatmentDetails?.toothNo || "",
    toothNotation: editData?.toothNotation || treatmentDetails?.toothNotation || "fdi",
    dentitionType: editData?.dentitionType || treatmentDetails?.dentitionType || "adult",
    position: editData?.position || treatmentDetails?.position || "",
    side: editData?.side || treatmentDetails?.side || "",
    toothNote: editData?.toothNote || "", // Keep empty for new records
    recordType: editData?.recordType || treatmentDetails?.recordType || "tooth",
    examiningDoctor: (() => {
      const doc = editData?.examiningDoctor; // Only use editData for doctors on new records to keep it empty
      if (!doc) return "";
      if (typeof doc === 'object' && doc.name) return { label: doc.name, value: doc._id };
      return doc;
    })(),
  };

  return (
    <Box p={0} bg="white" borderRadius="3xl" overflow="hidden" position="relative">
      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        {(formikProps) => {
          const { values, setFieldValue, handleSubmit: formikHandleSubmit } = formikProps;
          const complaintColor = values.complaintType === "CHIEF COMPLAINT" ? "red.500" :
            values.complaintType === "OTHER FINDING" ? "orange.400" :
              values.complaintType === "EXISTING FINDING" ? "green.500" : "blue.500";
          return (
            <>
              <ProcedureSync
                isProcedureOpen={isProcedureOpen}
                treatmentCode={values.treatmentCode}
                setSelectedCategory={setSelectedCategory}
                setSelectedSubcategory={setSelectedSubcategory}
                setSelectedName1={setSelectedName1}
                setSelectedName2={setSelectedName2}
                setSelectedName3={setSelectedName3}
                setTempTreatmentCode={setTempTreatmentCode}
              />
              <Form onSubmit={formikHandleSubmit}>
                <Box h="6px" bg={complaintColor} w="full" position="absolute" top={0} left={0} />
                <VStack align="stretch" spacing={4} pt={4}>
                  {/* Header */}
                  <Box mb={-4}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="10px" fontWeight="1000" color="blue.500" textTransform="uppercase" letterSpacing="0.1em">
                          CLINICAL ENTRY
                        </Text>
                        <Heading size="md" color="gray.800" fontWeight="1000">
                          {patientDetails?.name || "Patient Work Done"}
                        </Heading>
                      </VStack>

                      {treatmentDetails && (
                        <Button
                          type="button"
                          leftIcon={<FiEye />}
                          variant="ghost"
                          colorScheme="blue"
                          size="sm"
                          fontWeight="900"
                          fontSize="11px"
                          borderRadius="full"
                          onClick={() => setIsViewModalOpen(true)}
                          _hover={{ bg: "blue.50" }}
                        >
                          VIEW FULL PLAN
                        </Button>
                      )}
                    </HStack>
                  </Box>


                    {/* Treatment Context Information & Layout Grid */}
                    {(() => {
                      const data = treatmentDetails || editData;
                      if (!data) {
                        return (
                          <VStack align="stretch" spacing={6} w="full" mt={4}>
                            {/* 1. Teeth Chart & Selector Header (100% full-width at the top) */}
                            <VStack align="stretch" spacing={4} w="full">
                              <HStack bg="white" p={1.5} borderRadius="20px" border="1px solid" borderColor="blue.100" spacing={4} shadow="sm" justify="space-between" wrap="wrap">
                                {/* 1. Finding Category */}
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="8px" fontWeight="1000" color="gray.400" ml={1}>FINDING CATEGORY</Text>
                                  <HStack bg="gray.100" p={0.5} borderRadius="xl" spacing={0}>
                                    {[
                                      { id: "CHIEF COMPLAINT", label: "CHIEF", color: "red.500" },
                                      { id: "OTHER FINDING", label: "OTHER", color: "orange.400" },
                                      { id: "EXISTING FINDING", label: "EXISTING", color: "green.500" }
                                    ].map((cat) => {
                                      const isActive = values.complaintType === cat.id;
                                      return (
                                        <Button
                                          key={cat.id}
                                          size="xs"
                                          variant="unstyled"
                                          bg={isActive ? cat.color : "transparent"}
                                          color={isActive ? "white" : "gray.500"}
                                          onClick={() => setFieldValue("complaintType", cat.id)}
                                          fontSize="9px"
                                          h="26px"
                                          minW="60px"
                                          px={2}
                                          fontWeight="1000"
                                          borderRadius="lg"
                                          transition="all 0.2s"
                                        >
                                          {cat.label}
                                        </Button>
                                      );
                                    })}
                                  </HStack>
                                </VStack>

                                <Divider orientation="vertical" h="30px" borderColor="gray.200" display={{ base: "none", sm: "block" }} />

                                {/* 2. Dentition */}
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="8px" fontWeight="1000" color="gray.400" ml={1}>DENTITION</Text>
                                  <DentitionToggle
                                    value={values.dentitionType}
                                    onChange={(val) => setFieldValue("dentitionType", val)}
                                  />
                                </VStack>

                                <Divider orientation="vertical" h="30px" borderColor="gray.200" display={{ base: "none", sm: "block" }} />

                                {/* 3. Notation System */}
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="8px" fontWeight="1000" color="gray.400" ml={1}>NOTATION</Text>
                                  <HStack bg="gray.100" p={0.5} borderRadius="xl" spacing={0}>
                                    {["fdi", "universal", "palmer"].map(n => (
                                      <Button
                                        key={n}
                                        type="button"
                                        size="xs"
                                        variant="unstyled"
                                        bg={values.toothNotation === n ? "blue.500" : "transparent"}
                                        color={values.toothNotation === n ? "white" : "gray.500"}
                                        onClick={() => setFieldValue("toothNotation", n)}
                                        fontSize="9px"
                                        h="24px"
                                        minW="35px"
                                        px={1}
                                        fontWeight="900"
                                        borderRadius="md"
                                        transition="all 0.2s"
                                      >
                                        {n === "universal" ? "UNIV" : n.toUpperCase()}
                                      </Button>
                                    ))}
                                  </HStack>
                                </VStack>
                              </HStack>

                              <Box bg="white" borderRadius="2xl" p={4} border="1px solid" borderColor="blue.100" shadow="sm">
                                <Box w="full">
                                  <TeethChart
                                    dentitionType={values.dentitionType}
                                    selectedTeeth={selectedTeeth.map(t => ({ id: t, fdi: t } as ToothData))}
                                    onToothClick={(tooth) => {
                                      const toothId = String(tooth.fdi || tooth.id);
                                      setSelectedTeeth(prev => {
                                        if (prev.includes(toothId)) {
                                          return prev.filter(x => x !== toothId);
                                        } else {
                                          return [...prev, toothId];
                                        }
                                      });
                                    }}
                                    notationType={values.toothNotation}
                                    toothComplaints={{}}
                                    activeComplaintType={values.complaintType || "CHIEF COMPLAINT"}
                                    sessionDate={new Date().toISOString().split('T')[0]}
                                  />
                                </Box>
                              </Box>
                            </VStack>

                            {/* 2. Below the Chart Layout (100% stacked layout with 50/50 doctor columns) */}
                            <VStack align="stretch" spacing={6} w="full">
                              
                              {/* Selected Teeth badges (100% width) */}
                              <HStack spacing={3} wrap="wrap">
                                <VStack align="start" spacing={1} w="full">
                                  <Text fontSize="9px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">SELECTED TEETH</Text>
                                  <HStack spacing={2} wrap="wrap">
                                    {selectedTeeth.length === 0 ? (
                                      <Badge colorScheme="gray" borderRadius="full" px={3} py={1} fontSize="11px">None Selected (General Note)</Badge>
                                    ) : (
                                      selectedTeeth.map(t => (
                                        <Badge
                                          key={t}
                                          colorScheme="blue"
                                          borderRadius="full"
                                          px={3}
                                          py={1}
                                          fontSize="11px"
                                          fontWeight="black"
                                          display="inline-flex"
                                          alignItems="center"
                                        >
                                          Tooth {t}
                                          <IconButton
                                            aria-label="Remove"
                                            icon={<FiX size={10} />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="blue"
                                            ml={1}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTeeth(prev => prev.filter(x => x !== t));
                                            }}
                                            borderRadius="full"
                                            h="16px"
                                            minW="16px"
                                          />
                                        </Badge>
                                      ))
                                    )}
                                  </HStack>
                                </VStack>
                              </HStack>

                              {/* Examining Doctor & Treating Doctor (50% / 50% split width) */}
                              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="full">
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">EXAMINING DOCTOR</Text>
                                  <CustomInput
                                    name="examiningDoctor"
                                    type="real-time-user-search"
                                    query={{ type: 'doctor' }}
                                    value={values.examiningDoctor}
                                    onChange={(val: any) => setFieldValue("examiningDoctor", val)}
                                    style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                                    placeholder="Select Examining Dr."
                                  />
                                </VStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">TREATING DOCTOR</Text>
                                  <CustomInput
                                    name="doctor"
                                    type="real-time-user-search"
                                    query={{ type: 'doctor' }}
                                    value={values.doctor}
                                    onChange={(val: any) => setFieldValue("doctor", val)}
                                    style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                                    placeholder="Select Treating Dr."
                                  />
                                </VStack>
                              </Grid>

                              {/* Clinical Observation / Work Done Note (100% width) */}
                              <VStack align="start" spacing={2} w="full">
                                <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">CLINICAL OBSERVATION (WORK DONE NOTE)</Text>
                                <CustomInput
                                  name="workDoneNote"
                                  type="textarea"
                                  placeholder="Workdone Note"
                                  value={values.workDoneNote}
                                  onChange={(e: any) => setFieldValue("workDoneNote", e.target.value)}
                                  style={{ minHeight: "100px", background: "gray.50", border: '1px solid', borderColor: 'gray.100', borderRadius: '24px', padding: '20px', fontSize: '14px' }}
                                />
                              </VStack>

                              {/* Today Dues Card (100% width) */}
                              <VStack align="stretch" spacing={4} p={5} bg={values.complaintType === "CHIEF COMPLAINT" ? "red.50" : values.complaintType === "OTHER FINDING" ? "orange.50" : values.complaintType === "EXISTING FINDING" ? "green.50" : "blue.50"} borderRadius="3xl" border="1px solid" borderColor={complaintColor}>
                                <Text fontSize="12px" fontWeight="bold" color={complaintColor} letterSpacing="0.1em">TODAY DUES</Text>
                                <Grid templateColumns="1fr 1fr" gap={4}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="11px" fontWeight="bold" color="gray.700">Actual Amount (₹)</Text>
                                    <Input
                                      size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px"
                                      value={values.amount}
                                      placeholder="0.00"
                                      onChange={(e) => setFieldValue("amount", e.target.value)}
                                    />
                                  </VStack>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="11px" fontWeight="bold" color="red.600">DISCOUNT (₹)</Text>
                                    <Input
                                      size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px" color="red.600"
                                      value={values.discount}
                                      placeholder="0.00"
                                      onChange={(e) => setFieldValue("discount", e.target.value)}
                                    />
                                  </VStack>
                                </Grid>
                                <HStack pt={3} borderTop="1px dashed" borderColor={complaintColor} justify="space-between" align="center">
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="12px" fontWeight="bold" color={complaintColor} letterSpacing="0.05em">TOTAL NET PAYABLE</Text>
                                    <Text fontSize="20px" fontWeight="1000" color={complaintColor}>
                                      ₹{(Number(values.amount || 0) - Number(values.discount || 0)).toLocaleString()}
                                    </Text>
                                  </VStack>
                                  <Circle size="36px" bg="white" color={complaintColor} border="1px solid" borderColor={complaintColor}>
                                    <FiCheckCircle size={18} />
                                  </Circle>
                                </HStack>
                              </VStack>

                              {/* Procedure Selector (TREATMENT CODE) - 100% full width, placed at the VERY END */}
                              <VStack align="start" spacing={3} w="full">
                                <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">TREATMENT CODE (PROCEDURE)</Text>
                                <Button
                                  type="button"
                                  w="full"
                                  h="60px"
                                  variant="outline"
                                  colorScheme="blue"
                                  borderStyle="dashed"
                                  borderWidth="2px"
                                  borderRadius="2xl"
                                  onClick={() => setIsProcedureOpen(true)}
                                  leftIcon={<Icon as={FiPlusCircle} boxSize={4} />}
                                  fontSize="12px"
                                  fontWeight="1000"
                                  whiteSpace="normal"
                                  textAlign="left"
                                  px={6}
                                >
                                  {values.treatmentCode ? "Change Treatment Procedure" : "Assign Treatment Procedure"}
                                </Button>

                                {values.treatmentCode && (() => {
                                  const parts = values.treatmentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                                  const mainProcedure = parts[parts.length - 1];
                                  const path = parts.slice(0, -1).join(" · ");
                                  return (
                                    <Box p={4} bg="blue.50" borderRadius="xl" w="full" borderLeft="4px solid" borderColor="blue.500" shadow="sm">
                                      <VStack align="start" spacing={1}>
                                        <Text fontSize="12px" fontWeight="1000" color="blue.800" noOfLines={2}>
                                          {mainProcedure}
                                        </Text>
                                        {path && (
                                          <Text fontSize="9px" fontWeight="900" color="blue.400" textTransform="uppercase" letterSpacing="0.05em">
                                            {path}
                                          </Text>
                                        )}
                                      </VStack>
                                    </Box>
                                  );
                                })()}
                              </VStack>
                            </VStack>
                          </VStack>
                        );
                      }

                      // If there is data (editing/view plan mode), show standard linear layout
                      const doctorName = values.doctor?.label || values.doctor || data.doctor?.name || (typeof data.doctor === 'string' ? data.doctor : "N/A");
                      const examDrName = values.examiningDoctor?.label || values.examiningDoctor || data.examiningDoctor?.name || (typeof data.examiningDoctor === 'string' ? data.examiningDoctor : "N/A");
                      const toothVal = values.tooth || data.tooth || data.toothNo || "GENERAL";
                      const estimate = values.amount || data.estimateMin || data.amount || 0;
                      const received = data.receivedAmount || 0;

                      return (
                        <VStack align="stretch" spacing={4} w="full">
                          <Grid
                            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                            gap={2}
                            mt={4}
                            p={3}
                            bg="gray.50"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="gray.100"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{
                              bg: "white",
                              boxShadow: "sm",
                              borderColor: "blue.200",
                              transform: "translateY(-1px)"
                            }}
                            onClick={() => setIsViewModalOpen(true)}
                          >
                            <VStack align="start" spacing={0}>
                              <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">TOOTH NO</Text>
                              <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} fontSize="12px">
                                {toothVal}
                              </Badge>
                            </VStack>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">EXAMINING DR.</Text>
                              <Text fontSize="11px" fontWeight="900" color="gray.700" noOfLines={1}>
                                {examDrName}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">TREATING DR.</Text>
                              <Text fontSize="11px" fontWeight="900" color="gray.700" noOfLines={1}>
                                {doctorName}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">ESTIMATE</Text>
                              <Text fontSize="12px" fontWeight="1000" color="blue.600">
                                ₹{estimate.toLocaleString()}
                              </Text>
                              <Text fontSize="9px" fontWeight="800" color="gray.500" mt={1}>
                                RECEIVED: ₹{received.toLocaleString()}
                              </Text>
                              <Text fontSize="9px" fontWeight="900" color="red.500">
                                BALANCE: ₹{(estimate - received).toLocaleString()}
                              </Text>
                            </VStack>
                          </Grid>

                          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="full">
                            <VStack align="start" spacing={2} w="full">
                              <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">EXAMINING DOCTOR</Text>
                              <CustomInput
                                name="examiningDoctor"
                                type="real-time-user-search"
                                query={{ type: 'doctor' }}
                                value={values.examiningDoctor}
                                onChange={(val: any) => setFieldValue("examiningDoctor", val)}
                                style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                                placeholder="Select Examining Dr."
                              />
                            </VStack>
                            <VStack align="start" spacing={2} w="full">
                              <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">TREATING DOCTOR</Text>
                              <CustomInput
                                name="doctor"
                                type="real-time-user-search"
                                query={{ type: 'doctor' }}
                                value={values.doctor}
                                onChange={(val: any) => setFieldValue("doctor", val)}
                                style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                                placeholder="Select Treating Dr."
                              />
                            </VStack>
                          </Grid>

                          <VStack align="start" spacing={2} w="full">
                            <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">CLINICAL OBSERVATION (WORK DONE NOTE)</Text>
                            <CustomInput
                              name="workDoneNote"
                              type="textarea"
                              placeholder="Workdone Note"
                              value={values.workDoneNote}
                              onChange={(e: any) => setFieldValue("workDoneNote", e.target.value)}
                              style={{ minHeight: "100px", background: "gray.50", border: '1px solid', borderColor: 'gray.100', borderRadius: '24px', padding: '20px', fontSize: '14px' }}
                            />
                          </VStack>

                          <VStack align="stretch" spacing={5} p={6} bg={values.complaintType === "CHIEF COMPLAINT" ? "red.50" : values.complaintType === "OTHER FINDING" ? "orange.50" : values.complaintType === "EXISTING FINDING" ? "green.50" : "blue.50"} borderRadius="3xl" border="1px solid" borderColor={complaintColor}>
                            <Text fontSize="12px" fontWeight="bold" color={complaintColor} letterSpacing="0.1em">TODAY DUES</Text>
                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="11px" fontWeight="bold" color="gray.700">Actual Amount (₹)</Text>
                                <Input
                                  size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px"
                                  value={values.amount}
                                  placeholder="0.00"
                                  onChange={(e) => setFieldValue("amount", e.target.value)}
                                />
                              </VStack>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="11px" fontWeight="bold" color="red.600">DISCOUNT (₹)</Text>
                                <Input
                                  size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px" color="red.600"
                                  value={values.discount}
                                  placeholder="0.00"
                                  onChange={(e) => setFieldValue("discount", e.target.value)}
                                />
                              </VStack>
                            </Grid>
                            <HStack pt={4} borderTop="1px dashed" borderColor={complaintColor} justify="space-between" align="center">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="12px" fontWeight="bold" color={complaintColor} letterSpacing="0.05em">TOTAL NET PAYABLE</Text>
                                <Text fontSize="22px" fontWeight="1000" color={complaintColor}>
                                  ₹{(Number(values.amount || 0) - Number(values.discount || 0)).toLocaleString()}
                                </Text>
                              </VStack>
                              <Circle size="40px" bg="white" color={complaintColor} border="1px solid" borderColor={complaintColor}>
                                <FiCheckCircle size={20} />
                              </Circle>
                            </HStack>
                          </VStack>

                          {/* 6. Procedure / Treatment Plan for linked/edit mode */}
                          <VStack align="start" spacing={3} w="full" mt={4}>
                            <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">TREATMENT CODE (PROCEDURE)</Text>
                            <Button
                              type="button"
                              w="full"
                              h="70px"
                              variant="outline"
                              colorScheme="blue"
                              borderStyle="dashed"
                              borderWidth="2px"
                              borderRadius="3xl"
                              onClick={() => setIsProcedureOpen(true)}
                              leftIcon={<Icon as={FiPlusCircle} boxSize={5} />}
                              fontSize="13px"
                              fontWeight="1000"
                              whiteSpace="normal"
                              textAlign="left"
                              px={8}
                            >
                              {values.treatmentCode ? "Change Treatment Procedure" : "Assign Treatment Procedure"}
                            </Button>

                            {values.treatmentCode && (() => {
                              const parts = values.treatmentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                              const mainProcedure = parts[parts.length - 1];
                              const path = parts.slice(0, -1).join(" · ");
                              return (
                                <Box p={5} bg="blue.50" borderRadius="2xl" w="full" borderLeft="6px solid" borderColor="blue.500" shadow="sm">
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="14px" fontWeight="1000" color="blue.800" noOfLines={2}>
                                      {mainProcedure}
                                    </Text>
                                    {path && (
                                      <Text fontSize="11px" fontWeight="900" color="blue.400" textTransform="uppercase" letterSpacing="0.05em">
                                        {path}
                                      </Text>
                                    )}
                                  </VStack>
                                </Box>
                              );
                            })()}
                          </VStack>
                        </VStack>
                      );
                    })()}

                  {/* Procedure Explorer Drawer */}
                  <CustomDrawer
                    open={isProcedureOpen}
                    close={() => setIsProcedureOpen(false)}
                    title={
                      <VStack align="start" spacing={0}>
                        <Text fontSize="18px" fontWeight="1000" color="white">Procedure Explorer</Text>
                        <Text fontSize="10px" fontWeight="1000" color="blue.100" letterSpacing="0.1em">SELECT CLINICAL PROTOCOL</Text>
                      </VStack>
                    }
                    extraActions={
                      <Button
                        size="md"
                        colorScheme="blue"
                        bg="white"
                        color="blue.600"
                        fontWeight="1000"
                        fontSize="13px"
                        borderRadius="xl"
                        isDisabled={!tempTreatmentCode}
                        leftIcon={<Icon as={FiCheckCircle} />}
                        onClick={() => {
                          if (tempTreatmentCode) {
                            setFieldValue("treatmentCode", tempTreatmentCode);
                            // Logic: Auto-fill pricing from procedure data
                            if (tempProcedure) {
                              if (tempProcedure.estimateMin) setFieldValue("amount", tempProcedure.estimateMin);
                              if (tempProcedure.discount) setFieldValue("discount", tempProcedure.discount);
                            }
                            setIsProcedureOpen(false);
                            setTempProcedure(null);
                            setTempTreatmentCode("");
                          }
                        }}
                        _hover={{ bg: "blue.50", transform: "translateY(-1px)" }}
                        boxShadow="sm"
                      >
                        Save Selection
                      </Button>
                    }
                    width="95vw"
                  >
                    <Box h="full" p={0}>
                      <VStack align="stretch" spacing={0} h="full">
                        {/* Explorer Content */}
                        <Box
                          overflow="hidden"
                          bg="white"
                          flex="1"
                        >
                          <Grid templateColumns="repeat(5, 1fr)" bg="gray.50/50" borderBottom="1px solid" borderColor="gray.200">
                            {["CATEGORY", "SUBCATEGORY", "NAME 1", "NAME 2", "SPECIFIC PROCEDURE"].map(label => (
                              <Box key={label} py={3} px={4} borderRight="1px solid" borderColor="gray.100">
                                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">{label}</Text>
                              </Box>
                            ))}
                          </Grid>
                          {searchTerm.trim() ? (
                            <Box h="full" overflowY="auto" p={5}>
                              <VStack align="stretch" spacing={2.5}>
                                {filteredProcedures?.map((proc: any) => {
                                  const parts = [proc.category, proc.subcategory, proc.name];
                                  if (proc.name2 && proc.name2 !== "None") parts.push(proc.name2);
                                  if (proc.name3 && proc.name3 !== "None") parts.push(proc.name3);
                                  const fullCode = parts.join(" · ");
                                  return (
                                    <HStack
                                      key={fullCode}
                                      p={4}
                                      borderRadius="2xl"
                                      cursor="pointer"
                                      onClick={() => {
                                        setTempProcedure(proc);
                                        setTempTreatmentCode(fullCode);
                                      }}
                                      bg={tempTreatmentCode === fullCode ? "blue.50" : "white"}
                                      _hover={{ transform: "translateX(4px)", bg: "blue.50" }}
                                      transition="all 0.2s"
                                      justify="space-between"
                                      border="1px solid"
                                      borderColor="gray.100"
                                    >
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.1em">
                                          {proc.category.toUpperCase()} • {proc.subcategory.toUpperCase()}
                                        </Text>
                                        <Text fontSize="14px" fontWeight="1000" color="gray.800">{proc.name}</Text>
                                        {proc.name2 && proc.name2 !== "None" && (
                                          <Text fontSize="11px" color="gray.500">{proc.name2} {proc.name3 !== "None" ? `• ${proc.name3}` : ""}</Text>
                                        )}
                                      </VStack>
                                      <Icon as={FiPlus} color="blue.400" />
                                    </HStack>
                                  );
                                })}
                              </VStack>
                            </Box>
                          ) : (
                            <Grid templateColumns="repeat(5, 1fr)" h="full">
                              {/* 1. Category */}
                              <Box borderRight="1px solid" borderColor="gray.200" overflowY="auto" bg="gray.50/30">
                                {groupedData.map((cat: any) => (
                                  <Box
                                    key={cat.name}
                                    px={4} py={4}
                                    cursor="pointer"
                                    bg={selectedCategory?.trim().replace(/\s+/g, ' ').toLowerCase() === cat.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.100" : "transparent"}
                                    color={selectedCategory?.trim().replace(/\s+/g, ' ').toLowerCase() === cat.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.800" : "gray.600"}
                                    onClick={() => {
                                      setSelectedCategory(cat.name);
                                      setSelectedSubcategory(null); setSelectedName1(null); setSelectedName2(null); setSelectedName3(null);
                                      setTempTreatmentCode(cat.name);
                                      setTempProcedure(null); // Intermediate levels may not have default pricing
                                    }}
                                    _hover={{ bg: "blue.50" }}
                                    transition="all 0.2s"
                                  >
                                    <Text fontSize="10px" fontWeight="1000" letterSpacing="0.1em">{cat.name.toUpperCase()}</Text>
                                  </Box>
                                ))}
                              </Box>

                              {/* 2. Subcategory */}
                              <Box borderRight="1px solid" borderColor="gray.200" overflowY="auto">
                                {(() => {
                                  const cat = groupedData.find((c: any) =>
                                    c.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedCategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  return cat?.subcategories.map((sub: any) => (
                                    <Box
                                      key={sub.name}
                                      px={4} py={4}
                                      cursor="pointer"
                                      bg={selectedSubcategory?.trim().replace(/\s+/g, ' ').toLowerCase() === sub.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.100" : "transparent"}
                                      color={selectedSubcategory?.trim().replace(/\s+/g, ' ').toLowerCase() === sub.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.800" : "gray.600"}
                                      onClick={() => {
                                        setSelectedSubcategory(sub.name);
                                        setSelectedName1(null); setSelectedName2(null); setSelectedName3(null);
                                        setTempTreatmentCode(`${selectedCategory} · ${sub.name}`);
                                      }}
                                      _hover={{ bg: "blue.50" }}
                                    >
                                      <Text fontSize="11px" fontWeight="1000">{sub.name}</Text>
                                    </Box>
                                  ));
                                })()}
                              </Box>

                              {/* 3. Name 1 */}
                              <Box borderRight="1px solid" borderColor="gray.200" overflowY="auto">
                                {(() => {
                                  const cat = groupedData.find((c: any) =>
                                    c.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedCategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  const sub = cat?.subcategories.find((s: any) =>
                                    s.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedSubcategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  return sub?.name1s.map((n1: any) => (
                                    <Box
                                      key={n1.name}
                                      px={4} py={4}
                                      cursor="pointer"
                                      bg={selectedName1?.trim().replace(/\s+/g, ' ').toLowerCase() === n1.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.100" : "transparent"}
                                      color={selectedName1?.trim().replace(/\s+/g, ' ').toLowerCase() === n1.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.800" : "gray.600"}
                                      onClick={() => {
                                        setSelectedName1(n1.name);
                                        setSelectedName2(null); setSelectedName3(null);
                                        setTempTreatmentCode(`${selectedCategory} · ${selectedSubcategory} · ${n1.name}`);
                                      }}
                                      _hover={{ bg: "blue.50" }}
                                    >
                                      <Text fontSize="11px" fontWeight="1000">{n1.name}</Text>
                                    </Box>
                                  ));
                                })()}
                              </Box>

                              {/* 4. Name 2 */}
                              <Box borderRight="1px solid" borderColor="gray.200" overflowY="auto">
                                {(() => {
                                  const cat = groupedData.find((c: any) =>
                                    c.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedCategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  const sub = cat?.subcategories.find((s: any) =>
                                    s.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedSubcategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  const n1 = sub?.name1s.find((n: any) =>
                                    n.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedName1?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  return n1?.name2s.map((n2: any) => (
                                    <Box
                                      key={n2.name}
                                      px={4} py={4}
                                      cursor="pointer"
                                      bg={selectedName2?.trim().replace(/\s+/g, ' ').toLowerCase() === n2.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.100" : "transparent"}
                                      color={selectedName2?.trim().replace(/\s+/g, ' ').toLowerCase() === n2.name.trim().replace(/\s+/g, ' ').toLowerCase() ? "blue.800" : "gray.600"}
                                      onClick={() => {
                                        setSelectedName2(n2.name);
                                        setSelectedName3(null);
                                        setTempTreatmentCode(`${selectedCategory} · ${selectedSubcategory} · ${selectedName1} · ${n2.name}`);
                                      }}
                                      _hover={{ bg: "blue.50" }}
                                    >
                                      <Text fontSize="11px" fontWeight="1000">{n2.name}</Text>
                                    </Box>
                                  ));
                                })()}
                              </Box>

                              {/* 5. Name 3 (Selection) */}
                              <Box overflowY="auto" bg="gray.50/20">
                                {(() => {
                                  const cat = groupedData.find((c: any) =>
                                    c.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedCategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  const sub = cat?.subcategories.find((s: any) =>
                                    s.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedSubcategory?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  const n1 = sub?.name1s.find((n: any) =>
                                    n.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedName1?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  const n2 = n1?.name2s.find((n: any) =>
                                    n.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedName2?.trim().replace(/\s+/g, ' ').toLowerCase()
                                  );
                                  return n2?.name3s.map((n3: any) => (
                                    <Box
                                      key={n3.name}
                                      px={4} py={4}
                                      cursor="pointer"
                                      color={selectedName3?.toLowerCase() === n3.name.toLowerCase() ? "blue.800" : "gray.600"}
                                      onClick={() => {
                                        setSelectedName3(n3.name);
                                        const proc = n3.procedure;
                                        const parts = [proc.category, proc.subcategory, proc.name];
                                        if (proc.name2 && proc.name2 !== "None") parts.push(proc.name2);
                                        if (proc.name3 && proc.name3 !== "None") parts.push(proc.name3);
                                        const fullCode = parts.join(" · ");
                                        setTempProcedure(proc);
                                        setTempTreatmentCode(fullCode);
                                      }}
                                      _hover={{ bg: "blue.100", color: "blue.800" }}
                                      bg={tempTreatmentCode.includes(n3.name) ? "blue.50" : "transparent"}
                                    >
                                      <Text fontSize="11px" fontWeight="1000">{n3.name}</Text>
                                    </Box>
                                  ));
                                })()}
                              </Box>
                            </Grid>
                          )}
                        </Box>
                      </VStack>
                    </Box>
                  </CustomDrawer>

                  {/* 7. Clinical Status */}
                  <VStack align="start" spacing={3} w="full" pt={2}>
                    <Text fontSize="12px" fontWeight="bold" color="gray.700" letterSpacing="0.05em">CLINICAL STATUS</Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                      {[
                        { value: "complete", label: "COMPLETE", color: "green" },
                        { value: "pending", label: "PENDING", color: "orange" },
                        { value: "incomplete", label: "INCOMPLETE", color: "red" }
                      ].map((status) => (
                        <Button
                          type="button"
                          key={status.value}
                          h="50px"
                          variant={values.status === status.value ? "solid" : "outline"}
                          colorScheme={status.color}
                          onClick={() => setFieldValue("status", status.value)}
                          borderRadius="xl"
                          fontSize="11px"
                          fontWeight="1000"
                          _hover={{ transform: "translateY(-1px)" }}
                          transition="all 0.2s"
                        >
                          {status.label}
                        </Button>
                      ))}
                    </Grid>
                  </VStack>

                  {/* Footer Button */}
                  <Box pt={4}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      h="60px"
                      borderRadius="2xl"
                      fontWeight="1000"
                      fontSize="lg"
                      isLoading={loading}
                      boxShadow="0 10px 20px -5px rgba(49, 130, 206, 0.4)"
                      leftIcon={<Icon as={FiActivity} />}
                    >
                      Finish Documentation
                    </Button>
                  </Box>
                </VStack>
              </Form>
            </>
          );
        }}
      </Formik>
    </Box>

  );
});

export default WorkDoneForm;

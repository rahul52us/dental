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
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { Formik, Form } from "formik";
import { FiActivity, FiCheckCircle, FiPlusCircle, FiSearch, FiEye, FiAlertCircle, FiPlus } from "react-icons/fi";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null);
  const [selectedSubIdx, setSelectedSubIdx] = useState<number | null>(null);
  const [selectedN1Idx, setSelectedN1Idx] = useState<number | null>(null);
  const [selectedN2Idx, setSelectedN2Idx] = useState<number | null>(null);
  const [selectedN3Idx, setSelectedN3Idx] = useState<number | null>(null);




  useEffect(() => {
    getProcedures();
  }, [getProcedures]);

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
        map[cat].subcategories[sub].name1s[n1].name2s[n2].name3s[n3] = { name: n3, proc: p };
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
    
    if (!values.tooth && !values.toothNote) {
      openNotification({
        type: "error",
        title: "Incomplete Documentation",
        message: "Please select a tooth or enter a General Note to proceed.",
      });
      setLoading(false);
      return;
    }

    try {
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
        tooth: values.tooth || treatmentDetails?.tooth || treatmentDetails?.toothNo,
        toothNotation: values.toothNotation || treatmentDetails?.toothNotation,
        dentitionType: values.dentitionType || treatmentDetails?.dentitionType,
        position: values.position || treatmentDetails?.position,
        side: values.side || treatmentDetails?.side,
        toothNote: values.toothNote || treatmentDetails?.toothNote,
        recordType: values.recordType || treatmentDetails?.recordType || (values.tooth ? "tooth" : "note"),
        examiningDoctor: values.examiningDoctor?.value || values.examiningDoctor || treatmentDetails?.examiningDoctor?._id || treatmentDetails?.examiningDoctor,
      };

      if (editData?._id) {
        await updateWorkDone(editData._id, payload);
      } else {
        await createWorkDone(payload);
      }

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
          : "Clinical documentation and Treatment Plan updated successfully.",
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
    doctor: editData?.doctor
      ? (editData.doctor.name ? { label: editData.doctor.name, value: editData.doctor._id } : editData.doctor)
      : (treatmentDetails?.doctor
        ? (treatmentDetails.doctor.name ? { label: treatmentDetails.doctor.name, value: treatmentDetails.doctor._id } : treatmentDetails.doctor)
        : ""),
    workDoneNote: editData?.workDoneNote || "",
    status: editData?.status || "",
    amount: editData?.amount ?? (treatmentDetails?.estimateMin || ""),
    discount: editData?.discount ?? (treatmentDetails?.discount || ""),
    treatmentCode: editData?.treatmentCode || treatmentDetails?.treatmentPlan || "",
    // Standalone Fields
    tooth: editData?.tooth || treatmentDetails?.tooth || treatmentDetails?.toothNo || "",
    toothNotation: editData?.toothNotation || treatmentDetails?.toothNotation || "fdi",
    dentitionType: editData?.dentitionType || treatmentDetails?.dentitionType || "adult",
    position: editData?.position || treatmentDetails?.position || "",
    side: editData?.side || treatmentDetails?.side || "",
    toothNote: editData?.toothNote || treatmentDetails?.toothNote || "",
    recordType: editData?.recordType || treatmentDetails?.recordType || "tooth",
    examiningDoctor: editData?.examiningDoctor
      ? (editData.examiningDoctor.name ? { label: editData.examiningDoctor.name, value: editData.examiningDoctor._id } : editData.examiningDoctor)
      : (treatmentDetails?.examiningDoctor
        ? (treatmentDetails.examiningDoctor.name ? { label: treatmentDetails.examiningDoctor.name, value: treatmentDetails.examiningDoctor._id } : treatmentDetails.examiningDoctor)
        : ""),
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


                    {/* Treatment Context Information */}
                    {treatmentDetails ? (
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
                            {treatmentDetails.toothNo || treatmentDetails.tooth || "General"}
                          </Badge>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">EXAMINING DR.</Text>
                          <Text fontSize="11px" fontWeight="900" color="gray.700" noOfLines={1}>
                            {treatmentDetails.examiningDoctor?.name || (typeof treatmentDetails.examiningDoctor === 'string' ? treatmentDetails.examiningDoctor : "N/A")}
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">ASSIGNED DR.</Text>
                          <Text fontSize="11px" fontWeight="900" color="gray.700" noOfLines={1}>
                            {treatmentDetails.doctor?.name || (typeof treatmentDetails.doctor === 'string' ? treatmentDetails.doctor : "N/A")}
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">ESTIMATE</Text>
                          <Text fontSize="12px" fontWeight="1000" color="blue.600">
                            ₹{(treatmentDetails.estimateMin || 0).toLocaleString()}
                          </Text>
                          <Text fontSize="9px" fontWeight="800" color="gray.500" mt={1}>
                            RECEIVED: ₹{(treatmentDetails.receivedAmount || 0).toLocaleString()}
                          </Text>
                          <Text fontSize="9px" fontWeight="900" color="red.500">
                            BALANCE: ₹{((treatmentDetails.estimateMin || 0) - (treatmentDetails.receivedAmount || 0)).toLocaleString()}
                          </Text>
                        </VStack>
                      </Grid>
                    ) : (
                      <Box mt={4} p={5} bg="blue.50" borderRadius="3xl" border="1px dashed" borderColor="blue.200" position="relative">
                        <VStack align="stretch" spacing={4} w="full">
                          <HStack justify="space-between" w="full" align="center">
                            <HStack bg="white" p={1.5} borderRadius="20px" border="1px solid" borderColor="blue.100" spacing={4} shadow="sm">
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
                                        minW="70px"
                                        px={3}
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

                              <Divider orientation="vertical" h="30px" borderColor="gray.200" />

                              {/* 2. Dentition */}
                              <VStack align="start" spacing={1}>
                                <Text fontSize="8px" fontWeight="1000" color="gray.400" ml={1}>DENTITION</Text>
                                <DentitionToggle
                                  value={values.dentitionType}
                                  onChange={(val) => setFieldValue("dentitionType", val)}
                                />
                              </VStack>

                              <Divider orientation="vertical" h="30px" borderColor="gray.200" />

                              {/* 3. Notation System */}
                              <VStack align="start" spacing={1}>
                                <Text fontSize="8px" fontWeight="1000" color="gray.400" ml={1}>NOTATION SYSTEM</Text>
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
                                      minW="45px"
                                      px={2}
                                      fontWeight="900"
                                      borderRadius="md"
                                      transition="all 0.2s"
                                    >
                                      {n.toUpperCase()}
                                    </Button>
                                  ))}
                                </HStack>
                              </VStack>
                            </HStack>
                            <VStack align="start" spacing={0}>
                              <HStack spacing={2}>
                                <Badge colorScheme={values.tooth ? "blue" : "orange"} variant="solid" borderRadius="full" px={3}>
                                  {values.tooth ? `SELECTED TOOTH: ${values.tooth}` : "GENERAL CLINICAL ENTRY"}
                                </Badge>
                                {values.position && (
                                  <Badge colorScheme="teal" variant="outline" borderRadius="full">
                                    {values.position.toUpperCase()} • {values.side.toUpperCase()}
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>

                          <Box bg="white" borderRadius="2xl" p={4} border="1px solid" borderColor="blue.100" shadow="sm">
                            <Box w="full">
                              <TeethChart
                                dentitionType={values.dentitionType}
                                selectedTeeth={values.tooth ? [{ id: values.tooth, fdi: values.tooth } as ToothData] : []}
                                onToothClick={(tooth) => {
                                  const toothId = String(tooth.fdi || tooth.id);
                                  setFieldValue("tooth", toothId);

                                  // Quadrant Detection
                                  const id = parseInt(toothId);
                                  if (!isNaN(id)) {
                                    if ((id >= 11 && id <= 18) || (id >= 51 && id <= 55)) {
                                      setFieldValue("position", "upper"); setFieldValue("side", "right");
                                    }
                                    else if ((id >= 21 && id <= 28) || (id >= 61 && id <= 65)) {
                                      setFieldValue("position", "upper"); setFieldValue("side", "left");
                                    }
                                    else if ((id >= 31 && id <= 38) || (id >= 71 && id <= 75)) {
                                      setFieldValue("position", "lower"); setFieldValue("side", "left");
                                    }
                                    else if ((id >= 41 && id <= 48) || (id >= 81 && id <= 85)) {
                                      setFieldValue("position", "lower"); setFieldValue("side", "right");
                                    }
                                  }
                                }}
                                notationType={values.toothNotation}
                                toothComplaints={{}}
                                activeComplaintType={values.complaintType || "CHIEF COMPLAINT"}
                                sessionDate={new Date().toISOString().split('T')[0]}
                              />
                            </Box>
                          </Box>

                          <VStack align="start" spacing={1} w="full">
                            <Text fontSize="9px" fontWeight="900" color="gray.400">General Notes</Text>
                            <Input
                              size="sm" bg="white" borderRadius="md" placeholder="e.g. Deep caries, missing, etc."
                              value={values.toothNote}
                              onChange={(e) => setFieldValue("toothNote", e.target.value)}
                            />
                          </VStack>
                        </VStack>
                      </Box>
                    )}

                    <Divider mt={5} />
                  </Box>

                  {/* Treatment View Drawer */}
                  <CustomDrawer
                    open={isViewModalOpen}
                    close={() => setIsViewModalOpen(false)}
                    title="Full Treatment Details"
                    width="70vw"
                  >
                    <TreatmentDetailsView data={treatmentDetails} />
                  </CustomDrawer>

                  {/* 2. Clinical Team */}
                  <VStack align="start" spacing={4} w="full">
                    <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">2. CLINICAL TEAM</Text>
                    <Grid templateColumns={{ base: "1fr", md: treatmentDetails ? "1fr 1fr" : "1fr" }} gap={4} w="full">
                      {treatmentDetails && (
                        <VStack align="start" spacing={2} w="full">
                          <Text fontSize="9px" fontWeight="1000" color="gray.400">EXAMINING DOCTOR</Text>
                          <CustomInput
                            name="examiningDoctor"
                            type="real-time-user-search"
                            query={{ type: 'doctor' }}
                            value={values.examiningDoctor}
                            onChange={(val: any) => setFieldValue("examiningDoctor", val)}
                            style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                            placeholder="Select Examining Dr."
                            disabled={true}
                          />
                        </VStack>
                      )}
                      <VStack align="start" spacing={2} w="full">
                        <Text fontSize="9px" fontWeight="1000" color="gray.400">TREATING DOCTOR</Text>
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
                  </VStack>

                  {/* 4. Clinical Observation */}
                  <VStack align="start" spacing={2} w="full">
                    <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">3. CLINICAL OBSERVATION (WORK DONE NOTE)</Text>
                    <CustomInput
                      name="workDoneNote"
                      type="textarea"
                      placeholder="Enter detailed documentation regarding the work completed..."
                      value={values.workDoneNote}
                      onChange={(e: any) => setFieldValue("workDoneNote", e.target.value)}
                      style={{ minHeight: "130px", background: "gray.50", border: '1px solid', borderColor: 'gray.100', borderRadius: '24px', padding: '20px', fontSize: '14px' }}
                    />
                  </VStack>

                  {/* 5. Today Dues */}
                  <VStack align="stretch" spacing={5} p={6} bg={values.complaintType === "CHIEF COMPLAINT" ? "red.50" : values.complaintType === "OTHER FINDING" ? "orange.50" : values.complaintType === "EXISTING FINDING" ? "green.50" : "blue.50"} borderRadius="3xl" border="1px solid" borderColor={complaintColor}>
                    <Text fontSize="10px" fontWeight="1000" color={complaintColor} letterSpacing="0.2em">4. TODAY DUES</Text>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="9px" fontWeight="1000" color="gray.500">Actual Amount (₹)</Text>
                        <Input
                          size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px"
                          value={values.amount}
                          placeholder="0.00"
                          onChange={(e) => setFieldValue("amount", e.target.value)}
                        />
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="9px" fontWeight="1000" color="red.500">DISCOUNT (₹)</Text>
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
                        <Text fontSize="10px" fontWeight="1000" color={complaintColor}>TOTAL NET PAYABLE</Text>
                        <Text fontSize="22px" fontWeight="1000" color={complaintColor}>
                          ₹{(Number(values.amount || 0) - Number(values.discount || 0)).toLocaleString()}
                        </Text>
                      </VStack>
                      <Circle size="40px" bg="white" color={complaintColor} border="1px solid" borderColor={complaintColor}>
                        <FiCheckCircle size={20} />
                      </Circle>
                    </HStack>
                  </VStack>

                  {/* 6. Procedure / Treatment Plan */}
                  <VStack align="start" spacing={3} w="full">
                    <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">5. TREATMENT CODE (PROCEDURE)</Text>
                    <Button
                      type="button"
                      w="full"
                      h="80px"
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

                    {values.treatmentCode && (
                      <Box p={5} bg="blue.50" borderRadius="2xl" w="full" borderLeft="6px solid" borderColor="blue.500">
                        <Text fontSize="14px" fontWeight="1000" color="blue.800" noOfLines={2}>
                          {values.treatmentCode.split(" → ").pop()}
                        </Text>
                        <Text fontSize="11px" color="blue.400" mt={1}>
                          {values.treatmentCode.split(" → ").join(" • ")}
                        </Text>
                      </Box>
                    )}
                  </VStack>

                  {/* Procedure Explorer Drawer */}
                  <CustomDrawer
                    open={isProcedureOpen}
                    close={() => setIsProcedureOpen(false)}
                    title="Procedure Explorer"
                    width="70vw"
                  >
                    <Box h="full" p={6}>
                      <VStack align="stretch" spacing={5} h="full">
                        {/* Search Bar */}
                        <Box bg="white" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
                          <HStack spacing={4} px={4}>
                            <Icon as={FiSearch} color="blue.500" boxSize={5} />
                            <Input
                              variant="unstyled"
                              placeholder="Search procedures by name or category..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              fontSize="15px"
                              fontWeight="1000"
                              py={4}
                            />
                          </HStack>
                        </Box>

                        {/* Explorer Content */}
                        <Box
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="gray.100"
                          overflow="hidden"
                          bg="white"
                          boxShadow="sm"
                          h="500px"
                        >
                          {searchTerm.trim() ? (
                            <Box h="full" overflowY="auto" p={5}>
                              <VStack align="stretch" spacing={2.5}>
                                {filteredProcedures?.map((proc: any) => {
                                  const fullCode = `${proc.category} → ${proc.subcategory} → ${proc.name}`;
                                  return (
                                    <HStack
                                      key={fullCode}
                                      p={4}
                                      bg="white"
                                      borderRadius="xl"
                                      cursor="pointer"
                                      onClick={() => {
                                        setFieldValue("treatmentCode", fullCode);
                                        setIsProcedureOpen(false);
                                      }}
                                      _hover={{ transform: "translateX(4px)", bg: "blue.50/30" }}
                                      transition="all 0.2s"
                                      justify="space-between"
                                      border="1px solid"
                                      borderColor="gray.100"
                                    >
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.1em">
                                          {proc.category.toUpperCase()} • {proc.subcategory.toUpperCase()}
                                        </Text>
                                        <Text fontSize="12px" fontWeight="900">{proc.name}</Text>
                                      </VStack>
                                    </HStack>
                                  );
                                })}
                              </VStack>
                            </Box>
                          ) : (
                            <Grid templateColumns="repeat(5, 1fr)" h="full">
                              {/* Categories */}
                              <Box borderRight="1px solid" borderColor="gray.100" overflowY="auto">
                                {groupedData.map((cat: any, idx) => (
                                  <Box
                                    key={cat.name}
                                    px={4} py={3}
                                    cursor="pointer"
                                    bg={selectedCatIdx === idx ? "blue.50" : "transparent"}
                                    color={selectedCatIdx === idx ? "blue.600" : "gray.500"}
                                    onClick={() => {
                                      setSelectedCatIdx(idx);
                                      setSelectedSubIdx(null); setSelectedN1Idx(null); setSelectedN2Idx(null); setSelectedN3Idx(null);
                                    }}
                                    _hover={{ bg: "blue.50/20" }}
                                  >
                                    <Text fontSize="10px" fontWeight="900" letterSpacing="widest">{cat.name.toUpperCase()}</Text>
                                  </Box>
                                ))}
                              </Box>
                              {/* Subcategories */}
                              <Box borderRight="1px solid" borderColor="gray.100" overflowY="auto">
                                {selectedCatIdx !== null && groupedData[selectedCatIdx]?.subcategories.map((sub: any, idx: number) => (
                                  <Box
                                    key={sub.name}
                                    px={4} py={3}
                                    cursor="pointer"
                                    bg={selectedSubIdx === idx ? "blue.50" : "transparent"}
                                    color={selectedSubIdx === idx ? "blue.600" : "gray.500"}
                                    onClick={() => {
                                      setSelectedSubIdx(idx);
                                      setSelectedN1Idx(null); setSelectedN2Idx(null); setSelectedN3Idx(null);
                                    }}
                                    _hover={{ bg: "blue.50/20" }}
                                  >
                                    <Text fontSize="10px" fontWeight="900">{sub.name}</Text>
                                  </Box>
                                ))}
                              </Box>
                              {/* Name1 */}
                              <Box borderRight="1px solid" borderColor="gray.100" overflowY="auto">
                                {selectedSubIdx !== null && groupedData[selectedCatIdx!]?.subcategories[selectedSubIdx]?.name1s.map((n1: any, idx: number) => (
                                  <Box
                                    key={n1.name}
                                    px={4} py={3}
                                    cursor="pointer"
                                    bg={selectedN1Idx === idx ? "blue.50" : "transparent"}
                                    color={selectedN1Idx === idx ? "blue.600" : "gray.500"}
                                    onClick={() => {
                                      setSelectedN1Idx(idx);
                                      setSelectedN2Idx(null); setSelectedN3Idx(null);
                                    }}
                                    _hover={{ bg: "blue.50/20" }}
                                  >
                                    <Text fontSize="10px" fontWeight="900">{n1.name}</Text>
                                  </Box>
                                ))}
                              </Box>
                              {/* Name2 */}
                              <Box borderRight="1px solid" borderColor="gray.100" overflowY="auto">
                                {selectedN1Idx !== null && groupedData[selectedCatIdx!]?.subcategories[selectedSubIdx!]?.name1s[selectedN1Idx]?.name2s.map((n2: any, idx: number) => (
                                  <Box
                                    key={n2.name}
                                    px={4} py={3}
                                    cursor="pointer"
                                    bg={selectedN2Idx === idx ? "blue.50" : "transparent"}
                                    color={selectedN2Idx === idx ? "blue.600" : "gray.500"}
                                    onClick={() => {
                                      setSelectedN2Idx(idx);
                                      setSelectedN3Idx(null);
                                    }}
                                    _hover={{ bg: "blue.50/20" }}
                                  >
                                    <Text fontSize="10px" fontWeight="900">{n2.name}</Text>
                                  </Box>
                                ))}
                              </Box>
                              {/* Name3 (Procedures) */}
                              <Box overflowY="auto">
                                {selectedN2Idx !== null && groupedData[selectedCatIdx!]?.subcategories[selectedSubIdx!]?.name1s[selectedN1Idx!]?.name2s[selectedN2Idx]?.name3s.map((n3: any, idx: number) => (
                                  <Box
                                    key={n3.name}
                                    px={4} py={3}
                                    cursor="pointer"
                                    bg={selectedN3Idx === idx ? "blue.50" : "transparent"}
                                    color={selectedN3Idx === idx ? "blue.600" : "gray.500"}
                                    onClick={() => {
                                      setSelectedN3Idx(idx);
                                      const proc = n3.proc;
                                      const parts = [proc.category, proc.subcategory, proc.name];
                                      if (proc.name2 && proc.name2 !== "None") parts.push(proc.name2);
                                      if (proc.name3 && proc.name3 !== "None") parts.push(proc.name3);
                                      const fullCode = parts.join(" → ");
                                      setFieldValue("treatmentCode", fullCode);
                                      setIsProcedureOpen(false);
                                    }}
                                    _hover={{ bg: "blue.50/20" }}
                                  >
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="10px" fontWeight="1000">{n3.name}</Text>
                                    </VStack>
                                  </Box>
                                ))}
                              </Box>
                            </Grid>
                          )}
                        </Box>
                      </VStack>
                    </Box>
                  </CustomDrawer>

                  {/* 7. Clinical Status */}
                  <VStack align="start" spacing={3} w="full" pt={2}>
                    <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">6. CLINICAL STATUS</Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                      {["COMPLETE", "PENDING", "INCOMPLETE"].map((status) => (
                        <Button
                          type="button"
                          key={status}
                          h="50px"
                          variant={values.status === status ? "solid" : "outline"}
                          colorScheme={
                            status === "COMPLETE" ? "green" :
                              status === "PENDING" ? "orange" : "red"
                          }
                          onClick={() => setFieldValue("status", status)}
                          borderRadius="xl"
                          fontSize="11px"
                          fontWeight="1000"
                          _hover={{ transform: "translateY(-1px)" }}
                          transition="all 0.2s"
                        >
                          {status}
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

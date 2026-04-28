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
import { FiActivity, FiCheckCircle, FiPlusCircle, FiSearch, FiEye } from "react-icons/fi";
import stores from "../../../store/stores";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import TreatmentDetailsView from "../../toothTreatment/element/TreatmentDetailsView";

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
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const [selectedSubIdx, setSelectedSubIdx] = useState(0);

  useEffect(() => {
    getProcedures();
  }, [getProcedures]);

  const groupedData = useMemo(() => {
    const categories: Record<string, any> = {};
    procedures.data.forEach((proc: any) => {
      if (!categories[proc.category]) {
        categories[proc.category] = { name: proc.category, subcategories: {} };
      }
      if (!categories[proc.category].subcategories[proc.subcategory]) {
        categories[proc.category].subcategories[proc.subcategory] = { name: proc.subcategory, jobs: [] };
      }
      categories[proc.category].subcategories[proc.subcategory].jobs.push(proc);
    });

    return Object.values(categories).map((cat: any) => ({
      ...cat,
      subcategories: Object.values(cat.subcategories)
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

  const activeCategory = groupedData[selectedCatIdx];
  const activeSubcategory = activeCategory?.subcategories[selectedSubIdx];

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        doctor: values.doctor?.value || values.doctor,
        patient: patientDetails._id,
        treatment: treatmentDetails?._id,
        status: values.status,
        amount: Number(values.amount) || 0,
        discount: Number(values.discount) || 0,
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
    status: editData?.status || "COMPLETE",
    amount: editData?.amount ?? (treatmentDetails?.estimateMin || 0),
    discount: editData?.discount ?? (treatmentDetails?.discount || 0),
    treatmentCode: editData?.treatmentCode || treatmentDetails?.treatmentPlan || "",
  };

  return (
    <Box p={0} bg="white" borderRadius="3xl">
      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        {({ values, setFieldValue, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <VStack align="stretch" spacing={4}>
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
                      <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">PLANNED DR.</Text>
                      <Text fontSize="11px" fontWeight="900" color="gray.700" noOfLines={1}>
                        {treatmentDetails.doctor?.name || (typeof treatmentDetails.doctor === 'string' ? treatmentDetails.doctor : "N/A")}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.1em">PLANNED AMOUNT</Text>
                      <Text fontSize="12px" fontWeight="1000" color="blue.600">
                        ₹{(treatmentDetails.estimateMin || 0).toLocaleString()}
                      </Text>
                    </VStack>
                  </Grid>
                ) : (
                  <Box mt={4} p={3} bg="orange.50" borderRadius="xl" border="1px dashed" borderColor="orange.200">
                    <Text fontSize="11px" color="orange.600" fontWeight="900">
                      NO ACTIVE TREATMENT LINKED • STANDALONE ENTRY
                    </Text>
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

              {/* 1. Complaint Type */}
              <VStack align="start" spacing={3}>
                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">1. COMPLAINT TYPE</Text>
                <HStack bg="gray.50" p={1.5} borderRadius="xl" w="full" spacing={3} border="1px solid" borderColor="gray.100">
                  {["CHIEF COMPLAINT", "OTHER FINDING", "EXISTING FINDING"].map((type) => {
                    const isActive = values.complaintType === type;
                    const getStyles = () => {
                      switch (type) {
                        case "CHIEF COMPLAINT": return { bg: "red.500", color: "white" };
                        case "OTHER FINDING": return { bg: "orange.400", color: "white" };
                        case "EXISTING FINDING": return { bg: "green.500", color: "white" };
                        default: return { bg: "transparent", color: "gray.600" };
                      }
                    };
                    const styles = isActive ? getStyles() : { bg: "white", color: "gray.500" };

                    return (
                      <Button
                        type="button"
                        key={type}
                        flex={1}
                        size="md"
                        h="44px"
                        fontSize="10px"
                        fontWeight="1000"
                        borderRadius="xl"
                        bg={styles.bg}
                        color={styles.color}
                        boxShadow={isActive ? "md" : "sm"}
                        onClick={() => setFieldValue("complaintType", type)}
                        _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                        transition="all 0.2s"
                      >
                        {type}
                      </Button>
                    );
                  })}
                </HStack>
              </VStack>

              {/* 2. Treating Doctor */}
              <VStack align="start" spacing={2} w="full">
                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">2. TREATING DOCTOR</Text>
                <CustomInput
                  name="doctor"
                  type="real-time-user-search"
                  query={{ type: 'doctor' }}
                  value={values.doctor}
                  onChange={(val: any) => setFieldValue("doctor", val)}
                  style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                />
              </VStack>

              {/* 4. Clinical Observation */}
              <VStack align="start" spacing={2} w="full">
                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">4. CLINICAL OBSERVATION (WORK DONE NOTE)</Text>
                <CustomInput
                  name="workDoneNote"
                  type="textarea"
                  placeholder="Enter detailed documentation regarding the work completed..."
                  value={values.workDoneNote}
                  onChange={(e: any) => setFieldValue("workDoneNote", e.target.value)}
                  style={{ minHeight: "130px", background: "gray.50", border: '1px solid', borderColor: 'gray.100', borderRadius: '24px', padding: '20px', fontSize: '14px' }}
                />
              </VStack>

              {/* 5. Actual Billing */}
              <VStack align="stretch" spacing={5} p={6} bg="green.50/30" borderRadius="3xl" border="1px solid" borderColor="green.100">
                <Text fontSize="10px" fontWeight="1000" color="green.600" letterSpacing="0.2em">5. ACTUAL BILLING</Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="9px" fontWeight="1000" color="gray.500">Actual Amount (₹)</Text>
                    <Input
                      size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px"
                      value={values.amount}
                      onChange={(e) => setFieldValue("amount", e.target.value)}
                    />
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="9px" fontWeight="1000" color="red.500">DISCOUNT (₹)</Text>
                    <Input
                      size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px" color="red.600"
                      value={values.discount}
                      onChange={(e) => setFieldValue("discount", e.target.value)}
                    />
                  </VStack>
                </Grid>
                <HStack pt={4} borderTop="1px dashed" borderColor="green.200" justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="1000" color="green.600">TOTAL NET PAYABLE</Text>
                    <Text fontSize="22px" fontWeight="1000" color="green.800">
                      ₹{(Number(values.amount || 0) - Number(values.discount || 0)).toLocaleString()}
                    </Text>
                  </VStack>
                  <Circle size="40px" bg="green.100" color="green.600">
                    <FiCheckCircle size={20} />
                  </Circle>
                </HStack>
              </VStack>

              {/* 6. Procedure / Treatment Plan */}
              <VStack align="start" spacing={3} w="full">
                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">6. TREATMENT CODE (PROCEDURE)</Text>
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
                    <Text fontSize="11px" color="blue.400" noOfLines={1} mt={1}>
                      {values.treatmentCode.split(" → ").slice(0, 2).join(" • ")}
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
                                  <Badge p={2} borderRadius="md" colorScheme="blue" fontSize="12px" fontWeight="900">
                                    ₹{(proc.defaultEstimate || 0).toLocaleString()}
                                  </Badge>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </Box>
                      ) : (
                        <Grid templateColumns="1fr 1fr 1.5fr" h="full">
                          {/* Categories */}
                          <Box borderRight="1px solid" borderColor="gray.100" overflowY="auto">
                            {groupedData.map((cat: any, idx) => (
                              <Box
                                key={cat.name}
                                px={5} py={4}
                                cursor="pointer"
                                bg={selectedCatIdx === idx ? "blue.50" : "transparent"}
                                color={selectedCatIdx === idx ? "blue.600" : "gray.500"}
                                onClick={() => { setSelectedCatIdx(idx); setSelectedSubIdx(0); }}
                                _hover={{ bg: "blue.50/20" }}
                              >
                                <Text fontSize="11px" fontWeight="900" letterSpacing="widest">{cat.name.toUpperCase()}</Text>
                              </Box>
                            ))}
                          </Box>
                          {/* Subcategories */}
                          <Box borderRight="1px solid" borderColor="gray.100" overflowY="auto">
                            {activeCategory?.subcategories.map((sub: any, idx: number) => (
                              <Box
                                key={sub.name}
                                px={6} py={4}
                                cursor="pointer"
                                bg={selectedSubIdx === idx ? "blue.50" : "transparent"}
                                color={selectedSubIdx === idx ? "blue.600" : "gray.500"}
                                onClick={() => setSelectedSubIdx(idx)}
                              >
                                <Text fontSize="11px" fontWeight="900" letterSpacing="widest">{sub.name.toUpperCase()}</Text>
                              </Box>
                            ))}
                          </Box>
                          {/* Procedures */}
                          <Box overflowY="auto">
                            {activeSubcategory?.jobs.map((job: any) => {
                              const fullCode = `${activeCategory?.name} → ${activeSubcategory?.name} → ${job.name}`;
                              return (
                                <VStack
                                  key={job.name}
                                  px={6} py={5}
                                  align="start"
                                  spacing={1}
                                  cursor="pointer"
                                  onClick={() => {
                                    setFieldValue("treatmentCode", fullCode);
                                    setIsProcedureOpen(false);
                                  }}
                                  _hover={{ bg: "blue.50/30" }}
                                >
                                  <Text fontSize="12px" fontWeight="900">{job.name.toUpperCase()}</Text>
                                  <Text fontSize="10px" color="blue.500">₹{(job.defaultEstimate || 0).toLocaleString()}</Text>
                                </VStack>
                              );
                            })}
                          </Box>
                        </Grid>
                      )}
                    </Box>
                  </VStack>
                </Box>
              </CustomDrawer>

              {/* 7. Clinical Status */}
              <VStack align="start" spacing={3} w="full" pt={2}>
                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">7. CLINICAL STATUS</Text>
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
        )}
      </Formik>
    </Box>
  );
});

export default WorkDoneForm;

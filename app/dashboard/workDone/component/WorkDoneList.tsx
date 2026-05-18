"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Text,
  IconButton,
  Tooltip,
  Icon,
  HStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  SimpleGrid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Center,
  Input,
  Heading,
  Textarea,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FiTrash2, FiActivity, FiUser, FiChevronDown, FiClock, FiFileText, FiEye, FiEdit, FiPrinter, FiPlus, FiPackage, FiDownload } from "react-icons/fi";
import { Formik, Form } from "formik";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { Grid } from "@chakra-ui/react";
import stores from "../../../store/stores";
import { formatDate } from "../../../component/config/utils/dateUtils";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import TreatmentDetailsView from "../../toothTreatment/element/TreatmentDetailsView";
import WorkDoneForm from "./WorkDoneForm";
import CreatableSelect from 'react-select/creatable';
import { adultTeeth, childTeeth } from "../../../component/common/TeethModel/DentalChartComponent/utils/teethData";

interface WorkDoneListProps {
  patientDetails: any;
  treatmentId?: string; // Add this prop
  onEdit?: (record: any) => void; // Add this prop
}

const WorkDoneList = observer(({ patientDetails, treatmentId, onEdit }: WorkDoneListProps) => {
  const getToothNameParts = (toothId: string, fallbackPosition?: string, fallbackSide?: string) => {
    if (!toothId) {
      const line1 = `${fallbackSide || ""} ${fallbackPosition || ""}`.trim().toUpperCase();
      return { line1: line1 || "GENERAL", line2: "" };
    }
    const idStr = String(toothId).trim();
    const tooth = adultTeeth.find(t => t.id === idStr) || childTeeth.find(t => t.id === idStr);
    if (!tooth) {
      const line1 = `${fallbackSide || ""} ${fallbackPosition || ""}`.trim().toUpperCase();
      return { line1: line1 || "GENERAL", line2: "" };
    }

    const line1 = `${tooth.side} ${tooth.position}`.toUpperCase();
    let line2 = tooth.name;
    line2 = line2.replace(/primary/gi, "").trim();
    const sideRegex = new RegExp(tooth.side, "gi");
    const posRegex = new RegExp(tooth.position, "gi");
    line2 = line2.replace(sideRegex, "").replace(posRegex, "").trim();
    line2 = line2.replace(/\s+/g, " ").toUpperCase();

    return { line1, line2 };
  };

  const getToothName = (toothId: string) => {
    if (!toothId) return "";
    const idStr = String(toothId).trim();
    const tooth = adultTeeth.find(t => t.id === idStr) || childTeeth.find(t => t.id === idStr);
    return tooth ? tooth.name : "";
  };

  const {
    workDoneStore: { workDone, getWorkDone, deleteWorkDone, updateWorkDone },
    toothTreatmentStore: { updateToothTreatment },
    auth: { openNotification, userType },
  } = stores;

  const [currentPage, setCurrentPage] = useState(1);
  const [openView, setOpenView] = useState({ open: false, data: null as any });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState({ open: false, id: "" });
  const [openDailyReportModal, setOpenDailyReportModal] = useState({ open: false });

  const fetchRecords = useCallback(() => {
    getWorkDone({
      patientId: patientDetails?._id,
      treatmentId: treatmentId, // Filter by treatment if provided
      page: currentPage,
    }).catch((err) => {
      openNotification({
        type: "error",
        title: "Fetch Failed",
        message: err?.message,
      });
    });
  }, [getWorkDone, patientDetails?._id, treatmentId, currentPage, openNotification]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async () => {
    const id = deleteModal.id;
    setIsDeleting(true);
    try {
      await deleteWorkDone(id);
      openNotification({
        type: "success",
        title: "Record Deleted",
        message: "Work done record removed successfully.",
      });
      setDeleteModal({ open: false, id: "" });
      fetchRecords();
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Delete Failed",
        message: err?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (record: any, newStatus: string) => {
    try {
      // 1. Update Work Done Status
      await updateWorkDone(record._id, { status: newStatus });

      // 2. Sync with Treatment if it exists
      const treatmentObj = record.treatment;
      if (treatmentObj) {
        const tId = treatmentObj._id || treatmentObj;
        await updateToothTreatment({
          treatmentId: tId,
          status: newStatus
        });
      }

      openNotification({
        type: "success",
        title: "Status Synchronized",
        message: `Procedure and Treatment Plan updated to ${newStatus}.`,
      });
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Update Failed",
        message: err?.message,
      });
    }
  };

  const [openEditWorkDone, setOpenEditWorkDone] = useState({ open: false, data: null as any });

  const getStatusColor = (status: string) => {
    switch (String(status || "").toUpperCase()) {
      case "COMPLETE":
      case "COMPLETED":
        return "green";
      case "PENDING":
        return "orange";
      case "INCOMPLETE":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="11px" fontWeight="1000" color="gray.500" letterSpacing="0.1em">CLINICAL RECORDS</Text>
        <Button
          size="sm"
          colorScheme="blue"
          variant="outline"
          leftIcon={<FiDownload />}
          borderRadius="xl"
          fontSize="11px"
          fontWeight="bold"
          onClick={() => setOpenDailyReportModal({ open: true })}
        >
          DOWNLOAD DAILY PRESCRIPTION
        </Button>
      </HStack>
      <VStack align="stretch" spacing={4}>
        {workDone.loading ? (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
              <Text color="gray.500" fontSize="sm" fontWeight="medium">Fetching clinical history...</Text>
            </VStack>
          </Center>
        ) : workDone.data.length === 0 ? (
          <VStack py={14} bg="gray.50" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
            <Icon as={FiActivity} fontSize="40px" color="gray.300" />
            <Text fontWeight="bold" color="gray.400" fontSize="14px">No clinical history found</Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={4}>
            {workDone.data.map((record: any) => (
              <Box 
                key={record._id} 
                bg="white" 
                p={6} 
                borderRadius="2xl" 
                border="2px solid" 
                borderColor="gray.100"
                shadow="sm"
                transition="all 0.2s"
                _hover={{ shadow: "lg", borderColor: "blue.300" }}
              >
                {/* Header: Date & Doctor */}
                <HStack justify="space-between" mb={4}>
                  <HStack spacing={3}>
                    <HStack spacing={1.5} bg="blue.50" px={3.5} py={1.5} borderRadius="full">
                      <Icon as={FiClock} fontSize="12px" color="blue.500" />
                      <Text fontSize="12px" fontWeight="1000" color="blue.700">
                        {formatDate(record.createdAt)}
                      </Text>
                    </HStack>
                    <HStack spacing={1.5} pl={2}>
                      <Icon as={FiUser} fontSize="14px" color="blue.400" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="12px" fontWeight="900" color="gray.700" lineHeight="1.2">
                          Treating: Dr. {record.doctor?.name || "N/A"}
                        </Text>
                        {record.examiningDoctor && (
                          <Text fontSize="10px" fontWeight="800" color="gray.500" mt={0.5}>
                            Examined: Dr. {record.examiningDoctor?.name}
                         </Text>
                        )}
                      </VStack>
                    </HStack>
                  </HStack>
                  
                  <HStack spacing={3}>
                    {/* View Treatment Action */}
                    {record.treatment && (
                      <Button
                        size="xs"
                        variant="solid"
                        colorScheme="blue"
                        leftIcon={<FiEye />}
                        onClick={() => setOpenView({ open: true, data: record.treatment })}
                        borderRadius="full"
                        fontSize="10px"
                        fontWeight="1000"
                        px={3.5}
                        h="28px"
                        shadow="sm"
                      >
                        VIEW PLAN
                      </Button>
                    )}
 
                     {/* Status Menu */}
                     <Menu>
                       <MenuButton 
                         as={Badge} 
                         cursor="pointer" 
                         colorScheme={getStatusColor(record.status)} 
                         px={3.5} py={1.5} 
                         borderRadius="lg"
                         fontSize="10px"
                         fontWeight="1000"
                         variant="solid"
                         _hover={{ opacity: 0.9 }}
                         h="28px"
                         display="inline-flex"
                         alignItems="center"
                       >
                         <HStack spacing={1}>
                           <Text>{String(record.status || "complete").toUpperCase()}</Text>
                           <Icon as={FiChevronDown} />
                         </HStack>
                       </MenuButton>
                       <MenuList p={1} borderRadius="xl" shadow="xl" border="none">
                         {[
                           { value: "complete", label: "COMPLETE" },
                           { value: "pending", label: "PENDING" },
                           { value: "incomplete", label: "INCOMPLETE" }
                         ].map((s) => (
                           <MenuItem 
                             key={s.value}
                             onClick={() => handleStatusChange(record, s.value)}
                             fontSize="11px"
                             fontWeight="1000"
                             borderRadius="lg"
                             color={getStatusColor(s.value) + ".600"}
                           >
                             Mark as {s.label}
                           </MenuItem>
                         ))}
                       </MenuList>
                     </Menu>
 
                     {/* Print Action */}
                     <IconButton
                       size="sm"
                       variant="ghost"
                       colorScheme="gray"
                       icon={<FiPrinter />}
                       aria-label="Print Report"
                       onClick={() => setOpenPrintModal({ open: true, id: record._id })}
                       borderRadius="full"
                     />
 
                     {/* Edit Action */}
                     {stores.auth.hasPermission('workdone', 'edit') && (
                       <IconButton
                         size="sm"
                         variant="ghost"
                         colorScheme="blue"
                         icon={<FiEdit />}
                         aria-label="Edit"
                         onClick={() => setOpenEditWorkDone({ open: true, data: record })}
                         borderRadius="full"
                       />
                     )}
 
                     {/* Delete Action */}
                     {stores.auth.hasPermission('workdone', 'delete') && (
                       <IconButton
                         size="sm"
                         variant="ghost"
                         colorScheme="red"
                         icon={<FiTrash2 />}
                         aria-label="Delete"
                         onClick={() => setDeleteModal({ open: true, id: record._id })}
                         borderRadius="full"
                       />
                     )}
                   </HStack>
                 </HStack>
 
                 <Divider mb={4} borderColor="gray.200" borderWidth="1.5px" />
 
                 {/* Content: Tooth Info & Note on the Same Line */}
                 <HStack spacing={4} w="full" align="stretch">
                   {(record.tooth || record.treatment?.tooth) && (
                     <VStack
                       align="center"
                       justify="center"
                       bg="blue.50"
                       border="2px solid"
                       borderColor="blue.300"
                       borderRadius="2xl"
                       p={4}
                       minW="120px"
                       shadow="sm"
                       transition="all 0.2s"
                       _hover={{ bg: "blue.100", borderColor: "blue.400" }}
                     >
                        <Text fontSize="34px" fontWeight="1000" color="blue.800" lineHeight="1" my={2}>
                         {record.tooth || record.treatment?.tooth}
                       </Text>
                       {(() => {
                          const { line1, line2 } = getToothNameParts(
                            record.tooth || record.treatment?.tooth,
                            record.position || record.treatment?.position,
                            record.side || record.treatment?.side
                          );
                          return (
                            <>
                              <Text fontSize="9px" fontWeight="1000" color="blue.500" letterSpacing="0.08em" mb={1}>
                                {line1}
                              </Text>
                              {line2 && (
                                <Text fontSize="9px" fontWeight="1000" color="gray.600" textTransform="uppercase" textAlign="center" letterSpacing="0.02em">
                                  {line2}
                                </Text>
                              )}
                            </>
                          );
                        })()}
                      </VStack>
                   )}
 
                   {(record.workDoneNote || record.toothNote) && (
                     <Box bg="blue.50" p={4} borderRadius="2xl" flex={1} borderLeft="5px solid" borderColor="blue.500" shadow="sm">
                       <HStack spacing={2} mb={2}>
                         <Icon as={FiFileText} fontSize="14px" color="blue.500" />
                         <Text fontSize="12px" fontWeight="1000" color="blue.600" letterSpacing="0.08em">CLINICAL OBSERVATION</Text>
                       </HStack>
                       <Text fontSize="15px" fontWeight="800" color="gray.800" lineHeight="1.6">
                         {record.workDoneNote || record.toothNote}
                       </Text>
                     </Box>
                   )}
                 </HStack>
 
                 {/* Footer: Billing Summary */}
                 <SimpleGrid columns={3} gap={4} mt={6} pt={4} borderTop="1.5px dashed" borderColor="gray.200">
                   <VStack align="start" spacing={1} p={2.5} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                     <Text fontSize="9px" fontWeight="1000" color="blue.500" letterSpacing="0.08em">AMOUNT</Text>
                     <Text fontSize="18px" fontWeight="1000" color="blue.700">₹{record.amount?.toLocaleString()}</Text>
                   </VStack>
                   <VStack align="start" spacing={1} p={2.5} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.100">
                     <Text fontSize="9px" fontWeight="1000" color="red.500" letterSpacing="0.08em">DISCOUNT</Text>
                     <Text fontSize="18px" fontWeight="1000" color="red.600">₹{record.discount?.toLocaleString()}</Text>
                   </VStack>
                   <VStack align="start" spacing={1} p={2.5} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100">
                     <Text fontSize="9px" fontWeight="1000" color="green.600" letterSpacing="0.08em">NET TOTAL</Text>
                     <Text fontSize="20px" fontWeight="1000" color="green.700">₹{(record.amount - record.discount)?.toLocaleString()}</Text>
                   </VStack>
                 </SimpleGrid>
 
                 {/* Procedure at the very bottom, after financials */}
                 <Box mt={4} p={4} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                   <HStack spacing={2} mb={1}>
                     <Icon as={FiActivity} color="blue.500" fontSize="13px" />
                     <Text fontSize="10px" fontWeight="1000" color="gray.500" letterSpacing="0.08em">PROCEDURE</Text>
                   </HStack>
                   <Text fontSize="14px" fontWeight="800" color="gray.800" pl={5}>
                     {record.treatmentCode || "General Procedure"}
                   </Text>
                 </Box>
               </Box>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Treatment Detail Drawer */}
      <CustomDrawer
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title="Full Treatment Details"
        width="75vw"
      >
        <TreatmentDetailsView data={openView.data} />
      </CustomDrawer>

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: "" })} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" p={2}>
          <ModalHeader fontSize="16px" fontWeight="1000">Delete Record?</ModalHeader>
          <ModalCloseButton mt={2} />
          <ModalBody>
            <Text fontSize="13px" color="gray.600">
              Are you sure you want to delete this work done record? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => setDeleteModal({ open: false, id: "" })}
              borderRadius="xl"
              fontSize="12px"
              fontWeight="1000"
            >
              CANCEL
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete}
              borderRadius="xl"
              fontSize="12px"
              fontWeight="1000"
              shadow="lg"
              isLoading={isDeleting}
            >
              CONFIRM DELETE
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Record Drawer */}
      <CustomDrawer
        open={openEditWorkDone.open}
        close={() => setOpenEditWorkDone({ open: false, data: null })}
        title="Edit Work Done"
        width="70vw"
      >
        <Box p={4}>
          <WorkDoneForm
            patientDetails={patientDetails}
            editData={openEditWorkDone.data}
            treatmentDetails={openEditWorkDone.data?.treatment}
            onSuccess={() => {
              setOpenEditWorkDone({ open: false, data: null });
              fetchRecords();
            }}
          />
        </Box>
      </CustomDrawer>

      <PrescriptionPrintDrawer
        isOpen={openPrintModal.open}
        onClose={() => setOpenPrintModal({ open: false, id: "" })}
        workDoneId={openPrintModal.id}
      />

      <DailyPrescriptionDrawer
        isOpen={openDailyReportModal.open}
        onClose={() => setOpenDailyReportModal({ open: false })}
        patientId={patientDetails?._id}
      />
    </Box>
  );
});

const PrescriptionPrintDrawer = observer(({ isOpen, onClose, workDoneId }: any) => {
  const {
    workDoneStore: { downloadWorkDoneReport },
    prescriptionStore,
    auth: { openNotification },
  } = stores;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("Drawer opened, fetching prescriptions...");
      prescriptionStore.getPrescriptions({ limit: 1000 })
        .then(res => console.log("Fetched prescriptions:", res?.data?.length))
        .catch(err => console.error("Error fetching prescriptions:", err));
      
      prescriptionStore.getSuggestions()
        .then(res => console.log("Fetched suggestions:", res))
        .catch(err => console.error("Error fetching suggestions:", err));
    }
  }, [isOpen, prescriptionStore]);

  const [localFormData, setLocalFormData] = useState({
    type: '',
    category: '',
    form: '',
    basicSalt: '',
    brandName: '',
    companyName: '',
    dosage: '',
    details: '',
    doseNo: 0,
    noOfDays: 0,
    description: '',
  });

  const resetLocalForm = () => {
    setLocalFormData({
      type: '',
      category: '',
      form: '',
      basicSalt: '',
      brandName: '',
      companyName: '',
      dosage: '',
      details: '',
      doseNo: 0,
      noOfDays: 0,
      description: '',
    });
  };

  const [previewDrawer, setPreviewDrawer] = useState({ open: false, url: "" });

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      height: '45px',
      borderRadius: '12px',
      borderColor: '#E2E8F0',
      fontSize: '13px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#3182ce'
      }
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: '12px',
      backgroundColor: state.isFocused ? '#EBF8FF' : 'white',
      color: state.isFocused ? '#2B6CB0' : '#4A5568',
      cursor: 'pointer'
    })
  };

  return (
    <CustomDrawer
      open={isOpen}
      close={onClose}
      title="Generate Clinical Report"
      width="90vw"
    >
      <Box p={0}>
        <Formik
          initialValues={{
            prescriptions: [],
            topPadding: 150,
            bottomPadding: 50,
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await downloadWorkDoneReport(workDoneId, {
                ...values,
                isPreview: false
              });
              openNotification({
                type: "success",
                title: "Report Downloaded",
                message: "PDF has been downloaded successfully.",
              });
            } catch (err: any) {
              openNotification({
                type: "error",
                title: "Download Failed",
                message: err?.message,
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <VStack align="stretch" spacing={0}>
                {/* Scrollable Content Area */}
                <Box p={6} overflowY="auto" maxH="calc(100vh - 120px)">
                  <VStack align="stretch" spacing={6}>
                    
                    {/* Header Context */}
                    <Box bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                      <HStack justify="space-between" mb={1}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="10px" fontWeight="1000" color="blue.500" letterSpacing="0.1em">DOCUMENT READY</Text>
                          <Text fontSize="14px" fontWeight="900" color="blue.700">Clinical Report Generation</Text>
                        </VStack>
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          variant="solid" 
                          leftIcon={<FiEye />}
                          borderRadius="lg"
                          isLoading={loading}
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res: any = await stores.workDoneStore.generateWorkDoneReportBlob(workDoneId, {
                                prescriptions: values.prescriptions,
                                topPadding: values.topPadding,
                                bottomPadding: values.bottomPadding,
                              });
                              if (res?.url) {
                                setPreviewDrawer({ open: true, url: res.url });
                              }
                            } catch (err: any) {
                              openNotification({ type: "error", title: "Preview Failed", message: err.message });
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          GENERATE PREVIEW
                        </Button>
                      </HStack>
                    </Box>

                    {/* Layout Grid: Form and List */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
                      {/* Left Column: Prescription Entry Form Column */}
                      <VStack align="stretch" spacing={6}>
                        <Box p={5} borderRadius="2xl" border="1px solid" borderColor="gray.100" bg="white" shadow="sm">
                          <Text fontSize="11px" fontWeight="1000" color="gray.500" mb={4} letterSpacing="0.1em">SEARCH OR ADD PRESCRIPTION</Text>
                          <VStack spacing={4}>
                            <SimpleGrid columns={2} spacing={3} w="full">
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>
                                  TYPE {stores.prescriptionStore.types.length > 0 ? `(${stores.prescriptionStore.types.length})` : '(Loading...)'}
                               </Text>
                                <CreatableSelect
                                  isClearable
                                  isLoading={stores.prescriptionStore.suggestionsLoading}
                                  placeholder="Type..."
                                  options={(stores.prescriptionStore.types || []).map((t: string) => ({ label: t, value: t }))}
                                  value={localFormData.type ? { label: localFormData.type, value: localFormData.type } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, type: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>CATEGORY</Text>
                                <CreatableSelect
                                  isClearable
                                  isLoading={prescriptionStore.suggestionsLoading}
                                  placeholder="Cat..."
                                  options={(prescriptionStore.categories || []).map((c: string) => ({ label: c, value: c }))}
                                  value={localFormData.category ? { label: localFormData.category, value: localFormData.category } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, category: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                            </SimpleGrid>

                            <Box w="full">
                              <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>BRAND NAME</Text>
                              <CreatableSelect
                                isClearable
                                isLoading={stores.prescriptionStore.prescriptionsLoading}
                                placeholder="Start typing brand name to pick from Master..."
                                options={(stores.prescriptionStore.prescriptionsData || []).map((p: any) => ({ 
                                  label: `${p.brandName} (${p.type})`, 
                                  value: p.brandName,
                                  data: p
                                }))}
                                value={localFormData.brandName ? { label: localFormData.brandName, value: localFormData.brandName } : null}
                                onChange={(val: any) => {
                                  const brand = val?.value || '';
                                  const masterData = stores.prescriptionStore.prescriptionsData.find((p: any) => p.brandName === brand);
                                  
                                  if (masterData) {
                                    setLocalFormData({
                                      type: masterData.type || localFormData.type,
                                      category: masterData.category || localFormData.category,
                                      form: masterData.form || localFormData.form,
                                      basicSalt: masterData.basicSalt || '',
                                      brandName: brand,
                                      companyName: masterData.companyName || '',
                                      dosage: masterData.dosage || '',
                                      details: masterData.details || '',
                                      doseNo: masterData.doseNo || 0,
                                      noOfDays: 0,
                                      description: masterData.description || '',
                                    });
                                  } else {
                                    setLocalFormData({ ...localFormData, brandName: brand });
                                  }
                                }}
                                styles={selectStyles}
                              />
                            </Box>

                            <SimpleGrid columns={2} spacing={3} w="full">
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>BASIC SALT</Text>
                                <CreatableSelect
                                  isClearable
                                  isLoading={prescriptionStore.suggestionsLoading}
                                  placeholder="Salt info"
                                  options={(prescriptionStore.basicSalts || []).map((s: string) => ({ label: s, value: s }))}
                                  value={localFormData.basicSalt ? { label: localFormData.basicSalt, value: localFormData.basicSalt } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, basicSalt: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>FORM</Text>
                                <CreatableSelect
                                  isClearable
                                  isLoading={prescriptionStore.suggestionsLoading}
                                  placeholder="Form..."
                                  options={(prescriptionStore.forms || []).map((f: string) => ({ label: f, value: f }))}
                                  value={localFormData.form ? { label: localFormData.form, value: localFormData.form } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, form: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                            </SimpleGrid>

                            <SimpleGrid columns={4} spacing={2} w="full">
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>DOSAGE</Text>
                                <Input
                                  bg="white"
                                  size="sm"
                                  borderRadius="lg"
                                  placeholder="1bid"
                                  value={localFormData.dosage}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalFormData({ ...localFormData, dosage: val });
                                  }}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>DAYS</Text>
                                <Input
                                  bg="white"
                                  size="sm"
                                  type="number"
                                  borderRadius="lg"
                                  placeholder="0"
                                  value={localFormData.noOfDays}
                                  onChange={(e) => {
                                    const days = parseInt(e.target.value) || 0;
                                    // Basic auto-calc logic for Pattern (e.g. 1-0-1 or 1-1-1)
                                    let timesPerDay = 1;
                                    const patternMatch = localFormData.details.match(/\d/g);
                                    if (patternMatch) {
                                      timesPerDay = patternMatch.reduce((acc, curr) => acc + parseInt(curr), 0);
                                    } else if (localFormData.dosage.toLowerCase().includes("bid")) {
                                      timesPerDay = 2;
                                    } else if (localFormData.dosage.toLowerCase().includes("tid")) {
                                      timesPerDay = 3;
                                    } else if (localFormData.dosage.toLowerCase().includes("qid")) {
                                      timesPerDay = 4;
                                    }

                                    setLocalFormData({ 
                                      ...localFormData, 
                                      noOfDays: days,
                                      doseNo: days * timesPerDay
                                    });
                                  }}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>QTY</Text>
                                <Input
                                  bg="white"
                                  size="sm"
                                  type="number"
                                  borderRadius="lg"
                                  value={localFormData.doseNo}
                                  onChange={(e) => setLocalFormData({ ...localFormData, doseNo: parseInt(e.target.value) || 0 })}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>PATTERN</Text>
                                <Input
                                  bg="white"
                                  size="sm"
                                  borderRadius="lg"
                                  placeholder="*_*_*"
                                  value={localFormData.details}
                                  onChange={(e) => {
                                    const pattern = e.target.value;
                                    let timesPerDay = 1;
                                    const patternMatch = pattern.match(/\d/g);
                                    if (patternMatch) {
                                      timesPerDay = patternMatch.reduce((acc, curr) => acc + parseInt(curr), 0);
                                    }
                                    setLocalFormData({ 
                                      ...localFormData, 
                                      details: pattern,
                                      doseNo: (localFormData.noOfDays || 1) * timesPerDay
                                    });
                                  }}
                                />
                              </Box>
                            </SimpleGrid>

                            <Box w="full">
                              <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>DESCRIPTION</Text>
                              <Textarea
                                bg="white"
                                size="sm"
                                borderRadius="lg"
                                placeholder="Instructions..."
                                value={localFormData.description}
                                onChange={(e) => setLocalFormData({ ...localFormData, description: e.target.value })}
                              />
                            </Box>

                            <Button
                              w="full"
                              colorScheme="blue"
                              size="md"
                              borderRadius="xl"
                              leftIcon={<FiPlus />}
                              onClick={() => {
                                if (!localFormData.brandName) {
                                  openNotification({ type: 'warning', title: 'Brand Name Required', message: 'Please enter a brand name at least.' });
                                  return;
                                }
                                setFieldValue("prescriptions", [...values.prescriptions, { ...localFormData }]);
                                resetLocalForm();
                              }}
                            >
                              ADD ITEM
                            </Button>
                          </VStack>
                        </Box>
                      </VStack>

                      {/* Right Column: List */}
                      <VStack align="stretch" spacing={4}>
                        <Text fontSize="11px" fontWeight="1000" color="gray.500" letterSpacing="0.1em">ADDED TO REPORT ({values.prescriptions.length})</Text>

                        {values.prescriptions.length === 0 ? (
                          <Center p={10} bg="gray.50" borderRadius="3xl" border="1px dashed" borderColor="gray.200">
                            <VStack spacing={2}>
                              <Icon as={FiPackage} fontSize="30px" color="gray.300" />
                              <Text fontSize="12px" color="gray.400" fontWeight="bold">List is empty</Text>
                            </VStack>
                          </Center>
                        ) : (
                          <VStack align="stretch" spacing={3}>
                            {values.prescriptions.map((p: any, index: number) => (
                              <Box key={index} p={4} bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" position="relative">
                                <IconButton
                                  size="xs"
                                  icon={<FiTrash2 />}
                                  colorScheme="red"
                                  variant="ghost"
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  onClick={() => {
                                    const newP = values.prescriptions.filter((_: any, i: number) => i !== index);
                                    setFieldValue("prescriptions", newP);
                                  }}
                                  aria-label="Remove"
                                />
                                <VStack align="start" spacing={1}>
                                  <Badge colorScheme="blue" variant="subtle" fontSize="9px">{p.type || 'MED'}</Badge>
                                  <Text fontWeight="1000" fontSize="13px" color="blue.700">{p.brandName}</Text>
                                  <HStack spacing={4} mt={1}>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="7px" fontWeight="900" color="gray.400">DOSAGE</Text>
                                      <Text fontSize="10px" fontWeight="bold">{p.dosage || '-'}</Text>
                                    </VStack>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="7px" fontWeight="900" color="gray.400">QTY</Text>
                                      <Text fontSize="10px" fontWeight="bold">{p.doseNo || '0'}</Text>
                                    </VStack>
                                  </HStack>
                                </VStack>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </Box>

                {/* Sticky Footer */}
                <Box p={6} borderTop="1px solid" borderColor="gray.100" bg="white">
                  <HStack justify="space-between">
                    <Button variant="ghost" onClick={onClose} borderRadius="xl">CANCEL</Button>
                    <Button
                      colorScheme="blue"
                      type="submit"
                      isLoading={loading}
                      borderRadius="xl"
                      size="lg"
                      px={10}
                      leftIcon={<FiDownload />}
                      isDisabled={values.prescriptions.length === 0}
                    >
                      DOWNLOAD PDF
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>

      {/* SECONDARY PREVIEW DRAWER */}
      <CustomDrawer
        open={previewDrawer.open}
        close={() => setPreviewDrawer({ ...previewDrawer, open: false })}
        title="Clinical Report Preview"
        width="60vw"
        extraActions={
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<FiDownload />}
            borderRadius="lg"
            onClick={async () => {
              setLoading(true);
              try {
                // We use the same blob logic or trigger the download
                // Actually, downloading from blob is easy:
                const link = document.createElement('a');
                link.href = previewDrawer.url;
                link.download = `Clinical_Report_${workDoneId}.pdf`;
                link.click();
              } finally {
                setLoading(false);
              }
            }}
          >
            DOWNLOAD PDF
          </Button>
        }
      >
        <Box p={4} h="calc(100vh - 100px)">
          <iframe
            src={`${previewDrawer.url}#view=FitH`}
            width="100%"
            height="100%"
            style={{ borderRadius: '16px', border: '1px solid #E2E8F0' }}
            title="PDF Preview"
          />
        </Box>
      </CustomDrawer>
    </CustomDrawer>
  );
});

const DailyPrescriptionDrawer = observer(({ isOpen, onClose, patientId }: { isOpen: boolean, onClose: () => void, patientId: string }) => {
  const { prescriptionStore, workDoneStore, auth: { openNotification } } = stores;
  const [loading, setLoading] = useState(false);
  const [previewDrawer, setPreviewDrawer] = useState({ open: false, url: "" });
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  // Fetch records for the selected date
  const fetchRecordsForDate = async (date: string) => {
    setFetchingRecords(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = stores.auth.company?._id || stores.auth.company || companyId;
      const { data } = await axios.get(`/workDone/get`, {
        params: {
          patientId,
          company: compId,
          fromDate: date,
          toDate: date,
          limit: 100
        }
      });
      if (data.status === "success") {
        setDailyRecords(data.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching daily records:", err);
    } finally {
      setFetchingRecords(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecordsForDate(new Date().toISOString().split('T')[0]);
      prescriptionStore.getPrescriptions();
      prescriptionStore.getSuggestions();
    }
  }, [isOpen]);

  const [localFormData, setLocalFormData] = useState({
    type: '',
    category: '',
    brandName: '',
    dosage: '',
    noOfDays: 0,
    doseNo: 0,
    details: '',
    description: '',
    form: '',
    basicSalt: '',
    companyName: '',
  });

  const resetLocalForm = () => setLocalFormData({
    type: '', category: '', brandName: '', dosage: '', noOfDays: 0, doseNo: 0, details: '', description: '', form: '', basicSalt: '', companyName: '',
  });

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: '12px',
      fontSize: '13px',
      border: '1px solid #E2E8F0',
      '&:hover': { borderColor: '#3182ce' }
    }),
  };

  return (
    <CustomDrawer
      open={isOpen}
      close={onClose}
      title="Daily Prescription Report"
      width="90vw"
    >
      <Box p={0}>
        <Formik
          initialValues={{
            date: new Date().toISOString().split('T')[0],
            prescriptions: [],
            topPadding: 150,
            bottomPadding: 50,
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await workDoneStore.downloadDailyWorkDoneReport(patientId, values);
              openNotification({ 
                type: "success", 
                title: "Daily Report Downloaded",
                message: "Daily clinical report has been saved successfully."
              });
            } catch (err: any) {
              openNotification({ 
                type: "error", 
                title: "Download Failed", 
                message: err?.message || "Something went wrong" 
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <VStack align="stretch" spacing={0}>
                <Box p={6} overflowY="auto" maxH="calc(100vh - 120px)">
                  <VStack align="stretch" spacing={6}>
                    
                    {/* Header Context & Date Picker */}
                    <Box bg="purple.50" p={4} borderRadius="2xl" border="1px solid" borderColor="purple.100">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="10px" fontWeight="1000" color="purple.500">DAILY SUMMARY</Text>
                          <HStack>
                            <Text fontSize="13px" fontWeight="bold">Select Date:</Text>
                            <Input
                              type="date"
                              size="sm"
                              w="200px"
                              bg="white"
                              borderRadius="lg"
                              value={values.date}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                setFieldValue("date", newDate);
                                fetchRecordsForDate(newDate);
                              }}
                            />
                          </HStack>
                        </VStack>
                        <Button 
                          size="sm" 
                          colorScheme="purple" 
                          leftIcon={<FiEye />}
                          borderRadius="lg"
                          isLoading={loading}
                          isDisabled={dailyRecords.length === 0}
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res: any = await workDoneStore.generateDailyWorkDoneReportBlob(patientId, values);
                              if (res?.url) setPreviewDrawer({ open: true, url: res.url });
                            } catch (err: any) {
                              openNotification({ type: "error", title: "Preview Failed", message: err.message });
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          GENERATE PREVIEW
                        </Button>
                      </HStack>
                    </Box>

                    {/* Same Medication Form as the other drawer */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
                      <VStack align="stretch" spacing={6}>
                        <Box p={5} borderRadius="2xl" border="1px solid" borderColor="gray.100" bg="white" shadow="sm">
                          <Text fontSize="11px" fontWeight="1000" color="gray.500" mb={4}>SEARCH OR ADD MEDICATION</Text>
                          <VStack spacing={4}>
                            <SimpleGrid columns={2} spacing={3} w="full">
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>TYPE</Text>
                                <CreatableSelect
                                  isClearable
                                  placeholder="Type..."
                                  options={(prescriptionStore.types || []).map((t: string) => ({ label: t, value: t }))}
                                  value={localFormData.type ? { label: localFormData.type, value: localFormData.type } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, type: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>CATEGORY</Text>
                                <CreatableSelect
                                  isClearable
                                  placeholder="Cat..."
                                  options={(prescriptionStore.categories || []).map((c: string) => ({ label: c, value: c }))}
                                  value={localFormData.category ? { label: localFormData.category, value: localFormData.category } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, category: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                            </SimpleGrid>

                            <Box w="full">
                              <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>BRAND NAME</Text>
                              <CreatableSelect
                                isClearable
                                placeholder="Start typing brand name to pick from Master..."
                                options={(prescriptionStore.prescriptionsData || []).map((p: any) => ({ 
                                  label: `${p.brandName} (${p.type})`, 
                                  value: p.brandName,
                                  data: p
                                }))}
                                value={localFormData.brandName ? { label: localFormData.brandName, value: localFormData.brandName } : null}
                                onChange={(val: any) => {
                                  const brand = val?.value || '';
                                  const masterData = prescriptionStore.prescriptionsData.find((p: any) => p.brandName === brand);
                                  if (masterData) {
                                    setLocalFormData({
                                      ...localFormData,
                                      type: masterData.type || localFormData.type,
                                      category: masterData.category || localFormData.category,
                                      form: masterData.form || localFormData.form,
                                      basicSalt: masterData.basicSalt || '',
                                      brandName: brand,
                                      companyName: masterData.companyName || '',
                                      dosage: masterData.dosage || '',
                                      details: masterData.details || '',
                                      doseNo: masterData.doseNo || 0,
                                      description: masterData.description || '',
                                    });
                                  } else {
                                    setLocalFormData({ ...localFormData, brandName: brand });
                                  }
                                }}
                                styles={selectStyles}
                              />
                            </Box>

                            <SimpleGrid columns={2} spacing={3} w="full">
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>BASIC SALT</Text>
                                <CreatableSelect
                                  isClearable
                                  placeholder="Salt info"
                                  options={(prescriptionStore.basicSalts || []).map((s: string) => ({ label: s, value: s }))}
                                  value={localFormData.basicSalt ? { label: localFormData.basicSalt, value: localFormData.basicSalt } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, basicSalt: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>FORM</Text>
                                <CreatableSelect
                                  isClearable
                                  placeholder="Form..."
                                  options={(prescriptionStore.forms || []).map((f: string) => ({ label: f, value: f }))}
                                  value={localFormData.form ? { label: localFormData.form, value: localFormData.form } : null}
                                  onChange={(val: any) => setLocalFormData({ ...localFormData, form: val?.value || '' })}
                                  styles={selectStyles}
                                />
                              </Box>
                            </SimpleGrid>

                            <SimpleGrid columns={4} spacing={2} w="full">
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>DOSAGE</Text>
                                <Input bg="white" size="sm" borderRadius="lg" placeholder="1bid" value={localFormData.dosage} onChange={(e) => setLocalFormData({ ...localFormData, dosage: e.target.value })} />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>DAYS</Text>
                                <Input
                                  bg="white"
                                  size="sm"
                                  type="number"
                                  borderRadius="lg"
                                  placeholder="0"
                                  value={localFormData.noOfDays}
                                  onChange={(e) => {
                                    const days = parseInt(e.target.value) || 0;
                                    let timesPerDay = 1;
                                    const patternMatch = localFormData.details.match(/\d/g);
                                    if (patternMatch) {
                                      timesPerDay = patternMatch.reduce((acc, curr) => acc + parseInt(curr), 0);
                                    } else if (localFormData.dosage.toLowerCase().includes("bid")) {
                                      timesPerDay = 2;
                                    } else if (localFormData.dosage.toLowerCase().includes("tid")) {
                                      timesPerDay = 3;
                                    } else if (localFormData.dosage.toLowerCase().includes("qid")) {
                                      timesPerDay = 4;
                                    }

                                    setLocalFormData({ 
                                      ...localFormData, 
                                      noOfDays: days,
                                      doseNo: days * timesPerDay
                                    });
                                  }}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>QTY</Text>
                                <Input bg="white" size="sm" type="number" borderRadius="lg" value={localFormData.doseNo} onChange={(e) => setLocalFormData({ ...localFormData, doseNo: parseInt(e.target.value) || 0 })} />
                              </Box>
                              <Box>
                                <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>PATTERN</Text>
                                <Input
                                  bg="white"
                                  size="sm"
                                  borderRadius="lg"
                                  placeholder="*_*_*"
                                  value={localFormData.details}
                                  onChange={(e) => {
                                    const pattern = e.target.value;
                                    let timesPerDay = 1;
                                    const patternMatch = pattern.match(/\d/g);
                                    if (patternMatch) {
                                      timesPerDay = patternMatch.reduce((acc, curr) => acc + parseInt(curr), 0);
                                    }
                                    setLocalFormData({ 
                                      ...localFormData, 
                                      details: pattern,
                                      doseNo: (localFormData.noOfDays || 1) * timesPerDay
                                    });
                                  }}
                                />
                              </Box>
                            </SimpleGrid>

                            <Box w="full">
                              <Text fontSize="10px" fontWeight="900" color="gray.500" mb={1.5}>DESCRIPTION</Text>
                              <Textarea
                                bg="white"
                                size="sm"
                                borderRadius="lg"
                                placeholder="Instructions..."
                                value={localFormData.description}
                                onChange={(e) => setLocalFormData({ ...localFormData, description: e.target.value })}
                              />
                            </Box>

                            <Button
                              w="full"
                              colorScheme="purple"
                              size="md"
                              borderRadius="xl"
                              leftIcon={<FiPlus />}
                              onClick={() => {
                                if (!localFormData.brandName) return;
                                setFieldValue("prescriptions", [...values.prescriptions, { ...localFormData }]);
                                resetLocalForm();
                              }}
                            >
                              ADD ITEM
                            </Button>
                          </VStack>
                        </Box>
                      </VStack>

                      <VStack align="stretch" spacing={4}>
                        <Text fontSize="11px" fontWeight="1000" color="gray.500">ADDED TO DAILY REPORT ({values.prescriptions.length})</Text>
                        <VStack align="stretch" spacing={3}>
                          {values.prescriptions.map((p: any, index: number) => (
                            <Box key={index} p={4} bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" position="relative">
                              <IconButton size="xs" icon={<FiTrash2 />} colorScheme="red" variant="ghost" position="absolute" top={2} right={2} onClick={() => {
                                const newP = values.prescriptions.filter((_: any, i: number) => i !== index);
                                setFieldValue("prescriptions", newP);
                              }} aria-label="Remove" />
                              <VStack align="start" spacing={1}>
                                  <Badge colorScheme="purple" variant="subtle" fontSize="9px">{p.type || 'MED'}</Badge>
                                  <Text fontWeight="1000" fontSize="13px" color="purple.700">{p.brandName}</Text>
                                  <Text fontSize="10px" color="gray.500" fontWeight="bold">{p.basicSalt}</Text>
                                  
                                  <HStack spacing={4} mt={1}>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="7px" fontWeight="900" color="gray.400">DOSAGE</Text>
                                      <Text fontSize="10px" fontWeight="bold">{p.dosage || '-'}</Text>
                                    </VStack>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="7px" fontWeight="900" color="gray.400">QTY</Text>
                                      <Text fontSize="10px" fontWeight="bold">{p.doseNo || '0'}</Text>
                                    </VStack>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="7px" fontWeight="900" color="gray.400">PATTERN</Text>
                                      <Text fontSize="10px" fontWeight="bold">{p.details || '-'}</Text>
                                    </VStack>
                                  </HStack>

                                  {p.description && (
                                    <Box mt={1} p={1.5} bg="purple.50" borderRadius="md" w="full">
                                     <Text fontSize="9px" color="purple.600" fontStyle="italic">{p.description}</Text>
                                    </Box>
                                 )}
                                </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </Box>

                <Box p={6} borderTop="1px solid" borderColor="gray.100" bg="white">
                  <HStack justify="space-between">
                    <Button variant="ghost" onClick={onClose} borderRadius="xl">CANCEL</Button>
                    <Button
                      colorScheme="purple"
                      type="submit"
                      isLoading={loading}
                      borderRadius="xl"
                      size="lg"
                      px={10}
                      leftIcon={<FiDownload />}
                      isDisabled={values.prescriptions.length === 0}
                    >
                      DOWNLOAD DAILY PDF
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>

      {/* Preview Sub-Drawer */}
      <CustomDrawer
        open={previewDrawer.open}
        close={() => setPreviewDrawer({ ...previewDrawer, open: false })}
        title="Daily Report Preview"
        width="60vw"
        extraActions={
          <Button
            size="sm"
            colorScheme="purple"
            leftIcon={<FiDownload />}
            borderRadius="lg"
            onClick={() => {
              const link = document.createElement('a');
              link.href = previewDrawer.url;
              link.download = `Daily_Report_${patientId}.pdf`;
              link.click();
            }}
          >
            DOWNLOAD PDF
          </Button>
        }
      >
        <Box p={4} h="calc(100vh - 100px)">
          <iframe src={`${previewDrawer.url}#view=FitH`} width="100%" height="100%" style={{ borderRadius: '16px', border: '1px solid #E2E8F0' }} title="PDF Preview" />
        </Box>
      </CustomDrawer>
    </CustomDrawer>
  );
});

export default WorkDoneList;

"use client";
import React, { useEffect, useState, useCallback } from "react";
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
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FiTrash2, FiActivity, FiUser, FiChevronDown, FiClock, FiFileText, FiEye, FiEdit } from "react-icons/fi";
import stores from "../../../store/stores";
import { formatDate } from "../../../component/config/utils/dateUtils";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import TreatmentDetailsView from "../../toothTreatment/element/TreatmentDetailsView";
import WorkDoneForm from "./WorkDoneForm";

interface WorkDoneListProps {
  patientDetails: any;
  treatmentId?: string; // Add this prop
  onEdit?: (record: any) => void; // Add this prop
}

const WorkDoneList = observer(({ patientDetails, treatmentId, onEdit }: WorkDoneListProps) => {
  const {
    workDoneStore: { workDone, getWorkDone, deleteWorkDone, updateWorkDone },
    toothTreatmentStore: { updateToothTreatment },
    auth: { openNotification, userType },
  } = stores;

  const [currentPage, setCurrentPage] = useState(1);
  const [openView, setOpenView] = useState({ open: false, data: null as any });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: "" });
  const [isDeleting, setIsDeleting] = useState(false);

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
    switch (status) {
      case "COMPLETE": return "green";
      case "PENDING": return "orange";
      case "INCOMPLETE": return "red";
      default: return "gray";
    }
  };

  return (
    <Box>
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
                p={5} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="gray.100"
                shadow="sm"
                transition="all 0.2s"
                _hover={{ shadow: "md", borderColor: "blue.100" }}
              >
                {/* Header: Date & Doctor */}
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={3}>
                    <HStack spacing={1.5} bg="blue.50" px={3} py={1} borderRadius="full">
                      <Icon as={FiClock} fontSize="12px" color="blue.500" />
                      <Text fontSize="11px" fontWeight="1000" color="blue.600">
                        {formatDate(record.createdAt)}
                      </Text>
                    </HStack>
                    <HStack spacing={1.5}>
                      <Icon as={FiUser} fontSize="12px" color="gray.400" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="11px" fontWeight="900" color="gray.700">
                          Treating: Dr. {record.doctor?.name || "N/A"}
                        </Text>
                        {record.examiningDoctor && (
                          <Text fontSize="9px" fontWeight="800" color="gray.500">
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
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<FiEye />}
                        onClick={() => setOpenView({ open: true, data: record.treatment })}
                        borderRadius="full"
                        fontSize="9px"
                        fontWeight="1000"
                        _hover={{ bg: "blue.50" }}
                        px={3}
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
                        px={3} py={1} 
                        borderRadius="lg"
                        fontSize="10px"
                        fontWeight="1000"
                        variant="subtle"
                        _hover={{ opacity: 0.8 }}
                      >
                        <HStack spacing={1}>
                          <Text>{record.status || "COMPLETE"}</Text>
                          <Icon as={FiChevronDown} />
                        </HStack>
                      </MenuButton>
                      <MenuList p={1} borderRadius="xl" shadow="xl" border="none">
                        {["COMPLETE", "PENDING", "INCOMPLETE"].map((s) => (
                          <MenuItem 
                            key={s}
                            onClick={() => handleStatusChange(record, s)}
                            fontSize="11px"
                            fontWeight="1000"
                            borderRadius="lg"
                            color={getStatusColor(s) + ".600"}
                          >
                            Mark as {s}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>

                    {/* Edit Action */}
                    <IconButton
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      icon={<FiEdit />}
                      aria-label="Edit"
                      onClick={() => setOpenEditWorkDone({ open: true, data: record })}
                      borderRadius="full"
                    />

                    {/* Delete Action */}
                    {["admin", "superAdmin"].includes(userType) && (
                      <IconButton
                        size="xs"
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

                <Divider mb={4} />

                {/* Content: Procedure & Note */}
                <VStack align="start" spacing={3}>
                  <HStack spacing={4} w="full" align="start">
                    <Box flex={1}>
                      <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em" mb={1}>PROCEDURE</Text>
                      <Text fontSize="13px" fontWeight="1000" color="gray.800">
                        {record.treatmentCode || "General Procedure"}
                      </Text>
                    </Box>
                    {(record.tooth || record.treatment?.tooth) && (
                      <VStack align="end" spacing={0}>
                        <Text fontSize="10px" fontWeight="1000" color="blue.400" letterSpacing="0.1em">TOOTH</Text>
                        <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} fontSize="14px" fontWeight="900">
                          {record.tooth || record.treatment?.tooth}
                        </Badge>
                        <Text fontSize="9px" fontWeight="800" color="gray.400" mt={1}>
                          {record.position || record.treatment?.position} {record.side || record.treatment?.side}
                        </Text>
                      </VStack>
                    )}
                  </HStack>

                  {record.workDoneNote && (
                    <Box bg="gray.50" p={3} borderRadius="xl" w="full" borderLeft="4px solid" borderColor="gray.200">
                      <HStack spacing={2} mb={1.5}>
                        <Icon as={FiFileText} fontSize="13px" color="blue.400" />
                        <Text fontSize="11px" fontWeight="1000" color="blue.500" letterSpacing="0.05em">CLINICAL OBSERVATION</Text>
                      </HStack>
                      <Text fontSize="15px" fontWeight="500" color="gray.800" lineHeight="1.6">
                        {record.workDoneNote}
                      </Text>
                      {record.toothNote && (
                        <Text fontSize="11px" fontWeight="900" color="orange.600" mt={2} fontStyle="italic">
                          Note: {record.toothNote}
                        </Text>
                      )}
                    </Box>
                  )}
                </VStack>

                {/* Footer: Billing Summary */}
                <SimpleGrid columns={3} gap={4} mt={5} pt={4} borderTop="1px dashed" borderColor="gray.100">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9px" fontWeight="1000" color="gray.400">AMOUNT</Text>
                    <Text fontSize="14px" fontWeight="1000" color="blue.600">₹{record.amount?.toLocaleString()}</Text>
                  </VStack>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9px" fontWeight="1000" color="gray.400">DISCOUNT</Text>
                    <Text fontSize="14px" fontWeight="1000" color="red.500">₹{record.discount?.toLocaleString()}</Text>
                  </VStack>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9px" fontWeight="1000" color="gray.400">NET TOTAL</Text>
                    <Text fontSize="14px" fontWeight="1000" color="green.600">₹{(record.amount - record.discount)?.toLocaleString()}</Text>
                  </VStack>
                </SimpleGrid>
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
    </Box>
  );
});

export default WorkDoneList;

import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Spinner,
  Button,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { 
  FiPieChart, 
  FiDownloadCloud, 
  FiTrendingUp,
  FiFileText,
} from "react-icons/fi";
import stores from "../../../../store/stores";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { FiFilter, FiX, FiEye } from "react-icons/fi";
import { Divider, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import ReceiptPreviewDrawer from "../../../patients/component/patient/ReceiptPreviewDrawer";

const DoctorAccountHistory = observer(({ doctorDetails }: any) => {
  const { workDoneStore } = stores;
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingRecordId, setDownloadingRecordId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");
  
  // Table Filters (if any, currently just page)
  const [tableSearch, setTableSearch] = useState("");

  // Modal-only Filters (Independent)
  const [modalSelectedPatient, setModalSelectedPatient] = useState<any>(null);
  const [modalFilters, setModalFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "all"
  });
  
  const toast = useToast();

  const fetchData = useCallback(async () => {
    // Table always shows all doctor's work done, regardless of modal filter state
    await workDoneStore.getWorkDone({ 
      doctorId: doctorDetails._id, 
      page: currentPage,
      limit: 10 
    });
    
    await workDoneStore.getDoctorFinancialStats(doctorDetails._id);
  }, [workDoneStore, doctorDetails._id, currentPage]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const filtersData = {
        doctorId: doctorDetails._id,
        patientId: modalSelectedPatient?.id || modalSelectedPatient?.value || modalSelectedPatient?._id,
        fromDate: modalFilters.fromDate,
        toDate: modalFilters.toDate,
        status: modalFilters.status === "all" ? undefined : modalFilters.status,
      };
      
      const base64 = await workDoneStore.fetchDoctorReportBase64(filtersData);
      setPreviewData(base64);
      setPreviewFileName(`Doctor_Report_${doctorDetails.name}.pdf`);
      setIsPreviewOpen(true);
      setIsModalOpen(false);
    } catch (err: any) {
      toast({ title: "Preview Error", description: err.message, status: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleModalFilterChange = (name: string, value: any) => {
    setModalFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetModalFilters = () => {
    setModalSelectedPatient(null);
    setModalFilters({ fromDate: "", toDate: "", status: "all" });
  };

  const handleSingleDownload = async (id: string) => {
    setDownloadingRecordId(id);
    try {
      const base64 = await workDoneStore.fetchSingleRecordReportBase64(id);
      setPreviewData(base64);
      setPreviewFileName(`Receipt_${id}.pdf`);
      setIsPreviewOpen(true);
    } catch (err: any) {
      toast({ title: "Preview Error", description: err.message, status: "error" });
    } finally {
      setDownloadingRecordId(null);
    }
  };

  const displayData = workDoneStore.workDone.data;
  const { totalBill, collected, pending, loading } = workDoneStore.doctorStats;

  const columns = [
    { headerName: "S.No.", key: "sno", props: { row: { textAlign: "center", color: "gray.400", fontWeight: "bold" } } },
    { 
      headerName: "Patient", 
      key: "patient", 
      function: (dt: any) => dt.patient?.name || "Unknown"
    },
    { 
      headerName: "Treatment Details", 
      key: "treatment", 
      function: (dt: any) => dt.treatment?.treatmentPlan || dt.workDoneNote || "N/A"
    },
    { 
        headerName: "Total Bill (₹)", 
        key: "bill", 
        function: (dt: any) => (dt.amount - (dt.discount || 0)).toLocaleString() 
    },
    { 
      headerName: "Received", 
      key: "received", 
      function: (dt: any) => (dt.receivedAmount || 0).toLocaleString()
    },
    { 
      headerName: "Status", 
      key: "status_badge",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const bill = dt.amount - (dt.discount || 0);
          const isSettled = (dt.receivedAmount || 0) >= bill;
          return (
            <Badge px={3} py={1} borderRadius="xl" fontSize="10px" colorScheme={isSettled ? "green" : "orange"}>
              {isSettled ? "SETTLED" : "PENDING"}
            </Badge>
          );
        }
      }
    },
    {
      headerName: "Action",
      key: "actions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <IconButton
            aria-label="View Receipt"
            icon={<FiEye />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            isLoading={downloadingRecordId === dt._id}
            onClick={() => handleSingleDownload(dt._id)}
          />
        ),
      },
      props: { row: { textAlign: "center" } },
    }
  ];

  return (
    <Box p={4} bg="gray.50" minH="80vh">
      <Box bg="white" borderRadius="3xl" shadow="xl" p={6}>
        <SimpleGrid columns={3} gap={6} mb={10}>
            <VStack align="start" p={5} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
                <HStack w="full" justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="900" color="blue.500" letterSpacing="0.05em">TOTAL BILLED</Text>
                    <Icon as={FiPieChart} color="blue.300" />
                </HStack>
                {loading ? <Spinner size="sm" /> : (
                  <Text fontSize="24px" fontWeight="1000" color="blue.700">₹{(totalBill || 0).toLocaleString()}</Text>
                )}
                <Text fontSize="9px" color="blue.400" fontWeight="bold">GROSS EARNINGS</Text>
            </VStack>

            <VStack align="start" p={5} bg="green.50" borderRadius="2xl" border="1px solid" borderColor="green.100">
                <HStack w="full" justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="900" color="green.500" letterSpacing="0.05em">TOTAL COLLECTED</Text>
                    <Icon as={FiDownloadCloud} color="green.300" />
                </HStack>
                {loading ? <Spinner size="sm" /> : (
                  <Text fontSize="24px" fontWeight="1000" color="green.700">₹{(collected || 0).toLocaleString()}</Text>
                )}
                <Text fontSize="9px" color="green.400" fontWeight="bold">CASH IN HAND</Text>
            </VStack>

            <VStack align="start" p={5} bg="orange.50" borderRadius="2xl" border="1px solid" borderColor="orange.100">
                <HStack w="full" justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="900" color="orange.500" letterSpacing="0.05em">PENDING</Text>
                    <Icon as={FiTrendingUp} color="orange.300" />
                </HStack>
                {loading ? <Spinner size="sm" /> : (
                  <Text fontSize="24px" fontWeight="1000" color="orange.700">₹{(pending || 0).toLocaleString()}</Text>
                )}
                <Text fontSize="9px" color="orange.400" fontWeight="bold">REMAINING TO COLLECT</Text>
            </VStack>
        </SimpleGrid>

        <Box px={2} mb={6}>
            <HStack justify="space-between" align="end">
                <VStack align="start" spacing={0}>
                    <Text fontSize="xl" fontWeight="900" color="gray.800">Doctor's Financial Ledger</Text>
                    <Text fontSize="xs" color="gray.400">Showing all treatments performed by Dr. {doctorDetails?.name}</Text>
                </VStack>
                <Button 
                    leftIcon={<FiEye />} 
                    colorScheme="purple" 
                    variant="solid" 
                    size="sm" 
                    borderRadius="full" 
                    px={6}
                    onClick={() => setIsModalOpen(true)}
                >
                    View Report (PDF)
                </Button>
            </HStack>
        </Box>

        <Divider mb={8} />

        <CustomTable 
          data={displayData.map((wd: any, i: number) => ({ 
            ...wd, 
            sno: (currentPage - 1) * 10 + (i + 1) 
          }))}
          columns={columns}
          loading={workDoneStore.workDone.loading}
          actions={{
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: workDoneStore.workDone.totalPages || 1,
            }
          }}
        />
      </Box>

      {/* Download Configuration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
        <ModalContent borderRadius="3xl" overflow="hidden" shadow="2xl">
          <ModalHeader 
            bg="purple.600" 
            color="white" 
            py={6}
            display="flex"
            alignItems="center"
            gap={3}
          >
            <FiFileText size={24} />
            <Text>Report Download Options</Text>
          </ModalHeader>
          <ModalCloseButton color="white" top={6} />
          
          <ModalBody p={8}>
            <VStack spacing={8} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={3} color="gray.700" fontSize="sm">FILTER BY PATIENT</Text>
                <CustomInput
                  name="patientFilter"
                  type="real-time-user-search"
                  label=""
                  placeholder="All Patients (Search to filter...)"
                  value={modalSelectedPatient}
                  onChange={(val: any) => setModalSelectedPatient(val)}
                  query={{ type: "patient" }}
                  isClear={true}
                />
              </Box>

              <SimpleGrid columns={2} spacing={6}>
                <Box>
                  <Text fontWeight="bold" mb={3} color="gray.700" fontSize="sm">FROM DATE</Text>
                  <CustomInput
                    name="fromDate"
                    type="date"
                    label=""
                    value={modalFilters.fromDate}
                    onChange={(e: any) => handleModalFilterChange("fromDate", e.target.value)}
                  />
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={3} color="gray.700" fontSize="sm">TO DATE</Text>
                  <CustomInput
                    name="toDate"
                    type="date"
                    label=""
                    value={modalFilters.toDate}
                    onChange={(e: any) => handleModalFilterChange("toDate", e.target.value)}
                  />
                </Box>
              </SimpleGrid>

              <Box>
                <Text fontWeight="bold" mb={3} color="gray.700" fontSize="sm">PAYMENT STATUS</Text>
                <CustomInput
                  name="statusFilter"
                  type="select"
                  label=""
                  placeholder="Select status"
                  options={[
                    { label: "All Treatments", value: "all" },
                    { label: "Settled Only", value: "SETTLED" },
                    { label: "Pending Only", value: "PENDING" },
                  ]}
                  value={modalFilters.status}
                  onChange={(val: any) => handleModalFilterChange("status", val?.value || "all")}
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" p={6} borderTop="1px solid" borderColor="gray.100">
            <HStack spacing={4} w="full">
              <Button 
                variant="ghost" 
                flex={1} 
                borderRadius="full" 
                onClick={resetModalFilters}
                leftIcon={<FiX />}
              >
                Reset Filters
              </Button>
              <Button 
                colorScheme="purple" 
                flex={2} 
                borderRadius="full" 
                size="lg"
                leftIcon={<FiEye />}
                isLoading={isDownloading}
                onClick={handleDownloadReport}
                boxShadow="0 10px 20px rgba(107, 70, 193, 0.2)"
              >
                View PDF Report
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ReceiptPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfBase64={previewData}
        fileName={previewFileName}
      />
    </Box>
  );
});

export default DoctorAccountHistory;

"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Badge,
  HStack,
  Text,
  VStack,
  Button,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  IconButton,
  Spinner,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Icon,
  Tooltip,
  Divider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Select,
  Circle,
  Grid,
  Heading,
  useColorModeValue,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiPieChart,
  FiUser,
  FiPlusCircle,
  FiClock,
  FiSearch,
  FiArrowRightCircle,
  FiDownloadCloud,
  FiTrendingUp,
  FiCheck,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiTarget,
  FiChevronRight,
  FiFileText,
  FiEye,
  FiEdit2,
  FiCreditCard,
  FiTrash2
} from "react-icons/fi";
import ReceiptPreviewDrawer from "./ReceiptPreviewDrawer";
import WalletHistoryDrawer from "../../../../component/WalletHistoryDrawer";
import stores from "../../../../store/stores";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import moment from "moment";
import CreatableSelect from "react-select/creatable";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

const PatientAccountHistory = observer(({ patientDetails }: any) => {
  const { accountabilityStore, workDoneStore, auth } = stores;
  const toast = useToast();
  const bgOuter = useColorModeValue("gray.50", "transparent");
  const bgInner = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("gray.100", "darkBrand.200");
  const bgCardBox = useColorModeValue("white", "darkBrand.200");
  const inputBg = useColorModeValue("white", "darkBrand.200");

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [receiveType, setReceiveType] = useState<string>("Cash");
  const [isSaving, setIsSaving] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState(false);
  const [selectedWalletPatient, setSelectedWalletPatient] = useState<any>(null);

  // Edit Amount State
  const [isEditAmountOpen, setIsEditAmountOpen] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  // Edit Total Bill State
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [editingBillRecord, setEditingBillRecord] = useState<any>(null);
  const [editBillAmount, setEditBillAmount] = useState<string>("");
  const [isSavingBill, setIsSavingBill] = useState(false);

  // Delete Payment Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [appliedStartDate, setAppliedStartDate] = useState<string>("");
  const [appliedEndDate, setAppliedEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [backendCounts, setBackendCounts] = useState<any[]>([]);
  const [isCounting, setIsCounting] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [countSearch, setCountSearch] = useState("");

  const filteredCounts = useMemo(() => {
    if (!countSearch) return backendCounts;
    return backendCounts.filter(item => {
      const dateStr = new Date(item.date).toLocaleDateString('en-IN', { dateStyle: 'long' }).toLowerCase();
      return dateStr.includes(countSearch.toLowerCase()) || item.date.includes(countSearch);
    });
  }, [backendCounts, countSearch]);

  const totalSummaryStats = useMemo(() => {
    const totalVisits = backendCounts.length;
    const totalTreatments = backendCounts.reduce((acc, curr) => acc + (curr.count || 0), 0);
    return {
      totalVisits,
      totalTreatments
    };
  }, [backendCounts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Download Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadFilters, setDownloadFilters] = useState({
    doctorId: "all",
    status: "all",
    toothNumber: "",
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });
  const [downloadToothNumbers, setDownloadToothNumbers] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingRecordId, setDownloadingRecordId] = useState<string | null>(null);
  const [downloadingPaymentId, setDownloadingPaymentId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  const [walletBalance, setWalletBalance] = useState<number>(patientDetails?.walletBalance || 0);

  const fetchWalletBalance = useCallback(async () => {
    if(patientDetails?._id){
    try {
      const res = await workDoneStore.getPatientWalletHistory(patientDetails._id);
      setWalletBalance(res.walletBalance || 0);
    } catch (err) {
      console.error(err);
    }
  }
  }, [workDoneStore, patientDetails._id]);

  const fetchOverallStats = useCallback(async () => {
    await workDoneStore.getOverallPatientStats(patientDetails._id);
  }, [workDoneStore, patientDetails._id]);

  const fetchData = useCallback(async () => {
    await workDoneStore.getWorkDone({
      patientId: patientDetails._id,
      page: currentPage,
      limit: 10,
      search: debouncedSearchQuery,
      fromDate: appliedStartDate || undefined,
      toDate: appliedEndDate || undefined,
      doctorId: doctorFilter !== "all" ? doctorFilter : undefined
    });

    // Fetch filtered stats (dynamic)
    await workDoneStore.getPatientFinancialStats(patientDetails._id, doctorFilter);

    await accountabilityStore.getAccountabilityList({
      patient: patientDetails._id,
      companyId: auth.company,
      limit: 100,
      startDate: appliedStartDate || undefined,
      endDate: appliedEndDate || undefined
    });
  }, [workDoneStore, accountabilityStore, patientDetails._id, auth.company, doctorFilter, appliedStartDate, appliedEndDate, currentPage, debouncedSearchQuery]);

  const [allCompanyDoctors, setAllCompanyDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetchOverallStats();
    fetchWalletBalance();
    // Fetch all doctors in the company so the user can filter by any doctor
    stores.auth.getCompanyUsers({ type: "doctor" }).then((res: any) => {
      setAllCompanyDoctors(res || []);
    }).catch((err: any) => console.error(err));
  }, [fetchOverallStats, fetchWalletBalance]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Data: Doctors list for filtering (from backend response)
  const doctorsList = useMemo(() => {
    return allCompanyDoctors.map((doc: any) => ({
      id: doc.user?._id,
      name: doc.user?.name
    }));
  }, [allCompanyDoctors]);

  // Filtered Data for Table (already paginated by backend based on doctor filter)
  const filteredWork = workDoneStore.workDone.data;

  const [isDownloadingReceipts, setIsDownloadingReceipts] = useState(false);

  const handleDownloadReceiptsLog = async () => {
    setIsDownloadingReceipts(true);
    try {
      const filtersToPass = { ...downloadFilters };
      const base64 = await workDoneStore.fetchReceiptsLogBase64(patientDetails._id, filtersToPass);
      setPreviewData(base64);
      setPreviewFileName(`Receipts_Log_${patientDetails._id}.pdf`);
      setIsPreviewOpen(true);
      setIsDownloadModalOpen(false);
    } catch (err) {
      toast({ title: "Preview Error", description: "Failed to load receipts log preview.", status: "error" });
    } finally {
      setIsDownloadingReceipts(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filtersToPass = { ...downloadFilters, toothNumber: downloadToothNumbers.map(t => t.value).join(",") };
      const base64 = await workDoneStore.fetchPatientStatementBase64(patientDetails._id, filtersToPass);
      setPreviewData(base64);
      setPreviewFileName(`Statement_${patientDetails._id}.pdf`);
      setIsPreviewOpen(true);
      setIsDownloadModalOpen(false);
    } catch (err) {
      toast({ title: "Preview Error", description: "Failed to load statement preview.", status: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSingleDownload = async (recordId: string) => {
    setDownloadingRecordId(recordId);
    try {
      const base64 = await workDoneStore.fetchSingleRecordReportBase64(recordId);
      setPreviewData(base64);
      setPreviewFileName(`Receipt_${recordId}.pdf`);
      setIsPreviewOpen(true);
    } catch (err) {
      toast({ title: "Preview Error", description: "Failed to load receipt preview.", status: "error" });
    } finally {
      setDownloadingRecordId(null);
    }
  };

  const handlePaymentDownload = async (recordId: string, paymentId: string) => {
    setDownloadingPaymentId(`${recordId}-${paymentId}`);
    try {
      const base64 = await workDoneStore.fetchPaymentReceiptBase64(recordId, paymentId);
      setPreviewData(base64);
      setPreviewFileName(`Payment_Receipt_${recordId}_${paymentId}.pdf`);
      setIsPreviewOpen(true);
    } catch (err) {
      toast({ title: "Preview Error", description: "Failed to load payment receipt preview.", status: "error" });
    } finally {
      setDownloadingPaymentId(null);
    }
  };

  const openPaymentModal = (record: any) => {
    setSelectedRecord(record);
    setTempValue("");
    setReceiveType("Cash");
    setIsPaymentOpen(true);
  };

  const openHistoryDrawer = async (record: any) => {
    setSelectedRecord(record);
    setIsHistoryOpen(true);
    setIsLoadingHistory(true);
    try {
      setHistoryData([...(record?.paymentHistory || [])].reverse());
    } catch (err) {
      toast({ title: "History error", status: "error" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSavePayment = async () => {
    const paymentNow = Number(tempValue);
    if (isNaN(paymentNow) || paymentNow <= 0) return;
    const bill = selectedRecord.amount - (selectedRecord.discount || 0);
    const alreadyPaid = selectedRecord.receivedAmount || 0;
    const remaining = Math.max(0, bill - alreadyPaid);

    if (receiveType === "Wallet" && paymentNow > remaining) {
      return toast({
        title: "Wallet Payment Error",
        description: `You cannot pay more than the balance due (₹${remaining}) from your wallet.`,
        status: "warning"
      });
    }

    if (receiveType === "Wallet" && paymentNow > walletBalance) {
      return toast({
        title: "Insufficient Wallet Balance",
        description: `You only have ₹${walletBalance} available in your wallet.`,
        status: "warning"
      });
    }

    setIsSaving(true);
    try {
      // if (paymentNow > remaining) {
      //   setIsSaving(false);
      //   return toast({
      //     title: "Overpayment Error",
      //     description: `Remaining: ₹${remaining.toLocaleString()}`,
      //     status: "warning"
      //   });
      // }

      await workDoneStore.addPayment({
        workDone: selectedRecord._id,
        patient: selectedRecord.patient?._id || selectedRecord.patient,
        amount: paymentNow,
        paymentMethod: receiveType,
        date: new Date()
      });

      toast({ title: "Payment Recorded", status: "success" });
      setIsPaymentOpen(false);
      fetchData();
      fetchOverallStats();
      fetchWalletBalance();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTotalBill = async () => {
    const newBillAmount = Number(editBillAmount);
    if (isNaN(newBillAmount) || newBillAmount < 0) return;
    setIsSavingBill(true);
    try {
      // Assuming no discount, set amount to the new bill amount.
      // If there's discount, we maintain discount and adjust amount to be newBillAmount + discount
      const discount = editingBillRecord.discount || 0;
      const newAmount = newBillAmount + discount;

      // Use the dedicated new API
      await workDoneStore.updateTotalBillAmount(editingBillRecord._id, newAmount);

      toast({ title: "Total Bill Updated", status: "success" });
      setIsEditBillModalOpen(false);
      fetchData();
      fetchOverallStats();
    } catch (err: any) {
      toast({ title: "Error Updating Bill", description: err.message, status: "error" });
    } finally {
      setIsSavingBill(false);
    }
  };

  const columns = [
    { headerName: "S.No.", key: "sno", props: { row: { textAlign: "center", color: "gray.400", fontWeight: "bold" } } },
    {
      headerName: "Date",
      key: "createdAt",
      function: (dt: any) => dt.createdAt ? moment(dt.createdAt).format("DD MMM YYYY") : "N/A",
      props: { row: { fontWeight: "bold", color: "gray.600" } }
    },
    {
      headerName: "Treatment Details",
      key: "treatment",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={3}>
            <Box p={1.5} bg="blue.50" borderRadius="lg"><Icon as={FiActivity} color="blue.500" /></Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="900" color="gray.800">{dt.workDoneNote || dt.toothNote || dt.treatmentPlan || dt.treatmentCode || "General"}</Text>
              <HStack spacing={2} mt={1}>
                <Badge colorScheme="blue" variant="subtle" fontSize="11px" px={2} py={0.5} borderRadius="md">T: {dt.tooth || "N/A"}</Badge>
                <Text fontSize="xs" color="gray.500" fontWeight="700"><Icon as={FiUser} mr={1} boxSize="12px" />{dt.doctor?.name}</Text>
              </HStack>
            </VStack>
          </HStack>
        )
      }
    },
    {
      headerName: "Total Bill (₹)",
      key: "bill",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const val = dt.amount - (dt.discount || 0);
          return (
            <HStack justify="center" spacing={2}>
              <Box px={3} py={1.5} bg="yellow.100" borderRadius="xl" display="inline-flex" flexDirection="column" alignItems="center" border="1px solid" borderColor="yellow.300" minW="80px" textAlign="center">
                <Text fontWeight="1000" color="yellow.900" fontSize="md">
                  ₹{val.toLocaleString('en-IN')}
                </Text>
                {dt.discount > 0 && (
                  <Text fontSize="2xs" color="gray.500" textDecoration="line-through">
                    ₹{(dt.amount || 0).toLocaleString('en-IN')}
                  </Text>
                )}
              </Box>
              {stores.auth.hasPermission('accountability', 'edit') && (
                <Tooltip label="Edit Bill Amount" hasArrow>
                  <IconButton
                    aria-label="Edit Bill"
                    icon={<FiEdit2 />}
                    size="xs"
                    colorScheme="yellow"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBillRecord(dt);
                      setEditBillAmount(val.toString());
                      setIsEditBillModalOpen(true);
                    }}
                  />
                </Tooltip>
              )}
            </HStack>
          );
        }
      }
    },
    {
      headerName: "Amount Received",
      key: "received",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const modes = Array.from(new Set((dt.paymentHistory || []).map((h: any) => h.paymentMethod).filter(Boolean)));
          return (
            <HStack justify="flex-start" spacing={2}>
              <HStack spacing={2} p={2} bg="green.50" borderRadius="2xl" border="1px dashed" borderColor="green.200" minW="140px">
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="xs" fontWeight="bold" color="green.600" opacity={0.7}>TOTAL PAID</Text>
                  <Text fontSize="md" fontWeight="1000" color="green.700">₹{(dt.receivedAmount || 0).toLocaleString('en-IN')}</Text>
                  {modes.length > 0 && (() => {
                    const firstMode = String(modes[0]).toUpperCase();
                    return (
                      <Tooltip label={modes.map(m => String(m).toUpperCase()).join(", ")} hasArrow bg="blue.600" color="white" placement="top" borderRadius="md">
                        <Box cursor="help" display="inline-block" mt={1}>
                          <Badge variant="subtle" colorScheme="blue" fontSize="8px" borderRadius="md" px={1.5}>
                            {modes.length === 1 ? firstMode : `${firstMode} +${modes.length - 1}`}
                          </Badge>
                        </Box>
                      </Tooltip>
                    );
                  })()}
                </VStack>
                {stores.auth.hasPermission('accountability', 'create') && (
                  <Tooltip label="Add Payment" hasArrow>
                    <IconButton
                      aria-label="Add" icon={<FiPlusCircle />} size="sm" colorScheme="green" variant="solid" borderRadius="lg"
                      onClick={() => openPaymentModal(dt)}
                    />
                  </Tooltip>
                )}
              </HStack>
              {stores.auth.hasPermission('accountability', 'view') && (
                <Tooltip label="View History" hasArrow>
                  <IconButton
                    aria-label="History" icon={<FiEye />} size="sm" colorScheme="green" variant="ghost"
                    borderRadius="full" onClick={(e) => {
                      e.stopPropagation();
                      openHistoryDrawer(dt);
                    }}
                  />
                </Tooltip>
              )}
            </HStack>
          );
        }
      }
    },
    {
      headerName: "Balance",
      key: "remaining",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const bill = dt.amount - (dt.discount || 0);
          const remaining = bill - (dt.receivedAmount || 0);
          return (
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="1000" color={remaining < 0 ? "purple.500" : remaining > 0 ? "orange.500" : "green.500"} letterSpacing="-1px">
                ₹{Math.abs(remaining).toLocaleString('en-IN')}
              </Text>
              <Text fontSize="8px" fontWeight="bold" color="gray.400">{remaining < 0 ? "OVERPAID" : remaining > 0 ? "OUTSTANDING" : "SETTLED"}</Text>
            </VStack>
          );
        }
      }
    },
    {
      headerName: "Actions",
      key: "actions_col",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={2}>
            {dt.receivedAmount > 0 && stores.auth.hasPermission('accountability', 'download') && (
              <Tooltip label="View Receipt" hasArrow>
                <IconButton
                  aria-label="View Receipt"
                  icon={downloadingRecordId === dt._id ? <Spinner size="xs" /> : <FiEye />}
                  colorScheme="blue"
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSingleDownload(dt._id);
                  }}
                  isDisabled={downloadingRecordId !== null}
                />
              </Tooltip>
            )}
          </HStack>
        )
      }
    },
    {
      headerName: "Status",
      key: "status_badge",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const bill = dt.amount - (dt.discount || 0);
          const received = dt.receivedAmount || 0;
          const isOverpaid = received > bill;
          const isSettled = received === bill;
          return (
            <Badge px={3} py={1} borderRadius="xl" fontSize="9px" fontWeight="800" bg={isOverpaid ? "purple.500" : isSettled ? "green.500" : "orange.400"} color="white" shadow="sm">
              {isOverpaid ? "OVERPAID" : isSettled ? "SETTLED" : "PENDING"}
            </Badge>
          );
        }
      }
    }
  ];

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Using Server-Side calculated stats from the store
  const { totalBill, patientPending } = workDoneStore.patientStats;
  const serverReceived = totalBill - patientPending;

  return (
    <Box p={{ base: 2, md: 4 }} bg={bgOuter} minH="100vh" pb="calc(80px + env(safe-area-inset-bottom, 16px))">
      <Box bg={bgInner} borderRadius="3xl" shadow="2xl" border="1px solid" borderColor={borderColor} overflow="hidden" p={{ base: 3, md: 6 }}>
        {/* ============================================================== */}
        {/* MOBILE VIEW (< 768px): Sleek 3-Metric Executive Bento Grid       */}
        {/* ============================================================== */}
        {isMobile ? (
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={2} px={1}>
              <Text fontSize="10px" fontWeight="900" color="gray.500" letterSpacing="0.1em">
                {doctorFilter === 'all' ? 'ACCOUNT SUMMARY' : 'FILTERED BY DOCTOR'}
              </Text>
              <Badge colorScheme={doctorFilter === 'all' ? 'teal' : 'blue'} variant="subtle" fontSize="9px" px={2} borderRadius="full">
                {doctorFilter === 'all' ? 'OVERALL' : 'DOCTOR VIEW'}
              </Badge>
            </Flex>

            <SimpleGrid columns={3} gap={2} mb={2}>
              {/* 1. Billed */}
              <Box
                p={2.5}
                bg={useColorModeValue('purple.50', 'purple.900')}
                borderRadius="16px"
                border="1px solid"
                borderColor={useColorModeValue('purple.100', 'purple.800')}
                textAlign="center"
              >
                <Text fontSize="9px" fontWeight="800" color={useColorModeValue('purple.600', 'purple.300')} textTransform="uppercase">
                  Total Bill
                </Text>
                {workDoneStore.overallStats.loading ? (
                  <Spinner size="xs" mt={1} />
                ) : (
                  <Text fontSize="14px" fontWeight="900" color={useColorModeValue('purple.800', 'purple.100')} mt={0.5}>
                    ₹{(workDoneStore.overallStats.totalBill || 0).toLocaleString('en-IN')}
                  </Text>
                )}
                <Text fontSize="8px" fontWeight="700" color="purple.400" noOfLines={1}>Revenue</Text>
              </Box>

              {/* 2. Collected */}
              <Box
                p={2.5}
                bg={useColorModeValue('teal.50', 'teal.900')}
                borderRadius="16px"
                border="1px solid"
                borderColor={useColorModeValue('teal.100', 'teal.800')}
                textAlign="center"
              >
                <Text fontSize="9px" fontWeight="800" color={useColorModeValue('teal.600', 'teal.300')} textTransform="uppercase">
                  Collected
                </Text>
                {workDoneStore.overallStats.loading ? (
                  <Spinner size="xs" mt={1} />
                ) : (
                  <Text fontSize="14px" fontWeight="900" color={useColorModeValue('teal.800', 'teal.100')} mt={0.5}>
                    ₹{((workDoneStore.overallStats.totalBill - workDoneStore.overallStats.patientPending) || 0).toLocaleString('en-IN')}
                  </Text>
                )}
                <Text fontSize="8px" fontWeight="700" color="teal.500" noOfLines={1}>Received</Text>
              </Box>

              {/* 3. Outstanding */}
              <Box
                p={2.5}
                bg={useColorModeValue('pink.50', 'pink.900')}
                borderRadius="16px"
                border="1px solid"
                borderColor={useColorModeValue('pink.100', 'pink.800')}
                textAlign="center"
              >
                <Text fontSize="9px" fontWeight="800" color={useColorModeValue('pink.600', 'pink.300')} textTransform="uppercase">
                  Due
                </Text>
                {workDoneStore.overallStats.loading ? (
                  <Spinner size="xs" mt={1} />
                ) : (
                  <Text fontSize="14px" fontWeight="900" color={useColorModeValue('pink.800', 'pink.100')} mt={0.5}>
                    ₹{(workDoneStore.overallStats.patientPending || 0).toLocaleString('en-IN')}
                  </Text>
                )}
                <Text fontSize="8px" fontWeight="700" color="pink.500" noOfLines={1}>Balance</Text>
              </Box>
            </SimpleGrid>

            {/* Doctor Specific Secondary Row (only shown when doctor is filtered) */}
            {doctorFilter !== 'all' && (
              <SimpleGrid columns={3} gap={2} mt={2}>
                <Box p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="12px" textAlign="center">
                  <Text fontSize="8px" fontWeight="700" color="blue.500">Doc Bill</Text>
                  <Text fontSize="12px" fontWeight="800" color="blue.700">₹{totalBill}</Text>
                </Box>
                <Box p={2} bg={useColorModeValue('green.50', 'green.900')} borderRadius="12px" textAlign="center">
                  <Text fontSize="8px" fontWeight="700" color="green.500">Doc Recv</Text>
                  <Text fontSize="12px" fontWeight="800" color="green.700">₹{serverReceived}</Text>
                </Box>
                <Box p={2} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="12px" textAlign="center">
                  <Text fontSize="8px" fontWeight="700" color="orange.500">Doc Due</Text>
                  <Text fontSize="12px" fontWeight="800" color="orange.700">₹{patientPending}</Text>
                </Box>
              </SimpleGrid>
            )}
          </Box>
        ) : (
          /* ============================================================== */
          /* DESKTOP VIEW (>= 768px): 100% UNCHANGED                         */
          /* ============================================================== */
          <>
            <VStack align="start" spacing={1} mb={3}>
              <HStack w="full" justify="space-between" align="center">
                <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.2em">OVERALL PATIENT SUMMARY</Text>
                <Badge colorScheme="gray" variant="solid" fontSize="8px" px={2} borderRadius="md" opacity={0.6}>TOTALS</Badge>
              </HStack>
              <Divider opacity={0.3} />
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={6}>
              {[
                { label: 'Total Bill Value', val: workDoneStore.overallStats.totalBill, icon: FiPieChart, color: 'purple', sub: 'Gross Clinic Revenue' },
                { label: 'Total Collected', val: workDoneStore.overallStats.totalBill - workDoneStore.overallStats.patientPending, icon: FiDownloadCloud, color: 'cyan', sub: 'Total Cash Received' },
                { label: 'Total Outstanding', val: workDoneStore.overallStats.patientPending, icon: FiTrendingUp, color: 'pink', sub: 'Patient Balance' }
              ].map((item, i) => (
                <HStack key={i} p={3} bg={useColorModeValue(`${item.color}.50`, `${item.color}.900`)} borderRadius="xl" border="1px solid" borderColor={useColorModeValue(`${item.color}.100`, `${item.color}.800`)} shadow="sm" spacing={3}>
                  <Box p={2.5} bg={bgCardBox} borderRadius="lg" shadow="sm"><Icon as={item.icon} color={useColorModeValue(`${item.color}.400`, `${item.color}.300`)} boxSize="18px" /></Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="bold" color={useColorModeValue(`${item.color}.600`, `${item.color}.300`)} textTransform="uppercase">{item.label}</Text>
                    {workDoneStore.overallStats.loading ? <Spinner size="xs" /> : (
                      <Text fontSize="md" fontWeight="800" color={useColorModeValue(`${item.color}.700`, `${item.color}.200`)} letterSpacing="-0.5px">₹{(item.val || 0).toLocaleString('en-IN')}</Text>
                    )}
                    <Text fontSize="8px" fontWeight="bold" color={`${item.color}.400`} opacity={0.8}>{item.sub}</Text>
                  </VStack>
                </HStack>
              ))}
            </SimpleGrid>

            <VStack align="start" spacing={1} mb={3}>
              <HStack w="full" justify="space-between" align="center">
                <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.2em">
                  {doctorFilter === 'all' ? 'FILTERED VIEW (ALL DOCTORS)' : 'DOCTOR SPECIFIC VIEW'}
                </Text>
                <Badge colorScheme="blue" variant="solid" fontSize="8px" px={2} borderRadius="md">DYNAMIC</Badge>
              </HStack>
              <Divider borderColor="blue.100" opacity={0.5} />
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={8}>
              {[
                { label: 'Bill Value', val: totalBill, icon: FiPieChart, color: 'blue', sub: doctorFilter === 'all' ? 'Gross Revenue' : 'Doctor Share' },
                { label: 'Collected', val: serverReceived, icon: FiDownloadCloud, color: 'green', sub: 'Cash Received' },
                { label: 'Outstanding', val: patientPending, icon: FiTrendingUp, color: 'orange', sub: 'Balance Due' }
              ].map((item, i) => (
                <HStack key={i} p={3} bg={useColorModeValue(`${item.color}.50`, `${item.color}.900`)} borderRadius="xl" border="1px solid" borderColor={useColorModeValue(`${item.color}.100`, `${item.color}.800`)} shadow="sm" spacing={3}>
                  <Box p={2.5} bg={bgCardBox} borderRadius="lg" shadow="sm"><Icon as={item.icon} color={useColorModeValue(`${item.color}.400`, `${item.color}.300`)} boxSize="18px" /></Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="bold" color={useColorModeValue(`${item.color}.600`, `${item.color}.300`)} textTransform="uppercase">{item.label}</Text>
                    {workDoneStore.patientStats.loading ? <Spinner size="xs" /> : (
                      <Text fontSize="md" fontWeight="800" color={useColorModeValue(`${item.color}.700`, `${item.color}.200`)} letterSpacing="-0.5px">₹{(item.val || 0).toLocaleString('en-IN')}</Text>
                    )}
                    <Text fontSize="8px" fontWeight="bold" color={`${item.color}.400`} opacity={0.8}>{item.sub}</Text>
                  </VStack>
                </HStack>
              ))}
            </SimpleGrid>
          </>
        )}

        {isMobile ? (
          <VStack align="stretch" spacing={2.5} mb={4}>
            {/* Row 1: Statement & Wallet buttons */}
            <HStack spacing={2} w="full">
              {stores.auth.hasPermission('accountability', 'download') && (
                <Button
                  flex={1}
                  leftIcon={<FiEye />}
                  bgGradient="linear(to-r, blue.500, blue.600)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)" }}
                  size="sm"
                  h="38px"
                  borderRadius="14px"
                  fontWeight="800"
                  fontSize="12px"
                  shadow="sm"
                  onClick={() => setIsDownloadModalOpen(true)}
                >
                  Statement
                </Button>
              )}

              <Button
                flex={1}
                leftIcon={<FiCreditCard />}
                bgGradient="linear(to-r, pink.500, pink.600)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, pink.600, pink.700)" }}
                size="sm"
                h="38px"
                borderRadius="14px"
                fontWeight="800"
                fontSize="12px"
                shadow="sm"
                onClick={() => { setSelectedWalletPatient({ ...patientDetails, walletBalance }); setIsWalletHistoryOpen(true); }}
              >
                Wallet (₹{walletBalance})
              </Button>
            </HStack>

            {/* Row 2: Search Input & Doctor Dropdown */}
            <Grid templateColumns="1fr 1fr" gap={2} w="full">
              <HStack
                spacing={1.5}
                px={2.5}
                bg={inputBg}
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
                h="36px"
              >
                <Icon as={FiSearch} color="gray.400" fontSize="13px" />
                <Input
                  variant="unstyled"
                  placeholder="Search tooth/note..."
                  fontSize="11.5px"
                  fontWeight="600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </HStack>

              <Box zIndex={10}>
                {(() => {
                  const selectOptions = doctorsList.map(doc => ({
                    label: `Dr. ${doc.name?.replace(/^Dr\.\s*/i, '')}`,
                    value: doc.id
                  }));
                  const selectedValue = doctorFilter !== "all" ? selectOptions.find(opt => opt.value === doctorFilter) : null;

                  return (
                    <CustomInput
                      name="doctorFilter"
                      type="select"
                      placeholder="Doctor..."
                      isClear={true}
                      isSearchable={true}
                      isPortal={true}
                      value={selectedValue}
                      onChange={(selectedOption: any) => {
                        setDoctorFilter(selectedOption ? selectedOption.value : "all");
                        setCurrentPage(1);
                      }}
                      options={selectOptions}
                    />
                  );
                })()}
              </Box>
            </Grid>

            {/* Row 3: Horizontal scrollable quick-action pills */}
            <Box
              overflowX="auto"
              py={1}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <HStack spacing={2} minW="max-content">
                {stores.auth.hasPermission('accountability', 'view') && (
                  <Button
                    size="xs"
                    h="30px"
                    colorScheme="blue"
                    variant="solid"
                    leftIcon={<FiCalendar />}
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="800"
                    px={3}
                    onClick={() => {
                      setIsCounting(true);
                      workDoneStore.getWorkDoneCountByDate({ patientId: patientDetails?._id })
                        .then((res: any) => {
                          if (res?.status === "success" || res?.success === "success" || res?.statusCode === 200) {
                            setBackendCounts(res.data || []);
                          }
                        })
                        .catch((err: any) => console.error("Failed to load accountability counts:", err))
                        .finally(() => setIsCounting(false));
                      setIsCountModalOpen(true);
                    }}
                  >
                    Work Dates ({filteredWork.length || 0})
                  </Button>
                )}

                <HStack
                  spacing={1}
                  px={2}
                  py={0.5}
                  bg="gray.50"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="gray.200"
                  h="30px"
                >
                  <Input
                    type="date"
                    variant="unstyled"
                    fontSize="10px"
                    w="100px"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fontWeight="700"
                    color="blue.700"
                  />
                  <Text fontSize="10px" color="gray.400">-</Text>
                  <Input
                    type="date"
                    variant="unstyled"
                    fontSize="10px"
                    w="100px"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fontWeight="700"
                    color="blue.700"
                  />
                  {(startDate || endDate) && (
                    <Button
                      size="xs"
                      h="22px"
                      colorScheme="blue"
                      borderRadius="full"
                      px={2}
                      fontSize="9.5px"
                      fontWeight="800"
                      onClick={() => {
                        setAppliedStartDate(startDate);
                        setAppliedEndDate(endDate);
                      }}
                    >
                      Apply
                    </Button>
                  )}
                </HStack>

                {(searchQuery || doctorFilter !== "all" || startDate || endDate || appliedStartDate || appliedEndDate) && (
                  <Button
                    size="xs"
                    h="30px"
                    variant="outline"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="800"
                    px={3}
                    onClick={() => {
                      setSearchQuery("");
                      setDoctorFilter("all");
                      setStartDate("");
                      setEndDate("");
                      setAppliedStartDate("");
                      setAppliedEndDate("");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </HStack>
            </Box>
          </VStack>
        ) : (
          <Flex px={{ base: 0, md: 2 }} mb={6} justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={2} wrap="wrap" w={{ base: "100%", md: "auto" }}>
                {stores.auth.hasPermission('accountability', 'download') && (
                  <Button
                    flex={{ base: 1, md: "initial" }}
                    leftIcon={<FiEye />}
                    bgGradient="linear(to-r, blue.500, blue.600)"
                    color="white"
                    _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg", transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    size={{ base: "sm", md: "md" }}
                    borderRadius="2xl"
                    fontWeight="800"
                    px={{ base: 3, md: 6 }}
                    shadow="md"
                    onClick={() => setIsDownloadModalOpen(true)}
                  >
                    View Statement
                  </Button>
                )}

                <Button
                  flex={{ base: 1, md: "initial" }}
                  leftIcon={<FiCreditCard />}
                  bgGradient="linear(to-r, pink.500, pink.600)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, pink.600, pink.700)", shadow: "lg", transform: "translateY(-1px)" }}
                  _active={{ transform: "translateY(0)" }}
                  size={{ base: "sm", md: "md" }}
                  borderRadius="2xl"
                  fontWeight="800"
                  px={{ base: 3, md: 6 }}
                  shadow="md"
                  onClick={() => { setSelectedWalletPatient({ ...patientDetails, walletBalance }); setIsWalletHistoryOpen(true); }}
                >
                  Wallet (₹{walletBalance})
                </Button>
            </HStack>

            <Flex wrap="wrap" gap={2} justify={{ base: "center", md: "flex-end" }} align="center">
                <HStack
                  spacing={0}
                  p={1}
                  bg={inputBg}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  shadow="sm"
                  transition="all 0.2s"
                  _hover={{ borderColor: "blue.200", shadow: "md" }}
                >
                  <Box px={3}>
                    <Icon as={FiSearch} color="gray.400" mt={1} />
                  </Box>
                  <Input
                    variant="unstyled"
                    placeholder="Search tooth or note..."
                    size="md"
                    w={{ base: "100%", sm: "220px" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </HStack>

                <Box w={{ base: "100%", sm: "250px" }} zIndex={10}>
                  {(() => {
                    const selectOptions = doctorsList.map(doc => ({
                      label: `Dr. ${doc.name?.replace(/^Dr\.\s*/i, '')}`,
                      value: doc.id
                    }));
                    const selectedValue = doctorFilter !== "all" ? selectOptions.find(opt => opt.value === doctorFilter) : null;

                    return (
                      <CustomInput
                        name="doctorFilter"
                        type="select"
                        placeholder="Filter by Doctor..."
                        isClear={true}
                        isSearchable={true}
                        isPortal={true}
                        value={selectedValue}
                        onChange={(selectedOption: any) => {
                          setDoctorFilter(selectedOption ? selectedOption.value : "all");
                          setCurrentPage(1);
                        }}
                        options={selectOptions}
                      />
                    );
                  })()}
                </Box>

                <HStack
                  spacing={2}
                  p={1}
                  bg={inputBg}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  shadow="sm"
                  transition="all 0.2s"
                  _hover={{ borderColor: "blue.200", shadow: "md" }}
                >
                  <Input
                    type="date"
                    variant="unstyled"
                    size="sm"
                    px={2}
                    w="145px"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fontWeight="800"
                    color="blue.600"
                  />
                  <Box color="gray.300" fontWeight="bold">-</Box>
                  <Input
                    type="date"
                    variant="unstyled"
                    size="sm"
                    px={2}
                    w="145px"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fontWeight="800"
                    color="blue.600"
                  />
                  <Button
                    size="sm"
                    colorScheme="blue"
                    borderRadius="xl"
                    px={4}
                    onClick={() => {
                      setAppliedStartDate(startDate);
                      setAppliedEndDate(endDate);
                    }}
                  >
                    Apply
                  </Button>
                </HStack>

                <HStack spacing={1}>
                  {stores.auth.hasPermission('accountability', 'view') && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="solid"
                      leftIcon={<FiCalendar />}
                      borderRadius="xl"
                      fontSize="11px"
                      fontWeight="bold"
                      onClick={() => {
                        setIsCounting(true);
                        workDoneStore.getWorkDoneCountByDate({ patientId: patientDetails?._id })
                          .then((res: any) => {
                            if (res?.status === "success" || res?.success === "success" || res?.statusCode === 200) {
                              setBackendCounts(res.data || []);
                            }
                          })
                          .catch((err: any) => console.error("Failed to load accountability counts:", err))
                          .finally(() => setIsCounting(false));
                        setIsCountModalOpen(true);
                      }}
                    >
                      View Work Dates
                    </Button>
                  )}
                  <Circle size="28px" bg="blue.50" color="blue.500" fontWeight="900" fontSize="12px" border="1px solid" borderColor="blue.100">
                    {filteredWork.length || 0}
                  </Circle>
                </HStack>

                <Button
                  size="sm"
                  variant="solid"
                  colorScheme="blue"
                  borderRadius="xl"
                  fontSize="11px"
                  fontWeight="bold"
                  px={4}
                  ml={2}
                  shadow="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setDoctorFilter("all");
                    setStartDate("");
                    setEndDate("");
                    setAppliedStartDate("");
                    setAppliedEndDate("");
                  }}
                >
                  RESET FILTERS
                </Button>
              </Flex>
          </Flex>
        )}

        {/* Dynamic Mobile Transaction Cards vs Desktop Table */}
        {isMobile ? (
          <VStack align="stretch" spacing={3} mb={6}>
            {filteredWork.length === 0 ? (
              <VStack py={12} spacing={3} bg="gray.50" borderRadius="2xl" border="1px dashed" borderColor="gray.300">
                <Icon as={FiActivity} fontSize="36px" color="gray.400" />
                <Text fontSize="13px" fontWeight="800" color="gray.600">No transactions found</Text>
              </VStack>
            ) : (
              filteredWork.map((record: any, idx: number) => {
                const bill = record.amount - (record.discount || 0);
                const received = record.receivedAmount || 0;
                const remaining = bill - received;
                const isOverpaid = received > bill;
                const isSettled = received === bill;
                const modes = Array.from(new Set((record.paymentHistory || []).map((h: any) => h.paymentMethod).filter(Boolean)));
                const toothDisplay = (typeof record.tooth === 'object' && record.tooth !== null)
                  ? (record.tooth.fdi || record.tooth.id || "")
                  : (record.toothFDI || record.tooth || "");

                return (
                  <Box
                    key={record._id || idx}
                    bg={bgCardBox}
                    borderRadius="20px"
                    border="1px solid"
                    borderColor={borderColor}
                    p={3.5}
                    shadow="sm"
                  >
                    {/* Header: S.No, Date, Status */}
                    <Flex justify="space-between" align="center" mb={2}>
                      <HStack spacing={2}>
                        <Badge colorScheme="gray" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="9.5px" fontWeight="900">
                          #{(currentPage - 1) * 10 + (idx + 1)}
                        </Badge>
                        <HStack spacing={1} color="gray.500">
                          <Icon as={FiClock} fontSize="11px" />
                          <Text fontSize="11px" fontWeight="700">
                            {record.createdAt ? moment(record.createdAt).format("DD MMM YYYY") : "N/A"}
                          </Text>
                        </HStack>
                      </HStack>
                      <Badge
                        px={2.5}
                        py={0.8}
                        borderRadius="full"
                        fontSize="9.5px"
                        fontWeight="800"
                        bg={isOverpaid ? "purple.500" : isSettled ? "green.500" : "orange.400"}
                        color="white"
                      >
                        {isOverpaid ? "OVERPAID" : isSettled ? "SETTLED" : "PENDING"}
                      </Badge>
                    </Flex>

                    {/* Tooth badge + Doctor name */}
                    <HStack spacing={2} mb={1.5} wrap="wrap">
                      {toothDisplay && toothDisplay !== "General" && (
                        <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="10px" fontWeight="800">
                          Tooth #{toothDisplay}
                        </Badge>
                      )}
                      {record.doctor?.name && (
                        <HStack spacing={1} color="gray.600">
                          <Icon as={FiUser} fontSize="11px" color="blue.500" />
                          <Text fontSize="11px" fontWeight="700" noOfLines={1}>
                            Dr. {record.doctor.name.replace(/^Dr\.\s*/i, '')}
                          </Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* Procedure Note */}
                    <Text fontSize="13px" fontWeight="800" color="gray.800" lineHeight="1.35" mb={2.5}>
                      {record.workDoneNote || record.toothNote || record.treatmentPlan || record.treatmentCode || "General Procedure"}
                    </Text>

                    {/* Financials Bento: Total Bill | Paid | Balance */}
                    <SimpleGrid columns={3} gap={1.5} p={2} bg="gray.50" borderRadius="14px" mb={3} border="1px solid" borderColor="gray.150">
                      <VStack spacing={0} align="center" bg="white" p={1.5} borderRadius="10px" border="1px solid" borderColor="gray.100">
                        <Text fontSize="8.5px" fontWeight="800" color="gray.500" textTransform="uppercase">Bill</Text>
                        <Text fontSize="12.5px" fontWeight="900" color="purple.800">
                          ₹{bill.toLocaleString('en-IN')}
                        </Text>
                        {record.discount > 0 && (
                          <Text fontSize="8px" color="gray.400" textDecoration="line-through">
                            ₹{(record.amount || 0).toLocaleString('en-IN')}
                          </Text>
                        )}
                      </VStack>

                      <VStack spacing={0} align="center" bg="white" p={1.5} borderRadius="10px" border="1px solid" borderColor="gray.100">
                        <Text fontSize="8.5px" fontWeight="800" color="gray.500" textTransform="uppercase">Paid</Text>
                        <Text fontSize="12.5px" fontWeight="900" color="green.700">
                          ₹{received.toLocaleString('en-IN')}
                        </Text>
                        {modes.length > 0 && (
                          <Text fontSize="8px" fontWeight="700" color="green.600" noOfLines={1}>
                            {modes.join(", ")}
                          </Text>
                        )}
                      </VStack>

                      <VStack spacing={0} align="center" bg="white" p={1.5} borderRadius="10px" border="1px solid" borderColor="gray.100">
                        <Text fontSize="8.5px" fontWeight="800" color="gray.500" textTransform="uppercase">Balance</Text>
                        <Text
                          fontSize="12.5px"
                          fontWeight="900"
                          color={remaining < 0 ? "purple.600" : remaining > 0 ? "orange.600" : "green.600"}
                        >
                          ₹{Math.abs(remaining).toLocaleString('en-IN')}
                        </Text>
                        <Text fontSize="8px" fontWeight="800" color={remaining > 0 ? "orange.500" : remaining < 0 ? "purple.500" : "green.500"}>
                          {remaining < 0 ? "OVERPAID" : remaining > 0 ? "DUE" : "SETTLED"}
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {/* Action Bar */}
                    <Flex justify="space-between" align="center" pt={1} borderTop="1px dashed" borderColor="gray.200">
                      <HStack spacing={1.5}>
                        {stores.auth.hasPermission('accountability', 'edit') && (
                          <IconButton
                            aria-label="Edit Bill"
                            icon={<FiEdit2 />}
                            size="xs"
                            colorScheme="yellow"
                            variant="outline"
                            borderRadius="lg"
                            onClick={() => {
                              setEditingBillRecord(record);
                              setEditBillAmount(bill.toString());
                              setIsEditBillModalOpen(true);
                            }}
                          />
                        )}
                        {stores.auth.hasPermission('accountability', 'view') && (
                          <IconButton
                            aria-label="History"
                            icon={<FiEye />}
                            size="xs"
                            colorScheme="teal"
                            variant="outline"
                            borderRadius="lg"
                            onClick={() => openHistoryDrawer(record)}
                          />
                        )}
                        {received > 0 && stores.auth.hasPermission('accountability', 'download') && (
                          <IconButton
                            aria-label="Receipt"
                            icon={downloadingRecordId === record._id ? <Spinner size="xs" /> : <FiDownload />}
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            borderRadius="lg"
                            onClick={() => handleSingleDownload(record._id)}
                            isDisabled={downloadingRecordId !== null}
                          />
                        )}
                      </HStack>

                      {stores.auth.hasPermission('accountability', 'create') && (
                        <Button
                          size="xs"
                          colorScheme="green"
                          leftIcon={<FiPlusCircle />}
                          borderRadius="xl"
                          fontWeight="800"
                          px={3}
                          onClick={() => openPaymentModal(record)}
                        >
                          Collect Payment
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })
            )}

            {/* Mobile Pagination */}
            {(workDoneStore.workDone.totalPages || 1) > 1 && (
              <HStack justify="space-between" align="center" p={2} bg="gray.50" borderRadius="xl">
                <Button
                  size="xs"
                  variant="outline"
                  isDisabled={currentPage <= 1}
                  onClick={() => handleChangePage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Text fontSize="11px" fontWeight="700" color="gray.600">
                  Page {currentPage} of {workDoneStore.workDone.totalPages}
                </Text>
                <Button
                  size="xs"
                  variant="outline"
                  isDisabled={currentPage >= (workDoneStore.workDone.totalPages || 1)}
                  onClick={() => handleChangePage(currentPage + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        ) : (
          <CustomTable
            data={filteredWork.map((wd: any, i: number) => ({
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
        )}
      </Box>

      <Modal isOpen={isCountModalOpen} onClose={() => setIsCountModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent
          borderRadius={{ base: "24px", md: "3xl" }}
          mx={{ base: 3, md: "auto" }}
          overflow="hidden"
          boxShadow="2xl"
        >
          <Box bgGradient="linear(135deg, #091E42 0%, #0C4A6E 60%, #0D9488 100%)" color="white" px={5} py={4}>
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl" backdropFilter="blur(4px)">
                  <Icon as={FiActivity} fontSize="18px" color="teal.200" />
                </Box>
                <Box>
                  <HStack spacing={2}>
                    <Text fontSize="9px" fontWeight="900" color="teal.200" textTransform="uppercase" letterSpacing="0.1em">
                      Patient Trends
                    </Text>
                    <Badge colorScheme="teal" variant="solid" fontSize="8px" px={1.5} borderRadius="full">
                      Live
                    </Badge>
                  </HStack>
                  <Heading size="sm" fontWeight="900" color="white">
                    Accountability Summary
                  </Heading>
                </Box>
              </HStack>
              <ModalCloseButton position="static" color="white" _hover={{ bg: "whiteAlpha.200" }} />
            </HStack>
          </Box>

          <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.150">
            {backendCounts.length > 0 && (
              <Grid templateColumns="repeat(2, 1fr)" gap={2.5} mb={3}>
                <Box
                  bg="white"
                  p={3}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="blue.100"
                  shadow="xs"
                >
                  <HStack justify="space-between" align="center" mb={1}>
                    <Text fontSize="9px" fontWeight="900" color="blue.600" textTransform="uppercase">
                      Total Visits
                    </Text>
                    <Icon as={FiCalendar} color="blue.400" fontSize="12px" />
                  </HStack>
                  <Text fontSize="20px" fontWeight="900" color="blue.900" lineHeight="1">
                    {totalSummaryStats.totalVisits}
                  </Text>
                  <Text fontSize="8px" fontWeight="700" color="gray.400" mt={1}>Clinic Sessions</Text>
                </Box>
                <Box
                  bg="white"
                  p={3}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="teal.100"
                  shadow="xs"
                >
                  <HStack justify="space-between" align="center" mb={1}>
                    <Text fontSize="9px" fontWeight="900" color="teal.600" textTransform="uppercase">
                      Total Records
                    </Text>
                    <Icon as={FiTrendingUp} color="teal.400" fontSize="12px" />
                  </HStack>
                  <Text fontSize="20px" fontWeight="900" color="teal.900" lineHeight="1">
                    {totalSummaryStats.totalTreatments}
                  </Text>
                  <Text fontSize="8px" fontWeight="700" color="gray.400" mt={1}>Accountability Entries</Text>
                </Box>
              </Grid>
            )}

            <HStack
              bg="white"
              px={3}
              py={1.5}
              borderRadius="14px"
              border="1px solid"
              borderColor="gray.250"
              shadow="xs"
            >
              <Icon as={FiSearch} color="gray.400" fontSize="13px" />
              <Input
                placeholder="Filter by session date or year..."
                variant="unstyled"
                fontSize="12px"
                fontWeight="600"
                value={countSearch}
                onChange={(e) => setCountSearch(e.target.value)}
              />
            </HStack>
          </Box>

          <ModalBody px={4} py={3} maxH="380px" overflowY="auto" bg="white">
            {filteredCounts.length > 0 ? (
              <VStack align="stretch" spacing={2.5}>
                {filteredCounts.map((item, idx) => (
                  <HStack
                    key={idx}
                    p={3}
                    bg="gray.50"
                    borderRadius="16px"
                    justify="space-between"
                    border="1px solid"
                    borderColor="gray.150"
                    _hover={{ borderColor: "blue.300", bg: "blue.50", cursor: "pointer", transform: "translateY(-1px)", shadow: "xs" }}
                    transition="all 0.15s ease"
                    onClick={() => {
                      setSessionDate(item.date);
                      setStartDate(item.date);
                      setEndDate(item.date);
                      setAppliedStartDate(item.date);
                      setAppliedEndDate(item.date);
                      setIsCountModalOpen(false);
                    }}
                  >
                    <HStack spacing={3}>
                      <Box p={2} bg="white" borderRadius="12px" shadow="xs" border="1px solid" borderColor="gray.100">
                        <Icon as={FiCalendar} color="blue.500" fontSize="16px" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="800" color="gray.800">
                          {new Date(item.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                        </Text>
                        <Text fontSize="9px" fontWeight="700" color="blue.600">
                          Tap to view {item.count} {item.count === 1 ? 'record' : 'records'}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      px={2.5}
                      py={1}
                      fontSize="11px"
                      fontWeight="900"
                    >
                      {item.count} {item.count === 1 ? 'entry' : 'entries'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <VStack py={8} spacing={3} opacity={0.6}>
                <Icon as={FiActivity} fontSize="36px" color="gray.400" />
                <Text fontWeight="800" fontSize="13px" color="gray.600">
                  {countSearch ? "No matching dates found" : "No activity history found"}
                </Text>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" p={3}>
            <Button
              w="full"
              size="sm"
              borderRadius="12px"
              variant="outline"
              colorScheme="gray"
              fontWeight="800"
              onClick={() => setIsCountModalOpen(false)}
            >
              Close Summary
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DOWNLOAD STATEMENT MODAL - PREMIUM REDESIGN */}
      <Modal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.500" />
        <ModalContent
          borderRadius={{ base: "24px", md: "3xl" }}
          shadow="dark-lg"
          overflow="hidden"
          mx={{ base: 3, md: "auto" }}
          maxH={{ base: "90vh", md: "auto" }}
        >
          <ModalHeader p={0}>
            <Box bgGradient="linear(to-br, blue.600, blue.800)" p={{ base: 4, md: 6 }} color="white" pos="relative">
              <VStack align="start" spacing={1}>
                <HStack spacing={2} opacity={0.9}>
                  <Icon as={FiEye} />
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.2em">PDF PREVIEWER</Text>
                </HStack>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="1000" letterSpacing="-0.5px">View Statement</Text>
                <Text fontSize="xs" opacity={0.8} fontWeight="500">Preview clinical financial statement</Text>
              </VStack>
              <Box pos="absolute" right={-10} top={-10} boxSize="150px" bg="whiteAlpha.100" borderRadius="full" />
            </Box>
          </ModalHeader>
          <ModalCloseButton color="white" top={4} right={4} borderRadius="full" _hover={{ bg: "whiteAlpha.200" }} />

          <ModalBody p={{ base: 4, md: 6 }} overflowY="auto">
            <VStack spacing={4}>
              <Box w="full">
                <Text fontSize="xs" fontWeight="900" color="blue.500" mb={2} letterSpacing="0.1em">TIMELINE RANGE</Text>
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>START DATE</FormLabel>
                    <HStack bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
                      <Icon as={FiCalendar} color="gray.400" />
                      <Input
                        type="date"
                        variant="unstyled"
                        fontSize="xs"
                        fontWeight="700"
                        value={downloadFilters.startDate}
                        onChange={(e) => setDownloadFilters({...downloadFilters, startDate: e.target.value})}
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>END DATE</FormLabel>
                    <HStack bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
                      <Icon as={FiCalendar} color="gray.400" />
                      <Input
                        type="date"
                        variant="unstyled"
                        fontSize="xs"
                        fontWeight="700"
                        value={downloadFilters.endDate}
                        onChange={(e) => setDownloadFilters({...downloadFilters, endDate: e.target.value})}
                      />
                    </HStack>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Box w="full">
                <Text fontSize="xs" fontWeight="900" color="blue.500" mb={2} letterSpacing="0.1em">REPORT SCOPE</Text>
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>ASSIGNED DOCTOR</FormLabel>
                    <Select
                      bg="gray.50"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.100"
                      fontSize="xs"
                      fontWeight="700"
                      h="40px"
                      value={downloadFilters.doctorId}
                      onChange={(e) => setDownloadFilters({...downloadFilters, doctorId: e.target.value})}
                    >
                      <option value="all">All Doctors</option>
                      {doctorsList.map(doc => (
                        <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>PAYMENT STATUS</FormLabel>
                    <Select
                      bg="gray.50"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.100"
                      fontSize="xs"
                      fontWeight="700"
                      h="40px"
                      value={downloadFilters.status}
                      onChange={(e) => setDownloadFilters({...downloadFilters, status: e.target.value})}
                    >
                      <option value="all">Full History</option>
                      <option value="SETTLED">Settled Only</option>
                      <option value="PENDING">Pending Balance</option>
                    </Select>
                  </FormControl>
                  <FormControl gridColumn="1 / -1">
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>TOOTH NUMBERS (OPTIONAL)</FormLabel>
                    <CreatableSelect
                      isMulti
                      options={[]}
                      value={downloadToothNumbers}
                      onChange={(val) => setDownloadToothNumbers(val as any[])}
                      placeholder="Type tooth numbers..."
                      formatCreateLabel={(inputValue) => `Add tooth "${inputValue}"`}
                      styles={{
                        control: (base) => ({
                          ...base,
                          background: "#F7FAFC",
                          borderRadius: "0.75rem",
                          border: "1px solid #EDF2F7",
                          minHeight: "40px",
                          fontSize: "13px",
                          fontWeight: "700"
                        })
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <HStack w="full" p={3} bg="blue.50" borderRadius="xl" spacing={3}>
                <Box p={1.5} bg="blue.100" borderRadius="lg"><Icon as={FiTarget} color="blue.600" /></Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="bold" color="blue.700">Audit Ready</Text>
                  <Text fontSize="10px" color="blue.600" opacity={0.8}>Includes digital signatures and clinic branding.</Text>
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 3, md: 6 }} pt={0} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
            <Flex w="full" justify="space-between" align="center" gap={2} wrap="wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDownloadModalOpen(false)}
                borderRadius="xl"
                fontWeight="800"
                fontSize="xs"
                color="gray.500"
              >
                Cancel
              </Button>
              <HStack spacing={2} flex={{ base: 1, sm: "initial" }} justify="flex-end">
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReceiptsLog}
                  isLoading={isDownloadingReceipts}
                  rightIcon={<FiEye />}
                  borderRadius="xl"
                  px={{ base: 3, md: 5 }}
                  fontWeight="800"
                  fontSize="xs"
                >
                  Receipts Log
                </Button>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  rightIcon={<FiEye />}
                  borderRadius="xl"
                  px={{ base: 3, md: 6 }}
                  fontWeight="800"
                  fontSize="xs"
                >
                  Preview PDF
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader fontWeight="1000" fontSize="xl" color="blue.600">New Payment Entry</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box p={4} bg="gray.50" borderRadius="2xl">
                <Text fontSize="10px" color="gray.400" fontWeight="bold">REMAINING TO COLLECT</Text>
                <Text fontSize="lg" fontWeight="1000" color="orange.600">
                  ₹{((selectedRecord?.amount - (selectedRecord?.discount || 0)) - (selectedRecord?.receivedAmount || 0)).toLocaleString()}
                </Text>
              </Box>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="900" color="gray.500">ENTER AMOUNT (₹)</FormLabel>
                <Input
                  size="lg" h="60px" borderRadius="2xl" bg="white" borderWidth="2px"
                  placeholder="0.00" fontWeight="1000" fontSize="2xl" textAlign="center"
                  value={tempValue} onChange={(e) => setTempValue(e.target.value)} autoFocus
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="900" color="gray.500">PAYMENT MODE</FormLabel>
                <Select
                  size="lg" borderRadius="2xl" fontWeight="800"
                  value={receiveType} onChange={(e) => setReceiveType(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  {walletBalance > 0 && ((selectedRecord?.amount || 0) - (selectedRecord?.discount || 0) - (selectedRecord?.receivedAmount || 0)) > 0 && (
                    <option value="Wallet">Wallet (Bal: ₹{walletBalance})</option>
                  )}
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSavePayment} isLoading={isSaving} leftIcon={<FiCheck />}>Confirm Entry</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Drawer isOpen={isHistoryOpen} placement="right" onClose={() => setIsHistoryOpen(false)} size="sm">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderLeftRadius="3xl" bg="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.100">
            <VStack align="start" spacing={0}>
              <Text fontWeight="1000" fontSize="xl" color="blue.600">Transaction History</Text>
              <Text fontSize="xs" color="gray.400">{selectedRecord?.treatmentPlan}</Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody py={6}>
            {isLoadingHistory ? (
              <VStack py={10}><Spinner color="blue.500" /></VStack>
            ) : historyData.length > 0 ? (
              <VStack align="stretch" spacing={4}>
                <Box p={4} bg="blue.50" borderRadius="2xl">
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <HStack align="center" spacing={2}>
                          <Text fontSize="xs" fontWeight="bold" color="blue.600">TOTAL BILL</Text>
                          {selectedRecord?.discount > 0 && (
                            <Badge colorScheme="red" fontSize="2xs" borderRadius="full" px={2}>
                              -₹{selectedRecord.discount.toLocaleString()} Discount
                            </Badge>
                          )}
                        </HStack>
                        <HStack align="baseline" spacing={2}>
                          <Text fontWeight="1000" color="blue.700" fontSize="lg">₹{(selectedRecord?.amount - (selectedRecord?.discount || 0)).toLocaleString()}</Text>
                          {selectedRecord?.discount > 0 && (
                            <Text fontSize="xs" color="gray.400" textDecoration="line-through">
                              ₹{(selectedRecord?.amount || 0).toLocaleString()}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        leftIcon={downloadingRecordId === selectedRecord?._id ? undefined : <FiEye />}
                        isLoading={downloadingRecordId === selectedRecord?._id}
                        onClick={async () => {
                          try {
                            setDownloadingRecordId(selectedRecord._id);
                            const base64 = await workDoneStore.fetchSingleRecordReportBase64(selectedRecord._id);
                            setPreviewData(base64);
                            setPreviewFileName(`Summary_${selectedRecord._id}.pdf`);
                            setIsPreviewOpen(true);
                          } catch (error) {
                            toast({ title: "Error", description: "Failed to load preview.", status: "error", duration: 3000 });
                          } finally {
                            setDownloadingRecordId(null);
                          }
                        }}
                        borderRadius="lg"
                      >
                        Download Summary
                      </Button>
                    </HStack>
                    <Divider borderColor="blue.100" />
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" color="green.600">TOTAL RECEIVED</Text>
                        <Text fontWeight="1000" color="green.700" fontSize="md">₹{historyData.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0).toLocaleString()}</Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" color="orange.600">BALANCE DUE</Text>
                        <Text fontWeight="1000" color="orange.700" fontSize="md">₹{Math.max(0, (selectedRecord?.amount - (selectedRecord?.discount || 0)) - historyData.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)).toLocaleString()}</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="0.1em">PAYMENT TIMELINE</Text>
                  {historyData.map((h: any, i: number) => (
                    <HStack key={i} justify="space-between" p={4} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="start" spacing={0}>
                        <HStack spacing={2}>
                          <Text fontWeight="800" color="gray.700">Payment Entry {historyData.length - i}</Text>
                          {h.receiptNumber && (
                            <Badge colorScheme="blue" variant="subtle" fontSize="9px" borderRadius="md">
                              {h.receiptNumber}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.400">{moment(h.date).format("DD MMM YYYY, hh:mm A")}</Text>
                      </VStack>
                      <HStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="1000" color="green.700" fontSize="lg">₹{h.amount.toLocaleString()}</Text>
                          <Badge
                            size="sm"
                            colorScheme={
                              h.paymentMethod === 'Cash' ? 'green' :
                                h.paymentMethod === 'UPI' ? 'purple' :
                                  h.paymentMethod === 'Cheque' ? 'orange' :
                                    h.paymentMethod === 'Card' ? 'blue' : 'gray'
                            }
                            variant="solid"
                            fontSize="9px"
                            borderRadius="lg"
                            px={2}
                          >
                            {(h.paymentMethod || "CASH").toUpperCase()}
                          </Badge>
                        </VStack>
                        {stores.auth.hasPermission('accountability', 'download') && (
                          <IconButton
                            aria-label="View Entry Receipt"
                            icon={downloadingPaymentId === `${selectedRecord?._id}-${i}` ? <Spinner size="xs" /> : <FiEye />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            borderRadius="full"
                            isDisabled={downloadingPaymentId !== null}
                            onClick={async () => {
                              try {
                                setDownloadingPaymentId(h._id);
                                const base64Data = await workDoneStore.fetchPaymentReceiptBase64(selectedRecord._id, h._id);
                                setPreviewData(base64Data);
                                setPreviewFileName(`Payment_Receipt_${selectedRecord._id}_${h._id}.pdf`);
                                setIsPreviewOpen(true);
                              } catch (err: any) {
                                toast({ title: "Preview Error", description: err.message, status: "error" });
                              } finally {
                                setDownloadingPaymentId(null);
                              }
                            }}
                          />
                        )}
                        {stores.auth.hasPermission('accountability', 'edit') && (new Date(h.date).toLocaleDateString("en-GB") === new Date().toLocaleDateString("en-GB") || stores.auth.user?.role?.toLowerCase() === 'superadmin' || stores.auth.user?.role?.toLowerCase() === 'admin') && h.paymentMethod !== 'Transferred to Wallet' && (
                          <>
                            <IconButton
                              aria-label="Edit Amount"
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="orange"
                              variant="ghost"
                              borderRadius="full"
                              onClick={() => {
                                setEditingPaymentIndex(i);
                                setEditAmount(String(h.amount));
                                setIsEditAmountOpen(true);
                              }}
                            />
                            <IconButton
                              aria-label="Delete Payment"
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              borderRadius="full"
                              onClick={() => {
                                setPaymentToDelete({ payment: h, index: i });
                                setDeleteConfirmText("");
                                setIsDeleteModalOpen(true);
                              }}
                            />
                          </>
                        )}
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            ) : (
              <VStack py={20} color="gray.400">
                <Icon as={FiSearch} boxSize={12} mb={4} opacity={0.3} />
                <Text fontWeight="bold">No payment entries found.</Text>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Edit Amount Drawer */}
      <Drawer isOpen={isEditAmountOpen} placement="right" onClose={() => setIsEditAmountOpen(false)} size="sm">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderLeftRadius="3xl" bg="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.100">
            <VStack align="start" spacing={0}>
              <Text fontWeight="1000" fontSize="xl" color="orange.500">Edit Payment Amount</Text>
              <Text fontSize="xs" color="gray.400">
                {editingPaymentIndex !== null ? `Payment Entry ${historyData.length - editingPaymentIndex}` : ""}
              </Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody py={8}>
            <VStack spacing={6} align="stretch">
              <Box p={4} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.100">
                <Text fontSize="xs" fontWeight="bold" color="orange.600" mb={1}>CURRENT AMOUNT</Text>
                <Text fontWeight="1000" fontSize="2xl" color="orange.700">
                  ₹{editingPaymentIndex !== null ? (historyData[editingPaymentIndex]?.amount || 0).toLocaleString() : 0}
                </Text>
              </Box>
              <FormControl>
                <FormLabel fontWeight="700" color="gray.700">New Amount (₹)</FormLabel>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter new amount"
                  borderRadius="xl"
                  size="lg"
                  focusBorderColor="orange.400"
                />
              </FormControl>
              {stores.auth.hasPermission('accountability', 'edit') && (
                <Button
                  colorScheme="orange"
                  size="lg"
                  borderRadius="xl"
                  isLoading={isSavingAmount}
                  leftIcon={<FiCheck />}
                  onClick={async () => {
                    if (editingPaymentIndex === null || !selectedRecord) return;
                    const newAmt = Number(editAmount);
                    if (isNaN(newAmt) || newAmt < 0) {
                      toast({ title: "Invalid amount", status: "error", duration: 2000 });
                      return;
                    }

                    const updatedHistoryTest = historyData.map((p: any, idx: number) =>
                      idx === editingPaymentIndex ? { ...p, amount: newAmt } : p
                    );
                    const proposedTotalReceived = updatedHistoryTest.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                    const bill = selectedRecord.amount - (selectedRecord.discount || 0);

                    // if (proposedTotalReceived > bill) {
                    //   toast({
                    //     title: "Overpayment Error",
                    //     description: `Total payments (₹${proposedTotalReceived.toLocaleString()}) cannot exceed total bill (₹${bill.toLocaleString()}).`,
                    //     status: "warning",
                    //     duration: 3000
                    //   });
                    //   return;
                    // }

                      setIsSavingAmount(true);
                      try {
                        const paymentToEdit = historyData[editingPaymentIndex];
                        await workDoneStore.updatePayment(paymentToEdit._id, { amount: newAmt });

                        setIsEditAmountOpen(false);
                        toast({ title: "Amount updated successfully!", status: "success", duration: 2000 });
                        
                        // Re-fetch everything to ensure background stats match
                        await fetchData();
                        await fetchOverallStats();
                        
                        // Extract the fresh record directly from the newly fetched data in the store
                        const freshRecordData = stores.workDoneStore.workDone.data.find((wd: any) => wd._id === selectedRecord._id);
                        if (freshRecordData) {
                          setHistoryData([...(freshRecordData.paymentHistory || [])].reverse());
                          setSelectedRecord(freshRecordData);
                        }
                    } catch (err: any) {
                      toast({ title: "Failed to update amount", description: err?.message, status: "error", duration: 3000 });
                    } finally {
                      setIsSavingAmount(false);
                    }
                  }}
                >
                  Save Changes
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Modal isOpen={isEditBillModalOpen} onClose={() => setIsEditBillModalOpen(false)} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="black" color="yellow.500" letterSpacing="0.1em">EDIT TOTAL BILL</Text>
              <Text fontSize="md" fontWeight="bold">Modify Bill Amount</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="bold" color="gray.500">New Total Bill Amount (₹)</FormLabel>
              <Input
                type="number"
                value={editBillAmount}
                onChange={(e) => setEditBillAmount(e.target.value)}
                placeholder="Enter amount"
                size="lg"
                fontWeight="bold"
                borderRadius="xl"
                bg="gray.50"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={() => setIsEditBillModalOpen(false)} borderRadius="xl">Cancel</Button>
            <Button
              colorScheme="yellow"
              onClick={handleSaveTotalBill}
              isLoading={isSavingBill}
              borderRadius="xl"
              px={6}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ReceiptPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewData(null);
        }}
        pdfBase64={previewData}
        fileName={previewFileName}
      />

      <WalletHistoryDrawer
        isOpen={isWalletHistoryOpen}
        onClose={() => setIsWalletHistoryOpen(false)}
        patient={selectedWalletPatient}
      />

      {/* Secure Delete Payment Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => !isDeletingPayment && setIsDeleteModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader borderBottom="1px solid" borderColor="red.100">
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="black" color="red.500" letterSpacing="0.1em">WARNING</Text>
              <Text fontSize="lg" fontWeight="bold">Secure Delete Payment</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isDeletingPayment} />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200">
                <Text fontSize="sm" color="red.700" fontWeight="medium">
                  You are about to delete a payment of <b>₹{paymentToDelete?.payment?.amount?.toLocaleString()}</b>.
                </Text>
                <Text fontSize="sm" color="red.600" mt={2} fontWeight="bold">
                  This action may also deduct funds from the patient's wallet if this payment originally generated an advance.
                </Text>
              </Box>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                  Type <Text as="span" color="red.500">DELETE</Text> to confirm
                </FormLabel>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  size="lg"
                  fontWeight="bold"
                  borderRadius="xl"
                  focusBorderColor="red.400"
                  isDisabled={isDeletingPayment}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={() => setIsDeleteModalOpen(false)} borderRadius="xl" isDisabled={isDeletingPayment}>Cancel</Button>
            <Button
              colorScheme="red"
              isDisabled={deleteConfirmText !== "DELETE"}
              isLoading={isDeletingPayment}
              borderRadius="xl"
              px={6}
              onClick={async () => {
                if (!paymentToDelete) return;
                setIsDeletingPayment(true);
                try {
                  await stores.workDoneStore.secureDeletePayment(paymentToDelete.payment._id);
                  toast({ title: "Payment deleted securely!", status: "success", duration: 2000 });
                  setIsDeleteModalOpen(false);
                  
                  // Optimistically remove from UI
                  const updatedHistory = historyData.filter((_, idx) => idx !== paymentToDelete.index);
                  setHistoryData(updatedHistory);
                  
                  // Re-fetch everything to ensure background stats match
                  await fetchData();
                  await fetchOverallStats();
                  
                  // Extract the fresh record directly from the newly fetched data in the store
                  const freshRecordData = stores.workDoneStore.workDone.data.find((wd: any) => wd._id === selectedRecord._id);
                  if (freshRecordData) {
                    setHistoryData([...(freshRecordData.paymentHistory || [])].reverse());
                    setSelectedRecord(freshRecordData);
                  }
                  
                } catch (err: any) {
                  toast({ 
                    title: "Failed to delete payment", 
                    description: err?.message || "An error occurred", 
                    status: "error", 
                    duration: 5000 
                  });
                } finally {
                  setIsDeletingPayment(false);
                }
              }}
            >
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
});

export default PatientAccountHistory;

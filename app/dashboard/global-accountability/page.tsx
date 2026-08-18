"use client";

import {
  Box,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Skeleton,
  HStack,
  Button,
  VStack,
  Divider,
  Icon,
  Grid,
  GridItem,
  Avatar,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  CheckboxGroup,
  Tooltip,
  IconButton,
  Input,
  Center,
  Spinner,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { FiActivity, FiFilter, FiFileText, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiDollarSign, FiPrinter, FiEdit2, FiList, FiEye, FiPlusCircle, FiCreditCard, FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import React, { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import Pagination from "../../component/common/pagination/Pagination";
import { formatCurrency } from "../../config/utils/utils";
import CreatableSelect from "react-select/creatable";
import { FormControl, FormLabel } from "@chakra-ui/react";
import ReceiptPreviewDrawer from "../patients/component/patient/ReceiptPreviewDrawer";
import WalletHistoryDrawer from "../../component/WalletHistoryDrawer";
import { toJS } from "mobx";

const ALL_PRINT_COLUMNS = [
  { key: "date", label: "Billing Date" },
  { key: "receiptNumber", label: "Receipt No." },
  { key: "patient", label: "Patient" },
  { key: "tooth", label: "Tooth" },
  { key: "treatmentCode", label: "Treatment Code" },
  { key: "treatment", label: "Treatment" },
  { key: "doctor", label: "Doctor" },
  { key: "walletBalance", label: "Wallet Balance" },
  { key: "fees", label: "Fees" },
  { key: "paid", label: "Txn Paid" },
  { key: "lastPaid", label: "Payment Date" },
  { key: "due", label: "Due" },
  { key: "overpay", label: "Advance" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "status", label: "Status" }
];

const GlobalAccountabilityPage = observer(() => {
  const user = stores?.auth?.user;
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalBilled: 0, totalPaid: 0, totalDue: 0, totalAdvance: 0, totalWalletReceived: 0 });
  const [todaySummary, setTodaySummary] = useState<any>({ todayBilled: 0, todayPaid: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedPatients, setSelectedPatients] = useState<any[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<any[]>(() => {
    const user = stores?.auth?.user;
    if (user?.role === "Doctor" || user?.userType === "Doctor" || user?.userType === "doctor") {
      return [{
        _id: user._id || user.userId,
        id: user._id || user.userId,
        value: user._id || user.userId,
        label: `${user.username || user.name || user.firstName || 'Doctor'}-${user?.mobileNumber}`
      }];
    }
    return [];
  });
  const [status, setStatus] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [treatmentCode, setTreatmentCode] = useState("");
  const [toothNumbers, setToothNumbers] = useState<any[]>([]);

  // Print Report States
  const toast = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintColumns, setSelectedPrintColumns] = useState<string[]>(ALL_PRINT_COLUMNS.map(c => c.key));

  // Edit Total Bill State
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [editingBillRecord, setEditingBillRecord] = useState<any>(null);
  const [editBillAmount, setEditBillAmount] = useState<string>("");
  const [isSavingBill, setIsSavingBill] = useState(false);

  // Add Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [tempValue, setTempValue] = useState<string>("");
  const [receiveType, setReceiveType] = useState<string>("Cash");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Transaction History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Edit Specific Payment Entry State
  const [isEditAmountOpen, setIsEditAmountOpen] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  // Wallet Transfer State
  const [isTransferingWallet, setIsTransferingWallet] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletTransferAmount, setWalletTransferAmount] = useState<string>("");
  const [selectedWalletRecord, setSelectedWalletRecord] = useState<any>(null);

  // Wallet History State
  const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState(false);
  const [walletHistoryData, setWalletHistoryData] = useState<any[]>([]);
  const [isWalletHistoryLoading, setIsWalletHistoryLoading] = useState(false);
  const [selectedWalletPatient, setSelectedWalletPatient] = useState<any>(null);

  // Downloading State
  const [downloadingPaymentId, setDownloadingPaymentId] = useState<string | null>(null);
  const [downloadingRecordId, setDownloadingRecordId] = useState<string | null>(null);

  const openPaymentModal = (record: any) => {
    setSelectedRecord(record);
    setTempValue("");
    setReceiveType("Cash");
    setIsPaymentOpen(true);
  };

  const openHistoryDrawer = (record: any) => {
    setSelectedRecord(record);
    // Sort the full history by date descending
    const sortedHistory = (record.fullPaymentHistory || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistoryData(sortedHistory);
    setIsHistoryOpen(true);
  };

  const openWalletHistoryDrawer = async (patient: any) => {
    if (!patient?._id) return;
    setSelectedWalletPatient(patient);
    setIsWalletHistoryOpen(true);
    setIsWalletHistoryLoading(true);
    try {
      const res = await stores.workDoneStore.getPatientWalletHistory(patient._id);
      setWalletHistoryData(res.history || []);
    } catch (err: any) {
      toast({ title: "Error fetching wallet history", description: err?.message, status: "error", duration: 3000 });
    } finally {
      setIsWalletHistoryLoading(false);
    }
  };

  const handleSaveTotalBill = async () => {
    const newBillAmount = Number(editBillAmount);
    if (isNaN(newBillAmount) || newBillAmount < 0) return;
    setIsSavingBill(true);
    try {
      const discount = editingBillRecord.discount || 0;
      const newAmount = newBillAmount + discount;

      await stores.workDoneStore.updateTotalBillAmount(editingBillRecord._id, newAmount);

      toast({ title: "Total Bill Updated", status: "success" });
      setIsEditBillModalOpen(false);
      fetchGlobalData(page);
    } catch (err: any) {
      toast({ title: "Error Updating Bill", description: err.message, status: "error" });
    } finally {
      setIsSavingBill(false);
    }
  };

  const handleMoveToWalletClick = (record: any) => {
    if (record.balanceDue >= 0) return;
    const amountToTransfer = Math.abs(record.balanceDue);
    setSelectedWalletRecord(record);
    setWalletTransferAmount(amountToTransfer.toString());
    setIsWalletModalOpen(true);
  };

  const confirmMoveToWallet = async () => {
    if (!selectedWalletRecord) return;
    const amount = Number(walletTransferAmount);
    const maxAmount = Math.abs(selectedWalletRecord.balanceDue);

    if (isNaN(amount) || amount <= 0 || amount > maxAmount) {
      toast({ title: "Invalid amount", description: `Amount must be between 1 and ${maxAmount}`, status: "error" });
      return;
    }

    setIsTransferingWallet(true);
    try {
      await stores.workDoneStore.transferAdvanceToWallet(selectedWalletRecord._id, amount);
      toast({ title: "Advance moved to wallet", status: "success" });
      setIsWalletModalOpen(false);
      fetchGlobalData(page);
    } catch (err: any) {
      toast({ title: "Error moving to wallet", description: err.message, status: "error" });
    } finally {
      setIsTransferingWallet(false);
    }
  };

  const handleSavePayment = async () => {
    const paymentNow = Number(tempValue);
    if (isNaN(paymentNow) || paymentNow <= 0) return;
    setIsSaving(true);
    try {
      const remaining = selectedRecord.balanceDue || 0;

      // if (paymentNow > remaining) {
      //   setIsSaving(false);
      //   return toast({
      //     title: "Overpayment Error",
      //     description: `Remaining: ₹${remaining.toLocaleString()}`,
      //     status: "warning"
      //   });
      // }

      await stores.workDoneStore.addPayment({
        workDone: selectedRecord._id,
        patient: selectedRecord.patientInfo?._id || selectedRecord.patient?._id || selectedRecord.patient,
        amount: paymentNow,
        paymentMethod: receiveType,
        date: new Date()
      });

      toast({ title: "Payment Recorded", status: "success" });
      setIsPaymentOpen(false);
      fetchGlobalData(page);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const companyId = stores.auth.company || stores.auth.user?.company;
    if (companyId) {
      stores.procedureStore.getProcedures({ companyId });
    }
  }, []);

  const procedureOptions = React.useMemo(() => {
    const optionsSet = new Set<string>();
    stores.procedureStore.procedures.data.forEach((p: any) => {
      if (p.category && p.category !== "None") {
        optionsSet.add(p.category.trim());
      }
    });
    return Array.from(optionsSet).filter(Boolean).map(opt => ({ label: opt, value: opt }));
  }, [stores.procedureStore.procedures.data]);

  const fetchGlobalData = useCallback(async (currentPage: number = 1) => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 40) {
        toast({
          title: "Date Limit Exceeded",
          description: "You can only search for a maximum of 40 days at a time for the best performance.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }
    }

    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 50,
        patientIds: selectedPatients.map(p => p.id || p.value || p._id),
        doctorIds: selectedDoctors.map(d => d.id || d.value || d._id),
        fromDate,
        toDate,
        status,
        paymentMode,
        treatmentCode,
        tooth: toothNumbers.length > 0 ? toothNumbers.map(t => t.value).join("|") : undefined,
      };

      const result = await stores.workDoneStore.fetchGlobalAccountability(filters);
      if (result) {
        setData(result.records || []);
        setTotal(result.total || 0);
        setSummary(result.summary || { totalBilled: 0, totalPaid: 0, totalDue: 0, totalAdvance: 0, totalWalletReceived: 0 });
      }

      const todayResult = await stores.workDoneStore.fetchTodayGlobalAccountabilityStats(filters);
      if (todayResult) {
        setTodaySummary(todayResult || { todayBilled: 0, todayPaid: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch global accountability:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedPatients, selectedDoctors, fromDate, toDate, status, paymentMode, treatmentCode, toothNumbers]);

  useEffect(() => {
    fetchGlobalData(page);
  }, [page, fetchGlobalData]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchGlobalData(1);
  };

  const handleClearFilters = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    setFromDate(todayStr);
    setToDate(todayStr);
    setSelectedPatients([]);

    const user = stores.auth.user;
    if (user?.role === "Doctor" || user?.userType === "Doctor" || user?.userType === "doctor") {
      setSelectedDoctors([{
        _id: user._id || user.userId,
        id: user._id || user.userId,
        value: user._id || user.userId,
        label: user.username || user.name || user.firstName || "Doctor"
      }]);
    } else {
      setSelectedDoctors([]);
    }

    setStatus("all");
    setPaymentMode("all");
    setTreatmentCode("");
    setToothNumbers([]);
    setPage(1);
  };

  const handlePrintReport = async () => {
    setIsPrintModalOpen(false);
    setIsPrinting(true);
    try {
      const filters = {
        patientIds: selectedPatients.map(p => p.id || p.value || p._id),
        doctorIds: selectedDoctors.map(d => d.id || d.value || d._id),
        fromDate,
        toDate,
        status,
        paymentMode,
        treatmentCode,
        tooth: toothNumbers.length > 0 ? toothNumbers.map(t => t.value).join("|") : undefined,
        columns: selectedPrintColumns,
      };

      const base64 = await stores.workDoneStore.fetchGlobalAccountabilityReportBase64(filters);
      setPreviewData(base64);
      setPreviewFileName(`Global_Accountability_${new Date().toISOString().split("T")[0]}.pdf`);
      setIsPreviewOpen(true);
    } catch (error) {
      toast({
        title: "Error Generating Report",
        description: "Failed to generate the global accountability report.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Box p={{ base: 2, md: 4 }} minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>

      {/* Premium Header */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={{ base: 4, md: 0 }} mb={6} bgGradient="linear(to-r, blue.600, blue.800)" p={6} borderRadius="2xl" color="white" boxShadow="xl" position="relative" overflow="hidden">
        <Box position="relative" zIndex={1}>
          <HStack spacing={3}>
            <Icon as={FiActivity} boxSize={5} color="blue.200" />
            <Heading size="md" fontWeight="1000" letterSpacing="-0.5px">Global Accountability</Heading>
            <Text color="blue.100" fontSize="xs" fontWeight="500" display={{ base: "none", md: "block" }}>
              — Complete oversight of clinical treatments
            </Text>
          </HStack>
        </Box>
        <Button
          leftIcon={<FiPrinter />}
          colorScheme="whiteAlpha"
          variant="solid"
          size="sm"
          borderRadius="full"
          position="relative"
          zIndex={1}
          isLoading={isPrinting}
          onClick={() => setIsPrintModalOpen(true)}
          _hover={{ bg: "whiteAlpha.300" }}
          w={{ base: "100%", md: "auto" }}
        >
          Print Report
        </Button>
        <Box position="absolute" right="-2%" top="-50%" boxSize="150px" bg="whiteAlpha.100" borderRadius="full" />
        <Box position="absolute" right="10%" bottom="-50%" boxSize="100px" bg="blue.500" opacity={0.5} borderRadius="full" filter="blur(20px)" />
      </Flex>

      {/* Filter Section */}
      <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} mb={4}>
        <HStack mb={4} spacing={3}>
          <Box p={1.5} bg="blue.50" borderRadius="md"><Icon as={FiFilter} color="blue.500" boxSize={4} /></Box>
          <Heading size="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider">Advanced Filters</Heading>
        </HStack>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={4} alignItems="end">
          <Box>
            <CustomInput
              name="patients"
              label="Select Patients"
              type="real-time-user-search"
              placeholder="Search multiple patients"
              query={{ type: "patient" }}
              isMulti={true}
              value={selectedPatients}
              onChange={setSelectedPatients}
            />
          </Box>
          <Box display={user.userType === "doctor" ? "none" : "block"}>
            <CustomInput
              name="doctors"
              label="Select Doctors"
              type="real-time-user-search"
              placeholder="Search multiple doctors"
              query={{ type: "doctor" }}
              isMulti={true}
              value={selectedDoctors}
              onChange={setSelectedDoctors}
            />
          </Box>
          <GridItem colSpan={{ base: 1, md: 2, lg: 2, xl: 2 }}>
            <Flex direction={{ base: "column", md: "row" }} gap={4} align="end" width="100%">
              <Box flex="1" w="100%">
                <CustomInput
                  name="fromDate"
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChange={(e: any) => setFromDate(e.target.value)}
                />
              </Box>
              <Box flex="1" w="100%">
                <CustomInput
                  name="toDate"
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChange={(e: any) => setToDate(e.target.value)}
                />
              </Box>
            </Flex>
          </GridItem>
          <Box>
            <FormControl>
              <FormLabel mb={2}>
                <Box
                  bg="transparent"
                  border="2px solid"
                  borderColor={useColorModeValue("blue.600", "blue.400")}
                  px={3}
                  py={0.5}
                  borderRadius="full"
                  width="fit-content"
                >
                  <Text
                    color={useColorModeValue("black", "white")}
                    fontWeight="black"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Tooth Numbers
                  </Text>
                </Box>
              </FormLabel>
              <CreatableSelect
                isMulti
                options={[]}
                value={toothNumbers}
                onChange={(val) => setToothNumbers(val as any[])}
                placeholder="Type and press enter"
                formatCreateLabel={(inputValue) => `Add tooth "${inputValue}"`}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    background: useColorModeValue("white", "gray.800"),
                    borderRadius: "15px",
                    borderColor: state.isFocused ? "#3182ce" : useColorModeValue("#BEE3F8", "#2A4365"), // Matches brand.200
                    boxShadow: state.isFocused ? "0 0 0 1px #3182ce" : "none",
                    minHeight: "45px",
                    fontSize: "14px",
                    "&:hover": {
                      borderColor: state.isFocused ? "#3182ce" : useColorModeValue("#90CDF4", "#2C5282"), // Matches brand.300
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: useColorModeValue("#EBF8FF", "rgba(66, 153, 225, 0.2)"), // blue.50
                    borderRadius: "8px",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: useColorModeValue("#2B6CB0", "#90CDF4"), // blue.600
                    fontWeight: "bold",
                    fontSize: "12px",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: useColorModeValue("#2B6CB0", "#90CDF4"),
                    ':hover': {
                      backgroundColor: useColorModeValue("#BEE3F8", "rgba(66, 153, 225, 0.4)"), // blue.200
                      color: useColorModeValue("#2A4365", "white"),
                    },
                  }),
                }}
              />
            </FormControl>
          </Box>
          <Box>
            <CustomInput
              name="status"
              label="Status"
              type="select"
              options={[
                { label: "All", value: "all" },
                { label: "Due", value: "due" },
                { label: "Settled", value: "settled" },
                { label: "Overpaid", value: "overpaid" },
              ]}
              value={status}
              onChange={(v: any) => setStatus(v?.value || "all")}
            />
          </Box>
          <Box>
            <CustomInput
              name="paymentMode"
              label="Payment Mode"
              type="select"
              options={[
                { label: "All", value: "all" },
                { label: "Cash", value: "cash" },
                { label: "UPI", value: "upi" },
                { label: "Card", value: "card" },
                { label: "Bank Transfer", value: "bank transfer" },
              ]}
              value={paymentMode}
              onChange={(v: any) => setPaymentMode(v?.value || "all")}
            />
          </Box>
          <GridItem colSpan={{ base: 1, md: 2, lg: 3, xl: 4 }}>
            <FormControl>
              <FormLabel mb={2}>
                <Box
                  bg="transparent"
                  border="2px solid"
                  borderColor={useColorModeValue("blue.600", "blue.400")}
                  px={3}
                  py={0.5}
                  borderRadius="full"
                  width="fit-content"
                >
                  <Text
                    color={useColorModeValue("black", "white")}
                    fontWeight="black"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Treatment Code
                  </Text>
                </Box>
              </FormLabel>
              <CreatableSelect
                isClearable
                isSearchable
                options={procedureOptions}
                value={
                  typeof treatmentCode === "string" && treatmentCode
                    ? procedureOptions.find((opt) => opt.value === treatmentCode) || { label: treatmentCode, value: treatmentCode }
                    : null
                }
                onChange={(val: any) => setTreatmentCode(val?.value || "")}
                placeholder="Search or type treatment..."
                formatCreateLabel={(inputValue) => `Search for "${inputValue}"`}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    background: useColorModeValue("white", "#1A202C"),
                    borderRadius: "15px",
                    borderColor: state.isFocused ? "#3182ce" : useColorModeValue("#BEE3F8", "#2A4365"),
                    boxShadow: state.isFocused ? "0 0 0 1px #3182ce" : "none",
                    minHeight: "45px",
                    fontSize: "14px",
                    "&:hover": {
                      borderColor: state.isFocused ? "#3182ce" : useColorModeValue("#90CDF4", "#2C5282"),
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    backgroundColor: useColorModeValue("white", "#2D3748"),
                    border: useColorModeValue("1px solid #E2E8F0", "1px solid #4A5568"),
                    boxShadow: useColorModeValue("0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", "0 4px 12px rgba(0, 0, 0, 0.5)"),
                    borderRadius: "8px",
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menuList: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? useColorModeValue("#EBF8FF", "rgba(66, 153, 225, 0.2)") : "transparent",
                    color: useColorModeValue("black", "white"),
                    fontSize: "14px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: useColorModeValue("black", "white"),
                  }),
                }}
              />
            </FormControl>
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 2, lg: 3, xl: 4 }} display="flex" justifyContent="flex-end" pt={2}>
            <Flex direction={{ base: "column", md: "row" }} gap={4} w={{ base: "100%", md: "auto" }}>
              <Button
                bgGradient="linear(to-r, blue.500, blue.600)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", transform: "translateY(-1px)", boxShadow: "md" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                onClick={handleApplyFilters}
                size="md"
                px={10}
                borderRadius="xl"
                fontWeight="bold"
                w={{ base: "100%", md: "auto" }}
              >
                Apply Filters
              </Button>
              <Button
                bg={useColorModeValue("red.50", "red.900")}
                color={useColorModeValue("red.600", "red.200")}
                _hover={{ bg: useColorModeValue("red.100", "red.800") }}
                onClick={handleClearFilters}
                size="md"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                w={{ base: "100%", md: "auto" }}
              >
                Clear
              </Button>
            </Flex>
          </GridItem>
        </Grid>
      </Box>

      {/* Premium Summary Section */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={4}>
        {/* BILLED */}
        <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden">
          <HStack justify="space-between" mb={2} position="relative" zIndex={1}>
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.300")} fontWeight="900" textTransform="uppercase" letterSpacing="wide">TOTAL BILLED</Text>
              <Text fontSize="11px" color={useColorModeValue("gray.600", "gray.300")} fontWeight="800" mt={1}>* Covers patients with billing recorded on previous dates also</Text>
            </VStack>
            <Box p={1.5} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="md"><Icon as={FiFileText} color={useColorModeValue("blue.500", "blue.300")} boxSize={4} /></Box>
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color={useColorModeValue("blue.600", "blue.300")} position="relative" zIndex={1}>{formatCurrency(summary.totalBilled)}</Text>
          <Box position="absolute" bottom="-4" right="-4" opacity={0.03}><Icon as={FiFileText} boxSize={20} /></Box>
        </Box>

        {/* COMBINED PAID & WALLET */}
        <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden">
          <HStack justify="space-between" mb={2} position="relative" zIndex={1}>
            <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.300")} fontWeight="900" textTransform="uppercase" letterSpacing="wide">TOTAL RECEIVED</Text>
            <Box p={1.5} bg={useColorModeValue("green.50", "green.900")} borderRadius="md"><Icon as={FiCheckCircle} color={useColorModeValue("green.500", "green.300")} boxSize={4} /></Box>
          </HStack>
          
          <Flex direction="column" position="relative" zIndex={1}>
            <Text fontSize="2xl" fontWeight="900" color={useColorModeValue("green.600", "green.400")}>
              {formatCurrency((summary.totalPaid || 0) + (summary.totalWalletReceived || 0))}
            </Text>
            
            <Flex mt={3} gap={2} align="center" flexWrap="wrap">
              <Box bg={useColorModeValue("green.50", "rgba(72, 187, 120, 0.1)")} px={{ base: 2, md: 3 }} py={1.5} borderRadius="xl" border="1px solid" borderColor={useColorModeValue("green.200", "green.700")}>
                <HStack spacing={1.5} whiteSpace="nowrap">
                  <Text fontSize="11px" fontWeight="800" color={useColorModeValue("green.700", "green.400")} textTransform="uppercase">Txn:</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" color={useColorModeValue("green.800", "green.200")}>{formatCurrency(summary.totalPaid)}</Text>
                </HStack>
              </Box>
              
              <Text color={useColorModeValue("gray.700", "gray.200")} fontSize="2xl" fontWeight="900">+</Text>
              
              <Box bg={useColorModeValue("purple.50", "rgba(159, 122, 234, 0.1)")} px={{ base: 2, md: 3 }} py={1.5} borderRadius="xl" border="1px solid" borderColor={useColorModeValue("purple.200", "purple.700")}>
                <HStack spacing={1.5} whiteSpace="nowrap">
                  <Text fontSize="11px" fontWeight="800" color={useColorModeValue("purple.700", "purple.400")} textTransform="uppercase">Wallet:</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" color={useColorModeValue("purple.800", "purple.200")}>{formatCurrency(summary.totalWalletReceived)}</Text>
                </HStack>
              </Box>
            </Flex>
          </Flex>
          <Box position="absolute" bottom="-4" right="-4" opacity={0.03}><Icon as={FiCheckCircle} boxSize={20} /></Box>
        </Box>

        {/* DUE */}
        <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden">
          <HStack justify="space-between" mb={2} position="relative" zIndex={1}>
            <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.300")} fontWeight="900" textTransform="uppercase" letterSpacing="wide">TOTAL DUE</Text>
            <Box p={1.5} bg={useColorModeValue("red.50", "red.900")} borderRadius="md"><Icon as={FiAlertCircle} color={useColorModeValue("red.500", "red.300")} boxSize={4} /></Box>
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color={useColorModeValue("red.600", "red.400")} position="relative" zIndex={1}>{formatCurrency(summary.totalDue)}</Text>
          <Box position="absolute" bottom="-4" right="-4" opacity={0.03}><Icon as={FiAlertCircle} boxSize={20} /></Box>
        </Box>
      </Grid>

      {/* Premium Table Section */}
      <Box bg={bgCard} borderRadius="2xl" boxShadow="xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <Box overflowX="auto" pb={2}>
          <Table variant="simple" size="sm">
            <Thead bgGradient="linear(to-r, gray.800, gray.700)">
              <Tr>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="130px" whiteSpace="nowrap">BILLING DATE</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="130px" whiteSpace="nowrap">RECEIPT NO.</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="220px" whiteSpace="nowrap">PATIENT</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="150px" whiteSpace="nowrap">DOCTOR</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="130px" whiteSpace="nowrap" isNumeric>WALLET BAL.</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="140px" whiteSpace="nowrap" isNumeric>FEES</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="180px" whiteSpace="nowrap" isNumeric>TXN PAID</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="180px" whiteSpace="nowrap" isNumeric>Total Amt Rec.</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="140px" whiteSpace="nowrap">PAYMENT DATE</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="140px" whiteSpace="nowrap" isNumeric>BALANCE</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="140px" whiteSpace="nowrap">PAYMENT MODE</Th>
                <Th display="none" color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="130px" whiteSpace="nowrap">STATUS</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="90px" whiteSpace="nowrap">TOOTH</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="180px" whiteSpace="nowrap">TREATMENT CODE</Th>
                <Th color="white" fontSize="11px" fontWeight="900" letterSpacing="widest" py={3} borderBottom="none" minW="200px" whiteSpace="nowrap">TREATMENT</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Tr key={i}>
                    <Td colSpan={14}><Skeleton height="40px" borderRadius="lg" /></Td>
                  </Tr>
                ))
              ) : data.length === 0 ? (
                <Tr>
                  <Td colSpan={14} textAlign="center" py={16}>
                    <VStack spacing={3} opacity={0.5}>
                      <Icon as={FiAlertCircle} boxSize={10} color={useColorModeValue("gray.400", "gray.600")} />
                      <Text color={useColorModeValue("gray.500", "gray.400")} fontWeight="bold">No records found matching your filters.</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                data.map((row: any) => (
                  <Tr key={row.uniqueRowId || row._id} _hover={{ bg: useColorModeValue("blue.50", "blue.900") }} transition="all 0.2s">
                    <Td>
                      <HStack>
                        <Icon as={FiCalendar} color={useColorModeValue("gray.400", "gray.500")} />
                        <Text fontSize="sm" fontWeight="700" color={useColorModeValue("gray.600", "gray.300")}>{new Date(row.createdAt).toLocaleDateString("en-GB")}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        {(() => {
                          let receiptNumbers: string[] = [];
                          if (Array.isArray(row.paymentHistory) && row.paymentHistory.length > 0) {
                            receiptNumbers = Array.from(new Set(row.paymentHistory.map((p: any) => p.receiptNumber).filter(Boolean))) as string[];
                          } else if (row.paymentHistory?.receiptNumber) {
                            receiptNumbers = [row.paymentHistory.receiptNumber];
                          }
                          const displayStr = receiptNumbers.length > 0 ? (receiptNumbers[0] + (receiptNumbers.length > 1 ? "..." : "")) : "-";
                          const fullStr = receiptNumbers.length > 0 ? receiptNumbers.join(", ") : "-";
                          const hasMultiple = receiptNumbers.length > 1;

                          return (
                            <Tooltip
                              label={fullStr}
                              isDisabled={!hasMultiple}
                              placement="top"
                              hasArrow
                              bg={useColorModeValue("blue.600", "blue.400")}
                              color={useColorModeValue("white", "gray.900")}
                              borderRadius="md"
                              p={2}
                            >
                              <Text
                                fontSize="sm"
                                fontWeight="800"
                                color={receiptNumbers.length > 0 ? useColorModeValue("blue.600", "blue.300") : useColorModeValue("gray.400", "gray.600")}
                                cursor={hasMultiple ? "help" : "default"}
                              >
                                {displayStr}
                              </Text>
                            </Tooltip>
                          );
                        })()}
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={row.patientInfo?.name || "Unknown"} bg="blue.500" color="white" />
                        <Box>
                          <HStack spacing={2}>
                            <Text fontWeight="800" fontSize="sm" color={useColorModeValue("gray.800", "white")}>{row.patientInfo?.name || "Unknown"}</Text>
                          </HStack>
                          {row.patientInfo?.code && <Text fontSize="10px" fontWeight="bold" color={useColorModeValue("gray.400", "gray.500")}>{row.patientInfo.code}</Text>}
                        </Box>
                      </HStack>
                    </Td>

                    <Td>
                      <HStack>
                        <Icon as={FiUser} color={useColorModeValue("gray.400", "gray.500")} />
                        <Text fontSize="sm" fontWeight="700" color={useColorModeValue("gray.700", "gray.200")}>{row.doctorInfo?.name || "Unknown"}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="900" color={useColorModeValue("purple.600", "purple.300")} fontSize="sm">
                        {formatCurrency(row.patientInfo?.walletBalance || 0)}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2} minW="130px">
                        <Box px={3} py={1} bg={useColorModeValue("yellow.50", "yellow.900")} borderRadius="xl" display="inline-flex" alignItems="center" border="1px solid" borderColor={useColorModeValue("yellow.200", "yellow.700")} justifyContent="center">
                          <VStack spacing={0} align="end">
                            <Text fontWeight="900" color={useColorModeValue("yellow.800", "yellow.200")} fontSize="sm" whiteSpace="nowrap">
                              {formatCurrency(row.amount - (row.discount || 0))}
                            </Text>
                            {row.discount > 0 && (
                              <Text fontSize="2xs" color={useColorModeValue("gray.400", "gray.500")} textDecoration="line-through">
                                {formatCurrency(row.amount)}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                        {stores.auth.hasPermission('accountability', 'edit') && (
                          <Tooltip label="Edit Bill Amount" hasArrow>
                            <IconButton
                              aria-label="Edit Bill"
                              icon={<FiEdit2 />}
                              size="xs"
                              colorScheme="yellow"
                              variant="ghost"
                              onClick={() => {
                                setEditingBillRecord(row);
                                setEditBillAmount((row.amount - (row.discount || 0)).toString());
                                setIsEditBillModalOpen(true);
                              }}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2}>
                        <HStack spacing={2} p={2} bg={useColorModeValue("green.50", "green.900")} borderRadius="2xl" border="1px dashed" borderColor={useColorModeValue("green.200", "green.700")} minW="130px" maxW="max-content">
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" fontWeight="bold" color={useColorModeValue("green.600", "green.300")} opacity={0.7}>TXN PAID</Text>
                            <Text fontSize="md" fontWeight="1000" color={useColorModeValue("green.700", "green.200")} whiteSpace="nowrap">{formatCurrency(row.totalPaid)}</Text>
                          </VStack>
                          {stores.auth.hasPermission('accountability', 'create') && (
                            <Tooltip label="Add Payment" hasArrow>
                              <IconButton
                                aria-label="Add Payment"
                                icon={<FiPlusCircle />}
                                size="sm"
                                colorScheme="blue"
                                variant="solid"
                                borderRadius="lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPaymentModal(row);
                                }}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </HStack>
                    </Td>

                    <Td isNumeric>
                      <HStack justify="flex-end">
                        <HStack px={3} py={1.5} bg={useColorModeValue("green.50", "green.900")} borderRadius="xl" border="1px dashed" borderColor={useColorModeValue("green.200", "green.700")} minW="100px" maxW="max-content" spacing={2}>
                          <Text color={useColorModeValue("green.700", "green.200")} fontWeight="1000" fontSize="md" letterSpacing="-0.5px" whiteSpace="nowrap" textAlign="center" flex={1}>
                            {formatCurrency(Math.max(0, (row.amount - (row.discount || 0)) - row.balanceDue))}
                          </Text>
                          {stores.auth.hasPermission('accountability', 'view') && (
                            <Tooltip label="Transaction History" hasArrow>
                              <IconButton
                                aria-label="Transaction History"
                                icon={<FiEye />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                borderRadius="full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openHistoryDrawer(row);
                                }}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontWeight="800" color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
                        {Array.isArray(row.paymentHistory) && row.paymentHistory.length > 0
                          ? new Date(row.paymentHistory[row.paymentHistory.length - 1].date).toLocaleDateString("en-GB")
                          : (row.paymentHistory && row.paymentHistory.date ? new Date(row.paymentHistory.date).toLocaleDateString("en-GB") : "-")}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end">
                        <Box
                          px={4}
                          py={1.5}
                          bg={row.balanceDue > 0 ? useColorModeValue("red.50", "red.900") : row.balanceDue < 0 ? useColorModeValue("purple.50", "purple.900") : useColorModeValue("green.50", "green.900")}
                          borderRadius="xl"
                          border="1px dashed"
                          borderColor={row.balanceDue > 0 ? useColorModeValue("red.200", "red.700") : row.balanceDue < 0 ? useColorModeValue("purple.200", "purple.700") : useColorModeValue("green.200", "green.700")}
                          minW="110px"
                          maxW="max-content"
                          textAlign="center"
                        >
                          <VStack spacing={0} align="end">
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color={row.balanceDue > 0 ? useColorModeValue("red.600", "red.300") : row.balanceDue < 0 ? useColorModeValue("purple.600", "purple.300") : useColorModeValue("green.600", "green.300")}
                              opacity={0.8}
                            >
                              {row.balanceDue > 0 ? "DUE" : row.balanceDue < 0 ? "ADVANCE" : "SETTLED"}
                            </Text>
                            <Text
                              color={row.balanceDue > 0 ? useColorModeValue("red.600", "red.300") : row.balanceDue < 0 ? useColorModeValue("purple.600", "purple.300") : useColorModeValue("green.700", "green.200")}
                              fontWeight="1000"
                              fontSize="md"
                              letterSpacing="-0.5px"
                              whiteSpace="nowrap"
                            >
                              {formatCurrency(Math.abs(row.balanceDue))}
                            </Text>
                          </VStack>
                        </Box>
                        {row.balanceDue < 0 && stores.auth.hasPermission('accountability', 'edit') && (
                          <Tooltip label="Move Advance to Wallet" hasArrow>
                            <IconButton
                              aria-label="Move to Wallet"
                              icon={<FiPlusCircle />}
                              size="sm"
                              colorScheme="purple"
                              variant="solid"
                              borderRadius="full"
                              isLoading={isTransferingWallet && selectedWalletRecord?._id === row._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToWalletClick(row);
                              }}
                            />
                          </Tooltip>
                        )}
                        {row.patientInfo?.walletBalance > 0 && (
                          <Tooltip label="View Wallet History" hasArrow bg="purple.600">
                            <IconButton
                              aria-label="Wallet History"
                              icon={<FiCreditCard />}
                              size="sm"
                              colorScheme="purple"
                              variant="ghost"
                              borderRadius="full"
                              onClick={(e) => {
                                e.stopPropagation();
                                openWalletHistoryDrawer(row.patientInfo);
                              }}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      {(() => {
                        const history = Array.isArray(row.paymentHistory) ? row.paymentHistory : (row.paymentHistory ? [row.paymentHistory] : []);
                        if (history.length === 0 || !history[history.length - 1].paymentMethod) return <Text color="gray.400" fontSize="sm" fontWeight="bold">-</Text>;
                        const mode = String(history[history.length - 1].paymentMethod).toUpperCase();
                        return (
                          <Badge variant="subtle" colorScheme={mode === 'CASH' ? 'green' : 'blue'} fontSize="10px" borderRadius="md" px={2.5} py={1} border="1px solid" borderColor={mode === 'CASH' ? 'green.200' : 'blue.200'}>
                            {mode}
                          </Badge>
                        );
                      })()}
                    </Td>
                    <Td display="none">
                      <HStack justify="flex-start">
                        <Badge
                          colorScheme={row.balanceDue < 0 ? "purple" : row.balanceDue === 0 ? "green" : "red"}
                          variant={row.balanceDue <= 0 ? "subtle" : "solid"}
                          borderRadius="full"
                          px={3.5}
                          py={1}
                          fontSize="10px"
                          fontWeight="900"
                          textTransform="uppercase"
                          letterSpacing="0.5px"
                          boxShadow={row.balanceDue > 0 ? "0 2px 5px rgba(229, 62, 62, 0.3)" : "none"}
                        >
                          {row.balanceDue < 0 ? "OVERPAID" : row.balanceDue === 0 ? "SETTLED" : "DUE"}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>
                      {row.tooth ? <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="lg">{row.tooth}</Badge> : <Text color={useColorModeValue("gray.400", "gray.500")}>-</Text>}
                    </Td>
                    <Td>
                      <Tooltip label={row.treatmentCode || ""} placement="top" hasArrow bg={useColorModeValue("blue.600", "blue.400")} color={useColorModeValue("white", "gray.900")} borderRadius="md" p={2}>
                        <Text fontSize="sm" fontWeight="700" color={useColorModeValue("gray.700", "gray.200")} noOfLines={1} maxW="180px">
                          {row.treatmentCode || "-"}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label={row.treatmentInfo?.name || row.workDoneNote || ""} placement="top" hasArrow bg={useColorModeValue("blue.600", "blue.400")} color={useColorModeValue("white", "gray.900")} borderRadius="md" p={2}>
                        <Text noOfLines={2} maxW="200px" fontSize="sm" fontWeight="600" color={useColorModeValue("gray.600", "gray.300")}>
                          {row.treatmentInfo?.name || row.workDoneNote || "-"}
                        </Text>
                      </Tooltip>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Pagination */}
      {total > 0 && (
        <Flex justify="center" mt={6}>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / 50)}
            onPageChange={setPage}
          />
        </Flex>
      )}

      {/* Modals for Global Accountability */}
      <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontSize="lg" fontWeight="bold">Customize Print Report</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Text fontSize="sm" color="gray.500" mb={4}>Select the columns you want to include in the PDF report:</Text>
            <CheckboxGroup colorScheme="blue" value={selectedPrintColumns} onChange={(val) => setSelectedPrintColumns(val as string[])}>
              <SimpleGrid columns={2} spacing={3}>
                {ALL_PRINT_COLUMNS.map((col) => (
                  <Checkbox key={col.key} value={col.key} fontWeight="bold" color="gray.700">
                    {col.label}
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50" borderBottomRadius="2xl">
            <Button variant="ghost" mr={3} onClick={() => setIsPrintModalOpen(false)} borderRadius="xl">Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handlePrintReport}
              isLoading={isPrinting}
              borderRadius="xl"
              px={6}
              leftIcon={<FiPrinter />}
            >
              Generate PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isEditBillModalOpen} onClose={() => setIsEditBillModalOpen(false)} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontSize="md" fontWeight="bold">Modify Bill Amount</Text>
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

      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="3xl" shadow="2xl" overflow="hidden">
          <ModalHeader bgGradient="linear(to-r, blue.500, blue.700)" color="white" py={6}>
            <HStack justify="space-between">
              <Text fontSize="2xl" fontWeight="1000">Receive Amount</Text>
              {selectedRecord?.patientInfo?.walletBalance > 0 && (
                <Badge colorScheme="purple" p={2} borderRadius="xl" fontSize="xs">
                  Wallet: ₹{selectedRecord.patientInfo.walletBalance}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={4} right={4} />
          <ModalBody py={8} px={6}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={2} spacing={4}>
                <Box p={4} bg="green.50" borderRadius="2xl" border="1px dashed" borderColor="green.200">
                  <Text fontSize="sm" fontWeight="bold" color="green.600" mb={1}>TOTAL RECEIVED</Text>
                  <Text fontSize="2xl" fontWeight="black" color="green.700" letterSpacing="-1px">
                    ₹{Math.max(0, (selectedRecord?.amount - (selectedRecord?.discount || 0)) - (selectedRecord?.balanceDue || 0)).toLocaleString()}
                  </Text>
                </Box>
                <Box p={4} bg="blue.50" borderRadius="2xl" border="1px dashed" borderColor="blue.200">
                  <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={1}>BALANCE DUE</Text>
                  <Text fontSize="2xl" fontWeight="black" color="blue.700" letterSpacing="-1px">
                    ₹{Math.max(0, selectedRecord?.balanceDue || 0).toLocaleString()}
                  </Text>
                </Box>
              </SimpleGrid>
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
                <Box as="select" p={3} w="full" h="60px" borderRadius="2xl" fontWeight="800" bg="white" borderWidth="2px" value={receiveType} onChange={(e: any) => setReceiveType(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  {selectedRecord?.patientInfo?.walletBalance > 0 && (
                    <option value="Wallet">Wallet (Bal: ₹{selectedRecord.patientInfo.walletBalance})</option>
                  )}
                  <option value="Other">Other</option>
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.100" p={6}>
            <Button variant="ghost" mr={3} onClick={() => setIsPaymentOpen(false)} borderRadius="xl" fontWeight="bold">Cancel</Button>
            {stores.auth.hasPermission('accountability', 'create') && (
              <Button colorScheme="blue" onClick={handleSavePayment} isLoading={isSaving} leftIcon={<FiCheckCircle />} borderRadius="xl" px={8} size="lg" w="full" shadow="md">
                Confirm Entry
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Drawer isOpen={isHistoryOpen} placement="right" onClose={() => setIsHistoryOpen(false)} size="sm">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderLeftRadius="3xl" bg="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.100">
            <Text fontWeight="1000" fontSize="xl" color="blue.600">Transaction History</Text>
          </DrawerHeader>
          <DrawerBody py={6}>
            {historyData.length > 0 ? (
              <VStack align="stretch" spacing={3}>
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
                        size="xs" colorScheme="blue" leftIcon={downloadingRecordId === selectedRecord?._id ? undefined : <FiEye />}
                        isLoading={downloadingRecordId === selectedRecord?._id}
                        onClick={async () => {
                          try {
                            setDownloadingRecordId(selectedRecord._id);
                            const base64 = await stores.workDoneStore.fetchSingleRecordReportBase64(selectedRecord._id);
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
                        <Text fontWeight="1000" color="green.700" fontSize="md">
                          ₹{Math.max(0, (selectedRecord?.amount - (selectedRecord?.discount || 0)) - (selectedRecord?.balanceDue || 0)).toLocaleString()}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" color="orange.600">BALANCE DUE</Text>
                        <Text fontWeight="1000" color="orange.700" fontSize="md">
                          ₹{(selectedRecord?.balanceDue || 0).toLocaleString()}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
                {historyData.map((h: any, i: number) => (
                  <HStack key={i} justify="space-between" p={4} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="800" color="gray.700">Payment Entry {historyData.length - i}</Text>
                      <Text fontSize="xs" color="gray.400">{new Date(h.date).toLocaleDateString('en-IN')} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </VStack>
                    <HStack>
                      <VStack align="end" spacing={0}>
                        <Text fontWeight="1000" color="green.700" fontSize="lg">₹{h.amount.toLocaleString()}</Text>
                        <Badge size="sm" colorScheme={h.paymentMethod === 'Cash' ? 'green' : 'blue'} variant="solid" fontSize="9px" borderRadius="lg" px={2}>
                          {(h.paymentMethod || "CASH").toUpperCase()}
                        </Badge>
                      </VStack>
                      {stores.auth.hasPermission('accountability', 'download') && (
                        <IconButton aria-label="View Entry Receipt" icon={downloadingPaymentId === `${selectedRecord?._id}-${i}` ? <Spinner size="xs" /> : <FiEye />} size="sm" colorScheme="green" variant="ghost" borderRadius="full" isDisabled={downloadingPaymentId !== null}
                          onClick={async () => {
                            try {
                              setDownloadingPaymentId(`${selectedRecord._id}-${h._id}`);
                              const base64 = await stores.workDoneStore.fetchPaymentReceiptBase64(selectedRecord._id, h._id);
                              setPreviewData(base64);
                              setPreviewFileName(`Receipt_${selectedRecord._id}_${h._id}.pdf`);
                              setIsPreviewOpen(true);
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to load preview.", status: "error", duration: 3000 });
                            } finally {
                              setDownloadingPaymentId(null);
                            }
                          }}
                        />
                      )}
                      {stores.auth.hasPermission('accountability', 'edit') && new Date(h.date).toLocaleDateString("en-GB") === new Date().toLocaleDateString("en-GB") && (
                        <IconButton aria-label="Edit Amount" icon={<FiEdit2 />} size="sm" colorScheme="orange" variant="ghost" borderRadius="full"
                          onClick={() => {
                            setEditingPaymentIndex(i);
                            setEditAmount(String(h.amount));
                            setIsEditAmountOpen(true);
                          }}
                        />
                      )}
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <VStack py={20} color="gray.400">
                <Icon as={FiAlertCircle} boxSize={12} mb={4} opacity={0.3} />
                <Text fontWeight="bold">No payment entries found.</Text>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

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
                <Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="Enter new amount" borderRadius="xl" size="lg" focusBorderColor="orange.400" />
              </FormControl>
              {stores.auth.hasPermission('accountability', 'edit') && (
                <Button colorScheme="orange" size="lg" borderRadius="xl" isLoading={isSavingAmount} leftIcon={<FiCheckCircle />}
                  onClick={async () => {
                    if (editingPaymentIndex === null || !selectedRecord) return;
                    const newAmt = Number(editAmount);
                    if (isNaN(newAmt) || newAmt < 0) return toast({ title: "Invalid amount", status: "error", duration: 2000 });

                    const updatedHistoryTest = historyData.map((p: any, idx: number) => idx === editingPaymentIndex ? { ...p, amount: newAmt } : p);
                    const proposedTotalReceived = updatedHistoryTest.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                    const bill = selectedRecord.amount - (selectedRecord.discount || 0);

                    // if (proposedTotalReceived > bill) {
                    //   return toast({ title: "Overpayment Error", description: `Total payments (₹${proposedTotalReceived.toLocaleString()}) cannot exceed total bill (₹${bill.toLocaleString()}).`, status: "warning", duration: 3000 });
                    // }

                    setIsSavingAmount(true);
                    try {
                      const paymentToEdit = historyData[editingPaymentIndex];
                      await stores.workDoneStore.updatePayment(paymentToEdit._id, { amount: newAmt });

                      setHistoryData(updatedHistoryTest);
                      setIsEditAmountOpen(false);
                      toast({ title: "Amount updated successfully!", status: "success", duration: 2000 });
                      fetchGlobalData(page);
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

      <ReceiptPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewData(null);
        }}
        pdfBase64={previewData}
        fileName={previewFileName}
      />
      <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="3xl" shadow="2xl" overflow="hidden" bg="white">
          <Box bgGradient="linear(to-br, purple.500, purple.700)" px={6} py={8} position="relative" overflow="hidden">
            <Box position="absolute" top="-20%" right="-10%" opacity={0.1}>
              <Icon as={FiCreditCard} boxSize="150px" color="white" transform="rotate(-15deg)" />
            </Box>
            <VStack align="start" spacing={2} position="relative" zIndex={10}>
              <Text fontSize="2xl" fontWeight="1000" color="white" letterSpacing="tight">Transfer to Wallet</Text>
              <Text fontSize="sm" color="purple.100" fontWeight="600">Move excess advance amount directly to the patient's wallet.</Text>
            </VStack>
            <ModalCloseButton color="white" top={4} right={4} bg="whiteAlpha.200" borderRadius="full" _hover={{ bg: "whiteAlpha.300" }} />
          </Box>
          <ModalBody py={8} px={6}>
            <VStack spacing={8}>
              <Box bg="purple.50" p={5} borderRadius="2xl" w="full" border="2px dashed" borderColor="purple.200" position="relative">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="purple.600" fontWeight="800" textTransform="uppercase" letterSpacing="wider">Available Advance</Text>
                    <Text fontSize="2xl" color="purple.800" fontWeight="900">
                      ₹{selectedWalletRecord ? formatCurrency(Math.abs(selectedWalletRecord.balanceDue)).replace('₹','') : 0}
                    </Text>
                  </VStack>
                  <Center w="48px" h="48px" bg="purple.100" borderRadius="xl" color="purple.600">
                    <Icon as={FiArrowDownLeft} boxSize={6} />
                  </Center>
                </HStack>
              </Box>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="900" color="gray.600" mb={3}>TRANSFER AMOUNT</FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color="purple.500" h="full" px={4} fontSize="xl" fontWeight="900">₹</InputLeftElement>
                  <Input
                    type="number"
                    value={walletTransferAmount}
                    onChange={(e) => setWalletTransferAmount(e.target.value)}
                    h="70px"
                    pl={12}
                    borderRadius="2xl"
                    fontWeight="900"
                    fontSize="2xl"
                    color="gray.800"
                    bg="gray.50"
                    borderWidth="2px"
                    borderColor="gray.200"
                    _focus={{ borderColor: "purple.500", bg: "white", shadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    max={selectedWalletRecord ? Math.abs(selectedWalletRecord.balanceDue) : 0}
                  />
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" py={6} px={6} borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={() => setIsWalletModalOpen(false)} borderRadius="xl" fontWeight="bold" size="lg">Cancel</Button>
            <Button colorScheme="purple" borderRadius="xl" px={8} py={6} fontSize="lg" fontWeight="bold" isLoading={isTransferingWallet} onClick={confirmMoveToWallet} shadow="xl" _hover={{ shadow: '2xl', transform: 'translateY(-2px)' }} transition="all 0.2s">Transfer Now</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <WalletHistoryDrawer
        isOpen={isWalletHistoryOpen}
        onClose={() => setIsWalletHistoryOpen(false)}
        patient={selectedWalletPatient}
      />

    </Box>
  );
});

export default GlobalAccountabilityPage;

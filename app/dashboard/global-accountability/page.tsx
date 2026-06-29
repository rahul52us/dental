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
  DrawerCloseButton
} from "@chakra-ui/react";
import { FiActivity, FiFilter, FiFileText, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiDollarSign, FiPrinter, FiEdit2, FiList, FiEye, FiPlusCircle } from "react-icons/fi";
import React, { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import Pagination from "../../component/common/pagination/Pagination";
import { formatCurrency } from "../../config/utils/utils";
import CreatableSelect from "react-select/creatable";
import { FormControl, FormLabel } from "@chakra-ui/react";
import ReceiptPreviewDrawer from "../patients/component/patient/ReceiptPreviewDrawer";

const ALL_PRINT_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "patient", label: "Patient" },
  { key: "tooth", label: "Tooth" },
  { key: "treatmentCode", label: "Treatment Code" },
  { key: "treatment", label: "Treatment" },
  { key: "doctor", label: "Doctor" },
  { key: "fees", label: "Fees" },
  { key: "paid", label: "Paid" },
  { key: "due", label: "Due" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "status", label: "Status" }
];

const GlobalAccountabilityPage = observer(() => {
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalBilled: 0, totalPaid: 0, totalDue: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedPatients, setSelectedPatients] = useState<any[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<any[]>([]);
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
    setHistoryData([...(record.paymentHistory || [])].reverse());
    setIsHistoryOpen(true);
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

  const handleSavePayment = async () => {
    const paymentNow = Number(tempValue);
    if (isNaN(paymentNow) || paymentNow <= 0) return;
    setIsSaving(true);
    try {
      const bill = selectedRecord.amount - (selectedRecord.discount || 0);
      const alreadyPaid = selectedRecord.totalPaid || 0;
      const remaining = Math.max(0, bill - alreadyPaid);

      if (paymentNow > remaining) {
        setIsSaving(false);
        return toast({
          title: "Overpayment Error",
          description: `Remaining: ₹${remaining.toLocaleString()}`,
          status: "warning"
        });
      }

      await stores.workDoneStore.updateWorkDone(selectedRecord._id, {
        paymentAmount: paymentNow,
        paymentMethod: receiveType,
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
      const parts = [];
      if (p.category && p.category !== "None") {
        const cat = p.category.trim();
        parts.push(cat);
        optionsSet.add(parts.join(" · "));
        optionsSet.add(cat);
      }
      if (p.subcategory && p.subcategory !== "None") {
        const sub = p.subcategory.trim();
        parts.push(sub);
        optionsSet.add(parts.join(" · "));
        optionsSet.add(sub);
      }
      if (p.name && p.name !== "None") {
        const n1 = p.name.trim();
        parts.push(n1);
        optionsSet.add(parts.join(" · "));
        optionsSet.add(n1);
      }
      if (p.name2 && p.name2 !== "None") {
        const n2 = p.name2.trim();
        parts.push(n2);
        optionsSet.add(parts.join(" · "));
        optionsSet.add(n2);
      }
      if (p.name3 && p.name3 !== "None") {
        const n3 = p.name3.trim();
        parts.push(n3);
        optionsSet.add(parts.join(" · "));
        optionsSet.add(n3);
      }
    });
    return Array.from(optionsSet).filter(Boolean).map(opt => ({ label: opt, value: opt }));
  }, [stores.procedureStore.procedures.data]);

  const fetchGlobalData = useCallback(async (currentPage: number = 1) => {
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
        setSummary(result.summary || { totalBilled: 0, totalPaid: 0, totalDue: 0 });
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
    setSelectedDoctors([]);
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
      <HStack mb={4} bgGradient="linear(to-r, blue.600, blue.800)" p={4} px={6} borderRadius="2xl" color="white" boxShadow="md" position="relative" overflow="hidden" justify="space-between">
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
        >
          Print Report
        </Button>
        <Box position="absolute" right="-2%" top="-50%" boxSize="150px" bg="whiteAlpha.100" borderRadius="full" />
        <Box position="absolute" right="10%" bottom="-50%" boxSize="100px" bg="blue.500" opacity={0.5} borderRadius="full" filter="blur(20px)" />
      </HStack>

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
          <Box>
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
            <HStack spacing={4} align="end" width="100%">
              <Box flex="1">
                <CustomInput
                  name="fromDate"
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChange={(e: any) => setFromDate(e.target.value)}
                />
              </Box>
              <Box flex="1">
                <CustomInput
                  name="toDate"
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChange={(e: any) => setToDate(e.target.value)}
                />
              </Box>
            </HStack>
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
            <HStack spacing={4}>
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
              >
                Clear
              </Button>
            </HStack>
          </GridItem>
        </Grid>
      </Box>

      {/* Premium Summary Section */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={4}>
        {/* BILLED */}
        <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden">
          <HStack justify="space-between" mb={2} position="relative" zIndex={1}>
            <Text fontSize="10px" color="gray.500" fontWeight="900" letterSpacing="widest">TOTAL BILLED</Text>
            <Box p={1.5} bg="blue.50" borderRadius="md"><Icon as={FiFileText} color="blue.500" boxSize={4} /></Box>
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color="blue.600" position="relative" zIndex={1}>{formatCurrency(summary.totalBilled)}</Text>
          <Box position="absolute" bottom="-4" right="-4" opacity={0.03}><Icon as={FiFileText} boxSize={20} /></Box>
        </Box>

        {/* PAID */}
        <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden">
          <HStack justify="space-between" mb={2} position="relative" zIndex={1}>
            <Text fontSize="10px" color="gray.500" fontWeight="900" letterSpacing="widest">TOTAL RECEIVED</Text>
            <Box p={1.5} bg="green.50" borderRadius="md"><Icon as={FiCheckCircle} color="green.500" boxSize={4} /></Box>
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color="green.500" position="relative" zIndex={1}>{formatCurrency(summary.totalPaid)}</Text>
          <Box position="absolute" bottom="-4" right="-4" opacity={0.03}><Icon as={FiCheckCircle} boxSize={20} /></Box>
        </Box>

        {/* DUE */}
        <Box bg={bgCard} p={4} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} position="relative" overflow="hidden">
          <HStack justify="space-between" mb={2} position="relative" zIndex={1}>
            <Text fontSize="10px" color="gray.500" fontWeight="900" letterSpacing="widest">PENDING BALANCE</Text>
            <Box p={1.5} bg="red.50" borderRadius="md"><Icon as={FiAlertCircle} color="red.500" boxSize={4} /></Box>
          </HStack>
          <Text fontSize="2xl" fontWeight="900" color="red.500" position="relative" zIndex={1}>{formatCurrency(summary.totalDue)}</Text>
          <Box position="absolute" bottom="-4" right="-4" opacity={0.03}><Icon as={FiAlertCircle} boxSize={20} /></Box>
        </Box>
      </Grid>

      {/* Premium Table Section */}
      <Box bg={bgCard} borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th fontSize="10px" fontWeight="900" color="gray.500" py={5}>DATE</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">PATIENT</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">TOOTH</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">TREATMENT CODE</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">TREATMENT</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">DOCTOR</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500" isNumeric>FEES</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500" isNumeric>PAID</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500" isNumeric>DUE</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">PAYMENT MODE</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">STATUS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Tr key={i}>
                    <Td colSpan={11}><Skeleton height="40px" borderRadius="lg" /></Td>
                  </Tr>
                ))
              ) : data.length === 0 ? (
                <Tr>
                  <Td colSpan={11} textAlign="center" py={16}>
                    <VStack spacing={3} opacity={0.5}>
                      <Icon as={FiAlertCircle} boxSize={10} color="gray.400" />
                      <Text color="gray.500" fontWeight="bold">No records found matching your filters.</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                data.map((row: any) => (
                  <Tr key={row._id} _hover={{ bg: useColorModeValue("blue.50", "blue.900") }} transition="all 0.2s">
                    <Td>
                      <HStack>
                        <Icon as={FiCalendar} color="gray.400" />
                        <Text fontSize="sm" fontWeight="700" color="gray.600">{new Date(row.createdAt).toLocaleDateString("en-GB")}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={row.patientInfo?.name || "Unknown"} bg="blue.500" color="white" />
                        <Box>
                          <Text fontWeight="800" fontSize="sm">{row.patientInfo?.name || "Unknown"}</Text>
                          {row.patientInfo?.code && <Text fontSize="10px" fontWeight="bold" color="gray.400">{row.patientInfo.code}</Text>}
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      {row.tooth ? <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="lg">{row.tooth}</Badge> : <Text color="gray.400">-</Text>}
                    </Td>
                    <Td>
                      <Tooltip label={row.treatmentCode || ""} placement="top" hasArrow bg="blue.600" color="white" borderRadius="md" p={2}>
                        <Text fontSize="sm" fontWeight="700" color="gray.700" noOfLines={1} maxW="180px">
                          {row.treatmentCode || "-"}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Text noOfLines={2} maxW="200px" fontSize="sm" fontWeight="600" color="gray.600">
                        {row.treatmentInfo?.name || row.workDoneNote || "-"}
                      </Text>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiUser} color="gray.400" />
                        <Text fontSize="sm" fontWeight="700">{row.doctorInfo?.name || "Unknown"}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end" spacing={2} minW="130px">
                        <Box px={3} py={1} bg="yellow.50" borderRadius="xl" display="inline-flex" alignItems="center" border="1px solid" borderColor="yellow.200" justifyContent="center">
                          <VStack spacing={0} align="end">
                            <Text fontWeight="900" color="yellow.800" fontSize="sm" whiteSpace="nowrap">
                              {formatCurrency(row.amount - (row.discount || 0))}
                            </Text>
                            {row.discount > 0 && (
                              <Text fontSize="2xs" color="gray.400" textDecoration="line-through">
                                {formatCurrency(row.amount)}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                        {stores.auth.hasPermission('workdone', 'edit') && (
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
                        <HStack spacing={2} p={2} bg="green.50" borderRadius="2xl" border="1px dashed" borderColor="green.200" minW="130px" maxW="max-content">
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" fontWeight="bold" color="green.600" opacity={0.7}>TOTAL PAID</Text>
                            <Text fontSize="md" fontWeight="1000" color="green.700" whiteSpace="nowrap">{formatCurrency(row.totalPaid)}</Text>
                          </VStack>
                          {stores.auth.hasPermission('workdone', 'edit') && (
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
                        {stores.auth.hasPermission('accountability', 'view') && (
                          <Tooltip label="Transaction History" hasArrow>
                            <IconButton
                              aria-label="Transaction History"
                              icon={<FiEye />}
                              size="sm"
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
                    </Td>
                    <Td isNumeric>
                      <HStack justify="flex-end">
                        <Box px={4} py={1.5} bg={row.balanceDue > 0 ? "red.50" : "gray.50"} borderRadius="xl" border="1px dashed" borderColor={row.balanceDue > 0 ? "red.200" : "gray.200"} minW="100px" maxW="max-content" textAlign="center">
                          <Text color={row.balanceDue > 0 ? "red.600" : "gray.500"} fontWeight="1000" fontSize="md" letterSpacing="-0.5px" whiteSpace="nowrap">
                            {formatCurrency(row.balanceDue)}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      {(() => {
                        const modes = Array.from(new Set((row.paymentHistory || []).map((h: any) => h.paymentMethod).filter(Boolean)));
                        if (modes.length === 0) return <Text color="gray.400" fontSize="sm" fontWeight="bold">-</Text>;
                        const firstMode = String(modes[0]).toUpperCase();
                        return (
                          <Tooltip label={modes.map(m => String(m).toUpperCase()).join(", ")} hasArrow bg="blue.600" color="white" placement="top" borderRadius="md">
                            <Box cursor="help" display="inline-block">
                              <Badge variant="subtle" colorScheme={firstMode === 'CASH' ? 'green' : 'blue'} fontSize="10px" borderRadius="md" px={2.5} py={1} border="1px solid" borderColor={firstMode === 'CASH' ? 'green.200' : 'blue.200'}>
                                {modes.length === 1 ? firstMode : `${firstMode} +${modes.length - 1}`}
                              </Badge>
                            </Box>
                          </Tooltip>
                        );
                      })()}
                    </Td>
                    <Td>
                      <HStack justify="flex-start">
                        <Badge
                          colorScheme={row.balanceDue <= 0 ? "green" : "red"}
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
                          {row.balanceDue <= 0 ? "SETTLED" : "DUE"}
                        </Badge>
                      </HStack>
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
            <Text fontSize="2xl" fontWeight="1000">Receive Amount</Text>
          </ModalHeader>
          <ModalCloseButton color="white" top={4} right={4} />
          <ModalBody py={8} px={6}>
            <VStack spacing={6} align="stretch">
              <Box p={4} bg="blue.50" borderRadius="2xl" border="1px dashed" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={1}>OUTSTANDING BALANCE</Text>
                <Text fontSize="3xl" fontWeight="black" color="blue.700" letterSpacing="-1px">
                  ₹{((selectedRecord?.amount - (selectedRecord?.discount || 0)) - (selectedRecord?.totalPaid || 0)).toLocaleString()}
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
                <Box as="select" p={3} w="full" h="60px" borderRadius="2xl" fontWeight="800" bg="white" borderWidth="2px" value={receiveType} onChange={(e: any) => setReceiveType(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderTopWidth="1px" borderColor="gray.100" p={6}>
            <Button variant="ghost" mr={3} onClick={() => setIsPaymentOpen(false)} borderRadius="xl" fontWeight="bold">Cancel</Button>
            <Button colorScheme="blue" onClick={handleSavePayment} isLoading={isSaving} leftIcon={<FiCheckCircle />} borderRadius="xl" px={8} size="lg" w="full" shadow="md">
              Confirm Entry
            </Button>
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
                        <Text fontWeight="1000" color="green.700" fontSize="md">₹{historyData.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0).toLocaleString()}</Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" fontWeight="bold" color="orange.600">BALANCE DUE</Text>
                        <Text fontWeight="1000" color="orange.700" fontSize="md">₹{Math.max(0, (selectedRecord?.amount - (selectedRecord?.discount || 0)) - historyData.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)).toLocaleString()}</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
                {historyData.map((h: any, i: number) => (
                  <HStack key={i} justify="space-between" p={4} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="800" color="gray.700">Payment Entry {historyData.length - i}</Text>
                      <Text fontSize="xs" color="gray.400">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
                              setDownloadingPaymentId(`${selectedRecord._id}-${i}`);
                              const base64 = await stores.workDoneStore.fetchPaymentReceiptBase64(selectedRecord._id, i);
                              setPreviewData(base64);
                              setPreviewFileName(`Receipt_${selectedRecord._id}_${i}.pdf`);
                              setIsPreviewOpen(true);
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to load preview.", status: "error", duration: 3000 });
                            } finally {
                              setDownloadingPaymentId(null);
                            }
                          }}
                        />
                      )}
                      {stores.auth.hasPermission('accountability', 'edit') && (
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
              <Button colorScheme="orange" size="lg" borderRadius="xl" isLoading={isSavingAmount} leftIcon={<FiCheckCircle />}
                onClick={async () => {
                  if (editingPaymentIndex === null || !selectedRecord) return;
                  const newAmt = Number(editAmount);
                  if (isNaN(newAmt) || newAmt < 0) return toast({ title: "Invalid amount", status: "error", duration: 2000 });

                  const updatedHistoryTest = historyData.map((p: any, idx: number) => idx === editingPaymentIndex ? { ...p, amount: newAmt } : p);
                  const proposedTotalReceived = updatedHistoryTest.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                  const bill = selectedRecord.amount - (selectedRecord.discount || 0);

                  if (proposedTotalReceived > bill) {
                    return toast({ title: "Overpayment Error", description: `Total payments (₹${proposedTotalReceived.toLocaleString()}) cannot exceed total bill (₹${bill.toLocaleString()}).`, status: "warning", duration: 3000 });
                  }

                  setIsSavingAmount(true);
                  try {
                    const reversedBackHistory = [...updatedHistoryTest].reverse();
                    await stores.workDoneStore.updateWorkDone(selectedRecord._id, {
                      paymentHistory: reversedBackHistory,
                      receivedAmount: proposedTotalReceived,
                    });

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
    </Box>
  );
});

export default GlobalAccountabilityPage;

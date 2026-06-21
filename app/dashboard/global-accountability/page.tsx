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
  Avatar,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { FiActivity, FiFilter, FiFileText, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiDollarSign, FiPrinter } from "react-icons/fi";
import React, { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import Pagination from "../../component/common/pagination/Pagination";
import { formatCurrency } from "../../config/utils/utils";
import CreatableSelect from "react-select/creatable";
import { FormControl, FormLabel } from "@chakra-ui/react";
import ReceiptPreviewDrawer from "../patients/component/patient/ReceiptPreviewDrawer";

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
  const [toothNumbers, setToothNumbers] = useState<any[]>([]);

  // Print Report States
  const toast = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

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
  }, [selectedPatients, selectedDoctors, fromDate, toDate, status, toothNumbers]);

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
    setToothNumbers([]);
    setPage(1);
  };

  const handlePrintReport = async () => {
    setIsPrinting(true);
    try {
      const filters = {
        patientIds: selectedPatients.map(p => p.id || p.value || p._id),
        doctorIds: selectedDoctors.map(d => d.id || d.value || d._id),
        fromDate,
        toDate,
        status,
        tooth: toothNumbers.length > 0 ? toothNumbers.map(t => t.value).join("|") : undefined,
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
          onClick={handlePrintReport}
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
        <Flex gap={4} flexWrap="wrap" align="end">
          <Box flex="1" minW="200px">
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
          <Box flex="1" minW="200px">
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
          <Box flex="1" minW="150px">
            <CustomInput
              name="fromDate"
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e: any) => setFromDate(e.target.value)}
            />
          </Box>
          <Box flex="1" minW="150px">
            <CustomInput
              name="toDate"
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e: any) => setToDate(e.target.value)}
            />
          </Box>
          <Box flex="1" minW="150px">
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
          <Box flex="1" minW="200px">
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
          <HStack pb={2}>
            <Button colorScheme="blue" onClick={handleApplyFilters}>Apply</Button>
            <Button variant="ghost" onClick={handleClearFilters}>Clear</Button>
          </HStack>
        </Flex>
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
                <Th fontSize="10px" fontWeight="900" color="gray.500">TREATMENT</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">DOCTOR</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500" isNumeric>FEES</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500" isNumeric>PAID</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500" isNumeric>DUE</Th>
                <Th fontSize="10px" fontWeight="900" color="gray.500">STATUS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Tr key={i}>
                    <Td colSpan={9}><Skeleton height="40px" borderRadius="lg" /></Td>
                  </Tr>
                ))
              ) : data.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={16}>
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
                      <Text fontWeight="900" fontSize="sm">{formatCurrency(row.amount)}</Text>
                    </Td>
                    <Td isNumeric>
                      <Text color="green.500" fontWeight="900" fontSize="sm">{formatCurrency(row.totalPaid)}</Text>
                    </Td>
                    <Td isNumeric>
                      <Text color={row.balanceDue > 0 ? "red.500" : "gray.400"} fontWeight="900" fontSize="sm">{formatCurrency(row.balanceDue)}</Text>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={row.balanceDue <= 0 ? "green" : "red"} 
                        variant="solid" 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        fontSize="10px"
                      >
                        {row.balanceDue <= 0 ? "Settled" : "Due"}
                      </Badge>
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

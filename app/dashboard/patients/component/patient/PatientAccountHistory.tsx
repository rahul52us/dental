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
  FiFilter
} from "react-icons/fi";
import stores from "../../../../store/stores";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import moment from "moment";

const PatientAccountHistory = observer(({ patientDetails }: any) => {
  const { accountabilityStore, workDoneStore, auth } = stores;
  const toast = useToast();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    await workDoneStore.getWorkDone({
      patientId: patientDetails._id,
      page: currentPage,
      limit: 10
    });
    // Fetch stats from backend with filter
    await workDoneStore.getPatientFinancialStats(patientDetails._id, doctorFilter);

    await accountabilityStore.getAccountabilityList({
      patient: patientDetails._id,
      companyId: auth.company,
      limit: 100
    });
  }, [workDoneStore, accountabilityStore, patientDetails._id, auth.company, doctorFilter, currentPage]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Data: Doctors list for filtering (from current data)
  const doctorsList = useMemo(() => {
    const docs: Record<string, string> = {};
    workDoneStore.workDone.data.forEach((wd: any) => {
      if (wd.doctor?._id && wd.doctor?.name) {
        docs[wd.doctor._id as string] = wd.doctor.name as string;
      }
    });
    return Object.entries(docs).map(([id, name]) => ({ id, name }));
  }, [workDoneStore.workDone.data]);

  // Filtered Data for Table (Frontend filtering for table rows is fine, but stats are backend)
  const filteredWork = useMemo(() => {
    if (doctorFilter === "all") return workDoneStore.workDone.data;
    return workDoneStore.workDone.data.filter((wd: any) => wd.doctor?._id === doctorFilter);
  }, [workDoneStore.workDone.data, doctorFilter]);

  const openPaymentModal = (record: any) => {
    setSelectedRecord(record);
    setTempValue("");
    setIsPaymentOpen(true);
  };

  const openHistoryDrawer = async (record: any) => {
    setSelectedRecord(record);
    setIsHistoryOpen(true);
    setIsLoadingHistory(true);
    try {
      const acc = accountabilityStore.accountabilities.data.find((a: any) =>
        (a.workDone?._id || a.workDone) === record._id
      );
      setHistoryData(acc?.payoutHistory || []);
    } catch (err) {
      toast({ title: "History error", status: "error" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSavePayment = async () => {
    const paymentNow = Number(tempValue);
    if (isNaN(paymentNow) || paymentNow <= 0) return;
    setIsSaving(true);
    try {
      const bill = selectedRecord.amount - (selectedRecord.discount || 0);
      const alreadyPaid = selectedRecord.receivedAmount || 0;
      const remaining = Math.max(0, bill - alreadyPaid);

      if (paymentNow > remaining) {
        setIsSaving(false);
        return toast({
          title: "Overpayment Error",
          description: `Remaining: ₹${remaining.toLocaleString()}`,
          status: "warning"
        });
      }

      await workDoneStore.updateWorkDone(selectedRecord._id, {
        receivedAmount: alreadyPaid + paymentNow,
      });

      const existing = accountabilityStore.accountabilities.data.find((a: any) =>
        (a.workDone?._id || a.workDone) === selectedRecord._id
      );

      const status = (alreadyPaid + paymentNow) >= bill ? "PAID" : "PENDING";

      if (existing) {
        await accountabilityStore.updatePayoutStatus(existing._id, {
          payoutAmount: paymentNow,
          status: status
        });
      } else {
        await accountabilityStore.createAccountability({
          workDone: selectedRecord._id,
          doctor: selectedRecord.doctor?._id || selectedRecord.doctor,
          patient: patientDetails._id,
          company: auth.company,
          tooth: selectedRecord.tooth,
          treatmentName: selectedRecord.treatmentPlan || selectedRecord.treatmentCode || "General Procedure",
          totalAmount: bill,
          doctorShareAmount: paymentNow,
          payoutHistory: [{ amount: paymentNow, date: new Date() }],
          payoutStatus: status,
          createdBy: auth.user?._id,
        });
      }

      toast({ title: "Payment Recorded", status: "success" });
      setIsPaymentOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { headerName: "S.No.", key: "sno", props: { row: { textAlign: "center", color: "gray.400", fontWeight: "bold" } } },
    {
      headerName: "Treatment Details",
      key: "treatment",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={3}>
            <Box p={1.5} bg="blue.50" borderRadius="lg"><Icon as={FiActivity} color="blue.500" /></Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="800" color="gray.700">{dt.treatmentPlan || dt.treatmentCode || "General"}</Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle" fontSize="9px">T: {dt.tooth || "N/A"}</Badge>
                <Text fontSize="10px" color="gray.400" fontWeight="600"><Icon as={FiUser} mr={1} boxSize="10px" />{dt.doctor?.name}</Text>
              </HStack>
            </VStack>
          </HStack>
        )
      }
    },
    { headerName: "Total Bill (₹)", key: "bill", function: (dt: any) => (dt.amount - (dt.discount || 0)).toLocaleString() },
    {
      headerName: "Amount Received",
      key: "received",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={2} p={2} bg="green.50" borderRadius="2xl" border="1px dashed" borderColor="green.200">
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="xs" fontWeight="bold" color="green.600" opacity={0.7}>TOTAL PAID</Text>
              <Text fontSize="md" fontWeight="1000" color="green.700">₹{(dt.receivedAmount || 0).toLocaleString()}</Text>
            </VStack>
            <Tooltip label="Add Payment" hasArrow>
              <IconButton
                aria-label="Add" icon={<FiPlusCircle />} size="sm" colorScheme="green" variant="solid" borderRadius="lg"
                onClick={() => openPaymentModal(dt)}
              />
            </Tooltip>
          </HStack>
        )
      }
    },
    {
      headerName: "Balance",
      key: "remaining",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const bill = dt.amount - (dt.discount || 0);
          const remaining = Math.max(0, bill - (dt.receivedAmount || 0));
          return (
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="1000" color={remaining > 0 ? "orange.500" : "green.500"} letterSpacing="-1px">
                ₹{remaining.toLocaleString()}
              </Text>
              <Text fontSize="8px" fontWeight="bold" color="gray.400">{remaining > 0 ? "OUTSTANDING" : "SETTLED"}</Text>
            </VStack>
          );
        }
      }
    },
    {
      headerName: "History",
      key: "history_col",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="View History" hasArrow>
            <IconButton
              aria-label="History" icon={<FiClock />} size="md" colorScheme="blue" variant="ghost"
              borderRadius="xl" onClick={() => openHistoryDrawer(dt)}
            />
          </Tooltip>
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
          const isSettled = (dt.receivedAmount || 0) >= bill;
          return (
            <Badge px={3} py={1} borderRadius="xl" fontSize="9px" fontWeight="800" bg={isSettled ? "green.500" : "orange.400"} color="white" shadow="sm">
              {isSettled ? "SETTLED" : "PENDING"}
            </Badge>
          );
        }
      }
    }
  ];

  // Using Server-Side calculated stats from the store
  const { totalBill, patientPending } = workDoneStore.patientStats;
  const serverReceived = totalBill - patientPending;

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Box bg="white" borderRadius="3xl" shadow="2xl" border="1px solid" borderColor="gray.100" overflow="hidden" p={6}>
        <SimpleGrid columns={3} gap={6} mb={10}>
          <VStack align="start" p={5} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
            <HStack w="full" justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="900" color="blue.500" letterSpacing="0.05em">TOTAL BILL VALUE</Text>
              <Icon as={FiPieChart} color="blue.300" />
            </HStack>
            {workDoneStore.patientStats.loading ? <Spinner size="sm" /> : (
              <Text fontSize="24px" fontWeight="1000" color="blue.700">₹{(totalBill || 0).toLocaleString()}</Text>
            )}
            <Text fontSize="9px" color="blue.400" fontWeight="bold">
              {doctorFilter === 'all' ? 'GROSS CLINIC REVENUE' : 'DOCTOR TOTAL SHARE'}
            </Text>
          </VStack>

          <VStack align="start" p={5} bg="green.50" borderRadius="2xl" border="1px solid" borderColor="green.100">
            <HStack w="full" justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="900" color="green.500" letterSpacing="0.05em">TOTAL COLLECTED</Text>
              <Icon as={FiDownloadCloud} color="green.300" />
            </HStack>
            {workDoneStore.patientStats.loading ? <Spinner size="sm" /> : (
              <Text fontSize="24px" fontWeight="1000" color="green.700">₹{(serverReceived || 0).toLocaleString()}</Text>
            )}
            <Text fontSize="9px" color="green.400" fontWeight="bold">CASH RECEIVED</Text>
          </VStack>

          <VStack align="start" p={5} bg="orange.50" borderRadius="2xl" border="1px solid" borderColor="orange.100">
            <HStack w="full" justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="900" color="orange.500" letterSpacing="0.05em">OUTSTANDING</Text>
              <Icon as={FiTrendingUp} color="orange.300" />
            </HStack>
            {workDoneStore.patientStats.loading ? <Spinner size="sm" /> : (
              <Text fontSize="24px" fontWeight="1000" color="orange.700">₹{(patientPending || 0).toLocaleString()}</Text>
            )}
            <Text fontSize="9px" color="orange.400" fontWeight="bold">BALANCE REMAINING</Text>
          </VStack>
        </SimpleGrid>

        <Box px={2} mb={6}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="900" color="gray.800">Financial Ledger</Text>
              <Text fontSize="xs" color="gray.400">Server-side filtering for 1000+ records</Text>
            </VStack>

            <HStack spacing={3} p={1} px={3} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
              <Icon as={FiFilter} color="gray.400" />
              <Text fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">FILTER BY DOCTOR:</Text>
              <Select
                size="sm"
                variant="unstyled"
                fontWeight="bold"
                color="blue.600"
                w="200px"
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              >
                <option value="all">Show All Doctors</option>
                {doctorsList.map(doc => (
                  <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                ))}
              </Select>
            </HStack>
          </HStack>
        </Box>

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
      </Box>

      {/* Modals and Drawers remain the same... */}
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
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="bold" color="blue.600">TOTAL BILL</Text>
                    <Text fontWeight="1000" color="blue.700">₹{(selectedRecord?.amount - (selectedRecord?.discount || 0)).toLocaleString()}</Text>
                  </HStack>
                </Box>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="0.1em">PAYMENT TIMELINE</Text>
                  {historyData.map((h: any, i: number) => (
                    <HStack key={i} justify="space-between" p={4} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="800" color="gray.700">Payment Entry {i + 1}</Text>
                        <Text fontSize="xs" color="gray.400">{moment(h.date).format("DD MMM YYYY, hh:mm A")}</Text>
                      </VStack>
                      <HStack>
                        <Text fontWeight="1000" color="green.600" fontSize="lg">₹{h.amount.toLocaleString()}</Text>
                        <Icon as={FiArrowRightCircle} color="green.300" />
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
    </Box>
  );
});

export default PatientAccountHistory;

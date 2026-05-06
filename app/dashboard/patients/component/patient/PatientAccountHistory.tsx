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
  FiFilter,
  FiDownload,
  FiCalendar,
  FiTarget,
  FiChevronRight
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
  const [receiveType, setReceiveType] = useState<string>("Cash");
  const [isSaving, setIsSaving] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");

  // Download Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadFilters, setDownloadFilters] = useState({
    doctorId: "all",
    status: "all",
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchOverallStats = useCallback(async () => {
    await workDoneStore.getOverallPatientStats(patientDetails._id);
  }, [workDoneStore, patientDetails._id]);

  const fetchData = useCallback(async () => {
    await workDoneStore.getWorkDone({
      patientId: patientDetails._id,
      page: currentPage,
      limit: 10
    });

    // Fetch filtered stats (dynamic)
    await workDoneStore.getPatientFinancialStats(patientDetails._id, doctorFilter);

    await accountabilityStore.getAccountabilityList({
      patient: patientDetails._id,
      companyId: auth.company,
      limit: 100
    });
  }, [workDoneStore, accountabilityStore, patientDetails._id, auth.company, doctorFilter, currentPage]);

  useEffect(() => {
    fetchOverallStats();
  }, [fetchOverallStats]);

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

  // Filtered Data for Table
  const filteredWork = useMemo(() => {
    if (doctorFilter === "all") return workDoneStore.workDone.data;
    return workDoneStore.workDone.data.filter((wd: any) => wd.doctor?._id === doctorFilter);
  }, [workDoneStore.workDone.data, doctorFilter]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await workDoneStore.downloadPatientStatement(patientDetails._id, downloadFilters);
      toast({ title: "Statement Downloaded", status: "success" });
      setIsDownloadModalOpen(false);
    } catch (err) {
      toast({ title: "Download Error", status: "error" });
    } finally {
      setIsDownloading(false);
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
      const acc = accountabilityStore.accountabilities.data.find((a: any) =>
        (a.workDone?._id || a.workDone) === record._id
      );
      setHistoryData([...(acc?.payoutHistory || [])].reverse());
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
        paymentAmount: paymentNow,
        paymentMethod: receiveType,
      });

      const existing = accountabilityStore.accountabilities.data.find((a: any) =>
        (a.workDone?._id || a.workDone) === selectedRecord._id
      );

      const status = (alreadyPaid + paymentNow) >= bill ? "PAID" : "PENDING";

      if (existing) {
        await accountabilityStore.updatePayoutStatus(existing._id, {
          payoutAmount: paymentNow,
          status: status,
          paymentMethod: receiveType,
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
          payoutHistory: [{ amount: paymentNow, date: new Date(), paymentMethod: receiveType }],
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
        component: (dt: any) => {
          const modes = Array.from(new Set((dt.paymentHistory || []).map((h: any) => h.paymentMethod).filter(Boolean)));
          return (
            <HStack spacing={2} p={2} bg="green.50" borderRadius="2xl" border="1px dashed" borderColor="green.200" minW="140px">
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="xs" fontWeight="bold" color="green.600" opacity={0.7}>TOTAL PAID</Text>
                <Text fontSize="md" fontWeight="1000" color="green.700">₹{(dt.receivedAmount || 0).toLocaleString()}</Text>
                {modes.length > 0 && (
                  <HStack spacing={1} mt={1}>
                    {modes.map((m: any, i: number) => (
                      <Badge key={i} variant="subtle" colorScheme="blue" fontSize="8px" borderRadius="md" px={1}>{String(m).toUpperCase()}</Badge>
                    ))}
                  </HStack>
                )}
              </VStack>
              <Tooltip label="Add Payment" hasArrow>
                <IconButton
                  aria-label="Add" icon={<FiPlusCircle />} size="sm" colorScheme="green" variant="solid" borderRadius="lg"
                  onClick={() => openPaymentModal(dt)}
                />
              </Tooltip>
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
            <HStack key={i} p={3} bg={`${item.color}.50`} borderRadius="xl" border="1px solid" borderColor={`${item.color}.100`} shadow="sm" spacing={3}>
              <Box p={2.5} bg="white" borderRadius="lg" shadow="sm"><Icon as={item.icon} color={`${item.color}.400`} boxSize="18px" /></Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="bold" color={`${item.color}.600`} textTransform="uppercase">{item.label}</Text>
                {workDoneStore.overallStats.loading ? <Spinner size="xs" /> : (
                  <Text fontSize="md" fontWeight="800" color={`${item.color}.700`} letterSpacing="-0.5px">₹{(item.val || 0).toLocaleString()}</Text>
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
            <HStack key={i} p={3} bg={`${item.color}.50`} borderRadius="xl" border="1px solid" borderColor={`${item.color}.100`} shadow="sm" spacing={3}>
              <Box p={2.5} bg="white" borderRadius="lg" shadow="sm"><Icon as={item.icon} color={`${item.color}.400`} boxSize="18px" /></Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="bold" color={`${item.color}.600`} textTransform="uppercase">{item.label}</Text>
                {workDoneStore.patientStats.loading ? <Spinner size="xs" /> : (
                  <Text fontSize="md" fontWeight="800" color={`${item.color}.700`} letterSpacing="-0.5px">₹{(item.val || 0).toLocaleString()}</Text>
                )}
                <Text fontSize="8px" fontWeight="bold" color={`${item.color}.400`} opacity={0.8}>{item.sub}</Text>
              </VStack>
            </HStack>
          ))}
        </SimpleGrid>

        <Box px={2} mb={6}>
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="1000" color="gray.800" letterSpacing="-0.5px">Financial Ledger</Text>
              <Text fontSize="xs" color="gray.400" fontWeight="600">Secure Audit & Statement Controls</Text>
            </VStack>

            <HStack spacing={3} ml="auto">
              <Button
                leftIcon={<FiDownloadCloud />}
                bgGradient="linear(to-r, blue.500, blue.600)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", shadow: "lg", transform: "translateY(-1px)" }}
                _active={{ transform: "translateY(0)" }}
                size="md"
                borderRadius="2xl"
                fontWeight="800"
                px={6}
                shadow="md"
                onClick={() => setIsDownloadModalOpen(true)}
              >
                Download Statement
              </Button>

              <HStack 
                spacing={0} 
                p={1} 
                bg="white" 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="gray.100" 
                shadow="sm"
                transition="all 0.2s"
                _hover={{ borderColor: "blue.200", shadow: "md" }}
              >
                <Box px={3} borderRight="1px solid" borderColor="gray.100">
                  <HStack spacing={2}>
                    <Icon as={FiFilter} color="blue.500" />
                    <Text fontSize="xs" fontWeight="900" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">Doctor</Text>
                  </HStack>
                </Box>
                <Select
                  size="md"
                  variant="unstyled"
                  fontWeight="800"
                  color="blue.600"
                  w="200px"
                  px={4}
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  cursor="pointer"
                >
                  <option value="all">Show All Doctors</option>
                  {doctorsList.map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                  ))}
                </Select>
              </HStack>
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

      {/* DOWNLOAD STATEMENT MODAL - PREMIUM REDESIGN */}
      <Modal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.300" />
        <ModalContent borderRadius="4xl" shadow="dark-lg" overflow="hidden">
          <ModalHeader p={0}>
            <Box bgGradient="linear(to-br, blue.600, blue.800)" p={8} color="white" pos="relative">
              <VStack align="start" spacing={1}>
                <HStack spacing={2} opacity={0.9}>
                  <Icon as={FiDownloadCloud} />
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.2em">PDF GENERATOR</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="1000" letterSpacing="-1px">Download Statement</Text>
                <Text fontSize="sm" opacity={0.8} fontWeight="500">Configure your report filters below</Text>
              </VStack>
              <Box pos="absolute" right={-10} top={-10} boxSize="150px" bg="whiteAlpha.100" borderRadius="full" />
            </Box>
          </ModalHeader>
          <ModalCloseButton color="white" top={6} right={6} borderRadius="full" _hover={{ bg: "whiteAlpha.200" }} />
          
          <ModalBody p={8}>
            <VStack spacing={6}>
              <Box w="full">
                <Text fontSize="xs" fontWeight="900" color="blue.500" mb={3} letterSpacing="0.1em">TIMELINE RANGE</Text>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>START DATE</FormLabel>
                    <HStack bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <Icon as={FiCalendar} color="gray.400" />
                      <Input 
                        type="date" 
                        variant="unstyled"
                        fontSize="sm"
                        fontWeight="700"
                        value={downloadFilters.startDate}
                        onChange={(e) => setDownloadFilters({...downloadFilters, startDate: e.target.value})}
                      />
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>END DATE</FormLabel>
                    <HStack bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <Icon as={FiCalendar} color="gray.400" />
                      <Input 
                        type="date" 
                        variant="unstyled"
                        fontSize="sm"
                        fontWeight="700"
                        value={downloadFilters.endDate}
                        onChange={(e) => setDownloadFilters({...downloadFilters, endDate: e.target.value})}
                      />
                    </HStack>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Box w="full">
                <Text fontSize="xs" fontWeight="900" color="blue.500" mb={3} letterSpacing="0.1em">REPORT SCOPE</Text>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="10px" fontWeight="800" color="gray.400" mb={1}>ASSIGNED DOCTOR</FormLabel>
                    <Select 
                      bg="gray.50" 
                      borderRadius="2xl" 
                      border="1px solid" 
                      borderColor="gray.100"
                      fontSize="sm"
                      fontWeight="700"
                      h="45px"
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
                      borderRadius="2xl" 
                      border="1px solid" 
                      borderColor="gray.100"
                      fontSize="sm"
                      fontWeight="700"
                      h="45px"
                      value={downloadFilters.status}
                      onChange={(e) => setDownloadFilters({...downloadFilters, status: e.target.value})}
                    >
                      <option value="all">Full History</option>
                      <option value="SETTLED">Settled Only</option>
                      <option value="PENDING">Pending Balance</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <HStack w="full" p={4} bg="blue.50" borderRadius="2xl" spacing={4}>
                <Box p={2} bg="blue.100" borderRadius="xl"><Icon as={FiTarget} color="blue.600" /></Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="bold" color="blue.700">Audit Ready</Text>
                  <Text fontSize="10px" color="blue.600" opacity={0.8}>This report will include digital signatures and clinic branding.</Text>
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter p={8} pt={0}>
            <Button 
              variant="ghost" 
              mr={4} 
              onClick={() => setIsDownloadModalOpen(false)} 
              borderRadius="2xl"
              fontWeight="800"
              fontSize="sm"
              color="gray.500"
            >
              Discard
            </Button>
            <Button 
              bgGradient="linear(to-r, blue.500, blue.700)" 
              color="white"
              _hover={{ bgGradient: "linear(to-r, blue.600, blue.800)", shadow: "xl", transform: "scale(1.02)" }}
              _active={{ transform: "scale(0.98)" }}
              onClick={handleDownload} 
              isLoading={isDownloading} 
              rightIcon={<FiChevronRight />}
              borderRadius="2xl"
              px={10}
              h="55px"
              fontWeight="900"
              fontSize="md"
              shadow="lg"
            >
              Generate PDF
            </Button>
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
                        <Text fontWeight="800" color="gray.700">Payment Entry {historyData.length - i}</Text>
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
                        <Icon as={FiArrowRightCircle} color="green.300" boxSize="20px" />
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

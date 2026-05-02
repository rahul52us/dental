import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { 
  FiPieChart, 
  FiDownloadCloud, 
  FiTrendingUp,
} from "react-icons/fi";
import stores from "../../../../store/stores";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";

const DoctorAccountHistory = observer(({ doctorDetails }: any) => {
  const { workDoneStore } = stores;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    // 1. Fetch WorkDone for this doctor with pagination
    await workDoneStore.getWorkDone({ 
      doctorId: doctorDetails._id, 
      page: currentPage,
      limit: 10 
    });
    
    // 2. Fetch Doctor-specific Stats
    await workDoneStore.getDoctorFinancialStats(doctorDetails._id);
  }, [workDoneStore, doctorDetails._id, currentPage]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="900" color="gray.800">Doctor's Financial Ledger</Text>
                <Text fontSize="xs" color="gray.400">Showing all treatments performed by Dr. {doctorDetails?.name}</Text>
            </VStack>
        </Box>

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
    </Box>
  );
});

export default DoctorAccountHistory;

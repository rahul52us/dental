"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Badge,
  HStack,
  Text,
  VStack,
  useDisclosure,
  Icon,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from "@chakra-ui/react";
import { FiDollarSign, FiUser, FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";

import stores from "../../store/stores";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import useDebounce from "../../component/config/component/customHooks/useDebounce";

const AccountabilityPage = observer(() => {
  const { accountabilityStore, auth } = stores;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const fetchAccountabilities = useCallback(
    (page = 1) => {
      const query: any = { 
        page, 
        limit: tablePageLimit,
        companyId: auth.company 
      };
      
      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }
      accountabilityStore.getAccountabilityList(query);
    },
    [accountabilityStore, auth.company, debouncedSearchQuery]
  );

  useEffect(() => {
    fetchAccountabilities(currentPage);
  }, [currentPage, debouncedSearchQuery, fetchAccountabilities]);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (window.confirm(`Mark this payout as ${status}?`)) {
      await accountabilityStore.updatePayoutStatus(id, { status });
      fetchAccountabilities(currentPage);
    }
  };

  const stats = {
    pending: accountabilityStore.accountabilities.data
      .filter((a: any) => a.payoutStatus === "PENDING")
      .reduce((acc: number, curr: any) => acc + curr.doctorShareAmount, 0),
    paid: accountabilityStore.accountabilities.data
      .filter((a: any) => a.payoutStatus === "PAID")
      .reduce((acc: number, curr: any) => acc + curr.doctorShareAmount, 0),
  };

  const columns = [
    { headerName: "S.No.", key: "sno", props: { row: { textAlign: "center" } } },
    {
      headerName: "Doctor",
      key: "doctor",
      function: (dt: any) => dt.doctor?.name || "N/A",
    },
    {
      headerName: "Patient",
      key: "patient",
      function: (dt: any) => dt.patient?.name || "N/A",
    },
    {
      headerName: "Treatment & Tooth",
      key: "treatment",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="blue.600">{dt.treatmentName || "General"}</Text>
            {dt.tooth && <Badge colorScheme="blue" variant="outline" fontSize="9px">Tooth: {dt.tooth}</Badge>}
          </VStack>
        ),
      },
    },
    {
      headerName: "Total Bill",
      key: "totalAmount",
      function: (dt: any) => `₹${dt.totalAmount?.toLocaleString()}`,
    },
    {
      headerName: "Doctor Share",
      key: "share",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color="purple.600">₹{dt.doctorShareAmount?.toLocaleString()}</Text>
            {dt.doctorSharePercentage > 0 && <Text fontSize="10px" color="gray.400">{dt.doctorSharePercentage}% of total</Text>}
          </VStack>
        ),
      },
    },
    {
      headerName: "Status",
      key: "payoutStatus",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge 
            colorScheme={dt.payoutStatus === "PAID" ? "green" : "orange"} 
            borderRadius="full" 
            px={3}
          >
            {dt.payoutStatus}
          </Badge>
        ),
      },
    },
    {
      headerName: "Date",
      key: "createdAt",
      function: (dt: any) => formatDateTime(dt.createdAt).split(",")[0],
    },
    {
      headerName: "Actions",
      key: "actions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={2}>
            {dt.payoutStatus === "PENDING" && (
              <Button 
                size="xs" 
                colorScheme="green" 
                leftIcon={<FiCheckCircle />}
                onClick={() => handleUpdateStatus(dt._id, "PAID")}
              >
                Mark Paid
              </Button>
            )}
          </HStack>
        ),
      },
    },
  ];

  return (
    <Box p={6}>
      <DashPageTitle 
        title="Doctor Accountability & Payouts" 
        subTitle="Manage doctor commissions and treatment-wise payouts" 
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mt={6} mb={8}>
        <Box p={5} bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Stat>
            <StatLabel color="gray.500" fontWeight="bold">PENDING PAYOUTS</StatLabel>
            <StatNumber color="orange.500" fontSize="28px">₹{stats.pending.toLocaleString()}</StatNumber>
            <StatHelpText><Icon as={FiClock} mr={1} /> Awaiting settlement</StatHelpText>
          </Stat>
        </Box>
        <Box p={5} bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Stat>
            <StatLabel color="gray.500" fontWeight="bold">TOTAL PAID</StatLabel>
            <StatNumber color="green.500" fontSize="28px">₹{stats.paid.toLocaleString()}</StatNumber>
            <StatHelpText><Icon as={FiCheckCircle} mr={1} /> Successfully disbursed</StatHelpText>
          </Stat>
        </Box>
        <Box p={5} bg="blue.600" borderRadius="2xl" shadow="lg" color="white">
          <Stat>
            <StatLabel opacity={0.8} fontWeight="bold">TOTAL RECORDS</StatLabel>
            <StatNumber fontSize="28px">{accountabilityStore.accountabilities.total}</StatNumber>
            <StatHelpText opacity={0.8}><Icon as={FiDollarSign} mr={1} /> Financial entries</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      <Box bg="white" p={2} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
        <CustomTable
          title="Commission Ledger"
          data={accountabilityStore.accountabilities.data.map((item: any, index: number) => ({
            ...item,
            sno: (currentPage - 1) * tablePageLimit + index + 1,
          }))}
          columns={columns}
          actions={{
            pagination: {
              show: true,
              onClick: setCurrentPage,
              currentPage: currentPage,
              totalPages: accountabilityStore.accountabilities.totalPages,
            },
            search: {
              show: true,
              searchValue: searchQuery,
              onSearchChange: (e: any) => setSearchQuery(e.target.value),
            },
          }}
          loading={accountabilityStore.loading}
        />
      </Box>
    </Box>
  );
});

export default AccountabilityPage;

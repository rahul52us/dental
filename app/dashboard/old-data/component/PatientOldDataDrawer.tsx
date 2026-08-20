import React from "react";
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Text,
  Badge,
  Spinner,
  Center,
  HStack,
  Flex,
  Icon,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { FiDatabase } from "react-icons/fi";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";

interface PatientOldDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

const PatientOldDataDrawer = observer(({ isOpen, onClose, patient }: PatientOldDataDrawerProps) => {
  const { oldDataStore } = stores;
  const loading = oldDataStore.patientOldDataLoading;
  const rows = oldDataStore.patientOldData;

  const headerBg = useColorModeValue("blue.600", "blue.800");
  const bodyBg = useColorModeValue("gray.50", "gray.900");

  const columns = [
    {
      headerName: "Work Date",
      key: "Work_Date",
      type: "text",
      props: { row: { minW: 110 } },
    },
    {
      headerName: "Doctor",
      key: "Doctor",
      type: "text",
      props: { row: { minW: 130 } },
    },
    {
      headerName: "Stage",
      key: "Treatment_Stage",
      type: "component",
      metaData: {
        component: (dt: any) =>
          dt.Treatment_Stage ? (
            <Badge
              colorScheme={dt.Treatment_Stage === "Finished" ? "green" : "orange"}
              borderRadius="md"
              px={2}
            >
              {dt.Treatment_Stage}
            </Badge>
          ) : (
            <Text color="gray.400">--</Text>
          ),
      },
      props: { row: { minW: 100 } },
    },
    {
      headerName: "Teeth",
      key: "Teeth_Count",
      type: "text",
      props: { row: { minW: 70, textAlign: "center" } },
    },
    {
      headerName: "Treatments",
      key: "Treatments",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={dt.Treatments} hasArrow borderRadius="md" placement="top" maxW="400px">
            <Text
              maxW="180px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              cursor="pointer"
              fontSize="sm"
            >
              {dt.Treatments || "--"}
            </Text>
          </Tooltip>
        ),
      },
      props: { row: { minW: 200 } },
    },
    {
      headerName: "Prescriptions",
      key: "Prescriptions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={dt.Prescriptions} hasArrow borderRadius="md" placement="top" maxW="400px">
            <Text
              maxW="180px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              cursor="pointer"
              fontSize="sm"
            >
              {dt.Prescriptions || "--"}
            </Text>
          </Tooltip>
        ),
      },
      props: { row: { minW: 180 } },
    },
    {
      headerName: "Fee Due (₹)",
      key: "Fee_Due",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="semibold" color="red.500">
            ₹{Number(dt.Fee_Due || 0).toLocaleString("en-IN")}
          </Text>
        ),
      },
      props: { row: { minW: 110, textAlign: "right" } },
    },
    {
      headerName: "Discount (₹)",
      key: "Fee_Discount",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="semibold" color="purple.500">
            ₹{Number(dt.Fee_Discount || 0).toLocaleString("en-IN")}
          </Text>
        ),
      },
      props: { row: { minW: 110, textAlign: "right" } },
    },
    {
      headerName: "Paid (₹)",
      key: "Amount_Paid",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="semibold" color="green.500">
            ₹{Number(dt.Amount_Paid || 0).toLocaleString("en-IN")}
          </Text>
        ),
      },
      props: { row: { minW: 100, textAlign: "right" } },
    },
    {
      headerName: "Payment Mode",
      key: "Payment_Modes",
      type: "text",
      props: { row: { minW: 120 } },
    },
    {
      headerName: "Work ID",
      key: "Work_ID",
      type: "text",
      props: { row: { minW: 90 } },
    },
  ];

  const totalPaid = rows.reduce((sum, r) => sum + (Number(r.Amount_Paid) || 0), 0);
  const totalDue = rows.reduce((sum, r) => sum + (Number(r.Fee_Due) || 0), 0);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xl" placement="right">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent maxW="90vw" w="90vw">
        <DrawerHeader bg={headerBg} color="white" py={4}>
          <Flex align="center" justify="space-between" pr={8}>
            <HStack spacing={3}>
              <Icon as={FiDatabase} boxSize={5} />
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Imported Patient History
                </Text>
                <Text fontSize="sm" fontWeight="normal" opacity={0.85}>
                  {patient?.name || "Patient"} &nbsp;|&nbsp; Code: {patient?.code || "--"}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={5}>
              <Box textAlign="center" bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Total Records</Text>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="lg">{rows.length}</Badge>
              </Box>
              <Box textAlign="center" bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Total Paid</Text>
                <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="lg">₹{totalPaid.toLocaleString("en-IN")}</Badge>
              </Box>
              <Box textAlign="center" bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Total Due</Text>
                <Badge colorScheme="red" fontSize="md" px={3} py={1} borderRadius="lg">₹{totalDue.toLocaleString("en-IN")}</Badge>
              </Box>
            </HStack>
          </Flex>
          <DrawerCloseButton color="white" top={4} />
        </DrawerHeader>

        <DrawerBody bg={bodyBg} p={4}>
          {loading ? (
            <Center h="60vh">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : rows.length === 0 ? (
            <Center h="60vh" flexDir="column" gap={3}>
              <Icon as={FiDatabase} boxSize={12} color="gray.300" />
              <Text color="gray.500" fontSize="lg">No imported history found for this patient</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <CustomTable
                title={`Visit History (${rows.length} records)`}
                data={rows}
                columns={columns}
                loading={false}
              />
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default PatientOldDataDrawer;

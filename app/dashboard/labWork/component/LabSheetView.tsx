"use client";
import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { formatDateTime } from "../../../component/config/utils/dateUtils";
import { FiUser, FiCalendar, FiClock, FiActivity, FiTag, FiFileText } from "react-icons/fi";

const LabSheetView = observer(({ data }: { data: any }) => {
  const { labWorkHierarchyStore } = stores;
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("blue.50", "gray.700");

  const StatusBadge = ({ status }: { status: string }) => {
    let color = "gray";
    switch (status) {
      case "plan": color = "blue"; break;
      case "sent": color = "orange"; break;
      case "in-progress": color = "purple"; break;
      case "received": color = "teal"; break;
      case "completed": color = "green"; break;
      case "cancelled": color = "red"; break;
    }
    return <Badge colorScheme={color} borderRadius="full" px={3} py={1}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={6}>
        {/* Header Information */}
        <Box p={5} borderRadius="2xl" border="1px solid" borderColor={borderColor} bg={headerBg}>
          <Flex justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={0}>
              <Heading size="md" color="blue.700">Lab Work Order Summary</Heading>
              <Text fontSize="sm" color="gray.500">Order ID: {data._id?.slice(-8).toUpperCase()}</Text>
            </VStack>
            <StatusBadge status={data.status} />
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <HStack spacing={3}>
              <Icon as={FiUser} color="blue.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500">Patient</Text>
                <Text fontWeight="bold">{data.patient?.name || data.patientNameManual || "N/A"}</Text>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FiActivity} color="purple.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500">Primary Doctor</Text>
                <Text fontWeight="bold">{data.primaryDoctor?.name || data.primaryDoctor?.labDoctorName || data.doctorNameManual || "N/A"}</Text>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              <Icon as={FiTag} color="orange.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500">Work Type</Text>
                <Badge colorScheme={data.workType === "in-house" ? "purple" : "cyan"}>{data.workType.toUpperCase()}</Badge>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FiFileText} color="teal.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500">Lab / Laboratory</Text>
                <Text fontWeight="bold">{data.lab?.name || data.labNameManual || "In-house"}</Text>
              </VStack>
            </HStack>
          </SimpleGrid>
        </Box>

        {/* Selected Works Table */}
        <Box>
          <Heading size="sm" mb={3} display="flex" alignItems="center">
            <Icon as={FiActivity} mr={2} /> Selected Works & Specifications
          </Heading>
          <Box borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="hidden">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Classification</Th>
                  <Th>Teeth #</Th>
                  <Th>Shade</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.selectedWorks?.map((work: any, i: number) => (
                  <Tr key={i}>
                    <Td fontWeight="bold">
                      {labWorkHierarchyStore.getNamePath(work.selections)}
                    </Td>
                    <Td>{work.teethNumbers?.join(", ") || "-"}</Td>
                    <Td>{work.shadeValue || "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Dates & Billing */}
        <SimpleGrid columns={{ base: 1, md: 4 }} gap={4}>
           <Box p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
             <VStack align="start" spacing={1}>
                <HStack color="gray.600"><Icon as={FiCalendar} /><Text fontSize="xs" fontWeight="bold">SEND DATE</Text></HStack>
                <Text fontWeight="bold">{data.sendDate ? formatDateTime(data.sendDate).split(",")[0] : "Not Sent"}</Text>
             </VStack>
           </Box>
           <Box p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
             <VStack align="start" spacing={1}>
                <HStack color="gray.600"><Icon as={FiClock} /><Text fontSize="xs" fontWeight="bold">DUE DATE</Text></HStack>
                <Text fontWeight="bold" color={data.delay > 0 ? "red.500" : "green.500"}>
                  {data.dueDate ? formatDateTime(data.dueDate).split(",")[0] : "N/A"}
                </Text>
             </VStack>
           </Box>
           <Box p={4} borderRadius="xl" bg="teal.50" border="1px solid" borderColor="teal.100">
             <VStack align="start" spacing={1}>
                <HStack color="teal.600"><Icon as={FiClock} /><Text fontSize="xs" fontWeight="bold">RECEIVED DATE</Text></HStack>
                <Text fontWeight="bold" color="teal.700">
                  {data.receivedDate ? formatDateTime(data.receivedDate).split(",")[0] : "Not Received"}
                </Text>
             </VStack>
           </Box>
           <Box p={4} borderRadius="xl" bg="blue.600" color="white">
             <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="bold" opacity={0.8}>TOTAL BILLING AMOUNT</Text>
                <Text fontSize="xl" fontWeight="bold">₹{data.price || 0}</Text>
             </VStack>
           </Box>
        </SimpleGrid>

        {/* Instructions */}
        <Box>
           <Heading size="sm" mb={2}>Lab Instructions</Heading>
           <Box p={4} borderRadius="xl" bg="orange.50" border="1px solid" borderColor="orange.100">
              <Text fontSize="sm" fontStyle={data.labInstructions ? "normal" : "italic"} color="gray.700">
                {data.labInstructions || "No special instructions provided."}
              </Text>
           </Box>
        </Box>

        {/* Warranty */}
        {(data.warrantyCardNumber || data.warrantyYears) && (
           <Box p={4} borderRadius="xl" border="1px solid" borderColor="green.100" bg="green.50">
             <HStack spacing={6}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="green.700" fontWeight="bold">WARRANTY CARD #</Text>
                  <Text fontWeight="bold">{data.warrantyCardNumber || "N/A"}</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="green.700" fontWeight="bold">DURATION</Text>
                  <Text fontWeight="bold">{data.warrantyYears ? `${data.warrantyYears} Years` : "N/A"}</Text>
                </VStack>
             </HStack>
           </Box>
        )}
      </VStack>
    </Box>
  );
});

export default LabSheetView;

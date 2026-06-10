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
import { FiUser, FiCalendar, FiClock, FiActivity, FiTag, FiFileText, FiCheckCircle } from "react-icons/fi";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import labWorkStatusStore from "../../../store/labWorkStatusStore/labWorkStatusStore";

const LabSheetView = observer(({ data }: { data: any }) => {
  const { labWorkHierarchyStore } = stores;
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("blue.50", "gray.700");

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "plan") return { scheme: "blue", bg: "blue.600" };
    if (s === "sent") return { scheme: "orange", bg: "orange.500" };
    if (s === "in-progress") return { scheme: "purple", bg: "purple.600" };
    if (s === "received" || s?.includes("received")) return { scheme: "teal", bg: "teal.500" };
    if (s === "completed") return { scheme: "green", bg: "green.600" };
    if (s === "cancelled") return { scheme: "red", bg: "red.500" };
    if (s === "hold") return { scheme: "yellow", bg: "yellow.500" };
    if (s?.includes("wax")) return { scheme: "pink", bg: "pink.500" };
    if (s?.includes("cast")) return { scheme: "orange", bg: "orange.600" };
    if (s?.includes("final")) return { scheme: "green", bg: "green.500" };
    return { scheme: "gray", bg: "gray.500" };
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const { scheme } = getStatusColor(status);
    return (
      <Badge colorScheme={scheme} borderRadius="full" px={3} py={1} fontSize="sm">
        {status?.toUpperCase()}
      </Badge>
    );
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


        {/* Dates, Status & Billing */}
        <SimpleGrid columns={{ base: 1, md: 6 }} gap={4}>
           <Box p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
             <VStack align="start" spacing={1}>
                <HStack color="gray.600"><Icon as={FiCalendar} /><Text fontSize="xs" fontWeight="bold">SEND DATE</Text></HStack>
                <Text fontWeight="bold">{data.sendDate ? formatDateTime(data.sendDate).split(",")[0] : "Not Sent"}</Text>
             </VStack>
           </Box>
           <Box p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
             <VStack align="start" spacing={1}>
                <HStack color="gray.600"><Icon as={FiClock} /><Text fontSize="xs" fontWeight="bold">DUE DATE</Text></HStack>
                <Text fontWeight="bold">
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
           <Box p={4} borderRadius="xl" bg="orange.50" border="1px solid" borderColor="orange.100">
             <VStack align="start" spacing={1}>
                <HStack color="orange.600"><Icon as={FiActivity} /><Text fontSize="xs" fontWeight="bold">DELAY (DAYS)</Text></HStack>
                <Text fontWeight="bold" color="orange.700">
                  {data.delay !== undefined && data.delay !== null ? `${data.delay} Days` : "N/A"}
                </Text>
             </VStack>
           </Box>
           {/* Prominent Status Card */}
           <Box
             p={4}
             borderRadius="xl"
             bg={getStatusColor(data.status).bg}
             color="white"
           >
             <VStack align="start" spacing={1}>
               <HStack>
                 <Icon as={FiCheckCircle} />
                 <Text fontSize="xs" fontWeight="bold" opacity={0.85}>CURRENT STATUS</Text>
               </HStack>
               <Text fontSize="md" fontWeight="extrabold" letterSpacing="wide">
                 {data.status?.toUpperCase() || "N/A"}
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

        {/* Status Tracking History */}
        {data.workType && (
          <Box bg="blue.50" p={6} borderRadius="2xl" border="1px solid" borderColor="blue.100" shadow="sm">
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Icon as={FiActivity} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color="blue.800">Status Tracking History</Heading>
                  <Text fontSize="xs" color="blue.600">Complete milestone tracking for this lab order</Text>
                </VStack>
              </HStack>
              <Box borderRadius="xl" border="1px solid" borderColor="blue.200" overflow="hidden" bg="white">
                <Table variant="simple" size="sm">
                  <Thead bg="blue.50">
                    <Tr>
                      <Th color="blue.700" w="35%">Status</Th>
                      <Th color="blue.700" w="25%">Date</Th>
                      <Th color="blue.700">Note</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(() => {
                      const fullList = data.statusHistory || [];
                      
                      return fullList.map((historyItem: any, idx: number) => {
                        const isDone = !!historyItem.date;
                        return (
                          <Tr key={idx} _hover={{ bg: "blue.50" }} opacity={isDone ? 1 : 0.55}>
                            <Td>
                              <HStack spacing={2}>
                                {isDone
                                  ? <CheckIcon color="green.500" boxSize={3} />
                                  : <CloseIcon color="gray.300" boxSize={2} />}
                                <Badge
                                  colorScheme={isDone ? "blue" : "gray"}
                                  borderRadius="full"
                                  px={2} py={0.5}
                                  fontWeight="600"
                                  fontSize="xs"
                                >
                                  {historyItem.status?.toUpperCase() || "N/A"}
                                </Badge>
                              </HStack>
                            </Td>
                            <Td fontWeight={isDone ? "600" : "400"} color={isDone ? "gray.800" : "gray.400"}>
                              {historyItem.date ? new Date(historyItem.date).toLocaleDateString() : "Not set"}
                            </Td>
                            <Td color={isDone ? "gray.700" : "gray.400"} fontStyle={isDone ? "normal" : "italic"}>
                              {historyItem.note || "-"}
                            </Td>
                          </Tr>
                        );
                      });
                    })()}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Items Received / Sent Tracking - Moved to End */}
        {data.workType === "outside" && (data.itemsSent || data.itemsReceived) && (
          <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="sm">
            <VStack align="stretch" spacing={5}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color="blue.800" display="flex" alignItems="center">
                    <Icon as={FiActivity} mr={2} color="blue.500" /> Items Received / Sent Tracking
                  </Heading>
                  <Text fontSize="xs" color="gray.500">Track all items sent to and received from the laboratory</Text>
                </VStack>
              </HStack>
              <Box borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden" mb={2}>
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th color="gray.600">Item Name</Th>
                      <Th textAlign="center" color="green.600">Received</Th>
                      <Th textAlign="center" color="blue.600">Sent</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[
                      { label: "Impression trays (Upper)", key: "impressionTraysUpper", type: "boolean" },
                      { label: "Impression trays (Lower)", key: "impressionTraysLower", type: "boolean" },
                      { label: "Models (Upper)", key: "modelsUpper", type: "boolean" },
                      { label: "Models (Lower)", key: "modelsLower", type: "boolean" },
                      { label: "Articulator", key: "articulator", type: "boolean" },
                      { label: "Implant Analog", key: "implantAnalog", type: "string" },
                      { label: "Implant Impression Coping", key: "implantImpressionCoping", type: "string" },
                      { label: "Implant Abutment", key: "implantAbutment", type: "string" },
                      { label: "Bite", key: "bite", type: "boolean" },
                      { label: "Certificate", key: "certificate", type: "boolean" },
                      { label: "Accessories", key: "accessories", type: "string" },
                    ].map((item, idx) => (
                      <Tr key={idx} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="600" color="gray.700">{item.label}</Td>
                        <Td textAlign="center">
                          {item.type === "boolean" ? (
                            data.itemsReceived?.[item.key] ? <CheckIcon color="green.500" /> : <CloseIcon color="gray.200" boxSize={2} />
                          ) : (
                            <Text color="gray.600" fontWeight="500">{data.itemsReceived?.[item.key] || "-"}</Text>
                          )}
                        </Td>
                        <Td textAlign="center">
                          {item.type === "boolean" ? (
                            data.itemsSent?.[item.key] ? <CheckIcon color="blue.500" /> : <CloseIcon color="gray.200" boxSize={2} />
                          ) : (
                            <Text color="gray.600" fontWeight="500">{data.itemsSent?.[item.key] || "-"}</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {data.returnableItems && (
                <Box p={4} borderRadius="xl" bg="blue.50" border="1px dashed" borderColor="blue.200">
                  <VStack align="start" spacing={1}>
                     <Text fontSize="xs" fontWeight="bold" color="blue.700">RETURNABLE ITEMS NOTE</Text>
                     <Text fontSize="sm" color="gray.800" fontWeight="500">{data.returnableItems}</Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
});

export default LabSheetView;

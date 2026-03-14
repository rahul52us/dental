"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Badge,
  Box,
  VStack,
  HStack,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { SearchIcon, InfoIcon, CalendarIcon, TimeIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import stores from "../../../store/stores";
import { formatDate } from "../../../component/config/utils/dateUtils";

interface AppointmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

const AppointmentHistoryModal = observer(
  ({ isOpen, onClose, patientId, patientName }: AppointmentHistoryModalProps) => {
    const {
      DoctorAppointment: { getPatientHistory },
    } = stores;

    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 5;

    const fetchHistory = async (page: number) => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const response = await getPatientHistory({
          patientId: patientId,
          page: page,
          limit: itemsPerPage,
        });

        if (response?.data) {
          setAppointments(response.data);
          setTotalPages(response.totalPages || 1);
          setTotalCount(response.totalCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch appointment history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (isOpen && patientId) {
        fetchHistory(currentPage);
      }
    }, [isOpen, patientId, currentPage]);

    const stats = useMemo(() => {
      // NOTE: These are stats for the current page only if using server-side stats.
      // For accurate global stats, we'd need another API or a summary field.
      // But for now, we'll show the total count from the response.
      return { total: totalCount };
    }, [totalCount]);

    const filteredAppointments = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return appointments;
      return appointments.filter(
        (a) =>
          a.description?.toLowerCase().includes(q) ||
          a.shiftOrCancelledReason?.toLowerCase().includes(q) ||
          a.title?.toLowerCase().includes(q) ||
          a.status?.toLowerCase().includes(q)
      );
    }, [appointments, searchQuery]);

    useEffect(() => {
      setCurrentPage(1);
    }, [patientId]);

    const getStatusStyles = (status: string) => {
      switch (status) {
        case "cancelled":
          return { color: "red", bg: "red.50", border: "red.100" };
        case "shift":
          return { color: "purple", bg: "purple.50", border: "purple.100" };
        default:
          return { color: "gray", bg: "gray.50", border: "gray.100" };
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
          {/* Header Section */}
          <ModalHeader p={6} bg="blue.600">
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="800" color="white" letterSpacing="tight">
                PATIENT RELIABILITY HISTORY
              </Text>
              <Text fontSize="sm" color="blue.50" fontWeight="medium" opacity={0.9}>
                Viewing timeline for: <Text as="span" fontWeight="bold" textDecoration="underline">{patientName}</Text>
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" top={4} right={4} />

          <ModalBody p={0} bg="gray.50">
            {/* Stats Dashboard */}
            <Box p={6} bg="white" borderBottom="1px solid" borderColor="gray.100" shadow="sm">
              <SimpleGrid columns={1} spacing={4}>
                <Stat bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                  <StatLabel color="blue.600" fontWeight="bold">Total Incidents Recorded</StatLabel>
                  <StatNumber color="blue.700" fontSize="2xl">{stats.total}</StatNumber>
                </Stat>
              </SimpleGrid>

              <InputGroup mt={6} size="lg">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Filter current view..."
                  borderRadius="xl"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ bg: "white", borderColor: "blue.400", shadow: "md" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Box>

            {/* List Body */}
            <Box maxH="450px" p={4}>
              {isLoading ? (
                <VStack p={12} spacing={4}>
                  <Text color="gray.500" fontWeight="bold">Fetching Records...</Text>
                </VStack>
              ) : filteredAppointments.length > 0 ? (
                <VStack align="stretch" spacing={4} pb={4}>
                  {filteredAppointments.map((app, index) => {
                    const styles = getStatusStyles(app.status);
                    return (
                      <Box
                        key={app._id}
                        bg="white"
                        p={5}
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="gray.100"
                        shadow="sm"
                        position="relative"
                        _hover={{ shadow: "md", borderColor: "blue.200", transform: "translateY(-2px)" }}
                        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                      >
                        <Flex justify="space-between" align="center" mb={3}>
                          <Badge
                            bg={styles.bg}
                            color={styles.color}
                            px={3}
                            py={1.5}
                            borderRadius="full"
                            textTransform="uppercase"
                            fontSize="xs"
                            fontWeight="800"
                          >
                            {app.status.replace(/-/g, " ")}
                          </Badge>
                          <HStack spacing={4} color="gray.400">
                            <HStack spacing={1}>
                              <CalendarIcon boxSize={3} />
                              <Text fontSize="xs" fontWeight="bold">{formatDate(app.appointmentDate)}</Text>
                            </HStack>
                            <HStack spacing={1}>
                              <TimeIcon boxSize={3} />
                              <Text fontSize="xs" fontWeight="bold">{app.startTime}</Text>
                            </HStack>
                          </HStack>
                        </Flex>

                        <Text fontWeight="800" fontSize="md" color="gray.800" mb={2} noOfLines={1}>
                          {app.title || "Standard Checkup"}
                        </Text>

                        {app.description && (
                          <Flex align="start" gap={2} mb={2}>
                            <Icon as={InfoIcon} color="blue.400" mt={1} />
                            <Text fontSize="sm" color="gray.600">
                              <Text as="span" fontWeight="bold" color="gray.700">Cause:</Text> {app.description}
                            </Text>
                          </Flex>
                        )}

                        {app.shiftOrCancelledReason && (
                          <Box
                            bg="orange.50"
                            p={3}
                            borderRadius="xl"
                            borderLeft="4px solid"
                            borderLeftColor="orange.400"
                          >
                            <Text fontSize="xs" color="orange.800" fontStyle="italic">
                              <Text as="span" fontWeight="bold">Note: </Text>
                              {app.shiftOrCancelledReason}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <VStack p={20} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
                  <Icon as={InfoIcon} boxSize={12} color="gray.200" />
                  <Text color="gray.400" fontWeight="bold" fontSize="lg">No Records Found</Text>
                  <Text color="gray.400" fontSize="sm">This patient has a clean history or no matching records.</Text>
                </VStack>
              )}
            </Box>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Flex justify="center" align="center" gap={4} p={6} bg="gray.100">
                <Button
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  isDisabled={currentPage === 1}
                  variant="outline"
                  bg="white"
                  borderRadius="lg"
                >
                  Previous
                </Button>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={currentPage === totalPages}
                  variant="outline"
                  bg="white"
                  borderRadius="lg"
                >
                  Next
                </Button>
              </Flex>
            )}
          </ModalBody>

          <ModalFooter bg="white" p={6} borderTop="1px solid" borderColor="gray.100">
            <Button
              variant="solid"
              colorScheme="blue"
              size="lg"
              borderRadius="xl"
              onClick={onClose}
              width="full"
              fontWeight="bold"
            >
              Finish Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

export default AppointmentHistoryModal;

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
  SimpleGrid,
  Flex,
  Icon,
  Spinner,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "@chakra-ui/icons";
import {
  FaCalendarAlt,
  FaUserMd,
  FaHistory,
} from "react-icons/fa";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { useColorModeValue } from "@chakra-ui/react";
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
      DoctorAppointment: { getPatientAuditTrail },
    } = stores;

    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalIncidents, setTotalIncidents] = useState(0);
    const itemsPerPage = 5;

    const fetchHistory = async (page: number) => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const response = await getPatientAuditTrail({
          patientId: patientId,
          page: page,
          limit: itemsPerPage,
        });

        if (response?.data) {
          setAppointments(response.data);
          setTotalPages(response.totalPages || 1);
          setTotalIncidents(response.totalIncidents || 0);
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

    // Flatten history entries for the timeline
    const allIncidents = useMemo(() => {
      const incidents: any[] = [];
      appointments.forEach((app) => {
        if (app.history && Array.isArray(app.history)) {
          app.history.forEach((h: any) => {
            if (["shift", "cancelled", "no-show"].includes(h.action)) {
              incidents.push({
                ...h,
                appointmentDate: app.appointmentDate,
                appointmentTime: app.startTime,
                doctorName: app.primaryDoctor?.name,
                originalDescription: app.description || app.title,
                originalId: app._id
              });
            }
          });
        }
      });
      return incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [appointments]);

    const bgColor = useColorModeValue("white", "gray.900");
    const textColor = useColorModeValue("gray.800", "white");
    const secondaryTextColor = useColorModeValue("gray.600", "whiteAlpha.700");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const cardBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const cardHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const timelineLineColor = useColorModeValue("gray.200", "whiteAlpha.200");

    const getActionColor = (action: string) => {
      switch (action) {
        case "cancelled": return "red";
        case "shift": return "purple";
        case "no-show": return "orange";
        default: return "blue";
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(8px)" bg={useColorModeValue("blackAlpha.300", "blackAlpha.800")} />
        <ModalContent
          borderRadius="3xl"
          overflow="hidden"
          boxShadow={useColorModeValue("0 20px 40px rgba(0,0,0,0.1)", "0 0 40px rgba(0,0,0,0.4)")}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          color={textColor}
          my={8}
        >
          {/* Luminous Header */}
          <ModalHeader p={8} position="relative" overflow="hidden" bg={bgColor}>
             <Box
              position="absolute"
              top="-20%"
              right="-10%"
              w="300px"
              h="300px"
              bgGradient={useColorModeValue("radial(purple.400, transparent 70%)", "radial(purple.600, transparent 70%)")}
              filter="blur(60px)"
              opacity={useColorModeValue(0.15, 0.4)}
              zIndex={0}
            />
            <VStack align="start" spacing={1} zIndex={1} position="relative">
              <HStack spacing={2}>
                <Icon as={FaHistory} color="purple.400" boxSize={3} />
                <Text fontSize="10px" fontWeight="900" letterSpacing="0.3em" color="purple.400" textTransform="uppercase">
                  Reliability Timeline
                </Text>
              </HStack>
              <Heading size="lg" fontWeight="900" letterSpacing="tight" color={textColor}>
                {patientName}
              </Heading>
              <Badge 
                px={3} 
                py={1} 
                borderRadius="full" 
                bg={useColorModeValue("purple.50", "whiteAlpha.100")} 
                color="purple.500" 
                fontSize="10px" 
                fontWeight="800" 
                mt={2}
                border="1px solid"
                borderColor={useColorModeValue("purple.100", "whiteAlpha.200")}
              >
                {totalIncidents} Total Historical Incidents
              </Badge>
            </VStack>
          </ModalHeader>
          <ModalCloseButton 
            color={useColorModeValue("gray.400", "whiteAlpha.500")} 
            size="lg" 
            top={6} 
            right={6} 
            borderRadius="full" 
            zIndex={10}
            _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100"), color: textColor }} 
          />

          <ModalBody p={6} position="relative" bg={bgColor}>
             {isLoading ? (
               <VStack p={24} spacing={6}>
                 <Spinner color="purple.500" size="xl" thickness="3px" speed="0.8s" />
                 <Text color={useColorModeValue("gray.400", "whiteAlpha.400")} fontSize="sm" fontWeight="800" letterSpacing="widest" textTransform="uppercase">
                   Syncing Audit Data...
                 </Text>
               </VStack>
             ) : allIncidents.length > 0 ? (
               <Box position="relative">
                  {/* Timeline Glow Path */}
                  <Box
                    position="absolute"
                    left="11px"
                    top="10px"
                    bottom="10px"
                    w="2px"
                    bgGradient={useColorModeValue(
                      "linear(to-b, purple.400, blue.400, gray.200)",
                      "linear(to-b, purple.500, blue.500, gray.800)"
                    )}
                    opacity={useColorModeValue(0.4, 0.2)}
                    borderRadius="full"
                  />

                  <VStack align="stretch" spacing={10} pl={10}>
                    {allIncidents.map((incident, idx) => {
                      const color = getActionColor(incident.action);
                      return (
                        <Box key={idx} position="relative">
                          {/* Pulsing Timeline Node */}
                          <Box
                            position="absolute"
                            left="-38px"
                            top="6px"
                            w="20px"
                            h="20px"
                            borderRadius="full"
                            bg={bgColor}
                            border="2px solid"
                            borderColor={`${color}.500`}
                            zIndex={2}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Box 
                              w="8px" 
                              h="8px" 
                              borderRadius="full" 
                              bg={`${color}.500`}
                              boxShadow={`0 0 10px var(--chakra-colors-${color}-500)`}
                            />
                          </Box>

                          <VStack align="start" spacing={4} w="100%">
                            {/* Incident Meta */}
                            <Flex w="100%" justify="space-between" align="center">
                               <HStack spacing={3}>
                                  <Badge
                                    bg={`${color}.500`}
                                    color="white"
                                    px={4}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="10px"
                                    fontWeight="900"
                                    boxShadow={useColorModeValue(`0 4px 12px var(--chakra-colors-${color}-200)`, `0 4px 12px var(--chakra-colors-${color}-900)`)}
                                  >
                                    {incident.action}
                                  </Badge>
                                  <Text fontSize="xs" fontWeight="800" color={secondaryTextColor}>
                                    {new Date(incident.timestamp).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </Text>
                               </HStack>
                               <Text fontSize="xs" color={useColorModeValue("gray.400", "whiteAlpha.400")} fontWeight="bold">
                                 {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </Text>
                            </Flex>

                            {/* Content Card (Glassmorphism) */}
                            <Box
                              bg={cardBg}
                              p={5}
                              borderRadius="2xl"
                              border="1px solid"
                              borderColor={borderColor}
                              w="100%"
                              backdropFilter="blur(5px)"
                              _hover={{ borderColor: "purple.200", bg: cardHoverBg, transform: "translateX(4px)" }}
                              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            >
                              <Text fontSize="md" mb={4} fontWeight="700" color={textColor} lineHeight="1.6">
                                "{incident.remarks || `The appointment was ${incident.action}ed.`}"
                              </Text>

                              <SimpleGrid columns={2} spacing={6} p={4} bg={useColorModeValue("white", "blackAlpha.300")} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                                 <VStack align="start" spacing={1}>
                                   <Text fontSize="9px" color={useColorModeValue("gray.400", "whiteAlpha.400")} textTransform="uppercase" fontWeight="900" letterSpacing="wider">Reason / Title</Text>
                                   <Text fontSize="xs" fontWeight="bold" noOfLines={1} color={textColor}>{incident.originalDescription || "--"}</Text>
                                 </VStack>
                                 <VStack align="start" spacing={1}>
                                   <Text fontSize="9px" color={useColorModeValue("gray.400", "whiteAlpha.400")} textTransform="uppercase" fontWeight="900" letterSpacing="wider">Action By</Text>
                                   <Text fontSize="xs" fontWeight="bold" noOfLines={1} color="purple.500">{incident.byName || "System"}</Text>
                                 </VStack>
                              </SimpleGrid>

                              <HStack spacing={6} mt={4} pt={2} px={1}>
                                 <HStack spacing={2}>
                                   <Icon as={FaUserMd} boxSize={3.5} color={useColorModeValue("gray.400", "whiteAlpha.400")} />
                                   <Text fontSize="11px" fontWeight="800" color={secondaryTextColor}>Dr. {incident.doctorName || "--"}</Text>
                                 </HStack>
                                 <HStack spacing={2}>
                                   <Icon as={FaCalendarAlt} boxSize={3.5} color={useColorModeValue("gray.400", "whiteAlpha.400")} />
                                   <Text fontSize="11px" fontWeight="800" color={secondaryTextColor}>Appt: {formatDate(incident.appointmentDate)}</Text>
                                 </HStack>
                              </HStack>
                            </Box>
                          </VStack>
                        </Box>
                      );
                    })}
                  </VStack>

                  {/* Modern Slim Pagination */}
                  {totalPages > 1 && (
                    <Flex justify="center" align="center" gap={6} mt={12} mb={4}>
                      <IconButton
                        aria-label="Previous"
                        icon={<ChevronLeftIcon />}
                        size="md"
                        variant="ghost"
                        color={useColorModeValue("gray.400", "whiteAlpha.600")}
                        borderRadius="full"
                        isDisabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100"), color: textColor }}
                      />
                      <Box px={4} py={1} borderRadius="full" bg={useColorModeValue("gray.50", "whiteAlpha.100")} border="1px solid" borderColor={borderColor}>
                        <Text color={secondaryTextColor} fontWeight="900" fontSize="xs">
                          {currentPage} / {totalPages}
                        </Text>
                      </Box>
                      <IconButton
                        aria-label="Next"
                        icon={<ChevronRightIcon />}
                        size="md"
                        variant="ghost"
                        color={useColorModeValue("gray.400", "whiteAlpha.600")}
                        borderRadius="full"
                        isDisabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100"), color: textColor }}
                      />
                    </Flex>
                  )}
               </Box>
             ) : (
               <VStack 
                 p={16} 
                 bg={useColorModeValue("gray.50", "whiteAlpha.50")} 
                 borderRadius="3xl" 
                 border="2px dashed" 
                 borderColor={useColorModeValue("gray.200", "whiteAlpha.100")} 
                 spacing={4}
               >
                 <Box p={6} borderRadius="full" bg={useColorModeValue("purple.50", "whiteAlpha.50")}>
                    <Icon as={InfoIcon} boxSize={8} color={useColorModeValue("purple.200", "whiteAlpha.300")} />
                 </Box>
                 <VStack spacing={1}>
                    <Text color={textColor} fontWeight="900" fontSize="lg">Excellent Reliability</Text>
                    <Text color={secondaryTextColor} fontSize="sm" textAlign="center" maxW="240px">
                      No significant incidents found for this patient.
                    </Text>
                 </VStack>
               </VStack>
             )}
          </ModalBody>

          <ModalFooter p={8} bg={bgColor} borderTop="1px solid" borderColor={borderColor}>
            <Button
              w="100%"
              h="56px"
              bgGradient={useColorModeValue("linear(to-r, purple.500, blue.500)", "linear(to-r, purple.600, blue.600)")}
              color="white"
              borderRadius="2xl"
              fontSize="md"
              fontWeight="900"
              letterSpacing="wider"
              _hover={{ transform: "scale(1.02)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              onClick={onClose}
              boxShadow={useColorModeValue("0 10px 20px rgba(90, 103, 216, 0.2)", "0 10px 30px rgba(90, 103, 216, 0.3)")}
            >
              FINISH REVIEW
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

export default AppointmentHistoryModal;

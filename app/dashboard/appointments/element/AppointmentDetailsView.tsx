"use client";

import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Link,
  Icon,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Flex,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaUser,
  FaMapMarkerAlt,
  FaLink,
  FaStickyNote,
  FaHistory,
  FaVideo,
} from "react-icons/fa";
import stores from "../../../store/stores";
import { observer } from "mobx-react-lite";
import AppointmentHistoryModal from "../component/AppointmentHistoryModal";

const statusColors: Record<string, string> = {
  scheduled: "blue",
  "in-progress": "yellow",
  completed: "green",
  cancelled: "red",
  shift: "purple",
  "no-show": "gray",
};

interface AppointmentDetailsViewProps {
  data: any;
}

const AppointmentDetailsView = observer(
  ({ data }: AppointmentDetailsViewProps) => {
    const [appointment, setAppointment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.100", "whiteAlpha.200");
    const primaryText = useColorModeValue("gray.800", "white");
    const secondaryText = useColorModeValue("gray.500", "gray.400");

    const {
      DoctorAppointment: { getAppointmentById },
      auth: { openNotification },
    } = stores;

    const fetchAppointmentView = async () => {
      if (!data?._id) return;

      setIsLoading(true);
      try {
        const response = await getAppointmentById({
          appointmentId: data._id,
        });

        if (response?.status === "success") {
          setAppointment(response?.data?.data);
        }
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Failed to get Appointment",
          message: err?.message || "Something went wrong",
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (data?._id) {
        fetchAppointmentView();
      }
    }, [data?._id]);

    /* ---------------- Skeleton Loader ---------------- */
    if (isLoading) {
      return (
        <Box p={{ base: 3, md: 6 }} bg={pageBg}>
          <Box p={{ base: 4, md: 5 }} mb={4} borderRadius="2xl" bgGradient="linear(125deg, #123B50 0%, #126C70 62%, #258F83 100%)">
            <Skeleton height="12px" width="38%" mb={3} />
            <Skeleton height="24px" width="70%" mb={4} />
            <Skeleton height="14px" width="55%" />
          </Box>
          <HStack justify="space-between" mb={4}>
            <Box flex={1}>
              <Skeleton height="20px" width="60%" mb={2} />
              <SkeletonText noOfLines={2} spacing={2} />
            </Box>
            <Skeleton height="28px" width="80px" borderRadius="full" />
          </HStack>

          {[1, 2, 3].map((_, i) => (
            <Card key={i} mb={3} bg={cardBg} borderRadius="2xl" overflow="hidden">
              <CardHeader py={4}>
                <Skeleton height="20px" width="200px" />
              </CardHeader>
              <Divider borderColor={cardBorder} />
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <SkeletonCircle size="6" />
                    <Skeleton height="14px" width="220px" />
                  </HStack>
                  <HStack>
                    <SkeletonCircle size="6" />
                    <Skeleton height="14px" width="180px" />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Box>
      );
    }

    /* ---------------- Empty State ---------------- */
    if (!appointment) {
      return (
        <Box p={{ base: 6, md: 10 }} textAlign="center" bg={cardBg} borderRadius="2xl">
          <Text fontSize="sm" fontWeight="700" color={secondaryText}>
            No appointment details found.
          </Text>
        </Box>
      );
    }

    const {
      title,
      description,
      appointmentDate,
      startTime,
      endTime,
      mode,
      meetingLink,
      location,
      status,
      primaryDoctor,
      additionalDoctors,
      patient,
      notes,
      createdBy,
    } = appointment;

    const color = statusColors[status] || "gray";

    const formattedDate = appointmentDate
      ? new Date(appointmentDate).toLocaleDateString('en-IN', {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    return (
      <Box
        w="100%"
        maxW="760px"
        mx="auto"
        p={{ base: 3, sm: 4, md: 6 }}
        bg={pageBg}
        borderRadius={{ base: "0", md: "2xl" }}
      >
        <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            color="white"
            bgGradient="linear(125deg, #123B50 0%, #126C70 62%, #258F83 100%)"
            boxShadow="0 12px 26px rgba(18, 83, 96, 0.18)"
          >
            <Flex align="start" justify="space-between" gap={3}>
              <Box minW={0}>
                <Text fontSize="10px" fontWeight="800" letterSpacing="1.1px" textTransform="uppercase" color="whiteAlpha.800">
                  Appointment overview
                </Text>
                <Heading mt={1.5} size={{ base: "md", md: "lg" }} noOfLines={2} letterSpacing="-0.4px">
                  {description || title || "Appointment details"}
                </Heading>
              </Box>
              {status && (
                <Badge
                  flexShrink={0}
                  colorScheme={color}
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  fontSize="xs"
                  textTransform="capitalize"
                  bg="whiteAlpha.900"
                >
                  {status.replace(/-/g, " ")}
                </Badge>
              )}
            </Flex>
            <HStack mt={4} spacing={2} wrap="wrap" rowGap={2} color="whiteAlpha.900" fontSize="sm" fontWeight="700">
              <Icon as={FaCalendarAlt} />
              <Text noOfLines={1}>{formattedDate}</Text>
              <Text opacity={0.7}>·</Text>
              <Icon as={FaClock} />
              <Text whiteSpace="nowrap">{startTime || "N/A"} – {endTime || "N/A"}</Text>
            </HStack>
          </Box>

          <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" boxShadow="0 4px 14px rgba(19, 52, 69, 0.045)">
            <CardHeader px={{ base: 4, md: 5 }} pt={4} pb={3}>
              <Heading size="sm" color={primaryText}>Appointment details</Heading>
            </CardHeader>
            <Divider borderColor={cardBorder} />
            <CardBody px={{ base: 4, md: 5 }} py={4}>
              <VStack align="stretch" spacing={3}>
                <HStack align="start" spacing={3}>
                  <Flex w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="12px" bg="blue.50" color="blue.600">
                    <Icon as={FaCalendarAlt} />
                  </Flex>
                  <Box minW={0}>
                    <Text fontSize="xs" color={secondaryText}>Date</Text>
                    <Text fontSize="sm" fontWeight="700" color={primaryText}>{formattedDate}</Text>
                  </Box>
                </HStack>
                <HStack align="start" spacing={3}>
                  <Flex w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="12px" bg="blue.50" color="blue.600">
                    <Icon as={FaClock} />
                  </Flex>
                  <Box minW={0}>
                    <Text fontSize="xs" color={secondaryText}>Time</Text>
                    <Text fontSize="sm" fontWeight="700" color={primaryText}>{startTime || "N/A"} – {endTime || "N/A"}</Text>
                  </Box>
                </HStack>
                <HStack align="start" spacing={3}>
                  <Flex w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="12px" bg="blue.50" color="blue.600">
                    <Icon as={mode === "online" ? FaVideo : FaMapMarkerAlt} />
                  </Flex>
                  <Box minW={0} flex={1}>
                    <Text fontSize="xs" color={secondaryText}>{mode === "online" ? "Mode" : "Location"}</Text>
                    <Flex align="center" justify="space-between" gap={2} wrap="wrap">
                      <Text fontSize="sm" fontWeight="700" color={primaryText}>
                        {mode === "online" ? "Online" : location || "Not provided"}
                      </Text>
                      {mode === "online" && meetingLink && (
                        <Link href={meetingLink} color="blue.500" isExternal fontSize="sm" fontWeight="700">
                          <Icon as={FaLink} mr={1} />
                          Join meeting
                        </Link>
                      )}
                    </Flex>
                  </Box>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {(primaryDoctor || additionalDoctors?.length > 0) && (
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" boxShadow="0 4px 14px rgba(19, 52, 69, 0.045)">
              <CardHeader px={{ base: 4, md: 5 }} pt={4} pb={3}>
                <Heading size="sm" color={primaryText}>Care team</Heading>
              </CardHeader>
              <Divider borderColor={cardBorder} />
              <CardBody px={{ base: 4, md: 5 }} py={4}>
                <VStack align="stretch" spacing={3}>
                  {primaryDoctor && (
                    <HStack align="start" spacing={3}>
                      <Flex w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="12px" bg="teal.50" color="teal.600">
                        <Icon as={FaUserMd} />
                      </Flex>
                      <Box minW={0}>
                        <Text fontSize="xs" color={secondaryText}>Primary doctor</Text>
                        <Text fontSize="sm" fontWeight="700" color={primaryText} wordBreak="break-word">
                          {primaryDoctor.name}{primaryDoctor.code ? ` (${primaryDoctor.code})` : ""}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                  {additionalDoctors?.length > 0 && (
                    <HStack align="start" spacing={3}>
                      <Flex w="34px" h="34px" flexShrink={0} align="center" justify="center" borderRadius="12px" bg="teal.50" color="teal.600">
                        <Icon as={FaUserMd} />
                      </Flex>
                      <Box minW={0}>
                        <Text fontSize="xs" color={secondaryText}>Assisted by</Text>
                        <Text fontSize="sm" fontWeight="700" color={primaryText} wordBreak="break-word">
                          {additionalDoctors.map((doctor: any) => doctor?.name).filter(Boolean).join(", ")}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {patient && (
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" boxShadow="0 4px 14px rgba(19, 52, 69, 0.045)">
              <CardHeader px={{ base: 4, md: 5 }} pt={4} pb={3}>
                <Heading size="sm" color={primaryText}>Patient information</Heading>
              </CardHeader>
              <Divider borderColor={cardBorder} />
              <CardBody px={{ base: 4, md: 5 }} py={4}>
                <VStack align="stretch" spacing={4}>
                  <HStack align="start" spacing={3}>
                    <Flex w="36px" h="36px" flexShrink={0} align="center" justify="center" borderRadius="12px" bg="purple.50" color="purple.600">
                      <Icon as={FaUser} />
                    </Flex>
                    <Box minW={0}>
                      <Text fontSize="xs" color={secondaryText}>Patient</Text>
                      <Text fontSize="sm" fontWeight="700" color={primaryText} wordBreak="break-word">
                        {patient.name || "N/A"}
                      </Text>
                      {patient.code && <Text fontSize="xs" color={secondaryText}>{patient.code}</Text>}
                    </Box>
                  </HStack>
                  <Button
                    leftIcon={<FaHistory />}
                    size="sm"
                    variant="outline"
                    colorScheme="purple"
                    borderRadius="xl"
                    fontSize="xs"
                    fontWeight="bold"
                    minH="44px"
                    w={{ base: "100%", sm: "fit-content" }}
                    onClick={() => setIsHistoryOpen(true)}
                    _hover={{ bg: "purple.50" }}
                  >
                    Reliability history
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}

          {notes && (
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl">
              <CardHeader px={{ base: 4, md: 5 }} pt={4} pb={3}>
                <Heading size="sm" color={primaryText}>Notes</Heading>
              </CardHeader>
              <Divider borderColor={cardBorder} />
              <CardBody px={{ base: 4, md: 5 }} py={4}>
                <HStack align="start" spacing={3}>
                  <Icon as={FaStickyNote} color="orange.500" mt={1} />
                  <Text fontSize="sm" color={primaryText} whiteSpace="pre-wrap">{notes}</Text>
                </HStack>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Footer */}
        {createdBy && (
          <>
            <Divider my={4} borderColor={cardBorder} />
            <Text fontSize="xs" color={secondaryText} textAlign={{ base: "left", md: "right" }}>
              Created by <b>{createdBy.name}</b> ({createdBy.code})
            </Text>
          </>
        )}

        <AppointmentHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          patientId={patient?._id}
          patientName={patient?.name}
        />
      </Box>
    );
  }
);

export default AppointmentDetailsView;
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
} from "@chakra-ui/react";
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

const statusColors: Record<string, string> = {
  scheduled: "blue",
  "in-progress": "yellow",
  completed: "green",
  cancelled: "red",
  rescheduled: "purple",
  "no-show": "gray",
};

export default function AppointmentDetailsView({ data }: { data: any }) {
  if (!data) return <Text>No appointment found.</Text>;

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
    history,
    createdBy,
  } = data;

  const color = statusColors[status] || "gray";

  return (
    <Box p={6} mx="auto" bg="white" shadow="lg" borderRadius="xl">
      {/* Header Section */}
      <HStack justify="space-between" align="start" mb={6}>
        <Box>
          <Heading size="lg" color="gray.800">
            {title}
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {description || "No description provided."}
          </Text>
        </Box>
        <Badge
          colorScheme={color}
          px={4}
          py={2}
          borderRadius="full"
          fontSize="sm"
          textTransform="capitalize"
        >
          {status.replace("-", " ")}
        </Badge>
      </HStack>

      {/* Appointment Info */}
      <Card mb={6} shadow="sm" borderRadius="lg">
        <CardHeader pb={2}>
          <Heading size="md">Appointment Details</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FaCalendarAlt} color="blue.500" />
              <Text>
                <b>Date:</b>{" "}
                {new Date(appointmentDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </HStack>

            <HStack>
              <Icon as={FaClock} color="blue.500" />
              <Text>
                <b>Time:</b> {startTime} – {endTime}
              </Text>
            </HStack>

            <HStack>
              {mode === "online" ? (
                <>
                  <Icon as={FaVideo} color="blue.500" />
                  <Text>
                    <b>Mode:</b> Online
                  </Text>
                  <Link
                    href={meetingLink}
                    color="blue.500"
                    isExternal
                    ml={2}
                    fontSize="sm"
                  >
                    <Icon as={FaLink} mr={1} />
                    Join Meeting
                  </Link>
                </>
              ) : (
                <>
                  <Icon as={FaMapMarkerAlt} color="blue.500" />
                  <Text>
                    <b>Location:</b> {location || "Not provided"}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Doctors Section */}
      <Card mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Doctors</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FaUserMd} color="teal.500" />
              <Text>
                <b>Primary Doctor:</b> {primaryDoctor?.name} (
                {primaryDoctor?.code})
              </Text>
            </HStack>
            {additionalDoctors?.length > 0 && (
              <HStack align="start">
                <Icon as={FaUserMd} color="teal.400" />
                <Text>
                  <b>Assisted By:</b>{" "}
                  {additionalDoctors.map((doc: any) => doc.name).join(", ")}
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Patient Section */}
      <Card mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Patient Information</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <HStack>
            <Icon as={FaUser} color="purple.500" />
            <Text>
              <b>Name:</b> {patient?.name} ({patient?.code})
            </Text>
          </HStack>
        </CardBody>
      </Card>

      {/* Notes Section */}
      {notes?.length > 0 && (
        <Card mb={6}>
          <CardHeader pb={2}>
            <Heading size="md">
              <Icon as={FaStickyNote} color="orange.400" mr={2} />
              Doctor Notes
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="start" spacing={3}>
              {notes.map((n: any, idx: number) => (
                <Box
                  key={idx}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderWidth="1px"
                  w="full"
                >
                  <Text fontSize="sm" color="gray.700">
                    {n.text}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(n.createdAt).toLocaleString()}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* History Section */}
      {history?.length > 0 && (
        <Card mb={6}>
          <CardHeader pb={2}>
            <Heading size="md">
              <Icon as={FaHistory} color="blue.400" mr={2} />
              Status History
            </Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="start" spacing={3}>
              {history.map((h: any, idx: number) => (
                <Box
                  key={idx}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderWidth="1px"
                  w="full"
                >
                  <Text fontSize="sm">
                    <b>Action:</b> {h.action}
                  </Text>
                  {h.remarks && (
                    <Text fontSize="sm" color="gray.600">
                      <b>Remarks:</b> {h.remarks}
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.500">
                    {new Date(h.timestamp).toLocaleString()}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Created By */}
      <Divider />
      <Text fontSize="sm" color="gray.500" mt={3} textAlign="right">
        Created by <b>{createdBy?.name}</b> ({createdBy?.code})
      </Text>
    </Box>
  );
}

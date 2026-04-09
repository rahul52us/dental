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
  CardBody,
  Icon,
  Skeleton,
  SkeletonText,
  Grid,
  Avatar,
  Circle,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaUserMd, FaUser, FaTooth, FaCalendarAlt, FaNotesMedical, FaStethoscope } from "react-icons/fa";
import stores from "../../../store/stores";
import { observer } from "mobx-react-lite";
import { formatDate } from "../../../component/config/utils/dateUtils";
import { getTeethByType } from "../../../component/common/TeethModel/DentalChartComponent/utils/teethData";

const statusColors: Record<string, string> = {
  pending: "orange",
  "in-progress": "blue",
  completed: "green",
  cancelled: "red",
};

interface TreatmentDetailsViewProps {
  data: any;
}

const TreatmentDetailsView = observer(({ data }: TreatmentDetailsViewProps) => {
  const [treatment, setTreatment] = useState<any>(data);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    toothTreatmentStore: { getToothTreatmentById },
    auth: { openNotification },
  } = stores;

  const fetchTreatment = async () => {
    const id = data?._id || data?.id;
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await getToothTreatmentById({
        treatmentId: id,
      });

      if (response?.status === "success" || response?.status === true || response?.success === "success" || response?.success === true) {
        setTreatment(response?.data);
      }
    } catch (err: any) {
      console.error("TreatmentDetailsView: Fetch error:", err);
      openNotification({
        type: "error",
        title: "Failed to get treatment details",
        message: err?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatment();
  }, [data?._id]);

  if (isLoading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" width="60%" mb={6} borderRadius="lg" />
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Skeleton height="200px" borderRadius="2xl" />
          <Skeleton height="200px" borderRadius="2xl" />
          <Skeleton height="300px" gridColumn="span 2" borderRadius="2xl" />
        </Grid>
      </Box>
    );
  }

  if (!treatment) {
    return (
      <Box p={10} textAlign="center">
        <Icon as={FaNotesMedical} size="50px" color="gray.300" mb={4} />
        <Text color="gray.500" fontWeight="600">No treatment record found.</Text>
      </Box>
    );
  }

  const {
    patient,
    doctor,
    tooth,
    treatmentDate,
    status,
    notes,
    treatmentPlan,
    complaintType,
    examiningDoctor,
    createdBy,
    createdAt,
    toothNotation,
    dentitionType
  } = treatment;

  const color = statusColors[status] || "gray";

  // Notation logic
  const notation = toothNotation || "fdi";
  const dentition = dentitionType || "adult";
  const allTeeth = getTeethByType(dentition as any);
  const toothObj = allTeeth.find(t => t.id === tooth);
  const toothUniversal = toothObj?.universal || "--";
  const toothPalmer = toothObj?.palmer || "--";

  return (
    <Box p={6} bg="gray.50" borderRadius="3xl" maxH="85vh" overflowY="auto" sx={{
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.05)', borderRadius: '10px' }
    }}>
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
          <HStack justify="space-between" align="center">
            <HStack spacing={5}>
              <Circle size="64px" bg={`${color}.50`} color={`${color}.500`} shadow="inner">
                <Icon as={FaTooth} size="28px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <HStack mb={1}>
                  <Badge colorScheme={color} variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                    {status || "Pending"}
                  </Badge>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="0.1em">TREATMENT RECORD</Text>
                </HStack>
                <Heading size="lg" fontWeight="900" color="gray.800">
                  {patient?.name || "Anonymous Patient"}
                </Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="600">
                  {notation.toUpperCase()} ID: <Box as="span" color="blue.600" fontWeight="800">{tooth || "--"}</Box> | Universal: {toothUniversal} | Palmer: {toothPalmer}
                </Text>
              </VStack>
            </HStack>
            <VStack align="end" spacing={1}>
              <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="wider">SERVICE DATE</Text>
              <HStack color="gray.700">
                <Icon as={FaCalendarAlt} size="14px" />
                <Text fontWeight="800" fontSize="lg">{formatDate(treatmentDate)}</Text>
              </HStack>
            </VStack>
          </HStack>
        </Card>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          {/* Clinical Context */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
            <VStack align="start" spacing={4} w="full">
              <HStack w="full" justify="space-between">
                <HStack>
                  <Icon as={FaStethoscope} color="blue.500" />
                  <Heading size="sm" color="gray.700">Clinical Context</Heading>
                </HStack>
              </HStack>
              <Divider />
              <VStack align="stretch" w="full" spacing={4}>
                <Box>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" mb={1} textTransform="uppercase">Complaint Type</Text>
                  <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="lg" fontSize="xs">
                    {complaintType || "No Complaint Specified"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" mb={1} textTransform="uppercase">Procedure Planned</Text>
                  <Text fontWeight="800" color="gray.700" fontSize="md">
                    {treatmentPlan || "General Consultation"}
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </Card>

          {/* Assigned Staff */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
            <VStack align="start" spacing={4} w="full">
              <HStack>
                <Icon as={FaUserMd} color="teal.500" />
                <Heading size="sm" color="gray.700">Medical Team</Heading>
              </HStack>
              <Divider />
              <VStack align="stretch" w="full" spacing={4}>
                <HStack spacing={4}>
                  <Avatar size="sm" name={doctor?.name} src={doctor?.photo} />
                  <Box>
                    <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase">Assign Doctor</Text>
                    <Text fontWeight="800" color="gray.700">{doctor?.name || "Unassigned"}</Text>
                  </Box>
                </HStack>
                {examiningDoctor && (
                  <HStack spacing={4}>
                    <Avatar size="sm" name={examiningDoctor?.name} src={examiningDoctor?.photo} />
                    <Box>
                      <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase">Examining Doctor</Text>
                      <Text fontWeight="800" color="gray.700">{examiningDoctor?.name}</Text>
                    </Box>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </Card>

          {/* Notes & Clinical Findings */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6} gridColumn={{ lg: "span 2" }}>
            <VStack align="start" spacing={4} w="full">
              <HStack>
                <Icon as={FaNotesMedical} color="orange.500" />
                <Heading size="sm" color="gray.700">Clinical Findings & Notes</Heading>
              </HStack>
              <Divider />
              <Box w="full" bg="gray.50" p={5} borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                <Text color="gray.700" whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall" fontWeight="500">
                  {notes || "No clinical notes provided for this record."}
                </Text>
              </Box>
            </VStack>
          </Card>

          {/* Administrative Info */}
          <Card variant="unstyled" bg="gray.800" borderRadius="3xl" boxShadow="xl" p={6} gridColumn={{ lg: "span 2" }}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="900" color="gray.500" textTransform="uppercase">Record Created</Text>
                <Text color="white" fontWeight="700">{formatDate(createdAt)}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase" letterSpacing="wider">DENTITION</Text>
                <Badge colorScheme={dentition === "child" ? "pink" : "blue"} variant="solid" borderRadius="full">{dentition.toUpperCase()}</Badge>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="900" color="gray.500" textTransform="uppercase">Reference ID</Text>
                <Text color="white" fontWeight="700" fontSize="xs" fontFamily="mono">{treatment._id}</Text>
              </VStack>
            </Grid>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
});

export default TreatmentDetailsView;

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
    if (!data?._id) return;

    try {
      console.log("TreatmentDetailsView: Fetching for ID:", data?._id);
      const response = await getToothTreatmentById({
        treatmentId: data?._id,
      });
      console.log("TreatmentDetailsView: Response received:", response);

      if (response?.status === "success" || response?.status === true || response?.success === "success" || response?.success === true) {
        setTreatment(response?.data);
      } else {
        console.warn("TreatmentDetailsView: Invalid response:", response);
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
  } = treatment;

  const color = statusColors[status] || "gray";

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
                  Tooth FDI: <Box as="span" color="blue.600" fontWeight="800">{tooth?.fdi || "--"}</Box> | Universal: {tooth?.universal || "--"} | Palmer: {tooth?.palmer || "--"}
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
          {/* Procedure Detail */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6} gridColumn="span 2">
            <VStack align="start" spacing={5} w="full">
              <HStack w="full" justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="wider">PROCEDURE / TREATMENT PLAN</Text>
                  <Heading size="md" fontWeight="900" color="blue.700">
                    {treatmentPlan || "General Clinical Procedure"}
                  </Heading>
                </VStack>
                {complaintType && (
                  <Badge colorScheme="red" variant="subtle" borderRadius="xl" px={4} py={2} fontSize="sm" fontWeight="bold">
                    <Icon as={FaStethoscope} mr={2} />
                    {complaintType}
                  </Badge>
                )}
              </HStack>
              
              <Divider borderColor="gray.50" />
              
              <VStack align="start" spacing={3} w="full">
                <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="wider">CLINICAL OBSERVATIONS & NOTES</Text>
                <Box p={5} bg="gray.50" borderRadius="2xl" w="full" borderLeft="6px solid" borderColor="blue.100">
                  <Text fontSize="md" color="gray.700" lineHeight="1.6" whiteSpace="pre-wrap" fontStyle={notes ? "normal" : "italic"}>
                    {notes || "No clinical observations recorded for this procedure."}
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </Card>

          {/* Medical Team Card */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
            <VStack align="start" spacing={5}>
              <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="wider">CLINICAL MEDICAL TEAM</Text>
              
              <HStack spacing={4} w="full">
                <Avatar size="md" name={doctor?.name} bg="teal.50" color="teal.500" border="2px solid" borderColor="teal.100" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="10px" fontWeight="900" color="teal.500" letterSpacing="wider">PERFORMING DOCTOR</Text>
                  <Text fontWeight="800" fontSize="md" color="gray.800">{doctor?.name || "Not Assigned"}</Text>
                  <Text fontSize="xs" color="gray.500">{doctor?.code || "No Code"}</Text>
                </VStack>
              </HStack>

              <Divider borderColor="gray.50" />

              <HStack spacing={4} w="full">
                <Avatar size="md" name={examiningDoctor?.name || (typeof examiningDoctor === 'string' ? examiningDoctor : 'Unassigned')} bg="blue.50" color="blue.500" border="2px solid" borderColor="blue.100" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="wider">EXAMINING DOCTOR</Text>
                  <Text fontWeight="800" fontSize="md" color="gray.800">
                    {examiningDoctor?.name || (typeof examiningDoctor === 'string' ? examiningDoctor : "Not Assigned")}
                  </Text>
                  <Text fontSize="xs" color="gray.500">{examiningDoctor?.code || ""}</Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Patient Info & Metadata */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
            <VStack align="start" spacing={5}>
              <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="wider">RECORD INFORMATION</Text>
              
              <HStack spacing={4} w="full">
                <Avatar size="md" name={patient?.name} bg="purple.50" color="purple.500" border="2px solid" borderColor="purple.100" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="10px" fontWeight="900" color="purple.500" letterSpacing="wider">PATIENT PROFILE</Text>
                  <Text fontWeight="800" fontSize="md" color="gray.800">{patient?.name}</Text>
                  <Text fontSize="xs" color="gray.500">ID: {patient?.code || "N/A"}</Text>
                </VStack>
              </HStack>

              <Divider borderColor="gray.50" />

              <VStack align="start" spacing={1}>
                <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="wider">AUDIT LOG</Text>
                <Text fontSize="xs" color="gray.600" fontWeight="600">
                  Recorded by <Box as="span" color="gray.800" fontWeight="800">{createdBy?.name || "System Administrator"}</Box>
                </Text>
                <Text fontSize="11px" color="gray.400">
                  Created on {formatDate(createdAt)}
                </Text>
              </VStack>
            </VStack>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
});

export default TreatmentDetailsView;

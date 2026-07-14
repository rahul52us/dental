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
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCoins, FaUserMd, FaUser, FaTooth, FaCalendarAlt, FaNotesMedical, FaStethoscope } from "react-icons/fa";
import stores from "../../../store/stores";
import { observer } from "mobx-react-lite";
import { formatDate } from "../../../component/config/utils/dateUtils";
import { getTeethByType } from "../../../component/common/TeethModel/DentalChartComponent/utils/teethData";

const statusColors: Record<string, string> = {
  pending: "orange",
  "in-progress": "blue",
  complete: "green",
  completed: "green",
  cancelled: "red",
};

interface TreatmentDetailsViewProps {
  data: any | any[];
}


const TreatmentDetailsView = observer(({ data }: TreatmentDetailsViewProps) => {
  const isMultiple = Array.isArray(data);
  const [activeRecordIndex, setActiveRecordIndex] = useState(0);
  const currentData = isMultiple ? data[activeRecordIndex] : data;

  const [treatment, setTreatment] = useState<any>(currentData);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const {
    toothTreatmentStore: { getToothTreatmentById },
    auth: { openNotification },
  } = stores;

  const fetchTreatment = async () => {
    const id = typeof currentData === "string" ? currentData : (currentData?._id || currentData?.id);
    if (!id) return;

    // If it's a Work Done record, we already have all details populated in currentData!
    // We set it as treatment and skip fetching since getToothTreatmentById would fail.
    if (currentData && (currentData.workDoneNote !== undefined || currentData.amount !== undefined)) {
      setTreatment(currentData);
      return;
    }

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
    setTreatment(currentData);
    fetchTreatment();
  }, [currentData?._id || (typeof currentData === "string" ? currentData : "")]);



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
    dentitionType,
    estimateMin,
    estimateMax,
    discount,
    totalMin,
    totalMax,
    // Work Done specific fields
    workDoneNote,
    toothNote,
    amount,
    treatmentCode,
  } = treatment;

  const color = statusColors[status] || "gray";

  // Notation logic
  const notation = toothNotation || "fdi";
  const dentition = dentitionType || "adult";
  const allTeeth = getTeethByType(dentition as any);
  const toothObj = allTeeth.find(t => t.id === tooth);

  const toothDisplayNumber = (() => {
    if (typeof tooth === "object" && tooth !== null) {
      return tooth[notation] || tooth.fdi || "--";
    }
    if (!toothObj) return tooth || "--";
    if (notation === "universal") return toothObj.universal;
    if (notation === "palmer") return toothObj.palmer;
    return toothObj.fdi || toothObj.id;
  })();

  return (
    <Box p={6} bg="gray.50" borderRadius="3xl" maxH="85vh" overflowY="auto" sx={{
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.05)', borderRadius: '10px' }
    }}>
      <VStack spacing={6} align="stretch">
        {/* Record Selection (If Multiple) */}
        {isMultiple && data.length > 1 && (
          <HStack spacing={3} overflowX="auto" pb={2} px={1}>
            {data.map((rec: any, idx: number) => (
              <Button
                key={rec._id || idx}
                size="sm"
                borderRadius="full"
                variant={activeRecordIndex === idx ? "solid" : "outline"}
                colorScheme={activeRecordIndex === idx ? "blue" : "gray"}
                onClick={() => setActiveRecordIndex(idx)}
                flexShrink={0}
                px={6}
                fontWeight="900"
              >
                {formatDate(rec.treatmentDate || rec.createdAt)} - {rec.complaintType?.split(' ')[0] || "Record"}
              </Button>
            ))}
          </HStack>
        )}

        {/* Header Section */}

        <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
          <HStack justify="space-between" align="center">
            <HStack spacing={6} align="center">
              {/* Premium Tooth Badge */}
              <VStack
                spacing={1}
                border="1px solid"
                borderColor="blue.100"
                bg="blue.50/40"
                borderRadius="2xl"
                p={3}
                minW="110px"
                h="100px"
                align="center"
                justify="center"
                boxShadow="sm"
              >
                <Text fontSize="32px" fontWeight="1000" color="blue.800" lineHeight="1">
                  {toothDisplayNumber}
                </Text>
                <Text fontSize="9px" fontWeight="1000" color="blue.500" letterSpacing="0.05em" textTransform="uppercase" textAlign="center" lineHeight="tight">
                  {toothObj ? `${toothObj.side} ${toothObj.position}` : "GENERAL"}
                </Text>
                <Text fontSize="8px" fontWeight="1000" color="gray.500" letterSpacing="0.05em" textTransform="uppercase" textAlign="center" lineHeight="tight">
                  {toothObj ? toothObj.name.replace(/primary|left|right|upper|lower/gi, "").trim().replace(/\s+/g, " ") : "RECORD"}
                </Text>
              </VStack>
              <VStack align="start" spacing={0}>
                <HStack mb={1}>
                  <Badge colorScheme={color} variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                    {status || "Pending"}
                  </Badge>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" letterSpacing="0.1em">
                    {workDoneNote !== undefined || amount !== undefined ? "WORK DONE RECORD" : "TREATMENT RECORD"}
                  </Text>
                </HStack>
                <Heading size="lg" fontWeight="900" color="gray.800">
                  {patient?.name || "Anonymous Patient"}
                </Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="600" mt={0.5}>
                  {notation.toUpperCase()} ID: <Box as="span" color="blue.600" fontWeight="800">{toothDisplayNumber}</Box>
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

              <VStack align="stretch" w="full" spacing={4}>
                <Box>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" mb={1} textTransform="uppercase">Complaint Type</Text>
                  <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="lg" fontSize="xs">
                    {complaintType || "No Complaint Specified"}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="900" color="gray.400" mb={1} textTransform="uppercase">
                    {workDoneNote !== undefined || amount !== undefined ? "Procedure Completed" : "Procedure Planned"}
                  </Text>
                  <Text fontWeight="800" color="gray.700" fontSize="md">
                    {treatmentPlan || treatmentCode || "General Consultation"}
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </Card>

          {/* Assigned Staff */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6}>
            <VStack align="start" spacing={4} w="full">
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

                    <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6} gridColumn={{ lg: "span 2" }}>
            <VStack align="start" spacing={4} w="full">
              <HStack>
                <Icon as={FaNotesMedical} color="orange.500" />
                <Heading size="sm" color="gray.700">Clinical Findings & Notes</Heading>
              </HStack>
              <Divider />
              <Box w="full" bg="gray.50" p={5} borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                <Text color="gray.700" whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall" fontWeight="500">
                  {notes || workDoneNote || toothNote || "No clinical notes provided for this record."}
                </Text>
              </Box>
            </VStack>
          </Card>


          {/* Financial Summary */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6} gridColumn={{ lg: "span 2" }}>
            <VStack align="start" spacing={4} w="full">
              <HStack>
                <Icon as={FaCoins} color="green.500" />
                <Heading size="sm" color="gray.700">
                  {workDoneNote !== undefined || amount !== undefined ? "Billing Summary" : "Financial Summary"}
                </Heading>
              </HStack>
              <Divider />
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
                <VStack align="start" spacing={1} p={4} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
                  <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.05em" textTransform="uppercase">
                    {workDoneNote !== undefined || amount !== undefined ? "Actual Amount" : "Gross Estimate"}
                  </Text>
                  <Text fontSize="18px" fontWeight="1000" color="blue.700">
                    {workDoneNote !== undefined || amount !== undefined
                      ? `₹${(amount || 0).toLocaleString()}`
                      : estimateMin === estimateMax
                        ? `₹${(estimateMin || 0).toLocaleString()}`
                        : `₹${(estimateMin || 0).toLocaleString()} - ₹${(estimateMax || 0).toLocaleString()}`}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1} p={4} bg="red.50" borderRadius="2xl" border="1px solid" borderColor="red.100">
                  <Text fontSize="10px" fontWeight="900" color="red.500" letterSpacing="0.05em" textTransform="uppercase">Discount</Text>
                  <Text fontSize="18px" fontWeight="1000" color="red.600">₹{(discount || 0).toLocaleString()}</Text>
                </VStack>
                <VStack align="start" spacing={1} p={4} bg="green.50" borderRadius="2xl" border="1px solid" borderColor="green.100">
                  <Text fontSize="10px" fontWeight="900" color="green.600" letterSpacing="0.05em" textTransform="uppercase">
                    {workDoneNote !== undefined || amount !== undefined ? "Net Total Paid" : "Net Total (Estimated)"}
                  </Text>
                  <Text fontSize="20px" fontWeight="1000" color="green.700">
                    {workDoneNote !== undefined || amount !== undefined
                      ? `₹${((amount || 0) - (discount || 0)).toLocaleString()}`
                      : totalMin === totalMax
                        ? `₹${(totalMin || 0).toLocaleString()}`
                        : `₹${(totalMin || 0).toLocaleString()} - ₹${(totalMax || 0).toLocaleString()}`}
                  </Text>
                </VStack>
              </Grid>
            </VStack>
          </Card>

          {/* Notes & Clinical Findings */}

          {/* Administrative Info */}
          <Card variant="unstyled" bg="white" borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.03)" p={6} gridColumn={{ lg: "span 2" }}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase">Record Created</Text>
                <Text color="gray.700" fontWeight="800">{formatDate(createdAt)}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase" letterSpacing="wider">DENTITION</Text>
                <Badge colorScheme={dentition === "child" ? "pink" : "blue"} variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs">{dentition.toUpperCase()}</Badge>
              </VStack>
            </Grid>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
});

export default TreatmentDetailsView;

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
  Flex,
  SimpleGrid,
  useColorModeValue,
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

  const cardBg = useColorModeValue("white", "gray.800");
  const outerBg = useColorModeValue("gray.50", "gray.900");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "gray.100");
  const textSecondary = useColorModeValue("gray.700", "gray.200");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toothBadgeBg = useColorModeValue("blue.50", "rgba(59, 130, 246, 0.15)");
  const toothBadgeBorder = useColorModeValue("blue.100", "rgba(59, 130, 246, 0.3)");
  const toothNumberColor = useColorModeValue("blue.800", "blue.200");
  const bentoBlueBg = useColorModeValue("blue.50", "rgba(59, 130, 246, 0.1)");
  const bentoBlueBorder = useColorModeValue("blue.100", "rgba(59, 130, 246, 0.2)");
  const bentoRedBg = useColorModeValue("red.50", "rgba(239, 68, 68, 0.1)");
  const bentoRedBorder = useColorModeValue("red.100", "rgba(239, 68, 68, 0.2)");
  const bentoGreenBg = useColorModeValue("green.50", "rgba(34, 197, 94, 0.1)");
  const bentoGreenBorder = useColorModeValue("green.100", "rgba(34, 197, 94, 0.2)");

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
    <Box
      p={{ base: 2, sm: 3, md: 5 }}
      bg={outerBg}
      borderRadius={{ base: "xl", md: "3xl" }}
      w="full"
      maxW="100%"
      overflowX="hidden"
    >
      <VStack spacing={{ base: 3, md: 5 }} align="stretch" w="full">
        {/* Record Selection (If Multiple) */}
        {isMultiple && data.length > 1 && (
          <HStack
            spacing={2}
            overflowX="auto"
            pb={1.5}
            px={1}
            w="full"
            sx={{
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {data.map((rec: any, idx: number) => (
              <Button
                key={rec._id || idx}
                size="xs"
                h="30px"
                borderRadius="full"
                variant={activeRecordIndex === idx ? "solid" : "outline"}
                colorScheme={activeRecordIndex === idx ? "blue" : "gray"}
                onClick={() => setActiveRecordIndex(idx)}
                flexShrink={0}
                px={4}
                fontWeight="800"
                fontSize="11px"
              >
                {formatDate(rec.treatmentDate || rec.createdAt)} - {rec.complaintType?.split(" ")[0] || "Record"}
              </Button>
            ))}
          </HStack>
        )}

        {/* Header Section */}
        <Card
          variant="unstyled"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={{ base: "20px", md: "3xl" }}
          boxShadow="0 4px 20px rgba(0,0,0,0.03)"
          p={{ base: 3.5, sm: 4, md: 6 }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={{ base: 3, md: 6 }}
          >
            {/* Top / Left: Tooth Squircle + Patient Details */}
            <Flex align="center" gap={{ base: 3, md: 5 }} minW={0} flex={1}>
              {/* Premium Tooth Badge */}
              <VStack
                spacing={0.5}
                border="1px solid"
                borderColor={toothBadgeBorder}
                bg={toothBadgeBg}
                borderRadius="2xl"
                p={{ base: 2, md: 3 }}
                minW={{ base: "72px", sm: "85px", md: "110px" }}
                h={{ base: "76px", sm: "85px", md: "100px" }}
                align="center"
                justify="center"
                boxShadow="sm"
                flexShrink={0}
              >
                <Text
                  fontSize={{ base: "22px", sm: "26px", md: "32px" }}
                  fontWeight="1000"
                  color={toothNumberColor}
                  lineHeight="1"
                >
                  {toothDisplayNumber}
                </Text>
                <Text
                  fontSize={{ base: "8px", md: "9px" }}
                  fontWeight="1000"
                  color="blue.400"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  textAlign="center"
                  lineHeight="tight"
                  noOfLines={1}
                >
                  {toothObj ? `${toothObj.side} ${toothObj.position}` : "GENERAL"}
                </Text>
                <Text
                  fontSize={{ base: "7.5px", md: "8px" }}
                  fontWeight="1000"
                  color={textMuted}
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  textAlign="center"
                  lineHeight="tight"
                  noOfLines={1}
                >
                  {toothObj ? toothObj.name.replace(/primary|left|right|upper|lower/gi, "").trim().replace(/\s+/g, " ") : "RECORD"}
                </Text>
              </VStack>

              {/* Patient Identity & Badges */}
              <Box flex={1} minW={0}>
                <HStack mb={1.5} spacing={1.5} wrap="wrap">
                  <Badge
                    colorScheme={color}
                    variant="solid"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="10px"
                    fontWeight="800"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    whiteSpace="nowrap"
                    flexShrink={0}
                  >
                    {status || "Pending"}
                  </Badge>
                  <Badge
                    bg={useColorModeValue("purple.50", "rgba(168, 85, 247, 0.15)")}
                    color={useColorModeValue("purple.700", "purple.200")}
                    border="1px solid"
                    borderColor={useColorModeValue("purple.200", "rgba(168, 85, 247, 0.3)")}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="9.5px"
                    fontWeight="800"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    whiteSpace="nowrap"
                    flexShrink={0}
                  >
                    {workDoneNote !== undefined || amount !== undefined ? "Work Done Record" : "Treatment Record"}
                  </Badge>
                </HStack>
                <Heading
                  fontSize={{ base: "17px", sm: "20px", md: "24px" }}
                  fontWeight="900"
                  color={textPrimary}
                  noOfLines={1}
                  letterSpacing="-0.3px"
                >
                  {patient?.name || "Anonymous Patient"}
                </Heading>
                <Text fontSize="12px" color={textMuted} fontWeight="600" mt={0.5}>
                  {notation.toUpperCase()} ID:{" "}
                  <Box as="span" color="blue.400" fontWeight="800">
                    {toothDisplayNumber}
                  </Box>
                </Text>
              </Box>
            </Flex>

            {/* Service Date Strip */}
            <Flex
              justify={{ base: "space-between", md: "flex-end" }}
              align="center"
              pt={{ base: 2.5, md: 0 }}
              borderTop={{ base: "1px dashed", md: "none" }}
              borderColor={borderColor}
              gap={2}
              flexShrink={0}
            >
              <Text fontSize="10px" fontWeight="900" color={textMuted} letterSpacing="wider" textTransform="uppercase">
                Service Date
              </Text>
              <HStack color={textSecondary} spacing={1.5}>
                <Icon as={FaCalendarAlt} size="13px" color="blue.400" />
                <Text fontWeight="800" fontSize={{ base: "13px", md: "md" }}>
                  {formatDate(treatmentDate)}
                </Text>
              </HStack>
            </Flex>
          </Flex>
        </Card>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={{ base: 3, md: 5 }}>
          {/* Clinical Context */}
          <Card
            variant="unstyled"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: "20px", md: "3xl" }}
            boxShadow="0 4px 20px rgba(0,0,0,0.03)"
            p={{ base: 3.5, sm: 4, md: 6 }}
          >
            <VStack align="stretch" w="full" spacing={3}>
              <Box>
                <Text fontSize="10px" fontWeight="900" color={textMuted} mb={1} textTransform="uppercase" letterSpacing="0.05em">
                  Complaint Type
                </Text>
                <Badge colorScheme="purple" variant="subtle" px={2.5} py={1} borderRadius="lg" fontSize="11px" fontWeight="750">
                  {complaintType || "No Complaint Specified"}
                </Badge>
              </Box>
              <Box pt={2} borderTop="1px dashed" borderColor={borderColor}>
                <Text fontSize="10px" fontWeight="900" color={textMuted} mb={1} textTransform="uppercase" letterSpacing="0.05em">
                  {workDoneNote !== undefined || amount !== undefined ? "Procedure Completed" : "Procedure Planned"}
                </Text>
                <Text fontWeight="850" color={textSecondary} fontSize={{ base: "14px", md: "15px" }}>
                  {treatmentPlan || treatmentCode || "General Consultation"}
                </Text>
              </Box>
            </VStack>
          </Card>

          {/* Assigned Staff */}
          <Card
            variant="unstyled"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: "20px", md: "3xl" }}
            boxShadow="0 4px 20px rgba(0,0,0,0.03)"
            p={{ base: 3.5, sm: 4, md: 6 }}
          >
            <VStack align="stretch" w="full" spacing={3}>
              <HStack spacing={3}>
                <Avatar size="sm" boxSize="36px" name={doctor?.name} src={doctor?.photo} borderRadius="12px" />
                <Box minW={0} flex={1}>
                  <Text fontSize="10px" fontWeight="900" color={textMuted} textTransform="uppercase" letterSpacing="0.05em">
                    Assigned Doctor
                  </Text>
                  <Text fontWeight="850" color={textSecondary} fontSize={{ base: "14px", md: "15px" }} noOfLines={1}>
                    {doctor?.name || "Unassigned"}
                  </Text>
                </Box>
              </HStack>
              {examiningDoctor && (
                <HStack spacing={3} pt={2} borderTop="1px dashed" borderColor={borderColor}>
                  <Avatar size="sm" boxSize="36px" name={examiningDoctor?.name} src={examiningDoctor?.photo} borderRadius="12px" />
                  <Box minW={0} flex={1}>
                    <Text fontSize="10px" fontWeight="900" color={textMuted} textTransform="uppercase" letterSpacing="0.05em">
                      Examining Doctor
                    </Text>
                    <Text fontWeight="850" color={textSecondary} fontSize={{ base: "14px", md: "15px" }} noOfLines={1}>
                      {examiningDoctor?.name}
                    </Text>
                  </Box>
                </HStack>
              )}
            </VStack>
          </Card>

          {/* Clinical Findings & Notes */}
          <Card
            variant="unstyled"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: "20px", md: "3xl" }}
            boxShadow="0 4px 20px rgba(0,0,0,0.03)"
            p={{ base: 3.5, sm: 4, md: 6 }}
            gridColumn={{ lg: "span 2" }}
          >
            <VStack align="start" spacing={3} w="full">
              <HStack spacing={2}>
                <Icon as={FaNotesMedical} color="orange.400" />
                <Heading fontSize="14px" fontWeight="850" color={textSecondary}>
                  Clinical Findings & Notes
                </Heading>
              </HStack>
              <Box w="full" bg={subtleBg} p={{ base: 3, md: 4 }} borderRadius="xl" border="1px dashed" borderColor={borderColor}>
                <Text color={textSecondary} whiteSpace="pre-wrap" fontSize="13px" lineHeight="1.6" fontWeight="500">
                  {notes || workDoneNote || toothNote || "No clinical notes provided for this record."}
                </Text>
              </Box>
            </VStack>
          </Card>

          {/* Financial Summary */}
          <Card
            variant="unstyled"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: "20px", md: "3xl" }}
            boxShadow="0 4px 20px rgba(0,0,0,0.03)"
            p={{ base: 3.5, sm: 4, md: 6 }}
            gridColumn={{ lg: "span 2" }}
          >
            <VStack align="start" spacing={3} w="full">
              <HStack spacing={2}>
                <Icon as={FaCoins} color="green.400" />
                <Heading fontSize="14px" fontWeight="850" color={textSecondary}>
                  {workDoneNote !== undefined || amount !== undefined ? "Billing Summary" : "Financial Summary"}
                </Heading>
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 3 }} gap={2.5} w="full">
                <VStack align="start" spacing={0.5} p={3} bg={bentoBlueBg} borderRadius="xl" border="1px solid" borderColor={bentoBlueBorder}>
                  <Text fontSize="9.5px" fontWeight="900" color="blue.400" letterSpacing="0.05em" textTransform="uppercase">
                    {workDoneNote !== undefined || amount !== undefined ? "Actual Amount" : "Gross Estimate"}
                  </Text>
                  <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="1000" color={useColorModeValue("blue.700", "blue.300")}>
                    {workDoneNote !== undefined || amount !== undefined
                      ? `₹${(amount || 0).toLocaleString()}`
                      : estimateMin === estimateMax
                        ? `₹${(estimateMin || 0).toLocaleString()}`
                        : `₹${(estimateMin || 0).toLocaleString()} - ₹${(estimateMax || 0).toLocaleString()}`}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0.5} p={3} bg={bentoRedBg} borderRadius="xl" border="1px solid" borderColor={bentoRedBorder}>
                  <Text fontSize="9.5px" fontWeight="900" color="red.400" letterSpacing="0.05em" textTransform="uppercase">
                    Discount
                  </Text>
                  <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="1000" color={useColorModeValue("red.600", "red.300")}>
                    ₹{(discount || 0).toLocaleString()}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0.5} p={3} bg={bentoGreenBg} borderRadius="xl" border="1px solid" borderColor={bentoGreenBorder}>
                  <Text fontSize="9.5px" fontWeight="900" color="green.400" letterSpacing="0.05em" textTransform="uppercase">
                    {workDoneNote !== undefined || amount !== undefined ? "Net Total Paid" : "Net Total (Estimated)"}
                  </Text>
                  <Text fontSize={{ base: "17px", md: "20px" }} fontWeight="1000" color={useColorModeValue("green.700", "green.300")}>
                    {workDoneNote !== undefined || amount !== undefined
                      ? `₹${((amount || 0) - (discount || 0)).toLocaleString()}`
                      : totalMin === totalMax
                        ? `₹${(totalMin || 0).toLocaleString()}`
                        : `₹${(totalMin || 0).toLocaleString()} - ₹${(totalMax || 0).toLocaleString()}`}
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </Card>

          {/* Administrative Info */}
          <Card
            variant="unstyled"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: "20px", md: "3xl" }}
            boxShadow="0 4px 20px rgba(0,0,0,0.03)"
            p={{ base: 3.5, sm: 4, md: 6 }}
            gridColumn={{ lg: "span 2" }}
          >
            <SimpleGrid columns={{ base: 2, sm: 2 }} gap={4} w="full">
              <VStack align="start" spacing={0.5}>
                <Text fontSize="10px" fontWeight="900" color={textMuted} textTransform="uppercase" letterSpacing="0.05em">
                  Record Created
                </Text>
                <Text color={textSecondary} fontWeight="800" fontSize="13px">
                  {formatDate(createdAt)}
                </Text>
              </VStack>
              <VStack align="start" spacing={0.5}>
                <Text fontSize="10px" fontWeight="900" color={textMuted} textTransform="uppercase" letterSpacing="wider">
                  Dentition
                </Text>
                <Badge
                  colorScheme={dentition === "child" ? "pink" : "blue"}
                  variant="subtle"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="10px"
                  fontWeight="800"
                >
                  {dentition.toUpperCase()}
                </Badge>
              </VStack>
            </SimpleGrid>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
});

export default TreatmentDetailsView;

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack
} from "@chakra-ui/react";
import { DentitionType, getTeethByType, ToothData } from "../utils/teethData";
import { ToothShape } from "./ToothShape";

interface TeethChartProps {
  dentitionType: DentitionType;
  selectedTeeth: ToothData[];
  onToothClick: (tooth: ToothData) => void;
  notationType?: "fdi" | "universal" | "palmer";
  onNotationChange?: (not: "fdi" | "universal" | "palmer") => void;
  toothComplaints: Record<string, string>;
  activeComplaintType: string;
  todayTreatments?: any[];
}

export const TeethChart = ({
  dentitionType,
  selectedTeeth,
  onToothClick,
  notationType = "fdi",
  onNotationChange,
  toothComplaints,
  activeComplaintType,
  todayTreatments = [],
}: TeethChartProps) => {
  const teeth = getTeethByType(dentitionType);

  const upperRightTeeth = teeth.filter(
    (t) => t.position === "upper" && t.side === "right"
  );
  const upperLeftTeeth = teeth.filter(
    (t) => t.position === "upper" && t.side === "left"
  );
  const lowerLeftTeeth = teeth.filter(
    (t) => t.position === "lower" && t.side === "left"
  );
  const lowerRightTeeth = teeth.filter(
    (t) => t.position === "lower" && t.side === "right"
  );

  const renderTeethRow = (rowTeeth: ToothData[], reverse = false) => {
    const sorted = reverse ? [...rowTeeth].reverse() : rowTeeth;

    return sorted.map((tooth) => {
      // Find if this tooth has a treatment documented today
      // Filter by current clinical mode (Complaint Type and Dentition)
      const todayRecord = todayTreatments.find(rec => {
        const recToothValue = String(rec.toothFDI || rec.tooth || "");
        const toothIds = recToothValue.split(',').map(s => s.trim());
        const recNotation = rec.toothNotation ? String(rec.toothNotation).toLowerCase() : "fdi";
        
        // 1. HARD FILTER: Record must match current chart view settings
        const activeNotation = String(notationType).toLowerCase();
        if (recNotation !== activeNotation) return false;

        const recDentition = String(rec.dentitionType || "adult").toLowerCase();
        const activeDentition = String(dentitionType).toLowerCase();
        if (recDentition !== activeDentition) return false;

        const recComplaint = String(rec.complaintType || "").toUpperCase();
        if (recComplaint !== activeComplaintType) return false;

        // 2. IDENTITY MATCH: Record must belong to this specific tooth in the active notation
        let isToothMatch = false;
        if (recNotation === "universal") {
          isToothMatch = toothIds.includes(String(tooth.universal));
        } else if (recNotation === "palmer") {
          isToothMatch = toothIds.includes(String(tooth.palmer));
        } else {
          // FDI / Internal ID
          isToothMatch = toothIds.includes(String(tooth.id)) || toothIds.includes(String(tooth.fdi));
        }
        
        return isToothMatch;
      });

      return (
        <ToothShape
          key={tooth.id}
          tooth={tooth}
          isSelected={selectedTeeth.some((t) => t.id === tooth.id)}
          onClick={() => onToothClick(tooth)}
          notationType={notationType}
          size="md"
          activeComplaintType={activeComplaintType}
          complaintType={toothComplaints[tooth.id]}
          todayRecord={todayRecord}
        />
      );
    });
  };

  return (
    <Box
      position="relative"
      bg="white"
      rounded="2xl"
      p={4}
      h="full"
    >
      {/* Chart Layout - Centered with Patients Orientation */}
      <Flex borderBottom="1px solid" borderColor="gray.50" pb={3} mb={5} justify="space-between" align="center">
        <Text fontSize="10px" fontWeight="black" color="gray.300" letterSpacing="widest">
          RIGHT
        </Text>
        <Badge variant="outline" colorScheme="gray" fontSize="9px" fontWeight="black" borderRadius="md" px={3}>
          OCCLUSAL VIEW
        </Badge>
        <Text fontSize="10px" fontWeight="black" color="gray.300" letterSpacing="widest">
          LEFT
        </Text>
      </Flex>

      <VStack spacing={2} pt={8}>
        {/* Upper Jaw */}
        <Box position="relative">
          <Text
            position="absolute"
            left="-64px"
            top="50%"
            transform="translateY(-50%) rotate(-90deg)"
            fontSize="xs"
            fontWeight="medium"
            color="gray.500"
          >
            Upper Jaw
          </Text>
          <Flex align="flex-end" justify="center" gap={1}>
            <Flex align="flex-end">{renderTeethRow(upperRightTeeth)}</Flex>
            <Box w="1px" h="64px" bg="gray.200" mx={2} />
            <Flex align="flex-end">{renderTeethRow(upperLeftTeeth)}</Flex>
          </Flex>
        </Box>

        {/* Bite line */}
        <Box
          w="100%"
          maxW="2xl"
          h="2px"
          my={4}
          bgGradient="linear(to-r, transparent, gray.300, transparent)"
        />

        {/* Lower Jaw */}
        <Box position="relative">
          <Text
            position="absolute"
            left="-64px"
            top="50%"
            transform="translateY(-50%) rotate(-90deg)"
            fontSize="xs"
            fontWeight="medium"
            color="gray.500"
          >
            Lower Jaw
          </Text>
          <Flex align="flex-start" justify="center" gap={1}>
            <Flex align="flex-start">{renderTeethRow(lowerRightTeeth, true)}</Flex>
            <Box w="1px" h="64px" bg="gray.200" mx={2} />
            <Flex align="flex-start">{renderTeethRow(lowerLeftTeeth, true)}</Flex>
          </Flex>
        </Box>
      </VStack>

      {/* Legend */}
      <Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
        <Flex
          wrap="wrap"
          justify="center"
          gap={6}
          fontSize="xs"
          color="gray.500"
        >
          <HStack spacing={2}>
            <Box w={3} h={3} rounded="full" bg="gray.100" border="1px solid" borderColor="gray.300" />
            <Text>Available</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} rounded="full" bg="blue.100" border="1px solid" borderColor="blue.500" />
            <Text>Treated Today</Text>
          </HStack>
          <HStack spacing={2}>
            <Box 
              w={3} h={3} rounded="full" 
              bg={activeComplaintType === "CHIEF COMPLAINT" ? "red.100" : activeComplaintType === "OTHER FINDING" ? "orange.100" : "green.100"} 
              border="1px solid" 
              borderColor={activeComplaintType === "CHIEF COMPLAINT" ? "red.500" : activeComplaintType === "OTHER FINDING" ? "orange.500" : "green.500"} 
            />
            <Text>Selected ({activeComplaintType.split(' ')[0]})</Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  SimpleGrid,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
  historyTeeth?: string[];
  fullHistory?: any[];
  sessionDate: string;
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
  historyTeeth = [],
  fullHistory = [],
  sessionDate,
}: TeethChartProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  // Default to separate "right" view on mobile, "full" on desktop
  const [viewMode, setViewMode] = useState<'right' | 'left' | 'both' | 'full'>('right');

  const cardBg = useColorModeValue("white", "darkBrand.50");
  const subCardBg = useColorModeValue("gray.50", "darkBrand.100");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.200");
  const activeToggleBg = useColorModeValue("white", "darkBrand.200");

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

  const rightSelectedCount = selectedTeeth.filter(t => t.side === 'right').length;
  const leftSelectedCount = selectedTeeth.filter(t => t.side === 'left').length;

  const renderTeethRow = (
    rowTeeth: ToothData[],
    reverse = false,
    toothSize: "xs" | "sm" | "md" = isMobile ? "sm" : "md"
  ) => {
    const sorted = reverse ? [...rowTeeth].reverse() : rowTeeth;

    return sorted.map((tooth) => {
      // Find if this tooth has a treatment documented today
      const matches = todayTreatments.filter(rec => {
        const recToothValue = String(rec.toothFDI || rec.tooth || "");
        const toothIds = recToothValue.split(',').map(s => s.trim());
        const recNotation = rec.toothNotation ? String(rec.toothNotation).toLowerCase() : "fdi";

        const activeNotation = String(notationType).toLowerCase();
        if (recNotation !== activeNotation) return false;

        const recDentition = String(rec.dentitionType || "adult").toLowerCase();
        const activeDentition = String(dentitionType).toLowerCase();
        if (recDentition !== activeDentition) return false;

        const recComplaint = String(rec.complaintType || "").toUpperCase();
        if (recComplaint !== activeComplaintType) return false;

        let isToothMatch = false;
        if (recNotation === "universal") {
          isToothMatch = toothIds.includes(String(tooth.universal));
        } else if (recNotation === "palmer") {
          isToothMatch = toothIds.includes(String(tooth.palmer));
        } else {
          isToothMatch = toothIds.includes(String(tooth.id)) || toothIds.includes(String(tooth.fdi));
        }
        return isToothMatch;
      });

      const todayRecord = matches[0];
      const allTodayRecords = matches;

      // Find if this tooth has any historical record
      const historyRecord = matches.length === 0 ? fullHistory.find(rec => {
        const recToothValue = String(rec.toothFDI || rec.tooth || "");
        const toothIds = recToothValue.split(',').map(s => s.trim());
        const tId = String(tooth.id);
        const fdiId = String(tooth.fdi);
        const isMatch = toothIds.includes(tId) || toothIds.includes(fdiId);
        if (!isMatch) return false;

        const recDate = new Date(rec.treatmentDate || rec.createdAt).toISOString().split('T')[0];
        if (recDate === sessionDate) {
          return String(rec.complaintType || "").toUpperCase() === activeComplaintType;
        }
        return true;
      }) : null;

      return (
        <ToothShape
          key={tooth.id}
          tooth={tooth}
          isSelected={selectedTeeth.some((t) => t.id === tooth.id)}
          onClick={() => onToothClick(tooth)}
          notationType={notationType}
          size={toothSize}
          activeComplaintType={activeComplaintType}
          complaintType={toothComplaints[tooth.id]}
          todayRecord={todayRecord || historyRecord}
          allTodayRecords={allTodayRecords.length > 0 ? allTodayRecords : (historyRecord ? [historyRecord] : [])}
          isHistoryRecord={(() => {
            const rec = todayRecord || historyRecord;
            if (!rec) return false;
            const recDate = new Date(rec.treatmentDate || rec.createdAt).toISOString().split('T')[0];
            return recDate !== sessionDate;
          })()}
          hasHistory={historyTeeth.includes(String(tooth.id)) || historyTeeth.includes(String(tooth.fdi))}
        />
      );
    });
  };

  // Dedicated block for single side (Right or Left)
  const renderSideBlock = (side: 'right' | 'left', title: string) => {
    const isRight = side === 'right';
    const upperTeeth = isRight ? upperRightTeeth : upperLeftTeeth;
    const lowerTeeth = isRight ? lowerRightTeeth : lowerLeftTeeth;
    const rangeText = isRight
      ? (dentitionType === "child" ? "55→51 & 85→81" : "18→11 & 48→41")
      : (dentitionType === "child" ? "61→65 & 71→75" : "21→28 & 31→38");

    return (
      <Box
        w="full"
        bg={subCardBg}
        borderRadius="xl"
        p={{ base: 2, md: 3 }}
        border="1px solid"
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center" mb={1.5} px={1} w="full">
          <HStack spacing={1.5}>
            <Badge
              colorScheme={isRight ? "blue" : "purple"}
              variant="solid"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="10px"
              fontWeight="black"
            >
              {title}
            </Badge>
            <Text fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} fontWeight="bold">
              {rangeText}
            </Text>
          </HStack>
        </Flex>

        <VStack spacing={2} align="center" w="full">
          {/* Upper Jaw Row */}
          <Box position="relative" w="full" overflow="hidden">
            <Flex align="flex-end" justify="center" gap={{ base: "2px", sm: 1 }} w="full">
              {!isRight && (
                <Box
                  h="36px"
                  w="2px"
                  bg="blue.300"
                  borderRadius="full"
                  mx={1}
                  flexShrink={0}
                  opacity={0.8}
                />
              )}
              {renderTeethRow(upperTeeth, false, "xs")}
              {isRight && (
                <Box
                  h="36px"
                  w="2px"
                  bg="blue.300"
                  borderRadius="full"
                  mx={1}
                  flexShrink={0}
                  opacity={0.8}
                />
              )}
            </Flex>
          </Box>

          {/* Bite line */}
          <Box
            w="full"
            maxW="340px"
            h="2px"
            my={1}
            bgGradient="linear(to-r, transparent, gray.300, transparent)"
          />

          {/* Lower Jaw Row */}
          <Box position="relative" w="full" overflow="hidden">
            <Flex align="flex-start" justify="center" gap={{ base: "2px", sm: 1 }} w="full">
              {!isRight && (
                <Box
                  h="36px"
                  w="2px"
                  bg="blue.300"
                  borderRadius="full"
                  mx={1}
                  flexShrink={0}
                  opacity={0.8}
                />
              )}
              {renderTeethRow(lowerTeeth, true, "xs")}
              {isRight && (
                <Box
                  h="36px"
                  w="2px"
                  bg="blue.300"
                  borderRadius="full"
                  mx={1}
                  flexShrink={0}
                  opacity={0.8}
                />
              )}
            </Flex>
          </Box>
        </VStack>
      </Box>
    );
  };

  return (
    <Box
      position="relative"
      bg={cardBg}
      rounded="2xl"
      p={{ base: 2, md: 3 }}
      h="full"
    >
      {/* View Mode Toggle: 3 Equal Full-Width Tabs */}
      <Box w="full" mb={2}>
        <SimpleGrid
          columns={{ base: 3, xl: 4 }}
          spacing={1}
          bg={useColorModeValue("gray.100", "darkBrand.100")}
          p="3px"
          borderRadius="xl"
          w="full"
        >
          <Button
            size="xs"
            h="28px"
            borderRadius="lg"
            variant={viewMode === 'right' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'right' ? 'pink' : 'gray'}
            onClick={() => setViewMode('right')}
            fontWeight="bold"
            fontSize="11px"
            w="full"
            px={1}
          >
            Right
            {rightSelectedCount > 0 && (
              <Badge ml={1} colorScheme="orange" variant="solid" borderRadius="full" fontSize="8px" px={1}>
                {rightSelectedCount}
              </Badge>
            )}
          </Button>

          <Button
            size="xs"
            h="28px"
            borderRadius="lg"
            variant={viewMode === 'left' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'left' ? 'pink' : 'gray'}
            onClick={() => setViewMode('left')}
            fontWeight="bold"
            fontSize="11px"
            w="full"
            px={1}
          >
            Left
            {leftSelectedCount > 0 && (
              <Badge ml={1} colorScheme="orange" variant="solid" borderRadius="full" fontSize="8px" px={1}>
                {leftSelectedCount}
              </Badge>
            )}
          </Button>

          <Button
            size="xs"
            h="28px"
            borderRadius="lg"
            variant={viewMode === 'both' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'both' ? 'pink' : 'gray'}
            onClick={() => setViewMode('both')}
            fontWeight="bold"
            fontSize="11px"
            w="full"
            px={1}
          >
            Both
          </Button>

          <Button
            size="xs"
            h="28px"
            borderRadius="lg"
            display={{ base: "none", xl: "inline-flex" }}
            variant={viewMode === 'full' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'full' ? 'pink' : 'gray'}
            onClick={() => setViewMode('full')}
            fontWeight="bold"
            fontSize="11px"
            w="full"
            px={1}
          >
            Full Arch
          </Button>
        </SimpleGrid>
      </Box>

      {/* Render based on selected View Mode */}
      {viewMode === 'right' && (
        <VStack spacing={2} align="stretch" w="full">
          {renderSideBlock('right', 'RIGHT SIDE')}
          <Button
            size="xs"
            w="full"
            colorScheme="blue"
            variant="outline"
            rightIcon={<FiChevronRight />}
            onClick={() => setViewMode('left')}
            borderRadius="xl"
            h="32px"
            fontSize="11px"
            fontWeight="bold"
            whiteSpace="nowrap"
          >
            <Box as="span" display={{ base: "inline", lg: "none" }}>Switch to Left Side ➔</Box>
            <Box as="span" display={{ base: "none", lg: "inline" }}>Switch to Left Side (Teeth {dentitionType === "child" ? "61 to 75" : "21 to 38"}) ➔</Box>
          </Button>
        </VStack>
      )}

      {viewMode === 'left' && (
        <VStack spacing={2} align="stretch" w="full">
          {renderSideBlock('left', 'LEFT SIDE')}
          <Button
            size="xs"
            w="full"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiChevronLeft />}
            onClick={() => setViewMode('right')}
            borderRadius="xl"
            h="32px"
            fontSize="11px"
            fontWeight="bold"
            whiteSpace="nowrap"
          >
            <Box as="span" display={{ base: "inline", lg: "none" }}>← Switch to Right Side</Box>
            <Box as="span" display={{ base: "none", lg: "inline" }}>← Switch to Right Side (Teeth {dentitionType === "child" ? "55 to 81" : "18 to 41"})</Box>
          </Button>
        </VStack>
      )}

      {viewMode === 'both' && (
        <VStack spacing={3} align="stretch" w="full">
          {renderSideBlock('right', 'RIGHT SIDE')}
          {renderSideBlock('left', 'LEFT SIDE')}
        </VStack>
      )}

      {viewMode === 'full' && (
        <Box
          w="100%"
          overflowX="auto"
          pb={{ base: 3, md: 0 }}
          css={{
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { height: "6px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: "3px" },
          }}
        >
          <Box minW={{ base: "680px", md: "auto" }} px={2}>
            <VStack spacing={2} pt={2}>
              {/* Upper Jaw */}
              <Box position="relative">
                <Text
                  position="absolute"
                  left="-56px"
                  top="50%"
                  transform="translateY(-50%) rotate(-90deg)"
                  fontSize="xs"
                  fontWeight="black"
                  color={useColorModeValue("black", "white")}
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
                my={2}
                bgGradient="linear(to-r, transparent, gray.300, transparent)"
              />

              {/* Lower Jaw */}
              <Box position="relative">
                <Text
                  position="absolute"
                  left="-56px"
                  top="50%"
                  transform="translateY(-50%) rotate(-90deg)"
                  fontSize="xs"
                  fontWeight="black"
                  color={useColorModeValue("black", "white")}
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
          </Box>
        </Box>
      )}
    </Box>
  );
};

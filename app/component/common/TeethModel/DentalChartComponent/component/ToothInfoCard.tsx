import {
  Box,
  HStack,
  Text,
  VStack,
  useColorModeValue,
  Circle,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FaTooth } from "react-icons/fa";
import { FiEdit3, FiMessageSquare, FiTrash2 } from "react-icons/fi";
import { ToothData } from "../utils/teethData";

interface ToothInfoCardProps {
  tooth: ToothData | null;
  onEditNote?: (tooth: ToothData) => void;
  onRemove?: (tooth: ToothData) => void;
  hasNote?: boolean;
  hideActions?: boolean;
}

export const ToothInfoCard = ({ tooth, onEditNote, onRemove, hasNote, hideActions }: ToothInfoCardProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  if (!tooth) return null;

  return (
    <Box
      p={4}
      bg={bg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      _hover={{
        transform: "translateX(6px)",
        borderColor: "blue.200",
        boxShadow: "xl",
      }}
      mb={4}
      position="relative"
      overflow="hidden"
    >
      {/* Minimalist Side Accents */}
      <Box
        position="absolute"
        top="4"
        left="0"
        bottom="4"
        w="3px"
        bg="blue.500"
        borderRadius="full"
      />
      <Box
        position="absolute"
        top="4"
        right="0"
        bottom="4"
        w="3px"
        bg="blue.500"
        borderRadius="full"
      />

      <HStack spacing={4}>
        <Circle
          size="48px"
          bg="blue.50"
          color="blue.500"
          border="1px solid"
          borderColor="blue.100"
          boxShadow="sm"
        >
          <Icon as={FaTooth} boxSize={5} />
        </Circle>

        <VStack align="start" spacing={0} flex={1}>
          <HStack spacing={2} mb={0.5}>
            <Text fontSize="14px" fontWeight="900" color="gray.800">
              Tooth {tooth.id}
            </Text>
            <Box boxSize="3px" borderRadius="full" bg="blue.400" />
            <Text fontSize="9px" fontWeight="900" color="blue.500" textTransform="uppercase" letterSpacing="0.1em">
              Clinical Record
            </Text>
          </HStack>
          <Text fontSize="11px" fontWeight="700" color="gray.400" textTransform="capitalize" letterSpacing="0.02em">
            {tooth.type} • {tooth.side} {tooth.position}
          </Text>
        </VStack>

        {!hideActions && (
          <VStack align="end" spacing={2}>
            <HStack spacing={2}>
              {hasNote && (
                <Tooltip label="Has clinical note">
                  <Icon as={FiMessageSquare} color="blue.500" boxSize={3} />
                </Tooltip>
              )}
              <IconButton
                aria-label="Edit tooth note"
                icon={<FiEdit3 />}
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tooth) onEditNote?.(tooth);
                }}
                _hover={{ bg: "blue.50" }}
              />
              <IconButton
                aria-label="Remove tooth"
                icon={<FiTrash2 />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tooth) onRemove?.(tooth);
                }}
                _hover={{ bg: "red.50" }}
              />
            </HStack>
            <VStack align="end" spacing={0}>
              <Text fontSize="8px" fontWeight="900" color="gray.300" letterSpacing="0.2em">REF</Text>
              <Text fontSize="18px" fontWeight="900" color="gray.800" lineHeight="1">
                {tooth.id}
              </Text>
            </VStack>
          </VStack>
        )}
      </HStack>
    </Box>
  );
};

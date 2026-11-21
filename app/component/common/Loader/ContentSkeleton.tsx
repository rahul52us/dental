"use client";

import React from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";

interface CardListSkeletonProps {
  count?: number;
}

/**
 * Modern skeleton loader matching mobile list cards
 * (e.g. Patients, Doctors, Lab Orders, Dealers, Labs, Staff)
 */
export const CardListSkeleton: React.FC<CardListSkeletonProps> = ({ count = 4 }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("#E8EEF4", "gray.700");
  const startColor = useColorModeValue("gray.100", "gray.700");
  const endColor = useColorModeValue("gray.200", "gray.600");

  return (
    <VStack spacing={2.5} align="stretch" w="100%">
      {Array.from({ length: count }).map((_, idx) => (
        <Box
          key={idx}
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="18px"
          p={3}
          boxShadow="sm"
        >
          {/* Identity row */}
          <Flex align="center" justify="space-between" mb={2}>
            <HStack spacing={2.5} flex={1}>
              <SkeletonCircle size="10" startColor={startColor} endColor={endColor} />
              <VStack align="start" spacing={1.5} flex={1}>
                <Skeleton h="14px" w="45%" borderRadius="md" startColor={startColor} endColor={endColor} />
                <HStack spacing={1.5}>
                  <Skeleton h="11px" w="50px" borderRadius="full" startColor={startColor} endColor={endColor} />
                  <Skeleton h="11px" w="40px" borderRadius="full" startColor={startColor} endColor={endColor} />
                </HStack>
              </VStack>
            </HStack>
            <SkeletonCircle size="7" startColor={startColor} endColor={endColor} />
          </Flex>

          {/* Contact / Info strip */}
          <Skeleton
            h="28px"
            w="100%"
            borderRadius="10px"
            mb={2}
            startColor={startColor}
            endColor={endColor}
          />

          {/* Action buttons row */}
          <HStack spacing={2} pt={1}>
            <Skeleton h="32px" flex={1} borderRadius="12px" startColor={startColor} endColor={endColor} />
            <Skeleton h="32px" flex={1} borderRadius="12px" startColor={startColor} endColor={endColor} />
            <Skeleton h="32px" flex={1} borderRadius="12px" startColor={startColor} endColor={endColor} />
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Modern skeleton loader matching desktop data tables
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 6 }) => {
  const rowBg = useColorModeValue("white", "gray.850");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const startColor = useColorModeValue("gray.100", "gray.700");
  const endColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box w="100%" overflow="hidden" borderRadius="lg" border="1px solid" borderColor={borderColor}>
      {/* Header bar */}
      <HStack
        p={3}
        bg={useColorModeValue("gray.50", "gray.800")}
        borderBottom="1px solid"
        borderColor={borderColor}
        spacing={4}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} h="14px" flex={1} borderRadius="md" startColor={startColor} endColor={endColor} />
        ))}
      </HStack>

      {/* Row items */}
      <VStack spacing={0} align="stretch">
        {Array.from({ length: rows }).map((_, r) => (
          <HStack
            key={r}
            p={3}
            bg={rowBg}
            borderBottom="1px solid"
            borderColor={borderColor}
            spacing={4}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                h="13px"
                flex={1}
                borderRadius="md"
                startColor={startColor}
                endColor={endColor}
              />
            ))}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

/**
 * Universal Page Skeleton used for full-page loading transitions
 */
export const PageSkeleton: React.FC = () => {
  const startColor = useColorModeValue("gray.100", "gray.700");
  const endColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box p={{ base: 2, md: 4 }} w="100%">
      {/* Top Header & Search Bar Skeleton */}
      <Flex justify="space-between" align="center" mb={3}>
        <VStack align="start" spacing={1.5} flex={1}>
          <Skeleton h="20px" w="140px" borderRadius="md" startColor={startColor} endColor={endColor} />
          <Skeleton h="12px" w="180px" borderRadius="md" startColor={startColor} endColor={endColor} />
        </VStack>
        <Skeleton h="36px" w="36px" borderRadius="full" startColor={startColor} endColor={endColor} />
      </Flex>

      {/* Search Input Skeleton */}
      <Skeleton h="40px" w="100%" borderRadius="14px" mb={2.5} startColor={startColor} endColor={endColor} />

      {/* Filter Pills Skeleton */}
      <HStack spacing={2} mb={3} overflow="hidden">
        <Skeleton h="30px" w="80px" borderRadius="full" startColor={startColor} endColor={endColor} />
        <Skeleton h="30px" w="90px" borderRadius="full" startColor={startColor} endColor={endColor} />
        <Skeleton h="30px" w="70px" borderRadius="full" startColor={startColor} endColor={endColor} />
        <Skeleton h="30px" w="75px" borderRadius="full" startColor={startColor} endColor={endColor} />
      </HStack>

      {/* Content Cards Skeleton */}
      <CardListSkeleton count={4} />
    </Box>
  );
};

export default CardListSkeleton;

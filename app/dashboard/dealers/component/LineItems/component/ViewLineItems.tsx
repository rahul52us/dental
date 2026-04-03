import React from "react";
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  Icon,
  Badge,
  HStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { 
  MdLabel, 
  MdFingerprint, 
  MdNumbers, 
  MdAttachMoney, 
  MdCalendarToday,
  MdBusiness
} from "react-icons/md";
import { formatDate } from "../../../../../component/config/utils/dateUtils";

const InfoItem = ({ label, value, icon, color = "blue.500" }: any) => {
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valColor = useColorModeValue("gray.800", "white");
  
  return (
    <VStack align="start" spacing={1} p={3} borderRadius="xl" _hover={{ bg: "gray.50" }} transition="0.2s">
      <HStack spacing={2}>
        <Icon as={icon} color={color} />
        <Text fontSize="xs" fontWeight="bold" color={labelColor} textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </HStack>
      <Text fontSize="md" fontWeight="bold" color={valColor}>
        {value || "—"}
      </Text>
    </VStack>
  );
};

const ViewLineItems = ({ data }: { data: any }) => {
  const bg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("lg", "dark-lg");
  const totalBg = useColorModeValue("blue.600", "blue.400");

  if (!data) return <Text>No data available</Text>;

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Header Section */}
        <Box 
          p={6} 
          borderRadius="2xl" 
          bg={bg} 
          shadow={shadow} 
          borderTop="4px solid" 
          borderTopColor="blue.500"
        >
          <VStack align="start" spacing={4}>
            <Badge colorScheme="blue" borderRadius="full" px={4} py={1} fontSize="xs">
              Transaction Detailed Overview
            </Badge>
            <Heading size="lg" color="gray.700" _dark={{ color: "white" }}>
              {data.itemName}
            </Heading>
            <HStack spacing={2}>
              <Icon as={MdLabel} color="blue.500" />
              <Text fontWeight="bold" fontSize="lg" color="blue.600">
                {data.brandName || "Standard Portfolio"}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Quantities & Pricing Section */}
        <Box p={6} borderRadius="2xl" bg={bg} shadow={shadow}>
          <Text fontSize="md" fontWeight="black" mb={4} color="gray.600" textTransform="uppercase">
            Financial & Inventory Metadata
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            <InfoItem icon={MdFingerprint} label="Inventory Code" value={data.itemCode} />
            <InfoItem icon={MdCalendarToday} label="Registration Date" value={formatDate(data.createdAt)} />
            <InfoItem icon={MdNumbers} label="Total Units" value={data.quantity} color="purple.500" />
            <InfoItem icon={MdAttachMoney} label="Unit Price" value={`₹ ${data.price}`} color="green.500" />
          </SimpleGrid>

          <Divider my={6} borderStyle="dashed" />

          {/* Grand Total Highlight */}
          <Box 
            p={6} 
            borderRadius="2xl" 
            bgGradient="linear(to-br, blue.600, purple.700)" 
            color="white" 
            shadow="xl"
            position="relative"
            overflow="hidden"
          >
             <Box 
                position="absolute" 
                top="-20%" 
                right="-10%" 
                w="120px" 
                h="120px" 
                bg="whiteAlpha.100" 
                borderRadius="full" 
              />
            <VStack align="center" spacing={0}>
              <Text fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" opacity={0.8}>
                Final Transaction Value
              </Text>
              <Text fontSize="4xl" fontWeight="black">
                ₹ {Number(data.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Company/Company Details (If available in data) */}
        {data.dealerDetails && (
          <Box p={6} borderRadius="2xl" bg={bg} shadow={shadow}>
            <VStack align="start" spacing={3}>
              <HStack spacing={2}>
                <Icon as={MdBusiness} color="gray.400" />
                <Text fontSize="sm" fontWeight="bold" color="gray.500">DEALER ENTITY</Text>
              </HStack>
              <Text fontWeight="bold">{data.dealerDetails.name}</Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ViewLineItems;

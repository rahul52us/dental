import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { MdAccountBalance, MdGroups, MdLocationOn } from "react-icons/md";
import { formatDate } from "../../../../component/config/utils/dateUtils";

const valueText = (value: any) => {
  if (value === undefined || value === null || value === "") return "—";
  if (value === false) return "No";
  if (value === true) return "Yes";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
  if (typeof value === "object") return Object.values(value).filter(Boolean).join(", ") || "—";
  return String(value);
};

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <Stack
    direction={{ base: "column", sm: "row" }}
    align={{ base: "stretch", sm: "flex-start" }}
    justify="space-between"
    spacing={{ base: 0.5, sm: 3 }}
    py={2}
    borderBottomWidth="1px"
    borderColor={useColorModeValue("gray.100", "gray.700")}
    _last={{ borderBottomWidth: 0, pb: 0 }}
  >
    <Text flexShrink={0} fontSize="xs" fontWeight="semibold" color="gray.500">
      {label}
    </Text>
    <Text
      minW={0}
      flex={1}
      fontSize="sm"
      color={useColorModeValue("gray.800", "gray.100")}
      wordBreak="break-word"
      whiteSpace="normal"
    >
      {valueText(value)}
    </Text>
  </Stack>
);

const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <Card
    w="100%"
    bg={useColorModeValue("white", "gray.800")}
    borderWidth="1px"
    borderColor={useColorModeValue("gray.200", "gray.700")}
    borderRadius="xl"
    shadow="sm"
  >
    <CardHeader px={{ base: 4, md: 5 }} pt={4} pb={2}>
      <HStack spacing={2}>
        <Icon as={icon} boxSize={4} color="teal.500" />
        <Heading size="sm">{title}</Heading>
      </HStack>
    </CardHeader>
    <CardBody px={{ base: 4, md: 5 }} pt={1} pb={4}>
      {children}
    </CardBody>
  </Card>
);

const ViewLab = ({ data }: { data: any }) => {
  const staffCardBg = useColorModeValue("gray.50", "gray.700");

  if (!data) return <Text>No data available</Text>;

  const initial = data?.name ? data.name.charAt(0).toUpperCase() : "L";

  return (
    <Box p={{ base: 2, md: 4 }} pb={{ base: "calc(100px + env(safe-area-inset-bottom, 24px))", md: 6 }}>
      {/* Hero Banner */}
      <Box
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
        color="white"
        mb={4}
        shadow="md"
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "flex-start", sm: "center" }}
          gap={3}
        >
          <Avatar
            size="lg"
            name={data.name}
            bg="whiteAlpha.300"
            color="white"
            fontWeight="bold"
            fontSize="xl"
          >
            {initial}
          </Avatar>
          <Box flex={1} minW={0}>
            <Heading size="md" noOfLines={1} color="white">
              {data.name || "—"}
            </Heading>
            <HStack spacing={2} mt={1} wrap="wrap">
              <Text fontSize="xs" opacity={0.9}>
                Lab profile • Created {data.createdAt ? formatDate(data.createdAt) : "—"}
              </Text>
              <Badge
                bg={data.isActive !== false ? "green.400" : "red.400"}
                color="white"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="10px"
                fontWeight="bold"
              >
                {data.isActive !== false ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </HStack>
          </Box>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        {/* Addresses */}
        <SectionCard icon={MdLocationOn} title="Addresses">
          <InfoItem label="Residential" value={data.addresses?.residential} />
          <InfoItem label="Office" value={data.addresses?.office} />
          <InfoItem label="Other" value={data.addresses?.other} />
        </SectionCard>

        {/* Staff Members */}
        <SectionCard icon={MdGroups} title="Staff members">
          {data.staffs && data.staffs.length > 0 ? (
            <VStack spacing={2.5} align="stretch">
              {data.staffs.map((staff: any, idx: number) => (
                <Box
                  key={idx}
                  p={3}
                  bg={staffCardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                >
                  <Text fontWeight="bold" fontSize="sm" color="teal.700">
                    {staff.name || "—"}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Email: {staff.email || "—"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Phone: {staff.phone || "—"}
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text fontSize="sm" color="gray.400">
              No staff members added
            </Text>
          )}
        </SectionCard>

        {/* Bank Accounts */}
        <Box gridColumn={{ base: "1", lg: "1 / -1" }}>
          <SectionCard icon={MdAccountBalance} title="Bank accounts">
            {data.bankAccounts && data.bankAccounts.length > 0 ? (
              <VStack spacing={2.5} align="stretch">
                {data.bankAccounts.map((account: any, idx: number) => (
                  <Box
                    key={idx}
                    p={3}
                    bg={staffCardBg}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                  >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                      <Text fontWeight="bold" fontSize="sm">
                        {account.bankName || "—"}
                      </Text>
                      {account.primary && (
                        <Badge colorScheme="green" fontSize="10px">
                          Primary
                        </Badge>
                      )}
                    </Flex>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={1} mt={1}>
                      <Text fontSize="xs" color="gray.500">
                        Holder: {account.accountHolder || "—"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        A/C: {account.accountNumber || "—"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        IFSC: {account.ifscCode || "—"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Branch: {account.branch || "—"}
                      </Text>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.400">
                No bank accounts added
              </Text>
            )}
          </SectionCard>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default ViewLab;

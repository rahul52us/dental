import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
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

const ViewDealer = ({ data }: { data: any }) => {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const mutedBg = useColorModeValue("gray.50", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.700");

  if (!data) return <Text p={4}>No dealer data available</Text>;

  const staffs = Array.isArray(data.staffs) ? data.staffs : [];
  const bankAccounts = Array.isArray(data.bankAccounts) ? data.bankAccounts : [];
  const addresses = data.addresses || {};
  const isActive = data.isActive ?? data.is_active;

  return (
    <VStack align="stretch" spacing={4} w="100%" maxW="1000px" mx="auto" p={{ base: 3, md: 5 }} bg={pageBg}>
      <Card
        overflow="hidden"
        borderRadius="2xl"
        color="white"
        bgGradient="linear(120deg, teal.700, cyan.600)"
        shadow="md"
      >
        <CardBody p={{ base: 4, md: 5 }}>
          <Flex align="center" gap={3}>
            <Avatar name={data.name} size="md" bg="whiteAlpha.300" color="white" />
            <Box minW={0} flex={1}>
              <Heading size={{ base: "sm", md: "md" }} noOfLines={2}>
                {data.name || "Dealer"}
              </Heading>
              <Text mt={1} fontSize="sm" color="whiteAlpha.800">
                Dealer profile · Created {data.createdAt ? formatDate(data.createdAt) : "—"}
              </Text>
            </Box>
            {isActive !== undefined && (
              <Badge colorScheme={isActive ? "green" : "gray"} borderRadius="full" px={2} py={1}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            )}
          </Flex>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems="start">
        <SectionCard icon={MdLocationOn} title="Addresses">
          <VStack align="stretch" spacing={0}>
            <InfoItem label="Residential" value={addresses.residential} />
            <InfoItem label="Office" value={addresses.office} />
            <InfoItem label="Other" value={addresses.other} />
          </VStack>
        </SectionCard>

        <SectionCard icon={MdGroups} title="Staff members">
          {staffs.length === 0 ? (
            <Text fontSize="sm" color="gray.500">No staff members added</Text>
          ) : (
            <>
              <VStack display={{ base: "flex", md: "none" }} align="stretch" spacing={2}>
                {staffs.map((staff: any, index: number) => (
                  <Box key={staff._id || index} p={3} bg={mutedBg} borderRadius="lg">
                    <Text fontWeight="semibold" fontSize="sm" wordBreak="break-word">
                      {staff.name || "Staff member"}
                    </Text>
                    <InfoItem label="Email" value={staff.email} />
                    <InfoItem label="Phone" value={staff.phone} />
                  </Box>
                ))}
              </VStack>
              <TableContainer display={{ base: "none", md: "block" }} w="100%" overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {staffs.map((staff: any, index: number) => (
                      <Tr key={staff._id || index}>
                        <Td>{staff.name || "—"}</Td>
                        <Td wordBreak="break-word">{staff.email || "—"}</Td>
                        <Td>{staff.phone || "—"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </>
          )}
        </SectionCard>
      </SimpleGrid>

      <SectionCard icon={MdAccountBalance} title="Bank accounts">
        {bankAccounts.length === 0 ? (
          <Text fontSize="sm" color="gray.500">No bank accounts added</Text>
        ) : (
          <>
            <VStack display={{ base: "flex", md: "none" }} align="stretch" spacing={2}>
              {bankAccounts.map((account: any, index: number) => (
                <Box key={account._id || index} p={3} bg={mutedBg} borderRadius="lg">
                  <InfoItem label="Account holder" value={account.accountHolder} />
                  <InfoItem label="Bank" value={account.bankName} />
                  <InfoItem label="Account number" value={account.accountNumber} />
                  <InfoItem label="IFSC" value={account.ifscCode} />
                  <InfoItem label="Branch" value={account.branch} />
                  {account.primary && <Badge mt={2} colorScheme="green">Primary account</Badge>}
                </Box>
              ))}
            </VStack>
            <TableContainer display={{ base: "none", md: "block" }} w="100%" overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Holder</Th>
                    <Th>Bank</Th>
                    <Th>Account No.</Th>
                    <Th>IFSC</Th>
                    <Th>Branch</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bankAccounts.map((account: any, index: number) => (
                    <Tr key={account._id || index}>
                      <Td>{account.accountHolder || "—"}</Td>
                      <Td>{account.bankName || "—"}</Td>
                      <Td>{account.accountNumber || "—"}</Td>
                      <Td>{account.ifscCode || "—"}</Td>
                      <Td>{account.branch || "—"}</Td>
                      <Td>{account.primary ? <Badge colorScheme="green">Primary</Badge> : "—"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </>
        )}
      </SectionCard>

      <Divider />
      <Text pb={2} textAlign="center" color="gray.500" fontSize="xs">
        Dealer details
      </Text>
    </VStack>
  );
};

export default ViewDealer;

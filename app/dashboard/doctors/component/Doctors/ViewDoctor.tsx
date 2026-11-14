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
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { EmailIcon, PhoneIcon } from "@chakra-ui/icons";
import { MdAccountBalance, MdSecurity, MdVaccines } from "react-icons/md";
import ReferredPatientsList from "../../../patients/component/patient/ReferredPatientsList";

const valueText = (value: any) => {
  if (value === undefined || value === null || value === "") return "—";
  if (value === false) return "No";
  if (value === true) return "Yes";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
  if (typeof value === "object") return Object.values(value).filter(Boolean).join(", ") || "—";
  return String(value);
};

const hasRecordData = (record: any) =>
  record &&
  Object.values(record).some(
    (value) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0)
  );

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
  icon?: any;
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
        {icon && <Icon as={icon} boxSize={4} color="teal.500" />}
        <Heading size="sm">{title}</Heading>
      </HStack>
    </CardHeader>
    <CardBody px={{ base: 4, md: 5 }} pt={1} pb={4}>
      {children}
    </CardBody>
  </Card>
);

const ViewDoctor = ({ doctor }: { doctor: any }) => {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const mutedBg = useColorModeValue("gray.50", "gray.700");

  if (!doctor) return <Text p={4}>No doctor data available</Text>;

  const personalInfo = doctor.profileDetails?.personalInfo || {};
  const phones = (personalInfo.phones || doctor.phones || []).filter((item: any) => item?.number);
  const emails = (personalInfo.emails || doctor.emails || []).filter((item: any) => item?.email);
  const bankAccounts = (personalInfo.bankAccounts || doctor.bankAccounts || []).filter(hasRecordData);
  const vaccinations = (personalInfo.vaccinations || doctor.vaccinations || []).filter(hasRecordData);
  const insurances = (personalInfo.insurances || doctor.insurances || []).filter(hasRecordData);
  const degrees = (personalInfo.degreeInfo || doctor.degreeInfo || []).filter(hasRecordData);
  const addresses = personalInfo.addresses || doctor.addresses || {};
  const title =
    typeof doctor.title === "string" ? doctor.title : doctor.title?.label || "Dr.";
  const isActive = doctor.is_active ?? doctor.isActive;

  return (
    <VStack align="stretch" spacing={4} w="100%" maxW="900px" mx="auto" p={{ base: 3, md: 5 }} bg={pageBg}>
      <Card
        overflow="hidden"
        borderRadius="2xl"
        color="white"
        bgGradient="linear(120deg, teal.700, cyan.600)"
        shadow="md"
      >
        <CardBody p={{ base: 4, md: 5 }}>
          <Flex align="center" gap={3}>
            <Avatar
              src={doctor.pic?.url}
              name={doctor.name}
              size="md"
              boxSize={{ base: "48px", md: "64px" }}
              border="2px solid"
              borderColor="whiteAlpha.800"
            />
            <Box minW={0} flex={1}>
              <Heading size={{ base: "sm", md: "md" }} noOfLines={2}>
                {title} {doctor.name || "Doctor"}
              </Heading>
              <Text mt={1} fontSize="sm" color="whiteAlpha.800" noOfLines={1}>
                Doctor {doctor.code ? `· ${doctor.code}` : ""}
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

      <SectionCard title="Basic information">
        <VStack align="stretch" spacing={0}>
          <InfoItem label="Username" value={doctor.username || emails.find((item: any) => item.primary)?.email} />
          <InfoItem label="Date of birth" value={personalInfo.dob || doctor.dob} />
          <InfoItem label="Gender" value={personalInfo.gender?.label || personalInfo.gender || doctor.gender?.label || doctor.gender} />
          <InfoItem label="Languages" value={personalInfo.languages} />
          <InfoItem label="About" value={doctor.bio || personalInfo.bio} />
          <InfoItem label="Medical history" value={personalInfo.medicalHistory || doctor.medicalHistory} />
        </VStack>
      </SectionCard>

      <SectionCard title="Contact information">
        <VStack align="stretch" spacing={3}>
          {phones.map((phone: any, index: number) => (
            <HStack key={`phone-${index}`} align="flex-start" spacing={3} minW={0}>
              <PhoneIcon mt={1} color="teal.500" />
              <Text minW={0} flex={1} fontSize="sm" wordBreak="break-word">
                {phone.countryCode ? `${phone.countryCode} ` : ""}{phone.number}
              </Text>
              {phone.primary && <Badge colorScheme="green" flexShrink={0}>Primary</Badge>}
            </HStack>
          ))}
          {emails.map((email: any, index: number) => (
            <HStack key={`email-${index}`} align="flex-start" spacing={3} minW={0}>
              <EmailIcon mt={1} color="teal.500" />
              <Text minW={0} flex={1} fontSize="sm" wordBreak="break-word">
                {email.email}
              </Text>
              {email.primary && <Badge colorScheme="green" flexShrink={0}>Primary</Badge>}
            </HStack>
          ))}
          {!phones.length && !emails.length && (
            <Text color="gray.500" fontSize="sm">No contact details provided</Text>
          )}
        </VStack>
      </SectionCard>

      {(addresses.residential || addresses.office || addresses.other) && (
        <SectionCard title="Addresses">
          <VStack align="stretch" spacing={0}>
            {addresses.residential && <InfoItem label="Residential" value={addresses.residential} />}
            {addresses.office && <InfoItem label="Office" value={addresses.office} />}
            {addresses.other && <InfoItem label="Other" value={addresses.other} />}
          </VStack>
        </SectionCard>
      )}

      {degrees.length > 0 && (
        <SectionCard title="Qualifications">
          <VStack align="stretch" spacing={2}>
            {degrees.map((degree: any, index: number) => (
              <Box key={index} p={3} bg={mutedBg} borderRadius="lg">
                <InfoItem label="Degree" value={degree.name} />
                <InfoItem label="University" value={degree.university || degree.universary} />
                <InfoItem label="Year" value={degree.year} />
              </Box>
            ))}
          </VStack>
        </SectionCard>
      )}

      {bankAccounts.length > 0 && (
        <SectionCard icon={MdAccountBalance} title="Bank accounts">
          <VStack align="stretch" spacing={2}>
            {bankAccounts.map((account: any, index: number) => (
              <Box key={index} p={3} bg={mutedBg} borderRadius="lg">
                <InfoItem label="Account holder" value={account.accountHolder} />
                <InfoItem label="Bank" value={account.bankName} />
                <InfoItem label="Account number" value={account.accountNumber} />
                <InfoItem label="IFSC" value={account.ifscCode} />
                <InfoItem label="Branch" value={account.branch} />
                {account.primary && <Badge mt={2} colorScheme="green">Primary account</Badge>}
              </Box>
            ))}
          </VStack>
        </SectionCard>
      )}

      {vaccinations.length > 0 && (
        <SectionCard icon={MdVaccines} title="Vaccinations">
          <VStack align="stretch" spacing={2}>
            {vaccinations.map((item: any, index: number) => (
              <Box key={index} p={3} bg={mutedBg} borderRadius="lg">
                <InfoItem label="Type" value={item.type} />
                <InfoItem label="Date administered" value={item.dateAdministered} />
                <InfoItem label="Next due" value={item.nextDueDate} />
                <InfoItem label="Remarks" value={item.remarks} />
              </Box>
            ))}
          </VStack>
        </SectionCard>
      )}

      {insurances.length > 0 && (
        <SectionCard icon={MdSecurity} title="Insurance">
          <VStack align="stretch" spacing={2}>
            {insurances.map((item: any, index: number) => (
              <Box key={index} p={3} bg={mutedBg} borderRadius="lg">
                <InfoItem label="Type" value={item.type} />
                <InfoItem label="Start date" value={item.startDate} />
                <InfoItem label="Renewal date" value={item.renewalDate} />
                <InfoItem label="Amount insured" value={item.amountInsured} />
                <InfoItem label="Amount paid" value={item.amountPaid} />
                <InfoItem label="Remarks" value={item.remarks} />
              </Box>
            ))}
          </VStack>
        </SectionCard>
      )}

      {doctor._id && <ReferredPatientsList userId={doctor._id} />}
    </VStack>
  );
};

export default ViewDoctor;

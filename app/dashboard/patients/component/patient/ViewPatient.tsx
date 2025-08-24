import React from "react";
import {
  Box,
  Text,
  Image,
  Heading,
  Stack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon } from "@chakra-ui/icons";
import { MdSecurity } from "react-icons/md";

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <HStack align="start">
    <Text fontWeight="semibold" minW="140px" color="gray.600">
      {label}:
    </Text>
    <Text flex="1">{value || "—"}</Text>
  </HStack>
);

const SectionCard = ({ icon, title, children }: any) => {
  const bg = useColorModeValue("white", "gray.800");
  return (
    <Card bg={bg} borderWidth="1px" borderRadius="lg" shadow="sm" mb={5}>
      <CardHeader pb={2}>
        <HStack spacing={2}>
          {icon && <Icon as={icon} boxSize={5} color="teal.500" />}
          <Heading size="sm">{title}</Heading>
        </HStack>
      </CardHeader>
      <CardBody pt={2}>{children}</CardBody>
    </Card>
  );
};

const ViewPatient = ({ user }) => {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const sectionItemBg = useColorModeValue("gray.50", "gray.700");

  if (!user) return <Text>No user data available</Text>;

  const personalInfo = user?.profileDetails?.personalInfo || {};

  // ✅ Declare hook values only once at top level

  return (
    <Box p={2} bg={pageBg}>
      {/* Profile Header */}
      <Card mb={6} shadow="sm">
        <CardBody>
          <Stack direction={["column", "row"]} spacing={4} align="center">
            {user.pic?.url && (
              <Image
                src={user.pic.url}
                alt={user.name}
                boxSize="80px"
                borderRadius="full"
                shadow="md"
              />
            )}
            <Box>
              <Heading size="md">{user.name}</Heading>
              <Text fontSize="sm" color="gray.500">
                {user.userType} — {user.code}
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Basic Info */}
      <SectionCard title="Basic Information">
        <VStack align="stretch" spacing={2}>
          <InfoItem label="Username" value={user.username} />
          <InfoItem label="Bio" value={user.bio} />
          <InfoItem label="DOB" value={personalInfo.dob} />
          <InfoItem
            label="Languages"
            value={personalInfo.languages?.join(", ")}
          />
          <InfoItem
            label="Medical History"
            value={personalInfo.medicalHistory}
          />
        </VStack>
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact Information">
        <VStack align="stretch" spacing={2}>
          {personalInfo.phones
            ?.filter((p) => p.number) // only keep non-empty
            .map((p, idx) => (
              <HStack key={idx}>
                <PhoneIcon color="teal.500" />
                <Text>
                  {p.number}{" "}
                  {p.primary && (
                    <Badge ml={1} colorScheme="green">
                      Primary
                    </Badge>
                  )}
                </Text>
              </HStack>
            ))}

          {/* Emails */}
          {personalInfo.emails
            ?.filter((e) => e.email) // only keep non-empty
            .map((e, idx) => (
              <HStack key={idx}>
                <EmailIcon color="teal.500" />
                <Text>
                  {e.email}{" "}
                  {e.primary && (
                    <Badge ml={1} colorScheme="green">
                      Primary
                    </Badge>
                  )}
                </Text>
              </HStack>
            ))}
        </VStack>
      </SectionCard>

      {/* Insurances */}
      <SectionCard icon={MdSecurity} title="Insurances">
        {personalInfo.insurances?.map((i, idx) => (
          <Box
            key={idx}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            mb={2}
            bg={sectionItemBg} // ✅ Precomputed value
          >
            <InfoItem label="Type" value={i.type} />
            <InfoItem label="Start Date" value={i.startDate} />
            <InfoItem label="Renewal Date" value={i.renewalDate} />
            <InfoItem label="Amount Insured" value={i.amountInsured} />
            <InfoItem label="Amount Paid" value={i.amountPaid} />
            <InfoItem label="Remarks" value={i.remarks || "None"} />
          </Box>
        ))}
      </SectionCard>
    </Box>
  );
};

export default ViewPatient;
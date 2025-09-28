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
  Wrap,
  WrapItem,
  Tooltip,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon } from "@chakra-ui/icons";
import { MdSecurity } from "react-icons/md";

// --- Info Item Component ---
const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <HStack align="start">
    <Text fontWeight="semibold" minW="140px" color="gray.600">
      {label}:
    </Text>
    <Text flex="1">{value || "NA"}</Text>
  </HStack>
);

// --- Section Card Component ---
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

// --- Medical Group Component ---
const MedicalGroup = ({ title, items }) => {
  const bg = useColorModeValue("gray.50", "gray.700");
  return (
    <Box p={3} borderRadius="md" bg={bg}>
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      <Wrap spacing={3}>
        {items.map((item, idx) => {
          const isImage =
            typeof item.value === "string" &&
            (item.value.startsWith("http://") || item.value.startsWith("https://"));

          return (
            <WrapItem key={idx}>
              <Tooltip label={isImage ? "Click to view image" : item.value} placement="top">
                <Badge
                  colorScheme={item.checked ? "teal" : "gray"}
                  px={3}
                  py={2}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  maxW="100%"
                >
                  {item.label}:
                  {isImage ? (
                    <Image
                      src={item.value}
                      alt={item.label}
                      boxSize="30px"
                      ml={2}
                      borderRadius="md"
                      objectFit="cover"
                    />
                  ) : (
                    <Text ml={1}>{item.value}</Text>
                  )}
                </Badge>
              </Tooltip>
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

// --- Render Medical History ---
const renderMedicalHistory = (history: any) => {
  if (!history) return <Text>NA</Text>;

  const conditions = [];
  const medications = [];
  const women = [];

  Object.entries(history).forEach(([key, val]: any) => {
    if (typeof val === "object") {
      if (val.checked !== undefined) {
        // Condition
        conditions.push({
          label: key,
          value: val.text || val.option || "Yes",
          checked: val.checked,
        });
      } else if (key === "medications") {
        Object.entries(val).forEach(([medKey, medVal]) => {
          medications.push({ label: medKey, value: medVal ? "Yes" : "NA", checked: medVal });
        });
      } else if (key === "women") {
        Object.entries(val).forEach(([wKey, wVal]) => {
          women.push({ label: wKey, value: wVal ? "Yes" : "NA", checked: wVal });
        });
      }
    }
  });

  return (
    <VStack align="stretch" spacing={3}>
      {conditions.length > 0 && <MedicalGroup title="Conditions" items={conditions} />}
      {medications.length > 0 && <MedicalGroup title="Medications" items={medications} />}
      {women.length > 0 && <MedicalGroup title="Women" items={women} />}
      {conditions.length === 0 && medications.length === 0 && women.length === 0 && (
        <Text>NA</Text>
      )}
    </VStack>
  );
};

// --- Main ViewPatient Component ---
const ViewPatient = ({ user }) => {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const sectionItemBg = useColorModeValue("gray.50", "gray.700");

  if (!user) return <Text>No user data available</Text>;

  const personalInfo = user;

  return (
    <Box p={4} bg={pageBg}>
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
                {user.type}
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
            label="Gender"
            value={personalInfo.gender === 1 ? "Male" : "Female"}
          />
          <InfoItem label="Languages" value={personalInfo.languages?.join(", ")} />
          <Box>
            <Text fontWeight="semibold" mb={2} color="gray.600">
              Medical History:
            </Text>
            {renderMedicalHistory(personalInfo.medicalHistory)}
          </Box>
        </VStack>
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact Information">
        <VStack align="stretch" spacing={2}>
          {personalInfo.phones?.filter((p) => p.number).map((p, idx) => (
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

          {personalInfo.emails?.filter((e) => e.email).map((e, idx) => (
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

          {personalInfo.addresses && (
            <>
              <InfoItem label="Residential" value={personalInfo.addresses.residential} />
              <InfoItem label="Office" value={personalInfo.addresses.office} />
              <InfoItem label="Other" value={personalInfo.addresses.other} />
            </>
          )}
        </VStack>
      </SectionCard>

      {/* Insurances */}
      <SectionCard icon={MdSecurity} title="Insurances">
        {personalInfo.insurances?.length > 0 ? (
          personalInfo.insurances.map((i, idx) => (
            <Box
              key={idx}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
              bg={sectionItemBg}
            >
              <InfoItem label="Type" value={i.type} />
              <InfoItem label="Start Date" value={i.startDate} />
              <InfoItem label="Renewal Date" value={i.renewalDate} />
              <InfoItem label="Amount Insured" value={i.amountInsured} />
              <InfoItem label="Amount Paid" value={i.amountPaid} />
              <InfoItem label="Remarks" value={i.remarks || "NA"} />
            </Box>
          ))
        ) : (
          <Text>NA</Text>
        )}
      </SectionCard>
    </Box>
  );
};

export default ViewPatient;

import React, { useState } from "react";
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Icon,
  Flex,
  Avatar,
  IconButton,
  Button,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon, CheckCircleIcon, CopyIcon } from "@chakra-ui/icons";
import { MdSecurity, MdHealthAndSafety } from "react-icons/md";
import { FiPhone, FiMail, FiMapPin, FiCalendar, FiUser, FiActivity, FiAlertCircle, FiCheck, FiCopy } from "react-icons/fi";
import { useColorModeValue } from "@chakra-ui/react";
import { copyToClipboard } from "../../../../config/utils/function";
import ReferredPatientsList from "./ReferredPatientsList";

// --- Info Item Component ---
export const InfoItem = ({ label, value, isActive, subItems, activeColor, bg, activeHoverBg }: any) => {
  // Extract label if value is an object like { label, value }
  const displayValue = typeof value === 'object' && value !== null && 'label' in value ? value.label : value;

  const textColor = useColorModeValue("gray.600", "gray.300");
  const bgIdle = bg || useColorModeValue("white", "gray.800");
  const bgHover = useColorModeValue("gray.100", "gray.700");
  const bgActive = useColorModeValue("teal.50", "teal.900");
  const bgActiveHover = activeHoverBg || useColorModeValue("teal.100", "teal.800");

  return (
    <Box
      p={3}
      borderRadius="lg"
      bg={isActive ? bgActive : bgIdle}
      _hover={{
        bg: isActive ? bgActiveHover : bgHover,
        transform: "scale(1.02)",
        transition: "all 0.3s ease",
      }}
      transition="all 0.3s ease"
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems={{ base: "start", md: "center" }}>
        <Text fontWeight="medium" fontSize="sm" color={textColor}>
          {label}
        </Text>
        <HStack spacing={2}>
          {isActive && <CheckCircleIcon color={activeColor} boxSize={4} />}
          <Badge
            colorScheme={isActive ? "teal" : "gray"}
            fontWeight={isActive ? "bold" : "normal"}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            whiteSpace="normal"
            textAlign="left"
            wordBreak="break-word"
          >
            {displayValue || "N/A"}
          </Badge>
        </HStack>
      </SimpleGrid>
      {subItems?.length > 0 && (
        <VStack align="start" spacing={2} pl={{ base: 0, md: 6 }} mt={2}>
          {subItems.map((subItem: any, idx: number) => (
            <SimpleGrid key={idx} columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <Text fontSize="sm" color={textColor}>
                {subItem.label}
              </Text>
              <Badge
                colorScheme={subItem.isActive ? "teal" : "gray"}
                fontWeight={subItem.isActive ? "bold" : "normal"}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                whiteSpace="normal"
                textAlign="left"
                wordBreak="break-word"
              >
                {subItem.value || "N/A"}
              </Badge>
            </SimpleGrid>
          ))}
        </VStack>
      )}
    </Box>
  );
};

// --- Section Card Component ---
const SectionCard = ({ icon, title, children, bg }: any) => {
  const cardBg = bg || useColorModeValue("white", "gray.800");
  const titleColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" shadow="md" mb={6}>
      <CardHeader pb={2}>
        <HStack spacing={3}>
          {icon && <Icon as={icon} boxSize={6} color="teal.500" />}
          <Heading size="md" color={titleColor}>
            {title}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody pt={2}>{children}</CardBody>
    </Card>
  );
};

// --- Render Medical History Component ---
export const RenderMedicalHistory = ({
  history = {},
  activeBg,
  inactiveBg,
  activeBorder,
  inactiveBorder,
  activeGroupBg,
  inactiveGroupBg,
  headingColor,
  activeColor,
  bg,
  activeHoverBg,
  textColor,
}: any) => {
  // Default to empty object to prevent undefined errors
  const safeHistory: any = history || {};

  // Define all fields
  const allFields = [
    // Conditions
    { key: "allergies", label: "Allergies", type: "condition" },
    { key: "bloodPressure", label: "Blood Pressure", type: "condition" },
    { key: "heartDisease", label: "Heart Disease", type: "condition" },
    { key: "pacemaker", label: "Pacemaker", type: "condition" },
    { key: "diabetes", label: "Diabetes", type: "condition" },
    { key: "thyroid", label: "Thyroid", type: "condition" }, // Added thyroid field
    { key: "asthma", label: "Asthma", type: "condition" },
    { key: "artificialJointOrValve", label: "Artificial Joint or Valve", type: "condition" },
    { key: "kidneyDisease", label: "Kidney Disease", type: "condition" },
    { key: "tuberculosis", label: "Tuberculosis", type: "condition" },
    { key: "hepatitis", label: "Hepatitis", type: "condition" },
    { key: "bloodTransfusion", label: "Blood Transfusion", type: "condition" },
    { key: "cancer", label: "Cancer", type: "condition" },
    { key: "neurologicCondition", label: "Neurologic Condition", type: "condition" },
    { key: "epilepsy", label: "Epilepsy", type: "condition" },
    { key: "aids", label: "AIDS", type: "condition" },
    { key: "hiv", label: "HIV", type: "condition" },
    { key: "anaemia", label: "Anaemia", type: "condition" },
    { key: "otherMedicalIssue", label: "Other Medical Issue", type: "condition" },
    { key: "smoking", label: "Smoking", type: "condition" },
    { key: "chewingTobacco", label: "Chewing Tobacco", type: "condition" },
    { key: "alcohol", label: "Alcohol", type: "condition" },
    // Pacemaker Medications
    { key: "pacemakerMeds.aspirin", label: "Aspirin", type: "pacemakerMed" },
    { key: "pacemakerMeds.anticoagulants", label: "Anticoagulants", type: "pacemakerMed" },
    { key: "pacemakerMeds.bloodPressureMeds", label: "Blood Pressure Medications", type: "pacemakerMed" },
    { key: "pacemakerMeds.nitroglycerin", label: "Nitroglycerin", type: "pacemakerMed" },
    // Other Medications
    { key: "medications.antibiotics", label: "Antibiotics", type: "medication" },
    { key: "medications.antidepressants", label: "Antidepressants / Tranquilizers", type: "medication" },
    { key: "medications.steroids", label: "Cortisone / Steroids", type: "medication" },
    { key: "medications.osteoporosisMeds", label: "Osteoporosis Medicine", type: "medication" },
    { key: "medications.other1", label: "Other Medication (First)", type: "medication" },
    { key: "medications.other2", label: "Other Medication (Second)", type: "medication" },
    // Women-Specific
    { key: "women.pregnant", label: "Pregnant", type: "women" },
    { key: "women.dueDate", label: "Due Date", type: "women" },
    { key: "women.breastFeeding", label: "Breast Feeding", type: "women" },
    { key: "women.hormones", label: "Hormones", type: "women" },
    { key: "women.pcodPcos", label: "PCOD/PCOS", type: "women" },
  ];

  // Process all fields with defensive checks
  const items = allFields.map(({ key, label, type }) => {
    let value, isActive, subItems;

    if (type === "condition" || (type === "women" && key === "women.pcodPcos")) {
      const data = key.includes(".") ? safeHistory[key.split(".")[0]]?.[key.split(".")[1]] || {} : safeHistory[key] || {};
      isActive = data.checked === true || ["yes", "high", "low", "occasional"].includes(data.option) || !!data.text;
      value = data.option ? data.option.charAt(0).toUpperCase() + data.option.slice(1) : (data.checked === true ? "Yes" : "No");
      subItems = [];
      if (data.text) {
        subItems.push({ label: "Details", value: data.text, isActive: !!data.text });
      }
      if (key === "diabetes" && data.insulin != null) {
        subItems.push({ label: "Insulin", value: data.insulin === true ? "Yes" : "No", isActive: data.insulin === true });
      }
      if (key === "thyroid" && data.type) {
        subItems.push({ label: "Type", value: data.type === "hyper" ? "Hyperthyroidism" : "Hypothyroidism", isActive: !!data.type });
      }
    } else if (type === "pacemakerMed" || type === "medication") {
      const [parent, child] = key.split(".");
      const data = safeHistory[parent]?.[child] ?? (type === "medication" ? "" : false);
      isActive = data === true || (typeof data === "string" && data);
      value = typeof data === "boolean" ? (data ? "Yes" : "No") : data || "N/A";
    } else if (type === "women") {
      const data = safeHistory.women?.[key.split(".")[1]] ?? (key === "women.dueDate" ? "" : false);
      isActive = data === true || (typeof data === "string" && data);
      value = typeof data === "boolean" ? (data ? "Yes" : "No") : data || "N/A";
    }

    return { label, value, isActive, subItems };
  }).filter(item => item.isActive); // Filter out inactive items

  // Group related fields
  const groups = [
    {
      label: "Conditions",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        [
          "Allergies",
          "Blood Pressure",
          "Heart Disease",
          "Pacemaker",
          "Diabetes",
          "Thyroid",
          "Asthma",
          "Artificial Joint or Valve",
          "Kidney Disease",
          "Tuberculosis",
          "Hepatitis",
          "Blood Transfusion",
          "Cancer",
          "Neurologic Condition",
          "Epilepsy",
          "AIDS",
          "HIV",
          "Anaemia",
          "Other Medical Issue",
          "Smoking",
          "Chewing Tobacco",
          "Alcohol",
        ].includes(item.label)
      ),
      isActive: items
        .filter((item) =>
          [
            "Allergies",
            "Blood Pressure",
            "Heart Disease",
            "Pacemaker",
            "Diabetes",
            "Thyroid",
            "Asthma",
            "Artificial Joint or Valve",
            "Kidney Disease",
            "Tuberculosis",
            "Hepatitis",
            "Blood Transfusion",
            "Cancer",
            "Neurologic Condition",
            "Epilepsy",
            "AIDS",
            "HIV",
            "Anaemia",
            "Other Medical Issue",
            "Smoking",
            "Chewing Tobacco",
            "Alcohol",
          ].includes(item.label)
        )
        .some((item) => item.isActive),
    },
    {
      label: "Pacemaker Medications",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        ["Aspirin", "Anticoagulants", "Blood Pressure Medications", "Nitroglycerin"].includes(item.label)
      ),
      isActive:
        safeHistory.pacemaker?.checked === true &&
        items
          .filter((item) =>
            ["Aspirin", "Anticoagulants", "Blood Pressure Medications", "Nitroglycerin"].includes(item.label)
          )
          .some((item) => item.isActive),
    },
    {
      label: "Other Medications",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        [
          "Antibiotics",
          "Antidepressants / Tranquilizers",
          "Cortisone / Steroids",
          "Osteoporosis Medicine",
          "Other Medication (First)",
          "Other Medication (Second)",
        ].includes(item.label)
      ),
      isActive:
        safeHistory.otherMedicalIssue?.option === "yes" &&
        items
          .filter((item) =>
            [
              "Antibiotics",
              "Antidepressants / Tranquilizers",
              "Cortisone / Steroids",
              "Osteoporosis Medicine",
              "Other Medication (First)",
              "Other Medication (Second)",
            ].includes(item.label)
          )
          .some((item) => item.isActive),
    },
    {
      label: "Women-Specific",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        ["Pregnant", "Due Date", "Breast Feeding", "Hormones", "PCOD/PCOS"].includes(item.label)
      ),
      isActive: items
        .filter((item) => ["Pregnant", "Due Date", "Breast Feeding", "Hormones", "PCOD/PCOS"].includes(item.label))
        .some((item) => item.isActive),
    },
  ].filter((group) => group.subItems.length > 0); // Only show groups with active sub-items

  if (groups.length === 0) {
    return <Text>No relevant medical history to display</Text>;
  }

  return (
    <Box
      p={5}
      borderWidth={1}
      borderRadius="xl"
      bg={groups.some((group) => group.isActive) ? activeBg : inactiveBg}
      borderColor={groups.some((group) => group.isActive) ? activeBorder : inactiveBorder}
      shadow="lg"
      _hover={{ shadow: "xl", transition: "box-shadow 0.3s ease" }}
      transition="box-shadow 0.3s ease"
      aria-label="Medical History"
    >
      <Heading size="lg" mb={5} color={headingColor} fontWeight="bold">
        Medical History
      </Heading>
      <Accordion allowMultiple defaultIndex={groups.map((_, idx) => idx)}>
        {groups.map((group, idx) => (
          <AccordionItem key={idx} border="none" mb={2}>
            <AccordionButton
              bg={group.isActive ? activeGroupBg : inactiveGroupBg}
              borderRadius="lg"
              _hover={{
                bg: group.isActive ? "teal.200" : "gray.200",
                transform: "scale(1.01)",
                transition: "all 0.3s ease",
              }}
              px={4}
              py={3}
              transition="all 0.3s ease"
            >
              <HStack flex="1" textAlign="left" spacing={3}>
                <Icon as={group.icon} boxSize={6} color="teal.500" />
                <Text fontWeight="bold" fontSize="md" color={textColor}>
                  {group.label}
                </Text>
                {group.isActive && (
                  <Badge colorScheme="teal" borderRadius="full" px={2} py={0.5} fontSize="xs" flexShrink={0}>
                    Active
                  </Badge>
                )}
              </HStack>
              <AccordionIcon boxSize={6} />
            </AccordionButton>
            <AccordionPanel pb={4} pt={3}>
              <VStack align="stretch" spacing={3}>
                {group.subItems.map((item, subIdx) => (
                  <InfoItem
                    key={subIdx}
                    label={item.label}
                    value={item.value}
                    isActive={item.isActive}
                    subItems={item.subItems}
                    activeColor={activeColor}
                    bg={bg}
                    activeHoverBg={activeHoverBg}
                  />
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

// --- Insurance Item Component ---
const InsuranceItem = ({ insurance, bg, activeColor, activeHoverBg }: any) => {
  return (
    <Box
      p={3}
      borderWidth={1}
      borderRadius="lg"
      mb={2}
      bg={bg}
      shadow="sm"
      _hover={{ shadow: "md", transition: "box-shadow 0.3s ease" }}
    >
      <InfoItem
        label="Type"
        value={insurance?.type}
        isActive={!!insurance?.type}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Start Date"
        value={insurance?.startDate}
        isActive={!!insurance?.startDate}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Renewal Date"
        value={insurance?.renewalDate}
        isActive={!!insurance?.renewalDate}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Amount Insured"
        value={insurance?.amountInsured}
        isActive={!!insurance?.amountInsured}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Amount Paid"
        value={insurance?.amountPaid}
        isActive={!!insurance?.amountPaid}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Remarks"
        value={insurance?.remarks || "N/A"}
        isActive={!!insurance?.remarks}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
    </Box>
  );
};

// --- Main ViewPatient Component ---
const ViewPatient = ({ user }: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [copiedCode, setCopiedCode] = useState(false);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const sectionCardBg = useColorModeValue("white", "gray.800");
  const activeBg = useColorModeValue("linear-gradient(to bottom, teal.50, teal.100)", "linear-gradient(to bottom, teal.900, teal.800)");
  const inactiveBg = useColorModeValue("gray.50", "gray.700");
  const activeBorder = useColorModeValue("teal.300", "teal.600");
  const inactiveBorder = useColorModeValue("gray.200", "gray.600");
  const activeGroupBg = useColorModeValue("teal.100", "teal.800");
  const inactiveGroupBg = useColorModeValue("gray.100", "gray.600");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const insuranceBg = useColorModeValue("gray.50", "gray.700");
  const activeColor = useColorModeValue("teal.600", "teal.300");
  const bg = useColorModeValue("gray.100", "gray.700");
  const activeHoverBg = useColorModeValue("linear-gradient(to right, teal.100, teal.200)", "linear-gradient(to right, teal.800, teal.900)");

  if (!user) return <Text>No user data available</Text>;

  const personalInfo = user;

  // Phone extractor
  const primaryPhone =
    personalInfo.phones?.find((p: any) => p.primary)?.number ||
    personalInfo.phones?.[0]?.number ||
    personalInfo.mobile ||
    personalInfo.phone;
  
  // Fallback to 10-digit code prefix if phone empty
  const rawCodeMatch = personalInfo.code ? String(personalInfo.code).match(/^(\d{10})/) : null;
  const resolvedPhone = primaryPhone || (rawCodeMatch ? rawCodeMatch[1] : null);

  // Gender text
  const genderText =
    personalInfo.gender === 1 || personalInfo.gender === "1" || String(personalInfo.gender).toLowerCase() === "male"
      ? "Male"
      : personalInfo.gender === 2 || personalInfo.gender === "2" || String(personalInfo.gender).toLowerCase() === "female"
      ? "Female"
      : personalInfo.gender ? "Other" : null;

  const handleCopyCode = () => {
    if (personalInfo.code) {
      copyToClipboard(personalInfo.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // ==============================================================
  // MOBILE DEDICATED VIEW (< 768px)
  // ==============================================================
  if (isMobile) {
    const cardBgColor = sectionCardBg;
    const cardBorderColor = useColorModeValue("gray.100", "whiteAlpha.200");

    // Collect valid basic info items
    const validBasicFields = [
      { label: "Date of Birth", value: personalInfo.dob },
      { label: "Gender", value: genderText },
      { label: "Languages", value: personalInfo.languages?.filter(Boolean).join(", ") },
      { label: "Special Details", value: personalInfo.bio },
      { label: "Username", value: personalInfo.username && personalInfo.username !== personalInfo.name ? personalInfo.username : null },
    ].filter((item) => item.value && String(item.value).trim() !== "" && item.value !== "N/A");

    return (
      <Box p={3} pb="calc(80px + env(safe-area-inset-bottom, 16px))" bg={pageBg}>
        {/* 1. Executive Profile Header Card */}
        <Box
          bg={cardBgColor}
          borderRadius="24px"
          p={4}
          mb={3}
          border="1px solid"
          borderColor={cardBorderColor}
          boxShadow="0 4px 20px rgba(0,0,0,0.04)"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle Accent Glow */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="4px"
            bgGradient="linear(to-r, #0EA5E9, #0D9488, #8B5CF6)"
          />

          <Flex align="center" gap={3.5} mb={3}>
            <Avatar
              size="lg"
              name={personalInfo.name || "Patient"}
              src={personalInfo.pic?.url}
              bg="teal.500"
              color="white"
              fontWeight="900"
              borderRadius="20px"
              border="2px solid"
              borderColor={useColorModeValue("white", "gray.700")}
              boxShadow="0 4px 12px rgba(13, 148, 136, 0.25)"
            />
            <Box flex={1} minW={0}>
              <Heading size="md" fontWeight="900" color={headingColor} noOfLines={1} letterSpacing="-0.3px">
                {personalInfo.name || "Unnamed Patient"}
              </Heading>

              <HStack spacing={1.5} mt={1} wrap="wrap">
                {personalInfo.code && (
                  <Badge
                    bg={useColorModeValue("blue.50", "blue.900")}
                    color={useColorModeValue("blue.700", "blue.200")}
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="10px"
                    fontWeight="800"
                    cursor="pointer"
                    onClick={handleCopyCode}
                    _hover={{ opacity: 0.8 }}
                  >
                    #{personalInfo.code} {copiedCode ? "✓" : ""}
                  </Badge>
                )}

                {genderText && (
                  <Badge
                    colorScheme={genderText === "Male" ? "blue" : genderText === "Female" ? "pink" : "purple"}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="10px"
                    fontWeight="750"
                  >
                    {genderText}
                  </Badge>
                )}

                <Badge
                  colorScheme="teal"
                  variant="subtle"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="10px"
                  fontWeight="750"
                  textTransform="uppercase"
                >
                  {personalInfo.type || "Patient"}
                </Badge>
              </HStack>
            </Box>
          </Flex>

          {/* Quick Action Contact Row */}
          <Flex gap={2} pt={1}>
            {resolvedPhone ? (
              <Button
                as="a"
                href={`tel:${resolvedPhone}`}
                flex={1}
                size="sm"
                bgGradient="linear(to-r, teal.500, teal.600)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                _active={{ transform: "scale(0.98)" }}
                leftIcon={<FiPhone />}
                borderRadius="14px"
                fontWeight="800"
                fontSize="12px"
                boxShadow="0 4px 12px rgba(13, 148, 136, 0.25)"
              >
                Call ({resolvedPhone.slice(-4)})
              </Button>
            ) : (
              <Button
                flex={1}
                size="sm"
                variant="outline"
                isDisabled
                leftIcon={<FiPhone />}
                borderRadius="14px"
                fontSize="12px"
              >
                No Phone
              </Button>
            )}

            {personalInfo.code && (
              <IconButton
                aria-label="Copy Patient ID"
                icon={<FiCopy />}
                size="sm"
                variant="outline"
                borderColor={cardBorderColor}
                borderRadius="14px"
                color={textColor}
                onClick={handleCopyCode}
                title="Copy Patient ID"
              />
            )}
          </Flex>
        </Box>

        {/* 2. Vital Patient Information Card */}
        {validBasicFields.length > 0 && (
          <Box
            bg={cardBgColor}
            borderRadius="20px"
            p={4}
            mb={3}
            border="1px solid"
            borderColor={cardBorderColor}
            boxShadow="0 2px 10px rgba(0,0,0,0.02)"
          >
            <HStack spacing={2} mb={3}>
              <Box w="3px" h="14px" bg="blue.500" borderRadius="full" />
              <Text fontSize="12px" fontWeight="900" color={headingColor} textTransform="uppercase" letterSpacing="0.5px">
                Patient Details
              </Text>
            </HStack>

            <SimpleGrid columns={2} spacing={2.5}>
              {validBasicFields.map((field, idx) => (
                <Box
                  key={idx}
                  p={2.5}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderRadius="14px"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.100", "gray.600")}
                >
                  <Text fontSize="10px" fontWeight="700" color={subTextColor} textTransform="uppercase">
                    {field.label}
                  </Text>
                  <Text fontSize="13px" fontWeight="800" color={textColor} mt={0.5} noOfLines={2}>
                    {field.value}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* 3. Contact & Address Details */}
        <Box
          bg={cardBgColor}
          borderRadius="20px"
          p={4}
          mb={3}
          border="1px solid"
          borderColor={cardBorderColor}
          boxShadow="0 2px 10px rgba(0,0,0,0.02)"
        >
          <HStack spacing={2} mb={3}>
            <Box w="3px" h="14px" bg="teal.500" borderRadius="full" />
            <Text fontSize="12px" fontWeight="900" color={headingColor} textTransform="uppercase" letterSpacing="0.5px">
              Contact & Address
            </Text>
          </HStack>

          <VStack align="stretch" spacing={2}>
            {/* Phone numbers */}
            {personalInfo.phones?.length > 0 ? (
              personalInfo.phones
                .filter((p: any) => p?.number)
                .map((p: any, idx: number) => (
                  <Flex
                    as="a"
                    href={`tel:${p.number}`}
                    key={idx}
                    align="center"
                    justify="space-between"
                    p={2.5}
                    bg={useColorModeValue("teal.50", "teal.900")}
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={useColorModeValue("teal.100", "teal.700")}
                  >
                    <HStack spacing={2.5}>
                      <Icon as={FiPhone} color="teal.500" boxSize={4} />
                      <Text fontSize="13px" fontWeight="800" color={useColorModeValue("teal.800", "teal.100")}>
                        {p.number}
                      </Text>
                    </HStack>
                    {p.primary && (
                      <Badge colorScheme="green" variant="solid" borderRadius="full" px={2} fontSize="9px">
                        Primary
                      </Badge>
                    )}
                  </Flex>
                ))
            ) : resolvedPhone ? (
              <Flex
                as="a"
                href={`tel:${resolvedPhone}`}
                align="center"
                justify="space-between"
                p={2.5}
                bg={useColorModeValue("teal.50", "teal.900")}
                borderRadius="14px"
                border="1px solid"
                borderColor={useColorModeValue("teal.100", "teal.700")}
              >
                <HStack spacing={2.5}>
                  <Icon as={FiPhone} color="teal.500" boxSize={4} />
                  <Text fontSize="13px" fontWeight="800" color={useColorModeValue("teal.800", "teal.100")}>
                    {resolvedPhone}
                  </Text>
                </HStack>
                <Badge colorScheme="teal" borderRadius="full" px={2} fontSize="9px">
                  Extracted
                </Badge>
              </Flex>
            ) : (
              <Text fontSize="12px" color={subTextColor} fontStyle="italic">
                No phone number on record
              </Text>
            )}

            {/* Email addresses */}
            {personalInfo.emails?.filter((e: any) => e?.email).map((e: any, idx: number) => (
              <Flex
                as="a"
                href={`mailto:${e.email}`}
                key={idx}
                align="center"
                justify="space-between"
                p={2.5}
                bg={useColorModeValue("blue.50", "blue.900")}
                borderRadius="14px"
                border="1px solid"
                borderColor={useColorModeValue("blue.100", "blue.700")}
              >
                <HStack spacing={2.5} minW={0} flex={1}>
                  <Icon as={FiMail} color="blue.500" boxSize={4} flexShrink={0} />
                  <Text fontSize="12px" fontWeight="700" color={useColorModeValue("blue.800", "blue.100")} noOfLines={1}>
                    {e.email}
                  </Text>
                </HStack>
                {e.primary && (
                  <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2} fontSize="9px" flexShrink={0} ml={2}>
                    Primary
                  </Badge>
                )}
              </Flex>
            ))}

            {/* Addresses */}
            {personalInfo.addresses && (personalInfo.addresses.residential || personalInfo.addresses.office || personalInfo.addresses.other) && (
              <VStack align="stretch" spacing={1.5} pt={1}>
                {personalInfo.addresses.residential && (
                  <Flex align="start" gap={2} p={2} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="12px">
                    <Icon as={FiMapPin} color="purple.500" boxSize={4} mt={0.5} flexShrink={0} />
                    <Box>
                      <Text fontSize="10px" fontWeight="750" color={subTextColor} textTransform="uppercase">Home Address</Text>
                      <Text fontSize="12px" fontWeight="600" color={textColor}>{personalInfo.addresses.residential}</Text>
                    </Box>
                  </Flex>
                )}
                {personalInfo.addresses.office && (
                  <Flex align="start" gap={2} p={2} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="12px">
                    <Icon as={FiMapPin} color="purple.500" boxSize={4} mt={0.5} flexShrink={0} />
                    <Box>
                      <Text fontSize="10px" fontWeight="750" color={subTextColor} textTransform="uppercase">Office Address</Text>
                      <Text fontSize="12px" fontWeight="600" color={textColor}>{personalInfo.addresses.office}</Text>
                    </Box>
                  </Flex>
                )}
              </VStack>
            )}
          </VStack>
        </Box>

        {/* 4. Medical History & Alerts */}
        <Box
          bg={cardBgColor}
          borderRadius="20px"
          p={4}
          mb={3}
          border="1px solid"
          borderColor={cardBorderColor}
          boxShadow="0 2px 10px rgba(0,0,0,0.02)"
        >
          <HStack spacing={2} mb={3}>
            <Box w="3px" h="14px" bg="red.500" borderRadius="full" />
            <Text fontSize="12px" fontWeight="900" color={headingColor} textTransform="uppercase" letterSpacing="0.5px">
              Clinical & Medical Alerts
            </Text>
          </HStack>

          <RenderMedicalHistory
            history={personalInfo.medicalHistory}
            activeBg={activeBg}
            inactiveBg={inactiveBg}
            activeBorder={activeBorder}
            inactiveBorder={inactiveBorder}
            activeGroupBg={activeGroupBg}
            inactiveGroupBg={inactiveGroupBg}
            headingColor={headingColor}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
            textColor={textColor}
          />
        </Box>

        {/* 5. References & Insurances (If Present) */}
        {personalInfo.references?.length > 0 && (
          <Box
            bg={cardBgColor}
            borderRadius="20px"
            p={4}
            mb={3}
            border="1px solid"
            borderColor={cardBorderColor}
          >
            <HStack spacing={2} mb={2.5}>
              <Box w="3px" h="14px" bg="purple.500" borderRadius="full" />
              <Text fontSize="12px" fontWeight="900" color={headingColor} textTransform="uppercase">
                References ({personalInfo.references.length})
              </Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              {personalInfo.references.map((ref: any, idx: number) => (
                <Box key={idx} p={2.5} bg={useColorModeValue("purple.50", "purple.900")} borderRadius="12px">
                  <Text fontSize="12px" fontWeight="800" color={useColorModeValue("purple.800", "purple.200")}>
                    {ref.refrenceBy?.label || ref.refrenceBy?.name || ref.refrenceBy?.username || "Reference"}
                  </Text>
                  {ref.refrenceNote && (
                    <Text fontSize="11px" color={subTextColor} mt={0.5}>
                      Note: {ref.refrenceNote}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {personalInfo.insurances?.length > 0 && (
          <Box
            bg={cardBgColor}
            borderRadius="20px"
            p={4}
            mb={3}
            border="1px solid"
            borderColor={cardBorderColor}
          >
            <HStack spacing={2} mb={2.5}>
              <Box w="3px" h="14px" bg="green.500" borderRadius="full" />
              <Text fontSize="12px" fontWeight="900" color={headingColor} textTransform="uppercase">
                Insurance Coverage
              </Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              {personalInfo.insurances.map((ins: any, idx: number) => (
                <Box key={idx} p={2.5} bg={useColorModeValue("green.50", "green.900")} borderRadius="12px">
                  <Text fontSize="12px" fontWeight="800" color={useColorModeValue("green.800", "green.200")}>
                    {ins.type || "Insurance Plan"}
                  </Text>
                  {ins.amountInsured && (
                    <Text fontSize="11px" color={subTextColor}>
                      Insured Amount: ₹{ins.amountInsured}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* 6. Referred Patients Section */}
        <Box mt={2}>
          <ReferredPatientsList userId={personalInfo._id} />
        </Box>
      </Box>
    );
  }

  // ==============================================================
  // DESKTOP VIEW (>= 768px) - 100% UNCHANGED
  // ==============================================================
  return (
    <Box p={4} bg={pageBg}>
      {/* Profile Header */}
      <Card mb={6} shadow="md" borderRadius="lg" bg={sectionCardBg}>
        <CardBody>
          <Stack direction={["column", "row"]} spacing={4} align="center">
            {personalInfo?.pic?.url && (
              <Image
                src={personalInfo.pic.url}
                alt={personalInfo.name}
                boxSize="80px"
                borderRadius="full"
                shadow="md"
              />
            )}
            <Box>
              <Heading size="md">{personalInfo.name || "N/A"}</Heading>
              <Text fontSize="sm" color="gray.500">
                {personalInfo.type || "N/A"}
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Basic Info */}
      <SectionCard title="Basic Information" bg={sectionCardBg}>
        <VStack align="stretch" spacing={3}>
          <InfoItem
            label="Username"
            value={personalInfo.username}
            isActive={!!personalInfo.username}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="Special Details"
            value={personalInfo.bio}
            isActive={!!personalInfo.bio}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="DOB"
            value={personalInfo.dob}
            isActive={!!personalInfo.dob}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="Gender"
            value={personalInfo.gender === 1 ? "Male" : personalInfo.gender === 2 ? "Female" : "Other"}
            isActive={personalInfo.gender != null}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="Languages"
            value={personalInfo.languages?.join(", ")}
            isActive={personalInfo.languages?.length > 0}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <Box>
            <Text fontWeight="semibold" mb={3} color={useColorModeValue("gray.700", "gray.200")} fontSize="lg">
              Medical History:
            </Text>
            <RenderMedicalHistory
              history={personalInfo.medicalHistory}
              activeBg={activeBg}
              inactiveBg={inactiveBg}
              activeBorder={activeBorder}
              inactiveBorder={inactiveBorder}
              activeGroupBg={activeGroupBg}
              inactiveGroupBg={inactiveGroupBg}
              headingColor={headingColor}
              activeColor={activeColor}
              bg={bg}
              activeHoverBg={activeHoverBg}
              textColor={textColor}
            />
          </Box>
        </VStack>
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact Information" bg={sectionCardBg}>
        <VStack align="stretch" spacing={3}>
          {personalInfo.phones?.filter((p: any) => p?.number).map((p: any, idx: number) => (
            <HStack key={idx}>
              <PhoneIcon color="teal.500" />
              <Text>
                {p.number}{" "}
                {p.primary && (
                  <Badge ml={1} colorScheme="green" borderRadius="full" px={2}>
                    Primary
                  </Badge>
                )}
              </Text>
            </HStack>
          ))}

          {personalInfo.emails?.filter((e: any) => e?.email).map((e: any, idx: number) => (
            <HStack key={idx}>
              <EmailIcon color="teal.500" />
              <Text>
                {e.email}{" "}
                {e.primary && (
                  <Badge ml={1} colorScheme="green" borderRadius="full" px={2}>
                    Primary
                  </Badge>
                )}
              </Text>
            </HStack>
          ))}

          {personalInfo.addresses && (
            <>
              <InfoItem
                label="Residential"
                value={personalInfo.addresses.residential}
                isActive={!!personalInfo.addresses.residential}
                activeColor={activeColor}
                bg={bg}
                activeHoverBg={activeHoverBg}
              />
              <InfoItem
                label="Office"
                value={personalInfo.addresses.office}
                isActive={!!personalInfo.addresses.office}
                activeColor={activeColor}
                bg={bg}
                activeHoverBg={activeHoverBg}
              />
              <InfoItem
                label="Other"
                value={personalInfo.addresses.other}
                isActive={!!personalInfo.addresses.other}
                activeColor={activeColor}
                bg={bg}
                activeHoverBg={activeHoverBg}
              />
            </>
          )}
        </VStack>
      </SectionCard>

      {/* References */}
      <SectionCard title="References" bg={sectionCardBg}>
        <VStack align="stretch" spacing={3}>
          {personalInfo.references?.length > 0 ? (
            personalInfo.references.map((ref: any, idx: number) => (
              <Box key={idx} p={3} borderWidth={1} borderRadius="lg" bg={bg}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" color="teal.600">
                    {ref.refrenceBy?.label || ref.refrenceBy?.name || ref.refrenceBy?.username || "N/A"}
                  </Text>
                </HStack>
                {ref.refrenceNote && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Note: {ref.refrenceNote}
                  </Text>
                )}
              </Box>
            ))
          ) : (
            <Text color="gray.500">No references added</Text>
          )}
        </VStack>
      </SectionCard>

      {/* Insurances */}
      <SectionCard icon={MdSecurity} title="Insurances" bg={sectionCardBg}>
        {personalInfo.insurances?.length > 0 ? (
          personalInfo.insurances.map((i: any, idx: number) => (
            <InsuranceItem
              key={idx}
              insurance={i}
              bg={insuranceBg}
              activeColor={activeColor}
              activeHoverBg={activeHoverBg}
            />
          ))
        ) : (
          <Text>N/A</Text>
        )}
      </SectionCard>

      {/* Referred Patients List */}
      <ReferredPatientsList userId={personalInfo._id} />
    </Box>
  );
};

export default ViewPatient;
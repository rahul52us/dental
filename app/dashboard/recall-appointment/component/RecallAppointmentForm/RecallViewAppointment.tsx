import { toJS } from "mobx";
import React from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

const RecallViewAppointment = ({ data }: any) => {
  const recall = toJS(data);
  if (!recall) return null;

  const cardBg = useColorModeValue("white", "gray.800");
  const leftPanelBg = useColorModeValue("gray.900", "gray.950");
  const borderCol = useColorModeValue("gray.200", "gray.700");
  const dashedBorderCol = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "gray.100");
  const reasonBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const reasonBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const reasonText = useColorModeValue("gray.800", "gray.200");

  const statusColor: any = {
    pending: "orange.400",
    scheduled: "blue.400",
    completed: "green.500",
    cancelled: "red.500",
  };

  const Row = ({ label, value }: any) => (
    <Flex
      py={3}
      align="center"
      justify="space-between"
      _notLast={{
        borderBottom: "1px dashed",
        borderColor: dashedBorderCol,
      }}
    >
      <Text
        fontSize="sm"
        color={labelColor}
        letterSpacing="0.3px"
      >
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="600"
        color={valueColor}
        textAlign="right"
      >
        {value || "--"}
      </Text>
    </Flex>
  );

  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      border="1px solid"
      borderColor={borderCol}
      borderRadius="xl"
      overflow="hidden"
      bg={cardBg}
      minH={{ base: "auto", sm: "320px" }}
    >
      {/* ===== LEFT STATUS PANEL ===== */}
      <Flex
        direction={{ base: "row", sm: "column" }}
        align="center"
        justify="space-between"
        w={{ base: "100%", sm: "130px" }}
        bg={leftPanelBg}
        color="white"
        px={{ base: 4, sm: 3 }}
        py={{ base: 3, sm: 4 }}
        gap={{ base: 2, sm: 0 }}
        flexWrap={{ base: "wrap", sm: "nowrap" }}
      >
        <Badge
          bg={statusColor[recall.status] || "teal.500"}
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          textTransform="uppercase"
          fontSize="0.7rem"
          letterSpacing="0.5px"
        >
          {recall.status}
        </Badge>

        <Box textAlign={{ base: "left", sm: "center" }}>
          <Text fontSize="xs" opacity={0.6}>
            Recall Date
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {recall.recallDate
              ? new Date(recall.recallDate).toLocaleDateString('en-IN')
              : "--"}
          </Text>
        </Box>

        <Box textAlign={{ base: "right", sm: "center" }}>
          <Text fontSize="xs" opacity={0.6}>
            Created On
          </Text>
          <Text fontSize="xs">
            {new Date(recall.createdAt).toLocaleDateString('en-IN')}
          </Text>
        </Box>
      </Flex>

      {/* ===== RIGHT DETAILS PANEL ===== */}
      <Box flex="1" px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>

        <Row
          label="Patient"
          value={`${recall.patient?.name} (${recall.patient?.code})`}
        />
        <Row
          label="Patient Mobile"
          value={recall.patient?.mobileNumber}
        />
        <Row
          label="Doctor"
          value={`${recall.doctor?.name} (${recall.doctor?.code})`}
        />
        <Row
          label="Created By"
          value={`${recall.createdDetails?.name} (${recall.createdDetails?.code})`}
        />

        <Divider my={5} borderColor={borderCol} />

        {/* Reason */}
        <Box>
          <Text
            fontSize="sm"
            color={labelColor}
            mb={2}
            letterSpacing="0.3px"
          >
            Recall Reason
          </Text>

          <Box
            bg={reasonBg}
            border="1px solid"
            borderColor={reasonBorder}
            p={4}
            borderRadius="md"
          >
            <Text
              fontSize="sm"
              color={reasonText}
              lineHeight="1.7"
            >
              {recall.reason}
            </Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default RecallViewAppointment;

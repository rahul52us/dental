import { Box, Text, Tooltip, VStack, Divider } from "@chakra-ui/react";
import { ToothData } from "../utils/teethData";

interface ToothShapeProps {
  tooth: ToothData;
  isSelected: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  notationType?: "fdi" | "universal" | "palmer";
  complaintType?: string;
  activeComplaintType?: string;
  todayRecord?: any;
  hasHistory?: boolean;
}


const sizeMap = {
  sm: { w: "32px", h: "48px" },
  md: { w: "40px", h: "56px" },
  lg: { w: "48px", h: "64px" },
};

export const ToothShape = ({
  tooth,
  isSelected,
  onClick,
  size = "md",
  notationType = "fdi",
  complaintType,
  activeComplaintType,
  todayRecord,
  hasHistory,
}: ToothShapeProps) => {

  const getNotationLabel = () => {
    switch (notationType) {
      case "universal":
        return tooth.universal;
      case "palmer":
        return tooth.palmer;
      case "fdi":
      default:
        return tooth.fdi;
    }
  };

  const notationLabel = getNotationLabel();
  const getToothPath = () => {
    switch (tooth.type) {
      case "molar":
        return tooth.position === "upper"
          ? "M8 4C4 4 2 8 2 14C2 20 4 24 8 26C12 28 16 28 20 26C24 24 26 20 26 14C26 8 24 4 20 4C16 4 12 4 8 4Z"
          : "M8 2C4 4 2 8 2 14C2 20 4 22 8 24C12 26 16 26 20 24C24 22 26 20 26 14C26 8 24 4 20 2C16 0 12 0 8 2Z";

      case "premolar":
        return tooth.position === "upper"
          ? "M10 4C6 4 4 8 4 14C4 20 6 24 10 26C14 28 18 26 22 24C24 20 24 14 22 8C20 4 16 4 10 4Z"
          : "M10 2C6 4 4 8 4 14C4 20 6 22 10 24C14 26 18 24 22 22C24 18 24 12 22 6C20 2 16 2 10 2Z";

      case "canine":
        return tooth.position === "upper"
          ? "M14 2C10 2 6 6 6 12C6 18 8 24 14 28C20 24 22 18 22 12C22 6 18 2 14 2Z"
          : "M14 0C10 2 6 6 6 12C6 18 8 22 14 26C20 22 22 18 22 12C22 6 18 0 14 0Z";

      case "incisor":
      default:
        return tooth.position === "upper"
          ? "M12 2C8 2 6 6 6 12C6 18 8 24 12 28C16 24 18 18 18 12C18 6 16 2 12 2Z"
          : "M12 0C8 2 6 6 6 12C6 18 8 22 12 26C16 22 18 18 18 12C18 6 16 0 12 0Z";
    }
  };

  const colorMap: Record<string, { bg: string; fill: string; stroke: string; text: string }> = {
    "CHIEF COMPLAINT": { bg: "#FFF5F5", fill: "#FEB2B2", stroke: "#F56565", text: "#742A2A" },
    "OTHER FINDING": { bg: "#FFFAF0", fill: "#FBD38D", stroke: "#ED8936", text: "#7B341E" },
    "EXISTING FINDING": { bg: "#F0FFF4", fill: "#9AE6B4", stroke: "#48BB78", text: "#22543D" },
    "default": { bg: "#EBF8FF", fill: "#63B3ED", stroke: "#2B6CB0", text: "#1A365D" },
    "today": { bg: "#EBF8FF", fill: "#63B3ED", stroke: "#3182CE", text: "#2C5282" }
  };

  const todayComplaintType = todayRecord?.complaintType?.toUpperCase();
  const historyStyle = { bg: "#EBF8FF", fill: "#90CDF4", stroke: "#4299E1", text: "#2C5282" };
  const activeStyle = isSelected
    ? (colorMap[activeComplaintType as string] || colorMap.default)
    : (complaintType ? colorMap[complaintType] : (todayComplaintType && colorMap[todayComplaintType]) ? colorMap[todayComplaintType] : todayRecord ? colorMap.today : hasHistory ? historyStyle : { bg: "transparent", fill: "#EDF2F7", stroke: "#CBD5E0", text: "#4A5568" });


  const tooltipContent = todayRecord ? (
    <VStack align="start" spacing={1} p={1}>
      <Text fontSize="10px" fontWeight="900" color="blue.200">TODAY'S WORK</Text>
      <Text fontWeight="1000" fontSize="xs">{todayRecord.treatmentPlan || "General Record"}</Text>
      <Divider borderColor="blue.400" />
      <Text fontSize="10px" opacity={0.8}>{todayRecord.complaintType}</Text>
      {todayRecord.notes && (
        <Text fontSize="10px" fontStyle="italic" color="whiteAlpha.800">
          "{todayRecord.notes}"
        </Text>
      )}
    </VStack>
  ) : null;

  return (
    <Tooltip 
      label={tooltipContent} 
      hasArrow 
      p={3} 
      bg="blue.700" 
      color="white" 
      borderRadius="xl" 
      isDisabled={!todayRecord}
      placement="top"
    >
      <Box
        as="button"
        onClick={onClick}
        display="flex"
        flexDir="column"
        alignItems="center"
        gap={1}
        p={1}
        rounded="lg"
        transition="all 0.2s"
        bg={activeStyle.bg}
        _hover={{ bg: isSelected ? activeStyle.bg : "gray.100" }}
        boxShadow={hasHistory && !isSelected ? "0 0 8px rgba(66, 153, 225, 0.3)" : "none"}

        border={todayRecord && !isSelected ? "1px dashed" : "1px solid"}
        borderColor={todayRecord && !isSelected ? "blue.300" : "transparent"}

      >
        <Box
          as="svg"
          viewBox="0 0 28 30"
          width={sizeMap[size].w}
          height={sizeMap[size].h}
          transition="all 0.2s"
        >
          <path
            d={getToothPath()}
            fill={activeStyle.fill}
            stroke={activeStyle.stroke}
            strokeWidth={isSelected || todayRecord ? 2 : 1}
            style={{ transition: "all 0.2s" }}
          />

          <text
            x="14"
            y="16"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="600"
            fill={activeStyle.text}
            pointerEvents="none"
          >
            {notationLabel}
          </text>
        </Box>

        <Text
          fontSize="10px"
          fontWeight="900"
          color={activeStyle.text}
          transition="color 0.2s"
        >
          {notationLabel}
        </Text>
      </Box>
    </Tooltip>
  );
};

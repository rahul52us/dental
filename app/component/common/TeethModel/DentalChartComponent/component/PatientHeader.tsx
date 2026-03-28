import { HStack, VStack, Text, Heading, Badge } from "@chakra-ui/react";

interface PatientHeaderProps {
  title: string;
  patient: any;
}

export const PatientHeader = ({ title, patient }: PatientHeaderProps) => (
  <HStack spacing={8} align="center">
    <VStack align="start" spacing={0}>
      <Text fontSize="10px" fontWeight="900" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="widest">{title}</Text>
      <Heading size="md" color="white" fontWeight="1000">{patient?.name || "Patient"}</Heading>
    </VStack>
    <HStack spacing={3}>
      {patient?.emergencyNumber && (
        <Badge colorScheme="red" variant="solid" borderRadius="full" px={3} py={1} border="2px solid white" boxShadow="0 0 10px rgba(229, 62, 62, 0.4)">
          EMERGENCY: {patient.emergencyNumber}
        </Badge>
      )}
      {(patient?.details?.important || patient?.important) && (
        <Badge colorScheme="orange" variant="solid" borderRadius="full" px={3} py={1} border="2px solid white">
          IMPORTANT ALERT
        </Badge>
      )}
    </HStack>
  </HStack>
);

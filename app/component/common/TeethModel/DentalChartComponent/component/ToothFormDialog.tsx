import { useState } from "react";
// import { ToothData } from "@/data/teethData";
import {
    Badge,
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Textarea,
    VStack,
    useToast
} from "@chakra-ui/react";

import {
    FiCalendar,
    FiFileText,
    FiMessageSquare,
    FiUser,
} from "react-icons/fi";
import { LuStethoscope } from "react-icons/lu";
import { ToothData } from "../utils/teethData";

interface ToothFormDialogProps {
  tooth: ToothData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TreatmentFormData {
  patientName: string;
  doctorName: string;
  treatmentPlan: string;
  treatmentDate: string;
  status: string;
  notes: string;
}

const initialFormData: TreatmentFormData = {
  patientName: "",
  doctorName: "",
  treatmentPlan: "",
  treatmentDate: "",
  status: "pending",
  notes: "",
};

const treatmentOptions = [
  "Extraction",
  "Root Canal Treatment",
  "Filling",
  "Crown",
  "Bridge",
  "Cleaning",
  "Whitening",
  "Orthodontic Treatment",
  "Implant",
  "Denture",
  "Gum Treatment",
  "Other",
];

export const ToothFormDialog = ({
  tooth,
  open,
  onOpenChange,
}: ToothFormDialogProps) => {
  const [formData, setFormData] =
    useState<TreatmentFormData>(initialFormData);

  const toast = useToast();

  if (!tooth) return null;

  const handleChange = (
    field: keyof TreatmentFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.doctorName ||
      !formData.treatmentPlan
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: `Treatment saved for tooth ${tooth.fdi}`,
      description: `${formData.treatmentPlan} scheduled for ${formData.patientName}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      isCentered
      size="lg"
    >
      <ModalOverlay />
      <ModalContent bg="white" borderRadius="xl">
        <ModalHeader>
          <HStack spacing={3}>
            <Box
              w="40px"
              h="40px"
              rounded="full"
              bg="blue.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="blue.600"
            >
              {tooth.fdi}
            </Box>
            <Heading size="md">Tooth Treatment Form</Heading>
          </HStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody pb={6}>
          {/* Tooth Info */}
          <HStack spacing={2} wrap="wrap" mb={6}>
            <Badge colorScheme="gray">{tooth.name}</Badge>
            <Badge variant="outline">FDI: {tooth.fdi}</Badge>
            <Badge variant="outline">
              Universal: {tooth.universal}
            </Badge>
            <Badge variant="outline">
              Palmer: {tooth.palmer}
            </Badge>
          </HStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={5} align="stretch">
              {/* Patient Name */}
              <FormControl isRequired>
                <FormLabel display="flex" gap={2}>
                  <FiUser /> Patient Name
                </FormLabel>
                <Input
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={(e) =>
                    handleChange("patientName", e.target.value)
                  }
                />
              </FormControl>

              {/* Doctor Name */}
              <FormControl isRequired>
                <FormLabel display="flex" gap={2}>
                  <LuStethoscope /> Doctor Name
                </FormLabel>
                <Input
                  placeholder="Enter doctor name"
                  value={formData.doctorName}
                  onChange={(e) =>
                    handleChange("doctorName", e.target.value)
                  }
                />
              </FormControl>

              {/* Treatment Plan */}
              <FormControl isRequired>
                <FormLabel display="flex" gap={2}>
                  <FiFileText /> Treatment Plan
                </FormLabel>
                <Select
                  placeholder="Select treatment plan"
                  value={formData.treatmentPlan}
                  onChange={(e) =>
                    handleChange("treatmentPlan", e.target.value)
                  }
                >
                  {treatmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Date & Status */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel display="flex" gap={2}>
                    <FiCalendar /> Treatment Date
                  </FormLabel>
                  <Input
                    type="date"
                    value={formData.treatmentDate}
                    onChange={(e) =>
                      handleChange("treatmentDate", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Notes */}
              <FormControl>
                <FormLabel display="flex" gap={2}>
                  <FiMessageSquare /> Additional Notes
                </FormLabel>
                <Textarea
                  placeholder="Enter any additional notes..."
                  minH="80px"
                  resize="none"
                  value={formData.notes}
                  onChange={(e) =>
                    handleChange("notes", e.target.value)
                  }
                />
              </FormControl>

              {/* Actions */}
              <HStack spacing={3} pt={4}>
                <Button
                  variant="outline"
                  flex={1}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  flex={1}
                  type="submit"
                >
                  Save Treatment
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

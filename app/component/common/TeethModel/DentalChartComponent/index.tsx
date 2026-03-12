'use client';

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  Icon,
  HStack,
  Progress,
  IconButton,
  Circle,
  Badge,
} from "@chakra-ui/react";
import {
  FiCheck,
  FiMousePointer,
  FiFileText,
  FiActivity,
  FiChevronRight,
  FiChevronLeft,
  FiX,
  FiSave
} from "react-icons/fi";

import { DentitionToggle } from "./component/DentitionToggle";
import { TeethChart } from "./component/TeethChart";
import { ToothInfoCard } from "./component/ToothInfoCard";
import { DentitionType, ToothData } from "./utils/teethData";
import { observer } from "mobx-react-lite";

import { DescriptionEntry } from "./component/DescriptionEntry";
import { ComplaintSelectionMode } from "./component/ComplaintSelectionMode";
import { TreatmentProcedureForm } from "./component/TreatmentProcedureForm";
import { ToothFormDialog } from "./component/ToothFormDialog";
import { NotationChoice } from "./component/NotationChoice";
import { getTeethByType } from "./utils/teethData";

type WizardStep =
  | "SELECTION_MODE"
  | "NOTATION_CHOICE"
  | "TOOTH_SELECTION"
  | "DESCRIPTION_ENTRY"
  | "PROCEDURE_FORM";

const Index = observer(({ isPatient, patientDetails, closeWizard }: any) => {
  const [step, setStep] = useState<WizardStep>("SELECTION_MODE");
  const [dentitionType, setDentitionType] = useState<DentitionType>("adult");
  const [selectedTeeth, setSelectedTeeth] = useState<ToothData[]>([]);
  const [notation, setNotation] = useState<"fdi" | "universal" | "palmer">("fdi");
  const [generalDescription, setGeneralDescription] = useState("");
  const [isToothFormOpen, setIsToothFormOpen] = useState(false);
  const [activeTeethForForm, setActiveTeethForForm] = useState<ToothData[]>([]);

  // Hoisted State for Phase 4 & Explorer
  const [procedureFormValues, setProcedureFormValues] = useState<any>(null);
  const [explorerState, setExplorerState] = useState({ catIdx: 0, subIdx: 0 });

  // Handle Edit Initialization
  useEffect(() => {
    if (patientDetails?.editData) {
      const edit = patientDetails.editData;
      
      // Reconstruct selected teeth
      const allTeeth = getTeethByType(dentitionType);
      const matchedTooth = allTeeth.find(t => t.id === edit.tooth?.fdi);
      if (matchedTooth) setSelectedTeeth([matchedTooth]);

      // Reconstruct form values
      setProcedureFormValues({
        doctor: edit.doctor ? { label: edit.doctor.name, value: edit.doctor._id } : undefined,
        treatmentDate: edit.treatmentDate?.split("T")[0] || new Date().toISOString().split("T")[0],
        notes: edit.notes || "",
        treatmentCode: edit.treatmentPlan || "",
        estimate: edit.estimate || 0,
        discount: edit.discount || 0,
        total: edit.total || 0,
        patient: { label: edit.patient?.name, value: edit.patient?._id },
        status: edit.status || "Planned",
        treatmentId: edit._id,
      });

      // Navigate to the form if editing
      setStep("PROCEDURE_FORM");
    }
  }, [patientDetails?.editData, dentitionType]);

  // Get dynamic steps based on selection
  const isTeethFlow = step === "NOTATION_CHOICE" || step === "TOOTH_SELECTION" || (step === "PROCEDURE_FORM" && selectedTeeth.length > 0);

  const steps = isTeethFlow
    ? [
      { id: "SELECTION_MODE", title: "MODE", icon: FiActivity },
      { id: "NOTATION_CHOICE", title: "NOTATION", icon: FiActivity },
      { id: "TOOTH_SELECTION", title: "SELECTION", icon: FiMousePointer },
      { id: "PROCEDURE_FORM", title: "PROCEDURE", icon: FiFileText },
    ]
    : [
      { id: "SELECTION_MODE", title: "MODE", icon: FiActivity },
      { id: "DESCRIPTION_ENTRY", title: "DESCRIPTION", icon: FiMousePointer },
      { id: "PROCEDURE_FORM", title: "PROCEDURE", icon: FiFileText },
    ];

  const currentMainIdx = steps.findIndex(s => s.id === step);
  const progressPercent = ((currentMainIdx + 1) / steps.length) * 100;

  const handleStepClick = (idx: number) => {
    if (idx < currentMainIdx) {
      setStep(steps[idx].id as WizardStep);
    }
  };

  const handleNext = () => {
    if (step === "TOOTH_SELECTION" || step === "DESCRIPTION_ENTRY") {
      setStep("PROCEDURE_FORM");
    }
  };

  const handleBack = () => {
    if (step === "NOTATION_CHOICE") setStep("SELECTION_MODE");
    if (step === "TOOTH_SELECTION") setStep("NOTATION_CHOICE");
    if (step === "DESCRIPTION_ENTRY") setStep("SELECTION_MODE");
    if (step === "PROCEDURE_FORM") {
      if (selectedTeeth.length > 0) setStep("TOOTH_SELECTION");
      else if (generalDescription) setStep("DESCRIPTION_ENTRY");
      else setStep("SELECTION_MODE");
    }
  };

  const handleToothClick = (tooth: ToothData) => {
    setSelectedTeeth((prev) => {
      const isSelected = prev.some((t) => t.id === tooth.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== tooth.id);
      } else {
        return [...prev, tooth];
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case "SELECTION_MODE":
        return (
          <Box maxW="4xl" mx="auto" pt={12}>
            <ComplaintSelectionMode
              onSelect={(mode) => {
                if (mode === "teeth") {
                  setStep("NOTATION_CHOICE");
                } else if (mode === "description") {
                  setStep("DESCRIPTION_ENTRY");
                } else {
                  setGeneralDescription("General Note");
                  setStep("PROCEDURE_FORM");
                }
              }}
            />
          </Box>
        );

      case "NOTATION_CHOICE":
        return (
          <Box maxW="2xl" mx="auto" pt={12}>
            <NotationChoice
              onBack={() => setStep("SELECTION_MODE")}
              onSelect={(not) => {
                setNotation(not);
                setStep("TOOTH_SELECTION");
              }}
            />
          </Box>
        );

      case "TOOTH_SELECTION":
        return (
          <VStack spacing={6} align="stretch" h="full">
            {/* Contextual Header - Compact Clinical */}
            <Flex
              justify="space-between"
              align="center"
              bg="white"
              px={8}
              py={4}
              borderRadius="3xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
            >
              <HStack spacing={12}>
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Circle size="5px" bg="blue.500" />
                    <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">DENTITION</Text>
                  </HStack>
                  <DentitionToggle value={dentitionType} onChange={setDentitionType} />
                </VStack>

                <Box w="1px" h="30px" bg="gray.50" />

                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Circle size="5px" bg="blue.500" />
                    <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">NOTATION</Text>
                  </HStack>
                  <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.100">
                    {[
                      { id: "fdi", label: "FDI" },
                      { id: "universal", label: "UNIV" },
                      { id: "palmer", label: "PALM" }
                    ].map((n) => (
                      <Button
                        key={n.id}
                        size="xs"
                        variant={notation === n.id ? "solid" : "ghost"}
                        colorScheme={notation === n.id ? "blue" : "gray"}
                        onClick={() => setNotation(n.id as any)}
                        fontSize="11px"
                        fontWeight="900"
                        h="28px"
                        px={4}
                        borderRadius="lg"
                        textTransform="uppercase"
                      >
                        {n.label}
                      </Button>
                    ))}
                  </HStack>
                </VStack>
              </HStack>

              <VStack align="end" spacing={0}>
                <Text fontSize="11px" fontWeight="900" color="gray.300" letterSpacing="0.2em">SELECTIONS</Text>
                <HStack spacing={2}>
                  <Text fontWeight="900" color="blue.500" fontSize="3xl" lineHeight="1">{selectedTeeth.length}</Text>
                  <Box p={2} bg="blue.50" borderRadius="lg">
                    <Icon as={FiMousePointer} boxSize={4} color="blue.500" />
                  </Box>
                </HStack>
              </VStack>
            </Flex>

            {/* Compact Refined Workspace */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={6} flex={1} overflow="hidden">
              <Box
                bg="white"
                borderRadius="3xl"
                border="1px solid"
                borderColor="gray.100"
                p={4}
                position="relative"
              >
                <TeethChart
                  dentitionType={dentitionType}
                  selectedTeeth={selectedTeeth}
                  onToothClick={handleToothClick}
                  notationType={notation}
                  onNotationChange={setNotation}
                />
              </Box>

              <VStack
                spacing={6}
                align="stretch"
                p={6}
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                rounded="3xl"
                h="full"
                boxShadow="xs"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em">DIAGNOSTIC QUEUE</Text>
                    <Heading size="xs" fontWeight="900" color="gray.800" letterSpacing="tight">Review Selections</Heading>
                  </VStack>
                  <Circle size="28px" bg="blue.500" color="white" fontSize="11px" fontWeight="900">
                    {selectedTeeth.length}
                  </Circle>
                </HStack>

                <Box flex={1} overflowY="auto" pr={2} sx={{
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' },
                }}>
                  {selectedTeeth.map((tooth) => (
                    <ToothInfoCard key={tooth.id} tooth={tooth} />
                  ))}
                  {selectedTeeth.length === 0 && (
                    <VStack textAlign="center" py={32} spacing={4} opacity={0.3}>
                      <Circle size="54px" bg="gray.50" border="1px solid" borderColor="gray.100">
                        <Icon as={FiMousePointer} fontSize="lg" color="gray.300" />
                      </Circle>
                      <VStack spacing={1}>
                        <Text fontSize="9px" color="gray.400" fontWeight="900" letterSpacing="0.2em" textTransform="uppercase">
                          Awaiting Interaction
                        </Text>
                        <Text fontSize="xs" color="gray.400" fontWeight="500">Pick from clinical map</Text>
                      </VStack>
                    </VStack>
                  )}
                </Box>

                <VStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    rightIcon={<FiChevronRight />}
                    isDisabled={selectedTeeth.length === 0}
                    onClick={handleNext}
                    w="full"
                    h="54px"
                    borderRadius="2xl"
                    fontSize="xs"
                    fontWeight="900"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    boxShadow="0 10px 20px rgba(49, 130, 206, 0.1)"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "0 15px 30px rgba(49, 130, 206, 0.15)" }}
                  >
                    Initialize Record
                  </Button>
                  <Text fontSize="9px" color="gray.300" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em">
                    Clinical Session Secured
                  </Text>
                </VStack>
              </VStack>
            </Grid>
          </VStack>
        );

      case "DESCRIPTION_ENTRY":
        return (
          <Box maxW="xl" mx="auto" pt={12}>
            <DescriptionEntry
              onBack={() => setStep("SELECTION_MODE")}
              onNext={(desc) => {
                setGeneralDescription(desc);
                setStep("PROCEDURE_FORM");
              }}
            />
          </Box>
        );

      case "PROCEDURE_FORM":
        return (
          <TreatmentProcedureForm
            isPatient={isPatient}
            patientDetails={patientDetails}
            teeth={selectedTeeth}
            generalDescription={generalDescription}
            onSuccess={() => {
              patientDetails?.applyGetAllRecords?.({});
              closeWizard?.();
            }}
            onBack={handleBack}
            // Hoisted State Props
            hoistedValues={procedureFormValues}
            onValuesUpdate={setProcedureFormValues}
            explorerState={explorerState}
            onExplorerUpdate={setExplorerState}
            editData={patientDetails?.editData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box h="100vh" bg="white" overflow="hidden">
      {/* Premium Glassmorphism Header */}
      <Flex direction="column" w="full" position="relative" zIndex={10}>
        <Flex
          justify="space-between"
          align="center"
          px={10}
          py={4}
          bg="rgba(255, 255, 255, 0.8)"
          backdropFilter="blur(20px)"
          borderBottom="1px"
          borderColor="gray.100"
        >
          <HStack spacing={8}>
            <VStack align="start" spacing={0}>
              <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em" textTransform="uppercase">
                Advanced Oral Health
              </Text>
              <Heading size="md" fontWeight="900" color="gray.800" letterSpacing="tight">
                DIAGNOSTIC SUITE
              </Heading>
            </VStack>

            <Box w="1px" h="32px" bg="gray.200" />

            {/* Premium Interactive Stepper */}
            <HStack spacing={12}>
              {steps.map((s, idx) => {
                const isActive = currentMainIdx === idx;
                const isCompleted = currentMainIdx > idx;
                const isClickable = isCompleted || isActive;

                return (
                  <HStack
                    key={s.id}
                    spacing={3}
                    opacity={isActive || isCompleted ? 1 : 0.3}
                    cursor={isClickable ? "pointer" : "default"}
                    onClick={() => handleStepClick(idx)}
                    position="relative"
                    role="group"
                  >
                    <VStack align="start" spacing={0}>
                      <Text
                        fontSize="10px"
                        fontWeight="900"
                        color={isActive ? "blue.500" : "gray.400"}
                        letterSpacing="0.1em"
                      >
                        PHASE 0{idx + 1}
                      </Text>
                      <Text
                        fontSize="13px"
                        fontWeight="900"
                        color={isActive ? "gray.800" : "gray.500"}
                        letterSpacing="0.05em"
                        textTransform="uppercase"
                      >
                        {s.title}
                      </Text>
                    </VStack>

                    {isActive && (
                      <Box
                        position="absolute"
                        bottom="-18px"
                        left="0"
                        right="0"
                        h="2px"
                        bg="blue.500"
                        borderRadius="full"
                        boxShadow="0 2px 10px rgba(49, 130, 206, 0.4)"
                      />
                    )}
                  </HStack>
                )
              })}
            </HStack>
          </HStack>

          {/* Action Suite */}
          <HStack spacing={4}>
            {step !== "SELECTION_MODE" && (
              <Button
                variant="ghost"
                leftIcon={<FiChevronLeft />}
                onClick={handleBack}
                size="sm"
                fontWeight="900"
                fontSize="10px"
                color="gray.400"
                _hover={{ color: "gray.800", bg: "gray.50" }}
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Go Back
              </Button>
            )}

            {step === "TOOTH_SELECTION" && (
              <Button
                colorScheme="blue"
                rightIcon={<FiChevronRight />}
                isDisabled={selectedTeeth.length === 0}
                onClick={handleNext}
                h="50px"
                px={10}
                borderRadius="full"
                fontSize="12px"
                fontWeight="900"
                textTransform="uppercase"
                letterSpacing="widest"
                boxShadow="xl"
                _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
                _active={{ transform: "translateY(0)" }}
              >
                Next Phase
              </Button>
            )}

            <IconButton
              aria-label="Terminate"
              icon={<FiX />}
              variant="ghost"
              borderRadius="full"
              size="sm"
              onClick={closeWizard}
              color="gray.400"
              _hover={{ color: "red.500", bg: "red.50" }}
            />
          </HStack>
        </Flex>
        <Progress
          value={progressPercent}
          size="xs"
          colorScheme="blue"
          bg="transparent"
          h="1px"
          transition="all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        />
      </Flex>

      {/* Main Content Area - Fixed Height */}
      <Box 
        h="calc(100vh - 75px)" 
        p={6} 
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' },
        }}
      >
        {renderStep()}
      </Box>
    </Box>
  );
});

export default Index;

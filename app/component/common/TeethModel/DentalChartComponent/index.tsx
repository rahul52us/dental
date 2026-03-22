'use client';

import { useState, useEffect, useRef, useMemo } from "react";
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
  Circle,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  IconButton,
} from "@chakra-ui/react";
import {
  FiCheck,
  FiMousePointer,
  FiFileText,
  FiActivity,
  FiChevronRight,
  FiChevronLeft,
  FiX,
  FiSave,
  FiEdit3
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
import stores from "../../../../store/stores";
import { TREATMENT_CATEGORIES } from "../../../../dashboard/toothTreatment/treatmentDataConstant";

type WizardStep =
  | "TOOTH_SELECTION"
  | "PROCEDURE_FORM";

const Index = observer(({ isPatient, patientDetails, closeWizard }: any) => {
  const [step, setStep] = useState<WizardStep>("TOOTH_SELECTION");
  const [dentitionType, setDentitionType] = useState<DentitionType>("adult");
  const formRef = useRef<any>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<ToothData[]>([]);
  const [toothComplaints, setToothComplaints] = useState<Record<string, string>>({});
  const [notation, setNotation] = useState<"fdi" | "universal" | "palmer">("fdi");
  const [generalDescription, setGeneralDescription] = useState("");
  const [isToothFormOpen, setIsToothFormOpen] = useState(false);
  const [activeTeethForForm, setActiveTeethForForm] = useState<ToothData[]>([]);
  const [complaintType, setComplaintType] = useState<string>("Chief Complaint");
  const [teethNotes, setTeethNotes] = useState<string>("");

  // Hoisted State for Phase 4 & Explorer
  const [procedureFormValues, setProcedureFormValues] = useState<any>(null);
  const [explorerState, setExplorerState] = useState({ catIdx: 0, subIdx: 0 });

  // Individual Tooth Notes
  const [individualTeethNotes, setIndividualTeethNotes] = useState<Record<string, string>>({});
  const [editingTooth, setEditingTooth] = useState<ToothData | null>(null);
  const [currentNoteDraft, setCurrentNoteDraft] = useState("");
  const { isOpen: isNoteModalOpen, onOpen: onOpenNoteModal, onClose: onCloseNoteModal } = useDisclosure();
  const { isOpen: isGeneralNoteModalOpen, onOpen: onOpenGeneralNoteModal, onClose: onCloseGeneralNoteModal } = useDisclosure();
  const [generalNoteDraft, setGeneralNoteDraft] = useState("");

  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const {
    userStore: { getUsersList },
    toothTreatmentStore: { getToothTreatments, toothTreatment },
  } = stores;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const res: any = await getUsersList({ type: 'doctor', limit: 100 });
        if (res?.data?.data?.data) {
          setDoctors(res.data.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, [getUsersList]);

  useEffect(() => {
    const fetchSavedTreatments = async () => {
      if (!patientDetails?._id) return;
      try {
        await getToothTreatments({ patientId: patientDetails._id, page: 1, search: "" });
      } catch (err) {
        console.error("Failed to fetch saved treatments", err);
      }
    };
    fetchSavedTreatments();
  }, [patientDetails?._id, getToothTreatments]);

  const doctorOptions = useMemo(() => {
    return doctors.map((d) => ({
      label: d.name,
      value: d._id,
    }));
  }, [doctors]);

  const handleEditToothNote = (tooth: ToothData) => {
    setEditingTooth(tooth);
    setCurrentNoteDraft(individualTeethNotes[tooth.id] || "");
    onOpenNoteModal();
  };

  const saveToothNote = () => {
    if (editingTooth) {
      setIndividualTeethNotes(prev => ({
        ...prev,
        [editingTooth.id]: currentNoteDraft
      }));
    }
    onCloseNoteModal();
  };

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
        doctor: edit.doctor ? (typeof edit.doctor === 'object' ? { label: edit.doctor.name, value: edit.doctor._id } : { label: 'Selected Doctor', value: edit.doctor }) : undefined,
        treatmentDate: edit.treatmentDate?.split("T")[0] || new Date().toISOString().split("T")[0],
        notes: edit.notes || "",
        treatmentCode: edit.treatmentPlan || "",
        estimateMin: edit.estimateMin || 0,
        estimateMax: edit.estimateMax || 0,
        discount: edit.discount || 0,
        totalMin: edit.totalMin || 0,
        totalMax: edit.totalMax || 0,
        patient: edit.patient ? (typeof edit.patient === 'object' ? { label: edit.patient.name, value: edit.patient._id } : { label: patientDetails?.name, value: edit.patient }) : { label: patientDetails?.name, value: patientDetails?._id },
        status: edit.status || "Planned",
        treatmentId: edit._id,
      });

      // Reconstruct complaint type
      if (edit.complaintType) {
        setComplaintType(edit.complaintType);
      }

      // Reconstruct individual tooth notes
      if (edit.toothNote && edit.tooth?.fdi) {
        setIndividualTeethNotes(prev => ({
          ...prev,
          [edit.tooth.fdi]: edit.toothNote
        }));
      }

      // Reconstruct explorer state and normalize treatmentCode if treatmentPlan exists
      if (edit.treatmentPlan) {
        const parts = edit.treatmentPlan.split(/→|->/).map((p: string) => p.trim());
        if (parts.length >= 2) {
          const catIdx = TREATMENT_CATEGORIES.findIndex(c => c.name.toLowerCase() === parts[0].toLowerCase());
          if (catIdx !== -1) {
            const foundCat = TREATMENT_CATEGORIES[catIdx];
            const subIdx = foundCat.subcategories.findIndex(s => s.name.toLowerCase() === parts[1].toLowerCase());
            if (subIdx !== -1) {
              const foundSub = foundCat.subcategories[subIdx];
              setExplorerState({ catIdx, subIdx });

              if (parts[2]) {
                const foundJob = foundSub.jobs.find(j => j.name.toLowerCase() === parts[2].toLowerCase());
                if (foundJob) {
                  const normalizedCode = `${foundCat.name} → ${foundSub.name} → ${foundJob.name}`;
                  setProcedureFormValues(prev => ({ ...prev, treatmentCode: normalizedCode }));
                }
              }
            }
          }
        }
      }

      // Navigate to the form if editing
      setStep("PROCEDURE_FORM");
    }
  }, [patientDetails?.editData, dentitionType]);

  // Get dynamic steps based on selection
  const isTeethFlow = step === "TOOTH_SELECTION" || (step === "PROCEDURE_FORM" && selectedTeeth.length > 0);

  const steps = [
    { id: "TOOTH_SELECTION", title: "SELECTION", icon: FiMousePointer },
    { id: "PROCEDURE_FORM", title: "PROCEDURE", icon: FiFileText },
  ];

  const currentMainIdx = steps.findIndex(s => s.id === step);
  const progressPercent = ((currentMainIdx + 1) / steps.length) * 100;

  const handleStepClick = (idx: number) => {
    if (idx < currentMainIdx) {
      setStep(steps[idx].id as WizardStep);
      setProcedureFormValues((prev: any) => prev ? {
        ...prev,
        treatmentCode: "",
        estimateMin: 0,
        estimateMax: 0,
        totalMin: 0,
        totalMax: 0,
        discount: 0,
        notes: ""
      } : prev);
    }
  };

  const handleNext = () => {
    if (step === "TOOTH_SELECTION") {
      setStep("PROCEDURE_FORM");
    }
  };

  const handleBack = () => {
    if (step === "PROCEDURE_FORM") {
      setStep("TOOTH_SELECTION");
      setProcedureFormValues((prev: any) => prev ? {
        ...prev,
        treatmentCode: "",
        estimateMin: 0,
        estimateMax: 0,
        totalMin: 0,
        totalMax: 0,
        discount: 0,
        notes: ""
      } : prev);
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

    setToothComplaints((prev) => {
      const isSelected = selectedTeeth.some((t) => t.id === tooth.id);
      if (isSelected) {
        const { [tooth.id]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [tooth.id]: complaintType };
      }
    });
    setProcedureFormValues((prev: any) => prev ? {
      ...prev,
      treatmentCode: "",
      estimateMin: 0,
      estimateMax: 0,
      totalMin: 0,
      totalMax: 0,
      discount: 0,
      notes: ""
    } : prev);
  };

  const renderStep = () => {
    switch (step) {
      case "TOOTH_SELECTION":
        return (
          <VStack spacing={4} align="stretch" h="full">
            {/* Contextual Header - Compact Clinical */}
            <Flex
              justify="space-between"
              align="center"
              bg="white"
              px={5}
              py={2}
              borderRadius="3xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
            >
              <HStack spacing={8}>
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Circle size="5px" bg="blue.500" />
                    <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">DENTITION</Text>
                  </HStack>
                  <DentitionToggle value={dentitionType} onChange={setDentitionType} />
                </VStack>

                <Box w="1px" h="24px" bg="gray.100" />

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
                        h="24px"
                        px={3}
                        borderRadius="lg"
                        textTransform="uppercase"
                      >
                        {n.label}
                      </Button>
                    ))}
                  </HStack>
                </VStack>

                <Box w="1px" h="24px" bg="gray.100" />

                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Circle size="5px" bg="blue.500" />
                    <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">COMPLAINT TYPE</Text>
                  </HStack>
                  <HStack bg="gray.50" p={1} borderRadius="xl" border="1px solid" borderColor="gray.100">
                    {["Chief Complaint", "Other Finding", "Existing Finding"].map((type) => {
                      const isActive = complaintType === type;
                      const getStyles = () => {
                        switch(type) {
                          case "Chief Complaint": return { bg: "red.500", color: "white", hover: "red.600" };
                          case "Other Finding": return { bg: "yellow.400", color: "gray.800", hover: "yellow.500" };
                          case "Existing Finding": return { bg: "gray.300", color: "gray.800", hover: "gray.400" };
                          default: return { bg: "transparent", color: "gray.600", hover: "gray.100" };
                        }
                      };
                      const styles = isActive ? getStyles() : { bg: "transparent", color: "gray.500", hover: "gray.100" };
                      return (
                        <Button
                          key={type}
                          size="xs"
                          onClick={() => setComplaintType(type)}
                          bg={styles.bg}
                          color={styles.color}
                          _hover={{ bg: styles.hover }}
                          _active={{ bg: styles.bg }}
                          fontSize="11px"
                          fontWeight="900"
                          h="24px"
                          px={3}
                          borderRadius="lg"
                          textTransform="uppercase"
                        >
                          {type.split(' ')[0]}
                        </Button>
                      );
                    })}
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
            <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={4} flex={1} overflow="hidden">
              <Box
                bg="white"
                borderRadius="3xl"
                border="1px solid"
                borderColor="gray.100"
                p={4}
                position="relative"
                overflow="hidden"
                h="full"
              >
                <TeethChart
                  dentitionType={dentitionType}
                  selectedTeeth={selectedTeeth}
                  onToothClick={handleToothClick}
                  notationType={notation}
                  onNotationChange={setNotation}
                  toothComplaints={toothComplaints}
                />
              </Box>

              <VStack
                spacing={4}
                align="stretch"
                p={6}
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                rounded="3xl"
                h="full"
                boxShadow="xs"
                overflow="hidden"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em">CLINICAL HISTORY</Text>
                    <Heading size="xs" fontWeight="900" color="gray.800" letterSpacing="tight">Saved Treatments</Heading>
                  </VStack>
                  <Circle size="28px" bg="blue.500" color="white" fontSize="11px" fontWeight="900">
                    {toothTreatment.data?.length || 0}
                  </Circle>
                </HStack>

                <Box
                  flex={1}
                  overflowY="auto"
                  minH={0}
                  pr={2}
                  sx={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' },
                  }}
                >
                  <VStack align="stretch" spacing={4} pb={4}>

                    <VStack align="start" spacing={3} p={4} bg="blue.50/30" borderRadius="2xl" border="1px dashed" borderColor="blue.100">
                      <HStack justify="space-between" w="full">
                        <HStack spacing={2}>
                          <Icon as={FiFileText} color="blue.500" />
                          <Text fontSize="11px" fontWeight="900" color="blue.600" letterSpacing="0.2em">CLINICAL FINDINGS</Text>
                        </HStack>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => {
                            setGeneralNoteDraft(teethNotes);
                            onOpenGeneralNoteModal();
                          }}
                          leftIcon={<FiEdit3 />}
                          fontSize="10px"
                          fontWeight="900"
                        >
                          EDIT NOTES
                        </Button>
                      </HStack>
                      <Box w="full" px={1}>
                        <Text fontSize="12px" color={teethNotes ? "gray.700" : "gray.400"} fontStyle={teethNotes ? "normal" : "italic"} noOfLines={3}>
                          {teethNotes || "No general clinical findings recorded yet..."}
                        </Text>
                      </Box>
                    </VStack>

                    <Divider borderColor="gray.100" />

                    {toothTreatment.loading ? (
                      <VStack py={12} spacing={3} opacity={0.5}>
                        <Progress size="xs" isIndeterminate w="full" colorScheme="blue" />
                        <Text fontSize="xs" color="gray.500">Retrieving clinical records...</Text>
                      </VStack>
                    ) : toothTreatment.data?.length > 0 ? (
                      toothTreatment.data.map((item: any) => (
                        <Box
                          key={item._id}
                          p={4}
                          bg="gray.50"
                          borderRadius="2xl"
                          border="1px solid"
                          borderColor="gray.100"
                          _hover={{ bg: "white", boxShadow: "sm", borderColor: "blue.50" }}
                          transition="all 0.2s"
                        >
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Badge colorScheme={item.status === "completed" ? "green" : "blue"} variant="subtle" borderRadius="full" px={2}>
                                {item.status?.toUpperCase()}
                              </Badge>
                              <Text fontSize="10px" color="gray.400" fontWeight="700">
                                {item.treatmentDate ? new Date(item.treatmentDate).toLocaleDateString() : "No Date"}
                              </Text>
                            </HStack>
                            <VStack align="start" spacing={0.5}>
                              <Text fontSize="xs" fontWeight="900" color="gray.800" noOfLines={1}>
                                {item.treatmentPlan?.split("→").pop()?.trim() || "Item"}
                              </Text>
                              <Text fontSize="10px" color="blue.500" fontWeight="700">
                                TOOTH: FDI {item.tooth?.fdi || "--"}
                              </Text>
                            </VStack>
                            {item.notes && (
                              <Box p={2} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.50">
                                <Text fontSize="11px" color="gray.600" noOfLines={2}>
                                  {item.notes}
                                </Text>
                              </Box>
                            )}
                            {(item.estimateMin > 0 || item.estimateMax > 0) && (
                              <HStack justify="space-between" pt={1}>
                                <Text fontSize="10px" fontWeight="800" color="gray.400">ESTIMATE:</Text>
                                <Text fontSize="11px" fontWeight="900" color="gray.700">
                                  ₹{item.estimateMin?.toLocaleString()} - ₹{item.estimateMax?.toLocaleString()}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      ))
                    ) : (
                      <VStack textAlign="center" py={12} spacing={4} opacity={0.3}>
                        <Circle size="54px" bg="gray.50" border="1px solid" borderColor="gray.100">
                          <Icon as={FiActivity} fontSize="lg" color="gray.300" />
                        </Circle>
                        <VStack spacing={1}>
                          <Text fontSize="9px" color="gray.400" fontWeight="900" letterSpacing="0.2em" textTransform="uppercase">
                            No History
                          </Text>
                          <Text fontSize="xs" color="gray.400" fontWeight="500">No previous records found</Text>
                        </VStack>
                      </VStack>
                    )}
                  </VStack>
                </Box>

                <VStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    rightIcon={<FiChevronRight />}
                    isDisabled={selectedTeeth.length === 0 && !teethNotes.trim()}
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

      case "PROCEDURE_FORM":
        return (
          <TreatmentProcedureForm
            isPatient={isPatient}
            patientDetails={patientDetails}
            teeth={selectedTeeth}
            generalDescription={generalDescription || teethNotes}
            complaintType={complaintType}
            onSuccess={() => {
              patientDetails?.applyGetAllRecords?.({});
              setStep("TOOTH_SELECTION");
              setSelectedTeeth([]);
              setIndividualTeethNotes({});
              setProcedureFormValues((prev: any) => prev ? {
                ...prev,
                treatmentCode: "",
                estimateMin: 0,
                estimateMax: 0,
                totalMin: 0,
                totalMax: 0,
                discount: 0,
                notes: ""
              } : prev);
            }}
            onBack={handleBack}
            // Hoisted State Props
            hoistedValues={procedureFormValues}
            onValuesUpdate={setProcedureFormValues}
            explorerState={explorerState}
            onExplorerUpdate={setExplorerState}
            editData={patientDetails?.editData}
            individualTeethNotes={individualTeethNotes}
            onEditToothNote={handleEditToothNote}
            onEditGeneralNote={() => {
              setGeneralNoteDraft(teethNotes);
              onOpenGeneralNoteModal();
            }}
            formRef={formRef}
            doctorOptions={doctorOptions}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box h="100vh" bg="white" overflow="hidden">
      {/* General Clinical Note Modal */}
      <Modal isOpen={isGeneralNoteModalOpen} onClose={onCloseGeneralNoteModal} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
        <ModalContent borderRadius="3xl" p={4} boxShadow="2xl">
          <ModalHeader>
            <HStack spacing={4}>
              <Circle size="40px" bg="blue.600" color="white">
                <Icon as={FiEdit3} />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="900" color="blue.500" letterSpacing="widest">SESSION NOTES</Text>
                <Heading size="md" fontWeight="900">General Clinical Findings</Heading>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton borderRadius="full" m={4} />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.500" fontWeight="600">
                Record overall observations, patient history, or clinical session overview.
              </Text>
              <Textarea
                placeholder="Start typing session-wide findings..."
                value={generalNoteDraft}
                onChange={(e) => setGeneralNoteDraft(e.target.value)}
                minH="250px"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                bg="gray.50"
                p={6}
                fontSize="md"
                fontWeight="600"
                _focus={{ borderColor: "blue.300", bg: "white", boxShadow: "0 0 0 1px #EBF8FF" }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onCloseGeneralNoteModal} borderRadius="xl" fontWeight="900" fontSize="xs" textTransform="uppercase">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="xl"
              px={8}
              fontWeight="900"
              fontSize="xs"
              textTransform="uppercase"
              onClick={() => {
                setTeethNotes(generalNoteDraft);
                onCloseGeneralNoteModal();
              }}
            >
              Update Findings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Note Edit Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={onCloseNoteModal} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
        <ModalContent borderRadius="3xl" p={4} boxShadow="2xl">
          <ModalHeader>
            <HStack spacing={4}>
              <Circle size="40px" bg="blue.500" color="white">
                <Icon as={FiFileText} />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="900" color="blue.500" letterSpacing="widest">CLINICAL NOTE</Text>
                <Heading size="md" fontWeight="900">Tooth {editingTooth?.id} - {editingTooth?.name}</Heading>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton borderRadius="full" m={4} />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.500" fontWeight="600">
                Enter specific findings, observations or requirements for this tooth.
              </Text>
              <Textarea
                placeholder="Type your notes here..."
                value={currentNoteDraft}
                onChange={(e) => setCurrentNoteDraft(e.target.value)}
                minH="200px"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                bg="gray.50"
                p={6}
                fontSize="md"
                fontWeight="600"
                _focus={{ borderColor: "blue.300", bg: "white", boxShadow: "0 0 0 1px #EBF8FF" }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onCloseNoteModal} borderRadius="xl" fontWeight="900" fontSize="xs" textTransform="uppercase">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="xl"
              px={8}
              fontWeight="900"
              fontSize="xs"
              textTransform="uppercase"
              onClick={saveToothNote}
            >
              Save Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Premium Glassmorphism Header */}
      <Flex direction="column" w="full" position="relative" zIndex={10}>
        <Flex
          justify="space-between"
          align="center"
          px={8}
          py={2}
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

            <Box w="1px" h="24px" bg="gray.200" />

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

          {/* Unified Action Header */}
          <Flex justify="space-between" align="center" w="full">
            <HStack spacing={2} align="center">
              <Badge colorScheme={patientDetails?.editData ? "orange" : "blue"} variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                {patientDetails?.editData ? "EDITING RECORD" : `PHASE ${currentMainIdx + 1}`}
              </Badge>
              <Divider orientation="vertical" h="12px" borderColor="gray.300" />
              <Text fontSize="xs" fontWeight="800" color="gray.400" letterSpacing="wider">
                DIAG-TRT-{new Date().getFullYear()}
              </Text>
            </HStack>

            <HStack spacing={3}>
              {step === "PROCEDURE_FORM" && (
                <Button
                  variant="ghost"
                  leftIcon={<FiChevronLeft />}
                  onClick={handleBack}
                  size="sm"
                  fontWeight="900"
                  fontSize="11px"
                  color="gray.500"
                  _hover={{ color: "blue.500", bg: "blue.50" }}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Go Back
                </Button>
              )}

              {step === "PROCEDURE_FORM" && (
                <Button
                  colorScheme="blue"
                  size="sm"
                  h="32px"
                  borderRadius="lg"
                  fontSize="11px"
                  fontWeight="900"
                  leftIcon={<FiSave />}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  px={4}
                  onClick={() => formRef.current?.submitForm()}
                >
                  Save Record
                </Button>
              )}

              {step === "TOOTH_SELECTION" && (
                <Button
                  colorScheme="blue"
                  rightIcon={<FiChevronRight />}
                  isDisabled={selectedTeeth.length === 0 && !teethNotes.trim()}
                  onClick={handleNext}
                  h="32px"
                  borderRadius="lg"
                  fontSize="11px"
                  fontWeight="900"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  px={6}
                >
                  Next Phase
                </Button>
              )}

              <IconButton
                aria-label="Close"
                icon={<FiX />}
                variant="ghost"
                size="sm"
                onClick={closeWizard}
                borderRadius="full"
                _hover={{ bg: 'red.50', color: 'red.500' }}
              />
            </HStack>
          </Flex>
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
        h="calc(100vh - 110px)"
        px={6}
        pb={6}
        pt={2}
        overflow="hidden"
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

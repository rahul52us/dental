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
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
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
  FiEdit3,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

import { DentitionToggle } from "./component/DentitionToggle";
import { TeethChart } from "./component/TeethChart";
import { ToothInfoCard } from "./component/ToothInfoCard";
import { DentitionType, ToothData, adultTeeth, childTeeth, getTeethByType } from "./utils/teethData";
import { observer } from "mobx-react-lite";

import { DescriptionEntry } from "./component/DescriptionEntry";
import { ComplaintSelectionMode } from "./component/ComplaintSelectionMode";
import { TreatmentProcedureForm } from "./component/TreatmentProcedureForm";
import { ToothFormDialog } from "./component/ToothFormDialog";
import { NotationChoice } from "./component/NotationChoice";
import { SavedTreatmentListItem } from "./component/SavedTreatmentListItem";
import { ProcedureTemplateList } from "./component/ProcedureTemplateList";
import CustomDrawer from "../../Drawer/CustomDrawer";
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
  const [editingTreatment, setEditingTreatment] = useState<any | null>(null);
  const [notation, setNotation] = useState<"fdi" | "universal" | "palmer">("fdi");
  const [generalDescription, setGeneralDescription] = useState("");
  const [isToothFormOpen, setIsToothFormOpen] = useState(false);
  const [activeTeethForForm, setActiveTeethForForm] = useState<ToothData[]>([]);
  const [complaintType, setComplaintType] = useState<string>("CHIEF COMPLAINT");
  const [teethNotes, setTeethNotes] = useState<string>("");

  const [procedureFormValues, setProcedureFormValues] = useState<any>(null);
  const [explorerState, setExplorerState] = useState({ catIdx: 0, subIdx: 0 });

  const [individualTeethNotes, setIndividualTeethNotes] = useState<Record<string, string>>({});
  const [editingTooth, setEditingTooth] = useState<ToothData | null>(null);
  const [currentNoteDraft, setCurrentNoteDraft] = useState("");
  const { isOpen: isNoteModalOpen, onOpen: onOpenNoteModal, onClose: onCloseNoteModal } = useDisclosure();
  const { isOpen: isGeneralNoteModalOpen, onOpen: onOpenGeneralNoteModal, onClose: onCloseGeneralNoteModal } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingConfirmLoading, setIsDeletingConfirmLoading] = useState(false);
  const [generalNoteDraft, setGeneralNoteDraft] = useState("");

  const [historySearch, setHistorySearch] = useState("");
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState("all");
  const [historyDateSort, setHistoryDateSort] = useState("desc");
  const [historyPage, setHistoryPage] = useState(1);

  const COMPLAINT_STYLES: Record<string, { border: string, bg: string, label: string, iconColor: string }> = {
    "CHIEF COMPLAINT": { border: "red.500", bg: "red.50", label: "CHIEF COMPLAINT", iconColor: "red.500" },
    "OTHER FINDING": { border: "orange.400", bg: "orange.50", label: "OTHER FINDING", iconColor: "orange.400" },
    "EXISTING FINDING": { border: "gray.400", bg: "gray.50", label: "EXISTING", iconColor: "gray.400" },
    "default": { border: "blue.500", bg: "blue.50", label: "CLINICAL OBSERVATION", iconColor: "blue.500" }
  };

  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [isMultipleSelection, setIsMultipleSelection] = useState(false);
  const { isOpen: isEditDrawerOpen, onOpen: onEditDrawerOpen, onClose: onEditDrawerClose } = useDisclosure();
  const { isOpen: isHistoryDrawerOpen, onOpen: onHistoryDrawerOpen, onClose: onHistoryDrawerClose } = useDisclosure();
  const { isOpen: isProcedureDrawerOpen, onOpen: onProcedureDrawerOpen, onClose: onProcedureDrawerClose } = useDisclosure();
  const {
    userStore: { getUsersList },
    toothTreatmentStore: { getToothTreatments, toothTreatment, deleteToothTreatment, updateToothTreatment },
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

  useEffect(() => {
    if (patientDetails?.editData) {
      const edit = patientDetails.editData;
      const allTeeth = getTeethByType(dentitionType);
      const matchedTooth = allTeeth.find(t => t.id === edit.tooth?.fdi);
      if (matchedTooth) setSelectedTeeth([matchedTooth]);

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
        complaintType: edit.complaintType?.toUpperCase() || "CHIEF COMPLAINT",
      });

      if (edit.complaintType) setComplaintType(edit.complaintType.toUpperCase());
      if (edit.toothNote && edit.tooth?.fdi) {
        setIndividualTeethNotes(prev => ({ ...prev, [edit.tooth.fdi]: edit.toothNote }));
      }

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
      setStep("PROCEDURE_FORM");
    }
  }, [patientDetails?.editData, dentitionType]);

  const steps = [
    { id: "TOOTH_SELECTION", title: "SELECTION", icon: FiMousePointer },
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
    if (step === "TOOTH_SELECTION") setStep("PROCEDURE_FORM");
  };

  const handleBack = () => {
    if (step === "PROCEDURE_FORM") setStep("TOOTH_SELECTION");
  };

  const handleToothClick = (tooth: ToothData) => {
    if (isMultipleSelection) {
      setSelectedTeeth((prev) => {
        const isSelected = prev.some((t) => t.id === tooth.id);
        return isSelected ? prev.filter((t) => t.id !== tooth.id) : [...prev, tooth];
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
    } else {
      setSelectedTeeth([tooth]);
      setToothComplaints({ [tooth.id]: complaintType });
    }
  };

  const handleDeleteTreatment = (id: string) => {
    setDeletingId(id);
    onOpenDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeletingConfirmLoading(true);
      await deleteToothTreatment(deletingId);
      if (patientDetails?._id) await getToothTreatments({ patientId: patientDetails._id, page: 1, search: "" });
      onCloseDeleteModal();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeletingConfirmLoading(false);
    }
  };

  const handleMarkAsComplete = async (id: string) => {
    try {
      await updateToothTreatment({ treatmentId: id, status: "completed" });
      if (patientDetails?._id) await getToothTreatments({ patientId: patientDetails._id, page: 1, search: "", category: historyCategoryFilter });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSelectTemplate = (path: string) => {
    setProcedureFormValues((prev: any) => ({ ...prev, treatmentCode: path }));
    onProcedureDrawerClose();
    setStep("PROCEDURE_FORM");
  };

  const handleEditTreatment = (item: any) => {
    setEditingTreatment(item);
    setProcedureFormValues({
      doctor: item.doctor?._id ? { label: item.doctor.name, value: item.doctor._id } : item.doctor,
      notes: item.notes || "",
      treatmentCode: item.treatmentPlan || "",
      estimateMin: item.estimateMin || 0,
      estimateMax: item.estimateMax || 0,
      totalMin: item.totalMin || 0,
      totalMax: item.totalMax || 0,
      discount: item.discount || 0,
      status: item.status === "pending" ? "Planned" : item.status === "completed" ? "Completed" : item.status,
      complaintType: item.complaintType || "Chief Complaint",
    });
    onEditDrawerOpen();
  };

  useEffect(() => {
    if (isHistoryDrawerOpen && patientDetails) {
      getToothTreatments({
        patientId: patientDetails._id || patientDetails.id,
        page: historyPage,
        search: historySearch,
        category: historyCategoryFilter,
      });
    }
  }, [isHistoryDrawerOpen, historyPage, historySearch, historyCategoryFilter, patientDetails?._id]);

  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyCategoryFilter]);

  const renderStep = () => {
    switch (step) {
      case "TOOTH_SELECTION":
        return (
          <VStack spacing={4} align="stretch" h="full">
            <Flex justify="space-between" align="center" bg="white" px={5} py={2} borderRadius="3xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
              <HStack spacing={8}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">DENTITION</Text>
                  <DentitionToggle value={dentitionType} onChange={setDentitionType} />
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">NOTATION</Text>
                  <HStack bg="gray.50" p={1} borderRadius="xl">
                    {["fdi", "universal", "palmer"].map(n => (
                      <Button key={n} size="xs" variant={notation === n ? "solid" : "ghost"} colorScheme={notation === n ? "blue" : "gray"} onClick={() => setNotation(n as any)}>{n.toUpperCase()}</Button>
                    ))}
                  </HStack>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">COMPLAINT</Text>
                  <HStack bg="gray.50" p={1} borderRadius="xl">
                    {["CHIEF COMPLAINT", "OTHER FINDING", "EXISTING FINDING"].map(type => (
                      <Button key={type} size="xs" colorScheme={complaintType === type ? "blue" : "gray"} variant={complaintType === type ? "solid" : "ghost"} onClick={() => setComplaintType(type)}>{type.split(' ')[0]}</Button>
                    ))}
                  </HStack>
                </VStack>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="11px" fontWeight="900" color="gray.300">SELECTED</Text>
                <Text fontWeight="900" color="blue.500" fontSize="3xl">{selectedTeeth.length}</Text>
              </VStack>
            </Flex>

            <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={4} flex={1} overflow="hidden">
              <Box bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" p={4} overflow="hidden" h="full">
                <TeethChart dentitionType={dentitionType} selectedTeeth={selectedTeeth} onToothClick={handleToothClick} notationType={notation} toothComplaints={toothComplaints} />
              </Box>
              <VStack spacing={4} align="stretch" p={6} bg="white" border="1px solid" borderColor="gray.100" rounded="3xl" h="full" boxShadow="xs" overflow="hidden">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="11px" fontWeight="900" color="blue.500">CLINICAL HISTORY</Text>
                    <Heading size="xs" fontWeight="900">Saved Records</Heading>
                  </VStack>
                  <HStack spacing={2}>
                    <Circle size="28px" bg="blue.50" color="blue.500" fontWeight="900">{toothTreatment.totalItems || 0}</Circle>
                    <IconButton aria-label="Add" icon={<FiPlus />} size="sm" colorScheme="blue" borderRadius="full" onClick={onProcedureDrawerOpen} />
                  </HStack>
                </HStack>
                <Box flex={1} overflowY="auto" pr={2}>
                  <VStack align="stretch" spacing={4}>
                    <VStack align="start" spacing={2} p={4} bg="blue.50/30" borderRadius="2xl" border="1px dashed" borderColor="blue.100">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="10px" fontWeight="900" color="blue.600">SESSION NOTES</Text>
                        <IconButton aria-label="Edit" icon={<FiEdit3 />} size="xs" variant="ghost" onClick={() => { setGeneralNoteDraft(teethNotes); onOpenGeneralNoteModal(); }} />
                      </HStack>
                      <Text fontSize="12px" color={teethNotes ? "gray.700" : "gray.400"}>{teethNotes || "No notes recorded..."}</Text>
                    </VStack>
                    <Box p={5} bg="blue.50/30" borderRadius="2xl" border="1px solid" borderColor="blue.100" cursor="pointer" onClick={onHistoryDrawerOpen} _hover={{ transform: "translateY(-2px)" }}>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}><Text fontSize="10px" fontWeight="1000">PATIENT RECORDS</Text><Heading size="xs">View History</Heading></VStack>
                        <Text fontSize="24px" fontWeight="1000" color="blue.600">{toothTreatment.totalItems || 0}</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
                <Button colorScheme="blue" rightIcon={<FiChevronRight />} isDisabled={selectedTeeth.length === 0 && !teethNotes.trim()} onClick={handleNext} w="full" h="54px" borderRadius="2xl" fontWeight="900" textTransform="uppercase">Initialize Record</Button>
              </VStack>
            </Grid>
          </VStack>
        );
      case "PROCEDURE_FORM":
        return (
          <TreatmentProcedureForm
            isPatient={isPatient} patientDetails={patientDetails} editData={editingTreatment || patientDetails?.editData} teeth={selectedTeeth}
            generalDescription={generalDescription || teethNotes} complaintType={complaintType} toothComplaints={toothComplaints}
            onSuccess={() => { patientDetails?.applyGetAllRecords?.({}); setStep("TOOTH_SELECTION"); setSelectedTeeth([]); setEditingTreatment(null); }}
            onBack={handleBack} onToothClick={handleToothClick} hoistedValues={procedureFormValues} onValuesUpdate={setProcedureFormValues}
            explorerState={explorerState} onExplorerUpdate={setExplorerState} individualTeethNotes={individualTeethNotes} onEditToothNote={handleEditToothNote}
            onEditGeneralNote={() => { setGeneralNoteDraft(teethNotes); onOpenGeneralNoteModal(); }} formRef={formRef} doctorOptions={doctorOptions}
          />
        );
    }
  };

  return (
    <Box h="100vh" bg="white" overflow="hidden">
      <Modal isOpen={isGeneralNoteModalOpen} onClose={onCloseGeneralNoteModal} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(10px)" /><ModalContent borderRadius="3xl" p={4}><ModalHeader><Heading size="md">General Notes</Heading></ModalHeader><ModalCloseButton /><ModalBody><Textarea value={generalNoteDraft} onChange={(e) => setGeneralNoteDraft(e.target.value)} minH="250px" borderRadius="2xl" /></ModalBody><ModalFooter><Button onClick={() => { setTeethNotes(generalNoteDraft); onCloseGeneralNoteModal(); }} colorScheme="blue">Update</Button></ModalFooter></ModalContent>
      </Modal>

      <CustomDrawer open={isProcedureDrawerOpen} close={onProcedureDrawerClose} title="Procedure Templates" width="60vw">
        <ProcedureTemplateList onSelect={handleSelectTemplate} />
      </CustomDrawer>

      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>Are you sure you want to permanently delete this clinical record?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseDeleteModal}>Cancel</Button>
            <Button colorScheme="red" isLoading={isDeletingConfirmLoading} onClick={handleConfirmDelete}>Delete Record</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex direction="column" w="full" position="relative" zIndex={10}>
        <Flex justify="space-between" align="center" px={8} py={2} bg="white" borderBottom="1px" borderColor="gray.100">
          <HStack spacing={8}><VStack align="start" spacing={0}><Text fontSize="11px" fontWeight="900" color="blue.500">DIAGNOSTIC SUITE</Text></VStack>
            <HStack spacing={8}>
              {steps.map((s, idx) => (
                <HStack key={idx} opacity={currentMainIdx === idx ? 1 : 0.4} onClick={() => handleStepClick(idx)} cursor="pointer">
                  <Text fontWeight="900" color={currentMainIdx === idx ? "blue.500" : "gray.500"}>{s.title}</Text>
                </HStack>
              ))}
            </HStack>
          </HStack>
          <IconButton aria-label="Close" icon={<FiX />} onClick={closeWizard} variant="ghost" />
        </Flex>
        <Progress value={progressPercent} size="xs" colorScheme="blue" h="1px" />
      </Flex>

      <Box h="calc(100vh - 80px)" px={6} pb={6} pt={2} overflow="hidden">{renderStep()}</Box>

      <CustomDrawer open={isEditDrawerOpen} close={onEditDrawerClose} title="Edit Clinical Entry" width="70vw">
        <TreatmentProcedureForm
          isPatient={isPatient} patientDetails={patientDetails} editData={editingTreatment} teeth={editingTreatment?.tooth?.fdi ? [([...adultTeeth, ...childTeeth].find(t => t.fdi === editingTreatment.tooth.fdi) || { id: editingTreatment.tooth.fdi, fdi: editingTreatment.tooth.fdi, name: `Tooth ${editingTreatment.tooth.fdi}`, universal: "", palmer: "", position: "upper", side: "right", type: "molar" }) as ToothData] : []}
          generalDescription={generalDescription} complaintType={complaintType} toothComplaints={toothComplaints}
          onSuccess={() => { onEditDrawerClose(); patientDetails?.applyGetAllRecords?.({}); if (patientDetails?._id) getToothTreatments({ patientId: patientDetails._id, page: 1, search: "" }); }}
          onBack={onEditDrawerClose} isDrawerMode={true} doctorOptions={doctorOptions}
        />
      </CustomDrawer>

      <CustomDrawer open={isHistoryDrawerOpen} close={onHistoryDrawerClose} title="Clinical History" width="85vw">
        <Box h="full" bg="white" p={6}>
          <VStack align="stretch" spacing={6} h="full">
            <HStack justify="space-between">
              <Heading size="md">Clinical Timeline</Heading>
              <Badge colorScheme="blue" borderRadius="lg" px={4} py={1.5}>{toothTreatment.totalItems || 0} ITEMS</Badge>
            </HStack>
            <HStack spacing={4} bg="gray.50" p={4} borderRadius="2xl">
              <Input placeholder="Search records..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} bg="white" size="sm" maxW="300px" />
              <Select value={historyCategoryFilter} onChange={(e) => setHistoryCategoryFilter(e.target.value)} bg="white" size="sm" maxW="200px">
                <option value="all">All Categories</option>
                {Object.keys(COMPLAINT_STYLES).filter(k => k !== 'default').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              <Select value={historyDateSort} onChange={(e) => setHistoryDateSort(e.target.value)} bg="white" size="sm" maxW="150px">
                <option value="desc">Newest First</option><option value="asc">Oldest First</option>
              </Select>
            </HStack>
            <Box flex={1} overflowY="auto" pt={2} className="clinical-history-scroll" sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { bg: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bg: 'gray.200', borderRadius: 'full' }
            }}>
              {toothTreatment.loading ? (
                <VStack py={20}><Progress size="xs" isIndeterminate w="200px" borderRadius="full" colorScheme="blue" /></VStack>
              ) : toothTreatment.totalItems > 0 ? (
                <VStack spacing={3} align="stretch" pb={4}>
                  {toothTreatment.data.map((item: any) => {
                    const style = COMPLAINT_STYLES[item.complaintType?.toUpperCase()] || COMPLAINT_STYLES.default;
                    const isCompleted = item.status?.toLowerCase() === "completed";

                    return (
                      <Box
                        key={item._id}
                        bg="white"
                        borderRadius="2xl"
                        borderLeft="4px solid"
                        borderLeftColor={style.border}
                        boxShadow="sm"
                        p={4}
                        transition="all 0.2s"
                        _hover={{ boxShadow: "md", transform: "translateX(4px)" }}
                        border="1px solid"
                        borderColor="gray.100"
                        position="relative"
                      >
                        <Flex justify="space-between" align="start">
                          <HStack spacing={4} align="start" flex={1}>
                            <VStack align="center" spacing={0} minW="70px" bg="gray.50" p={2} borderRadius="xl">
                              <Text fontSize="10px" fontWeight="900" color="gray.400">{new Date(item.treatmentDate).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</Text>
                              <Text fontSize="18px" fontWeight="1000" color="gray.700" lineHeight={1}>{new Date(item.treatmentDate).getDate()}</Text>
                              <Text fontSize="10px" fontWeight="900" color="gray.400">{new Date(item.treatmentDate).getFullYear()}</Text>
                            </VStack>
                            
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack spacing={2} wrap="wrap">
                                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} textTransform="none" fontSize="xs" fontWeight="800">
                                  Tooth {item.tooth?.fdi}
                                </Badge>
                                <Badge colorScheme={style.iconColor.split('.')[0]} variant="solid" borderRadius="full" px={3} fontSize="9px" fontWeight="900">
                                  {item.complaintType}
                                </Badge>
                                {isCompleted ? (
                                  <HStack spacing={1} bg="green.50" px={2} py={0.5} borderRadius="full" border="1px solid" borderColor="green.100">
                                    <Icon as={FiCheck} color="green.500" boxSize={3} />
                                    <Text fontSize="9px" fontWeight="900" color="green.600">COMPLETED</Text>
                                  </HStack>
                                ) : (
                                  <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="9px" fontWeight="900">
                                    PENDING
                                  </Badge>
                                )}
                              </HStack>
                              
                              <Text fontSize="md" fontWeight="800" color="gray.700" lineHeight="tight" mt={1}>
                                {item.treatmentPlan}
                              </Text>
                              
                              {item.notes && (
                                <Text fontSize="xs" color="gray.500" fontStyle="italic" noOfLines={2}>
                                  "{item.notes}"
                                </Text>
                              )}
                            </VStack>
                          </HStack>

                          <HStack spacing={1}>
                            {!isCompleted && (
                              <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                icon={<FiCheck />}
                                aria-label="Mark as Complete"
                                onClick={() => handleMarkAsComplete(item._id)}
                              />
                            )}
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              icon={<FiEdit3 />}
                              aria-label="Edit"
                              onClick={() => handleEditTreatment(item)}
                            />
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              icon={<FiTrash2 />}
                              aria-label="Delete"
                              onClick={() => handleDeleteTreatment(item._id)}
                            />
                          </HStack>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <VStack py={20} opacity={0.5} spacing={3}>
                  <Icon as={FiActivity} fontSize="40px" color="gray.300" />
                  <Text fontWeight="800" color="gray.400">No clinical records found</Text>
                  <Text fontSize="xs" color="gray.400">Try adjusting your filters or adding a new record</Text>
                </VStack>
              )}
            </Box>
            <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="xs">Page {historyPage} of {toothTreatment.totalPages || 1}</Text>
              <HStack><Button size="sm" onClick={() => setHistoryPage(p => Math.max(1, p - 1))} isDisabled={historyPage === 1}>Prev</Button>
              <Button size="sm" onClick={() => setHistoryPage(p => p + 1)} isDisabled={historyPage >= (toothTreatment.totalPages || 1)}>Next</Button></HStack>
            </HStack>
          </VStack>
        </Box>
      </CustomDrawer>
    </Box>
  );
});

export default Index;

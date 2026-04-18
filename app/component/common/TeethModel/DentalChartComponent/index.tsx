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
  Avatar,
} from "@chakra-ui/react";
import {
  FiMousePointer,
  FiFileText,
  FiActivity,
  FiChevronRight,
  FiX,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiEye,
  FiGrid,
  FiList,
  FiSearch,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";




import { DentitionToggle } from "./component/DentitionToggle";
import { TeethChart } from "./component/TeethChart";
import { DentitionType, ToothData, adultTeeth, childTeeth, getTeethByType } from "./utils/teethData";
import { observer } from "mobx-react-lite";
import { TreatmentProcedureForm } from "./component/TreatmentProcedureForm";
import { ToothFormDialog } from "./component/ToothFormDialog";
import { ProcedureTemplateList } from "./component/ProcedureTemplateList";
import CustomDrawer from "../../Drawer/CustomDrawer";
import { PatientHeader } from "./component/PatientHeader";
import stores from "../../../../store/stores";
import { TREATMENT_CATEGORIES } from "../../../../dashboard/toothTreatment/treatmentDataConstant";
import CustomInput from "../../../config/component/customInput/CustomInput";

const detectIsChild = (tooth: any) => {
  const toothId = typeof tooth === 'object' ? (tooth.fdi || tooth.id || tooth.tooth?.fdi || tooth.tooth?.id) : String(tooth || "");
  const tId = String(toothId);
  if (!tId || tId === "General") return false;
  return (
    (parseInt(tId) >= 51 && parseInt(tId) <= 85) || // FDI child range
    /[a-eA-E]/.test(tId) || // Palmer child range
    tId.toLowerCase().includes('d') // Universal child indicator
  );
};

type WizardStep = "TOOTH_SELECTION" | "PROCEDURE_FORM";

const Index = observer(({ isPatient, patientDetails, closeWizard }: any) => {
  const [step, setStep] = useState<WizardStep>("TOOTH_SELECTION");
  const [dentitionType, setDentitionType] = useState<DentitionType>("adult");
  const formRef = useRef<any>(null);
  const lastSyncedEditId = useRef<string | null>(null);
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
  const [explorerState, setExplorerState] = useState({ catIdx: null, subIdx: null });

  const [individualTeethNotes, setIndividualTeethNotes] = useState<Record<string, string>>({});
  const [editingTooth, setEditingTooth] = useState<ToothData | null>(null);
  const [currentNoteDraft, setCurrentNoteDraft] = useState("");
  const { isOpen: isNoteModalOpen, onOpen: onOpenNoteModal, onClose: onCloseNoteModal } = useDisclosure();
  const { isOpen: isGeneralNoteModalOpen, onOpen: onOpenGeneralNoteModal, onClose: onCloseGeneralNoteModal } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingConfirmLoading, setIsDeletingConfirmLoading] = useState(false);
  const [generalNoteDraft, setGeneralNoteDraft] = useState("");
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split("T")[0]);


  const [historySearch, setHistorySearch] = useState("");
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState("all");
  const [historyDateSort, setHistoryDateSort] = useState("desc");
  const [historyPage, setHistoryPage] = useState(1);
  const [treatedToothIds, setTreatedToothIds] = useState<string[]>([]);
  const [historyFilterTooth, setHistoryFilterTooth] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multi' | 'history'>('single');


  const COMPLAINT_STYLES: Record<string, { border: string, bg: string, label: string, iconColor: string }> = {
    "CHIEF COMPLAINT": { border: "red.500", bg: "red.50", label: "CHIEF COMPLAINT", iconColor: "red.500" },
    "OTHER FINDING": { border: "orange.400", bg: "orange.50", label: "OTHER FINDING", iconColor: "orange.400" },
    "EXISTING FINDING": { border: "green.500", bg: "green.50", label: "EXISTING", iconColor: "green.500" },
    "default": { border: "blue.500", bg: "blue.50", label: "CLINICAL OBSERVATION", iconColor: "blue.500" }
  };

  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [isMultipleSelection, setIsMultipleSelection] = useState(false);
  const [isTableView, setIsTableView] = useState(true);
  const { isOpen: isViewModalOpen, onOpen: onOpenViewModal, onClose: onCloseViewModal } = useDisclosure();
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const { isOpen: isEditDrawerOpen, onOpen: onEditDrawerOpen, onClose: onEditDrawerClose } = useDisclosure();
  const { isOpen: isHistoryDrawerOpen, onOpen: onHistoryDrawerOpen, onClose: onHistoryDrawerClose } = useDisclosure();
  const { isOpen: isProcedureDrawerOpen, onOpen: onProcedureDrawerOpen, onClose: onProcedureDrawerClose } = useDisclosure();
  const { isOpen: isQuickAddOpen, onOpen: onQuickAddOpen, onClose: onQuickAddClose } = useDisclosure();
  const {
    userStore: { getUsersList },
    toothTreatmentStore: {
      getToothTreatments,
      toothTreatment,
      getTodayToothTreatments,
      getTodayCount,
      todayToothTreatment,
      deleteToothTreatment,
      updateToothTreatment,
      lastExaminingDoctor,
      setLastExaminingDoctor,
      getTreatmentCountByDate
    },
  } = stores;

  const { isOpen: isCountModalOpen, onOpen: onOpenCountModal, onClose: onCloseCountModal } = useDisclosure();
  const [treatmentCounts, setTreatmentCounts] = useState<any[]>([]);
  const [isCountsLoading, setIsCountsLoading] = useState(false);
  const [countSearch, setCountSearch] = useState("");

  const filteredCounts = useMemo(() => {
    if (!countSearch) return treatmentCounts;
    return treatmentCounts.filter(item => {
      const dateStr = new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'long' }).toLowerCase();
      return dateStr.includes(countSearch.toLowerCase()) || item.date.includes(countSearch);
    });
  }, [treatmentCounts, countSearch]);

  const totalSummaryStats = useMemo(() => {
    return {
      totalVisits: treatmentCounts.length,
      totalTreatments: treatmentCounts.reduce((acc, curr) => acc + curr.count, 0)
    };
  }, [treatmentCounts]);

  const fetchTreatmentCounts = async () => {

    if (!patientDetails?._id) return;
    try {
      setIsCountsLoading(true);
      const res = await getTreatmentCountByDate({ patientId: patientDetails._id });
      setTreatmentCounts(res?.data || []);
      onOpenCountModal();
    } catch (err) {
      console.error("Failed to fetch treatment counts", err);
    } finally {
      setIsCountsLoading(false);
    }
  };


  useEffect(() => {
    if (patientDetails?._id) {
      getTodayToothTreatments({ patientId: patientDetails._id, date: sessionDate });
      getTodayCount({ patientId: patientDetails._id, date: sessionDate });

      // Fetch history summary to highlight treated teeth on chart
      getToothTreatments({ patientId: patientDetails._id, page: 1, limit: 100 } as any)
        .then((res: any) => {
          const raw = res?.data?.data || res?.data || [];
          const ids = Array.from(new Set(raw.map((it: any) => String(it.tooth || "")))) as string[];
          setTreatedToothIds(ids.filter(Boolean));

        })
        .catch(err => console.error("History fetch failed", err));
    }
  }, [patientDetails?._id, sessionDate]);




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
    if (patientDetails?.editData && patientDetails.editData._id !== lastSyncedEditId.current) {
      const edit = patientDetails.editData;
      lastSyncedEditId.current = edit._id;

      const notationToSet = edit.toothNotation || "fdi";
      setNotation(notationToSet as any);

      const rawTId = typeof edit.tooth === 'object' ? (edit.tooth.fdi || edit.tooth.id || edit.tooth.tooth?.fdi || edit.tooth.tooth?.id) : String(edit.tooth || "");
      const tId = String(rawTId);
      const isChild = detectIsChild(edit.tooth);
      const dentToSet = edit.dentitionType || (isChild ? "child" : "adult");
      setDentitionType(dentToSet as any);

      const primaryPool = getTeethByType(dentToSet as any);
      const secondaryPool = getTeethByType(dentToSet === "child" ? "adult" : "child");

      let matchedTooth = primaryPool.find(t => t.id === tId || t.fdi === tId || t.universal === tId || t.palmer === tId);
      if (!matchedTooth) {
        matchedTooth = secondaryPool.find(t => t.id === tId || t.fdi === tId || t.universal === tId || t.palmer === tId);
        if (matchedTooth) setDentitionType(dentToSet === "child" ? "adult" : "child");
      }

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
      if (edit.toothNote && tId) {
        setIndividualTeethNotes(prev => ({ ...prev, [tId]: edit.toothNote }));
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
  }, [patientDetails?.editData]);

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
    const toothId = String(tooth.fdi || tooth.id);

    if (selectionMode === 'history') {
      setHistoryFilterTooth(toothId);

      // Auto-open most recent record in detail view if it exists
      const historyRecords = toothTreatment.data || [];
      const mostRecent = historyRecords.find((rec: any) => {
        const recTooth = String(rec.toothFDI || rec.tooth || "");
        return recTooth.split(',').map(s => s.trim()).includes(toothId);
      });

      if (mostRecent) {
        setViewingRecord(mostRecent);
        onOpenViewModal();
      }

      onHistoryDrawerOpen();
      return;
    }


    if (selectionMode === 'multi') {
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
      setActiveTeethForForm([tooth]);
      setIsToothFormOpen(true);
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
      if (patientDetails?._id) {
        await getTodayToothTreatments({ patientId: patientDetails._id, date: sessionDate });
        await getTodayCount({ patientId: patientDetails._id, date: sessionDate });
      }
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

    // Sync UI state with the record being edited
    const isChild = detectIsChild(item.tooth);
    setDentitionType(isChild ? "child" : "adult");
    if (item.toothNotation) setNotation(item.toothNotation as any);

    const toothId = typeof item.tooth === 'object' ? (item.tooth.fdi || item.tooth.id) : String(item.tooth || "");

    setProcedureFormValues({
      treatments: {
        [toothId]: {
          doctor: item.doctor?._id ? { label: item.doctor.name, value: item.doctor._id } : (typeof item.doctor === 'string' ? item.doctor : undefined),
          notes: item.notes || "",
          treatmentCode: item.treatmentPlan || "",
          estimateMin: item.estimateMin || 0,
          estimateMax: item.estimateMax || 0,
          totalMin: item.totalMin || 0,
          totalMax: item.totalMax || 0,
          discount: item.discount || 0,
          status: item.status === "pending" ? "Planned" : (item.status === "completed" ? "Completed" : item.status),
          complaintType: item.complaintType || "Chief Complaint",
          examiningDoctor: item.examiningDoctor?._id ? { label: item.examiningDoctor.name, value: item.examiningDoctor._id } : (typeof item.examiningDoctor === 'string' ? item.examiningDoctor : undefined),
        }
      }
    });
    onEditDrawerOpen();
  };

  useEffect(() => {
    if (isHistoryDrawerOpen && patientDetails) {
      getTodayToothTreatments({
        patientId: patientDetails._id || patientDetails.id,
        date: sessionDate,
        complaintType: historyCategoryFilter === "all" ? undefined : historyCategoryFilter,
        search: historySearch
      });
      getTodayCount({
        patientId: patientDetails._id || patientDetails.id,
        date: sessionDate,
        complaintType: historyCategoryFilter === "all" ? undefined : historyCategoryFilter,
        search: historySearch
      });
    }
  }, [isHistoryDrawerOpen, historyPage, historySearch, historyCategoryFilter, historyFilterTooth, patientDetails?._id, sessionDate]);


  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyCategoryFilter]);

  const renderStep = () => {
    const activeColor = { "CHIEF COMPLAINT": "red", "OTHER FINDING": "orange", "EXISTING FINDING": "green" }[complaintType] || "blue";
    switch (step) {
      case "TOOTH_SELECTION":
        return (
          <VStack spacing={4} align="stretch" h="full">
            <Flex justify="space-between" align="center" bg="white" px={5} py={2} borderRadius="3xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
              <HStack spacing={8}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">DENTITION</Text>
                  <DentitionToggle value={dentitionType} onChange={(val) => {
                    setDentitionType(val);
                    setSelectedTeeth([]);
                    setToothComplaints({});
                  }} />
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">NOTATION</Text>
                  <HStack bg="gray.50" p={1} borderRadius="xl">
                    {["fdi", "universal", "palmer"].map(n => (
                      <Button
                        key={n}
                        size="xs"
                        variant={notation === n ? "solid" : "ghost"}
                        bg={notation === n ? `${activeColor}.500` : "transparent"}
                        color={notation === n ? "white" : "gray.600"}
                        _hover={{ bg: notation === n ? `${activeColor}.600` : "gray.100" }}
                        onClick={() => setNotation(n as any)}
                        fontWeight="900"
                      >
                        {n.toUpperCase()}
                      </Button>
                    ))}
                  </HStack>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">COMPLAINT</Text>
                  <HStack bg="gray.50" p={1} borderRadius="xl">
                    {["CHIEF COMPLAINT", "OTHER FINDING", "EXISTING FINDING"].map(type => {
                      const buttonColorMap: any = { "CHIEF COMPLAINT": "red", "OTHER FINDING": "orange", "EXISTING FINDING": "green" };
                      const isActive = complaintType === type;
                      const c = buttonColorMap[type];
                      return (
                        <Button
                          key={type}
                          size="xs"
                          bg={isActive ? `${c}.500` : "transparent"}
                          color={isActive ? "white" : "gray.600"}
                          _hover={{ bg: isActive ? `${c}.600` : "gray.100" }}
                          variant={isActive ? "solid" : "ghost"}
                          onClick={() => setComplaintType(type)}
                          fontWeight="900"
                        >
                          {type.split(' ')[0]}
                        </Button>
                      );
                    })}
                  </HStack>
                </VStack>
                <VStack align="start" spacing={1} minW="220px">
                  <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em">EXAMINING DOCTOR</Text>
                  <CustomInput
                    name="examiningDoctor"
                    type="real-time-user-search"
                    query={{ type: 'doctor' }}
                    options={doctorOptions}
                    value={lastExaminingDoctor}
                    onChange={(val: any) => setLastExaminingDoctor(val)}
                    style={{ height: '32px', borderRadius: '12px', fontSize: '11px' }}
                    placeholder="Select Doctor"
                  />
                </VStack>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="11px" fontWeight="900" color="gray.300">SELECTED</Text>
                <Text fontWeight="900" color={`${activeColor}.500`} fontSize="3xl">{selectedTeeth.length}</Text>
              </VStack>
            </Flex>

            <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} gap={4} flex={1} overflow="hidden">
              <VStack bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" p={5} overflow="hidden" align="stretch" spacing={4}>
                <Flex justify="space-between" align="center" borderBottom="1px dashed" borderColor="gray.100" pb={3}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.2em">CHARTING MODE</Text>
                    <Heading size="xs" fontWeight="1000">Selection Method</Heading>
                  </VStack>
                  <HStack bg="gray.100" p={1} borderRadius="xl">
                    <Button
                      size="xs" leftIcon={<FiMousePointer />}
                      bg={selectionMode === 'single' ? `${activeColor}.500` : "transparent"}
                      color={selectionMode === 'single' ? "white" : "gray.600"}
                      _hover={{ bg: selectionMode === 'single' ? `${activeColor}.600` : "gray.100" }}
                      variant={selectionMode === 'single' ? "solid" : "ghost"}
                      onClick={() => { setSelectionMode('single'); setIsMultipleSelection(false); setSelectedTeeth([]); }}
                      fontWeight="900"
                    >
                      SINGLE SELECTION
                    </Button>
                    <Button
                      size="xs" leftIcon={<FiActivity />}
                      bg={selectionMode === 'multi' ? `${activeColor}.500` : "transparent"}
                      color={selectionMode === 'multi' ? "white" : "gray.600"}
                      _hover={{ bg: selectionMode === 'multi' ? `${activeColor}.600` : "gray.100" }}
                      variant={selectionMode === 'multi' ? "solid" : "ghost"}
                      onClick={() => { setSelectionMode('multi'); setIsMultipleSelection(true); }}
                      fontWeight="900"
                    >
                      MULTI-TOOTH
                    </Button>
                  </HStack>

                </Flex>
                <Box flex={1} overflow="hidden">
                  <TeethChart
                    key={dentitionType}
                    dentitionType={dentitionType}
                    selectedTeeth={selectedTeeth}
                    onToothClick={handleToothClick}
                    notationType={notation}
                    toothComplaints={toothComplaints}
                    activeComplaintType={complaintType}
                    todayTreatments={todayToothTreatment.data}
                    historyTeeth={treatedToothIds}
                  />

                </Box>
              </VStack>
              <VStack spacing={4} align="stretch" p={6} bg="white" border="1px solid" borderColor="gray.100" rounded="3xl" h="full" boxShadow="xs" overflow="hidden">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="11px" fontWeight="900" color={`${activeColor}.500`}>CLINICAL HISTORY</Text>
                    <Heading size="xs" fontWeight="900">Saved Records</Heading>
                  </VStack>
                  <HStack spacing={2}>
                    <Circle size="28px" bg={`${activeColor}.50`} color={`${activeColor}.500`} fontWeight="900">{todayToothTreatment.totalItems || 0}</Circle>
                    <IconButton aria-label="Summary" icon={<FiCalendar />} size="sm" colorScheme="blue" borderRadius="full" onClick={fetchTreatmentCounts} />
                    <IconButton aria-label="Add" icon={<FiPlus />} size="sm" colorScheme={activeColor} borderRadius="full" onClick={onQuickAddOpen} />

                  </HStack>
                </HStack>
                <Box flex={1} overflowY="auto" pr={2}>
                  <VStack align="stretch" spacing={4}>
                    <VStack align="stretch" spacing={2}>
                      <Text fontSize="10px" fontWeight="1000" color="blue.500" letterSpacing="0.1em">SESSION CONTEXT</Text>
                      <HStack bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.100" justify="space-between">
                        <Input
                          type="date"
                          value={sessionDate}
                          onChange={(e) => setSessionDate(e.target.value)}
                          size="sm"
                          variant="unstyled"
                          fontWeight="1000"
                          color="blue.700"
                          p={0}
                        />
                      </HStack>
                    </VStack>

                    <Box p={5} bg="blue.50/30" borderRadius="2xl" border="1px solid" borderColor="blue.100" cursor="pointer" onClick={() => { if (patientDetails?._id) { getTodayToothTreatments({ patientId: patientDetails._id, date: sessionDate }); getTodayCount({ patientId: patientDetails._id, date: sessionDate }); } onHistoryDrawerOpen(); }} _hover={{ transform: "translateY(-2px)" }}>

                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}><Text fontSize="10px" fontWeight="1000">PATIENT RECORDS</Text><Heading size="xs">View History</Heading></VStack>
                        <Text fontSize="24px" fontWeight="1000" color="blue.600">{todayToothTreatment.totalItems || 0}</Text>
                      </HStack>
                    </Box>
                    <Button colorScheme="blue" rightIcon={<FiChevronRight />} isDisabled={selectedTeeth.length === 0 && !teethNotes.trim()} onClick={handleNext} w="full" h="54px" borderRadius="2xl" fontWeight="900" textTransform="uppercase">Initialize Record</Button>

                  </VStack>
                </Box>

              </VStack>
            </Grid>
          </VStack>
        );
      case "PROCEDURE_FORM":
        // Fallback to General Tooth if no teeth are selected (as per user requirement)
        const activeTeethForStep = selectedTeeth.length > 0 ? selectedTeeth : [{ id: "General", fdi: "General", name: "General Clinical Record", universal: "", palmer: "", position: "upper", side: "right", type: "molar" } as ToothData];
        return (
          <TreatmentProcedureForm
            isPatient={isPatient} patientDetails={patientDetails} editData={editingTreatment || patientDetails?.editData} teeth={activeTeethForStep}
            dentitionType={dentitionType}
            generalDescription={generalDescription || teethNotes} complaintType={complaintType} toothComplaints={toothComplaints}
            onSuccess={() => {
              patientDetails?.applyGetAllRecords?.({});
              setStep("TOOTH_SELECTION");
              setSelectedTeeth([]);
              setEditingTreatment(null);
              if (patientDetails?._id) {
                getTodayToothTreatments({ patientId: patientDetails._id, date: sessionDate });
                getTodayCount({ patientId: patientDetails._id, date: sessionDate });
              }
            }}

            onBack={handleBack} onToothClick={handleToothClick} hoistedValues={procedureFormValues} notation={notation} onValuesUpdate={setProcedureFormValues}
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
      <CustomDrawer open={isQuickAddOpen} close={onQuickAddClose} title={<PatientHeader title="Quick Clinical Entry" patient={patientDetails} />} width="70vw">
        <TreatmentProcedureForm
          isPatient={isPatient} patientDetails={patientDetails}
          teeth={[{ id: "General", fdi: "General", name: "General Clinical Record", universal: "", palmer: "", position: "upper", side: "right", type: "molar" } as ToothData]}
          generalDescription={teethNotes}
          onSuccess={() => { onQuickAddClose(); if (patientDetails?._id) getToothTreatments({ patientId: patientDetails._id, page: 1, search: "" }); }}
          onBack={onQuickAddClose} isDrawerMode={true} doctorOptions={doctorOptions}
          notation={notation}
        />
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
              <Badge variant="subtle" colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="900">
                {todayToothTreatment.totalItems || 0} ITEMS ON {new Date(sessionDate).toLocaleDateString().toUpperCase()}
              </Badge>

            </HStack>
          </HStack>
          <IconButton aria-label="Close" icon={<FiX />} onClick={closeWizard} variant="ghost" />
        </Flex>
        <Progress value={progressPercent} size="xs" colorScheme="blue" h="1px" />
      </Flex>

      <Box h="calc(100vh - 80px)" px={6} pb={6} pt={2} overflow="hidden">{renderStep()}</Box>

      <CustomDrawer open={isEditDrawerOpen} close={onEditDrawerClose} title={<PatientHeader title="Edit Clinical Entry" patient={patientDetails} />} width="70vw">
        {(() => {
          const rawTId = typeof editingTreatment?.tooth === 'object' ? (editingTreatment.tooth.fdi || editingTreatment.tooth.id || editingTreatment.tooth.tooth?.fdi || editingTreatment.tooth.tooth?.id) : String(editingTreatment?.tooth || "");
          const tId = String(rawTId);
          const isChild = detectIsChild(editingTreatment?.tooth);
          const pool = isChild ? childTeeth : adultTeeth;
          const otherPool = isChild ? adultTeeth : childTeeth;

          let toothObj = tId ? (
            pool.find(t => t.id === tId || t.fdi === tId || t.universal === tId || t.palmer === tId) ||
            otherPool.find(t => t.id === tId || t.fdi === tId || t.universal === tId || t.palmer === tId)
          ) : null;

          // Aggressive tooth resolution for editing existing records
          if (!toothObj || tId.toLowerCase() === "general" || !tId || tId === "undefined" || tId === "null") {
            if (!tId || tId.toLowerCase() === "general" || tId === "undefined" || tId === "null") {
              toothObj = { id: "General", fdi: "General", name: "General Clinical Record", universal: "", palmer: "", position: "upper", side: "right", type: "molar" } as ToothData;
            } else if (!toothObj) {
              // Fallback for custom IDs not in the standard chart pools
              toothObj = { id: tId, fdi: tId, name: `Tooth ${tId}`, universal: "", palmer: "", position: "upper", side: "right", type: "molar" } as ToothData;
            }
          }

          return (
            <TreatmentProcedureForm
              isPatient={isPatient} patientDetails={patientDetails} editData={editingTreatment}
              teeth={toothObj ? [toothObj as ToothData] : []}
              dentitionType={isChild ? "child" : "adult"}
              generalDescription={generalDescription} complaintType={complaintType} toothComplaints={toothComplaints}
              onSuccess={() => {
                onEditDrawerClose();
                patientDetails?.applyGetAllRecords?.({});
                if (patientDetails?._id) {
                  getTodayToothTreatments({ patientId: patientDetails._id, date: sessionDate });
                  getTodayCount({ patientId: patientDetails._id, date: sessionDate });
                }
              }}


              onBack={onEditDrawerClose} isDrawerMode={true} doctorOptions={doctorOptions}
              notation={notation}
            />
          );
        })()}
      </CustomDrawer>

      <CustomDrawer open={isHistoryDrawerOpen} close={onHistoryDrawerClose} title={<PatientHeader title="Clinical History" patient={patientDetails} />} width="85vw">
        <Box h="full" bg="white" p={6}>
          <VStack align="stretch" spacing={6} h="full">
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Heading size="md">Clinical Timeline</Heading>
                <HStack bg="gray.100" p={1} borderRadius="xl">
                  <IconButton size="xs" variant={!isTableView ? "solid" : "ghost"} colorScheme={!isTableView ? "blue" : "gray"} icon={<FiGrid />} onClick={() => setIsTableView(false)} aria-label="Card View" />
                  <IconButton size="xs" variant={isTableView ? "solid" : "ghost"} colorScheme={isTableView ? "blue" : "gray"} icon={<FiList />} onClick={() => setIsTableView(true)} aria-label="Table View" />
                </HStack>
              </HStack>
              <HStack spacing={4}>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="10px" fontWeight="900" color="gray.400">SESSION DATE</Text>
                    <HStack spacing={2}>
                      <Input
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        size="sm"
                        borderRadius="xl"
                        bg="blue.50"
                        border="none"
                        fontWeight="800"
                        color="blue.700"
                      />
                      <IconButton 
                        aria-label="Trends" 
                        icon={<FiBarChart2 />} 
                        size="sm" 
                        colorScheme="blue" 
                        borderRadius="xl" 
                        onClick={fetchTreatmentCounts} 
                      />
                    </HStack>
                  </VStack>

                <Badge 
                  colorScheme="blue" 
                  borderRadius="lg" 
                  px={4} 
                  py={3} 
                  cursor="pointer"
                  onClick={fetchTreatmentCounts}
                  _hover={{ opacity: 0.8 }}
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Icon as={FiActivity} />
                    <Text>{todayToothTreatment.totalItems || 0} ITEMS ON {new Date(sessionDate).toLocaleDateString().toUpperCase()}</Text>
                    <Badge variant="solid" colorScheme="blue" borderRadius="full">VIEW SUMMARY</Badge>
                  </HStack>
                </Badge>
              </HStack>


            </HStack>
            <HStack spacing={4} bg="gray.100" p={2} borderRadius="2xl" display="flex" mb={4}>
              <HStack bg="white" px={3} borderRadius="xl" border="1px solid" borderColor="gray.200" flex={1}>
                <Icon as={FiSearch} color="gray.400" />
                <Input
                  placeholder="Search in history..."
                  variant="unstyled"
                  py={2}
                  fontSize="sm"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </HStack>
              <Box w="220px">
                <select
                  value={historyCategoryFilter}
                  onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '12px',
                    padding: '0 12px',
                    fontSize: '13px',
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    fontWeight: '700',
                    color: '#4A5568',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Complaints</option>
                  <option value="CHIEF COMPLAINT">CHIEF COMPLAINT</option>
                  <option value="OTHER FINDING">OTHER FINDING</option>
                  <option value="EXISTING FINDING">EXISTING FINDING</option>
                </select>
              </Box>
            </HStack>
            <Box flex={1} overflowY="auto" pt={2} className="clinical-history-scroll" sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { bg: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bg: 'gray.200', borderRadius: 'full' }
            }}>
              {todayToothTreatment.loading ? (
                <VStack py={20}><Progress size="xs" isIndeterminate w="200px" borderRadius="full" colorScheme="blue" /></VStack>
              ) : todayToothTreatment.totalItems > 0 ? (
                isTableView ? (
                  <Table variant="simple" size="sm" bg="white" borderRadius="2xl" overflow="hidden" boxShadow="xs">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th fontSize="10px">Date</Th>
                        <Th fontSize="10px">Tooth</Th>
                        <Th fontSize="10px">Category</Th>
                        <Th fontSize="10px">Procedure</Th>
                        <Th fontSize="10px">Status</Th>
                        <Th fontSize="10px" textAlign="right">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {todayToothTreatment.data.map((item: any) => (
                        <Tr key={item._id} _hover={{ bg: "blue.50/30" }}>
                          <Td py={4} fontSize="12px" fontWeight="700">{new Date(item.treatmentDate).toLocaleDateString()}</Td>
                          <Td py={4}><Badge borderRadius="full" px={2} colorScheme="blue">{item.tooth?.fdi === "General" ? "GEN" : item.tooth}</Badge></Td>
                          <Td py={4} fontSize="11px" fontWeight="600" color="gray.500">{item.complaintType}</Td>
                          <Td py={4} fontSize="12px" fontWeight="800" color="gray.700" maxW="200px" isTruncated>{item.treatmentPlan}</Td>
                          <Td py={4}>
                            <Badge colorScheme={item.status === "completed" ? "green" : "orange"} variant="subtle" borderRadius="full" px={2} fontSize="9px">
                              {item.status?.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td py={4} textAlign="right">
                            <HStack spacing={1} justify="flex-end">
                              <IconButton size="xs" icon={<FiEye />} onClick={() => { setViewingRecord(item); onOpenViewModal(); }} variant="ghost" colorScheme="blue" aria-label="View" />
                              <IconButton size="xs" icon={<FiEdit3 />} onClick={() => handleEditTreatment(item)} variant="ghost" colorScheme="blue" aria-label="Edit" />
                              <IconButton size="xs" icon={<FiTrash2 />} onClick={() => handleDeleteTreatment(item._id)} variant="ghost" colorScheme="red" aria-label="Delete" />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <VStack spacing={6} align="stretch" pb={10} position="relative">
                    <Box position="absolute" left="35px" top="0" bottom="0" w="2px" bg="gray.100" zIndex={0} />
                    {todayToothTreatment.data.map((item: any) => {
                      const style = COMPLAINT_STYLES[item.complaintType?.toUpperCase()] || COMPLAINT_STYLES.default;
                      const isCompleted = item.status?.toLowerCase() === "completed";
                      const treatmentDate = new Date(item.treatmentDate);
                      return (
                        <Box key={item._id} bg="white" borderRadius="3xl" boxShadow="0 4px 20px -4px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1)" p={5} transition="all 0.3s" _hover={{ transform: "translateY(-2px)" }} border="1px solid" borderColor="gray.100" position="relative" zIndex={1}>
                          <Flex justify="space-between" align="start">
                            <HStack spacing={6} align="start" flex={1}>
                              <VStack align="center" justify="center" spacing={0} minW="70px" h="70px" bg="blue.50" borderRadius="2xl" border="2px solid" borderColor="blue.100" shadow="sm">
                                <Text fontSize="10px" fontWeight="1000" color="blue.400" mt={1}>TOOTH</Text>
                                <Text fontSize="24px" fontWeight="1000" color="blue.700" lineHeight={1} mb={1}>
                                  {item.tooth === "General" ? "GEN" : (item.tooth || "??")}
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={2} flex={1}>
                                <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">
                                  {treatmentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                                </Text>
                                <HStack spacing={2} wrap="wrap">
                                  <Badge variant="subtle" colorScheme={style.iconColor.split('.')[0]} borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="1000">
                                    {item.complaintType}
                                  </Badge>
                                  {isCompleted ? (
                                    <Badge colorScheme="green" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="9px" fontWeight="1000">COMPLETED</Badge>
                                  ) : (
                                    <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="9px" fontWeight="1000">PENDING</Badge>
                                  )}
                                </HStack>
                                <VStack align="start" spacing={1}>
                                  {item.notes && (
                                    <Box bg="gray.50" p={3} mt={1} borderRadius="xl" borderLeft="3px solid" borderColor="blue.200" w="full">
                                      <Text fontSize="lg" color="gray.800" fontWeight="600" lineHeight="tall">
                                        {item.notes}
                                      </Text>
                                    </Box>
                                  )}
                                  <Heading mt={2} size="sm" fontWeight="1000" color="gray.800" letterSpacing="tight">
                                    {item.treatmentPlan || "General Observation"}
                                  </Heading>
                                </VStack>
                              </VStack>
                            </HStack>
                            <HStack spacing={1} bg="white" p={1} borderRadius="xl" border="1px solid" borderColor="gray.50" shadow="xs">
                              <IconButton size="sm" variant="ghost" colorScheme="blue" icon={<FiEye />} aria-label="View" onClick={() => { setViewingRecord(item); onOpenViewModal(); }} />
                              <IconButton size="sm" variant="ghost" colorScheme="blue" icon={<FiEdit3 />} aria-label="Edit" onClick={() => handleEditTreatment(item)} />
                              <IconButton size="sm" variant="ghost" colorScheme="red" icon={<FiTrash2 />} aria-label="Delete" onClick={() => handleDeleteTreatment(item._id)} />
                            </HStack>
                          </Flex>
                        </Box>
                      );
                    })}
                  </VStack>
                )
              ) : (
                <VStack py={20} opacity={0.5} spacing={3}>
                  <Icon as={FiActivity} fontSize="40px" color="gray.300" />
                  <Text fontWeight="800" color="gray.400">No clinical records found</Text>
                  <Text fontSize="xs" color="gray.400">Try adjusting your filters or adding a new record</Text>
                </VStack>
              )}
            </Box>
            <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.100">
              <Text fontSize="xs">Showing session records only</Text>
            </HStack>
          </VStack>
        </Box>
      </CustomDrawer>
      <Modal isOpen={isViewModalOpen} onClose={onCloseViewModal} isCentered size="2xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={2} overflow="hidden">
          <ModalHeader borderBottom="1px solid" borderColor="gray.50" pb={4}>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.2em">CLINICAL RECORD DETAILS</Text>
                <Heading size="md" fontWeight="1000">{viewingRecord?.treatmentPlan || "General Record"}</Heading>
              </VStack>
              <Badge colorScheme="blue" variant="solid" borderRadius="full" px={4} py={1}>#{viewingRecord?._id?.slice(-6).toUpperCase()}</Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <VStack align="start" spacing={1}>
                <Text fontSize="20px" fontWeight="900">{new Date(viewingRecord?.treatmentDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Badge fontSize="20px" fontWeight="900" colorScheme="blue" variant="subtle" borderRadius="lg" px={2}>{viewingRecord?.tooth?.fdi === "General" ? "General Clinical" : `Tooth #${viewingRecord?.tooth}`}</Badge>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="10px" fontWeight="900" color="gray.400">CATEGORY</Text>
                <Text fontWeight="800" color="gray.700">{viewingRecord?.complaintType}</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="10px" fontWeight="900" color="gray.400">STATUS</Text>
                <Badge colorScheme={viewingRecord?.status === "completed" ? "green" : "orange"} borderRadius="full">{viewingRecord?.status?.toUpperCase()}</Badge>
              </VStack>

              <Box gridColumn="span 2" bg="gray.50" p={4} borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                <Text fontSize="10px" fontWeight="900" color="gray.400" mb={2}>CLINICAL NOTES</Text>
                <Text fontSize="sm" fontStyle="italic" color="gray.700">"{viewingRecord?.notes || "No notes provided."}"</Text>
              </Box>

              <VStack align="start" spacing={1} bg="blue.50/50" p={3} borderRadius="2xl">
                <Text fontSize="10px" fontWeight="900" color="blue.400">ESTIMATED FEE</Text>
                <Text fontWeight="1000" color="blue.700">₹{viewingRecord?.estimateMin} - ₹{viewingRecord?.estimateMax}</Text>
              </VStack>
              <VStack align="start" spacing={1} bg="orange.50/50" p={3} borderRadius="2xl">
                <Text fontSize="10px" fontWeight="900" color="orange.400">CONCESSION / DISCOUNT</Text>
                <Text fontWeight="1000" color="orange.700">₹{viewingRecord?.discount || 0}</Text>
              </VStack>

              <HStack gridColumn="span 2" spacing={4} pt={2} borderTop="1px solid" borderColor="gray.100">
                <Avatar size="sm" name={viewingRecord?.doctor?.name} bg="blue.100" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="10px" fontWeight="900" color="gray.400">ATTENDING CLINICIAN</Text>
                  <Text fontWeight="900">{viewingRecord?.doctor?.name || "Unassigned"}</Text>
                </VStack>
              </HStack>

              <HStack gridColumn="span 2" spacing={4} pt={2} borderTop="1px solid" borderColor="gray.100">
                <Avatar size="sm" name={viewingRecord?.examiningDoctor?.name || viewingRecord?.examiningDoctorName} bg="teal.100" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="10px" fontWeight="900" color="gray.400">EXAMINING DOCTOR</Text>
                  <Text fontWeight="900">{viewingRecord?.examiningDoctor?.name || viewingRecord?.examiningDoctorName || viewingRecord?.examiningDoctor?.label || "Unassigned"}</Text>
                </VStack>
              </HStack>
            </Grid>
          </ModalBody>
          <ModalFooter bg="gray.50" py={4}>
            <Button w="full" colorScheme="blue" borderRadius="2xl" h="50px" fontWeight="1000" leftIcon={<FiActivity />} onClick={onCloseViewModal}>CLOSE RECORD</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ToothFormDialog
        open={isToothFormOpen}
        onOpenChange={setIsToothFormOpen}
        teeth={activeTeethForForm}
        isPatient={isPatient}
        patientDetails={patientDetails}
        generalDescription={teethNotes}
        notation={notation}
        dentitionType={dentitionType}
        lastExaminingDoctor={lastExaminingDoctor}
        setLastExaminingDoctor={setLastExaminingDoctor}
        doctorOptions={doctorOptions}
        onSuccess={() => {
          if (patientDetails?._id) {
            getTodayToothTreatments({ patientId: patientDetails._id });
          }
        }}
        complaintType={complaintType}
      />

      <Modal isOpen={isCountModalOpen} onClose={onCloseCountModal} isCentered size="md">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={2}>
          <ModalHeader borderBottom="1px solid" borderColor="gray.50">
            <VStack align="start" spacing={3}>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.2em">PATIENT TRENDS</Text>
                <Heading size="md" fontWeight="1000">Clinical Activity Summary</Heading>
              </VStack>
              {!isCountsLoading && treatmentCounts.length > 0 && (
                <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                  <Box bg="blue.50" p={2} borderRadius="xl" border="1px solid" borderColor="blue.100">
                    <Text fontSize="9px" fontWeight="800" color="blue.400">TOTAL VISITS</Text>
                    <Text fontSize="lg" fontWeight="1000" color="blue.700">{totalSummaryStats.totalVisits}</Text>
                  </Box>
                  <Box bg="purple.50" p={2} borderRadius="xl" border="1px solid" borderColor="purple.100">
                    <Text fontSize="9px" fontWeight="800" color="purple.400">TOTAL TREATMENTS</Text>
                    <Text fontSize="lg" fontWeight="1000" color="purple.700">{totalSummaryStats.totalTreatments}</Text>
                  </Box>

                </Grid>
              )}
              <HStack w="full" bg="gray.100" p={2} borderRadius="xl">
                <Icon as={FiSearch} color="gray.400" />
                <Input 
                  placeholder="Filter by date or year..." 
                  variant="unstyled" 
                  fontSize="xs" 
                  value={countSearch}
                  onChange={(e) => setCountSearch(e.target.value)}
                />
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6} maxH="500px" overflowY="auto">
            {isCountsLoading ? (
              <VStack align="stretch" spacing={3}>
                {[1, 2, 3, 4, 5].map(i => (
                  <HStack key={i} p={4} bg="gray.50" borderRadius="2xl" justify="space-between">
                    <HStack spacing={4}>
                      <Box w="36px" h="36px" bg="gray.100" borderRadius="lg" />
                      <VStack align="start" spacing={2}>
                        <Box w="120px" h="12px" bg="gray.100" borderRadius="full" />
                        <Box w="60px" h="8px" bg="gray.200" borderRadius="full" />
                      </VStack>
                    </HStack>
                    <Box w="40px" h="24px" bg="gray.100" borderRadius="full" />
                  </HStack>
                ))}
                <Progress size="xs" isIndeterminate w="full" borderRadius="full" colorScheme="blue" mt={2} />
              </VStack>
            ) : filteredCounts.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                {filteredCounts.map((item, idx) => (
                  <HStack 
                    key={idx} 
                    p={4} 
                    bg="gray.50" 
                    borderRadius="2xl" 
                    justify="space-between"
                    border="1px solid"
                    borderColor="transparent"
                    _hover={{ borderColor: "blue.200", bg: "blue.50", cursor: "pointer", transform: "translateX(4px)" }}
                    transition="all 0.2s"
                    onClick={() => {
                      setSessionDate(item.date);
                      onCloseCountModal();
                    }}
                  >
                    <HStack spacing={4}>
                      <Box p={2} bg="white" borderRadius="lg" shadow="sm">
                        <Icon as={FiCalendar} color="blue.500" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="800" color="gray.700">
                          {new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </Text>
                        <Text fontSize="10px" fontWeight="700" color="gray.400">SESSION DATE</Text>
                      </VStack>
                    </HStack>
                    <Circle bg="blue.500" size="32px" color="white" fontWeight="1000" fontSize="sm" shadow="md">
                      {item.count}
                    </Circle>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <VStack py={10} spacing={4} opacity={0.5}>
                <Icon as={FiActivity} fontSize="40px" />
                <Text fontWeight="800">{countSearch ? "No matches found" : "No activity history found"}</Text>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderRadius="0 0 2xl 2xl">
            <Button w="full" variant="ghost" fontWeight="1000" onClick={onCloseCountModal}>CLOSE SUMMARY</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});


export default Index;

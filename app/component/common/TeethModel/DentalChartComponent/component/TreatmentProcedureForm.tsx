import { useEffect, useState, useMemo, useRef } from "react";
import {
    Badge,
    Box,
    Button,
    Grid,
    HStack,
    Heading,
    VStack,
    Text,
    useToast,
    Icon,
    Input,
    Divider,
    Flex,
    Avatar,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Circle,
    InputGroup,
    InputLeftElement,
} from "@chakra-ui/react";
import CustomDrawer from "../../../Drawer/CustomDrawer";
import { keyframes } from "@emotion/react";
import { Formik, Form as FormikForm } from "formik";
import {
    FiChevronRight,
    FiSave,
    FiActivity,
    FiCreditCard,
    FiSearch,
    FiFilter,
    FiInfo,
    FiScissors,
    FiPlusCircle,
    FiTool,
    FiLayers,
    FiSun,
    FiHeart,
    FiX,
} from "react-icons/fi";

import { motion, AnimatePresence } from "framer-motion";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

import { ToothData } from "../utils/teethData";
import { ToothInfoCard } from "./ToothInfoCard";
import CustomInput from "../../../../config/component/customInput/CustomInput";
import { replaceLabelValueObjects } from "../../../../../config/utils/function";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";
import {
    TREATMENT_CATEGORIES,
} from "../../../../../dashboard/toothTreatment/treatmentDataConstant";

const CATEGORY_ICONS: Record<string, any> = {
    "Diagnostic": FiActivity,
    "Preventive": FiSun,
    "Restorative": FiLayers,
    "Endodontics": FiHeart,
    "Periodontics": FiScissors,
    "Prosthodontics (Removable)": FiTool,
    "Oral And Maxillofacial Surgery": FiPlusCircle,
    "Implant Services": FiLayers,
    "Orthodontics": FiActivity,
};

const pulseGlow = keyframes`
  0% { transform: scale(1); box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2); }
  50% { transform: scale(1.01); box-shadow: 0 8px 16px rgba(49, 130, 206, 0.3); }
  100% { transform: scale(1); box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2); }
`;

interface TreatmentProcedureFormProps {
    teeth: ToothData[];
    generalDescription: string;
    isPatient: boolean;
    patientDetails: any;
    onSuccess: () => void;
    onBack: () => void;
    hoistedValues?: any;
    onValuesUpdate?: (values: any) => void;
    explorerState?: { catIdx: number; subIdx: number };
    onExplorerUpdate?: (state: { catIdx: number; subIdx: number }) => void;
    editData?: any;
    complaintType?: string;
    individualTeethNotes?: any;
    onEditToothNote?: (note: any) => void;
    onToothClick?: (tooth: ToothData) => void;
    formRef?: any;
    doctorOptions?: any[];
    toothComplaints?: Record<string, string>;
    isDrawerMode?: boolean;
    onEditGeneralNote?: () => void;
    notation?: "fdi" | "universal" | "palmer";
    dentitionType?: "adult" | "child";
    onRemoveTooth?: (id: string) => void;
    sessionDate?: string;
}


interface TreatmentFormData {
    doctor: any;
    examiningDoctor: any;
    treatmentDate: string;
    notes: string;
    treatmentCode: string;
    estimateMin: number;
    estimateMax: number;
    discount: number;
    totalMin: number;
    totalMax: number;
    patient?: any;
    status: string;
    complaintType: string;
}

const initialFormData: TreatmentFormData = {
    doctor: undefined,
    examiningDoctor: undefined,
    treatmentDate: new Date().toISOString().split("T")[0],
    notes: "",
    treatmentCode: "",
    estimateMin: "" as any,
    estimateMax: "" as any,
    discount: "" as any,
    totalMin: "" as any,
    totalMax: "" as any,
    patient: undefined,
    status: "Planned",
    complaintType: undefined as any,
};

export const TreatmentProcedureForm = observer(
    ({
        teeth = [],
        generalDescription = "",
        isPatient,
        patientDetails,
        onSuccess,
        onBack,
        hoistedValues,
        onValuesUpdate,
        explorerState,
        onExplorerUpdate,
        editData,
        individualTeethNotes,
        onEditToothNote,
        onToothClick,
        toothComplaints = {},
        complaintType,
        notation = "fdi",
        isDrawerMode = false,
        dentitionType,
        onRemoveTooth,
        sessionDate
    }: TreatmentProcedureFormProps) => {

        const { isOpen: isProcedureOpen, onOpen: onProcedureOpen, onClose: onProcedureClose } = useDisclosure();
        const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure({ defaultIsOpen: teeth.length > 1 });

        const [searchTerm, setSearchTerm] = useState("");
        const [activeToothId, setActiveToothId] = useState<string | "bulk" | null>(
            teeth.length > 1 ? "bulk" : (teeth.length > 0 ? teeth[0].id : null)
        );
        const toast = useToast();
        const [formLoading, setFormLoading] = useState(false);
        const {
            toothTreatmentStore: { createToothTreatment, updateToothTreatment, lastExaminingDoctor, setLastExaminingDoctor },
            userStore: { getUsersList },
            procedureStore,
        } = stores;

        useEffect(() => {
            procedureStore.getProcedures();
        }, []);

        const groupedData = useMemo(() => {
            const dbData = procedureStore.procedures.data;
            if (!dbData || dbData.length === 0) return TREATMENT_CATEGORIES;

            const map: any = {};
            dbData.forEach((p: any) => {
                const cat = p.category;
                const sub = p.subcategory;
                const n1 = p.name;
                const n2 = p.name2 || "None";
                const n3 = p.name3 || "None";

                if (!map[cat]) map[cat] = { name: cat, subcategories: {} };
                if (!map[cat].subcategories[sub]) {
                    map[cat].subcategories[sub] = { name: sub, name1s: {} };
                }
                if (!map[cat].subcategories[sub].name1s[n1]) {
                    map[cat].subcategories[sub].name1s[n1] = { name: n1, name2s: {} };
                }
                if (!map[cat].subcategories[sub].name1s[n1].name2s[n2]) {
                    map[cat].subcategories[sub].name1s[n1].name2s[n2] = { name: n2, name3s: {} };
                }
                if (!map[cat].subcategories[sub].name1s[n1].name2s[n2].name3s[n3]) {
                    map[cat].subcategories[sub].name1s[n1].name2s[n2].name3s[n3] = { 
                        name: n3, 
                        procedure: p 
                    };
                }
            });

            return Object.values(map).map((cat: any) => ({
                ...cat,
                subcategories: Object.values(cat.subcategories).map((sub: any) => ({
                    ...sub,
                    name1s: Object.values(sub.name1s).map((n1: any) => ({
                        ...n1,
                        name2s: Object.values(n1.name2s).map((n2: any) => ({
                            ...n2,
                            name3s: Object.values(n2.name3s)
                        }))
                    }))
                }))
            }));
        }, [procedureStore.procedures.data]);
        
        const [doctors, setDoctors] = useState<any[]>([]);
        const [doctorsLoading, setDoctorsLoading] = useState(false);

        useEffect(() => {
            // Doctors are now fetched on-demand by CustomInput to prevent global state pollution
        }, []);

        // Sync active tooth ID in drawer mode (edit case)
        useEffect(() => {
            if (isDrawerMode && teeth.length > 0) {
                setActiveToothId(teeth[0].id);
            }
        }, [isDrawerMode, teeth]);

        const [localExplorerState, setLocalExplorerState] = useState<{ catIdx: number | null, subIdx: number | null, n1Idx: number | null, n2Idx: number | null, n3Idx: number | null }>({ catIdx: null, subIdx: null, n1Idx: null, n2Idx: null, n3Idx: null });

        const lastSyncedId = useRef<string | null>(null);

        const selectedCatIdx = (explorerState && explorerState.catIdx !== null) ? explorerState.catIdx : localExplorerState.catIdx;
        const selectedSubIdx = (explorerState && explorerState.subIdx !== null) ? explorerState.subIdx : localExplorerState.subIdx;
        const selectedN1Idx = (explorerState && (explorerState as any).n1Idx !== undefined) ? (explorerState as any).n1Idx : localExplorerState.n1Idx;
        const selectedN2Idx = (explorerState && (explorerState as any).n2Idx !== undefined) ? (explorerState as any).n2Idx : localExplorerState.n2Idx;
        const selectedN3Idx = (explorerState && (explorerState as any).n3Idx !== undefined) ? (explorerState as any).n3Idx : localExplorerState.n3Idx;

        const setSelectedCatIdx = (idx: number | null) => {
            const newState = { catIdx: idx, subIdx: null, n1Idx: null, n2Idx: null, n3Idx: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedSubIdx = (idx: number | null) => {
            const newState = { catIdx: selectedCatIdx, subIdx: idx, n1Idx: null, n2Idx: null, n3Idx: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedN1Idx = (idx: number | null) => {
            const newState = { catIdx: selectedCatIdx, subIdx: selectedSubIdx, n1Idx: idx, n2Idx: null, n3Idx: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedN2Idx = (idx: number | null) => {
            const newState = { catIdx: selectedCatIdx, subIdx: selectedSubIdx, n1Idx: selectedN1Idx, n2Idx: idx, n3Idx: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedN3Idx = (idx: number | null) => {
            const newState = { catIdx: selectedCatIdx, subIdx: selectedSubIdx, n1Idx: selectedN1Idx, n2Idx: selectedN2Idx, n3Idx: idx };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };

        const activeCategory = selectedCatIdx !== null ? groupedData[selectedCatIdx] : null;
        const activeSubcategory = (activeCategory && selectedSubIdx !== null)
            ? activeCategory.subcategories[selectedSubIdx]
            : null;
        const activeN1 = (activeSubcategory && selectedN1Idx !== null)
            ? activeSubcategory.name1s[selectedN1Idx]
            : null;
        const activeN2 = (activeN1 && selectedN2Idx !== null)
            ? activeN1.name2s[selectedN2Idx]
            : null;

        const filteredProcedures = useMemo(() => {
            if (!searchTerm.trim()) return null;
            const results: any[] = [];
            const term = searchTerm.toLowerCase();

            groupedData.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.jobs.forEach(job => {
                        if (
                          job.name.toLowerCase().includes(term) ||
                          (job.name2 && job.name2.toLowerCase().includes(term)) ||
                          (job.name3 && job.name3.toLowerCase().includes(term))
                        ) {
                            results.push({
                                category: cat.name,
                                subcategory: sub.name,
                                ...job
                            });
                        }
                    });
                });
            });
            return results;
        }, [searchTerm]);

        const handleSubmit = async (formData: any) => {
            try {
                setFormLoading(true);
                const treatments = formData.treatments || {};

                // 1. Define Helper Function
                const getQuadrantInfo = (tId: string) => {
                    const id = parseInt(tId);
                    if (isNaN(id)) return { position: "general", side: "general" };
                    if ((id >= 11 && id <= 18)) return { position: "upper", side: "right" };
                    if ((id >= 21 && id <= 28)) return { position: "upper", side: "left" };
                    if ((id >= 31 && id <= 38)) return { position: "lower", side: "left" };
                    if ((id >= 41 && id <= 48)) return { position: "lower", side: "right" };
                    if ((id >= 51 && id <= 55)) return { position: "upper", side: "right" };
                    if ((id >= 61 && id <= 65)) return { position: "upper", side: "left" };
                    if ((id >= 71 && id <= 75)) return { position: "lower", side: "left" };
                    if ((id >= 81 && id <= 85)) return { position: "lower", side: "right" };
                    return { position: "general", side: "general" };
                };

                // 2. Map save promises directly from the selected teeth
                const savePromises = teeth.map(async (activeTooth) => {
                    const toothId = String(activeTooth.id);
                    
                    // Fallback for single selection mode keys
                    let rawValues = treatments[toothId];
                    if (!rawValues && teeth.length === 1) {
                        const firstKey = Object.keys(treatments)[0];
                        if (firstKey) rawValues = treatments[firstKey];
                    }

                    const values = replaceLabelValueObjects(rawValues || {});

                    // Mandatory content check
                    if (!values.treatmentCode && !values.notes?.trim() && !values.complaintType && !values.doctor) return null;

                    const quadrant = getQuadrantInfo(toothId);
                    const position = activeTooth.position || quadrant.position;
                    const side = activeTooth.side || quadrant.side;

                    const payload: any = {
                        patient: values.patient?.value || values.patient,
                        doctor: values.doctor?.value || values.doctor,
                        examiningDoctor: values.examiningDoctor?.value || values.examiningDoctor,
                        company: patientDetails?.company?._id || patientDetails?.company,
                        tooth: toothId,
                        toothNotation: notation,
                        dentitionType: dentitionType || editData?.dentitionType || (parseInt(toothId) >= 51 ? "child" : "adult"),
                        position: position,
                        side: side,
                        treatmentDate: sessionDate || new Date().toISOString().split("T")[0],
                        notes: String(values.notes || ""),
                        treatmentPlan: values.treatmentCode || "",
                        status: values.status === "Planned" ? "pending" : (values.status || "pending"),
                        estimateMin: Number(values.estimateMin) || 0,
                        estimateMax: Number(values.estimateMax) || 0,
                        discount: Number(values.discount) || 0,
                        totalMin: Number(values.totalMin) || 0,
                        totalMax: Number(values.totalMax) || 0,
                        complaintType: values.complaintType || "CHIEF COMPLAINT",
                        recordType: toothId === "General" ? "note" : "tooth",
                        user: stores.auth.user?._id
                    };

                    const isEditingThisTooth = editData?._id && (
                        (typeof editData.tooth === 'object' && String(editData.tooth.fdi) === String(toothId)) ||
                        (typeof editData.tooth === 'string' && String(editData.tooth) === String(toothId))
                    );

                    if (isEditingThisTooth) {
                        payload.treatmentId = editData._id;
                        return updateToothTreatment(payload);
                    } else {
                        return createToothTreatment(payload);
                    }
                });

                const results = (await Promise.all(savePromises)).filter(r => r !== null);

                setFormLoading(false);
                if (results.length > 0) {
                    // Sync Examining Doctor
                    const firstProc = results[0]?.data || results[0];
                    if (firstProc?.examiningDoctor && setLastExaminingDoctor) {
                        setLastExaminingDoctor(firstProc.examiningDoctor);
                    }

                    toast({
                        title: "Diagnostic Recorded",
                        description: `Successfully synchronized ${results.length} record(s).`,
                        status: "success",
                        duration: 3000,
                    });
                    onSuccess();
                } else {
                    toast({ title: "No clinical data recorded", status: "info" });
                }
            } catch (err: any) {
                setFormLoading(false);
                toast({
                    title: "Synchronization Failed",
                    description: err?.message || "Internal Server Error",
                    status: "error",
                });
            }
        };

        const doctorOptions = useMemo(() => {
            return doctors.map((d) => ({
                label: d.name,
                value: d._id,
            }));
        }, [doctors]);

        const calculateTotal = (est: any, disc: any) => {
            const e = Number(est) || 0;
            const d = Number(disc) || 0;
            return Math.max(0, e - d);
        };

        const COMPLAINT_STYLES: Record<string, { border: string, bg: string, label: string, iconColor: string }> = {
            "CHIEF COMPLAINT": { border: "red.500", bg: "red.50", label: "CHIEF COMPLAINT", iconColor: "red.500" },
            "OTHER FINDING": { border: "orange.400", bg: "orange.50", label: "OTHER FINDING", iconColor: "orange.400" },
            "EXISTING FINDING": { border: "green.400", bg: "green.50", label: "EXISTING", iconColor: "green.400" },
            "default": { border: "blue.500", bg: "blue.50", label: "CLINICAL OBSERVATION", iconColor: "blue.500" }
        };

        const renderClinicalFields = (activeId: string | "bulk", values: any, setFieldValue: any) => {
            const currentToothId = activeId === "bulk" ? teeth[0].id : activeId;
            const currentValues = values.treatments[currentToothId] || initialFormData;

            const activeTooth = teeth.find(t => t.id === currentToothId);
            const notationLabel = !activeTooth ? "" : (notation === 'universal' ? activeTooth.universal : (notation === 'palmer' ? activeTooth.palmer : activeTooth.fdi));

            return (
                <VStack align="stretch" spacing={10}>
                    <Box mb={-4}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="10px" fontWeight="1000" color="blue.500" textTransform="uppercase">
                                {currentToothId === "General" ? "Clinical Record Type" : `Working on ${notation?.toUpperCase() || 'FDI'} Tooth ${notationLabel}`}
                            </Text>
                            <Heading size="md" color="gray.800" fontWeight="1000">
                                {activeTooth?.name || "General Clinical Record"}
                            </Heading>
                        </VStack>
                        <Divider mt={4} />
                    </Box>

                    {/* 1. Complaint Type - SEPARATE ROW */}
                    <VStack align="start" spacing={3}>
                        <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">1. COMPLAINT TYPE</Text>
                        <HStack bg="gray.50" p={1.5} borderRadius="xl" w="full" spacing={3} border="1px solid" borderColor="gray.100">
                            {["CHIEF COMPLAINT", "OTHER FINDING", "EXISTING FINDING"].map((type) => {
                                const isActive = currentValues.complaintType === type;
                                const getStyles = () => {
                                    switch (type) {
                                        case "CHIEF COMPLAINT": return { bg: "red.500", color: "white" };
                                        case "OTHER FINDING": return { bg: "orange.400", color: "white" };
                                        case "EXISTING FINDING": return { bg: "green.500", color: "white" };
                                        default: return { bg: "transparent", color: "gray.600" };
                                    }
                                };
                                const styles = isActive ? getStyles() : { bg: "white", color: "gray.500" };

                                return (
                                    <Button
                                        key={type}
                                        flex={1}
                                        size="md"
                                        h="44px"
                                        fontSize="10px"
                                        fontWeight="1000"
                                        borderRadius="xl"
                                        bg={styles.bg}
                                        color={styles.color}
                                        boxShadow={isActive ? "md" : "sm"}
                                        onClick={() => {
                                            if (activeId === "bulk") {
                                                teeth.forEach(t => setFieldValue(`treatments.${t.id}.complaintType`, type));
                                            } else {
                                                setFieldValue(`treatments.${activeId}.complaintType`, type);
                                            }
                                        }}
                                        _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                                        transition="all 0.2s"
                                    >
                                        {type}
                                    </Button>
                                );
                            })}
                        </HStack>
                    </VStack>

                    {/* 2 & 3. Doctors - SAME ROW */}
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                        <VStack align="start" spacing={2} w="full">
                            <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">2. ASSIGN DOCTOR</Text>
                            <CustomInput
                                name={activeId === "bulk" ? `bulk.doctor` : `treatments.${activeId}.doctor`}
                                type="real-time-user-search"
                                query={{ type: 'doctor' }}
                                options={doctorOptions}
                                value={currentValues.doctor}
                                onChange={(val: any) => {
                                    if (activeId === "bulk") {
                                        teeth.forEach(t => setFieldValue(`treatments.${t.id}.doctor`, val));
                                    } else {
                                        setFieldValue(`treatments.${activeId}.doctor`, val);
                                    }
                                }}
                                style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                            />
                        </VStack>

                        <VStack align="start" spacing={2} w="full">
                            <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">3. EXAMINING DOCTOR</Text>
                            <CustomInput
                                name={activeId === "bulk" ? `bulk.examiningDoctor` : `treatments.${activeId}.examiningDoctor`}
                                type="real-time-user-search"
                                query={{ type: 'doctor' }}
                                options={doctorOptions}
                                value={currentValues.examiningDoctor}
                                onChange={(val: any) => {
                                    if (activeId === "bulk") {
                                        teeth.forEach(t => setFieldValue(`treatments.${t.id}.examiningDoctor`, val));
                                    } else {
                                        setFieldValue(`treatments.${activeId}.examiningDoctor`, val);
                                    }
                                }}
                                style={{ height: '50px', borderRadius: '16px', fontSize: '14px', width: '100%' }}
                            />
                        </VStack>
                    </Grid>

                    {/* 4. Clinical Observation - SEPARATE ROW */}
                    <VStack align="start" spacing={2} w="full">
                        <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">4. CLINICAL OBSERVATION</Text>
                        <CustomInput
                            name={activeId === "bulk" ? `bulk.notes` : `treatments.${activeId}.notes`}
                            type="textarea"
                            placeholder="Enter detailed documentation regarding symptoms, findings, or patient concerns..."
                            value={currentValues.notes}
                            onChange={(e: any) => {
                                const val = e.target.value;
                                if (activeId === "bulk") {
                                    teeth.forEach(t => setFieldValue(`treatments.${t.id}.notes`, val));
                                } else {
                                    setFieldValue(`treatments.${activeId}.notes`, val);
                                }
                            }}
                            style={{ minHeight: "130px", background: "gray.50", border: '1px solid', borderColor: 'gray.100', borderRadius: '24px', padding: '20px', fontSize: '14px' }}
                        />
                    </VStack>

                    {/* 5. Financial - SEPARATE ROW */}
                    <VStack align="stretch" spacing={5} p={6} bg="blue.50/30" borderRadius="3xl" border="1px solid" borderColor="blue.100">
                        <Text fontSize="10px" fontWeight="1000" color="blue.500" letterSpacing="0.2em">5. FINANCIAL ESTIMATES</Text>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="9px" fontWeight="1000" color="gray.500">Minimum Estimate (₹)</Text>
                                <Input
                                    size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px"
                                    value={currentValues.estimateMin || 0}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (activeId === "bulk") {
                                            teeth.forEach(t => {
                                                setFieldValue(`treatments.${t.id}.estimateMin`, val);
                                                setFieldValue(`treatments.${t.id}.totalMin`, calculateTotal(val, values.treatments[t.id].discount));
                                            });
                                        } else {
                                            setFieldValue(`treatments.${activeId}.estimateMin`, val);
                                            setFieldValue(`treatments.${activeId}.totalMin`, calculateTotal(val, values.treatments[activeId].discount));
                                        }
                                    }}
                                />
                            </VStack>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="9px" fontWeight="1000" color="gray.500">Maximum Estimate(₹)</Text>
                                <Input
                                    size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px"
                                    value={currentValues.estimateMax || 0}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (activeId === "bulk") {
                                            teeth.forEach(t => {
                                                setFieldValue(`treatments.${t.id}.estimateMax`, val);
                                                setFieldValue(`treatments.${t.id}.totalMax`, calculateTotal(val, values.treatments[t.id].discount));
                                            });
                                        } else {
                                            setFieldValue(`treatments.${activeId}.estimateMax`, val);
                                            setFieldValue(`treatments.${activeId}.totalMax`, calculateTotal(val, values.treatments[activeId].discount));
                                        }
                                    }}
                                />
                            </VStack>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="9px" fontWeight="1000" color="green.500">DISCOUNT (₹)</Text>
                                <Input
                                    size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="50px" color="green.600"
                                    value={currentValues.discount || 0}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (activeId === "bulk") {
                                            teeth.forEach(t => {
                                                setFieldValue(`treatments.${t.id}.discount`, val);
                                                setFieldValue(`treatments.${t.id}.totalMin`, calculateTotal(values.treatments[t.id].estimateMin, val));
                                                setFieldValue(`treatments.${t.id}.totalMax`, calculateTotal(values.treatments[t.id].estimateMax, val));
                                            });
                                        } else {
                                            setFieldValue(`treatments.${activeId}.discount`, val);
                                            setFieldValue(`treatments.${activeId}.totalMin`, calculateTotal(values.treatments[activeId].estimateMin, val));
                                            setFieldValue(`treatments.${activeId}.totalMax`, calculateTotal(values.treatments[activeId].estimateMax, val));
                                        }
                                    }}
                                />
                            </VStack>
                        </Grid>
                        <HStack pt={4} borderTop="1px dashed" borderColor="blue.200" justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="10px" fontWeight="1000" color="blue.400">TOTAL QUOTATION</Text>
                                <Text fontSize="22px" fontWeight="1000" color="blue.800">
                                    ₹{Math.round(currentValues.totalMin || 0).toLocaleString()} - ₹{Math.round(currentValues.totalMax || 0).toLocaleString()}
                                </Text>
                            </VStack>
                            <Icon as={FiActivity} color="blue.200" boxSize={8} />
                        </HStack>
                    </VStack>

                    {/* 6. Treatment Code - SEPARATE ROW */}
                    <VStack align="start" spacing={3} w="full">
                        <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">6. TREATMENT CODE</Text>
                        <Button
                            w="full"
                            h="80px"
                            variant="outline"
                            colorScheme="blue"
                            borderStyle="dashed"
                            borderWidth="2px"
                            borderRadius="3xl"
                            onClick={onProcedureOpen}
                            leftIcon={<Icon as={FiPlusCircle} boxSize={5} />}
                            fontSize="13px"
                            fontWeight="1000"
                            whiteSpace="normal"
                            textAlign="left"
                            px={8}
                        >
                            {currentValues.treatmentCode
                                ? "Update Selected Treatment Plan"
                                : "Assign Initial Treatment Plan"}
                        </Button>
                        {currentValues.treatmentCode && (
                            <Box p={5} bg="blue.50" borderRadius="2xl" w="full" borderLeft="6px solid" borderColor="blue.500">
                                <Text fontSize="14px" fontWeight="1000" color="blue.800" noOfLines={2}>
                                    {currentValues.treatmentCode.split(" → ").pop()}
                                </Text>
                                <Text fontSize="11px" color="blue.400" noOfLines={1} mt={1}>{currentValues.treatmentCode.split(" → ").slice(0, 2).join(" • ")}</Text>
                            </Box>
                        )}
                    </VStack>
                </VStack>
            );
        };

        const initialTreatments = useMemo(() => {
            const trs: Record<string, any> = {};
            teeth.forEach(t => {
                trs[t.id] = {
                    ...initialFormData,
                    patient: { label: `${patientDetails?.name}`, value: patientDetails?._id },
                    notes: generalDescription,
                    doctor: lastExaminingDoctor || undefined,
                    examiningDoctor: lastExaminingDoctor || undefined,
                    complaintType: toothComplaints[t.id] || complaintType || "CHIEF COMPLAINT",
                };
            });

            // If editing, override with saved data.
            // We use the record ID to stabilize this calculation.
            if (editData?._id) {
                const dataTooth = editData.tooth;
                const actualToothId = typeof dataTooth === 'object' ? dataTooth.fdi : dataTooth;

                // Find matching tooth in current array
                const targetTooth = teeth.find(t => t.id === actualToothId || t.fdi === actualToothId);
                const toothKey = targetTooth ? targetTooth.id : actualToothId;

                if (toothKey) {
                    trs[toothKey] = {
                        ...(trs[toothKey] || { ...initialFormData }),
                        treatmentCode: editData.treatmentPlan,
                        notes: editData.notes,
                        estimateMin: editData.estimateMin || 0,
                        estimateMax: editData.estimateMax || 0,
                        discount: editData.discount || 0,
                        totalMin: editData.totalMin || 0,
                        totalMax: editData.totalMax || 0,
                        doctor: editData.doctor ? (typeof editData.doctor === 'object' ? { label: editData.doctor.name, value: editData.doctor._id } : editData.doctor) : (lastExaminingDoctor || undefined),
                        complaintType: editData.complaintType || "Chief Complaint",
                        examiningDoctor: editData.examiningDoctor ? (typeof editData.examiningDoctor === 'object' ? { label: editData.examiningDoctor.name, value: editData.examiningDoctor._id } : editData.examiningDoctor) : (lastExaminingDoctor || undefined),
                    };
                }
            }
            return trs;
        }, [teeth, patientDetails?._id, editData?._id, lastExaminingDoctor]);

        return (
            <Formik
                initialValues={{
                    treatments: { ...initialTreatments, ...(hoistedValues?.treatments || {}) },
                }}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, handleSubmit }: any) => {
                    
                    // Auto-expand explorer based on existing treatment code when editing
                    useEffect(() => {
                        const currentId = editData?._id || editData?.id || null;

                        // Only sync if the record has actually changed to avoid overriding user interaction
                        if (currentId !== lastSyncedId.current) {
                            lastSyncedId.current = currentId;

                            if (editData?.treatmentPlan) {
                                const parts = editData.treatmentPlan.split(" → ").map(p => p.trim());
                                let newCatIdx: number | null = null;
                                let newSubIdx: number | null = null;
                                let newN1Idx: number | null = null;
                                let newN2Idx: number | null = null;
                                let newN3Idx: number | null = null;

                                if (parts.length >= 1) {
                                    const cIdx = groupedData.findIndex(c => c.name.toLowerCase() === parts[0].toLowerCase());
                                    if (cIdx !== -1) {
                                        newCatIdx = cIdx;
                                        if (parts.length >= 2) {
                                            const subCats = groupedData[cIdx].subcategories;
                                            const sIdx = subCats.findIndex(s => s.name.toLowerCase() === parts[1].toLowerCase());
                                            if (sIdx !== -1) {
                                                newSubIdx = sIdx;
                                                if (parts.length >= 3) {
                                                    const n1s = subCats[sIdx]?.name1s;
                                                    const n1Idx = n1s?.findIndex((n: any) => n.name.toLowerCase() === parts[2].toLowerCase());
                                                    if (n1Idx !== undefined && n1Idx !== -1) {
                                                        newN1Idx = n1Idx;
                                                        if (parts.length >= 4) {
                                                            const n2s = n1s[n1Idx]?.name2s;
                                                            const n2Idx = n2s?.findIndex((n: any) => n.name.toLowerCase() === parts[3].toLowerCase());
                                                            if (n2Idx !== undefined && n2Idx !== -1) {
                                                                newN2Idx = n2Idx;
                                                                if (parts.length >= 5) {
                                                                    const n3s = n2s[n2Idx]?.name3s;
                                                                    const n3Idx = n3s?.findIndex((n: any) => n.name.toLowerCase() === parts[4].toLowerCase());
                                                                    if (n3Idx !== undefined && n3Idx !== -1) {
                                                                        newN3Idx = n3Idx;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                setLocalExplorerState({ 
                                    catIdx: newCatIdx, 
                                    subIdx: newSubIdx, 
                                    n1Idx: newN1Idx, 
                                    n2Idx: newN2Idx, 
                                    n3Idx: newN3Idx 
                                });
                            } else {
                                setLocalExplorerState({ catIdx: null, subIdx: null, n1Idx: null, n2Idx: null, n3Idx: null });
                            }
                        }
                    }, [editData, groupedData, activeToothId, values.treatments]);

                    const currentStep = values.treatmentCode ? 2 : (teeth.length > 0 ? 1 : 0);

                    const groupTeethByQuadrant = (selectedTeeth: ToothData[]) => {
                        const quads: Record<string, ToothData[]> = { "UR": [], "UL": [], "LR": [], "LL": [], "General": [] };
                        selectedTeeth.forEach(t => {
                            const id = parseInt(t.id);
                            if (isNaN(id)) quads["General"].push(t);
                            // Adult (11-48) & Child (51-85)
                            else if ((id >= 11 && id <= 18) || (id >= 51 && id <= 55)) quads["UR"].push(t);
                            else if ((id >= 21 && id <= 28) || (id >= 61 && id <= 65)) quads["UL"].push(t);
                            else if ((id >= 31 && id <= 38) || (id >= 71 && id <= 75)) quads["LL"].push(t);
                            else if ((id >= 41 && id <= 48) || (id >= 81 && id <= 85)) quads["LR"].push(t);
                            else quads["General"].push(t);
                        });
                        return quads;
                    };

                    const quadrants = groupTeethByQuadrant(teeth);

                    return (
                        <FormikForm onSubmit={handleSubmit} style={{ minHeight: '100%' }}>
                            {/* Hidden synchronization component */}
                            <FormValueSyncer values={values} onValuesUpdate={onValuesUpdate} />


                            <CustomDrawer
                                open={isProcedureOpen}
                                close={onProcedureClose}
                                title="Treatment Head Code"
                                width="70vw"
                            >
                                <Box h="full" overflow="hidden" p={6}>
                                    <VStack align="stretch" spacing={5} h="full">

                                        <Box
                                            borderRadius="xl"
                                            border="1px solid"
                                            borderColor="gray.100"
                                            overflow="hidden"
                                            bg="rgba(255, 255, 255, 0.7)"
                                            backdropFilter="blur(10px)"
                                            boxShadow="sm"
                                            position="relative"
                                            h="600px"
                                        >
                                            {searchTerm.trim() ? (
                                                <Box h="full" overflowY="auto" p={5} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                    <VStack align="stretch" spacing={2.5}>
                                                        {filteredProcedures?.map((proc) => {
                                                            let fullCode = `${proc.category} → ${proc.subcategory} → ${proc.name}`;
                                                            if (proc.name2 && proc.name2 !== "None") fullCode += ` → ${proc.name2}`;
                                                            if (proc.name3 && proc.name3 !== "None") fullCode += ` → ${proc.name3}`;
                                                            const isSelected = activeToothId === "bulk"
                                                                ? teeth.every(t => values.treatments[t.id]?.treatmentCode === fullCode)
                                                                : (activeToothId && values.treatments[activeToothId]?.treatmentCode === fullCode);
                                                            return (
                                                                <HStack
                                                                    key={fullCode}
                                                                    p={4}
                                                                    bg={isSelected ? "blue.600" : "white"}
                                                                    color={isSelected ? "white" : "gray.800"}
                                                                    borderRadius="xl"
                                                                    cursor="pointer"
                                                                    onClick={() => {
                                                                        if (activeToothId === "bulk") {
                                                                            teeth.forEach(t => {
                                                                                setFieldValue(`treatments.${t.id}.treatmentCode`, fullCode);
                                                                            });
                                                                        } else if (activeToothId) {
                                                                            setFieldValue(`treatments.${activeToothId}.treatmentCode`, fullCode);
                                                                        }
                                                                        onProcedureClose();
                                                                    }}
                                                                    _hover={isSelected ? {} : { transform: "translateX(4px)", bg: "blue.50/30" }}
                                                                    transition="all 0.2s"
                                                                    justify="space-between"
                                                                    border="1px solid"
                                                                    borderColor={isSelected ? "blue.600" : "gray.100"}
                                                                >
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text fontSize="10px" fontWeight="900" color={isSelected ? "blue.100" : "blue.500"} letterSpacing="0.1em">
                                                                            {proc.category.toUpperCase()} • {proc.subcategory.toUpperCase()}
                                                                        </Text>
                                                                        <Text fontSize="12px" fontWeight="900" letterSpacing="tight">
                                                                            {proc.name}
                                                                            {proc.name2 && ` • ${proc.name2}`}
                                                                            {proc.name3 && ` • ${proc.name3}`}
                                                                        </Text>
                                                                    </VStack>
                                                                    <Badge p={2} borderRadius="md" variant={isSelected ? "solid" : "subtle"} colorScheme={isSelected ? "whiteAlpha" : "blue"} fontSize="12px" fontWeight="900">
                                                                        ₹{proc.defaultEstimate.toLocaleString()}
                                                                    </Badge>
                                                                </HStack>
                                                            );
                                                        })}
                                                    </VStack>
                                                </Box>
                                            ) : (
                                                <Grid templateColumns="1fr 1fr 1fr 1fr 1fr" h="full">
                                                    <Box borderRight="1px solid" borderColor="gray.100" h="600px">
                                                        <VStack spacing={0} align="stretch" overflowY="auto" h="full" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' } }}>
                                                            {groupedData.map((cat, idx) => (
                                                                <Box
                                                                    key={cat.name}
                                                                    px={5} py={4}
                                                                    cursor="pointer"
                                                                    bg={selectedCatIdx === idx ? "blue.50/50" : "transparent"}
                                                                    color={selectedCatIdx === idx ? "blue.600" : "gray.500"}
                                                                    onClick={() => {
                                                                        setSelectedCatIdx(idx);
                                                                    }}
                                                                    _hover={{ bg: "blue.50/20" }}
                                                                >
                                                                    <HStack spacing={3}>
                                                                        <Icon as={CATEGORY_ICONS[cat.name] || FiActivity} boxSize={3} />
                                                                        <Text fontSize="11px" fontWeight="900" letterSpacing="widest">{cat.name.toUpperCase()}</Text>
                                                                    </HStack>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    </Box>
                                                    <Box borderRight="1px solid" borderColor="gray.100" h="600px">
                                                        <VStack spacing={0} align="stretch" overflowY="auto" h="full" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' } }}>
                                                            {activeCategory?.subcategories.map((sub, idx) => (
                                                                <Box
                                                                    key={sub.name}
                                                                    px={6} py={4}
                                                                    cursor="pointer"
                                                                    bg={selectedSubIdx === idx ? "blue.50/50" : "transparent"}
                                                                    color={selectedSubIdx === idx ? "blue.600" : "gray.500"}
                                                                    onClick={() => {
                                                                        setSelectedSubIdx(idx);
                                                                    }}
                                                                >
                                                                    <Text fontSize="11px" fontWeight="900" letterSpacing="widest">{sub.name.toUpperCase()}</Text>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    </Box>
                                                    <Box borderRight="1px solid" borderColor="gray.100" h="600px">
                                                        <VStack spacing={0} align="stretch" overflowY="auto" h="full" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' } }}>
                                                            {activeSubcategory?.name1s?.map((n1: any, idx) => (
                                                                <Box
                                                                    key={n1.name}
                                                                    px={6} py={5}
                                                                    cursor="pointer"
                                                                    bg={selectedN1Idx === idx ? "blue.50" : "white"}
                                                                    color={selectedN1Idx === idx ? "blue.600" : "gray.600"}
                                                                    onClick={() => setSelectedN1Idx(idx)}
                                                                    _hover={{ bg: "gray.50" }}
                                                                    borderBottom="1px solid"
                                                                    borderColor="gray.100"
                                                                >
                                                                    <Text fontSize="12px" fontWeight="900">{n1.name.toUpperCase()}</Text>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    </Box>

                                                    <Box borderRight="1px solid" borderColor="gray.100" h="600px">
                                                        <VStack spacing={0} align="stretch" overflowY="auto" h="full" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' } }}>
                                                            {activeN1?.name2s?.map((n2: any, idx) => (
                                                                <Box
                                                                    key={n2.name}
                                                                    px={6} py={5}
                                                                    cursor="pointer"
                                                                    bg={selectedN2Idx === idx ? "blue.50" : "white"}
                                                                    color={selectedN2Idx === idx ? "blue.600" : "gray.600"}
                                                                    onClick={() => setSelectedN2Idx(idx)}
                                                                    _hover={{ bg: "gray.50" }}
                                                                    borderBottom="1px solid"
                                                                    borderColor="gray.100"
                                                                >
                                                                    <Text fontSize="12px" fontWeight="700">{n2.name.toUpperCase()}</Text>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    </Box>

                                                    <Box h="600px" bg="gray.50/30">
                                                        <VStack spacing={0} align="stretch" overflowY="auto" h="full" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' } }}>
                                                            {activeN2?.name3s?.map((n3: any, idx) => {
                                                                const proc = n3.procedure;
                                                                let fullCode = `${proc.category} → ${proc.subcategory} → ${proc.name}`;
                                                                if (proc.name2 && proc.name2 !== "None") fullCode += ` → ${proc.name2}`;
                                                                if (proc.name3 && proc.name3 !== "None") fullCode += ` → ${proc.name3}`;

                                                                const isSelected = activeToothId === "bulk"
                                                                    ? teeth.every(t => values.treatments[t.id]?.treatmentCode === fullCode)
                                                                    : (activeToothId && values.treatments[activeToothId]?.treatmentCode === fullCode);

                                                                return (
                                                                    <Box
                                                                        key={n3.name}
                                                                        px={6} py={5}
                                                                        cursor="pointer"
                                                                        bg={isSelected ? "blue.600" : (selectedN3Idx === idx ? "blue.50" : "white")}
                                                                        color={isSelected ? "white" : (selectedN3Idx === idx ? "blue.600" : "gray.600")}
                                                                        onClick={() => {
                                                                            setSelectedN3Idx(idx);
                                                                            if (activeToothId === "bulk") {
                                                                                teeth.forEach(t => {
                                                                                    setFieldValue(`treatments.${t.id}.treatmentCode`, fullCode);
                                                                                });
                                                                            } else if (activeToothId) {
                                                                                setFieldValue(`treatments.${activeToothId}.treatmentCode`, fullCode);
                                                                            }
                                                                        }}
                                                                        _hover={{ bg: isSelected ? "blue.700" : "gray.50" }}
                                                                        borderBottom="1px solid"
                                                                        borderColor="gray.100"
                                                                    >
                                                                        <Text fontSize="12px" fontWeight="700">{n3.name.toUpperCase()}</Text>
                                                                    </Box>
                                                                );
                                                            })}
                                                        </VStack>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Box>
                                        <Button colorScheme="blue" onClick={onProcedureClose} w="full" borderRadius="xl">Close Explorer</Button>
                                    </VStack>
                                </Box>
                            </CustomDrawer>



                            <VStack align="stretch" spacing={isDrawerMode ? 4 : 8} minH={isDrawerMode ? "auto" : "700px"} h={isDrawerMode ? "auto" : "calc(100vh - 280px)"}>
                                {!isDrawerMode && (
                                    <HStack justify="space-between" align="center">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em">PHASE 2</Text>
                                            <Heading size="lg" fontWeight="900" color="gray.800">Selected Teeth Overview</Heading>
                                        </VStack>
                                        <HStack spacing={4}>
                                            {teeth.length > 1 && (
                                                <Button
                                                    leftIcon={<FiLayers />}
                                                    variant="outline"
                                                    colorScheme="blue"
                                                    borderRadius="xl"
                                                    fontWeight="900"
                                                    onClick={() => { setActiveToothId("bulk"); onDetailOpen(); }}
                                                >
                                                    Bulk Edit All
                                                </Button>
                                            )}
                                            <Button
                                                colorScheme="blue"
                                                type="submit"
                                                isLoading={formLoading}
                                                borderRadius="xl"
                                                fontWeight="900"
                                                leftIcon={<FiSave />}
                                                px={8}
                                            >
                                                Save All Treatments
                                            </Button>
                                            <Button variant="ghost" leftIcon={<FiChevronRight style={{ transform: 'rotate(180deg)' }} />} onClick={onBack} fontWeight="900">Back</Button>
                                        </HStack>
                                    </HStack>
                                )}

                                {isDrawerMode ? (
                                    <Box p={2}>
                                        {activeToothId && renderClinicalFields(activeToothId, values, setFieldValue)}
                                    </Box>
                                ) : (
                                    <Box flex="1" overflowY="auto" pr={2} sx={{
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                                        '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' },
                                    }}>
                                        {teeth.length > 1 && (
                                            <Button
                                                variant="subtle"
                                                colorScheme="blue"
                                                w="full"
                                                mb={6}
                                                h="54px"
                                                borderRadius="2xl"
                                                leftIcon={<FiLayers />}
                                                onClick={() => { setActiveToothId("bulk"); onDetailOpen(); }}
                                                fontSize="xs"
                                                fontWeight="1000"
                                                letterSpacing="widest"
                                            >
                                                APPLY TREATMENT CODE TO ALL {teeth.length} SELECTIONS
                                            </Button>
                                        )}
                                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
                                            {teeth.map((tooth) => {
                                                const toothValues = values.treatments[tooth.id] || initialFormData;
                                                const complaint = toothValues.complaintType || "default";
                                                const style = COMPLAINT_STYLES[complaint] || COMPLAINT_STYLES.default;

                                                return (
                                                    <Box
                                                        key={tooth.id}
                                                        p={0}
                                                        bg="white"
                                                        borderRadius="2xl"
                                                        border="1px solid"
                                                        borderColor="gray.100"
                                                        boxShadow="sm"
                                                        cursor="pointer"
                                                        onClick={() => { setActiveToothId(tooth.id); onDetailOpen(); }}
                                                        _hover={{ transform: "translateY(-4px)", boxShadow: "xl", borderColor: style.border }}
                                                        transition="all 0.3s ease"
                                                        position="relative"
                                                        overflow="hidden"
                                                    >
                                                        {/* Premium Top Border Indicator */}
                                                        <Box h="4px" bg={style.border} w="full" position="absolute" top={0} />

                                                        <VStack align="stretch" spacing={0} p={4}>
                                                            <HStack justify="space-between" mb={3}>
                                                                <VStack align="start" spacing={0}>
                                                                    <HStack spacing={2}>
                                                                        <VStack align="start" spacing={0}>
                                                                            <Text fontSize="16px" fontWeight="1000" color="gray.800" letterSpacing="tight" noOfLines={1}>
                                                                                {tooth.name}
                                                                            </Text>
                                                                            <Text fontSize="10px" fontWeight="900" color="blue.500">
                                                                                {notation === 'universal' ? tooth.universal : (notation === 'palmer' ? tooth.palmer : tooth.fdi)} ({notation?.toUpperCase()})
                                                                            </Text>
                                                                        </VStack>
                                                                        <Badge variant="subtle" colorScheme={toothValues.treatmentCode ? "green" : "blue"} borderRadius="full" px={1.5} fontSize="8px" fontWeight="1000">
                                                                            {toothValues.treatmentCode ? "READY" : "PENDING"}
                                                                        </Badge>
                                                                    </HStack>
                                                                    <Text fontSize="9px" fontWeight="900" color={style.iconColor} letterSpacing="0.05em">{style.label}</Text>
                                                                </VStack>
                                                                <Circle size="32px" bg={style.bg} color={style.iconColor}>
                                                                    <Icon as={FiActivity} boxSize={4} />
                                                                </Circle>
                                                            </HStack>

                                                            {toothValues.treatmentCode ? (
                                                                <Box p={3} bg={style.bg} borderRadius="xl" border="1px solid" borderColor={`${style.border}20`}>
                                                                    <VStack align="start" spacing={0.5}>
                                                                        <Text fontSize="10px" fontWeight="1000" color={style.iconColor} noOfLines={1}>{toothValues.treatmentCode.split(" → ")[1]}</Text>
                                                                        <Text fontSize="11px" fontWeight="1000" color="gray.800" noOfLines={1}>
                                                                            {toothValues.treatmentCode.split(" → ").pop()}
                                                                        </Text>
                                                                        <HStack spacing={2} pt={1}>
                                                                            <Badge variant="solid" colorScheme="blue" fontSize="8px" borderRadius="md">
                                                                                ₹{toothValues.totalMin.toLocaleString()}
                                                                            </Badge>
                                                                            <Text fontSize="8px" color="gray.400" fontWeight="700">to</Text>
                                                                            <Badge variant="solid" colorScheme="blue" fontSize="8px" borderRadius="md">
                                                                                ₹{toothValues.totalMax.toLocaleString()}
                                                                            </Badge>
                                                                        </HStack>
                                                                    </VStack>
                                                                </Box>
                                                            ) : (
                                                                <VStack p={4} border="2px dashed" borderColor="gray.100" borderRadius="xl" spacing={1} bg="gray.50/30">
                                                                    <Icon as={FiLayers} color="gray.300" boxSize={4} />
                                                                    <Text fontSize="10px" color="gray.400" fontWeight="900">AWAITING</Text>
                                                                </VStack>
                                                            )}

                                                            <HStack pt={4} justify="space-between" align="center">
                                                                <HStack spacing={2}>
                                                                    <Avatar size="xs" name={toothValues.doctor?.label || "?"} bg={style.iconColor} p={0.5} border="1px solid white" />
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text fontSize="8px" fontWeight="900" color="gray.400">CLINICIAN</Text>
                                                                        <Text fontSize="10px" fontWeight="1000" color="gray.700" noOfLines={1}>{toothValues.doctor?.label || "Unassigned"}</Text>
                                                                    </VStack>
                                                                </HStack>
                                                                <Icon as={FiChevronRight} color="gray.300" boxSize={3} />
                                                            </HStack>
                                                        </VStack>
                                                    </Box>
                                                );
                                            })}
                                        </Grid>
                                    </Box>
                                )}
                                {isDrawerMode && (
                                    <Box borderTop="1px solid" borderColor="gray.100" pt={6} mt={6}>
                                        <Button
                                            colorScheme="blue"
                                            type="submit"
                                            isLoading={formLoading}
                                            borderRadius="xl"
                                            fontWeight="900"
                                            leftIcon={<FiSave />}
                                            w="full"
                                            h="54px"
                                        >
                                            Save Changes
                                        </Button>
                                    </Box>
                                )}
                            </VStack>

                            {!isDrawerMode && (
                                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl" scrollBehavior="inside">
                                    <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
                                    <ModalContent borderRadius="3xl" overflow="hidden">
                                        <ModalHeader p={6} borderBottom="1px solid" borderColor="gray.100">
                                            <HStack justify="space-between" align="start">
                                                <VStack align="start" spacing={3}>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em">CLINICAL ENTRY</Text>
                                                        <Heading size="md" fontWeight="1000">
                                                            {activeToothId === "bulk" ? "Multi-Tooth Update" : (activeToothId === "General" ? "General Clinical Record" : (teeth.find(t => t.id === activeToothId)?.name || `Tooth #${activeToothId} Details`))}
                                                        </Heading>
                                                    </VStack>
                                                    {/* Premium Selection Chips */}
                                                    {teeth.length > 1 && (
                                                        <HStack spacing={2.5} wrap="wrap" pt={1}>
                                                            {teeth.map(t => (
                                                                <HStack
                                                                    key={t.id}
                                                                    bg="white"
                                                                    px={3} py={1.5}
                                                                    borderRadius="2xl"
                                                                    border="1px solid"
                                                                    borderColor="blue.100"
                                                                    spacing={2}
                                                                    boxShadow="sm"
                                                                    _hover={{ borderColor: "blue.300", transform: "translateY(-1px)" }}
                                                                    transition="all 0.2s"
                                                                >
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text fontSize="8px" fontWeight="1000" color="blue.400" letterSpacing="0.1em">
                                                                            {notation?.toUpperCase() || "FDI"}
                                                                        </Text>
                                                                        <Text fontSize="12px" fontWeight="1000" color="gray.800" mt="-2px">

                                                                            {notation === 'universal' ? t.universal : (notation === 'palmer' ? t.palmer : t.fdi)}
                                                                        </Text>
                                                                    </VStack>
                                                                    {onRemoveTooth && (
                                                                        <Circle
                                                                            size="20px"
                                                                            bg="gray.50"
                                                                            cursor="pointer"
                                                                            _hover={{ bg: "red.50", color: "red.500" }}
                                                                            transition="all 0.2s"
                                                                            onClick={(e) => { e.stopPropagation(); onRemoveTooth(t.id); }}
                                                                        >
                                                                            <Icon as={FiX} boxSize={2.5} />
                                                                        </Circle>
                                                                    )}
                                                                </HStack>
                                                            ))}
                                                        </HStack>
                                                    )}

                                                </VStack>
                                                <Circle size="40px" bg="blue.50" color="blue.500">
                                                    <FiActivity />
                                                </Circle>
                                            </HStack>
                                        </ModalHeader>


                                        <ModalBody p={8}>
                                            {activeToothId && renderClinicalFields(activeToothId, values, setFieldValue)}
                                        </ModalBody>
                                        <ModalFooter borderTop="1px solid" borderColor="gray.50" p={6}>
                                            <HStack w="full" spacing={4}>
                                                {activeToothId !== "bulk" && teeth.findIndex(t => t.id === activeToothId) < teeth.length - 1 ? (
                                                    <Button colorScheme="blue" w="full" h="54px" borderRadius="2xl" fontWeight="900" rightIcon={<FiChevronRight />} onClick={() => {
                                                        const currentIndex = teeth.findIndex(t => t.id === activeToothId);
                                                        setActiveToothId(teeth[currentIndex + 1].id);
                                                    }}>
                                                        Next: {teeth[teeth.findIndex(t => t.id === activeToothId) + 1].name}
                                                    </Button>
                                                ) : (
                                                    <Button colorScheme="blue" w="full" h="54px" borderRadius="2xl" fontWeight="900" onClick={() => { onDetailClose(); setTimeout(() => handleSubmit(), 0); }}>
                                                        {activeToothId === "bulk" ? "Proceed to Individual Review" : "Finish Documentation"}
                                                    </Button>
                                                )}
                                            </HStack>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            )}
                        </FormikForm>
                    );
                }}
            </Formik>
        );
    }
);

// Helper component to sync Formik values to parent safely
const FormValueSyncer = ({ values, onValuesUpdate }: { values: any, onValuesUpdate?: (v: any) => void }) => {
    useEffect(() => {
        onValuesUpdate?.(values);
    }, [values, onValuesUpdate]);
    return null;
};

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
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
} from "@chakra-ui/react";
import CustomDrawer from "../../../Drawer/CustomDrawer";
import { keyframes } from "@emotion/react";
import { Formik, Form as FormikForm } from "formik";
import {
    FiChevronRight,
    FiCheckCircle,
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
    explorerState?: { category: string | null; subcategory: string | null };
    onExplorerUpdate?: (state: { category: string | null; subcategory: string | null }) => void;
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
        const [tempTreatmentCode, setTempTreatmentCode] = useState("");
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
            const companyId = patientDetails?.company?._id || patientDetails?.company;
            procedureStore.getProcedures(companyId ? { companyId } : {});
        }, [patientDetails]);

        const groupedData = useMemo(() => {
            const dbData = procedureStore.procedures.data;
            
            if (dbData && dbData.length > 0) {
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
            }

            return [];
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

        const [localExplorerState, setLocalExplorerState] = useState<{ category: string | null, subcategory: string | null, name1: string | null, name2: string | null, name3: string | null }>({ category: null, subcategory: null, name1: null, name2: null, name3: null });

        const lastSyncedId = useRef<string | null>(null);

        const selectedCategory = (explorerState && explorerState.category !== undefined) ? explorerState.category : localExplorerState.category;
        const selectedSubcategory = (explorerState && explorerState.subcategory !== undefined) ? explorerState.subcategory : localExplorerState.subcategory;
        const selectedName1 = (explorerState && (explorerState as any).name1 !== undefined) ? (explorerState as any).name1 : localExplorerState.name1;
        const selectedName2 = (explorerState && (explorerState as any).name2 !== undefined) ? (explorerState as any).name2 : localExplorerState.name2;
        const selectedName3 = (explorerState && (explorerState as any).name3 !== undefined) ? (explorerState as any).name3 : localExplorerState.name3;

        const setSelectedCategory = (name: string | null) => {
            const newState = { category: name, subcategory: null, name1: null, name2: null, name3: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedSubcategory = (name: string | null) => {
            const newState = { category: selectedCategory, subcategory: name, name1: null, name2: null, name3: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedName1 = (name: string | null) => {
            const newState = { category: selectedCategory, subcategory: selectedSubcategory, name1: name, name2: null, name3: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedName2 = (name: string | null) => {
            const newState = { category: selectedCategory, subcategory: selectedSubcategory, name1: selectedName1, name2: name, name3: null };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };
        const setSelectedName3 = (name: string | null) => {
            const newState = { category: selectedCategory, subcategory: selectedSubcategory, name1: selectedName1, name2: selectedName2, name3: name };
            if (onExplorerUpdate) onExplorerUpdate(newState as any);
            else setLocalExplorerState(newState);
        };

        const activeCategory = selectedCategory !== null ? (groupedData as any[]).find(c => c.name.toLowerCase().trim() === selectedCategory.toLowerCase().trim()) : null;
        const activeSubcategory = (activeCategory && selectedSubcategory !== null)
            ? (activeCategory.subcategories as any[]).find(s => s.name.toLowerCase().trim() === selectedSubcategory.toLowerCase().trim())
            : null;
        const activeN1 = (activeSubcategory && selectedName1 !== null)
            ? (activeSubcategory.name1s as any[]).find((n1: any) => n1.name.toLowerCase().trim() === selectedName1.toLowerCase().trim())
            : null;
        const activeN2 = (activeN1 && selectedName2 !== null)
            ? (activeN1.name2s as any[]).find((n2: any) => n2.name.toLowerCase().trim() === selectedName2.toLowerCase().trim())
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
                            <Text fontSize="10px" fontWeight="black" color="black" textTransform="uppercase">
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
                        <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">1. COMPLAINT TYPE</Text>
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
                            <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">2. ASSIGN DOCTOR</Text>
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
                            <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">3. EXAMINING DOCTOR</Text>
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
                        <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">4. CLINICAL OBSERVATION</Text>
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
                        <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.2em">5. FINANCIAL ESTIMATES</Text>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="9px" fontWeight="black" color="black">Minimum Estimate (₹)</Text>
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
                                <Text fontSize="9px" fontWeight="black" color="black">Maximum Estimate(₹)</Text>
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
                                <Text fontSize="9px" fontWeight="black" color="black">DISCOUNT (₹)</Text>
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
                                <Text fontSize="10px" fontWeight="black" color="black">TOTAL QUOTATION</Text>
                                <Text fontSize="22px" fontWeight="black" color="black">
                                    ₹{Math.round(currentValues.totalMin || 0).toLocaleString()} - ₹{Math.round(currentValues.totalMax || 0).toLocaleString()}
                                </Text>
                            </VStack>
                            <Icon as={FiActivity} color="blue.200" boxSize={8} />
                        </HStack>
                    </VStack>

                    {/* 6. Treatment Code - SEPARATE ROW */}
                    <VStack align="start" spacing={3} w="full">
                        <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">6. TREATMENT CODE</Text>
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
                                    {currentValues.treatmentCode.split(/→|->|·|\|/).pop()?.trim()}
                                </Text>
                                <Text fontSize="11px" color="blue.400" noOfLines={1} mt={1}>
                                    {(() => {
                                        const parts = currentValues.treatmentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                                        return parts.slice(0, -1).join(" · ");
                                    })()}
                                </Text>
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

                    // Sync explorer state and temp code when opening or switching teeth
                    useEffect(() => {
                        if (isProcedureOpen) {
                            const currentToothIdForCode = activeToothId === "bulk" ? (teeth[0]?.id || "") : (activeToothId || "");
                            const currentCode = values.treatments[currentToothIdForCode]?.treatmentCode || "";
                            setTempTreatmentCode(currentCode);

                            if (currentCode) {
                                const parts = currentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                                if (parts.length >= 1) {
                                    setLocalExplorerState({
                                        category: parts[0] || null,
                                        subcategory: parts[1] || null,
                                        name1: parts[2] || null,
                                        name2: parts[3] || null,
                                        name3: parts[4] || null
                                    });
                                }
                            } else {
                                setLocalExplorerState({ category: null, subcategory: null, name1: null, name2: null, name3: null });
                            }
                        }
                    }, [isProcedureOpen, editData, groupedData, activeToothId, values.treatments]);

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
                                title={
                                    <HStack spacing={3}>
                                        <Box p={2} bg="blue.500" borderRadius="lg" color="white">
                                            <FiActivity size={18} />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Heading size="sm" color="white">Procedure Explorer</Heading>
                                            <Text fontSize="10px" color="blue.100" fontWeight="bold">SELECT CLINICAL PROTOCOL</Text>
                                        </VStack>
                                    </HStack>
                                }
                                width="85vw"
                                extraActions={
                                    <Button
                                        type="button"
                                        colorScheme="blue"
                                        onClick={() => {
                                            if (activeToothId === "bulk") {
                                                teeth.forEach(t => {
                                                    setFieldValue(`treatments.${t.id}.treatmentCode`, tempTreatmentCode);
                                                });
                                            } else if (activeToothId) {
                                                setFieldValue(`treatments.${activeToothId}.treatmentCode`, tempTreatmentCode);
                                            }
                                            onProcedureClose();
                                        }}
                                        isDisabled={!tempTreatmentCode}
                                        leftIcon={<FiCheckCircle />}
                                        size="sm"
                                        borderRadius="full"
                                        px={6}
                                    >
                                        Save Selection
                                    </Button>
                                }
                            >
                                <VStack spacing={4} align="stretch" h="full" p={4}>
                                    <Box
                                        borderRadius="2xl"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        overflow="hidden"
                                        bg="white"
                                        flex={1}
                                        minH="500px"
                                    >
                                        <Grid templateColumns="1fr 1.2fr 1.2fr 1.2fr 1.5fr" h="full">
                                            {/* COLUMN 1: CATEGORY */}
                                            <Box borderRight="1px solid" borderColor="gray.100" bg="gray.50/30">
                                                <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="0.1em">Category</Text>
                                                </Box>
                                                <VStack spacing={0} align="stretch" overflowY="auto" h="calc(600px - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                    {groupedData.map((cat: any) => (
                                                        <HStack
                                                            key={cat.name}
                                                            px={4} py={3.5}
                                                            cursor="pointer"
                                                            onClick={() => {
                                                                setSelectedCategory(cat.name);
                                                                setTempTreatmentCode(cat.name);
                                                            }}
                                                            _hover={{ bg: "gray.50" }}
                                                            borderLeft={selectedCategory?.toLowerCase().trim() === cat.name.toLowerCase().trim() ? "4px solid" : "0px"}
                                                            borderLeftColor="blue.500"
                                                            bg={selectedCategory?.toLowerCase().trim() === cat.name.toLowerCase().trim() ? "blue.100" : "transparent"}
                                                            color={selectedCategory?.toLowerCase().trim() === cat.name.toLowerCase().trim() ? "blue.800" : "gray.600"}
                                                            justify="space-between"
                                                        >
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontSize="xs" fontWeight={selectedCategory?.toLowerCase().trim() === cat.name.toLowerCase().trim() ? "900" : "bold"}>{cat.name}</Text>
                                                                {tempTreatmentCode?.toLowerCase().trim() === cat.name.toLowerCase().trim() && <Badge colorScheme="blue" variant="solid" fontSize="8px">SELECTED</Badge>}
                                                            </VStack>
                                                            <FiChevronRight size={12} opacity={selectedCategory?.toLowerCase().trim() === cat.name.toLowerCase().trim() ? 1 : 0.3} />
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>

                                            {/* COLUMN 2: SUBCATEGORY */}
                                            <Box borderRight="1px solid" borderColor="gray.100">
                                                <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="0.1em">Subcategory</Text>
                                                </Box>
                                                <VStack spacing={0} align="stretch" overflowY="auto" h="calc(600px - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                    {(activeCategory?.subcategories || []).map((sub: any) => (
                                                        <HStack
                                                            key={sub.name}
                                                            px={4} py={3.5}
                                                            cursor="pointer"
                                                            onClick={() => {
                                                                setSelectedSubcategory(sub.name);
                                                                if (activeCategory) {
                                                                    setTempTreatmentCode(`${activeCategory.name} → ${sub.name}`);
                                                                }
                                                            }}
                                                            _hover={{ bg: "blue.50/50" }}
                                                            bg={selectedSubcategory?.toLowerCase().trim() === sub.name.toLowerCase().trim() ? "blue.100" : "transparent"}
                                                            color={selectedSubcategory?.toLowerCase().trim() === sub.name.toLowerCase().trim() ? "blue.800" : "gray.600"}
                                                            justify="space-between"
                                                        >
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontSize="xs" fontWeight={selectedSubcategory?.toLowerCase().trim() === sub.name.toLowerCase().trim() ? "900" : "bold"}>{sub.name}</Text>
                                                                {activeCategory && tempTreatmentCode?.toLowerCase().trim() === `${activeCategory.name} → ${sub.name}`.toLowerCase().trim() && (
                                                                    <Badge colorScheme="blue" variant="solid" fontSize="8px">SELECTED</Badge>
                                                                )}
                                                            </VStack>
                                                            <FiChevronRight size={12} opacity={selectedSubcategory?.toLowerCase().trim() === sub.name.toLowerCase().trim() ? 1 : 0.3} />
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>

                                            {/* COLUMN 3: NAME 1 */}
                                            <Box borderRight="1px solid" borderColor="gray.100" bg="gray.50/30">
                                                <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="0.1em">Name 1</Text>
                                                </Box>
                                                <VStack spacing={0} align="stretch" overflowY="auto" h="calc(600px - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                    {(activeSubcategory?.name1s || []).map((n1: any) => (
                                                        <HStack
                                                            key={n1.name}
                                                            px={4} py={3.5}
                                                            cursor="pointer"
                                                            bg={selectedName1 === n1.name ? "blue.100" : "transparent"}
                                                            color={selectedName1 === n1.name ? "blue.800" : "gray.600"}
                                                            onClick={() => {
                                                                setSelectedName1(n1.name);
                                                                if (activeCategory && activeSubcategory) {
                                                                    setTempTreatmentCode(`${activeCategory.name} → ${activeSubcategory.name} → ${n1.name}`);
                                                                }
                                                            }}
                                                            _hover={{ bg: "gray.50" }}
                                                            justify="space-between"
                                                        >
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontSize="xs" fontWeight={selectedName1 === n1.name ? "900" : "bold"}>{n1.name}</Text>
                                                                {activeCategory && activeSubcategory && tempTreatmentCode === `${activeCategory.name} → ${activeSubcategory.name} → ${n1.name}` && (
                                                                    <Badge colorScheme="blue" variant="solid" fontSize="8px">SELECTED</Badge>
                                                                )}
                                                            </VStack>
                                                            <FiChevronRight size={12} opacity={selectedName1 === n1.name ? 1 : 0.3} />
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>

                                            {/* COLUMN 4: NAME 2 */}
                                            <Box borderRight="1px solid" borderColor="gray.100">
                                                <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="10px" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="0.1em">Name 2</Text>
                                                </Box>
                                                <VStack spacing={0} align="stretch" overflowY="auto" h="calc(600px - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                    {(activeN1?.name2s || []).map((n2: any) => (
                                                        <HStack
                                                            key={n2.name}
                                                            px={4} py={3.5}
                                                            cursor="pointer"
                                                            bg={selectedName2 === n2.name ? "blue.100" : "transparent"}
                                                            color={selectedName2 === n2.name ? "blue.800" : "gray.600"}
                                                            onClick={() => {
                                                                setSelectedName2(n2.name);
                                                                if (activeCategory && activeSubcategory && activeN1) {
                                                                    setTempTreatmentCode(`${activeCategory.name} → ${activeSubcategory.name} → ${activeN1.name} → ${n2.name}`);
                                                                }
                                                            }}
                                                            _hover={{ bg: "gray.50" }}
                                                            justify="space-between"
                                                        >
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontSize="xs" fontWeight={selectedName2 === n2.name ? "900" : "bold"}>{n2.name}</Text>
                                                                {activeCategory && activeSubcategory && activeN1 && tempTreatmentCode === `${activeCategory.name} → ${activeSubcategory.name} → ${activeN1.name} → ${n2.name}` && (
                                                                    <Badge colorScheme="blue" variant="solid" fontSize="8px">SELECTED</Badge>
                                                                )}
                                                            </VStack>
                                                            <FiChevronRight size={12} opacity={selectedName2 === n2.name ? 1 : 0.3} />
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Box>

                                            {/* COLUMN 5: NAME 3 */}
                                            <Box bg="blue.50/20">
                                                <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="10px" fontWeight="black" color="blue.500" textTransform="uppercase" letterSpacing="0.1em">Specific Procedure</Text>
                                                </Box>
                                                <VStack spacing={0} align="stretch" overflowY="auto" h="calc(600px - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'blue.100', borderRadius: '10px' } }}>
                                                    {(activeN2?.name3s || []).map((n3: any) => {
                                                        const proc = n3.procedure;
                                                        let fullCode = `${proc.category} → ${proc.subcategory} → ${proc.name}`;
                                                        if (proc.name2 && proc.name2 !== "None") fullCode += ` → ${proc.name2}`;
                                                        if (proc.name3 && proc.name3 !== "None") fullCode += ` → ${proc.name3}`;

                                                        const isSelected = tempTreatmentCode === fullCode;

                                                        return (
                                                            <VStack
                                                                key={n3.name}
                                                                px={4} py={4}
                                                                align="start"
                                                                spacing={1}
                                                                cursor="pointer"
                                                                bg={isSelected ? "blue.500" : (selectedName3 === n3.name ? "blue.50" : "transparent")}
                                                                color={isSelected ? "white" : (selectedName3 === n3.name ? "blue.700" : "gray.700")}
                                                                onClick={() => {
                                                                    setSelectedName3(n3.name);
                                                                    setTempTreatmentCode(fullCode);
                                                                }}
                                                                _hover={{ bg: isSelected ? "blue.600" : "blue.50/50" }}
                                                                borderBottom="1px solid"
                                                                borderColor={isSelected ? "blue.400" : "gray.50"}
                                                            >
                                                                <Text fontSize="xs" fontWeight="900" lineHeight="1.4">{n3.name}</Text>
                                                                {isSelected && <Badge colorScheme="blue" variant="solid" fontSize="8px">SELECTED</Badge>}
                                                            </VStack>
                                                        );
                                                    })}
                                                </VStack>
                                            </Box>
                                        </Grid>
                                    </Box>

                                    {tempTreatmentCode && (
                                        <Box p={4} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
                                            <HStack justify="space-between">
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="9px" fontWeight="black" color="blue.400" letterSpacing="0.1em">READY TO APPLY</Text>
                                                    <Text fontSize="sm" fontWeight="900" color="blue.700">{tempTreatmentCode}</Text>
                                                </VStack>
                                                <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setTempTreatmentCode("")}>Clear</Button>
                                            </HStack>
                                        </Box>
                                    )}
                                </VStack>
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
                                                                        <Text fontSize="10px" fontWeight="1000" color={style.iconColor} noOfLines={1}>
                                                                            {(() => {
                                                                                const parts = toothValues.treatmentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                                                                                return parts.length > 1 ? parts.slice(0, -1).join(" · ") : parts[0];
                                                                            })()}
                                                                        </Text>
                                                                        <Text fontSize="11px" fontWeight="1000" color="gray.800" noOfLines={1}>
                                                                            {toothValues.treatmentCode.split(/→|->|·|\|/).pop()?.trim()}
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
                                <Drawer isOpen={isDetailOpen} onClose={onDetailClose} placement="right">
                                    <DrawerOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
                                    <DrawerContent maxW="80vw" borderRadius="3xl 0 0 3xl" overflow="hidden">
                                        <DrawerHeader p={6} borderBottom="1px solid" borderColor="gray.100">
                                            <HStack justify="space-between" align="start">
                                                <VStack align="start" spacing={3}>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em">CLINICAL ENTRY 22</Text>
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
                                        </DrawerHeader>


                                        <DrawerBody p={8}>
                                            {activeToothId && renderClinicalFields(activeToothId, values, setFieldValue)}
                                        </DrawerBody>
                                        <DrawerFooter borderTop="1px solid" borderColor="gray.50" p={6}>
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
                                        </DrawerFooter>
                                    </DrawerContent>
                                </Drawer>
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

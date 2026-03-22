import { useEffect, useState, useMemo } from "react";
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
    Circle,
    InputGroup,
    InputLeftElement,
    Avatar,
} from "@chakra-ui/react";
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
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

import { ToothData } from "../utils/teethData";
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
    onEditGeneralNote?: () => void;
    formRef?: any;
    doctorOptions?: any[];
}

interface TreatmentFormData {
    doctor: any;
    treatmentDate: string;
    notes: string;
    treatmentCode: string;
    estimate: number;
    discount: number;
    total: number;
    patient?: any;
    status: string;
}

const initialFormData: TreatmentFormData = {
    doctor: undefined,
    treatmentDate: new Date().toISOString().split("T")[0],
    notes: "",
    treatmentCode: "",
    estimate: 0,
    discount: 0,
    total: 0,
    patient: undefined,
    status: "Planned",
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
    }: TreatmentProcedureFormProps) => {
        const toast = useToast();
        const [formLoading, setFormLoading] = useState(false);
        const {
            toothTreatmentStore: { createToothTreatment, updateToothTreatment },
            userStore: { getUsersList },
        } = stores;

        const [doctors, setDoctors] = useState<any[]>([]);
        const [doctorsLoading, setDoctorsLoading] = useState(false);

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

        const { catIdx: selectedCatIdx, subIdx: selectedSubIdx } = explorerState || { catIdx: 0, subIdx: 0 };
        const setSelectedCatIdx = (idx: number) => onExplorerUpdate?.({ catIdx: idx, subIdx: 0 });
        const setSelectedSubIdx = (idx: number) => onExplorerUpdate?.({ catIdx: selectedCatIdx, subIdx: idx });

        const [searchTerm, setSearchTerm] = useState("");

        const activeCategory = selectedCatIdx !== null ? TREATMENT_CATEGORIES[selectedCatIdx] : null;
        const activeSubcategory = (activeCategory && selectedSubIdx !== null)
            ? activeCategory.subcategories[selectedSubIdx]
            : null;

        const filteredProcedures = useMemo(() => {
            if (!searchTerm.trim()) return null;
            const results: any[] = [];
            const term = searchTerm.toLowerCase();

            TREATMENT_CATEGORIES.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.jobs.forEach(job => {
                        if (job.name.toLowerCase().includes(term)) {
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
                const values = replaceLabelValueObjects(formData);
                const results: any[] = [];

                // Backend repository expects one record per tooth
                const teethToProcess = teeth.length > 0 ? teeth : [{ id: "--" }]; // Fallback for general notes

                for (const tooth of teethToProcess) {
                    const payload: any = {
                        patient: values.patient?.value || values.patient,
                        doctor: values.doctor?.value || values.doctor,
                        treatmentDate: values.treatmentDate,
                        notes: values.notes,
                        treatmentPlan: values.treatmentCode, // Map treatmentCode to treatmentPlan
                        status: values.status === "Planned" ? "pending" : values.status, // Map status
                        tooth: {
                            fdi: tooth.id,
                            universal: null,
                            palmer: null,
                        },
                    };

                    if (editData?._id) {
                        payload.treatmentId = editData._id;
                        await updateToothTreatment(payload)
                            .then((res: any) => results.push(res))
                            .catch((err: any) => {
                                throw new Error(err?.message || "Internal mapping error");
                            });
                    } else {
                        await createToothTreatment(payload)
                            .then((res: any) => results.push(res))
                            .catch((err: any) => {
                                throw new Error(err?.message || "Internal mapping error");
                            });
                    }
                }

                setFormLoading(false);
                toast({
                    title: "Diagnostic Recorded",
                    description: `Successfully synchronized ${results.length} procedure(s) to clinical record.`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                });
                onSuccess();
            } catch (err: any) {
                setFormLoading(false);
                toast({
                    title: "Synchronization Failed",
                    description: `${err?.message || "Validation Error"}`,
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

        const calculateTotal = (est: number, disc: number) => Math.max(0, est - disc);

        return (
            <Formik
                initialValues={hoistedValues || {
                    ...initialFormData,
                    patient: { label: `${patientDetails?.name}`, value: patientDetails?._id },
                    notes: generalDescription,
                    doctor: doctorOptions[0],
                }}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, handleSubmit }: any) => {
                    const currentStep = values.treatmentCode ? 2 : (teeth.length > 0 ? 1 : 0);

                    const groupTeethByQuadrant = (selectedTeeth: ToothData[]) => {
                        const quads: Record<string, ToothData[]> = { "UR": [], "UL": [], "LR": [], "LL": [] };
                        selectedTeeth.forEach(t => {
                            const id = parseInt(t.id);
                            if (id >= 11 && id <= 18) quads["UR"].push(t);
                            else if (id >= 21 && id <= 28) quads["UL"].push(t);
                            else if (id >= 31 && id <= 38) quads["LL"].push(t);
                            else if (id >= 41 && id <= 48) quads["LR"].push(t);
                        });
                        return quads;
                    };

                    const quadrants = groupTeethByQuadrant(teeth);

                    return (
                        <FormikForm onSubmit={handleSubmit} style={{ minHeight: '100%' }}>
                            {/* Hidden synchronization component */}
                            <FormValueSyncer values={values} onValuesUpdate={onValuesUpdate} />
                            <Grid templateColumns="1fr 340px" gap={8} minH="700px">

                                {/* CLINICAL EXPLORER - COMPACT 3-TRACK */}
                                <VStack align="stretch" spacing={5} h="full">
                                    <Flex justify="space-between" align="center" px={2}>
                                        <VStack align="start" spacing={0}>
                                            <HStack spacing={2}>
                                                <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2} fontSize="10px">QW-04</Badge>
                                                <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.2em" textTransform="uppercase">
                                                    Clinical Protocols
                                                </Text>
                                            </HStack>
                                            <Heading size="md" fontWeight="900" color="gray.800" letterSpacing="tight">Procedure Explorer</Heading>
                                        </VStack>

                                        <VStack align="end" spacing={2}>
                                            <InputGroup maxW="240px">
                                                <InputLeftElement pointerEvents="none">
                                                    <FiSearch color="gray.300" />
                                                </InputLeftElement>
                                                <Input
                                                    placeholder="Search protocols..."
                                                    size="sm"
                                                    borderRadius="full"
                                                    bg="white"
                                                    border="1px solid"
                                                    borderColor="gray.100"
                                                    fontSize="xs"
                                                    fontWeight="600"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    _focus={{ borderColor: "blue.200", boxShadow: "0 0 0 1px #EBF8FF" }}
                                                />
                                            </InputGroup>
                                            <HStack spacing={2}>
                                                <Text fontSize="10px" fontWeight="900" color="gray.300" letterSpacing="0.1em">QUICK PICK:</Text>
                                                {["Scaling", "Extraction", "X-Ray"].map(tag => (
                                                    <Button
                                                        key={tag}
                                                        size="xs"
                                                        variant="ghost"
                                                        fontSize="10px"
                                                        fontWeight="900"
                                                        h="22px"
                                                        px={3}
                                                        borderRadius="full"
                                                        bg="gray.50"
                                                        color="gray.500"
                                                        onClick={() => setSearchTerm(tag)}
                                                        _hover={{ bg: "blue.50", color: "blue.500" }}
                                                    >
                                                        {tag.toUpperCase()}
                                                    </Button>
                                                ))}
                                            </HStack>
                                        </VStack>
                                    </Flex>

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
                                        {/* Dual Side Accents for Explorer ... */}
                                        <Box position="absolute" top="6" left="0" bottom="6" w="2px" bg="blue.500" borderRadius="full" opacity={0.15} />
                                        <Box position="absolute" top="6" right="0" bottom="6" w="2px" bg="blue.500" borderRadius="full" opacity={0.15} />

                                        {searchTerm.trim() ? (
                                            // ... Search logic ...
                                            <Box h="full" overflowY="auto" p={5} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                <VStack align="stretch" spacing={2.5}>
                                                    {filteredProcedures?.map((proc) => {
                                                        const fullCode = `${proc.category} → ${proc.subcategory} → ${proc.name}`;
                                                        const isSelected = values.treatmentCode === fullCode;
                                                        return (
                                                            <HStack
                                                                key={fullCode}
                                                                p={4}
                                                                bg={isSelected ? "blue.600" : "white"}
                                                                color={isSelected ? "white" : "gray.800"}
                                                                borderRadius="xl"
                                                                cursor="pointer"
                                                                onClick={() => {
                                                                    setFieldValue("treatmentCode", fullCode);
                                                                    setFieldValue("estimate", proc.defaultEstimate);
                                                                    setFieldValue("total", calculateTotal(proc.defaultEstimate, values.discount));
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
                                                                    <Text fontSize="12px" fontWeight="900" letterSpacing="tight">{proc.name}</Text>
                                                                </VStack>
                                                                <Badge p={2} borderRadius="md" variant={isSelected ? "solid" : "subtle"} colorScheme={isSelected ? "whiteAlpha" : "blue"} fontSize="12px" fontWeight="900">
                                                                    ₹{proc.defaultEstimate.toLocaleString()}
                                                                </Badge>
                                                            </HStack>
                                                        );
                                                    })}
                                                    {filteredProcedures?.length === 0 && (
                                                        <VStack py={20} opacity={0.3} spacing={3}>
                                                            <Icon as={FiSearch} boxSize={8} />
                                                            <Text fontSize="xs" fontWeight="800">No matching protocols found</Text>
                                                        </VStack>
                                                    )}
                                                </VStack>
                                            </Box>
                                        ) : (
                                            <Grid templateColumns="1fr 1fr 1.4fr" h="full">

                                                {/* TRACK 1: CATEGORIES */}
                                                <Box borderRight="1px solid" borderColor="gray.100" bg="transparent">
                                                    <Box px={5} py={3} borderBottom="1px solid" borderColor="gray.50" display="flex" justifyContent="space-between" alignItems="center">
                                                        <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.2em" textTransform="uppercase">Category</Text>
                                                        <Circle size="14px" bg="blue.500" color="white" fontSize="10px" fontWeight="900">01</Circle>
                                                    </Box>
                                                    <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 32px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                        {TREATMENT_CATEGORIES.map((cat, idx) => (
                                                            <Box
                                                                key={cat.name}
                                                                px={5} py={4}
                                                                cursor="pointer"
                                                                bg={selectedCatIdx === idx ? "blue.50/50" : "transparent"}
                                                                color={selectedCatIdx === idx ? "blue.600" : "gray.500"}
                                                                onClick={() => { setSelectedCatIdx(idx); setSelectedSubIdx(0); }}
                                                                _hover={{ bg: "blue.50/20" }}
                                                                transition="all 0.2s"
                                                                position="relative"
                                                            >
                                                                {selectedCatIdx === idx && (
                                                                    <>
                                                                        <Box position="absolute" left="0" top="2.5" bottom="2.5" w="3px" bg="blue.500" borderRadius="full" />
                                                                        <Box position="absolute" right="2" top="50%" transform="translateY(-50%)" p={1} bg="blue.100" borderRadius="full" boxSize={2} />
                                                                    </>
                                                                )}
                                                                <HStack spacing={3}>
                                                                    <Icon as={CATEGORY_ICONS[cat.name] || FiActivity} boxSize={3} opacity={selectedCatIdx === idx ? 1 : 0.4} />
                                                                    <Text fontSize="11px" fontWeight="900" letterSpacing="widest">{cat.name.toUpperCase()}</Text>
                                                                </HStack>
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                </Box>

                                                {/* TRACK 2: SUBCATEGORIES */}
                                                <Box borderRight="1px solid" borderColor="gray.100" bg="transparent">
                                                    <Box px={5} py={3} borderBottom="1px solid" borderColor="gray.50" display="flex" justifyContent="space-between" alignItems="center">
                                                        <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.2em" textTransform="uppercase">Specialization</Text>
                                                        <Circle size="14px" bg="blue.500" color="white" fontSize="10px" fontWeight="900">02</Circle>
                                                    </Box>
                                                    <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 32px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                        {activeCategory?.subcategories.map((sub, idx) => (
                                                            <Box
                                                                key={sub.name}
                                                                px={6} py={4}
                                                                cursor="pointer"
                                                                bg={selectedSubIdx === idx ? "blue.50/50" : "transparent"}
                                                                color={selectedSubIdx === idx ? "blue.600" : "gray.500"}
                                                                onClick={() => setSelectedSubIdx(idx)}
                                                                _hover={{ bg: "blue.50/20" }}
                                                                transition="all 0.2s"
                                                                position="relative"
                                                            >
                                                                {selectedSubIdx === idx && (
                                                                    <>
                                                                        <Box position="absolute" left="0" top="2.5" bottom="2.5" w="3px" bg="blue.500" borderRadius="full" />
                                                                        <Box position="absolute" right="2" top="50%" transform="translateY(-50%)" p={1} bg="blue.100" borderRadius="full" boxSize={1.5} />
                                                                    </>
                                                                )}
                                                                <Text fontSize="11px" fontWeight="900" letterSpacing="widest">{sub.name.toUpperCase()}</Text>
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                </Box>

                                                {/* TRACK 3: SPECIFIC PROCEDURES ... */}
                                                <Box bg="transparent">
                                                    <Box px={5} py={3} borderBottom="1px solid" borderColor="gray.100" bg="blue.600" color="white" position="sticky" top={0} zIndex={1} display="flex" justifyContent="space-between" alignItems="center">
                                                        <Text fontSize="10px" fontWeight="900" color="blue.100" letterSpacing="0.2em" textTransform="uppercase">Live Selection</Text>
                                                        <Circle size="14px" bg="white" color="blue.600" fontSize="10px" fontWeight="900">03</Circle>
                                                    </Box>
                                                    <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 32px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                                                        {activeSubcategory?.jobs.map((job) => {
                                                            const fullCode = `${activeCategory?.name} → ${activeSubcategory?.name} → ${job.name}`;
                                                            const isSelected = values.treatmentCode === fullCode;
                                                            return (
                                                                <VStack
                                                                    key={job.name}
                                                                    px={6} py={5}
                                                                    align="start"
                                                                    spacing={1.5}
                                                                    cursor="pointer"
                                                                    bg={isSelected ? "blue.600" : "white"}
                                                                    color={isSelected ? "white" : "gray.600"}
                                                                    onClick={() => {
                                                                        setFieldValue("treatmentCode", fullCode);
                                                                        setFieldValue("estimate", job.defaultEstimate);
                                                                        setFieldValue("total", calculateTotal(job.defaultEstimate, values.discount));
                                                                    }}
                                                                    _hover={isSelected ? {} : { transform: "translateX(4px)", color: "blue.600", bg: "blue.50/10" }}
                                                                    transition="all 0.2s"
                                                                    position="relative"
                                                                    borderBottom="1px solid"
                                                                    borderColor="gray.50"
                                                                >
                                                                    <Text fontSize="12px" fontWeight="900" lineHeight="short">{job.name.toUpperCase()}</Text>
                                                                    <HStack spacing={2}>
                                                                        <Badge variant={isSelected ? "solid" : "subtle"} colorScheme={isSelected ? "whiteAlpha" : "blue"} fontSize="10px" fontWeight="900" px={2} borderRadius="md">
                                                                            ₹{job.defaultEstimate.toLocaleString()}
                                                                        </Badge>
                                                                        {isSelected && <Icon as={FiActivity} boxSize={2} />}
                                                                    </HStack>
                                                                </VStack>
                                                            );
                                                        })}
                                                    </VStack>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Box>

                                    {/* FOOTER ACTIONS - RESTORED BACK BUTTON */}
                                    <Flex justify="start" pt={4} pb={12}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<FiChevronRight style={{ transform: 'rotate(180deg)' }} />}
                                            onClick={onBack}
                                            fontSize="12px"
                                            fontWeight="900"
                                            color="gray.400"
                                            textTransform="uppercase"
                                            letterSpacing="0.1em"
                                            _hover={{ color: "blue.500", bg: "blue.50" }}
                                            borderRadius="full"
                                            px={6}
                                        >
                                            Go Back
                                        </Button>
                                    </Flex>
                                </VStack>

                                {/* BILILNG & CASE SUMMARY - ULTRA SLIM SIDEBAR */}
                                <VStack align="stretch" spacing={0} h="full" pb={12}>
                                    <VStack
                                        align="stretch"
                                        spacing={0}
                                        p={0}
                                        bg="rgba(255, 255, 255, 0.4)"
                                        backdropFilter="blur(25px)"
                                        borderRadius="2xl"
                                        border="1px solid"
                                        borderColor="whiteAlpha.400"
                                        boxShadow="2xl"
                                        h="full"
                                        position="relative"
                                        overflow="hidden"
                                    >
                                        {/* Clinical Stamp Watermark */}
                                        <Box position="absolute" top="10" right="-10" opacity={0.03} pointerEvents="none" transform="rotate(-15deg)">
                                            <Icon as={FiActivity} boxSize="200px" />
                                        </Box>

                                        {/* SESSION TIMELINE - ULTRA PREMIUM HEADER */}
                                        <Box px={5} py={4} bg="white/40" borderBottom="1px solid" borderColor="whiteAlpha.400">
                                            <HStack justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    {[
                                                        { label: "SELECT", active: currentStep >= 0 },
                                                        { label: "PRICE", active: currentStep >= 1 },
                                                        { label: "SAVE", active: currentStep >= 2 }
                                                    ].map((step, i) => (
                                                        <HStack key={step.label} spacing={1.5}>
                                                            <Circle size="6px" bg={step.active ? "blue.500" : "gray.300"} transition="all 0.3s" />
                                                            <Text fontSize="10px" fontWeight="900" color={step.active ? "blue.600" : "gray.400"} letterSpacing="wider">{step.label}</Text>
                                                            {i < 2 && <Box w="12px" h="1px" bg="gray.200" />}
                                                        </HStack>
                                                    ))}
                                                </HStack>
                                                <Badge variant="solid" colorScheme="blue" fontSize="10px" borderRadius="full" px={2}>LVL-4</Badge>
                                            </HStack>
                                        </Box>

                                        <Box position="absolute" top="10" left="0" bottom="10" w="1px" bg="blue.500" borderRadius="full" opacity={0.1} />

                                        <VStack align="stretch" spacing={4} overflowY="auto" pr={1} px={5} pt={4} pb={5} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>

                                            {/* Patient Identity Header - Floating Card Style */}
                                            <MotionBox
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                p={4} borderRadius="xl" bg="white" boxShadow="sm" border="1px solid" borderColor="gray.50"
                                            >
                                                <HStack spacing={3}>
                                                    <Avatar size="sm" name={patientDetails?.name} bg="blue.600" color="white" border="2px solid" borderColor="blue.50" />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="12px" fontWeight="900" color="gray.800" textTransform="uppercase" letterSpacing="widest">{patientDetails?.name}</Text>
                                                        <HStack spacing={2}>
                                                            <Badge variant="subtle" fontSize="10px" colorScheme="blue" borderRadius="full">REF: #{patientDetails?._id?.slice(-8).toUpperCase()}</Badge>
                                                            <Text fontSize="10px" fontWeight="800" color="green.500">SYSTEM AUTHORIZED</Text>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                            </MotionBox>
                                            {/* Session Context Header */}
                                            <MotionBox
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="blue.50" boxShadow="xs"
                                            >
                                                <VStack align="stretch" spacing={4}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.1em">DOCTOR</Text>
                                                        <Box w="full">
                                                            <CustomInput
                                                                name="doctor"
                                                                type="real-time-user-search"
                                                                isSearchable={true}
                                                                isClear={true}
                                                                query={{ type: 'doctor' }}
                                                                options={doctorOptions}
                                                                value={values.doctor}
                                                                onChange={(val: any) => setFieldValue("doctor", val)}
                                                                style={{ fontSize: '12px', height: '32px' }}
                                                            />
                                                        </Box>
                                                    </VStack>
                                                    <Divider borderColor="gray.50" />
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.1em">SESSION DATE</Text>
                                                        <Input
                                                            type="date"
                                                            size="sm"
                                                            h="32px"
                                                            fontSize="12px"
                                                            fontWeight="700"
                                                            value={values.treatmentDate}
                                                            onChange={(e) => setFieldValue("treatmentDate", e.target.value)}
                                                            border="none"
                                                            p={0}
                                                            _focus={{ boxShadow: 'none' }}
                                                        />
                                                    </VStack>
                                                </VStack>
                                                <Divider my={3} borderColor="gray.50" />
                                                <HStack justify="space-between">
                                                    <Badge colorScheme="green" variant="subtle" fontSize="10px" px={2} borderRadius="full">STATUS: ACTIVE</Badge>
                                                    <Text fontSize="10px" fontWeight="800" color="gray.300">REF: DIAG-#{new Date().getFullYear()}</Text>
                                                </HStack>
                                            </MotionBox>
                                            {/* SESSION SUMMARY BOX - QUADRANT AWARE TEETH MATRIX */}
                                            <MotionBox
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                p={3.5} bg="blue.50/20" borderRadius="xl" border="1px solid" borderColor="blue.100"
                                            >
                                                <VStack align="stretch" spacing={3}>
                                                    <HStack justify="space-between" align="center">
                                                        <Text fontSize="11px" fontWeight="900" color="blue.600" textTransform="uppercase" letterSpacing="0.1em">Teeth Matrix</Text>
                                                        <Badge fontSize="10px" colorScheme="blue" variant="solid" borderRadius="full">Q{Object.values(quadrants).filter(q => q.length > 0).length} ACTIVE</Badge>
                                                    </HStack>

                                                    {teeth.length > 0 ? (
                                                        <VStack align="stretch" spacing={2.5}>
                                                            {Object.entries(quadrants).map(([name, items]) => items.length > 0 && (
                                                                <HStack key={name} spacing={2}>
                                                                    <Text fontSize="6px" fontWeight="900" color="gray.400" minW="12px">{name}</Text>
                                                                    <HStack spacing={1} flexWrap="wrap">
                                                                        {items.map(t => (
                                                                            <Circle key={t.id} size="22px" bg="blue.600" color="white" fontSize="10px" fontWeight="900" border="1px solid" borderColor="blue.400">
                                                                                {t.id}
                                                                            </Circle>
                                                                        ))}
                                                                    </HStack>
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    ) : (
                                                        <Text fontSize="11px" fontWeight="800" color="gray.400">Awaiting selection...</Text>
                                                    )}

                                                    <Divider borderColor="blue.100" opacity={0.3} />

                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="10px" fontWeight="900" color="gray.400" textTransform="uppercase" letterSpacing="widest">Clinical Protocol</Text>
                                                        <Box p={3} bg="white" borderRadius="lg" w="full" border="1px solid" borderColor="blue.50">
                                                            <Text fontSize="12px" fontWeight="900" color="gray.700" lineHeight="1.3">
                                                                {values.treatmentCode ? (
                                                                    <Text as="span" color="blue.600">{values.treatmentCode.split(" → ").pop()}</Text>
                                                                ) : "Search list..."}
                                                            </Text>
                                                        </Box>
                                                    </VStack>
                                                </VStack>
                                            </MotionBox>

                                            {/* FINANCIAL DATA SHEET - PREMIUM ESTIMATE */}
                                            <MotionBox
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3 }}
                                                align="stretch"
                                            >
                                                <HStack spacing={2} mb={2}>
                                                    <Circle size="5px" bg="blue.500" />
                                                    <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="0.2em" textTransform="uppercase">Clinical Financials</Text>
                                                </HStack>

                                                <VStack spacing={0} align="stretch" bg="white" borderRadius="2xl" p={5} border="1px solid" borderColor="gray.100" boxShadow="lg">
                                                    <Flex justify="space-between" align="center" mb={3}>
                                                        <Text fontSize="10px" fontWeight="900" color="gray.400">GROSS ESTIMATE</Text>
                                                        <Text fontSize="sm" fontWeight="1000" color="gray.800">₹{values.estimate.toLocaleString()}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between" align="center" mb={5}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="12px" fontWeight="900" color="gray.400">CONCESSION</Text>
                                                            {values.discount > 0 && <Badge colorScheme="green" fontSize="10px" borderRadius="full">SAVING ₹{values.discount}</Badge>}
                                                        </VStack>
                                                        <HStack spacing={1.5} maxW="120px">
                                                            <Input
                                                                type="number" size="sm" h="32px"
                                                                value={values.discount}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    setFieldValue("discount", val);
                                                                    setFieldValue("total", calculateTotal(values.estimate, val));
                                                                }}
                                                                borderRadius="lg" fontWeight="900" bg="gray.50"
                                                                borderColor="blue.50" fontSize="12px" color="blue.600"
                                                                textAlign="right"
                                                                _focus={{ borderColor: "blue.300", bg: "white", boxShadow: "0 0 0 1px #EBF8FF" }}
                                                            />
                                                        </HStack>
                                                    </Flex>
                                                    <Divider borderColor="gray.100" mb={5} />
                                                    <VStack spacing={1} align="stretch">
                                                        <Text fontSize="11px" fontWeight="900" color="blue.500" letterSpacing="0.2em" textAlign="center">FINAL CLINICAL QUOTE</Text>
                                                        <Box py={2} bg="blue.50/30" borderRadius="xl">
                                                            <Text
                                                                fontSize="28px"
                                                                fontWeight="1000"
                                                                color="blue.600"
                                                                lineHeight="1.1"
                                                                letterSpacing="tight"
                                                                textAlign="center"
                                                            >
                                                                ₹{values.total.toLocaleString()}
                                                            </Text>
                                                        </Box>
                                                    </VStack>
                                                </VStack>
                                            </MotionBox>

                                            <VStack align="stretch" spacing={2} pb={2}>
                                                <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.2em" textTransform="uppercase">Clinical Observations</Text>
                                                <Box bg="white" borderRadius="lg" p={0.5} border="1px solid" borderColor="gray.100">
                                                    <CustomInput
                                                        name="notes"
                                                        type="textarea"
                                                        placeholder="Clinical findings..."
                                                        value={values.notes}
                                                        onChange={(e: any) => setFieldValue("notes", e.target.value)}
                                                        style={{
                                                            minHeight: "70px",
                                                            borderRadius: "lg",
                                                            fontSize: "12px",
                                                            border: 'none',
                                                            background: 'transparent',
                                                            fontWeight: '600',
                                                            color: '#4A5568',
                                                            lineHeight: '1.4'
                                                        }}
                                                    />
                                                </Box>
                                            </VStack>
                                        </VStack>

                                        <Box mt="auto" pt={3} px={1} pb={2} mb={2}>
                                            <Button
                                                colorScheme="blue"
                                                type="submit"
                                                isLoading={formLoading}
                                                isDisabled={!values.treatmentCode}
                                                w="full"
                                                h="44px"
                                                borderRadius="xl"
                                                fontSize="12px"
                                                fontWeight="900"
                                                leftIcon={<FiSave />}
                                                textTransform="uppercase"
                                                letterSpacing="0.2em"
                                                boxShadow="0 4px 12px rgba(49, 130, 206, 0.1)"
                                                transition="all 0.2s"
                                                animation={values.treatmentCode ? `${pulseGlow} 2s infinite ease-in-out` : "none"}
                                                _hover={{ transform: "translateY(-1.5px)", boxShadow: "0 8px 16px rgba(49, 130, 206, 0.15)" }}
                                                _active={{ transform: "scale(0.98)" }}
                                            >
                                                {editData?._id ? "Update Record" : "Confirm & Save"}
                                            </Button>
                                        </Box>
                                    </VStack>
                                </VStack>

                            </Grid>
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

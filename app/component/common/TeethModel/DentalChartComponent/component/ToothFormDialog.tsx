import { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Heading,
  VStack,
  Text,
  useToast,
  Icon,
  Input,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import {
  FiFileText,
  FiCheckCircle,
  FiChevronRight,
  FiPlusCircle,
  FiTrash2,
  FiX,
  FiActivity,
} from "react-icons/fi";

import { ToothData } from "../utils/teethData";
import CustomInput from "../../../../config/component/customInput/CustomInput";
import { replaceLabelValueObjects } from "../../../../../config/utils/function";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";
import {
  TREATMENT_CATEGORIES,
} from "../../../../../dashboard/toothTreatment/treatmentDataConstant";
import CustomDrawer from "../../../Drawer/CustomDrawer";

interface ToothFormDialogProps {
  teeth: ToothData[];
  generalDescription: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPatient: boolean;
  patientDetails: any;
  notation?: "fdi" | "universal" | "palmer";
  dentitionType?: "adult" | "child";
  lastExaminingDoctor?: any;
  setLastExaminingDoctor?: (doc: any) => void;
  doctorOptions?: any[];
  onSuccess?: (treatment?: any) => void;
  complaintType?: string;
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

const detectIsChild = (tooth: any) => {
  const tId = typeof tooth === "object" ? tooth.fdi : String(tooth || "");
  if (!tId || tId === "General") return false;
  return (
    (parseInt(tId) >= 51 && parseInt(tId) <= 85) || // FDI child range
    /[a-eA-E]/.test(tId) || // Palmer child range
    tId.toLowerCase().includes("d") // Universal child indicator
  );
};

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
  complaintType: "OTHER FINDING",
};

export const ToothFormDialog = observer(
  ({
    teeth = [],
    generalDescription = "",
    open,
    onOpenChange,
    isPatient,
    patientDetails,
    notation,
    dentitionType,
    lastExaminingDoctor,
    setLastExaminingDoctor,
    doctorOptions = [],
    onSuccess,
    complaintType = "OTHER FINDING",
  }: ToothFormDialogProps) => {
    const toast = useToast();
    const [showProcedureExplorer, setShowProcedureExplorer] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [saveAction, setSaveAction] = useState<"save" | "saveAndWorkDone">("save");
    const {
      toothTreatmentStore: { createToothTreatment },
      procedureStore,
    } = stores;

    useEffect(() => {
      const companyId = patientDetails?.company?._id || patientDetails?.company;
      procedureStore.getProcedures(companyId ? { companyId } : {});
    }, [patientDetails]);

    // Browser State
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedName1, setSelectedName1] = useState<string | null>(null);
    const [selectedName2, setSelectedName2] = useState<string | null>(null);
    const [selectedName3, setSelectedName3] = useState<string | null>(null);
    const [tempTreatmentCode, setTempTreatmentCode] = useState("");

    const groupedData = useMemo(() => {
      const dbData = procedureStore.procedures.data;

      if (dbData.length > 0) {
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

        // Convert map to nested arrays for easy rendering
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

    const handleSubmit = async (formData: any) => {
      try {
        setFormLoading(true);
        const values = replaceLabelValueObjects(formData);

        const promises = teeth.map((t) => {
          const toothId = String(t.id);

          // Guaranteed Quadrant Detection based on FDI ID
          const getQuadrantInfo = (tId: string) => {
            const id = parseInt(tId);
            if (isNaN(id)) return { position: "general", side: "general" };
            if (id >= 11 && id <= 18) return { position: "upper", side: "right" };
            if (id >= 21 && id <= 28) return { position: "upper", side: "left" };
            if (id >= 31 && id <= 38) return { position: "lower", side: "left" };
            if (id >= 41 && id <= 48) return { position: "lower", side: "right" };
            if (id >= 51 && id <= 55) return { position: "upper", side: "right" };
            if (id >= 61 && id <= 65) return { position: "upper", side: "left" };
            if (id >= 71 && id <= 75) return { position: "lower", side: "left" };
            if (id >= 81 && id <= 85) return { position: "lower", side: "right" };
            return { position: "general", side: "general" };
          };

          const quadrant = getQuadrantInfo(toothId);

          const payload: any = {
            patient: values.patient?.value || values.patient,
            doctor: values.doctor?.value || values.doctor,
            examiningDoctor: values.examiningDoctor?.value || values.examiningDoctor,
            company: patientDetails?.company?._id || patientDetails?.company,
            tooth: toothId,
            toothNotation: notation || "fdi",
            dentitionType: dentitionType || (detectIsChild(t) ? "child" : "adult"),
            position: t.position || quadrant.position,
            side: t.side || quadrant.side,
            treatmentDate: values.treatmentDate,
            notes: values.notes,
            treatmentPlan: values.treatmentCode || "",
            status: values.status === "Planned" ? "pending" : values.status,
            estimateMin: Number(values.estimateMin) || 0,
            estimateMax: Number(values.estimateMax) || 0,
            discount: Number(values.discount) || 0,
            totalMin: Number(values.totalMin) || 0,
            totalMax: Number(values.totalMax) || 0,
            recordType: "tooth",
            complaintType: values.complaintType || complaintType,
            user: stores.auth.user?._id
          };
          return createToothTreatment(payload);
        });

        const results = await Promise.all(promises);

        if (setLastExaminingDoctor && values.examiningDoctor) {
          setLastExaminingDoctor(values.examiningDoctor);
        }

        setFormLoading(false);
        toast({
          title: "Treatment Records Saved.",
          description: `${teeth.length} record(s) have been successfully added.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        if (onSuccess) {
          const treat = results[0]?.data || results[0];
          if (treat) {
            treat.doctorObj = values.doctor;
            treat.examiningDoctorObj = values.examiningDoctor;
          }
          onSuccess(saveAction === "saveAndWorkDone" ? treat : undefined);
        }
        if (onOpenChange) onOpenChange(false);

      } catch (err: any) {
        setFormLoading(false);
        toast({
          title: "Failed to create",
          description: `${err?.message || "Internal error"}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const calculateTotal = (est: any, disc: any) => {
      const e = Number(est) || 0;
      const d = Number(disc) || 0;
      return Math.max(0, e - d);
    };

    const drawerTitle = (
      <HStack spacing={4}>
        <Box p={2} bg="blue.500" borderRadius="xl" color="white">
          <FiPlusCircle size={20} />
        </Box>
        <VStack align="start" spacing={0}>
          <Heading size="md" color="gray.800" fontWeight="extrabold">
            {teeth.length === 1
              ? teeth[0].name
              : (teeth.length > 1 ? `Multi-Tooth (${teeth.length})` : "General Record")}
          </Heading>
          <HStack spacing={2} align="center">
            <Text fontSize="xs" color="black" fontWeight="black">
              {teeth.length === 1
                ? `TOOTH ${notation === 'universal' ? (teeth[0].universal || teeth[0].fdi) : (notation === 'palmer' ? (teeth[0].palmer || teeth[0].fdi) : teeth[0].fdi)}`
                : "TREATMENT CODE ENTRY FORM"}
            </Text>
            <Badge size="xs" colorScheme={complaintType === "CHIEF COMPLAINT" ? "red" : complaintType === "OTHER FINDING" ? "orange" : "green"} variant="subtle" borderRadius="full" px={2} fontSize="9px">
              {complaintType}
            </Badge>
          </HStack>
        </VStack>
      </HStack>
    );

    return (
      <CustomDrawer
        width="75vw"
        open={open}
        close={() => onOpenChange(false)}
        title={drawerTitle}
      >
        <Formik
          initialValues={{
            ...initialFormData,
            patient: { label: `${patientDetails?.name}`, value: patientDetails?._id },
            notes: generalDescription,
            examiningDoctor: lastExaminingDoctor,
            doctor: doctorOptions[0],
            complaintType: complaintType,
          }}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, handleSubmit }: any) => {

            // Auto-expand hierarchy based on existing treatmentCode
            useEffect(() => {
              if (open) {
                setTempTreatmentCode(values.treatmentCode || "");
                if (values.treatmentCode) {
                  const parts = values.treatmentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                  if (parts.length >= 1) {
                    setSelectedCategory(parts[0] || null);
                    setSelectedSubcategory(parts[1] || null);
                    setSelectedName1(parts[2] || null);
                    setSelectedName2(parts[3] || null);
                    setSelectedName3(parts[4] || null);
                  }
                } else {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSelectedName1(null);
                  setSelectedName2(null);
                  setSelectedName3(null);
                }
              }
            }, [open, showProcedureExplorer, groupedData, values.treatmentCode]);

            return (
              <>
                <FormikForm onSubmit={handleSubmit} style={{ height: '100%', padding: '20px' }}>
                  <VStack spacing={6} align="stretch">

                    {/* PATIENT & DOCTOR CONTEXT HEADER */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} bg="gray.50" p={5} borderRadius="2xl" border="1px" borderColor="gray.100">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="10px" fontWeight="black" color="black">PATIENT</Text>
                        <Text fontWeight="black" color="gray.700" fontSize="sm" noOfLines={1}>{patientDetails?.name || "N/A"}</Text>
                      </VStack>

                      <VStack align="start" spacing={1}>
                        <Text fontSize="10px" fontWeight="black" color="black">DATE</Text>
                        <CustomInput
                          name="treatmentDate"
                          type="date"
                          value={values.treatmentDate}
                          onChange={(e: any) => setFieldValue("treatmentDate", e.target.value)}
                          style={{ height: '32px', fontSize: '12px' }}
                        />
                      </VStack>
                    </Grid>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} bg="gray.50" p={5} borderRadius="2xl" border="1px" borderColor="gray.100">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="10px" fontWeight="black" color="black">ASSIGN DOCTOR</Text>
                        <CustomInput
                          name="doctor"
                          type="real-time-user-search"
                          query={{ type: 'doctor' }}
                          options={doctorOptions}
                          value={values.doctor}
                          onChange={(val: any) => setFieldValue("doctor", val)}
                          style={{ height: '32px', fontSize: '12px' }}
                        />
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="10px" fontWeight="black" color="black">EXAMINING DOCTOR</Text>
                        <CustomInput
                          name="examiningDoctor"
                          type="real-time-user-search"
                          query={{ type: 'doctor' }}
                          options={doctorOptions}
                          value={values.examiningDoctor}
                          onChange={(val: any) => setFieldValue("examiningDoctor", val)}
                          style={{ height: '32px', fontSize: '12px' }}
                        />
                      </VStack>
                    </Grid>
                    {/* 1. COMPLAINT TYPE */}
                    <VStack align="start" spacing={3} w="full">
                      <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">1. COMPLAINT TYPE</Text>
                      <HStack bg="gray.50" p={1.5} borderRadius="xl" w="full" spacing={2} border="1px solid" borderColor="gray.100">
                        {["CHIEF COMPLAINT", "OTHER FINDING", "EXISTING FINDING"].map((type) => {
                          const isActive = values.complaintType === type;
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
                              size="sm"
                              h="34px"
                              fontSize="8px"
                              fontWeight="1000"
                              borderRadius="lg"
                              bg={styles.bg}
                              color={styles.color}
                              boxShadow={isActive ? "md" : "sm"}
                              onClick={() => setFieldValue("complaintType", type)}
                              _hover={{ opacity: 0.9 }}
                              transition="all 0.2s"
                            >
                              {type}
                            </Button>
                          );
                        })}
                      </HStack>
                    </VStack>

                    <VStack align="start" spacing={2} w="full">
                      <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">2. Treatment Advise</Text>
                      <Box position="relative" w="full">
                        <CustomInput
                          name="notes"
                          type="textarea"
                          placeholder="Enter detailed documentation regarding symptoms, findings, or patient concerns..."
                          value={values.notes}
                          onChange={(e: any) => setFieldValue("notes", e.target.value)}
                          style={{
                            minHeight: "130px",
                            background: "gray.50",
                            border: '1px solid',
                            borderColor: 'gray.100',
                            borderRadius: '24px',
                            padding: '20px',
                            fontSize: '14px'
                          }}
                        />
                        {values.notes && (
                          <IconButton
                            aria-label="Clear"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            position="absolute"
                            bottom={4}
                            right={4}
                            onClick={() => setFieldValue("notes", "")}
                          />
                        )}
                      </Box>
                    </VStack>



                    {/* TREATMENT BROWSER SECTION */}

                    {/* FINANCIAL INPUTS SECTION */}
                    <VStack align="stretch" spacing={4} p={6} bg="blue.50/30" borderRadius="3xl" border="1px solid" borderColor="blue.100">
                      <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.2em">FINANCIAL ESTIMATES</Text>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="9px" fontWeight="black" color="black">Minimum Estimate (₹)</Text>
                          <Input
                            size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="48px"
                            value={values.estimateMin}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFieldValue("estimateMin", val);
                              setFieldValue("totalMin", calculateTotal(val, values.discount));
                            }}
                          />
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="9px" fontWeight="black" color="black">Maximum Estimate (₹)</Text>
                          <Input
                            size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="48px"
                            value={values.estimateMax}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFieldValue("estimateMax", val);
                              setFieldValue("totalMax", calculateTotal(val, values.discount));
                            }}
                          />
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="9px" fontWeight="black" color="black">DISCOUNT (₹)</Text>
                          <Input
                            size="lg" type="number" bg="white" borderRadius="xl" fontWeight="900" fontSize="15px" h="48px" color="green.600"
                            value={values.discount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFieldValue("discount", val);
                              setFieldValue("totalMin", calculateTotal(values.estimateMin, val));
                              setFieldValue("totalMax", calculateTotal(values.estimateMax, val));
                            }}
                          />
                        </VStack>
                      </Grid>
                      <HStack pt={4} borderTop="1px dashed" borderColor="blue.200" justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="10px" fontWeight="black" color="black">TOTAL QUOTATION</Text>
                          <Text fontSize="22px" fontWeight="black" color="black">
                            ₹{Math.round(values.totalMin || 0).toLocaleString()} - ₹{Math.round(values.totalMax || 0).toLocaleString()}
                          </Text>
                        </VStack>
                        <Icon as={FiActivity} color="blue.200" boxSize={8} />
                      </HStack>
                    </VStack>

                    <Divider />

                    {/* 2. CLINICAL OBSERVATION */}
                    {/* 3. CLINICAL PROCEDURE */}
                    <VStack align="start" spacing={3} w="full">
                      <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.1em">3. CLINICAL PROCEDURE</Text>
                      <Box
                        w="full"
                        p={5}
                        bg={values.treatmentCode ? "blue.50/50" : "gray.50"}
                        borderRadius="2xl"
                        border="2px dashed"
                        borderColor={values.treatmentCode ? "blue.200" : "gray.200"}
                        cursor="pointer"
                        onClick={() => setShowProcedureExplorer(true)}
                        transition="all 0.2s"
                        _hover={{ borderColor: "blue.400", bg: "blue.50/70" }}
                      >
                        <HStack justify="space-between">
                          <HStack spacing={4}>
                            <Box p={3} bg={values.treatmentCode ? "blue.500" : "gray.100"} borderRadius="xl" color={values.treatmentCode ? "white" : "gray.400"}>
                              <FiActivity size={20} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="10px" fontWeight="black" color="gray.400">PROCEDURE CODE</Text>
                              <VStack align="start" spacing={0}>
                                {values.treatmentCode ? (
                                  <>
                                    <Text fontSize="10px" fontWeight="1000" color="blue.400" noOfLines={1}>
                                      {(() => {
                                        const parts = values.treatmentCode.split(/→|->|·|\|/).map((p: string) => p.trim());
                                        return parts.length > 1 ? parts.slice(0, -1).join(" · ") : parts[0];
                                      })()}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="black" color="gray.800" mt="-2px">
                                      {values.treatmentCode.split(/→|->|·|\|/).pop()?.trim()}
                                    </Text>
                                  </>
                                ) : (
                                  <Text fontSize="md" fontWeight="black" color="gray.400">
                                    Search & Select Procedure...
                                  </Text>
                                )}
                              </VStack>
                            </VStack>
                          </HStack>
                          <HStack>
                            {values.treatmentCode && (
                              <IconButton
                                aria-label="Clear"
                                icon={<FiX />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFieldValue("treatmentCode", "");
                                }}
                              />
                            )}
                            <Icon as={FiChevronRight} color="gray.300" boxSize={5} />
                          </HStack>
                        </HStack>
                      </Box>
                    </VStack>
                    {/* FORM ACTIONS */}
                    <HStack spacing={4} pt={4} justify="flex-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        px={8}
                      >
                        Discard
                      </Button>
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        isLoading={formLoading && saveAction === "save"}
                        onClick={() => setSaveAction("save")}
                        type="submit"
                        px={6}
                        h="50px"
                        borderRadius="xl"
                      >
                        Save Only
                      </Button>
                      <Button
                        colorScheme="blue"
                        type="submit"
                        isLoading={formLoading && saveAction === "saveAndWorkDone"}
                        onClick={() => setSaveAction("saveAndWorkDone")}
                        px={10}
                        h="50px"
                        borderRadius="xl"
                        leftIcon={<FiCheckCircle />}
                      >
                        Save & Create Work Done
                      </Button>
                    </HStack>

                  </VStack>
                </FormikForm>
                <CustomDrawer
                  open={showProcedureExplorer}
                  close={() => setShowProcedureExplorer(false)}
                  title={
                    <HStack spacing={3}>
                      <Box p={2} bg="blue.500" borderRadius="lg" color="white">
                        <FiActivity size={18} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Heading size="sm" color="white">Treatment Head</Heading>
                      </VStack>
                    </HStack>
                  }
                  width="85vw"
                  extraActions={
                    <Button
                      type="button"
                      colorScheme="blue"
                      onClick={() => {
                        setFieldValue("treatmentCode", tempTreatmentCode);
                        setShowProcedureExplorer(false);
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
                  <VStack spacing={4} align="stretch" h="full">
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
                          <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                            {groupedData.map((cat: any, idx: number) => (
                              <HStack
                                key={cat.name}
                                px={4} py={3.5}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedCategory(cat.name);
                                  setSelectedSubcategory(null);
                                  setSelectedName1(null);
                                  setSelectedName2(null);
                                  setSelectedName3(null);
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
                          <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                            {(activeCategory?.subcategories || []).map((sub: any) => (
                              <HStack
                                key={sub.name}
                                px={4} py={3.5}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedSubcategory(sub.name);
                                  setSelectedName1(null);
                                  setSelectedName2(null);
                                  setSelectedName3(null);
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
                          <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                            {(activeSubcategory?.name1s || []).map((n1: any) => (
                              <HStack
                                key={n1.name}
                                px={4} py={3.5}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedName1(n1.name);
                                  setSelectedName2(null);
                                  setSelectedName3(null);
                                  if (activeCategory && activeSubcategory) {
                                    setTempTreatmentCode(`${activeCategory.name} → ${activeSubcategory.name} → ${n1.name}`);
                                  }
                                }}
                                _hover={{ bg: "blue.50/50" }}
                                bg={selectedName1 === n1.name ? "blue.100" : "transparent"}
                                color={selectedName1 === n1.name ? "blue.800" : "gray.600"}
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
                          <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' } }}>
                            {(activeN1?.name2s || []).map((n2: any) => (
                              <HStack
                                key={n2.name}
                                px={4} py={3.5}
                                cursor="pointer"
                                onClick={() => {
                                  setSelectedName2(n2.name);
                                  setSelectedName3(null);
                                  if (activeCategory && activeSubcategory && activeN1) {
                                    setTempTreatmentCode(`${activeCategory.name} → ${activeSubcategory.name} → ${activeN1.name} → ${n2.name}`);
                                  }
                                }}
                                _hover={{ bg: "blue.50/50" }}
                                bg={selectedName2 === n2.name ? "blue.100" : "transparent"}
                                color={selectedName2 === n2.name ? "blue.800" : "gray.600"}
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
                          <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)" sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'blue.100', borderRadius: '10px' } }}>
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
              </>
            );
          }}
        </Formik>
      </CustomDrawer>
    );
  }
);
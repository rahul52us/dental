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
  onSuccess?: () => void;
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
  complaintType: "CHIEF COMPLAINT",
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
    complaintType = "CHIEF COMPLAINT",
  }: ToothFormDialogProps) => {
    const toast = useToast();
    const [showProcedureExplorer, setShowProcedureExplorer] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const {
      toothTreatmentStore: { createToothTreatment },
      procedureStore,
    } = stores;

    // Browser State
    const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null);
    const [selectedSubIdx, setSelectedSubIdx] = useState<number | null>(null);

    useEffect(() => {
      if (open) {
        procedureStore.getProcedures();
      }
    }, [open]);

    const groupedData = useMemo(() => {
      const dbData = procedureStore.procedures.data;
      if (dbData.length === 0) return TREATMENT_CATEGORIES;

      const map: any = {};
      dbData.forEach((p: any) => {
        if (!map[p.category]) map[p.category] = { name: p.category, subcategories: {} };
        if (!map[p.category].subcategories[p.subcategory]) {
          map[p.category].subcategories[p.subcategory] = { name: p.subcategory, jobs: [] };
        }
        map[p.category].subcategories[p.subcategory].jobs.push({
          name: p.name,
          estimateMin: p.estimateMin,
          estimateMax: p.estimateMax,
          defaultEstimate: p.defaultEstimate
        });
      });

      return Object.values(map).map((cat: any) => ({
        ...cat,
        subcategories: Object.values(cat.subcategories)
      }));
    }, [procedureStore.procedures.data]);

    const activeCategory = selectedCatIdx !== null ? groupedData[selectedCatIdx] : null;
    const activeSubcategory = (activeCategory && selectedSubIdx !== null)
      ? activeCategory.subcategories[selectedSubIdx]
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

        await Promise.all(promises);

        setFormLoading(false);
        toast({
          title: "Treatment Records Saved.",
          description: `${teeth.length} record(s) have been successfully added.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        if (onSuccess) onSuccess();
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
            <Text fontSize="xs" color="gray.400" fontWeight="bold">
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
            return (
              <FormikForm onSubmit={handleSubmit} style={{ height: '100%', padding: '20px' }}>
                <VStack spacing={6} align="stretch">

                  {/* PATIENT & DOCTOR CONTEXT HEADER */}
                  <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} bg="gray.50" p={5} borderRadius="2xl" border="1px" borderColor="gray.100">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">PATIENT</Text>
                      <Text fontWeight="black" color="gray.700" fontSize="sm" noOfLines={1}>{patientDetails?.name || "N/A"}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">ASSIGN DOCTOR</Text>
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
                      <Text fontSize="10px" fontWeight="black" color="gray.400">EXAMINING DOCTOR</Text>
                      <CustomInput
                        name="examiningDoctor"
                        type="real-time-user-search"
                        query={{ type: 'doctor' }}
                        options={doctorOptions}
                        value={values.examiningDoctor}
                        onChange={(val: any) => {
                          setFieldValue("examiningDoctor", val);
                          if (setLastExaminingDoctor) setLastExaminingDoctor(val);
                        }}
                        style={{ height: '32px', fontSize: '12px' }}
                      />
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">DATE</Text>
                      <CustomInput
                        name="treatmentDate"
                        type="date"
                        value={values.treatmentDate}
                        onChange={(e: any) => setFieldValue("treatmentDate", e.target.value)}
                        style={{ height: '32px', fontSize: '12px' }}
                      />
                    </VStack>
                  </Grid>

                  {/* COMPLAINT TYPE SELECTOR */}
                  <VStack align="start" spacing={3}>
                    <Text fontSize="10px" fontWeight="1000" color="gray.400" letterSpacing="0.1em">COMPLAINT TYPE</Text>
                    <HStack bg="gray.50" p={1} borderRadius="xl" w="full" spacing={2} border="1px solid" borderColor="gray.100">
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
                            h="36px"
                            fontSize="9px"
                            fontWeight="1000"
                            borderRadius="lg"
                            bg={styles.bg}
                            color={styles.color}
                            boxShadow={isActive ? "sm" : "none"}
                            onClick={() => setFieldValue("complaintType", type)}
                            _hover={{ opacity: 0.9 }}
                          >
                            {type}
                          </Button>
                        );
                      })}
                    </HStack>
                  </VStack>

                  {/* TREATMENT BROWSER SECTION */}

                  {/* FINANCIAL INPUTS SECTION */}
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} p={5} bg="blue.50/30" borderRadius="2xl" border="1px" borderColor="blue.100">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color="blue.500">Minimum Estimate (₹)</Text>
                      <Input
                        type="number"
                        placeholder="0.00"
                        bg="white"
                        value={values.estimateMin}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue("estimateMin", val);
                          setFieldValue("totalMin", calculateTotal(val, values.discount));
                        }}
                        borderRadius="xl"
                        fontWeight="bold"
                        borderColor="gray.200"
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color="blue.500">Maximum Estimate (₹)</Text>
                      <Input
                        type="number"
                        placeholder="0.00"
                        bg="white"
                        value={values.estimateMax}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue("estimateMax", val);
                          setFieldValue("totalMax", calculateTotal(val, values.discount));
                        }}
                        borderRadius="xl"
                        fontWeight="bold"
                        borderColor="gray.200"
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color="green.500">DISCOUNT (₹)</Text>
                      <Input
                        type="number"
                        placeholder="0.00"
                        bg="white"
                        value={values.discount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue("discount", val);
                          setFieldValue("totalMin", calculateTotal(values.estimateMin, val));
                          setFieldValue("totalMax", calculateTotal(values.estimateMax, val));
                        }}
                        borderRadius="xl"
                        fontWeight="bold"
                        borderColor="gray.200"
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </VStack>
                    <GridItem colSpan={{ base: 1, md: 3 }} pt={2}>
                      <HStack justify="space-between" align="center" w="full">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="10px" fontWeight="900" color="blue.400">TOTAL QUOTATION</Text>
                          <Text fontSize="20px" fontWeight="1000" color="blue.700">
                            ₹{Math.round(values.totalMin || 0).toLocaleString()} - ₹{Math.round(values.totalMax || 0).toLocaleString()}
                          </Text>
                        </VStack>
                        <Icon as={FiActivity} color="blue.200" boxSize={6} />
                      </HStack>
                    </GridItem>
                  </Grid>

                  <Divider />

                  {/* DESCRIPTION SECTION */}
                  <Box>
                    <HStack spacing={2} mb={3}>
                      <Icon as={FiFileText} color="blue.500" />
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">Description</Text>
                    </HStack>

                    <Box position="relative">
                      <CustomInput
                        name="notes"
                        type="textarea"
                        placeholder="Enter clinical description, patient concerns, or general notes here..."
                        value={values.notes}
                        onChange={(e: any) => setFieldValue("notes", e.target.value)}
                        style={{
                          minHeight: "120px",
                          borderRadius: "xl",
                          fontSize: "14px"
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
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Button
                        size="xs"
                        leftIcon={showProcedureExplorer ? <FiX /> : <FiPlusCircle />}
                        colorScheme={showProcedureExplorer ? "gray" : "blue"}
                        variant={showProcedureExplorer ? "ghost" : "solid"}
                        onClick={() => setShowProcedureExplorer(!showProcedureExplorer)}
                      >
                        {showProcedureExplorer ? "Hide Explorer" : "Open Procedure Explorer"}
                      </Button>
                    </HStack>

                    {showProcedureExplorer ? (
                      <Box
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.200"
                        overflow="hidden"
                        bg="white"
                      >
                        <Grid templateColumns="1fr 1fr 1.2fr" minH="300px" maxH="400px">
                          {/* COLUMN 1: CATEGORY */}
                          <Box borderRight="1px solid" borderColor="gray.200">
                            <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                              <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">Category</Text>
                            </Box>
                            <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)">
                              {groupedData.map((cat: any, idx: number) => (
                                <HStack
                                  key={cat.name}
                                  px={4} py={3}
                                  cursor="pointer"
                                  bg={selectedCatIdx === idx ? "blue.50" : "transparent"}
                                  color={selectedCatIdx === idx ? "blue.600" : "gray.700"}
                                  borderLeft={selectedCatIdx === idx ? "4px solid" : "0px"}
                                  borderLeftColor="blue.500"
                                  onClick={() => {
                                    setSelectedCatIdx(idx);
                                    setSelectedSubIdx(null);
                                    setFieldValue("treatmentCode", cat.name);
                                  }}
                                  _hover={{ bg: "gray.50" }}
                                  justify="space-between"
                                >
                                  <Text fontSize="sm" fontWeight={selectedCatIdx === idx ? "bold" : "medium"}>{cat.name}</Text>
                                  <FiChevronRight size={12} opacity={selectedCatIdx === idx ? 1 : 0.3} />
                                </HStack>
                              ))}
                            </VStack>
                          </Box>

                          {/* COLUMN 2: SUBCATEGORY */}
                          <Box borderRight="1px solid" borderColor="gray.200">
                            <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                              <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">Subcategory</Text>
                            </Box>
                            <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)">
                              {activeCategory?.subcategories.map((sub: any, idx) => (
                                <HStack
                                  key={sub.name}
                                  px={4} py={3}
                                  cursor="pointer"
                                  bg={selectedSubIdx === idx ? "blue.50" : "transparent"}
                                  color={selectedSubIdx === idx ? "blue.600" : "gray.700"}
                                  onClick={() => {
                                    setSelectedSubIdx(idx);
                                    if (activeCategory) {
                                      setFieldValue("treatmentCode", `${activeCategory.name} → ${sub.name}`);
                                    }
                                  }}
                                  _hover={{ bg: "gray.50" }}
                                  justify="space-between"
                                >
                                  <Text fontSize="sm" fontWeight={selectedSubIdx === idx ? "bold" : "medium"}>{sub.name}</Text>
                                  <FiChevronRight size={12} opacity={selectedSubIdx === idx ? 1 : 0.3} />
                                </HStack>
                              ))}
                            </VStack>
                          </Box>

                          {/* COLUMN 3: JOB NAME */}
                          <Box bg="gray.50/30">
                            <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.100">
                              <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase">Job Name</Text>
                            </Box>
                            <VStack spacing={0} align="stretch" overflowY="auto" h="calc(100% - 40px)">
                              {activeSubcategory?.jobs.map((job: any) => {
                                const fullCode = `${activeCategory?.name} → ${activeSubcategory?.name} → ${job.name}`;
                                const isSelected = values.treatmentCode === fullCode;
                                return (
                                  <VStack
                                    key={job.name}
                                    px={4} py={3}
                                    align="start"
                                    spacing={0}
                                    cursor="pointer"
                                    bg={isSelected ? "blue.500" : "transparent"}
                                    color={isSelected ? "white" : "gray.700"}
                                    onClick={() => {
                                      setFieldValue("treatmentCode", fullCode);
                                      // Clear amounts to ensure manual entry (user request)
                                    }}
                                    _hover={{ bg: isSelected ? "blue.600" : "gray.100" }}
                                  >
                                    <Text fontSize="sm" fontWeight="bold">{job.name}</Text>
                                  </VStack>
                                );
                              })}
                            </VStack>
                          </Box>
                        </Grid>
                      </Box>
                    ) : (
                      <Box p={4} bg="gray.50/50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                        <HStack justify="space-between" align="center">
                          <Text fontSize="sm" color={values.treatmentCode ? "blue.600" : "gray.400"} fontWeight={values.treatmentCode ? "bold" : "medium"}>
                            {values.treatmentCode || "Please select a procedure from the explorer above"}
                          </Text>
                          {values.treatmentCode && (
                            <IconButton
                              aria-label="Clear"
                              icon={<FiX />}
                              size="xs"
                              variant="ghost"
                              onClick={() => setFieldValue("treatmentCode", "")}
                            />
                          )}
                        </HStack>
                      </Box>
                    )}
                  </Box>
                  {/* FORM ACTIONS */}
                  <HStack spacing={4} pt={4} justify="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      px={8}
                    >
                      Discard
                    </Button>
                    <Button
                      colorScheme="blue"
                      type="submit"
                      isLoading={formLoading}
                      px={10}
                      h="50px"
                      borderRadius="xl"
                      leftIcon={<FiCheckCircle />}
                    >
                      Save Treatment Record
                    </Button>
                  </HStack>

                </VStack>
              </FormikForm>
            );
          }}
        </Formik>
      </CustomDrawer>
    );
  }
);
import { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Grid,
  HStack,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  useToast,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Center,
  Tooltip,
  Wrap,
  WrapItem,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import {
  FiFileText,
  FiUser,
  FiDollarSign,
  FiCheckCircle,
  FiChevronRight,
  FiSearch,
  FiClock,
  FiPlusCircle,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";
import { FaTooth } from "react-icons/fa";

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

// No symptom icons needed

export const ToothFormDialog = observer(
  ({
    teeth = [],
    generalDescription = "",
    open,
    onOpenChange,
    isPatient,
    patientDetails,
  }: ToothFormDialogProps) => {
    const toast = useToast();
    const [formLoading, setFormLoading] = useState(false);
    const {
      toothTreatmentStore: { createToothTreatment },
      userStore: { getAllUsers },
    } = stores;

    const [doctors, setDoctors] = useState<any[]>([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);

    useEffect(() => {
      const fetchDoctors = async () => {
        try {
          setDoctorsLoading(true);
          const res: any = await getAllUsers({ type: 'doctor', limit: 100 });
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
    }, [getAllUsers]);

    // Browser State
    const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(0);
    const [selectedSubIdx, setSelectedSubIdx] = useState<number | null>(0);

    const activeCategory = selectedCatIdx !== null ? TREATMENT_CATEGORIES[selectedCatIdx] : null;
    const activeSubcategory = (activeCategory && selectedSubIdx !== null)
      ? activeCategory.subcategories[selectedSubIdx]
      : null;

    const handleSubmit = async (formData: any) => {
      try {
        setFormLoading(true);
        const values = { ...formData };

        createToothTreatment({
          ...values,
          ...(replaceLabelValueObjects(values) || {}),
          teeth,
          generalDescription,
        })
          .then(() => {
            setFormLoading(false);
            toast({
              title: "Complaint Added.",
              description: `Record has been successfully added.`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            if (onOpenChange) {
              onOpenChange(false);
            }
          })
          .catch((err: any) => {
            setFormLoading(false);
            toast({
              title: "Failed to create",
              description: `${err?.message}`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          });
      } catch (err: any) {
        setFormLoading(false);
        toast({
          title: "Failed to create",
          description: `${err?.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const drawerTitle = (
      <HStack spacing={4}>
        <Box p={2} bg="blue.500" borderRadius="xl" color="white">
          <FiPlusCircle size={20} />
        </Box>
        <VStack align="start" spacing={0}>
          <Heading size="md" color="gray.800" fontWeight="extrabold">New Treatment Record</Heading>
          <Text fontSize="xs" color="gray.400" fontWeight="bold">PROCEDURE ENTRY FORM</Text>
        </VStack>
      </HStack>
    );

    const doctorOptions = useMemo(() => {
      return doctors.map((d) => ({
        label: d.name,
        value: d._id,
      }));
    }, [doctors]);

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
            doctor: doctorOptions[0],
          }}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, handleSubmit }: any) => {
            const calculateTotal = (est: number, disc: number) => Math.max(0, est - disc);

            return (
              <FormikForm onSubmit={handleSubmit} style={{ height: '100%', padding: '20px' }}>
                <VStack spacing={6} align="stretch">

                  {/* PATIENT & DOCTOR CONTEXT HEADER */}
                  <SimpleGrid columns={3} spacing={6} bg="gray.50" p={6} borderRadius="2xl" border="1px" borderColor="gray.100">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">PATIENT NAME</Text>
                      <Text fontWeight="black" color="gray.700" fontSize="md">{patientDetails?.name || "N/A"}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">ASSIGNED DOCTOR</Text>
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
                        />
                      </Box>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">DATE</Text>
                      <CustomInput
                        name="treatmentDate"
                        type="date"
                        value={values.treatmentDate}
                        onChange={(e: any) => setFieldValue("treatmentDate", e.target.value)}
                      />
                    </VStack>
                  </SimpleGrid>

                  {/* TREATMENT BROWSER SECTION (As per Image) */}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>Treatment Code</Text>

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
                            {TREATMENT_CATEGORIES.map((cat, idx) => (
                              <HStack
                                key={cat.name}
                                px={4} py={3}
                                cursor="pointer"
                                bg={selectedCatIdx === idx ? "blue.50" : "transparent"}
                                color={selectedCatIdx === idx ? "blue.600" : "gray.700"}
                                borderLeft={selectedCatIdx === idx ? "4px solid" : "0px"}
                                borderLeftColor="blue.500"
                                onClick={() => { setSelectedCatIdx(idx); setSelectedSubIdx(0); }}
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
                            {activeCategory?.subcategories.map((sub, idx) => (
                              <HStack
                                key={sub.name}
                                px={4} py={3}
                                cursor="pointer"
                                bg={selectedSubIdx === idx ? "blue.50" : "transparent"}
                                color={selectedSubIdx === idx ? "blue.600" : "gray.700"}
                                onClick={() => setSelectedSubIdx(idx)}
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
                            {activeSubcategory?.jobs.map((job) => {
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
                                    setFieldValue("estimate", job.defaultEstimate);
                                    setFieldValue("total", calculateTotal(job.defaultEstimate, values.discount));
                                  }}
                                  _hover={{ bg: isSelected ? "blue.600" : "gray.100" }}
                                >
                                  <Text fontSize="sm" fontWeight="bold">{job.name}</Text>
                                  <Text fontSize="xs" color={isSelected ? "whiteAlpha.800" : "gray.400"}>₹{job.defaultEstimate.toLocaleString()}</Text>
                                </VStack>
                              );
                            })}
                          </VStack>
                        </Box>
                      </Grid>
                    </Box>
                  </Box>

                  {/* FINANCIAL INPUTS SECTION */}
                  <SimpleGrid columns={3} spacing={6}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">Estimated Amount (₹)</Text>
                      <Input
                        readOnly
                        value={values.estimate}
                        bg="gray.50"
                        borderRadius="xl"
                        fontWeight="bold"
                        border="1px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">Discount (₹)</Text>
                      <Input
                        type="number"
                        value={values.discount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFieldValue("discount", val);
                          setFieldValue("total", calculateTotal(values.estimate, val));
                        }}
                        borderRadius="xl"
                        fontWeight="bold"
                        borderColor="gray.200"
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">Total (₹)</Text>
                      <Input
                        readOnly
                        value={values.total}
                        bg="blue.50"
                        color="blue.700"
                        borderRadius="xl"
                        fontWeight="black"
                        border="2px solid"
                        borderColor="blue.100"
                      />
                    </VStack>
                  </SimpleGrid>

                  <Divider />

                  {/* DESCRIPTION SECTION (Simplified) */}
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
                          minHeight: "150px",
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
                      isDisabled={!values.treatmentCode}
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
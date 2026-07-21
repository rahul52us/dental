"use client";
import { Box, Text, Badge, HStack, Circle, VStack, SimpleGrid, IconButton, Flex, Input, Button, Heading, Icon, Tooltip, Divider, Spinner, Center, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Grid } from "@chakra-ui/react";

import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState, useMemo } from "react";
import CustomDrawer from "../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import stores from "../../store/stores";
import Index from "../../component/common/TeethModel/DentalChartComponent";
import { PatientHeader } from "../../component/common/TeethModel/DentalChartComponent/component/PatientHeader";
import TreatmentDetailsView from "./element/TreatmentDetailsView";
import { FiGrid, FiList, FiEye, FiEdit3, FiSearch, FiActivity, FiTrash2 } from "react-icons/fi";
import { FaTooth } from "react-icons/fa";
import Pagination from "../../component/config/component/pagination/Pagination";
import WorkDoneForm from "../workDone/component/WorkDoneForm";
import WorkDoneList from "../workDone/component/WorkDoneList";
import PatientWorkDoneHistory from "../patients/component/patient/PatientWorkDoneHistory";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { FiCheckCircle, FiCalendar } from "react-icons/fi";
import { adultTeeth, childTeeth } from "../../component/common/TeethModel/DentalChartComponent/utils/teethData";
import CreatableSelect from "react-select/creatable";
import { FiDownload } from "react-icons/fi";





const SittingAssigner = ({ dt, onSave }: { dt: any, onSave: () => void }) => {
  const [val, setVal] = useState<string>(dt.sittingNo ? String(dt.sittingNo) : "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!val || val === String(dt.sittingNo)) return;
    setLoading(true);
    try {
      await stores.toothTreatmentStore.assignSittingNo({ treatmentId: dt._id, sittingNo: Number(val) });
      stores.auth.openNotification({ type: "success", title: "Sitting Assigned", message: "Sitting number updated successfully." });
      onSave();
    } catch (err: any) {
      stores.auth.openNotification({ type: "error", title: "Error", message: err?.message || "Failed to assign sitting" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      align="center"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="lg"
      bg="white"
      w="100px"
      overflow="hidden"
      _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
    >
      <Input
        variant="unstyled"
        size="sm"
        textAlign="center"
        placeholder="No."
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
        }}
        px={2}
        h="32px"
      />
      <Divider orientation="vertical" h="20px" borderColor="gray.300" />
      <IconButton
        size="sm"
        variant="ghost"
        aria-label="Save Sitting"
        icon={loading ? <Spinner size="xs" /> : <FiCheckCircle />}
        colorScheme="blue"
        onClick={handleSave}
        isDisabled={loading || val === String(dt.sittingNo)}
        minW="32px"
        h="32px"
        borderRadius="0"
        _hover={{ bg: "blue.50", color: "blue.600" }}
      />
    </Flex>
  );
};

const TreatmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    toothTreatmentStore: { getToothTreatments, toothTreatment, deleteToothTreatment },
    auth: { openNotification, userType },
  } = stores;

  const [openView, setOpenView] = useState({ open: false, data: null });
  const [isTableView, setIsTableView] = useState<"table" | "card">("card");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openReportModal, setOpenReportModal] = useState<any>({
    open: false,
    type: "add",
    data: null
  });
  const [openWorkDone, setOpenWorkDone] = useState({ open: false, data: null as any });
  const [workDoneTab, setWorkDoneTab] = useState(1);


  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sittingNoSearch, setSittingNoSearch] = useState<any[]>([]);
  const [complaintTypeFilter, setComplaintTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [backendCounts, setBackendCounts] = useState<any[]>([]);
  const [isCounting, setIsCounting] = useState(false);
  const [countSearch, setCountSearch] = useState("");
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [tablePreviewDrawer, setTablePreviewDrawer] = useState({ open: false, data: null as any });

  const totalSummaryStats = useMemo(() => {
    if (!backendCounts || backendCounts.length === 0) return { totalVisits: 0, totalTreatments: 0 };
    return backendCounts.reduce((acc, curr) => {
      acc.totalVisits += 1;
      acc.totalTreatments += curr.count || 0;
      return acc;
    }, { totalVisits: 0, totalTreatments: 0 });
  }, [backendCounts]);

  const filteredCounts = useMemo(() => {
    if (!countSearch) return backendCounts;
    return backendCounts.filter((item) => {
      const dateStr = new Date(item.date).toLocaleDateString('en-IN', { dateStyle: 'long' }).toLowerCase();
      return dateStr.includes(countSearch.toLowerCase());
    });
  }, [backendCounts, countSearch]);

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllRecords = useCallback(
    ({ page = currentPage, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (sittingNoSearch && sittingNoSearch.length > 0) {
        query.sittingNo = sittingNoSearch.map((s: any) => s.value || s).join(',');
      }

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      if (isPatient && patientDetails) {
        query.patientId = patientDetails?._id;
      }

      if (complaintTypeFilter !== "all") {
        query.complaintType = complaintTypeFilter;
      }

      if (statusFilter !== "all") {
        query.status = statusFilter;
      }

      if (selectedDateFilter) {
        query.fromDate = `${selectedDateFilter}T00:00:00.000Z`;
        query.toDate = `${selectedDateFilter}T23:59:59.999Z`;
      }

      getToothTreatments(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to get treatment",
          message: err?.message,
        });
      });
    },
    [
      debouncedSearchQuery,
      getToothTreatments,
      openNotification,
      currentPage,
      patientDetails,
      complaintTypeFilter,
      statusFilter,
      sittingNoSearch,
    ]
  );

  useEffect(() => {
    applyGetAllRecords({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, sittingNoSearch, complaintTypeFilter, statusFilter, selectedDateFilter, applyGetAllRecords]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setSittingNoSearch([]);
    setComplaintTypeFilter("all");
    setStatusFilter("all");
    setSelectedDateFilter(null);
    applyGetAllRecords({ page: 1, reset: true });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteToothTreatment(id);
        openNotification({
          type: "success",
          title: "Record Deleted",
          message: "Treatment record has been successfully removed."
        });
        applyGetAllRecords({ page: currentPage });
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Delete Failed",
          message: err?.message || "Something went wrong"
        });
      }
    }
  };

  const handleDownloadTable = async () => {
    setIsDownloadingData(true);
    try {
      const query: any = {
        company: stores.auth.company,
      };

      if (isPatient && patientDetails) {
        query.patientId = patientDetails?._id;
      }

      if (sittingNoSearch && sittingNoSearch.length > 0) {
        query.sittingNo = sittingNoSearch.map((s: any) => s.value || s).join(',');
      }

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (complaintTypeFilter !== "all") {
        query.complaintType = complaintTypeFilter;
      }

      if (statusFilter !== "all") {
        query.status = statusFilter;
      }

      if (selectedDateFilter) {
        query.fromDate = `${selectedDateFilter}T00:00:00.000Z`;
        query.toDate = `${selectedDateFilter}T23:59:59.999Z`;
      }

      const pId = patientDetails?._id || query.patientId || "all";
      const base64Pdf = await stores.toothTreatmentStore.fetchFilteredTreatmentTablePDFBase64(pId, query);
      setTablePreviewDrawer({ open: true, data: base64Pdf });
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Download Failed",
        message: err?.message || "Failed to generate report",
      });
    } finally {
      setIsDownloadingData(false);
    }
  };


  /* ---------------- Patient Column ---------------- */
  const patientColumn = {
    headerName: "Patient",
    key: "patientName",
    metaData: {
      component: (dt: any) => (
        <Box>
          <Text fontWeight="medium">{dt?.patientName || "--"}</Text>
        </Box>
      ),
    },
    props: { row: { textAlign: "center" } },
  };

  /* ---------------- Table Columns ---------------- */
  const ContactTableColumn = [
    {
      headerName: "Tooth",
      key: "toothFDI",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text fontSize="sm" fontWeight="bold">{dt?.toothFDI || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "System",
      key: "toothNotation",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={
            <Box>
              <Text fontWeight="bold">{(dt?.toothNotation || "FDI").toUpperCase()}</Text>
              {dt?.toothName && <Text fontSize="sm">{dt?.toothName}</Text>}
            </Box>
          } placement="top" hasArrow>
            <VStack spacing={0} maxW="100px" align="center" justify="center">
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
                {(dt?.toothNotation || "FDI").toUpperCase()}
              </Badge>
              {dt?.toothName && (
                <Text fontSize="10px" color="gray.500" noOfLines={1}>
                  {dt?.toothName}
                </Text>
              )}
            </VStack>
          </Tooltip>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    {
      headerName: "Treatment Plan",
      key: "treatmentPlan",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={
            <Box>
              <Text fontWeight="bold">{dt.treatmentPlan || "General Consultation"}</Text>
              {dt.notes && <Text fontStyle="italic" fontSize="xs" mt={1}>{dt.notes}</Text>}
            </Box>
          } placement="top" hasArrow>
            <VStack align="start" spacing={0} maxW="200px">
              <Text fontSize="sm" fontWeight="bold" color="gray.800" noOfLines={1}>
                {dt.treatmentPlan || "General Consultation"}
              </Text>
              {dt.notes && (
                <Text fontSize="xs" color="gray.500" fontStyle="italic" noOfLines={1}>
                  {dt.notes}
                </Text>
              )}
            </VStack>
          </Tooltip>
        ),
      },
      props: {
        row: { textAlign: "left" },
        column: { textAlign: "left" },
      },
    },

    ...(!isPatient ? [patientColumn] : []),

    {
      headerName: "Doctor",
      key: "doctorName",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={dt?.doctorName || "--"} placement="top" hasArrow>
            <Box maxW="120px">
              <Text noOfLines={1}>{dt?.doctorName || "--"}</Text>
            </Box>
          </Tooltip>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Examining Doctor",
      key: "examiningDoctorName",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={dt?.examiningDoctorName || "--"} placement="top" hasArrow>
            <Box maxW="120px">
              <Text noOfLines={1}>{dt?.examiningDoctorName || "--"}</Text>
            </Box>
          </Tooltip>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Complaint Type",
      key: "complaintType",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Badge
              colorScheme={
                dt?.complaintType?.toUpperCase() === "CHIEF COMPLAINT" ? "red" :
                  dt?.complaintType?.toUpperCase() === "OTHER FINDING" ? "orange" :
                    dt?.complaintType?.toUpperCase() === "EXISTING FINDING" ? "green" : "gray"
              }
              variant="subtle"
              borderRadius="full"
              px={2}
            >
              {dt?.complaintType || "--"}
            </Badge>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Est Min",
      key: "estimateMin",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="bold" color="blue.600">₹{dt?.estimateMin || 0}</Text>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Est Max",
      key: "estimateMax",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="bold" color="blue.600">₹{dt?.estimateMax || 0}</Text>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    {
      headerName: "Sitting No",
      key: "sittingNo",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const isPendingOrIncomplete = dt.status?.toLowerCase() === "pending" || dt.status?.toLowerCase() === "incomplete";
          return (
            <Box>
              {isPendingOrIncomplete ? (
                <SittingAssigner dt={dt} onSave={() => applyGetAllRecords({ page: currentPage })} />
              ) : (
                <Text fontWeight="bold">{dt.sittingNo || "--"}</Text>
              )}
            </Box>
          );
        },
      },
      props: { row: { textAlign: "center" } },
    },

    {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const getStatusColor = (status: string) => {
            const s = status?.toUpperCase();
            switch (s) {
              case "PENDING":
                return "orange";
              case "COMPLETE":
              case "COMPLETED":
                return "green";
              case "INCOMPLETE":
              case "CANCELLED":
                return "red";
              default:
                return "gray";
            }
          };

          if (dt.complaintType?.toUpperCase() === "EXISTING FINDING") {
            return <Box px={3} py={1} fontSize="sm" color="gray.400">--</Box>;
          }

          return (
            <Box
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
              textTransform="capitalize"
              bg={`${getStatusColor(dt.status)}.100`}
              color={`${getStatusColor(dt.status)}.700`}
              display="inline-block"
            >
              {dt.status?.replace("-", " ") || "—"}
            </Box>
          );
        },
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },

    {
      headerName: "Treatment Date",
      key: "treatmentDate",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{formatDate(dt?.treatmentDate)}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },

    {
      headerName: "Actions",
      key: "table-actions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={1} justify="center">
            <Tooltip label="Add Work Done">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="orange"
                icon={<Text fontWeight="900" fontSize="15px">W</Text>}
                aria-label="Work Done"
                onClick={(e) => {
                  e.stopPropagation();
                  setWorkDoneTab(1);
                  setOpenWorkDone({ open: true, data: dt });
                }}
              />
            </Tooltip>
            {stores.auth.hasPermission('treatment', 'view') && (
              <Tooltip label="View Record">
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  icon={<FiEye />}
                  aria-label="View"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenView({ open: true, data: dt });
                  }}
                />
              </Tooltip>
            )}
            {stores.auth.hasPermission('treatment', 'edit') && (
              <Tooltip label="Edit Record">
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  icon={<FiEdit3 />}
                  aria-label="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenReportModal({ open: true, type: "edit", data: dt });
                  }}
                />
              </Tooltip>
            )}
            {stores.auth.hasPermission('treatment', 'delete') && (
              <Tooltip label="Delete Record">
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  icon={<FiTrash2 />}
                  aria-label="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(dt._id);
                  }}
                />
              </Tooltip>
            )}
          </HStack>
        ),
      },
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  const subTitle = patientDetails?.name;

  const renderCard = (dt: any) => {
    const statusColors: any = {
      PENDING: "orange",
      COMPLETE: "green",
      COMPLETED: "green",
      INCOMPLETE: "red",
      CANCELLED: "red",
      PLANNED: "gray",
    };
    const color = statusColors[dt.status?.toUpperCase()] || "gray";
    const displayToothFDI = typeof dt.toothFDI === 'object' && dt.toothFDI !== null ? (dt.toothFDI.fdi || dt.toothFDI.fd1 || dt.toothFDI.universal || "") : dt.toothFDI;
    const toothValue = (typeof dt.tooth === 'object' && dt.tooth !== null) ? (dt.tooth.fdi || dt.tooth.fd1 || dt.tooth.id1 || dt.tooth.id || dt.tooth.universal || "") : dt.tooth;

    const getToothNameParts = (toothId: string, fallbackPosition?: string, fallbackSide?: string) => {
      if (!toothId || toothId === "General") {
        const line1 = `${fallbackSide || ""} ${fallbackPosition || ""}`.trim().toUpperCase();
        return { line1: line1 || "GENERAL", line2: "" };
      }
      const idStr = String(toothId).trim();
      const tooth = adultTeeth.find(t => t.id === idStr) || childTeeth.find(t => t.id === idStr);
      if (!tooth) {
        const line1 = `${fallbackSide || ""} ${fallbackPosition || ""}`.trim().toUpperCase();
        return { line1: line1 || "GENERAL", line2: "" };
      }

      const line1 = `${tooth.side} ${tooth.position}`.toUpperCase();
      let line2 = tooth.name;
      line2 = line2.replace(/primary/gi, "").trim();
      const sideRegex = new RegExp(tooth.side, "gi");
      const posRegex = new RegExp(tooth.position, "gi");
      line2 = line2.replace(sideRegex, "").replace(posRegex, "").trim();
      line2 = line2.replace(/\s+/g, " ").toUpperCase();

      return { line1, line2 };
    };

    const { line1, line2 } = getToothNameParts(
      displayToothFDI || toothValue,
      dt.position,
      dt.side
    );

    return (
      <Box
        key={dt._id}
        bg="white"
        p={5}
        borderRadius="3xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
        transition="all 0.2s"
        position="relative"
        _hover={{ shadow: "md", transform: "translateY(-2px)", borderColor: "blue.200" }}
      >
        <Flex align="start" gap={6}>
          {/* Left side: Tooth Identifier Box */}
          <VStack
            align="center"
            justify="center"
            bg="blue.50"
            border="2px solid"
            borderColor="blue.300"
            borderRadius="2xl"
            p={4}
            minW="120px"
            shadow="sm"
            transition="all 0.2s"
            _hover={{ bg: "blue.100", borderColor: "blue.400" }}
          >
            <Text fontSize="34px" fontWeight="1000" color="blue.800" lineHeight="1" my={2}>
              {displayToothFDI === "General" || toothValue === "General" ? "GEN" : (displayToothFDI || toothValue || "??")}
            </Text>
            <Text fontSize="9px" fontWeight="1000" color="blue.500" letterSpacing="0.08em" mb={1} textTransform="uppercase" textAlign="center">
              {line1}
            </Text>
            {line2 && (
              <Text fontSize="9px" fontWeight="1000" color="gray.600" textTransform="uppercase" textAlign="center" letterSpacing="0.02em">
                {line2}
              </Text>
            )}
          </VStack>

          {/* Middle part: Details */}
          <VStack align="start" spacing={2} flex={1}>
            <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="widest" textTransform="uppercase">
              {formatDate(dt.treatmentDate)}
            </Text>

            <HStack spacing={2}>
              {dt.complaintType && (
                <Badge colorScheme="red" variant="subtle" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                  {dt.complaintType?.toUpperCase()}
                </Badge>
              )}
              {dt.complaintType?.toUpperCase() !== "EXISTING FINDING" && (
                <Badge colorScheme={color} variant="subtle" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                  {dt.status?.toUpperCase() || "PENDING"}
                </Badge>
              )}
              {(dt.estimateMin || dt.estimateMax) && (
                <Badge colorScheme="blue" variant="outline" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                  ₹{dt.estimateMin || 0} - ₹{dt.estimateMax || 0}
                </Badge>
              )}
              {dt.sittingNo ? (
                 <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                   Sitting: {dt.sittingNo}
                 </Badge>
              ) : null}
            </HStack>



            {dt.notes && (
              <Box
                bg="blue.50"
                p={3}
                borderRadius="xl"
                border="1px solid"
                borderColor="blue.100"
                w="full"
                mt={1}
              >
                <Text fontSize="lg" fontWeight="bold" color="gray.800" fontStyle="italic" noOfLines={2}>
                  {dt.notes}
                </Text>
              </Box>
            )}

            <Text fontSize="lg" fontWeight="800" color="gray.800" noOfLines={2} pt={1}>
              {dt.treatmentPlan || "General Consultation"}
            </Text>
          </VStack>

          {/* Right side: Floating Actions */}
          <HStack
            position="absolute"
            top={4}
            right={4}
            spacing={2}
          >
            {(dt.status?.toLowerCase() === "pending" || dt.status?.toLowerCase() === "incomplete") && (
              <HStack align="center" spacing={2} bg="gray.50" p={2} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" pl={2}>Plan TMT Sitting Wise :</Text>
                <SittingAssigner dt={dt} onSave={() => applyGetAllRecords({ page: currentPage })} />
              </HStack>
            )}

            <HStack
              spacing={1}
              bg="gray.50"
              p={2}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.100"
            >
            <Tooltip label="Add Work Done">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="orange"
                icon={<Text fontWeight="900" fontSize="15px">W</Text>}
                aria-label="Work Done"
                onClick={() => {
                  setWorkDoneTab(1);
                  setOpenWorkDone({ open: true, data: dt });
                }}
              />
            </Tooltip>
            {/* <Tooltip label="View Treatment">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="green"
                icon={<FaTooth />}
                aria-label="Add"
                onClick={() => {
                  const { _id, ...rest } = dt;
                  setOpenReportModal({ open: true, type: "add", data: { ...rest, _isContextualAdd: true } });
                }}
              />
            </Tooltip> */}
            <HStack spacing={0}>
            {stores.auth.hasPermission('treatment', 'view') && (
              <Tooltip label="View Treatment">
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  icon={<FiEye />}
                  aria-label="View"
                  onClick={() => setOpenView({ open: true, data: dt })}
                />
              </Tooltip>
            )}
            {stores.auth.hasPermission('treatment', 'edit') && (
              <Tooltip label="Edit Record">
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  icon={<FiEdit3 />}
                  aria-label="Edit"
                  onClick={() => setOpenReportModal({ open: true, type: "edit", data: dt })}
                />
              </Tooltip>
            )}
            {stores.auth.hasPermission('treatment', 'delete') && (
              <Tooltip label="Delete Record">
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  icon={<FiTrash2 />}
                  aria-label="Delete"
                  onClick={() => handleDelete(dt._id)}
                />
              </Tooltip>
            )}
            </HStack>
          </HStack>
          </HStack>
        </Flex>
      </Box>
    );
  };


  const [activeTab, setActiveTab] = useState(1);

  return (
    <>
      <Tabs
        variant="line"
        colorScheme="blue"
        index={activeTab}
        onChange={(idx) => {
          setActiveTab(idx);
          if (idx === 1) {
            applyGetAllRecords({ page: currentPage });
          }
        }}
        isLazy
        lazyBehavior="unmount"
      >
        <TabList mb={0} borderBottom="2px solid" borderColor="gray.100" px={2}>
          <Tab
            fontWeight="bold"
            fontSize="14px"
            px={6}
            py={3}
            _selected={{
              color: "blue.700",
              borderColor: "blue.600",
              borderBottomWidth: "3px",
              bg: "blue.50",
              borderTopRadius: "lg",
            }}
          >
            Create Treatment Advise & Work Done
          </Tab>
          <Tab
            fontWeight="bold"
            fontSize="14px"
            px={6}
            py={3}
            _selected={{
              color: "blue.700",
              borderColor: "blue.600",
              borderBottomWidth: "3px",
              bg: "blue.50",
              borderTopRadius: "lg",
            }}
          >
            Previous Treatment Plan History
          </Tab>
          <Tab
            fontWeight="bold"
            fontSize="14px"
            px={6}
            py={3}
            _selected={{
              color: "blue.700",
              borderColor: "blue.600",
              borderBottomWidth: "3px",
              bg: "blue.50",
              borderTopRadius: "lg",
            }}
          >
            All Work Done History
          </Tab>
        </TabList>

        <TabPanels>
          {/* ── TAB 1: Create Treatment ─────────────────────────── */}
          <TabPanel p={0}>
            <Index
              appointments={toothTreatment}
              isPatient={isPatient}
              patientDetails={{ ...patientDetails, editData: openReportModal.data, applyGetAllRecords }}
              closeWizard={() => {
                setOpenReportModal({ open: false, type: "add", data: null });
                setActiveTab(1); // switch to Previous Records after saving
              }}
              onSaveAndWorkDone={(treatment: any) => {
                setOpenReportModal({ open: false, type: "add", data: null });
                setActiveTab(2); // Optionally switch to Work Done tab or stay
                setWorkDoneTab(0); // Default to form tab
                setOpenWorkDone({ open: true, data: treatment });
              }}
            />
          </TabPanel>

          {/* ── TAB 2: Previous Records ─────────────────────────── */}
          <TabPanel p={0} pt={4}>
            <Box>
              {/* Filters Bar */}
              <Flex
                bg="white"
                p={4}
                borderRadius="2xl"
                shadow="xs"
                border="1px solid"
                borderColor="gray.100"
                mb={4}
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={4}
              >
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="blue.600">Treatment Records ({toothTreatment?.totalItems || 0})</Heading>
                  {subTitle && <Text fontSize="xs" color="gray.500" fontWeight="bold">PATIENT: {subTitle.toUpperCase()}</Text>}
                </VStack>

                <HStack spacing={4} flex={1} w="full" justify="flex-end" flexWrap="wrap">
                  <HStack bg="gray.50" px={3} borderRadius="full" border="1px solid" borderColor="gray.200" flex={1} minW="250px">
                    <Icon as={FiSearch} color="gray.400" />
                    <Input
                      placeholder="Search clinical records..."
                      variant="unstyled"
                      py={2}
                      fontSize="sm"
                      w="full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </HStack>

                  <Tooltip label="Sitting Number" hasArrow placement="top">
                    <Box w="150px" zIndex={10}>
                      <CreatableSelect
                        isMulti
                        placeholder="Sitting No"
                        value={sittingNoSearch}
                        onChange={(newVal) => setSittingNoSearch(newVal as any)}
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: 'full',
                            borderColor: '#E2E8F0',
                            minHeight: '40px',
                            fontSize: '14px',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#CBD5E1'
                            }
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#EBF8FF',
                            borderRadius: '4px'
                          })
                        }}
                      />
                    </Box>
                  </Tooltip>

                  <Box w="220px">
                    <select
                      value={complaintTypeFilter}
                      onChange={(e) => setComplaintTypeFilter(e.target.value)}
                      style={{
                        width: '100%', height: '42px', borderRadius: '16px',
                        padding: '0 12px', fontSize: '14px', border: '1px solid #E2E8F0',
                        background: 'white', fontWeight: '700', color: '#4A5568',
                        outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Complaints</option>
                      <option value="CHIEF COMPLAINT">CHIEF COMPLAINT</option>
                      <option value="OTHER FINDING">OTHER FINDING</option>
                      <option value="EXISTING FINDING">EXISTING FINDING</option>
                    </select>
                  </Box>

                  <Box w="220px">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        width: '100%', height: '42px', borderRadius: '16px',
                        padding: '0 12px', fontSize: '14px', border: '1px solid #E2E8F0',
                        background: 'white', fontWeight: '700', color: '#4A5568',
                        outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">PENDING</option>
                      <option value="complete">COMPLETE</option>
                      <option value="incomplete">INCOMPLETE</option>
                    </select>
                  </Box>

                  <HStack spacing={2}>
                    {stores.auth.hasPermission('treatment', 'view') && (
                      <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<FiCalendar />}
                        onClick={() => {
                          setIsCounting(true);
                          stores.toothTreatmentStore.getToothTreatmentCountByDate({ patientId: patientDetails?._id })
                            .then((res: any) => {
                              if (res?.status === "success" || res?.success === "success" || res?.statusCode === 200) {
                                setBackendCounts(res.data || []);
                              }
                            })
                            .catch((err: any) => console.error("Failed to load counts:", err))
                            .finally(() => setIsCounting(false));
                          setIsCountModalOpen(true);
                        }}
                      >
                        View Work Dates
                      </Button>
                    )}
                    {stores.auth.hasPermission('treatment', 'download') && (
                      <Button
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<FiDownload />}
                        isLoading={isDownloadingData}
                        onClick={handleDownloadTable}
                      >
                        ALL WORK DATA
                      </Button>
                    )}
                    {/* {isPatient && stores.auth.hasPermission('treatment', 'create') && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => setOpenReportModal({ open: true, type: "add", data: null })}
                      >
                        + ADD TREATMENT
                      </Button>
                    )} */}
                    <Circle size="28px" bg="blue.50" color="blue.500" fontWeight="900" fontSize="12px" border="1px solid" borderColor="blue.100">
                      {toothTreatment?.totalItems || 0}
                    </Circle>
                  </HStack>

                  <HStack bg="gray.100" p={1} borderRadius="xl">
                    <IconButton
                      size="sm"
                      variant={isTableView === "card" ? "solid" : "ghost"}
                      colorScheme={isTableView === "card" ? "blue" : "gray"}
                      icon={<FiGrid />}
                      onClick={() => setIsTableView("card")}
                      aria-label="Grid View"
                    />
                    <IconButton
                      size="sm"
                      variant={isTableView === "table" ? "solid" : "ghost"}
                      colorScheme={isTableView === "table" ? "blue" : "gray"}
                      icon={<FiList />}
                      onClick={() => setIsTableView("table")}
                      aria-label="List View"
                    />
                  </HStack>
                </HStack>
              </Flex>

              {isTableView === "table" ? (
                <CustomTable
                  data={toothTreatment?.data || []}
                  columns={ContactTableColumn}
                  loading={toothTreatment?.loading}
                  actions={{
                    pagination: {
                      show: true,
                      onClick: handleChangePage,
                      currentPage,
                      totalPages: toothTreatment?.totalPages,
                    }
                  }}
                />
              ) : (
                <VStack align="stretch" spacing={6}>
                  {toothTreatment?.loading ? (
                    <Center py={20}>
                      <VStack spacing={4}>
                        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
                        <Text color="gray.500" fontWeight="bold">Fetching treatment history...</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <>
                      <SimpleGrid columns={{ base: 1, md: 1, lg: 1 }} spacing={6}>
                        {toothTreatment?.data?.map((dt: any) => renderCard(dt))}
                      </SimpleGrid>

                      {toothTreatment?.totalPages > 1 && (
                        <Flex justify="center" pt={4}>
                          <Pagination
                            currentPage={currentPage}
                            onPageChange={handleChangePage}
                            totalPages={toothTreatment?.totalPages}
                          />
                        </Flex>
                      )}

                      {!toothTreatment?.loading && toothTreatment?.data?.length === 0 && (
                        <VStack py={20} bg="white" borderRadius="3xl" border="1px dashed" borderColor="gray.200">
                          <Icon as={FiActivity} fontSize="40px" color="gray.200" />
                          <Text fontWeight="bold" color="gray.400">No matching records found</Text>
                        </VStack>
                      )}
                    </>
                  )}
                </VStack>
              )}
            </Box>
          </TabPanel>

          {/* ── TAB 3: Work Done History ─────────────────────────── */}
          <TabPanel p={0} pt={4}>
            <PatientWorkDoneHistory patientDetails={patientDetails} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* View drawer */}
      <CustomDrawer
        width={"80vw"}
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title={<PatientHeader title="Clinical Procedure Details" patient={openView.data?.patient || patientDetails} />}
      >
        <TreatmentDetailsView data={openView.data} />
      </CustomDrawer>

      {/* Edit drawer (only for editing existing records) */}
      <CustomDrawer
        width="90vw"
        open={openReportModal.open && openReportModal.type === "edit"}
        close={() => setOpenReportModal({ open: false, type: "add", data: null })}
        title={<PatientHeader title="Edit Treatment" patient={patientDetails} />}
      >
        <Index
          appointments={toothTreatment}
          isPatient={isPatient}
          patientDetails={{ ...patientDetails, editData: openReportModal.data, applyGetAllRecords }}
          closeWizard={() => setOpenReportModal({ open: false, type: "add", data: null })}
        />
      </CustomDrawer>

      {/* Work Done Drawer */}
      {openWorkDone.open && (
        <CustomDrawer
          open={openWorkDone.open}
          close={() => setOpenWorkDone({ open: false, data: null })}
          title={`Work Done: ${openWorkDone.data?.patient?.name || patientDetails?.name || "Patient"}`}
          width={{ base: "100%", md: "90%" }}
        >
          <Box px={6}>
            <Tabs variant="line" colorScheme="blue" index={workDoneTab} onChange={(idx) => setWorkDoneTab(idx)} isLazy lazyBehavior="unmount">
              <TabList mb="1em">
                <Tab fontWeight="bold" fontSize="14px" px={6} _selected={{ color: "blue.700", borderColor: "blue.600", borderBottomWidth: "3px", bg: "blue.100", borderTopRadius: "lg" }}>
                  New Work Entry
                </Tab>
                <Tab fontWeight="bold" fontSize="14px" px={6} _selected={{ color: "blue.700", borderColor: "blue.600", borderBottomWidth: "3px", bg: "blue.100", borderTopRadius: "lg" }}>
                  <Tooltip label="To View full work go to main Work Done History" hasArrow placement="top">
                    <span>Previous work done entered through tmt Plan</span>
                  </Tooltip>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <WorkDoneForm
                    patientDetails={typeof openWorkDone.data?.patient === 'object' ? openWorkDone.data.patient : patientDetails}
                    treatmentDetails={openWorkDone.data}
                    onSuccess={() => {
                      setWorkDoneTab(1);
                      applyGetAllRecords({ page: currentPage });
                    }}
                  />
                </TabPanel>
                <TabPanel p={0}>
                  <WorkDoneList
                    patientDetails={typeof openWorkDone.data?.patient === 'object' ? openWorkDone.data.patient : patientDetails}
                    treatmentId={openWorkDone.data?._id}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </CustomDrawer>
      )}

      {isCountModalOpen && (
      <Modal isOpen={isCountModalOpen} onClose={() => setIsCountModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={2}>
          <ModalHeader borderBottom="1px solid" borderColor="gray.50">
            <VStack align="start" spacing={3}>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="black" color="black" letterSpacing="0.2em">PATIENT TRENDS</Text>
                <Heading size="md" fontWeight="1000">Clinical Activity Summary</Heading>
              </VStack>
              {backendCounts.length > 0 && (
                <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                  <Box bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
                    <Text fontSize="9px" fontWeight="black" color="black">TOTAL VISITS</Text>
                    <Text fontSize="lg" fontWeight="black" color="black">{totalSummaryStats.totalVisits}</Text>
                  </Box>
                  <Box bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
                    <Text fontSize="9px" fontWeight="black" color="black">TOTAL TREATMENTS</Text>
                    <Text fontSize="lg" fontWeight="black" color="black">{totalSummaryStats.totalTreatments}</Text>
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
            {filteredCounts.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                {filteredCounts.map((item: any, idx: number) => (
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
                      setSelectedDateFilter(item.date);
                      setIsCountModalOpen(false);
                    }}
                  >
                    <HStack spacing={4}>
                      <Box p={2} bg="white" borderRadius="lg" shadow="sm">
                        <Icon as={FiCalendar} color="blue.500" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="800" color="gray.700">
                          {new Date(item.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                        </Text>
                        <Text fontSize="10px" fontWeight="700" color="gray.400">SESSION DATE</Text>
                      </VStack>
                    </HStack>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="blue.500"
                      w="32px"
                      h="32px"
                      borderRadius="full"
                      color="white"
                      fontWeight="1000"
                      fontSize="sm"
                      shadow="md"
                    >
                      {item.count}
                    </Box>
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
            <Button w="full" variant="ghost" fontWeight="1000" onClick={() => setIsCountModalOpen(false)}>CLOSE SUMMARY</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      )}

      {tablePreviewDrawer.open && (
        <CustomDrawer
          open={tablePreviewDrawer.open}
          close={() => setTablePreviewDrawer({ open: false, data: null })}
          title="Treatment List Report Preview"
          size="xl"
        >
          <Box h="calc(100vh - 150px)" w="full">
            <iframe
              src={`data:application/pdf;base64,${tablePreviewDrawer.data}#toolbar=1&navpanes=0`}
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '8px' }}
              title="Treatment Report PDF"
            />
          </Box>
        </CustomDrawer>
      )}
    </>
  );
});


export default TreatmentList;

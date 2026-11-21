"use client";
import { CardListSkeleton } from "../../component/common/Loader/ContentSkeleton";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Flex,
  Button,
  Box,
  Badge,
  HStack,
  Text,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  VStack,
  Tooltip,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Divider,
  Center,
  Spacer,
  Select,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Avatar,
  Tag,
  TagLabel,
  TagCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiList,
  FiDownload,
  FiCalendar,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiUser,
  FiColumns,
  FiSearch,
  FiPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiFilter,
} from "react-icons/fi";

import stores from "../../store/stores";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import LabSheet from "./component/LabSheet";
import LabSheetView from "./component/LabSheetView";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import ReportPreviewDrawer from "../../component/ReportPreviewDrawer/ReportPreviewDrawer";

interface LabWorkTableProps {
  patientId?: string;
  patientDetails?: any;
  isDrawer?: boolean;
  defaultWorkType?: "in-house" | "outside" | "all";
}
const defaultLabWorkCols = [
  { label: "Patient", value: "patientName" },
  { label: "Doctor", value: "doctorName" },
  { label: "Work Type", value: "workType" },
  { label: "Lab", value: "labName" },
  { label: "Technician Name", value: "technicianName" },
  { label: "Creation Date", value: "createdAt" },
  { label: "Send Date", value: "sendDate" },
  { label: "Due Date", value: "dueDate" },
  { label: "Received Date", value: "receivedDate" },
  { label: "Status", value: "status" },
  { label: "Price", value: "price" },
  { label: "Selected Works", value: "works" },
  { label: "Teeth Number", value: "teethNumber" },
  { label: "Shade", value: "shade" },
  { label: "Unit", value: "unit" },
  { label: "Warranty Card", value: "warrantyCardNumber" },
];


const LabWorkTable = observer(({ patientId, patientDetails, isDrawer, defaultWorkType }: LabWorkTableProps = {}) => {
  const { labWorkStore, labWorkHierarchyStore, labWorkStatusStore, auth: { openNotification } } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const [selectedLabWork, setSelectedLabWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    if (isDrawer) {
      return defaultWorkType === "in-house" ? 1 : (defaultWorkType === "outside" ? 2 : 0);
    }
    const type = searchParams.get("type");
    if (type === "in-house") return 1;
    if (type === "outside") return 2;
    return 0;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const debouncedDoctorSearch = useDebounce(doctorSearch, 1000);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const toast = stores.auth.openNotification;
  const [isDownloading, setIsDownloading] = useState(false);
  const [noReceivedDate, setNoReceivedDate] = useState(false);
  const [noSendDate, setNoSendDate] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Theme & Dark Mode tokens
  const titleColor = useColorModeValue("gray.850", "white");
  const subtextColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("#E8EEF4", "gray.700");
  const searchBg = useColorModeValue("white", "gray.800");
  const searchBorder = useColorModeValue("#E2E8F0", "gray.700");
  const searchColor = useColorModeValue("gray.800", "white");
  const pillsBg = useColorModeValue("gray.100", "gray.800");
  const pillInactiveText = useColorModeValue("gray.600", "gray.400");
  const pillInactiveHover = useColorModeValue("gray.200", "gray.700");
  const filterBtnBg = useColorModeValue("white", "gray.800");
  const filterBtnBorder = useColorModeValue("gray.200", "gray.700");
  const filterBtnColor = useColorModeValue("gray.700", "gray.200");
  const stripBg = useColorModeValue("gray.50", "gray.700");
  const stripBorder = useColorModeValue("gray.100", "gray.600");
  const stripTextColor = useColorModeValue("gray.600", "gray.300");
  const timelineBg = useColorModeValue("#F8FAFC", "gray.700");
  const timelineBorder = useColorModeValue("#E2E8F0", "gray.600");
  const timelineText = useColorModeValue("gray.800", "gray.100");

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (fromDate || toDate) count++;
    if (doctorSearch?.trim()) count++;
    if (noReceivedDate) count++;
    if (noSendDate) count++;
    return count;
  }, [statusFilter, fromDate, toDate, doctorSearch, noReceivedDate, noSendDate]);

  const [previewData, setPreviewData] = useState<{ columns: any[]; rows: any[] } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [technicianPreviewData, setTechnicianPreviewData] = useState<{ columns: any[]; rows: any[] } | null>(null);
  const [isTechnicianPreviewOpen, setIsTechnicianPreviewOpen] = useState(false);

  const [reportFilters, setReportFilters] = useState({
    dateType: "receivedDate" as string | string[],
    fromDate: "",
    toDate: "",
    workType: "in-house",
    patient: null as any,
    doctor: null as any,
    labDoctor: null as any,
    status: "all" as string | string[],
    selectedColumns: [] as string[],
  });

  const [isTechnicianReportOpen, setIsTechnicianReportOpen] = useState(false);
  const [technicianReportFilters, setTechnicianReportFilters] = useState(() => {
    const today = new Date();
    const last40Days = new Date();
    last40Days.setDate(today.getDate() - 40);
    return {
      technicianName: "",
      category: "all",
      fromDate: last40Days.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0],
      dateType: "receivedDate",
    };
  });

  useEffect(() => {
    const savedCols = localStorage.getItem("labReportColumns");
    if (savedCols) {
      try {
        const cols = JSON.parse(savedCols);
        setReportFilters((prev) => ({ ...prev, selectedColumns: cols }));
      } catch (e) {}
    }
  }, []);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentPage(1);
  };

  const hasTabPermission = (action: string) => {
    if (activeTab === 1) return stores.auth.hasPermission('inhouse_lab', action);
    if (activeTab === 2) return stores.auth.hasPermission('outside_lab', action);
    return stores.auth.hasPermission('inhouse_lab', action) || stores.auth.hasPermission('outside_lab', action);
  };

  const fetchLabWorks = useCallback(
    (page = 1, limit = tablePageLimit) => {
      let workType: any = undefined;
      if (activeTab === 1) workType = "in-house";
      else if (activeTab === 2) workType = "outside";

      const query: any = { page, limit };
      if (workType) query.workType = workType;
      if (patientId) query.patient = patientId;
      if (statusFilter !== "all") query.status = statusFilter;
      if (fromDate) query.fromDate = fromDate;
      if (toDate) query.toDate = toDate;

      if (debouncedDoctorSearch?.trim()) {
        query.doctorName = debouncedDoctorSearch.trim();
      }

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }
      if (noReceivedDate) {
        query.noReceivedDate = true;
      }
      if (noSendDate) {
        query.noSendDate = true;
      }
      labWorkStore.getAllLabWorks(query)
        .catch((err: any) => {
          openNotification({
            type: "error",
            title: "Error",
            message: err?.message,
          });
        });
    },
    [labWorkStore, openNotification, activeTab, debouncedSearchQuery, debouncedDoctorSearch, patientId, statusFilter, fromDate, toDate, noReceivedDate, noSendDate]
  );

  const resetReportFilters = () => {
    setReportFilters({
      dateType: activeTab === 1 ? "sendDate" : "receivedDate",
      fromDate: "",
      toDate: "",
      workType: activeTab === 1 ? "in-house" : "outside",
      patient: null,
      doctor: null,
      labDoctor: null,
      status: "all",
      selectedColumns: defaultLabWorkCols.map((c) => c.value),
    });
    localStorage.removeItem("labReportColumns");
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setTempFromDate("");
    setTempToDate("");
    setDoctorSearch("");
    setNoReceivedDate(false);
    setNoSendDate(false);
  };

  // Sync tab with query param
  useEffect(() => {
    if (!isDrawer) {
      const type = searchParams.get("type");
      if (type === "in-house") setActiveTab(1);
      else if (type === "outside") setActiveTab(2);
      else setActiveTab(0);
    }
  }, [searchParams, isDrawer]);

  useEffect(() => {
    fetchLabWorks(currentPage);
    labWorkHierarchyStore.getAllHierarchies();
  }, [currentPage, activeTab, debouncedSearchQuery, debouncedDoctorSearch, statusFilter, fromDate, toDate, noReceivedDate, noSendDate, fetchLabWorks, labWorkHierarchyStore]);

  useEffect(() => {
    labWorkStatusStore.getLabWorkStatuses();
  }, [labWorkStatusStore]);

  const handleAdd = () => {
    const defaultWorkType = activeTab === 1 ? "in-house" : (activeTab === 2 ? "outside" : "outside");
    const newLabWork: any = { workType: defaultWorkType };

    // Auto-populate patient if we have the details (e.g., from waiting room / patient view)
    if (patientDetails) {
      newLabWork.patient = {
        label: patientDetails.name,
        value: patientDetails._id,
        _id: patientDetails._id,
        name: patientDetails.name
      };
    }

    setSelectedLabWork(newLabWork);
    onOpen();
  };

  const handleEdit = (data: any) => {
    setSelectedLabWork(data);
    onOpen();
  };

  const handleView = (data: any) => {
    setSelectedLabWork(data);
    onViewOpen();
  };

  const handleDelete = async (data: any) => {
    if (window.confirm("Are you sure you want to delete this lab sheet?")) {
      const res = await labWorkStore.deleteLabWork(data._id);
      if (res.status === "success") {
        fetchLabWorks(currentPage);
      }
    }
  };

  const handleDownloadReport = async (isPreview = false) => {
    setIsDownloading(true);
    try {
      let workType: any = "all";
      if (activeTab === 1) workType = "in-house";
      else if (activeTab === 2) workType = "outside";

      const payloadFilters = {
        ...reportFilters,
        workType: reportFilters.workType === "all" ? workType : reportFilters.workType,
        patientId: reportFilters.patient?._id || reportFilters.patient?.value || reportFilters.patient?.id,
        doctorId: reportFilters.doctor?._id || reportFilters.doctor?.value || reportFilters.doctor?.id || reportFilters.labDoctor?._id || reportFilters.labDoctor?.value || reportFilters.labDoctor?.id,
        search: debouncedSearchQuery?.trim() || undefined,
        selectedColumns: reportFilters.selectedColumns,
      };

      const response = await stores.reportStore.getReportDownload({
        reportType: "labWork",
        filters: payloadFilters,
        isPreview
      });

      if (response?.status === "success" && response.data) {
        if (isPreview) {
          setPreviewData(response.data);
          setIsPreviewOpen(true);
        } else {
          const { fileName, fileData } = response.data;
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          type: "success",
          title: "Success",
          message: "Report downloaded successfully!",
        });
        setIsPreviewOpen(false);
        onReportClose();
      }
    }
  } catch (err: any) {
      toast({
        type: "error",
        title: "Error",
        message: err.message || "Failed to download report",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let color = "blue";
    const s = status?.toLowerCase();
    if (s === "plan") color = "blue";
    else if (s === "sent") color = "orange";
    else if (s === "in-progress" || s === "processing") color = "purple";
    else if (s === "received") color = "teal";
    else if (s === "completed" || s === "delivered") color = "green";
    else if (s === "cancelled" || s === "rejected") color = "red";

    return <Badge colorScheme={color} borderRadius="full" px={2} variant="subtle">{status?.toUpperCase() || "N/A"}</Badge>;
  };

  const columns = useMemo(() => {
    const baseCols: any[] = [];

    // Show Work Type only if we are in the "All" tab (index 0)
    if (activeTab === 0) {
      baseCols.push({
        headerName: "Work Type",
        key: "workType",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Badge colorScheme={dt.workType === "in-house" ? "purple" : "cyan"}>
              {dt.workType}
            </Badge>
          ),
        },
      });
    }

    baseCols.push(
      {
        headerName: "Patient",
        key: "patient",
        function: (dt: any) => dt.patient?.name || dt.patientNameManual || "N/A",
      },
      {
        headerName: "Doctor",
        key: "doctor",
        function: (dt: any) => dt.primaryDoctor?.name || dt.primaryDoctor?.labDoctorName || dt.doctorNameManual || "N/A",
      },
      {
        headerName: "Selected Works",
        key: "works",
        type: "component",
        metaData: {
          component: (dt: any) => {
            const works = dt.selectedWorks?.map((w: any) => labWorkHierarchyStore.getNamePath(w.selections)) || [];
            if (works.length === 0) return <Text fontSize="xs" color="gray.400">None</Text>;

            return (
              <Tooltip
                label={
                  <VStack align="start" spacing={1} p={1}>
                    {works.map((w: string, i: number) => (
                      <Text key={i} fontSize="xs" fontWeight="600">• {w}</Text>
                    ))}
                  </VStack>
                }
                placement="top"
                hasArrow
                borderRadius="lg"
                bg="blue.800"
                color="white"
                p={3}
                boxShadow="xl"
              >
                <HStack spacing={2} cursor="help">
                  <Text fontSize="xs" fontWeight="700" color="blue.700" noOfLines={1} maxW="150px">
                    • {works[0]}
                  </Text>
                  {works.length > 1 && (
                    <Badge size="xs" colorScheme="blue" variant="solid" fontSize="10px" borderRadius="full" px={2}>
                      +{works.length - 1}
                    </Badge>
                  )}
                </HStack>
              </Tooltip>
            );
          },
        },
      }
    );

    // Only show Lab column if we are not strictly in the In-house tab
    if (activeTab !== 1) {
      baseCols.push({
        headerName: "Lab",
        key: "lab",
        function: (dt: any) => dt.lab?.name || dt.labNameManual || (dt.workType === "in-house" ? "In-house" : "N/A"),
      } as any);
    }

    const dateCols: any[] = [];
    if (activeTab === 1) {
      // In-house: Send -> Due -> Received
      dateCols.push(
        { headerName: "Send Date", key: "sendDate", function: (dt: any) => dt.sendDate ? formatDateTime(dt.sendDate).split(",")[0] : "-" },
        { headerName: "Due Date", key: "dueDate", function: (dt: any) => dt.dueDate ? formatDateTime(dt.dueDate).split(",")[0] : "-" },
        { headerName: "Received Date", key: "receivedDate", function: (dt: any) => dt.receivedDate ? formatDateTime(dt.receivedDate).split(",")[0] : "-" }
      );
    } else {
      // Outside & All: Received -> Due -> Send
      dateCols.push(
        { headerName: "Received Date", key: "receivedDate", function: (dt: any) => dt.receivedDate ? formatDateTime(dt.receivedDate).split(",")[0] : "-" },
        { headerName: "Due Date", key: "dueDate", function: (dt: any) => dt.dueDate ? formatDateTime(dt.dueDate).split(",")[0] : "-" },
        { headerName: "Send Date", key: "sendDate", function: (dt: any) => dt.sendDate ? formatDateTime(dt.sendDate).split(",")[0] : "-" }
      );
    }

    // Add Delay column
    dateCols.push({
      headerName: "Delay",
      key: "delay",
      type: "component",
      metaData: {
        component: (dt: any) => {
          if (dt.delay === undefined || dt.delay === null || dt.delay === "") return <Text>-</Text>;
          return <Badge colorScheme={dt.delay < 0 ? "red" : (dt.delay > 0 ? "green" : "gray")} borderRadius="full" px={2}>{dt.delay} Days</Badge>;
        }
      }
    });

    return [
      ...baseCols,
      ...dateCols,
      {
        headerName: "Status",
        key: "status",
        type: "component",
        metaData: {
          component: (dt: any) => <StatusBadge status={dt.status} />,
        },
      },
      {
        headerName: "Actions",
        key: "table-actions",
        type: "table-actions",
      },
    ];
  }, [activeTab, labWorkHierarchyStore]);

  return (
    <Box p={isDrawer ? 0 : { base: 2, md: 4 }}>
      {/* ============================================================== */}
      {/* MOBILE APK DEDICATED INTERFACE (< 768px)                       */}
      {/* ============================================================== */}
      {isMobile ? (
        <Box pb="calc(80px + env(safe-area-inset-bottom, 12px))">
          {/* Mobile App Bar */}
          <Flex align="center" justify="space-between" gap={2} mb={3}>
            <Box>
              <HStack spacing={2} align="center">
                <Text
                  fontSize={{ base: "20px", sm: "22px" }}
                  fontWeight="900"
                  color={titleColor}
                  letterSpacing="-0.4px"
                >
                  Lab Orders
                </Text>
                {labWorkStore.totalCount !== undefined && (
                  <Badge
                    bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                    color="white"
                    fontSize="10px"
                    fontWeight="800"
                    px={2}
                    py={0.5}
                    rounded="full"
                    boxShadow="0 2px 6px var(--theme-shadow, rgba(13, 148, 136, 0.25))"
                  >
                    {labWorkStore.totalCount}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="12px" color={subtextColor} fontWeight="500" mt={0.5}>
                Manage dental fabrication & track lab orders
              </Text>
            </Box>

            {hasTabPermission("create") && (
              <Button
                h="36px"
                leftIcon={<FiPlus size={14} />}
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0EA5E9) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                borderRadius="14px"
                px={4}
                fontSize="13px"
                fontWeight="800"
                boxShadow="0 4px 14px -2px var(--theme-shadow, rgba(13, 148, 136, 0.4))"
                _hover={{
                  bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #0284C7) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)",
                  transform: "translateY(-1px)",
                }}
                _active={{ transform: "scale(0.96)" }}
                onClick={handleAdd}
              >
                New Order
              </Button>
            )}
          </Flex>

          {/* Work Type Segmented Pills */}
          <HStack spacing={1.5} p={1} bg={pillsBg} border="1px solid" borderColor={searchBorder} borderRadius="18px" mb={3}>
            {[
              { id: 0, label: "All Orders" },
              { id: 1, label: "In-House" },
              { id: 2, label: "Outside" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  flex={1}
                  size="sm"
                  h="34px"
                  fontSize="12px"
                  fontWeight="800"
                  borderRadius="14px"
                  bg={
                    isActive
                      ? "linear-gradient(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                      : "transparent"
                  }
                  color={isActive ? "white" : pillInactiveText}
                  boxShadow={isActive ? "0 2px 8px var(--theme-shadow, rgba(12, 74, 110, 0.25))" : "none"}
                  _hover={{
                    bg: isActive
                      ? "linear-gradient(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                      : pillInactiveHover,
                  }}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </Button>
              );
            })}
          </HStack>

          {/* Search Bar */}
          <InputGroup size="md" mb={2.5}>
            <InputLeftElement pointerEvents="none" h="40px" w="40px">
              <Icon as={FiSearch} color="brand.500" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="Search patient, order or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="15px"
              bg={searchBg}
              borderColor={searchBorder}
              color={searchColor}
              fontSize="13px"
              fontWeight="600"
              h="40px"
              pl="38px"
              pr={searchQuery ? "38px" : 3}
              boxShadow="0 2px 8px rgba(0,0,0,0.03)"
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 3px var(--theme-shadow, rgba(14, 165, 233, 0.15))",
              }}
              _placeholder={{ color: "gray.400", fontWeight: "400" }}
            />
            {searchQuery && (
              <InputRightElement h="40px">
                <IconButton
                  aria-label="Clear search"
                  icon={<FiX size={14} />}
                  size="sm"
                  minW="40px"
                  h="40px"
                  variant="ghost"
                  rounded="full"
                  onClick={() => setSearchQuery("")}
                />
              </InputRightElement>
            )}
          </InputGroup>

          {/* Quick Actions Row */}
          <Flex align="center" gap={2} mb={3} overflowX="auto" pb={1}>
            <Button
              size="sm"
              borderRadius="12px"
              bg={activeFiltersCount > 0 ? useColorModeValue("brand.50", "whiteAlpha.200") : filterBtnBg}
              border="1px solid"
              borderColor={activeFiltersCount > 0 ? "brand.500" : filterBtnBorder}
              color={activeFiltersCount > 0 ? "brand.500" : filterBtnColor}
              _hover={{ bg: useColorModeValue("brand.50", "whiteAlpha.100") }}
              leftIcon={<FiFilter size={13} />}
              fontSize="12px"
              fontWeight="700"
              h="36px"
              flexShrink={0}
              onClick={() => setIsMobileFilterOpen(true)}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  ml={1.5}
                  bg="brand.500"
                  color="white"
                  borderRadius="full"
                  fontSize="10px"
                  px={1.5}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {hasTabPermission("download") && (
              <Button
                size="sm"
                borderRadius="12px"
                bg={filterBtnBg}
                border="1px solid"
                borderColor={filterBtnBorder}
                color={filterBtnColor}
                _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                leftIcon={<FiDownload size={13} />}
                fontSize="12px"
                fontWeight="700"
                h="36px"
                flexShrink={0}
                onClick={() => {
                  const workType = activeTab === 1 ? "in-house" : "outside";
                  const dateType = activeTab === 1 ? "sendDate" : "receivedDate";
                  setReportFilters((prev) => ({ ...prev, workType, dateType }));
                  onReportOpen();
                }}
              >
                Report
              </Button>
            )}

            {hasTabPermission("download") && (
              <Button
                size="sm"
                borderRadius="12px"
                bg={filterBtnBg}
                border="1px solid"
                borderColor={filterBtnBorder}
                color={filterBtnColor}
                _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                leftIcon={<FiDownload size={13} />}
                fontSize="12px"
                fontWeight="700"
                h="36px"
                flexShrink={0}
                onClick={() => setIsTechnicianReportOpen(true)}
              >
                Tech Report
              </Button>
            )}

            {(activeFiltersCount > 0 || searchQuery) && (
              <IconButton
                aria-label="Reset Filters"
                icon={<FiRefreshCw size={13} />}
                size="sm"
                h="36px"
                w="36px"
                minW="36px"
                colorScheme="red"
                variant="outline"
                borderRadius="12px"
                onClick={resetTableData}
                title="Reset Filters"
                flexShrink={0}
              />
            )}
          </Flex>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <Flex gap={1.5} wrap="wrap" mb={3}>
              {statusFilter !== "all" && (
                <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="blue">
                  <TagLabel fontSize="11px">Status: {statusFilter}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setStatusFilter("all");
                      setCurrentPage(1);
                    }}
                  />
                </Tag>
              )}
              {doctorSearch && (
                <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="purple">
                  <TagLabel fontSize="11px">Dr: {doctorSearch}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setDoctorSearch("");
                      setCurrentPage(1);
                    }}
                  />
                </Tag>
              )}
              {(fromDate || toDate) && (
                <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="teal">
                  <TagLabel fontSize="11px">
                    {fromDate || "start"} → {toDate || "end"}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                      setTempFromDate("");
                      setTempToDate("");
                      setCurrentPage(1);
                    }}
                  />
                </Tag>
              )}
              {noReceivedDate && (
                <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="orange">
                  <TagLabel fontSize="11px">No Received Date</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setNoReceivedDate(false);
                      setCurrentPage(1);
                    }}
                  />
                </Tag>
              )}
              {noSendDate && (
                <Tag size="sm" borderRadius="full" variant="subtle" colorScheme="orange">
                  <TagLabel fontSize="11px">No Send Date</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setNoSendDate(false);
                      setCurrentPage(1);
                    }}
                  />
                </Tag>
              )}
            </Flex>
          )}

          {/* Orders Stack */}
          {labWorkStore.loading ? (
            <CardListSkeleton count={4} />
          ) : !labWorkStore.labWorks || labWorkStore.labWorks.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={14}
              textAlign="center"
              bg={cardBg}
              borderRadius="20px"
              border="1px dashed"
              borderColor={cardBorder}
              px={4}
            >
              <Icon as={FiLayers} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Lab Orders Found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {searchQuery || activeFiltersCount > 0
                  ? "No matching orders found. Try resetting filters."
                  : "No lab sheets created yet."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {labWorkStore.labWorks.map((item: any, idx: number) => {
                const works =
                  item.selectedWorks?.map((w: any) =>
                    labWorkHierarchyStore.getNamePath(w.selections)
                  ) || [];

                return (
                  <Box
                    key={item._id || item.id || idx}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="22px"
                    p={3.5}
                    boxShadow="0 8px 24px -12px rgba(15, 23, 42, 0.18)"
                    transition="all 0.2s ease"
                  >
                    {/* Top Identity Strip */}
                    <Flex align="flex-start" justify="space-between" gap={2} mb={2.5}>
                      <Flex
                        align="center"
                        gap={2.5}
                        flex={1}
                        minW={0}
                        cursor="pointer"
                        onClick={() => handleView(item)}
                      >
                        <Avatar
                          size="sm"
                          name={item.patient?.name || item.patientNameManual || "Patient"}
                          bg="linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)"
                          color="teal.800"
                          fontWeight="800"
                          flexShrink={0}
                        />
                        <Box flex={1} minW={0}>
                          <Text
                            fontSize="14.5px"
                            fontWeight="800"
                            color={titleColor}
                            noOfLines={1}
                            letterSpacing="-0.2px"
                          >
                            {item.patient?.name || item.patientNameManual || "N/A"}
                          </Text>
                          <Text fontSize="11px" color={subtextColor} noOfLines={1}>
                            Dr.{" "}
                            {item.primaryDoctor?.name ||
                              item.primaryDoctor?.labDoctorName ||
                              item.doctorNameManual ||
                              "N/A"}
                          </Text>
                        </Box>
                      </Flex>

                      <HStack spacing={1.5} flexShrink={0} wrap="wrap" justify="flex-end">
                        <Badge
                          colorScheme={item.workType === "in-house" ? "purple" : "cyan"}
                          fontSize="9.5px"
                          fontWeight="800"
                          borderRadius="full"
                          px={2}
                          py={0.5}
                        >
                          {item.workType === "in-house" ? "IN-HOUSE" : "OUTSIDE"}
                        </Badge>
                        <StatusBadge status={item.status} />
                      </HStack>
                    </Flex>

                    {/* Lab / Technician info */}
                    <Flex
                      align="center"
                      justify="space-between"
                      bg={stripBg}
                      borderRadius="xl"
                      px={3}
                      py={1.5}
                      mb={2.5}
                      fontSize="11.5px"
                      border="1px solid"
                      borderColor={stripBorder}
                    >
                      <HStack spacing={1.5} color={stripTextColor} flex={1} minW={0} mr={2}>
                        <Icon as={FiLayers} color="brand.500" boxSize={3.5} flexShrink={0} />
                        <Text fontWeight="600" noOfLines={1} fontSize="11.5px">
                          {item.workType === "in-house"
                            ? item.technicianName
                              ? `Tech: ${item.technicianName}`
                              : "In-House Lab"
                            : item.lab?.name || item.labNameManual
                            ? `Lab: ${item.lab?.name || item.labNameManual}`
                            : "Outside Lab"}
                        </Text>
                      </HStack>
                      {item.price ? (
                        <Text fontWeight="800" color="brand.500" flexShrink={0} fontSize="12px">
                          ₹{item.price}
                        </Text>
                      ) : null}
                    </Flex>

                    {/* Selected Works Chips - Full Wrap, Never Overflows */}
                    {works.length > 0 && (
                      <VStack align="stretch" spacing={1.5} mb={2.5}>
                        {works.slice(0, 3).map((wText: string, wIdx: number) => (
                          <Box
                            key={wIdx}
                            bg={useColorModeValue("brand.50", "whiteAlpha.100")}
                            color={useColorModeValue("brand.700", "brand.200")}
                            border="1px solid"
                            borderColor={useColorModeValue("brand.200", "brand.800")}
                            borderRadius="10px"
                            px={2.5}
                            py={1}
                            fontSize="11px"
                            fontWeight="700"
                            whiteSpace="normal"
                            wordBreak="break-word"
                            lineHeight="1.3"
                          >
                            • {wText}
                          </Box>
                        ))}
                        {works.length > 3 && (
                          <Badge
                            alignSelf="flex-start"
                            colorScheme="blue"
                            variant="solid"
                            fontSize="10px"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            +{works.length - 3} more works
                          </Badge>
                        )}
                      </VStack>
                    )}

                    {/* Dates & Timeline Grid */}
                    <SimpleGrid
                      columns={3}
                      spacing={2}
                      mb={2.5}
                      p={2.5}
                      bg={timelineBg}
                      borderRadius="14px"
                      border="1px solid"
                      borderColor={timelineBorder}
                    >
                      <VStack spacing={0.5} align="center">
                        <Text
                          fontSize="10px"
                          fontWeight="800"
                          color={subtextColor}
                          textTransform="uppercase"
                          letterSpacing="0.3px"
                        >
                          Send
                        </Text>
                        <Text fontSize="11px" fontWeight="750" color={timelineText} textAlign="center">
                          {item.sendDate
                            ? formatDateTime(item.sendDate).split(",")[0]
                            : "—"}
                        </Text>
                      </VStack>

                      <VStack spacing={0.5} align="center">
                        <Text
                          fontSize="10px"
                          fontWeight="800"
                          color={subtextColor}
                          textTransform="uppercase"
                          letterSpacing="0.3px"
                        >
                          Due
                        </Text>
                        <Text fontSize="11px" fontWeight="750" color="orange.400" textAlign="center">
                          {item.dueDate
                            ? formatDateTime(item.dueDate).split(",")[0]
                            : "—"}
                        </Text>
                      </VStack>

                      <VStack spacing={0.5} align="center">
                        <Text
                          fontSize="10px"
                          fontWeight="800"
                          color={subtextColor}
                          textTransform="uppercase"
                          letterSpacing="0.3px"
                        >
                          Received
                        </Text>
                        <Text fontSize="11px" fontWeight="750" color="brand.500" textAlign="center">
                          {item.receivedDate
                            ? formatDateTime(item.receivedDate).split(",")[0]
                            : "—"}
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {item.delay !== undefined &&
                      item.delay !== null &&
                      item.delay !== "" && (
                        <Flex justify="flex-end" mb={2}>
                          <Badge
                            colorScheme={
                              item.delay < 0
                                ? "red"
                                : item.delay > 0
                                ? "green"
                                : "gray"
                            }
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="10px"
                            fontWeight="800"
                          >
                            {item.delay} DAYS DELAY
                          </Badge>
                        </Flex>
                      )}

                    {/* Action Toolbelt */}
                    <Flex
                      align="center"
                      justify="space-between"
                      pt={2}
                      borderTop="1px dashed"
                      borderColor="#E2E8F0"
                      gap={1}
                    >
                      {hasTabPermission("view") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="teal"
                          leftIcon={<FiEye size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                          h="30px"
                          px={2.5}
                          borderRadius="lg"
                          onClick={() => handleView(item)}
                        >
                          View Sheet
                        </Button>
                      )}

                      {hasTabPermission("edit") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiEdit2 size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                          h="30px"
                          px={2.5}
                          borderRadius="lg"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                      )}

                      {hasTabPermission("delete") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiTrash2 size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                          h="30px"
                          px={2.5}
                          borderRadius="lg"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Mobile Pagination */}
          {Math.ceil(labWorkStore.totalCount / tablePageLimit) > 1 && (
            <Flex align="center" justify="space-between" mt={4} px={1}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="12px"
                leftIcon={<FiChevronLeft />}
                isDisabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                fontSize="12px"
                fontWeight="700"
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color="gray.600">
                Page {currentPage} of{" "}
                {Math.ceil(labWorkStore.totalCount / tablePageLimit) || 1}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="12px"
                rightIcon={<FiChevronRight />}
                isDisabled={
                  currentPage >=
                  Math.ceil(labWorkStore.totalCount / tablePageLimit)
                }
                onClick={() => setCurrentPage(currentPage + 1)}
                fontSize="12px"
                fontWeight="700"
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        /* ============================================================== */
        /* DESKTOP INTERFACE (>= 768px)                                   */
        /* ============================================================== */
        <>
          {!isDrawer && (
            <>
              <Box display="none">
                <DashPageHeader breadcrumb={[]} />
              </Box>
              <DashPageTitle
                title="Lab Management"
                subTitle="Manage In-house and Outside laboratory orders and tracking"
              />
            </>
          )}
          <Box mt={isDrawer ? 0 : 2}>
            <CustomTable
              title={activeTab === 0 ? "All Lab Sheets" : undefined}
              data={labWorkStore.labWorks.map((item, index) => ({
                ...item,
                sno: (currentPage - 1) * tablePageLimit + index + 1,
              }))}
              columns={columns}
              actions={{
                customComponent: (
                  <Flex gap={3} align="center" justify="flex-start" wrap="wrap" pb={1}>
                    {/* Advanced Filters Popover */}
                    <Popover placement="bottom-start" closeOnBlur={true}>
                      <PopoverTrigger>
                        <Button
                          size="sm"
                          borderRadius="xl"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FiList />}
                        >
                          Filters
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent p={2} w="300px" boxShadow="xl" borderRadius="xl" border="1px solid" borderColor="gray.200">
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody>
                          <VStack spacing={4} align="stretch" mt={4}>
                            <Box>
                              <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500">DATE RANGE</Text>
                              <VStack spacing={2}>
                                <Input
                                  type="date"
                                  size="sm"
                                  borderRadius="md"
                                  value={tempFromDate}
                                  onChange={(e) => setTempFromDate(e.target.value)}
                                  bg={useColorModeValue("white", "gray.800")}
                                />
                                <Input
                                  type="date"
                                  size="sm"
                                  borderRadius="md"
                                  value={tempToDate}
                                  onChange={(e) => setTempToDate(e.target.value)}
                                  bg={useColorModeValue("white", "gray.800")}
                                />
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  w="full"
                                  onClick={() => {
                                    setFromDate(tempFromDate);
                                    setToDate(tempToDate);
                                    setCurrentPage(1);
                                  }}
                                >
                                  Apply Date Filter
                                </Button>
                              </VStack>
                            </Box>

                            <Box>
                              <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500">DOCTOR</Text>
                              <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                  <FiUser color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  placeholder="Search Doctor..."
                                  borderRadius="md"
                                  value={doctorSearch}
                                  onChange={(e) => {
                                    setDoctorSearch(e.target.value);
                                    setCurrentPage(1);
                                  }}
                                  bg={useColorModeValue("white", "gray.800")}
                                />
                              </InputGroup>
                            </Box>
                          </VStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>

                    <Box w="180px" zIndex={10}>
                      <CustomInput
                        name="statusFilter"
                        type="select"
                        isPortal={true}
                        options={[
                          { label: "All Statuses", value: "all" },
                          ...labWorkStatusStore.statuses
                            .filter((s: any) => activeTab === 0 || s.type === (activeTab === 1 ? "in-house" : "outside"))
                            .sort((a: any, b: any) => a.status.localeCompare(b.status))
                            .map((s: any) => ({ label: s.status, value: s.status }))
                        ]}
                        value={{ label: statusFilter === "all" ? "All Statuses" : statusFilter, value: statusFilter }}
                        onChange={(val: any) => {
                          setStatusFilter(val ? val.value : "all");
                          setCurrentPage(1);
                        }}
                      />
                    </Box>

                    {activeTab === 1 && (
                      <Button
                        size="sm"
                        borderRadius="xl"
                        colorScheme={noReceivedDate ? "orange" : "gray"}
                        variant={noReceivedDate ? "solid" : "outline"}
                        onClick={() => {
                          setNoReceivedDate(prev => !prev);
                          setNoSendDate(false);
                          setCurrentPage(1);
                        }}
                        leftIcon={<FiClock />}
                        flexShrink={0}
                      >
                        {noReceivedDate ? "✓ No Received Date" : "No Received Date"}
                      </Button>
                    )}

                    {activeTab === 2 && (
                      <Button
                        size="sm"
                        borderRadius="xl"
                        colorScheme={noSendDate ? "orange" : "gray"}
                        variant={noSendDate ? "solid" : "outline"}
                        onClick={() => {
                          setNoSendDate(prev => !prev);
                          setNoReceivedDate(false);
                          setCurrentPage(1);
                        }}
                        leftIcon={<FiClock />}
                        flexShrink={0}
                      >
                        {noSendDate ? "✓ No Send Date" : "No Send Date"}
                      </Button>
                    )}

                    {hasTabPermission('download') && (
                      <Button
                        leftIcon={<FiDownload />}
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                        borderRadius="xl"
                        onClick={() => {
                          const workType = activeTab === 1 ? "in-house" : "outside";
                          const dateType = activeTab === 1 ? "sendDate" : "receivedDate";
                          setReportFilters(prev => ({ ...prev, workType, dateType }));
                          onReportOpen();
                        }}
                        isLoading={isDownloading}
                        loadingText="Downloading..."
                        flexShrink={0}
                      >
                        Download Report
                      </Button>
                    )}

                    {hasTabPermission('download') && (
                      <Button
                        leftIcon={<FiDownload />}
                        colorScheme="teal"
                        variant="outline"
                        size="sm"
                        borderRadius="xl"
                        onClick={() => setIsTechnicianReportOpen(true)}
                        flexShrink={0}
                      >
                        Technician Report
                      </Button>
                    )}

                    {(fromDate || toDate || doctorSearch || statusFilter !== "all" || noReceivedDate || noSendDate) && (
                      <IconButton
                        aria-label="Reset All Filters"
                        icon={<FiRefreshCw />}
                        size="sm"
                        colorScheme="red"
                        borderRadius="xl"
                        onClick={resetTableData}
                        title="Reset All Filters"
                        flexShrink={0}
                      />
                    )}
                  </Flex>
                ),
                actionBtn: {
                  addKey: {
                    showAddButton: hasTabPermission('create'),
                    function: handleAdd
                  },
                  editKey: {
                    showEditButton: hasTabPermission('edit'),
                    function: handleEdit
                  },
                  deleteKey: {
                    showDeleteButton: hasTabPermission('delete'),
                    function: handleDelete
                  },
                  viewKey: {
                    showViewButton: hasTabPermission('view'),
                    function: handleView
                  },
                },
                pagination: {
                  show: true,
                  onClick: setCurrentPage,
                  currentPage: currentPage,
                  totalPages: Math.ceil(labWorkStore.totalCount / tablePageLimit),
                },
                search: {
                  show: true,
                  searchValue: searchQuery,
                  onSearchChange: (e: any) => setSearchQuery(e.target.value),
                },
                resetData: {
                  show: true,
                  text: "Reset Filters",
                  function: resetTableData,
                },
              }}
              loading={labWorkStore.loading}
            />
          </Box>
        </>
      )}

      {/* Mobile Filter Half-Bottom Sheet */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        placement="bottom"
      >
        <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <DrawerContent
          borderTopRadius={0}
          borderRadius={0}
          maxH="75vh"
          bg={useColorModeValue("white", "darkBrand.50")}
          boxShadow="0 -10px 30px rgba(0,0,0,0.2)"
          overflow="hidden"
        >
          <DrawerCloseButton color="white" zIndex={3} mt={1} />
          <DrawerHeader
            bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
            color="white"
            borderRadius={0}
            borderTopRadius={0}
            fontSize="16px"
            fontWeight="800"
            py={3.5}
            px={4}
          >
            <HStack spacing={2}>
              <Icon as={FiFilter} boxSize={4} />
              <Text>Filter Lab Orders</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={4} overflowY="auto" bg={useColorModeValue("white", "darkBrand.50")}>
            <VStack spacing={3.5} align="stretch">
              <Box>
                <Text fontSize="11px" fontWeight="700" color={useColorModeValue("gray.600", "gray.300")} mb={1} textTransform="uppercase">
                  Status
                </Text>
                <Select
                  size="sm"
                  borderRadius="xl"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                  fontWeight="600"
                  bg={useColorModeValue("white", "darkBrand.100")}
                  borderColor={useColorModeValue("gray.200", "darkBrand.200")}
                  color={useColorModeValue("gray.800", "white")}
                >
                  <option value="all">All Statuses</option>
                  {labWorkStatusStore.statuses
                    .filter((s: any) => activeTab === 0 || s.type === (activeTab === 1 ? "in-house" : "outside"))
                    .sort((a: any, b: any) => a.status.localeCompare(b.status))
                    .map((s: any) => (
                      <option key={s._id || s.status} value={s.status}>
                        {s.status}
                      </option>
                    ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color={useColorModeValue("gray.600", "gray.300")} mb={1} textTransform="uppercase">
                  Doctor Name
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <FiUser color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search doctor..."
                    borderRadius="xl"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    fontWeight="600"
                    bg={useColorModeValue("white", "darkBrand.100")}
                    borderColor={useColorModeValue("gray.200", "darkBrand.200")}
                    color={useColorModeValue("gray.800", "white")}
                  />
                </InputGroup>
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color={useColorModeValue("gray.600", "gray.300")} mb={1} textTransform="uppercase">
                  Date Range
                </Text>
                <SimpleGrid columns={2} spacing={2}>
                  <Box>
                    <Text fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} mb={0.5}>
                      From
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      borderRadius="lg"
                      value={tempFromDate}
                      onChange={(e) => setTempFromDate(e.target.value)}
                      bg={useColorModeValue("white", "darkBrand.100")}
                      borderColor={useColorModeValue("gray.200", "darkBrand.200")}
                      color={useColorModeValue("gray.800", "white")}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} mb={0.5}>
                      To
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      borderRadius="lg"
                      value={tempToDate}
                      onChange={(e) => setTempToDate(e.target.value)}
                      bg={useColorModeValue("white", "darkBrand.100")}
                      borderColor={useColorModeValue("gray.200", "darkBrand.200")}
                      color={useColorModeValue("gray.800", "white")}
                    />
                  </Box>
                </SimpleGrid>
              </Box>

              {activeTab === 1 && (
                <Button
                  size="sm"
                  borderRadius="xl"
                  colorScheme={noReceivedDate ? "orange" : "gray"}
                  variant={noReceivedDate ? "solid" : "outline"}
                  onClick={() => {
                    setNoReceivedDate((prev) => !prev);
                    setNoSendDate(false);
                  }}
                  leftIcon={<FiClock />}
                >
                  {noReceivedDate ? "✓ No Received Date Filtered" : "Filter: No Received Date"}
                </Button>
              )}

              {activeTab === 2 && (
                <Button
                  size="sm"
                  borderRadius="xl"
                  colorScheme={noSendDate ? "orange" : "gray"}
                  variant={noSendDate ? "solid" : "outline"}
                  onClick={() => {
                    setNoSendDate((prev) => !prev);
                    setNoReceivedDate(false);
                  }}
                  leftIcon={<FiClock />}
                >
                  {noSendDate ? "✓ No Send Date Filtered" : "Filter: No Send Date"}
                </Button>
              )}
            </VStack>
          </DrawerBody>
          <DrawerFooter bg={useColorModeValue("gray.50", "darkBrand.100")} py={3} px={4} borderTop="1px solid" borderColor={useColorModeValue("gray.200", "darkBrand.200")}>
            <HStack spacing={2} w="full">
              <Button
                size="sm"
                variant="ghost"
                flex={1}
                borderRadius="xl"
                color={useColorModeValue("gray.600", "gray.300")}
                _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.100") }}
                onClick={() => {
                  resetTableData();
                  setIsMobileFilterOpen(false);
                }}
              >
                Reset All
              </Button>
              <Button
                size="sm"
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0EA5E9) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                flex={1}
                borderRadius="xl"
                fontWeight="700"
                onClick={() => {
                  setFromDate(tempFromDate);
                  setToDate(tempToDate);
                  setCurrentPage(1);
                  setIsMobileFilterOpen(false);
                }}
              >
                Apply Filters
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

        {/* Edit/Add Drawer */}
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          size={isMobile ? "full" : "full"}
          placement={isMobile ? "bottom" : "right"}
        >
          <DrawerOverlay />
          <DrawerContent
            maxW={{ base: "100%", md: "85%", lg: "50%" }}
            h={isMobile ? "100dvh" : undefined}
            maxH={isMobile ? "100dvh" : undefined}
            borderTopRadius={0}
            borderRadius={0}
            bg={useColorModeValue("white", "darkBrand.50")}
            overflow="hidden"
          >
            <DrawerCloseButton 
              color="white" 
              zIndex={2}
              mt={2}
            />
            <DrawerHeader
              bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              borderRadius={0}
              borderTopRadius={0}
              fontWeight="700"
              fontSize={{ base: "lg", md: "xl" }}
              boxShadow="md"
            >
              {selectedLabWork && (selectedLabWork as any)._id ? "Update Lab Order" : "New Lab Order"}
            </DrawerHeader>
            <DrawerBody p={{ base: 2, md: 6 }} bg={useColorModeValue("white", "darkBrand.50")}>
              <Box mt={{ base: 2, md: 4 }}>
                <LabSheet
                  initialData={selectedLabWork}
                  onClose={onClose}
                  onSuccess={() => fetchLabWorks(currentPage)}
                />
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Report Filter Drawer */}
        <Drawer
          isOpen={isReportOpen}
          onClose={onReportClose}
          size={isMobile ? "full" : "full"}
          placement={isMobile ? "bottom" : "right"}
        >
          <DrawerOverlay backdropFilter="blur(5px)" />
          <DrawerContent
            maxW={{ base: "100%", md: "75%", lg: "50%" }}
            h={isMobile ? "100dvh" : undefined}
            maxH={isMobile ? "100dvh" : undefined}
            borderTopRadius={0}
            borderRadius={0}
            borderLeftRadius={{ base: "none", md: "3xl" }}
            shadow="2xl"
            bg={useColorModeValue("white", "darkBrand.50")}
            overflow="hidden"
          >
            <DrawerCloseButton 
              color="white" 
              zIndex={2}
              mt={3} 
            />
            <DrawerHeader
              bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              borderRadius={0}
              borderTopRadius={0}
              py={5}
              px={{ base: 4, md: 8 }}
            >
              <HStack spacing={3}>
                <Icon as={FiDownload} boxSize={5} />
                <VStack align="start" spacing={0}>
                  <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold">Report Configuration</Text>
                  <Text fontSize="xs" fontWeight="normal" opacity={0.8}>Fine-tune your lab work export</Text>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody p={{ base: 4, md: 8 }} bg={useColorModeValue("white", "darkBrand.50")}>
              <VStack spacing={8} align="stretch">


                {/* Date Filters Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiCalendar} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color={useColorModeValue("gray.600", "gray.300")}>DATE RANGE FILTERS</Text>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    <Box bg={useColorModeValue("gray.50", "darkBrand.100")} p={4} borderRadius="2xl" border="1px solid" borderColor={useColorModeValue("gray.100", "darkBrand.200")}>
                      <VStack align="stretch" spacing={3}>
                        <HStack mb={2} spacing={2} justify="space-between">
                          <HStack spacing={2}>
                            <Icon as={FiCalendar} color="teal.500" />
                            <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color={useColorModeValue("gray.600", "gray.300")}>DATE FILTER</Text>
                          </HStack>
                        </HStack>
                        <CustomInput
                          name="dateType"
                          type="select"
                          isPortal
                          options={
                            reportFilters.workType === "in-house"
                              ? [
                                  { label: "Send Date", value: "sendDate" },
                                  { label: "Due Date", value: "dueDate" },
                                  { label: "Received Date", value: "receivedDate" },
                                  { label: "Creation Date", value: "createdAt" },
                                ]
                              : [
                                  { label: "Received Date", value: "receivedDate" },
                                  { label: "Due Date", value: "dueDate" },
                                  { label: "Send Date", value: "sendDate" },
                                  { label: "Creation Date", value: "createdAt" },
                                ]
                          }
                          value={{
                            label: (Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType) === "receivedDate" ? "Received Date" : (Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType) === "sendDate" ? "Send Date" : (Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType) === "createdAt" ? "Creation Date" : "Due Date",
                            value: Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType
                          }}
                          onChange={(val: any) => {
                            if (val) {
                              setReportFilters({ ...reportFilters, dateType: val.value });
                            }
                          }}
                        />
                        <SimpleGrid columns={2} spacing={4} w="100%">
                          <CustomInput
                            name="fromDate"
                            type="date"
                            label="From"
                            value={reportFilters.fromDate}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, fromDate: e.target.value })}
                          />
                          <CustomInput
                            name="toDate"
                            type="date"
                            label="To"
                            value={reportFilters.toDate}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, toDate: e.target.value })}
                          />
                        </SimpleGrid>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>

                <Divider />

                {/* Other Filters Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiList} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color={useColorModeValue("gray.600", "gray.300")}>ENTITY FILTERS</Text>
                  </HStack>
                  <VStack spacing={5} align="stretch">
                    <SimpleGrid columns={1} spacing={4}>
                    </SimpleGrid>
                    <CustomInput
                      name="status"
                      type="select"
                      label="Status"
                      isPortal
                      isMulti
                      options={(labWorkStatusStore.statuses || [])
                        .filter((s: any) => reportFilters.workType === "all" || s.type === reportFilters.workType)
                        .sort((a: any, b: any) => a.status.localeCompare(b.status))
                        .map((s: any) => ({
                          label: s.status,
                          value: s.status,
                        }))}
                      value={
                        reportFilters.status === "all"
                          ? (labWorkStatusStore.statuses || [])
                              .filter((s: any) => reportFilters.workType === "all" || s.type === reportFilters.workType)
                              .sort((a: any, b: any) => a.status.localeCompare(b.status))
                              .map((s: any) => ({ label: s.status, value: s.status }))
                          : Array.isArray(reportFilters.status)
                          ? reportFilters.status.map((s: string) => ({ label: s, value: s }))
                          : []
                      }
                      onChange={(val: any) => {
                        if (!val || val.length === 0) {
                          setReportFilters({ ...reportFilters, status: [] });
                        } else {
                          setReportFilters({ ...reportFilters, status: val.map((v: any) => v.value) });
                        }
                      }}
                    />
                    <CustomInput
                      name="patient"
                      placeholder="Search Patient"
                      type="real-time-user-search"
                      label="Filter by Patient"
                      isPortal
                      isClear
                      value={reportFilters.patient}
                      onChange={(val: any) => setReportFilters({ ...reportFilters, patient: val })}
                      query={{ type: "patient" }}
                    />
                    {reportFilters.workType === "in-house" && (
                      <CustomInput
                        name="doctor"
                        placeholder="Search Doctor"
                        type="real-time-user-search"
                        label="Filter by Doctor (In-house)"
                        isPortal
                        isClear
                        value={reportFilters.doctor}
                        onChange={(val: any) => setReportFilters({ ...reportFilters, doctor: val, labDoctor: null })}
                        query={{ type: "doctor" }}
                      />
                    )}
                    {reportFilters.workType === "outside" && (
                      <CustomInput
                        name="labDoctor"
                        placeholder="Search Lab Doctor"
                        type="real-time-search"
                        params={{
                          entityName: "labDoctorStore",
                          functionName: "getLabDoctors",
                          key: "labDoctorName",
                        }}
                        label="Filter by Lab Doctor (Outside)"
                        isPortal
                        isClear
                        value={reportFilters.labDoctor}
                        onChange={(val: any) => setReportFilters({ ...reportFilters, labDoctor: val, doctor: null })}
                      />
                    )}
                  </VStack>
                </Box>
                <Divider borderColor={useColorModeValue("gray.200", "darkBrand.200")} />

                {/* Columns Selection Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiColumns} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color={useColorModeValue("gray.600", "gray.300")}>REPORT COLUMNS</Text>
                  </HStack>
                  <VStack spacing={4} align="stretch">
                    <Box bg={useColorModeValue("gray.50", "darkBrand.100")} p={4} borderRadius="2xl" border="1px solid" borderColor={useColorModeValue("gray.100", "darkBrand.200")}>
                      <VStack align="stretch" spacing={3}>
                        <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                          Select the columns you want to include in the report. The order you select them is the order they will appear in the exported file.
                        </Text>
                        <CustomInput
                          name="selectedColumns"
                          type="select"
                          isPortal
                          isMulti
                          options={defaultLabWorkCols}
                          value={reportFilters.selectedColumns.map(val => defaultLabWorkCols.find(c => c.value === val))}
                          onChange={(val: any) => {
                            const newCols = val ? val.map((v: any) => v.value) : [];
                            setReportFilters({
                              ...reportFilters,
                              selectedColumns: newCols
                            });
                            localStorage.setItem("labReportColumns", JSON.stringify(newCols));
                          }}
                        />
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </DrawerBody>

            <DrawerFooter
              bg={useColorModeValue("gray.50", "darkBrand.100")}
              p={{ base: 3, md: 5 }}
              borderTop="1px solid"
              borderColor={useColorModeValue("gray.200", "darkBrand.200")}
            >
              <Flex w="100%" gap={2} align="center" justify="space-between">
                <Button
                  variant="ghost"
                  size={{ base: "sm", md: "md" }}
                  leftIcon={<FiRefreshCw />}
                  onClick={resetReportFilters}
                  borderRadius="xl"
                  color={useColorModeValue("gray.600", "gray.300")}
                  _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.100") }}
                  px={{ base: 2, md: 4 }}
                >
                  Reset
                </Button>
                <HStack spacing={2}>
                  <Button
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                    borderColor={useColorModeValue("gray.300", "whiteAlpha.300")}
                    color={useColorModeValue("gray.700", "white")}
                    _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.200") }}
                    onClick={onReportClose}
                    borderRadius="xl"
                    px={{ base: 3, md: 5 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="green"
                    size={{ base: "sm", md: "md" }}
                    leftIcon={<FiList />}
                    onClick={() => handleDownloadReport(true)}
                    isLoading={isDownloading}
                    px={{ base: 3, md: 6 }}
                    borderRadius="xl"
                    shadow="md"
                    whiteSpace="nowrap"
                  >
                    Preview Report
                  </Button>
                </HStack>
              </Flex>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* View Drawer */}
        <Drawer
          isOpen={isViewOpen}
          onClose={onViewClose}
          size={isMobile ? "full" : "full"}
          placement={isMobile ? "bottom" : "right"}
        >
          <DrawerOverlay backdropFilter="blur(5px)" />
          <DrawerContent
            maxW={{ base: "100%", md: "80%" }}
            h={isMobile ? "100dvh" : undefined}
            maxH={isMobile ? "100dvh" : undefined}
            borderTopRadius={0}
            borderRadius={0}
            borderLeftRadius={{ base: "none", md: "3xl" }}
            shadow="2xl"
            bg={useColorModeValue("white", "darkBrand.50")}
            overflow="hidden"
          >
            <DrawerCloseButton 
              color="white" 
              zIndex={2}
              mt={3} 
            />
            <DrawerHeader
              borderBottomWidth="1px"
              bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              borderRadius={0}
              borderTopRadius={0}
              py={4}
              px={{ base: 4, md: 8 }}
            >
              Lab Order Details
            </DrawerHeader>
            <DrawerBody p={0} bg={useColorModeValue("white", "darkBrand.50")}>
              {selectedLabWork && <LabSheetView data={selectedLabWork} />}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Report Preview Drawer */}
        <ReportPreviewDrawer
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Lab Work Report Preview"
          columns={previewData?.columns || []}
          rows={previewData?.rows || []}
          onDownload={() => handleDownloadReport(false)}
          isDownloading={isDownloading}
        />

        {/* Technician Report Preview Drawer */}
        <ReportPreviewDrawer
          isOpen={isTechnicianPreviewOpen}
          onClose={() => setIsTechnicianPreviewOpen(false)}
          title="Technician Report Preview"
          columns={technicianPreviewData?.columns || []}
          rows={technicianPreviewData?.rows || []}
          onDownload={async () => {
            const { fromDate, toDate } = technicianReportFilters;
            if (!fromDate || !toDate) {
              toast({ type: "error", title: "Error", message: "Please select both From and To dates." });
              return;
            }
            const from = new Date(fromDate);
            const to = new Date(toDate);
            const diffDays = Math.ceil(Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 40) {
              toast({ type: "error", title: "Error", message: "You can only filter a maximum of 40 days at a time." });
              return;
            }
            
            setIsDownloading(true);
            await stores.labWorkStore.downloadTechnicianReport({
              ...technicianReportFilters,
              workType: activeTab === 1 ? "in-house" : activeTab === 2 ? "outside" : "all",
            });
            setIsDownloading(false);
          }}
          isDownloading={isDownloading}
        />

        <Drawer
          isOpen={isTechnicianReportOpen}
          onClose={() => setIsTechnicianReportOpen(false)}
          size={isMobile ? "full" : "xl"}
          placement={isMobile ? "bottom" : "right"}
        >
          <DrawerOverlay backdropFilter="blur(5px)" />
          <DrawerContent
            maxW={{ base: "100%", md: "75%", lg: "50%" }}
            h={isMobile ? "100dvh" : undefined}
            maxH={isMobile ? "100dvh" : undefined}
            borderTopRadius={0}
            borderRadius={0}
            borderLeftRadius={{ base: "none", md: "3xl" }}
            shadow="2xl"
            bg={useColorModeValue("white", "darkBrand.50")}
            overflow="hidden"
          >
            <DrawerCloseButton 
              color="white" 
              zIndex={2}
              mt={3} 
            />
            <DrawerHeader
              bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              borderRadius={0}
              borderTopRadius={0}
              py={5}
              px={{ base: 4, md: 8 }}
            >
              <HStack spacing={3}>
                <Icon as={FiDownload} boxSize={5} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">Technician Report</Text>
                  <Text fontSize="xs" fontWeight="normal" opacity={0.8}>Download report grouped by technician</Text>
                </VStack>
              </HStack>
            </DrawerHeader>
            <DrawerBody p={{ base: 4, md: 6 }} bg={useColorModeValue("white", "darkBrand.50")}>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <CustomInput
                    name="technicianName"
                    label="Technician Name"
                    placeholder="Enter technician name..."
                    value={technicianReportFilters.technicianName}
                    onChange={(e: any) => setTechnicianReportFilters(prev => ({ ...prev, technicianName: e.target.value }))}
                  />
                  <CustomInput
                    name="techCategory"
                    label="Category (Multiple allowed)"
                    type="select"
                    isMulti={true}
                    options={[
                      { label: "All Categories", value: "all" },
                      ...stores.labWorkHierarchyStore.hierarchies
                        .filter((h: any) => !h.parentId)
                        .filter((h: any, index: number, self: any[]) => self.findIndex((t: any) => t.name === h.name) === index)
                        .map((h: any) => ({ label: h.name, value: h.name }))
                    ]}
                    value={
                      Array.isArray(technicianReportFilters.category) && technicianReportFilters.category.length > 0 && !technicianReportFilters.category.includes("all")
                        ? technicianReportFilters.category.map((c: string) => ({ label: c, value: c }))
                        : [{ label: "All Categories", value: "all" }]
                    }
                    onChange={(val: any) => {
                      if (Array.isArray(val)) {
                        const justAddedAll = val[val.length - 1]?.value === "all";
                        if (justAddedAll || val.length === 0) {
                          setTechnicianReportFilters((prev: any) => ({ ...prev, category: ["all"] }))
                        } else {
                          const withoutAll = val.filter(v => v.value !== "all").map(v => v.value);
                          setTechnicianReportFilters((prev: any) => ({ ...prev, category: withoutAll }))
                        }
                      } else {
                        setTechnicianReportFilters((prev: any) => ({ ...prev, category: ["all"] }))
                      }
                    }}
                  />
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <CustomInput
                    name="techDateType"
                    label="Date Filter"
                    type="select"
                    options={[
                      { label: "Created Date", value: "createdAt" },
                      { label: "Send Date", value: "sendDate" },
                      { label: "Received Date", value: "receivedDate" },
                    ]}
                    value={technicianReportFilters.dateType}
                    onChange={(val: any) => setTechnicianReportFilters(prev => ({ ...prev, dateType: val.value }))}
                  />
                  <CustomInput
                    name="techFromDate"
                    label="From Date"
                    type="date"
                    value={technicianReportFilters.fromDate}
                    onChange={(e: any) => setTechnicianReportFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                  />
                  <CustomInput
                    name="techToDate"
                    label="To Date"
                    type="date"
                    value={technicianReportFilters.toDate}
                    onChange={(e: any) => setTechnicianReportFilters(prev => ({ ...prev, toDate: e.target.value }))}
                  />
                </SimpleGrid>
              </VStack>
            </DrawerBody>
            <DrawerFooter bg={useColorModeValue("gray.50", "darkBrand.100")} borderTop="1px solid" borderColor={useColorModeValue("gray.200", "darkBrand.200")}>
              <Button
                variant="ghost"
                mr={3}
                color={useColorModeValue("gray.600", "gray.300")}
                _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.100") }}
                onClick={() => {
                const today = new Date();
                const last40Days = new Date();
                last40Days.setDate(today.getDate() - 40);
                setTechnicianReportFilters({ 
                  technicianName: "", 
                  category: "all", 
                  fromDate: last40Days.toISOString().split('T')[0], 
                  toDate: today.toISOString().split('T')[0], 
                  dateType: "receivedDate" 
                });
              }}>
                Reset
              </Button>
              <Button
                colorScheme="blue"
                onClick={async () => {
                  const { fromDate, toDate } = technicianReportFilters;
                  if (!fromDate || !toDate) {
                    toast({ type: "error", title: "Error", message: "Please select both From and To dates." });
                    return;
                  }
                  const from = new Date(fromDate);
                  const to = new Date(toDate);
                  const diffDays = Math.ceil(Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays > 40) {
                    toast({ type: "error", title: "Error", message: "You can only filter a maximum of 40 days at a time." });
                    return;
                  }

                  const res = await stores.labWorkStore.fetchTechnicianReport({
                    ...technicianReportFilters,
                    workType: activeTab === 1 ? "in-house" : activeTab === 2 ? "outside" : "all",
                  });
                  if (res?.status === "success" && res.data) {
                    const columns = [
                      { key: "sendDate", header: "Send Date" },
                      { key: "receivedDate", header: "Received Date" },
                      { key: "technicianName", header: "Technician Name" },
                      { key: "patientName", header: "Patient Name" },
                      { key: "category", header: "Category" },
                      { key: "teeth", header: "Teeth" },
                      { key: "unit", header: "Unit" },
                      { key: "shade", header: "Shade" },
                      { key: "amount", header: "Amount" }
                    ];

                    const formattedRows = res.data.map((r: any) => {
                      let sendDateStr = "-";
                      let receivedDateStr = "-";
                      if (r.sendDate && r.sendDate !== "-") {
                        try {
                          const d = new Date(r.sendDate);
                          sendDateStr = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
                        } catch (e) {}
                      }
                      if (r.receivedDate && r.receivedDate !== "-") {
                        try {
                          const d = new Date(r.receivedDate);
                          receivedDateStr = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
                        } catch (e) {}
                      }
                      return { ...r, sendDate: sendDateStr, receivedDate: receivedDateStr };
                    });
                    setTechnicianPreviewData({ columns, rows: formattedRows });
                    setIsTechnicianReportOpen(false);
                    setIsTechnicianPreviewOpen(true);
                  }
                }}
                isLoading={stores.labWorkStore.reportLoading}
              >
                Generate Report
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
    </Box>
  );
});

export default LabWorkTable;

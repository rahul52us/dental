"use client";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiEye,
  FiFilter,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import RecallAppointmentForm from "../RecallAppointmentForm/RecallAppointmentForm";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import FormModel from "../../../../component/common/FormModel/FormModel";
import { status } from "../utils/constant";
import RecallViewAppointment from "../RecallAppointmentForm/RecallViewAppointment";
import DentistScheduler from "../../../daily-report/component/DentistScheduler/DentistScheduler";
import { SLOT_DURATION } from "../../../daily-report/utils/constant";
import EditAppointmentForm from "../../../appointments/component/EditForm";
import AddAppointmentForm from "../../../appointments/component/AddForm";
import { useTranslation } from "react-i18next";

const RecallAppointmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    recallAppointmentStore: { getRecallAppointments, recallAppointment },
    auth: { openNotification, userType },
  } = stores;
  const [havePatient, setHavePatient] = useState(isPatient);
  const [havePatientDetails, setHavePatientDetails] = useState(patientDetails);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const { t } = useTranslation();

  const [formModal, setFormModal] = useState<any>({
    open: false,
    data: null,
    type: "add",
  });

  const [openView, setOpenView] = useState({
    open: false,
    data: null,
  });

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  // Dark mode color tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.800");
  const borderSubtle = useColorModeValue("gray.200", "gray.700");
  const borderLight = useColorModeValue("gray.100", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "gray.100");
  const textSecondary = useColorModeValue("gray.700", "gray.200");
  const textMuted = useColorModeValue("gray.600", "gray.300");
  const textFaint = useColorModeValue("gray.500", "gray.400");
  const reasonBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const reasonBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const drawerBg = useColorModeValue("white", "gray.800");
  const drawerSubtleBg = useColorModeValue("gray.50", "gray.700");
  const drawerFooterBorder = useColorModeValue("gray.100", "gray.700");
  const pageLabelColor = useColorModeValue("gray.600", "gray.300");
  const isDark = useColorModeValue(false, true);

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [openReportModal, setOpenReportModal] = useState({
    open: false,
    type: "add",
  });
  const [haveAppointmentDetails, setHaveAppointmentDetails] = useState(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const hasActiveFilters = Boolean(filterStartDate || filterEndDate || filterStatus);

  const openFilterDrawer = () => {
    setTempStartDate(filterStartDate);
    setTempEndDate(filterEndDate);
    setTempStatus(filterStatus);
    setIsFilterDrawerOpen(true);
  };

  const getRecallStatusBadge = (st: string) => {
    switch (st) {
      case "scheduled":
        return {
          bg: isDark ? "blue.900" : "blue.50",
          color: isDark ? "blue.200" : "blue.700",
          border: isDark ? "blue.700" : "blue.200",
          label: "Scheduled",
        };
      case "in-progress":
        return {
          bg: isDark ? "yellow.900" : "yellow.50",
          color: isDark ? "yellow.200" : "yellow.800",
          border: isDark ? "yellow.700" : "yellow.200",
          label: "In Progress",
        };
      case "completed":
        return {
          bg: isDark ? "green.900" : "green.50",
          color: isDark ? "green.200" : "green.700",
          border: isDark ? "green.700" : "green.200",
          label: "Completed",
        };
      case "cancelled":
        return {
          bg: isDark ? "red.900" : "red.50",
          color: isDark ? "red.200" : "red.700",
          border: isDark ? "red.700" : "red.200",
          label: "Cancelled",
        };
      case "shift":
        return {
          bg: isDark ? "purple.900" : "purple.50",
          color: isDark ? "purple.200" : "purple.700",
          border: isDark ? "purple.700" : "purple.200",
          label: "Shift",
        };
      case "no-show":
        return {
          bg: isDark ? "gray.700" : "gray.100",
          color: isDark ? "gray.200" : "gray.700",
          border: isDark ? "gray.600" : "gray.300",
          label: "No Show",
        };
      case "arrived":
        return {
          bg: isDark ? "teal.900" : "teal.50",
          color: isDark ? "teal.200" : "teal.700",
          border: isDark ? "teal.700" : "teal.200",
          label: "Arrived",
        };
      default:
        return {
          bg: isDark ? "gray.800" : "gray.50",
          color: isDark ? "gray.300" : "gray.600",
          border: isDark ? "gray.700" : "gray.200",
          label: st?.replace("-", " ") || "—",
        };
    }
  };

  const [selectedDateAndTime, setSelectedDateTime] = useState<any>({
    open: false,
    chair: undefined,
    chairId: "",
    selectedDate: new Date(),
    time: "",
    start: null,
    end: null,
    type: "add",
  });

  // New state for autofill
  const [autofillData, setAutofillData] = useState<any>(null);

  // State to hold doctor selected in Recall Form to pass to Add Form
  const [selectedRecallDoctor, setSelectedRecallDoctor] = useState<any>(null);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState<'default' | 'recall'>('default');

  const applyGetAllRecords = useCallback(
    ({ page = currentPage, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (!reset && debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      if (!reset && filterStatus) {
        query.status = filterStatus;
      }
      if (!reset && filterStartDate) {
        query.fromDate = filterStartDate;
      }
      if (!reset && filterEndDate) {
        query.toDate = filterEndDate;
      }

      if (isPatient && patientDetails) {
        query.patient = patientDetails?._id;
      }

      getRecallAppointments(query)
        .then(() => { })
        .catch((err) => {
          openNotification({
            type: "error",
            title: t("recall.table.failedToGetAppointments"),
            message: err?.message,
          });
        });
    },
    [
      debouncedSearchQuery,
      filterStatus,
      filterStartDate,
      filterEndDate,
      getRecallAppointments,
      openNotification,
      currentPage,
      isPatient,
      patientDetails,
    ],
  );

  useEffect(() => {
    applyGetAllRecords({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, filterStatus, filterStartDate, filterEndDate, applyGetAllRecords]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setTempStatus("");
    applyGetAllRecords({ page: 1, reset: true });
  };

  const patientColumn = [
    {
      headerName: t("recall.table.patientName"),
      key: "patientName",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Text>{dt?.patientName || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("recall.table.patientMobileNumber"),
      key: "patientMobileNumber",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Text>{dt?.patientMobileNumber || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
  ];

  // Define table columns
  const ContactTableColumn = [
    ,
    ...(!isPatient ? patientColumn : []),
    {
      headerName: t("recall.table.doctor"),
      key: "doctorName",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Text>{dt?.doctorName || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("recall.table.status"),
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case "scheduled":
                return "blue";
              case "in-progress":
                return "yellow";
              case "completed":
                return "green";
              case "cancelled":
                return "red";
              case "shift":
                return "purple";
              case "no-show":
                return "gray";
              case "arrived":
                return "green";
              default:
                return "gray";
            }
          };

          return (
            <Box
              as="button"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
              textTransform="capitalize"
              bg={`${getStatusColor(dt.status)}.100`}
              color={`${getStatusColor(dt.status)}.700`}
              onClick={() => {
                // setOpenChangeStatus({ open: true, data: dt });
              }}
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
      headerName: t("recall.table.reason"),
      key: "reason",
      type: "tooltip",
      metaData: {
        component: (dt: any) => <Box m={1}>{dt?.reason}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("recall.table.createdBy"),
      key: "createdBy",
      type: "component",
      metaData: {
        component: (dt: any) => <Box m={1}>{dt?.createdBy || "--"}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("recall.table.recallDate"),
      key: "recallDate",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>{formatDate(dt?.recallDate) || "--"}</Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("recall.table.actions"),
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  const subTitle = `${patientDetails?.name} `;

  const handleOpenAddDrawer = (data: any) => {
    const selectedDate = moment(data.selectedDate).format("YYYY-MM-DD");

    const start = moment(`${selectedDate} ${data.time}`, "YYYY-MM-DD HH:mm");
    const end = start.clone().add(SLOT_DURATION, "minutes");

    setSelectedDateTime({
      selectedDate: data?.selectedDate || new Date(),
      start: start.toDate(),
      end: end.toDate(),
      time: data.time,
      chairId: data.chair?.id,
      chair: {
        label: data?.chair?.name,
        value: data?.chair?.id,
      },
      data: data?.appointment,
      open: true,
      type: data?.mode === "edit" ? "edit" : "add",
    });
  };

  console.log("the have appointment details", haveAppointmentDetails);

  return (
    <>
      {isMobile ? (
        <Box p={3} pb={20}>
          {/* Header Bar */}
          <Flex justify="space-between" align="center" mb={3}>
            <HStack spacing={2}>
              <Text fontSize="18px" fontWeight="800" color={textPrimary}>
                {patientDetails ? `${patientDetails?.name}` : t("recall.table.recallAppointment")}
              </Text>
              <Badge
                bg={useColorModeValue("rgba(13, 148, 136, 0.12)", "rgba(45, 212, 191, 0.15)")}
                color={useColorModeValue("teal.700", "teal.200")}
                border="1px solid"
                borderColor={useColorModeValue("rgba(13, 148, 136, 0.25)", "rgba(45, 212, 191, 0.3)")}
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="11px"
                fontWeight="800"
              >
                {recallAppointment?.data?.length || 0}
              </Badge>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant={hasActiveFilters ? "solid" : "outline"}
                colorScheme={hasActiveFilters ? "teal" : "gray"}
                leftIcon={<FiFilter fontSize="14px" />}
                borderRadius="xl"
                fontWeight="700"
                h="36px"
                fontSize="12px"
                onClick={openFilterDrawer}
              >
                Filter {hasActiveFilters && "•"}
              </Button>

              {stores.auth.hasPermission("recall", "create") && (
                <Button
                  size="sm"
                  bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                  color="white"
                  _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                  _active={{ transform: "scale(0.96)" }}
                  leftIcon={<IoMdAdd fontSize="16px" />}
                  borderRadius="xl"
                  fontWeight="800"
                  px={3}
                  h="36px"
                  boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                  onClick={() => {
                    setFormModal({
                      open: true,
                      type: "add",
                    });
                    setSelectedRecallDoctor(null);
                  }}
                >
                  Add
                </Button>
              )}
            </HStack>
          </Flex>

          {/* Search Box */}
          <InputGroup size="sm" mb={3}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#94A3B8" />
            </InputLeftElement>
            <Input
              placeholder="Search patient, doctor, reason..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              borderRadius="xl"
              bg={inputBg}
              color={textPrimary}
              borderColor={borderSubtle}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px #0D9488",
              }}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear search"
                  icon={<FiX size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                />
              </InputRightElement>
            )}
          </InputGroup>

          {/* Mobile Filter Half-Bottom Sheet */}
          <Drawer
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            placement="bottom"
          >
            <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
            <DrawerContent
              borderTopRadius={0}
              borderRadius={0}
              maxH="68vh"
              bg={drawerBg}
              boxShadow="0 -10px 30px rgba(0,0,0,0.25)"
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
                  <Text>Filter Recall Appointments</Text>
                </HStack>
              </DrawerHeader>

              <DrawerBody p={4} overflowY="auto">
                <VStack spacing={4} align="stretch">
                  {/* Date Range Section */}
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color={textFaint}
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                      mb={1.5}
                    >
                      Recall Date Range
                    </Text>
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="11px" color={textMuted} mb={1} fontWeight="600">
                          From Date
                        </Text>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius="xl"
                          bg={drawerSubtleBg}
                          color={textPrimary}
                          borderColor={borderSubtle}
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          fontWeight="600"
                          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="11px" color={textMuted} mb={1} fontWeight="600">
                          To Date
                        </Text>
                        <Input
                          type="date"
                          size="sm"
                          borderRadius="xl"
                          bg={drawerSubtleBg}
                          color={textPrimary}
                          borderColor={borderSubtle}
                          value={tempEndDate}
                          onChange={(e) => setTempEndDate(e.target.value)}
                          fontWeight="600"
                          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
                        />
                      </Box>
                    </SimpleGrid>
                  </Box>

                  {/* Status Section */}
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color={textFaint}
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                      mb={1.5}
                    >
                      Appointment Status
                    </Text>
                    <Select
                      size="sm"
                      borderRadius="xl"
                      bg={drawerSubtleBg}
                      color={textPrimary}
                      borderColor={borderSubtle}
                      fontWeight="600"
                      value={tempStatus}
                      onChange={(e) => setTempStatus(e.target.value)}
                      _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
                    >
                      <option value="" style={{ background: isDark ? "#1A202C" : "#FFFFFF" }}>All Statuses</option>
                      {status.map((st: any) => (
                        <option key={st.value} value={st.value} style={{ background: isDark ? "#1A202C" : "#FFFFFF" }}>
                          {st.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  {/* Active Filter Indicators */}
                  {(tempStartDate || tempEndDate || tempStatus) && (
                    <Box
                      p={2.5}
                      bg={useColorModeValue("teal.50", "rgba(13, 148, 136, 0.15)")}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={useColorModeValue("teal.100", "teal.800")}
                    >
                      <Text fontSize="11px" fontWeight="700" color={useColorModeValue("teal.800", "teal.200")} mb={1}>
                        Active Selections:
                      </Text>
                      <HStack spacing={1.5} flexWrap="wrap">
                        {tempStartDate && (
                          <Badge colorScheme="teal" borderRadius="full" px={2} py={0.5} fontSize="10px">
                            From: {tempStartDate}
                          </Badge>
                        )}
                        {tempEndDate && (
                          <Badge colorScheme="teal" borderRadius="full" px={2} py={0.5} fontSize="10px">
                            To: {tempEndDate}
                          </Badge>
                        )}
                        {tempStatus && (
                          <Badge colorScheme="purple" borderRadius="full" px={2} py={0.5} fontSize="10px">
                            Status: {tempStatus}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </DrawerBody>

              <DrawerFooter bg={drawerSubtleBg} py={3} px={4} borderTop="1px solid" borderColor={drawerFooterBorder}>
                <HStack spacing={2} w="full">
                  <Button
                    size="sm"
                    variant="ghost"
                    flex={1}
                    borderRadius="xl"
                    colorScheme="gray"
                    leftIcon={<FiRefreshCw />}
                    onClick={() => {
                      setTempStartDate("");
                      setTempEndDate("");
                      setTempStatus("");
                      resetTableData();
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    Reset All
                  </Button>
                  <Button
                    size="sm"
                    bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                    color="white"
                    flex={1}
                    borderRadius="xl"
                    fontWeight="700"
                    _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                    _active={{ transform: "scale(0.98)" }}
                    onClick={() => {
                      setFilterStartDate(tempStartDate);
                      setFilterEndDate(tempEndDate);
                      setFilterStatus(tempStatus);
                      setCurrentPage(1);
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </HStack>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Cards List or Loading / Empty state */}
          {recallAppointment.loading ? (
            <Flex minH="220px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color={textFaint}>Loading recall appointments...</Text>
            </Flex>
          ) : !recallAppointment.data || recallAppointment.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={cardBg}
              borderRadius="22px"
              border="1px dashed"
              borderColor={borderSubtle}
              textAlign="center"
            >
              <Icon as={FiCalendar} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color={textSecondary}>
                No Recall Appointments Found
              </Text>
              <Text fontSize="12px" color={textFaint} mt={1} maxW="240px">
                {hasActiveFilters
                  ? "Try resetting your search or filters to see appointments."
                  : "Tap + Add to create a new recall appointment."}
              </Text>
              {hasActiveFilters && (
                <Button
                  size="xs"
                  mt={3}
                  variant="outline"
                  colorScheme="teal"
                  onClick={resetTableData}
                  borderRadius="lg"
                >
                  Reset Filters
                </Button>
              )}
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {recallAppointment.data.map((dt: any, idx: number) => {
                const statusBadge = getRecallStatusBadge(dt.status);
                const patientName = dt?.patientName || dt?.patient?.name || "--";
                const patientMobile = dt?.patientMobileNumber || dt?.patient?.mobileNumber;
                const doctorName = dt?.doctorName || dt?.doctor?.name;
                const recallDateStr = formatDate(dt?.recallDate);

                return (
                  <Box
                    key={dt._id || idx}
                    bg={cardBg}
                    p={4}
                    borderRadius="20px"
                    boxShadow="0 2px 10px rgba(0,0,0,0.04)"
                    border="1px solid"
                    borderColor={borderSubtle}
                    borderLeft="4px solid #0D9488"
                    position="relative"
                    transition="all 0.2s ease"
                  >
                    {/* Top Row: Avatar + Name + Status */}
                    <Flex justify="space-between" align="flex-start" gap={2} mb={2.5}>
                      <HStack spacing={3} align="center" flex={1} minW={0}>
                        <Avatar
                          size="sm"
                          name={patientName}
                          bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                          color="white"
                          fontWeight="700"
                          fontSize="13px"
                        />
                        <Box minW={0} flex={1}>
                          <Text
                            fontSize="14px"
                            fontWeight="800"
                            color={textPrimary}
                            noOfLines={1}
                          >
                            {patientName}
                          </Text>
                          {patientMobile && (
                            <HStack
                              as="a"
                              href={`tel:${patientMobile}`}
                              spacing={1}
                              color={textFaint}
                              fontSize="12px"
                              mt={0.5}
                              _hover={{ color: "teal.400" }}
                            >
                              <Icon as={FiPhone} boxSize="11px" />
                              <Text noOfLines={1}>{patientMobile}</Text>
                            </HStack>
                          )}
                        </Box>
                      </HStack>

                      <Badge
                        bg={statusBadge.bg}
                        color={statusBadge.color}
                        border="1px solid"
                        borderColor={statusBadge.border}
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="11px"
                        fontWeight="750"
                        textTransform="capitalize"
                        flexShrink={0}
                      >
                        {statusBadge.label}
                      </Badge>
                    </Flex>

                    {/* Middle Info Row: Doctor & Recall Date */}
                    <SimpleGrid columns={2} spacing={2} pt={1} pb={2}>
                      <HStack spacing={1.5} align="center" minW={0}>
                        <Icon as={FiUser} boxSize="13px" color="gray.400" flexShrink={0} />
                        <Box minW={0}>
                          <Text fontSize="10px" color="gray.400" fontWeight="600" lineHeight="1">
                            DOCTOR
                          </Text>
                          <Text fontSize="12px" color={textSecondary} fontWeight="600" noOfLines={1} mt={0.5}>
                            {doctorName || "--"}
                          </Text>
                        </Box>
                      </HStack>

                      <HStack spacing={1.5} align="center" minW={0}>
                        <Icon as={FiCalendar} boxSize="13px" color="teal.500" flexShrink={0} />
                        <Box minW={0}>
                          <Text fontSize="10px" color="gray.400" fontWeight="600" lineHeight="1">
                            RECALL DATE
                          </Text>
                          <Text fontSize="12px" color={useColorModeValue("teal.700", "teal.300")} fontWeight="700" noOfLines={1} mt={0.5}>
                            {recallDateStr || "--"}
                          </Text>
                        </Box>
                      </HStack>
                    </SimpleGrid>

                    {/* Reason box if present */}
                    {dt?.reason && (
                      <Box
                        bg={reasonBg}
                        p={2.5}
                        borderRadius="lg"
                        border="1px dashed"
                        borderColor={reasonBorder}
                        mb={2.5}
                      >
                        <Text fontSize="10px" fontWeight="750" color="gray.400" textTransform="uppercase" mb={0.5}>
                          Recall Reason
                        </Text>
                        <Text fontSize="12px" color={textSecondary} lineHeight="1.5">
                          {dt.reason}
                        </Text>
                      </Box>
                    )}

                    {/* Created by info if available */}
                    {dt?.createdBy && (
                      <HStack spacing={1} color="gray.400" fontSize="11px" mb={2}>
                        <Icon as={FiClock} boxSize="11px" />
                        <Text>Created by: {dt.createdBy}</Text>
                      </HStack>
                    )}

                    {/* Action Toolbar */}
                    <Flex
                      pt={2}
                      borderTop="1px solid"
                      borderColor={borderLight}
                      justify="flex-end"
                      gap={2}
                    >
                      {stores.auth.hasPermission("recall", "view") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="teal"
                          color={useColorModeValue("teal.700", "teal.200")}
                          bg={useColorModeValue("teal.50", "whiteAlpha.100")}
                          _hover={{ bg: useColorModeValue("teal.100", "whiteAlpha.200") }}
                          leftIcon={<FiEye fontSize="13px" />}
                          borderRadius="lg"
                          fontSize="12px"
                          fontWeight="700"
                          h="30px"
                          onClick={() => setOpenView({ open: true, data: dt })}
                        >
                          View
                        </Button>
                      )}

                      {stores.auth.hasPermission("recall", "edit") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          color={useColorModeValue("blue.700", "blue.200")}
                          bg={useColorModeValue("blue.50", "whiteAlpha.100")}
                          _hover={{ bg: useColorModeValue("blue.100", "whiteAlpha.200") }}
                          leftIcon={<FiEdit2 fontSize="13px" />}
                          borderRadius="lg"
                          fontSize="12px"
                          fontWeight="700"
                          h="30px"
                          onClick={() => {
                            setFormModal({
                              open: true,
                              data: dt,
                              type: "edit",
                            });
                            if (dt.doctor) {
                              setSelectedRecallDoctor({ name: dt.doctor.name, _id: dt.doctor._id });
                            } else {
                              setSelectedRecallDoctor(null);
                            }
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Pagination */}
          {recallAppointment.totalPages > 1 && (
            <Flex justify="space-between" align="center" mt={4} pt={2}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                leftIcon={<FiChevronLeft />}
                isDisabled={currentPage <= 1}
                onClick={() => handleChangePage(currentPage - 1)}
                fontSize="12px"
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color={pageLabelColor}>
                Page {currentPage} of {recallAppointment.totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight />}
                isDisabled={currentPage >= recallAppointment.totalPages}
                onClick={() => handleChangePage(currentPage + 1)}
                fontSize="12px"
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <CustomTable
          title={t("recall.table.recallAppointment")}
          subTitle={patientDetails ? subTitle : undefined}
          data={recallAppointment?.data || []}
          columns={ContactTableColumn}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: stores.auth.hasPermission('recall', 'create'),
                function: () => {
                  setFormModal({
                    open: true,
                    type: "add",
                  });
                  setSelectedRecallDoctor(null);
                },
              },
              editKey: {
                showEditButton: stores.auth.hasPermission('recall', 'edit'),
                function: (dt: any) => {
                  setFormModal({
                    open: true,
                    data: dt,
                    type: "edit",
                  });
                  if (dt.doctor) {
                    setSelectedRecallDoctor({ name: dt.doctor.name, _id: dt.doctor._id });
                  } else {
                    setSelectedRecallDoctor(null);
                  }
                },
              },
              viewKey: {
                showViewButton: stores.auth.hasPermission('recall', 'view'),
                function: (dt: any) => {
                  setOpenView({ open: true, data: dt });
                },
              },
            },
            search: {
              show: true,
              searchValue: searchQuery,
              onSearchChange: (e: any) => setSearchQuery(e.target.value),
            },
            customComponent: (
              <Flex gap={2} alignItems="center">
                <Input
                  type="date"
                  size="sm"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  bg={inputBg}
                  color={textPrimary}
                  borderColor={borderSubtle}
                  borderRadius="md"
                />
                <Text fontSize="sm" color={textFaint}>to</Text>
                <Input
                  type="date"
                  size="sm"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  bg={inputBg}
                  color={textPrimary}
                  borderColor={borderSubtle}
                  borderRadius="md"
                />
                <select
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${isDark ? "#4A5568" : "#e2e8f0"}`,
                    backgroundColor: isDark ? "#1A202C" : "#FFFFFF",
                    color: isDark ? "#F7FAFC" : "#1A202C",
                    fontSize: "14px",
                    outline: "none",
                    marginLeft: "8px"
                  }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="" style={{ background: isDark ? "#1A202C" : "#FFFFFF" }}>All Statuses</option>
                  {status.map((st: any) => (
                    <option key={st.value} value={st.value} style={{ background: isDark ? "#1A202C" : "#FFFFFF" }}>{st.label}</option>
                  ))}
                </select>
                <Tooltip label="Reset" placement="top" hasArrow>
                  <IconButton
                    aria-label="Reset Filters"
                    icon={<FiRefreshCw />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="red.400"
                    ml={3}
                    onClick={resetTableData}
                    _hover={{ bg: "red.50" }}
                  />
                </Tooltip>
              </Flex>
            ),
            resetData: {
              show: true,
              text: t("recall.table.resetData"),
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: recallAppointment.totalPages,
            },
          }}
          loading={recallAppointment.loading}
        />
      )}

      {/* View Appointment Details Drawer */}
      <FormModel
        width={"80vw"}
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title={t("recall.table.recallAppointmentSummary")}
        isCentered
      >
        <RecallViewAppointment data={openView.data} />
      </FormModel>
      {formModal?.open && (
        <FormModel
          width="80vw"
          open={formModal.open}
          close={() =>
            setFormModal({
              open: false,
              data: null,
              type: "add",
            })
          }
          title={
            formModal.type === "add"
              ? t("recall.table.createRecallAppointment")
              : t("recall.table.editRecallAppointment")
          }
          isCentered
        >
          <Box p={2}>
            {formModal.type === "add" ? (
              <RecallAppointmentForm
                patientDetails={havePatientDetails}
                isPatient={havePatient}
                haveAppointmentDetails={haveAppointmentDetails}
                setOpenReportModal={(dt: any) => {
                  setHavePatient(true);
                  setHavePatientDetails({
                    name: dt?.patient?.label,
                    _id: dt?.patient?.value,
                  });
                  setOpenReportModal({ open: true, type: "add" });
                  setSelectionMode('recall');
                  setSelectedDate(new Date(dt?.appointmentDate));
                  if (dt?.doctor?.value) {
                    setSelectedRecallDoctor({ name: dt.doctor.label, _id: dt.doctor.value });
                  } else {
                    setSelectedRecallDoctor(null);
                  }
                }}
                applyGetAllRecords={applyGetAllRecords}
                onClose={() =>
                  setFormModal({
                    open: false,
                    data: null,
                    type: "add",
                  })
                }
                initialValues={{
                  patient: isPatient && patientDetails
                    ? { label: patientDetails.name, value: patientDetails._id }
                    : undefined,
                  doctor: undefined,
                  reason: undefined,
                  status: status[0],
                  recallDate: undefined,
                  appointmentDate: undefined,
                  startTime: "",
                  endTime: "",
                }}
                formModal={formModal}
                autofillData={autofillData}
              />
            ) : (
              <RecallAppointmentForm
                patientDetails={havePatientDetails}
                isPatient={havePatient}
                haveAppointmentDetails={haveAppointmentDetails}
                isEdit={true}
                setOpenReportModal={(dt: any) => {
                  setHavePatient(true);
                  setHavePatientDetails({
                    name: dt?.patient?.label,
                    _id: dt?.patient?.value,
                  });
                  console.log('the dt is', dt)
                  setOpenReportModal({ open: true, type: "add" });
                  setSelectionMode('recall');
                  setSelectedDate(new Date(dt?.appointmentDate));
                  if (dt?.doctor?.value) {
                    setSelectedRecallDoctor({ name: dt.doctor.label, _id: dt.doctor.value });
                  } else {
                    setSelectedRecallDoctor(null);
                  }
                }}
                initialValues={
                  formModal?.data
                    ? {
                      ...formModal.data,

                      status:
                        status.find(
                          (it: any) => it.value === formModal.data.status,
                        ) || status[0],

                      patient: {
                        label: formModal.data.patient?.name,
                        value: formModal.data.patient?._id,
                      },
                      recallDate: formatDate(
                        formModal?.data?.recallDate,
                        "YYYY-MM-DD",
                      ),
                      appointmentDate: formatDate(
                        formModal?.data?.appointmentDate,
                        "YYYY-MM-DD",
                      ),
                      doctor: formModal.data.doctor
                        ? {
                          label: formModal.data.doctor.name,
                          value: formModal.data.doctor._id,
                        }
                        : null,
                      startTime: formModal.data.startTime || "",
                      endTime: formModal.data.endTime || "",
                    }
                    : {}
                }
                applyGetAllRecords={applyGetAllRecords}
                onClose={() =>
                  setFormModal({
                    open: false,
                    data: null,
                    type: "add",
                  })
                }

                formModal={formModal}
                autofillData={autofillData}
              />
            )}
          </Box>
        </FormModel>
      )}
      <CustomDrawer
        width={"90vw"}
        open={openReportModal.open}
        close={() => {
          setOpenReportModal({
            open: false,
            type: "add",
          });
          setSelectionMode('default');
          setSelectedRecallDoctor(null);
        }}
        title={
          selectedDate
            ? t("recall.table.appointmentSelected", { date: moment(selectedDate).format("DD MMM YYYY") })
            : t("recall.table.selectDate")
        }
        props={{ blockScrollOnMount: false }}
      >
        <DentistScheduler
          isPatient={havePatient}
          patientDetails={havePatientDetails}
          applyGetAllRecords={applyGetAllRecords}
          handleTimeSlots={(e: any) => {
            console.log("DEBUG: handleTimeSlots called", e);
            console.log("DEBUG: selectionMode:", selectionMode);
            // Always open the add drawer to create/edit appointment
            handleOpenAddDrawer(e);
          }}
          createdAppointmentByCalender={true}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          shouldNotEditIcon={true}
        />
      </CustomDrawer>

      <CustomDrawer
        width="80vw"
        open={selectedDateAndTime.open}
        close={() => {
          setSelectedDateTime({
            open: false,
            time: undefined,
            start: undefined,
            end: undefined,
            data: null,
            type: "add",
          });
          // Do NOT close the scheduler modal here if we want to return to it,
          // or DO close it if we want to return to Recall Form?
          // User typically wants to return to Recall Form if they just added an appointment for it.
          // But 'close' is called on Cancel too.

          // If we are in recall mode and cancel, we might want to keep scheduler open?
          // Current behavior: `setOpenReportModal({ open: false ... })` was here in previous code (view_file line 555-558).
          // I will keep it consistent or minimal needed change.
          /*
          setOpenReportModal({
            open: false,
            type: "add",
          });
          */
        }}
        title={
          selectedDateAndTime
            ? t("recall.table.appointmentSelected", { date: moment(selectedDateAndTime.start).format("dddd, DD MMM YYYY") })
            : t("recall.table.selectDate")
        }

      >
        <Box p={2}>
          {selectedDateAndTime.type === "add" ? (
            <AddAppointmentForm
              patientDetails={havePatientDetails}
              doctorDetails={selectedRecallDoctor}
              setHaveAppointmentDetails={(dt: any) => {
                setHaveAppointmentDetails(dt);
                if (selectionMode === 'recall' && dt) {
                  // Autofill logic from the NEWLY created appointment
                  console.log("DEBUG: New Appointment Created for Recall:", dt);
                  setAutofillData({
                    appointmentDate: dt.appointmentDate,
                    startTime: dt.startTime,
                    endTime: dt.endTime,
                    doctor: dt.primaryDoctor || undefined,
                    // Note: dt structure depends on backend response.
                    // AddForm calls setHaveAppointmentDetails(dt?.data).
                  });

                  // Close Scheduler Drawer
                  setOpenReportModal({ open: false, type: "add" });
                  setSelectionMode('default');
                }
              }}
              isPatient={havePatient}
              applyGetAllRecords={applyGetAllRecords}
              close={() => {
                setSelectedDateTime({
                  open: false,
                  time: undefined,
                  start: undefined,
                  end: undefined,
                  data: null,
                  type: "add",
                });

                if (selectionMode === 'recall') {
                  // If we are just closing (e.g. cancel), maybe we keep scheduler open?
                  // But if we came from success, we handled it.
                  // Let's assume on Cancel we go back to Scheduler.
                } else {
                  setOpenReportModal({
                    open: false,
                    type: "add",
                  });
                }
              }}
              selectedDateAndTime={selectedDateAndTime}
            />
          ) : (
            <EditAppointmentForm
              patientDetails={havePatientDetails}
              isPatient={havePatient}
              applyGetAllRecords={applyGetAllRecords}
              close={() => {
                setSelectedDateTime({
                  open: false,
                  time: undefined,
                  start: undefined,
                  end: undefined,
                  data: null,
                  type: "add",
                })
                setOpenReportModal({
                  open: false,
                  type: "add",
                });
              }
              }
              selectedDateAndTime={selectedDateAndTime}
            />
          )}
        </Box>
      </CustomDrawer>
    </>
  );
});

export default RecallAppointmentList;
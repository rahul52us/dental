"use client";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  useColorModeValue,
  useBreakpointValue,
  Badge,
  Input,
  IconButton,
  Spinner,
  Avatar,
  VStack
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { keyframes } from "@emotion/react";

const blink = keyframes`
  0% { transform: scale(0.9); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.4; }
`;
import { useCallback, useEffect, useState } from "react";
import CustomDrawer from "../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import stores from "../../store/stores";
import AppointmentDetailsView from "./element/AppointmentDetailsView";
import AppointChangeStatus from "./element/AppointmentStatusChange";
import DentistScheduler from "../daily-report/component/DentistScheduler/DentistScheduler";
import moment from "moment";
import { SLOT_DURATION } from "../daily-report/utils/constant";
import AddAppointmentForm from "./component/AddForm";
import EditAppointmentForm from "./component/EditForm";
import { toJS } from "mobx";
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "@chakra-ui/icons";
import { FiClock, FiSearch, FiUser } from "react-icons/fi";
import AppointmentHistoryModal from "./component/AppointmentHistoryModal";
import { FaClipboardList } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const AppointmentList = observer(({ isPatient, patientDetails, doctorDetails, defaultOpenCalendar = false }: any) => {
  const {
    DoctorAppointment: {
      getDoctorAppointment,
      appointments,
      getPatientAppointmentStatusCount,
    },
    auth: { openNotification, userType },
  } = stores;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [createdAppointmentByCalender, setCreatedAppointmentByCalender] =
    useState(false);
  const [openReportModal, setOpenReportModal] = useState({
    open: defaultOpenCalendar,
    type: "add",
  });
  const { t } = useTranslation();

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

  const [patientStatus, setPatientStatus] = useState({
    shift: 0,
    cancelled: 0,
    "no-show": 0,
  });

  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    patientId: "",
    patientName: "",
  });

  console.log(toJS(appointments));

  const fetchPatientStatus = async () => {
    try {
      console.log("📡 Fetching status for patient:", patientDetails?._id);
      const response = await getPatientAppointmentStatusCount({
        patient: patientDetails?._id,
      });
      console.log("✅ Status API Response:", response);
      if (response?.status === "success") {
        setPatientStatus(response?.data);
      }
    } catch (err: any) {
      openNotification({
        type: "error",
        title: t("appointments.page.failedToFetchStatus"),
        message: err?.message,
      });
    }
  };

  useEffect(() => {
    if (isPatient && patientDetails) {
      fetchPatientStatus();
    }
  }, [patientDetails]);

  const [openChangeStatus, setOpenChangeStatus] = useState({
    open: false,
    data: null,
  });

  // Auto-open history modal when Add / Calendar is opened
  useEffect(() => {
    console.log("🔍 Auto-open check:", { open: openReportModal.open, isPatient, patientStatus });
    if (openReportModal.open && isPatient && (patientStatus.shift > 0 || patientStatus.cancelled > 0)) {
      console.log("🚀 Triggering history modal auto-open");
      setHistoryModal({
        isOpen: true,
        patientId: patientDetails?._id || patientDetails?.id,
        patientName: patientDetails?.name || "Patient",
      });
    }
  }, [openReportModal.open, isPatient, patientStatus, patientDetails]);

  // Also auto-open when a slot is clicked (Add form opens)
  useEffect(() => {
    if (selectedDateAndTime.open && selectedDateAndTime.type === "add" && isPatient && (patientStatus.shift > 0 || patientStatus.cancelled > 0)) {
      setHistoryModal({
        isOpen: true,
        patientId: patientDetails?._id || patientDetails?.id,
        patientName: patientDetails?.name || "Patient",
      });
    }
  }, [selectedDateAndTime.open, selectedDateAndTime.type, isPatient, patientStatus, patientDetails]);

  const [openView, setOpenView] = useState({
    open: false,
    data: null,
  });

  const [openAuditDrawer, setOpenAuditDrawer] = useState({
    isOpen: false,
    data: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllRecords = useCallback(
    ({ page = currentPage, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

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

      getDoctorAppointment(query)
        .then(() => { })
        .catch((err) => {
          openNotification({
            type: "error",
            title: t("appointments.page.failedToGetAppointments"),
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getDoctorAppointment, openNotification, currentPage],
  );

  useEffect(() => {
    applyGetAllRecords({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllRecords]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllRecords({ page: 1, reset: true });
  };

  const patientColumn = {
    headerName: t("appointments.table.patient"),
    key: "patientName",
    metaData: {
      component: (dt: any) => (
        <Box m={1}>
          <Text>{dt?.patientName || "--"}</Text>
        </Box>
      ),
    },
    props: { row: { textAlign: "center" } },
  };

  // Define table columns
  const ContactTableColumn = [
    {
      headerName: t("appointments.table.cause"),
      key: "description",
      type: "tooltip",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Text>{dt?.title || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    ...(!isPatient ? [patientColumn] : []),
    {
      headerName: t("appointments.table.doctor"),
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
      headerName: t("appointments.table.status"),
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
            // onClick={() => {
            //   setOpenChangeStatus({ open: true, data: dt });
            // }}
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
      headerName: t("appointments.table.appointmentDate"),
      key: "appointmentDate",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>{formatDate(dt?.appointmentDate)}</Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("appointments.table.startEndTime"),
      key: "startTime",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>{`${dt.startTime || "--"} - ${dt?.endTime || "--"}`}</Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("appointments.table.createdBy"),
      key: "actionBy",
      type: "component",
      metaData: {
        component: (dt: any) => <Box m={1}>{dt?.actionBy || "--"}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("appointments.table.history"),
      key: "history",
      type: "component",
      metaData: {
        component: (dt: any) => {
          return (
            stores.auth.hasPermission('appointment', 'view') ? (
              <Button
                size="xs"
                variant="solid"
                colorScheme="purple"
                borderRadius="full"
                px={4}
                onClick={() => setHistoryModal({
                  isOpen: true,
                  patientId: dt.patient?._id || dt.patient,
                  patientName: dt.patientName || dt.patient?.name || "Patient"
                })}
              >
                {t("appointments.table.viewHistory")}
              </Button>
            ) : <Text>--</Text>
          );
        },
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("appointments.table.actions"),
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  const subTitle = `${patientDetails?.name
    } • Appointment Summary — Cancelled: ${patientStatus?.cancelled ?? 0
    } | Shift: ${patientStatus?.shift ?? 0} | No-show: ${patientStatus?.["no-show"] ?? 0
    }`;

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

  const goToPreviousDate = () => {
    setSelectedDate((prev: any) => moment(prev).subtract(1, "day").toDate());
  };

  const goToNextDate = () => {
    setSelectedDate((prev: any) => moment(prev).add(1, "day").toDate());
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

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
        return "teal";
      default:
        return "gray";
    }
  };

  return (
    <>
      {isMobile ? (
        <Box p={{ base: 2, sm: 3 }} pb="calc(88px + env(safe-area-inset-bottom, 16px))">
          <Flex
            align="center"
            gap={3}
            p={{ base: 4, sm: 5 }}
            mb={3}
            borderRadius="22px"
            bgGradient="linear(125deg, #123B50 0%, #126C70 62%, #258F83 100%)"
            color="white"
            boxShadow="0 10px 24px rgba(18, 83, 96, 0.16)"
          >
            <Flex
              w="44px"
              h="44px"
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="15px"
              bg="whiteAlpha.200"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              <Icon as={FaClipboardList} boxSize={5} />
            </Flex>
            <Box minW={0}>
              <Text fontSize="10px" fontWeight="800" letterSpacing="1.2px" color="whiteAlpha.800" textTransform="uppercase">
                Clinic care
              </Text>
              <Text fontSize={{ base: "md", sm: "lg" }} fontWeight="800" noOfLines={1}>
                {t("appointments.table.appointments", "Appointments")}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                Manage visits, schedules and patient history
              </Text>
            </Box>
          </Flex>

          {/* Summary Card for Patient */}
          {patientDetails && (
            <Box
              p={{ base: 3, sm: 4 }}
              borderRadius="20px"
              bg={useColorModeValue("blue.50", "rgba(59, 130, 246, 0.12)")}
              border="1px solid"
              borderColor={useColorModeValue("blue.200", "rgba(59, 130, 246, 0.25)")}
              mb={3}
            >
              <Text fontSize="13px" fontWeight="800" color={useColorModeValue("blue.900", "blue.100")} mb={1.5} noOfLines={1}>
                {patientDetails?.name || "Patient"} Appointments
              </Text>
              <HStack spacing={2} wrap="wrap" rowGap={2}>
                <Badge colorScheme="red" variant="subtle" borderRadius="full" px={2.5} py={1} fontSize="11px">
                  Cancelled · {patientStatus.cancelled}
                </Badge>
                <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2.5} py={1} fontSize="11px">
                  Shifted · {patientStatus.shift}
                </Badge>
                <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2.5} py={1} fontSize="11px">
                  No-show · {patientStatus["no-show"]}
                </Badge>
              </HStack>
            </Box>
          )}

          {/* Search & Add Action Bar */}
          <Flex gap={2} mb={3} align="center">
            <HStack
              flex={1}
              bg={useColorModeValue("white", "gray.800")}
              px={3}
              py={1}
              borderRadius="16px"
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              minH="46px"
            >
              <Icon as={FiSearch} color="gray.400" />
              <Input
                variant="unstyled"
                placeholder="Search appointments..."
                fontSize="13px"
                minH="44px"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </HStack>

            {stores.auth.hasPermission('appointment', 'create') && (
              <Button
                size="sm"
                bgGradient="linear(to-r, teal.500, teal.600)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                borderRadius="14px"
                fontWeight="800"
                fontSize="12px"
                px={3}
                minH="46px"
                onClick={() => setOpenReportModal({ open: true, type: "add" })}
              >
                + Add
              </Button>
            )}
          </Flex>

          {/* Appointment List / Loading / Empty State */}
          {appointments.loading ? (
            <Flex justify="center" align="center" py={12}>
              <Spinner size="md" color="teal.500" />
            </Flex>
          ) : (appointments?.data || []).length === 0 ? (
            <Box
              bg={useColorModeValue("white", "gray.800")}
              borderRadius="24px"
              border="1px dashed"
              borderColor={useColorModeValue("gray.200", "gray.700")}
              p={6}
              textAlign="center"
              my={4}
            >
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bg="blue.50"
                color="blue.500"
                align="center"
                justify="center"
                mx="auto"
                mb={3}
              >
                <Icon as={FaClipboardList} boxSize={6} />
              </Flex>
              <Text fontSize="15px" fontWeight="800" color={useColorModeValue("gray.800", "white")}>
                No Appointments Scheduled
              </Text>
              <Text fontSize="12px" color={useColorModeValue("gray.500", "gray.400")} mt={1} maxW="240px" mx="auto">
                No past or upcoming appointments found for this patient.
              </Text>
              {stores.auth.hasPermission('appointment', 'create') && (
                <Button
                  mt={4}
                  size="sm"
                  bgGradient="linear(to-r, blue.500, teal.500)"
                  color="white"
                  borderRadius="16px"
                  fontWeight="800"
                  fontSize="12px"
                  px={5}
                  onClick={() => setOpenReportModal({ open: true, type: "add" })}
                >
                  + Schedule Appointment
                </Button>
              )}
            </Box>
          ) : (
            <VStack align="stretch" spacing={2.5}>
              {(appointments?.data || []).map((dt: any, idx: number) => {
                const statusCol = getStatusColor(dt.status);
                return (
                  <Box
                    key={dt._id || idx}
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="20px"
                    p={{ base: 3, sm: 4 }}
                    border="1px solid"
                    borderColor={useColorModeValue("gray.100", "whiteAlpha.150")}
                    borderLeft="4px solid"
                    borderLeftColor="teal.400"
                    boxShadow="0 6px 18px rgba(19, 52, 69, 0.06)"
                  >
                    <Flex align="center" gap={3} mb={3}>
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        flexShrink={0}
                        w="52px"
                        h="56px"
                        borderRadius="16px"
                        bg={useColorModeValue("teal.50", "whiteAlpha.100")}
                        color={useColorModeValue("teal.700", "teal.200")}
                      >
                        <Text fontSize="lg" lineHeight={1} fontWeight="900">
                          {moment(dt?.appointmentDate).format("DD")}
                        </Text>
                        <Text mt={1} fontSize="9px" fontWeight="800" letterSpacing="0.7px" textTransform="uppercase">
                          {moment(dt?.appointmentDate).format("MMM")}
                        </Text>
                      </Flex>

                      <Box flex={1} minW={0}>
                        <Flex justify="space-between" align="center" gap={2} mb={1}>
                          <Text fontSize="10px" fontWeight="700" color={useColorModeValue("gray.500", "gray.400")} noOfLines={1}>
                            {formatDate(dt?.appointmentDate)}
                          </Text>
                          <Badge
                            colorScheme={statusCol}
                            variant="subtle"
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="10px"
                            fontWeight="750"
                            textTransform="capitalize"
                            flexShrink={0}
                          >
                            {dt.status?.replace("-", " ") || "Scheduled"}
                          </Badge>
                        </Flex>
                        <Text fontSize="14px" fontWeight="800" color={useColorModeValue("gray.900", "gray.100")} noOfLines={1}>
                          {dt?.title || "Clinical Consultation"}
                        </Text>
                      </Box>
                    </Flex>

                    <HStack
                      spacing={4}
                      fontSize="12px"
                      color={useColorModeValue("gray.600", "gray.400")}
                      mb={2.5}
                      wrap="wrap"
                      rowGap={1}
                    >
                      <HStack spacing={1.5}>
                        <Icon as={FiClock} color="teal.500" />
                        <Text fontWeight="700">{dt.startTime || "--"} - {dt?.endTime || "--"}</Text>
                      </HStack>
                      <HStack spacing={1.5} minW={0}>
                        <Icon as={FiUser} color="teal.500" />
                        <Text fontWeight="700" color={useColorModeValue("teal.700", "teal.300")} noOfLines={1}>
                          {dt.doctorName || "Doctor"}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* Bottom Action Buttons */}
                    <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")} gap={2} wrap="wrap">
                      <HStack spacing={2} flex={1}>
                        {stores.auth.hasPermission('appointment', 'view') && (
                          <Button
                            size="sm"
                            minH="44px"
                            flex={1}
                            variant="ghost"
                            colorScheme="blue"
                            borderRadius="lg"
                            fontWeight="700"
                            onClick={() => setOpenView({ open: true, data: dt })}
                          >
                            View
                          </Button>
                        )}
                        {stores.auth.hasPermission('appointment', 'edit') && (
                          <Button
                            size="sm"
                            minH="44px"
                            flex={1}
                            variant="ghost"
                            colorScheme="teal"
                            borderRadius="lg"
                            fontWeight="700"
                            onClick={() => setSelectedDateTime({
                              open: true,
                              time: undefined,
                              start: undefined,
                              end: undefined,
                              data: dt,
                              type: "edit",
                            })}
                          >
                            Edit
                          </Button>
                        )}
                      </HStack>

                      {stores.auth.hasPermission('appointment', 'view') && (
                        <Button
                          size="sm"
                          minH="44px"
                          variant="subtle"
                          colorScheme="purple"
                          borderRadius="full"
                          px={2.5}
                          fontWeight="700"
                          onClick={() => setHistoryModal({
                            isOpen: true,
                            patientId: dt.patient?._id || dt.patient,
                            patientName: dt.patientName || dt.patient?.name || "Patient"
                          })}
                        >
                          History
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })}

              {/* Mobile Pagination */}
              {appointments.totalPages > 1 && (
                <Flex justify="space-between" align="center" pt={2}>
                  <Button
                    size="sm"
                    minH="44px"
                    isDisabled={currentPage <= 1}
                    onClick={() => handleChangePage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Text fontSize="11px" fontWeight="700" color="gray.500">
                    Page {currentPage} of {appointments.totalPages}
                  </Text>
                  <Button
                    size="sm"
                    minH="44px"
                    isDisabled={currentPage >= appointments.totalPages}
                    onClick={() => handleChangePage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Flex>
              )}
            </VStack>
          )}
        </Box>
      ) : (
        <CustomTable
          title={t("appointments.table.appointments")}
          subTitle={patientDetails ? subTitle : undefined}
          data={appointments?.data || []}
          columns={ContactTableColumn}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: stores.auth.hasPermission('appointment', 'create'),
                function: () => {
                  setOpenReportModal({
                    open: true,
                    type: "add",
                  });
                },
              },
              editKey: {
                showEditButton: stores.auth.hasPermission('appointment', 'edit'),
                function: (dt: any) => {
                  setSelectedDateTime({
                    open: true,
                    time: undefined,
                    start: undefined,
                    end: undefined,
                    data: dt,
                    type: "edit",
                  });
                },
              },
              viewKey: {
                showViewButton: stores.auth.hasPermission('appointment', 'view'),
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
            resetData: {
              show: false,
              text: t("appointments.table.resetData"),
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: appointments.totalPages,
            },
          }}
          loading={appointments.loading}
        />
      )}

      <AppointmentHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
        patientId={historyModal.patientId}
        patientName={historyModal.patientName}
      />

      {isPatient && (patientStatus.shift > 0 || patientStatus.cancelled > 0) && stores.auth.hasPermission('appointment', 'view') && (
        <Box position="fixed" bottom="20px" right="20px" zIndex={1000}>
          <Button
            colorScheme="orange"
            size="lg"
            borderRadius="full"
            boxShadow="xl"
            leftIcon={<InfoIcon />}
            onClick={() =>
              setHistoryModal({
                isOpen: true,
                patientId: patientDetails?._id || patientDetails?.id,
                patientName: patientDetails?.name || "Patient",
              })
            }
          >
            {t("appointments.table.historyCount", { count: (patientStatus.shift || 0) + (patientStatus.cancelled || 0) })}
          </Button>
        </Box>
      )}

      {/* Add / Calendar Drawer */}
      <CustomDrawer
        width={{ base: "100vw", md: "90vw", lg: "90vw" }}
        open={openReportModal.open}
        close={() =>
          setOpenReportModal({
            open: false,
            type: "add",
          })
        }
        title={
          <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" width="100%" pr={{ base: 8, md: 10 }} flexDir={{ base: "column", lg: "row" }} gap={{ base: 2, lg: 0 }}>
            <Flex align="center" gap={{ base: 1, md: 3 }}>
              <Button size={{ base: "sm", md: "md" }} onClick={goToPreviousDate} p={1}>
                <ChevronLeftIcon color="white" fontSize={{ base: 24, md: 32 }} />
              </Button>

              <Text fontWeight="800" fontSize={{ base: "md", md: "xl" }} textAlign="center" noOfLines={{ base: 2, md: 1 }}>
                {t("appointments.table.appointment")} {isPatient && patientDetails?.name ? `(${patientDetails.name}) ` : ""} 
                <Box as="span" display={{ base: "none", md: "inline" }}>→ </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}><br/></Box>
                {moment(selectedDate).format("dddd, DD MMM YYYY")}
              </Text>

              <Button size={{ base: "sm", md: "md" }} onClick={goToNextDate} p={1}>
                <ChevronRightIcon fontWeight="800" color="white" fontSize={{ base: 24, md: 32 }} />
              </Button>
            </Flex>

            {isPatient && (patientStatus.shift > 0 || patientStatus.cancelled > 0) && stores.auth.hasPermission('appointment', 'view') && (
              <Flex
                align="center"
                gap={2}
                bg="orange.50"
                px={4}
                py={2}
                borderRadius="full"
                border="1px solid"
                borderColor="orange.200"
                boxShadow="sm"
              >
                <InfoIcon color="orange.500" />
                <Text fontSize="sm" fontWeight="bold" color="orange.800">
                  {t("appointments.table.historyCount", { count: (patientStatus.shift || 0) + (patientStatus.cancelled || 0) })}
                </Text>
                <Button
                  size="xs"
                  colorScheme="orange"
                  variant="solid"
                  borderRadius="full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHistoryModal({
                      isOpen: true,
                      patientId: patientDetails?._id || patientDetails?.id,
                      patientName: patientDetails?.name || "Patient",
                    });
                  }}
                >
                  {t("appointments.table.viewDetails")}
                </Button>
              </Flex>
            )}
          </Flex>
        }
      >
        <DentistScheduler
          appointments={appointments}
          isPatient={isPatient}
          patientDetails={patientDetails}
          applyGetAllRecords={applyGetAllRecords}
          handleTimeSlots={(e: any) => {
            handleOpenAddDrawer(e);
          }}
          createdAppointmentByCalender={createdAppointmentByCalender}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </CustomDrawer>

      {/* Change Status Modal */}
      <AppointChangeStatus
        open={openChangeStatus.open}
        appointmentData={openChangeStatus.data}
        applyGetAllRecords={applyGetAllRecords}
        close={() => setOpenChangeStatus({ open: false, data: null })}
        setOpenShiftModal={(dt: any) => {
          setSelectedDate(new Date(dt?.appointmentDate));
          setOpenReportModal({
            open: true,
            type: "add",
          });
        }}
      />

      {/* View Appointment Details Drawer */}
      <CustomDrawer
        width={"80vw"}
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title="Appointment Details"
      >
        <AppointmentDetailsView data={openView.data} />
      </CustomDrawer>
      <CustomDrawer
        width="90vw"
        open={selectedDateAndTime.open}
        close={() =>
          setSelectedDateTime({
            open: false,
            time: undefined,
            start: undefined,
            end: undefined,
            data: null,
            type: "add",
          })
        }
        title={
          <Flex align="center" gap={3}>
            <Icon as={FaClipboardList} boxSize={5} />
            <Text fontSize="xl" fontWeight="900">
               {selectedDateAndTime?.type === "edit" ? t("appointments.table.editAppointment") : t("appointments.table.addAppointment")}
            </Text>
            <Divider orientation="vertical" h="20px" borderColor="whiteAlpha.400" />
            <Text fontSize="lg" fontWeight="700" color="whiteAlpha.900" noOfLines={1}>
               {isPatient ? patientDetails?.name : (selectedDateAndTime?.data?.patientName || t("appointments.table.selectPatient"))}
            </Text>
          </Flex>
        }
      >
        <Box p={2}>
          {selectedDateAndTime.type === "add" ? (
            <AddAppointmentForm
              patientDetails={patientDetails}
              doctorDetails={doctorDetails}
              isPatient={isPatient}
              applyGetAllRecords={applyGetAllRecords}
              close={() => {
                setCreatedAppointmentByCalender(!createdAppointmentByCalender);
                setSelectedDateTime({
                  open: false,
                  time: undefined,
                  start: undefined,
                  end: undefined,
                  data: null,
                  type: "add",
                });
              }}
              selectedDateAndTime={selectedDateAndTime}
            />
          ) : (
            <EditAppointmentForm
              patientDetails={patientDetails}
              isPatient={isPatient}
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
                setCreatedAppointmentByCalender(!createdAppointmentByCalender);
              }}
              selectedDateAndTime={selectedDateAndTime}
            />
          )}
        </Box>
      </CustomDrawer>

      <Drawer
        isOpen={openAuditDrawer.isOpen}
        placement="right"
        onClose={() => setOpenAuditDrawer({ isOpen: false, data: [] })}
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
        <DrawerContent borderLeftRadius="xl" overflow="hidden">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" bg="gray.50" fontSize="md" fontWeight="800">
            📋 {t("appointments.table.appointmentAuditTrail")}
          </DrawerHeader>
          <DrawerBody p={0} overflowY="auto">
            <Box p={5}>
              {(openAuditDrawer.data || []).map((item: any, index: number) => {
                const isLast = index === openAuditDrawer.data.length - 1;

                const getActionColor = (action: string) => {
                  switch (action) {
                    case "scheduled": return "blue";
                    case "in-progress": return "yellow";
                    case "completed": return "green";
                    case "cancelled": return "red";
                    case "shift": return "purple";
                    case "no-show": return "gray";
                    default: return "gray";
                  }
                };

                const color = getActionColor(item.action);

                return (
                  <Flex key={item._id || index} align="stretch" position="relative" mb={isLast ? 0 : 5}>
                    {/* 💈 Modern Timeline Bullet & Dashed Line */}
                    <Flex flexDir="column" align="center" mr={4}>
                      <Box
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={`${color}.500`}
                        bg="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        zIndex={2}
                        mt="2px"
                        boxShadow="sm"
                      >
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg={`${color}.500`}
                          animation={`${blink} 1.4s infinite`}
                        />
                      </Box>
                      {!isLast && (
                        <Box
                          w="0px"
                          borderLeft="2px dashed"
                          borderColor="gray.200"
                          flex={1}
                          position="absolute"
                          top="22px"
                          bottom="-20px"
                          left="8px"
                          zIndex={1}
                        />
                      )}
                    </Flex>

                    {/* 📄 Content Box */}
                    <VStack align="stretch" spacing={1.5} flex={1}>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                          <Text
                            fontWeight="800"
                            textTransform="capitalize"
                            fontSize="2xs"
                            color={`${color}.600`}
                            bg={`${color}.50`}
                            px={2.5}
                            py={0.8}
                            borderRadius="full"
                            letterSpacing="0.05em"
                            boxShadow={`inset 0 0 0 1px ${color}22`}
                          >
                            {item.action?.replace("-", " ")}
                          </Text>
                        </HStack>
                        <Text fontSize="10px" color="gray.400" fontWeight="600">
                          {new Date(item.timestamp).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </Text>
                      </Flex>

                      {/* 📝 Remarks Bubble */}
                      {item.remarks ? (
                        <Box
                          bg={useColorModeValue("white", "gray.800")}
                          px={3}
                          py={2.5}
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor="gray.100"
                          boxShadow="0 2px 10px rgba(0,0,0,0.02)"
                          mt={1}
                        >
                          <Text color="gray.700" fontSize="xs" lineHeight="short" whiteSpace="pre-wrap">
                            {item.remarks}
                          </Text>
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.300" fontStyle="italic" mt={0.5} ml={1}>
                          {t("appointments.table.noRemarks")}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                );
              })}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

export default AppointmentList;
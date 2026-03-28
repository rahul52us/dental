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
  Flex,
  HStack,
  Text,
  useColorModeValue,
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
import AppointmentHistoryModal from "./component/AppointmentHistoryModal";

const AppointmentList = observer(({ isPatient, patientDetails, doctorDetails }: any) => {
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
    open: false,
    type: "add",
  });

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
        title: "Failed to Fetch Appointments Status",
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
            title: "Failed to get Appointments",
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
    headerName: "Patient",
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
      headerName: "Cause",
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
      headerName: "Doctor",
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
    // {
    //   headerName: "Status",
    //   key: "status",
    //   type: "component",
    //   metaData: {
    //     component: (dt: any) => {
    //       const getStatusColor = (status: string) => {
    //         switch (status) {
    //           case "scheduled":
    //             return "blue";
    //           case "in-progress":
    //             return "yellow";
    //           case "completed":
    //             return "green";
    //           case "cancelled":
    //             return "red";
    //           case "shift":
    //             return "purple";
    //           case "no-show":
    //             return "gray";
    //           case "arrived":
    //             return "green";
    //           default:
    //             return "gray";
    //         }
    //       };

    //       return (
    //         <Box
    //           as="button"
    //           px={3}
    //           py={1}
    //           borderRadius="full"
    //           fontSize="sm"
    //           fontWeight="semibold"
    //           textTransform="capitalize"
    //           bg={`${getStatusColor(dt.status)}.100`}
    //           color={`${getStatusColor(dt.status)}.700`}
    //           onClick={() => {
    //             setOpenChangeStatus({ open: true, data: dt });
    //           }}
    //         >
    //           {dt.status?.replace("-", " ") || "—"}
    //         </Box>
    //       );
    //     },
    //   },
    //   props: {
    //     row: { minW: 120, textAlign: "center" },
    //     column: { textAlign: "center" },
    //   },
    // },
    {
      headerName: "Appointment Date",
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
      headerName: "Start & End Time",
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
      headerName: "Created By",
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
      headerName: "History",
      key: "history",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const history = dt.history || [];

          if (!history.length) {
            return (
              <Text fontSize="sm" color="gray.400">
                —
              </Text>
            );
          }

          return (
            <Button
              size="xs"
              variant="link"
              colorScheme="blue"
              onClick={() => setOpenAuditDrawer({ isOpen: true, data: history })}
            >
              View
            </Button>
          );
        },
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Actions",
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

  return (
    <>
      <CustomTable
        title="Appointments"
        subTitle={patientDetails ? subTitle : undefined}
        data={appointments?.data || []}
        columns={ContactTableColumn}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: ["admin", "superAdmin"].includes(userType)
                ? true
                : false,
              function: () => {
                setOpenReportModal({
                  open: true,
                  type: "add",
                });
              },
            },
            editKey: {
              showEditButton: ["admin", "superAdmin"].includes(userType)
                ? true
                : false,
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
              showViewButton: true,
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
            text: "Reset Data",
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

      {isPatient && patientDetails && (
        <AppointmentHistoryModal
          isOpen={historyModal.isOpen}
          onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
          patientId={historyModal.patientId}
          patientName={historyModal.patientName}
        />
      )}

      {isPatient && (patientStatus.shift > 0 || patientStatus.cancelled > 0) && (
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
            History ({(patientStatus.shift || 0) + (patientStatus.cancelled || 0)})
          </Button>
        </Box>
      )}

      {/* Add / Calendar Drawer */}
      <CustomDrawer
        width={"90vw"}
        open={openReportModal.open}
        close={() =>
          setOpenReportModal({
            open: false,
            type: "add",
          })
        }
        title={
          <Flex align="center" justify="space-between" width="100%" pr={10}>
            <Flex align="center" gap={3}>
              <Button size="md" onClick={goToPreviousDate} p={1}>
                <ChevronLeftIcon color="white" fontSize={32} />
              </Button>

              <Text fontWeight="800" fontSize="xl">
                Appointment {isPatient && patientDetails?.name ? `(${patientDetails.name}) ` : ""}→ {moment(selectedDate).format("dddd, DD MMM YYYY")}
              </Text>

              <Button size="md" onClick={goToNextDate} p={1}>
                <ChevronRightIcon fontWeight="800" color="white" fontSize={32} />
              </Button>
            </Flex>

            {isPatient && (patientStatus.shift > 0 || patientStatus.cancelled > 0) && (
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
                  History: {(patientStatus.shift || 0) + (patientStatus.cancelled || 0)}
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
                  View Details
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
          selectedDateAndTime
            ? `Selected: ${moment(selectedDateAndTime.start).format("ddd, DD MMM YYYY")} ${isPatient && patientDetails?.name ? `(${patientDetails.name})` : ""}`
            : "Select a date"
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
            📋 Appointment Audit Trail
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
                          No remarks provided.
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
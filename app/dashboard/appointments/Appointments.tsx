"use client";
import { Box, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
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
import EditForm from "./component/EditForm";
import AddAppointmentForm from "./component/AddForm";

const AppointmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    DoctorAppointment: {
      getDoctorAppointment,
      appointments,
      getPatientAppointmentStatusCount,
    },
    auth: { openNotification, userType },
  } = stores;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    rescheduled: 0,
    cancelled: 0,
    "no-show": 0,
  });

  const fetchPatientStatus = async () => {
    try {
      const response = await getPatientAppointmentStatusCount({
        patient: patientDetails?._id,
      });
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

  const [openDrawer, setOpenDrawer] = useState({
    open: false,
    data: null,
    type: "add",
  });

  const [openView, setOpenView] = useState({
    open: false,
    data: null,
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
        .then(() => {})
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to get Appointments",
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getDoctorAppointment, openNotification, currentPage]
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
      headerName: "Appointment",
      key: "title",
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

    {
      headerName: "Status",
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
              case "rescheduled":
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
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  const subTitle = `${
    patientDetails?.name
  } • Appointment Summary — Cancelled: ${
    patientStatus?.cancelled ?? 0
  } | Rescheduled: ${patientStatus?.rescheduled ?? 0} | No-show: ${
    patientStatus?.["no-show"] ?? 0
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
      open: true,
      type: "add",
    });
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
          selectedDate
            ? `Appointment -> Selected: ${moment(selectedDate).format(
                "DD MMM YYYY, hh:mm A"
              )}`
            : "Select a date & time"
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
        width="80vw"
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
            ? `Selected: ${moment(selectedDateAndTime.start).format(
                "DD MMM YYYY, hh:mm A"
              )}`
            : "Select a date & time"
        }
      >
        <Box p={2}>
          {selectedDateAndTime.type === "add" ? (
            <AddAppointmentForm
              patientDetails={patientDetails}
              isPatient={isPatient}
              applyGetAllRecords={applyGetAllRecords}
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
              selectedDateAndTime={selectedDateAndTime}
            />
          ) : (
            <EditForm />
          )}
        </Box>
      </CustomDrawer>
    </>
  );
});

export default AppointmentList;
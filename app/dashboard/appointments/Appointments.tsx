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
import AttendanceCalendar from "./element/AppointmentCalender";
import AppointmentDetailsView from "./element/AppointmentDetailsView"; // ✅ Import details view
import AppointChangeStatus from "./element/AppointmentStatusChange";

const AppointmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    DoctorAppointment: {
      getDoctorAppointment,
      appointments,
      getPatientAppointmentStatusCount,
    },
    auth: { openNotification, userType },
  } = stores;
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
              onClick={() => {
                if (["admin", "superAdmin"].includes(userType)) {
                  setOpenChangeStatus({ open: true, data: dt });
                }
              }}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
              textTransform="capitalize"
              bg={`${getStatusColor(dt.status)}.100`}
              color={`${getStatusColor(dt.status)}.700`}
              _hover={{
                bg: `${getStatusColor(dt.status)}.200`,
                transform: "scale(1.05)",
                boxShadow: "sm",
              }}
              transition="all 0.15s ease-in-out"
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
    // {
    //   headerName: "Treatment",
    //   key: "treatment",
    //   type: "component",
    //   metaData: {
    //     component: () => (
    //       <Tag variant={'outline'} _hover={{bg:"blue.50"}} onClick={()=>setOpenTreatmentDrawer({open:true,data:null})} rounded={'full'} colorScheme="blue">View</Tag>
    //     ),
    //   },
    //   props: {
    //     row: { minW: 120, textAlign: "center" },
    //     column: { textAlign: "center" },
    //   },
    // },
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

  const subTitle = `${patientDetails?.name} • Appointment Summary — Cancelled: ${patientStatus?.cancelled ?? 0} | Rescheduled: ${patientStatus?.rescheduled ?? 0} | No-show: ${patientStatus?.["no-show"] ?? 0}`;

  return (
    <>
      <CustomTable
        title="Appointments"
        subTitle={subTitle}
        data={appointments?.data || []}
        columns={ContactTableColumn}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: ["admin", "superAdmin"].includes(userType)
                ? true
                : false,
              function: () => {
                setOpenDrawer({ open: true, data: null, type: "add" });
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
        open={openDrawer.open}
        close={() => setOpenDrawer({ open: false, data: null, type: "add" })}
        title="Appointment Lists"
      >
        <AttendanceCalendar
          isPatient={isPatient}
          patientDetails={patientDetails}
          applyGetAllRecords={applyGetAllRecords}
          close={() => setOpenDrawer({ open: false, data: null, type: "add" })}
          type={openDrawer.type}
          appointments={appointments}
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
      {/* <CustomDrawer
        width={"80vw"}
        open={openTreatmentDrawer.open}
        close={() => setOpenTreatmentDrawer({ open: false, data: null })}
        title="Treatment Details"
      >
        <TeethModel/>
      </CustomDrawer> */}
    </>
  );
});

export default AppointmentList;
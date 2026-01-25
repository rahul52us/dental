"use client";
import { Box, Text } from "@chakra-ui/react";
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

const RecallAppointmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    recallAppointmentStore: { getRecallAppointments, recallAppointment },
    auth: { openNotification, userType },
  } = stores;
  const [havePatient, setHavePatient] = useState(isPatient);
  const [havePatientDetails, setHavePatientDetails] = useState(patientDetails);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formModal, setFormModal] = useState<any>({
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
  const [openReportModal, setOpenReportModal] = useState({
    open: false,
    type: "add",
  });
  const [haveAppointmentDetails, setHaveAppointmentDetails] = useState(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

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

      getRecallAppointments(query)
        .then(() => {})
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to get Appointments",
            message: err?.message,
          });
        });
    },
    [
      debouncedSearchQuery,
      getRecallAppointments,
      openNotification,
      currentPage,
    ],
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

  const patientColumn = [
    {
      headerName: "Patient Name",
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
      headerName: "Patient Mobile Number",
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
      headerName: "Reason",
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
      headerName: "Created By",
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
      headerName: "Recall Date",
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
      headerName: "Actions",
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
      <CustomTable
        title="Recall Appointment"
        subTitle={patientDetails ? subTitle : undefined}
        data={recallAppointment?.data || []}
        columns={ContactTableColumn}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: ["admin", "superAdmin"].includes(userType)
                ? true
                : false,
              function: () => {
                setFormModal({
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
                setFormModal({
                  open: true,
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
            totalPages: recallAppointment.totalPages,
          },
        }}
        loading={recallAppointment.loading}
      />

      {/* View Appointment Details Drawer */}
      <FormModel
        width={"80vw"}
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title="Recall Appointment Summary"
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
              ? "Create Recall Appointment"
              : "Edit Recall Appointment"
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
                  setSelectedDate(new Date(dt?.appointmentDate));
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
                  patient: undefined,
                  doctor: undefined,
                  reason: undefined,
                  status: status[0],
                  recallDate: undefined,
                  appointmentDate: undefined,
                }}
                formModal={formModal}
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
                  setSelectedDate(new Date(dt?.appointmentDate));
                  setOpenReportModal({ open: true, type: "add" })
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
                        appointmentDate : formatDate(
                          formModal?.data?.appointmentDate,
                          "YYYY-MM-DD",
                        ),
                        doctor: formModal.data.doctor
                          ? {
                              label: formModal.data.doctor.name,
                              value: formModal.data.doctor._id,
                            }
                          : null,
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
              />
            )}
          </Box>
        </FormModel>
      )}
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
                "DD MMM YYYY",
              )}`
            : "Select date"
        }
      >
        <DentistScheduler
          isPatient={havePatient}
          patientDetails={havePatientDetails}
          applyGetAllRecords={applyGetAllRecords}
          handleTimeSlots={(e: any) => {
            handleOpenAddDrawer(e);
          }}
          createdAppointmentByCalender={true}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
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
          setOpenReportModal({
            open: false,
            type: "add",
          });
        }}
        title={
          selectedDateAndTime
            ? `Selected: ${moment(selectedDateAndTime.start).format(
                "DD MMM YYYY",
              )}`
            : "Select a date"
        }
      >
        <Box p={2}>
          {selectedDateAndTime.type === "add" ? (
            <AddAppointmentForm
              patientDetails={havePatientDetails}
              setHaveAppointmentDetails={(dt: any) =>
                setHaveAppointmentDetails(dt)
              }
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
                setOpenReportModal({
                  open: false,
                  type: "add",
                });
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
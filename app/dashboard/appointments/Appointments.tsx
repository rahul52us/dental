'use client'
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import stores from "../../store/stores";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../component/config/utils/variable";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { Box } from "@chakra-ui/react";
import { formatDateTime } from "../../component/config/utils/dateUtils";

const AppointmentList = observer(({ onAdd, onEdit }: any) => {
  const {
    appointmentStore: { getAppointmentBooking, appointments },
    auth: { openNotification },
  } = stores;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllRecords = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      // Only add the search query if debouncedSearchQuery is a non-empty string
      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getAppointmentBooking(query)
        .then(() => {})
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to get Booking",
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getAppointmentBooking, openNotification]
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
    applyGetAllRecords({ reset: true });
  };

  // Define table columns
  const ContactTableColumn = [
    { headerName: "Name", key: "name", props: { row: { textAlign: "center" } } },
    { headerName: "Phone", key: "phone", props: { row: { textAlign: "center" } } },
    { headerName: "Emergency Contact Name", key: "emergencyContactName", props: { row: { textAlign: "center" } } },
    { headerName: "Emergency Number", key: "emergencyNumber", props: { row: { textAlign: "center" } } },
    { headerName: "Assign To", key: "assignTo", props: { row: { textAlign: "center" } } },
    {
      headerName: "Page Link",
      key: "details",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
             {dt?.details?.pageLink || "--"}
          </Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
          headerName: "Created At",
          key: "createdAt",
          type: "component",
          metaData: {
            component: (dt: any) => (
              <Box m={1}>
                 {formatDateTime(dt?.createdAt)}
              </Box>
            ),
          },
          props: {
            row: { minW: 120, textAlign: "center" },
            column: { textAlign: "center" },
          },
        }
  ];

  return (
    <CustomTable
      title="Appointments"
      data={appointments?.data || []}
      columns={ContactTableColumn}
      actions={{
        actionBtn: {
          addKey: {
            showAddButton: false,
            function: () => {
              onAdd()
            },
          },
          editKey: {
            showEditButton: false,
            function: (e : any) => {
              onEdit(e)
            },
          },
          deleteKey: {
            showDeleteButton: false,
            function: (dt: string) => {
              alert(dt);
            },
          },
        },
        search: {
          show: true,
          searchValue: searchQuery,
          onSearchChange: (e: any) => setSearchQuery(e.target.value),
        },
        resetData: {
          show: true,
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
  );
});

export default AppointmentList;

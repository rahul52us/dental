"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import {
  Box,
  Badge
} from "@chakra-ui/react";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";


const WorkDoneTable = observer(() => {
  const { oldDataStore } = stores;
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      oldDataStore.setSearchQuery(searchQuery);
      oldDataStore.fetchWorkComp();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, oldDataStore.workCompPage]);

  const handlePageChange = (page: number) => {
    oldDataStore.setPage("workComp", page);
  };

  const columns = [
    { headerName: "Date", function: (row: any) => new Date(row.wrk_date).toLocaleDateString() },
    { headerName: "Patient Code", key: "legacyPatCode" },
    { headerName: "Patient Name", function: (row: any) => row.patientId?.name || "Unknown" },
    { headerName: "Doctor", function: (row: any) => row.doctorId?.name || row.legacyDocCode },
    { headerName: "Fee Due", key: "fee_due" },
    { headerName: "Fee Dis", key: "fee_dis" },
    { headerName: "Stage", function: (row: any) => <Badge colorScheme="blue">{row.treat_stage}</Badge> },
  ];

  return (
    <Box p={4}>
      <CustomTable
        title="Work Done"
        serial={{ show: true }}
        columns={columns}
        data={oldDataStore.workComp}
        loading={oldDataStore.loading}
        actions={{
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          pagination: {
            show: true,
            currentPage: oldDataStore.workCompPage,
            totalPages: Math.ceil(oldDataStore.totalWorkComp / 20) || 1,
            onClick: handlePageChange
          },
          resetData: {
            show: true,
            text: "Refresh",
            function: () => oldDataStore.fetchWorkComp()
          }
        }}
      />
    </Box>
  );
});

export default WorkDoneTable;

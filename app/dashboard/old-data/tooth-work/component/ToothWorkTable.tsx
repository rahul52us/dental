"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import {
  Box
} from "@chakra-ui/react";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";


const ToothWorkTable = observer(() => {
  const { oldDataStore } = stores;
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      oldDataStore.setSearchQuery(searchQuery);
      oldDataStore.fetchToothWork();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, oldDataStore.toothWorkPage]);

  const handlePageChange = (page: number) => {
    oldDataStore.setPage("toothWork", page);
  };

  const columns = [
    { headerName: "Date", function: (row: any) => new Date(row.wrkdate).toLocaleDateString() },
    { headerName: "Patient Code", key: "legacyPatCode" },
    { headerName: "Patient Name", function: (row: any) => row.patientId?.name || "Unknown" },
    { headerName: "Doctor", function: (row: any) => row.doctorId?.name || row.legacyDocCode },
    { headerName: "Treatment Name", key: "name" },
    { headerName: "Description", key: "descript", type: "tooltip" },
    { headerName: "Tooth No", key: "ToothNoS" },
  ];

  return (
    <Box p={4}>
      <CustomTable
        title="Tooth Work"
        serial={{ show: true }}
        columns={columns}
        data={oldDataStore.toothWork}
        loading={oldDataStore.loading}
        actions={{
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          pagination: {
            show: true,
            currentPage: oldDataStore.toothWorkPage,
            totalPages: Math.ceil(oldDataStore.totalToothWork / 20) || 1,
            onClick: handlePageChange
          },
          resetData: {
            show: true,
            text: "Refresh",
            function: () => oldDataStore.fetchToothWork()
          }
        }}
      />
    </Box>
  );
});

export default ToothWorkTable;

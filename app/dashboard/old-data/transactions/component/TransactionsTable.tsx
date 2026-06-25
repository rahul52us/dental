"use client";
import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import {
  Box,
  Text,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import LegacyRecordDrawer from "../../component/LegacyRecordDrawer";

const toInputDate = (d: Date) => {
  try { return d.toISOString().split("T")[0]; } catch { return ""; }
};

const TransactionsTable = observer(() => {
  const { oldDataStore } = stores;
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const debounceRef = useRef<any>(null);

  const handleOpenDrawer = (row: any) => {
    oldDataStore.fetchLegacyRecordDetails(row.legacyWrkDoneId);
    onOpen();
  };

  const handleCloseDrawer = () => {
    onClose();
    oldDataStore.clearSelectedRecord();
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      oldDataStore.setSearchQuery(searchQuery);
      oldDataStore.fetchTransactions();
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, oldDataStore.transactionPage]);

  const handlePageChange = (page: number) => {
    oldDataStore.setPage("transactions", page);
  };

  const handleReset = () => {
    setSearchQuery("");
    oldDataStore.resetDateFilter("transactions");
  };

  const columns = [
    { headerName: "Date", function: (row: any) => new Date(row.date).toLocaleDateString() },
    { headerName: "Work Date", function: (row: any) => new Date(row.wrk_date).toLocaleDateString() },
    { headerName: "Patient Code", key: "legacyPatCode" },
    { headerName: "Patient Name", function: (row: any) => row.patientId?.name || "Unknown" },
    { headerName: "Doctor", function: (row: any) => row.doctorId?.name || row.legacyDocCode },
    { headerName: "Fee Received", function: (row: any) => <Text fontWeight="bold" color="green.500">₹{row.fee_rec}</Text> },
    {
      headerName: "Work Info",
      function: (row: any) => (
        <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => handleOpenDrawer(row)}>
          <Icon as={FaEye} />
        </Button>
      )
    },
  ];

  return (
    <Box p={4}>
      <CustomTable
        title="Transactions"
        serial={{ show: false }}
        columns={columns}
        data={oldDataStore.transactions}
        loading={oldDataStore.loading}
        actions={{
          customComponent: (
            <HStack spacing={2} flexWrap="wrap">
              <Input
                type="date"
                size="sm"
                borderRadius="md"
                value={toInputDate(oldDataStore.startDate)}
                onChange={(e) => oldDataStore.setStartDate(new Date(e.target.value))}
                w="145px"
              />
              <Input
                type="date"
                size="sm"
                borderRadius="md"
                value={toInputDate(oldDataStore.endDate)}
                onChange={(e) => oldDataStore.setEndDate(new Date(e.target.value))}
                w="145px"
              />
              <InputGroup size="sm" w="180px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search..."
                  borderRadius="full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Button size="sm" colorScheme="blue" onClick={() => oldDataStore.applyDateFilter("transactions")}>
                Apply
              </Button>
              <Button size="sm" variant="outline" colorScheme="red" onClick={handleReset}>
                Reset
              </Button>
            </HStack>
          ),
          pagination: {
            show: true,
            currentPage: oldDataStore.transactionPage,
            totalPages: Math.ceil(oldDataStore.totalTransactions / 20) || 1,
            onClick: handlePageChange
          },
        }}
      />

      <LegacyRecordDrawer isOpen={isOpen} onClose={handleCloseDrawer} />
    </Box>
  );
});

export default TransactionsTable;

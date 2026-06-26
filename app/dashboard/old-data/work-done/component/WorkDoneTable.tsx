"use client";
import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import {
  Box,
  Badge,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEye, FaList } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import LegacyRecordDrawer from "../../component/LegacyRecordDrawer";
import LegacyPatientHistoryDrawer from "../../component/LegacyPatientHistoryDrawer";

const toInputDate = (d: Date) => {
  try { return d.toISOString().split("T")[0]; } catch { return ""; }
};

const WorkDoneTable = observer(() => {
  const { oldDataStore } = stores;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const debounceRef = useRef<any>(null);

  const handleOpenDrawer = (row: any) => {
    oldDataStore.fetchLegacyRecordDetails(row.legacyWrkDoneId);
    onOpen();
  };

  const handleCloseDrawer = () => {
    onClose();
    oldDataStore.clearSelectedRecord();
  };

  const handleOpenHistoryDrawer = (row: any) => {
    oldDataStore.fetchLegacyPatientHistory(row.legacyPatCode);
    onHistoryOpen();
  };

  const handleCloseHistoryDrawer = () => {
    onHistoryClose();
    oldDataStore.clearPatientFullHistory();
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      oldDataStore.setSearchQuery(searchQuery);
      oldDataStore.fetchWorkComp();
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, oldDataStore.workCompPage]);

  const handlePageChange = (page: number) => {
    oldDataStore.setPage("workComp", page);
  };

  const handleReset = () => {
    setSearchQuery("");
    oldDataStore.resetDateFilter("workComp");
  };

  const columns = [
    { headerName: t("Date"), function: (row: any) => new Date(row.wrk_date).toLocaleDateString() },
    { headerName: t("Patient Code"), key: "legacyPatCode" },
    { headerName: t("Patient Name"), function: (row: any) => row.patientId?.name || "Unknown" },
    { headerName: t("Doctor"), function: (row: any) => row.doctorId?.name || row.legacyDocCode },
    { headerName: t("Fee Due"), key: "fee_due" },
    { headerName: t("Fee Dis"), key: "fee_dis" },
    { headerName: t("Stage"), function: (row: any) => <Badge colorScheme="blue">{row.treat_stage}</Badge> },
    {
      headerName: t("Actions"),
      function: (row: any) => (
        <HStack spacing={2}>
          <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => handleOpenDrawer(row)} title={t("View Single Record")}>
            <Icon as={FaEye} />
          </Button>
          <Button size="sm" colorScheme="purple" variant="ghost" onClick={() => handleOpenHistoryDrawer(row)} title={t("View All History")}>
            <Icon as={FaList} />
          </Button>
        </HStack>
      )
    },
  ];

  return (
    <Box p={4}>
      <CustomTable
        title={t("Work Done")}
        serial={{ show: false }}
        columns={columns}
        data={oldDataStore.workComp}
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
              <Button size="sm" colorScheme="blue" onClick={() => oldDataStore.applyDateFilter("workComp")}>
                Apply
              </Button>
              <Button size="sm" variant="outline" colorScheme="red" onClick={handleReset}>
                Reset
              </Button>
            </HStack>
          ),
          pagination: {
            show: true,
            currentPage: oldDataStore.workCompPage,
            totalPages: Math.ceil(oldDataStore.totalWorkComp / 20) || 1,
            onClick: handlePageChange
          },
        }}
      />

      <LegacyRecordDrawer isOpen={isOpen} onClose={handleCloseDrawer} />
      <LegacyPatientHistoryDrawer isOpen={isHistoryOpen} onClose={handleCloseHistoryDrawer} />
    </Box>
  );
});

export default WorkDoneTable;

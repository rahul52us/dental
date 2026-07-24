"use client";
import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaEye, FaList } from "react-icons/fa";
import { FiSearch, FiPrinter } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import LegacyRecordDrawer from "../../component/LegacyRecordDrawer";
import LegacyPatientHistoryDrawer from "../../component/LegacyPatientHistoryDrawer";
import ReceiptPreviewDrawer from "../../../patients/component/patient/ReceiptPreviewDrawer";

const toInputDate = (d: Date) => {
  try { return d.toISOString().split("T")[0]; } catch { return ""; }
};

const ToothWorkTable = observer(() => {
  const { oldDataStore } = stores;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const debounceRef = useRef<any>(null);
  const toast = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfBase64, setPdfBase64] = useState("");

  const handlePreviewReport = async () => {
    setIsPrinting(true);
    const base64 = await oldDataStore.generateToothWorkReportBase64();
    setIsPrinting(false);
    if (base64) {
      setPdfBase64(base64);
      onPreviewOpen();
    } else {
      toast({
        title: "Failed to generate report",
        status: "error",
        duration: 3000,
      });
    }
  };

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
      oldDataStore.fetchToothWork();
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, oldDataStore.toothWorkPage]);

  const handlePageChange = (page: number) => {
    oldDataStore.setPage("toothWork", page);
  };

  const handleReset = () => {
    setSearchQuery("");
    oldDataStore.resetDateFilter("toothWork");
  };

  const columns = [
    { headerName: t("Date"), function: (row: any) => new Date(row.wrkdate).toLocaleDateString('en-IN') },
    { headerName: t("Patient Code"), key: "legacyPatCode" },
    { headerName: t("Patient Name"), function: (row: any) => row.patientId?.name || "Unknown" },
    { headerName: t("Doctor"), function: (row: any) => row.doctorId?.name || row.legacyDocCode },
    { headerName: t("Treatment Name"), key: "name" },
    { headerName: t("Description"), key: "descript", type: "tooltip" },
    { headerName: t("Tooth No"), key: "ToothNoS" },
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
        title={t("Tooth Work")}
        serial={{ show: false }}
        columns={columns}
        data={oldDataStore.toothWork}
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
              <Button size="sm" colorScheme="blue" onClick={() => oldDataStore.applyDateFilter("toothWork")}>
                Apply
              </Button>
              <Button size="sm" variant="outline" colorScheme="red" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" colorScheme="purple" leftIcon={<FiPrinter />} isLoading={isPrinting} onClick={handlePreviewReport}>
                Preview Report
              </Button>
            </HStack>
          ),
          pagination: {
            show: true,
            currentPage: oldDataStore.toothWorkPage,
            totalPages: Math.ceil(oldDataStore.totalToothWork / 20) || 1,
            onClick: handlePageChange
          },
        }}
      />

      <LegacyRecordDrawer isOpen={isOpen} onClose={handleCloseDrawer} />
      <LegacyPatientHistoryDrawer isOpen={isHistoryOpen} onClose={handleCloseHistoryDrawer} />
      <ReceiptPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        pdfBase64={pdfBase64}
        fileName="historical_tooth_work_report.pdf"
      />
    </Box>
  );
});

export default ToothWorkTable;

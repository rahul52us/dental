"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import {
  Box,
  Badge,
  Text,
  Button,
  useDisclosure,
  Icon,
  HStack,
  useToast
} from "@chakra-ui/react";
import { FaEye, FaList } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import LegacyRecordDrawer from "../../component/LegacyRecordDrawer";
import LegacyPatientHistoryDrawer from "../../component/LegacyPatientHistoryDrawer";
import ReceiptPreviewDrawer from "../../../patients/component/patient/ReceiptPreviewDrawer";


const FeesTable = observer(() => {
  const { oldDataStore } = stores;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const toast = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfBase64, setPdfBase64] = useState("");

  const handlePreviewReport = async () => {
    setIsPrinting(true);
    const base64 = await oldDataStore.generateWorkFeeReportBase64();
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
    const delayDebounceFn = setTimeout(() => {
      oldDataStore.setSearchQuery(searchQuery);
      oldDataStore.fetchWorkFees();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, oldDataStore.workFeePage]);

  const handlePageChange = (page: number) => {
    oldDataStore.setPage("workFees", page);
  };

  const columns = [
    { headerName: t("Work Date"), function: (row: any) => new Date(row.wrk_date).toLocaleDateString('en-IN') },
    { headerName: t("Patient Code"), key: "legacyPatCode" },
    { headerName: t("Patient Name"), function: (row: any) => row.patientId?.name || "Unknown" },
    { headerName: t("Doctor"), function: (row: any) => row.doctorId?.name || row.legacyDocCode },
    { headerName: t("Fee Due"), key: "fee_due" },
    { headerName: t("Fee Dis"), key: "fee_dis" },
    { headerName: t("Stage"), function: (row: any) => <Badge colorScheme="purple">{row.treat_stage}</Badge> },
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
        title={t("Fees")}
        serial={{ show: false }}
        columns={columns}
        data={oldDataStore.workFees}
        loading={oldDataStore.loading}
        actions={{
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          datePicker: {
            show: true,
            date: {
              startDate: oldDataStore.startDate,
              endDate: oldDataStore.endDate,
            },
            onDateChange: (date: any, type: string) => {
              if (type === "startDate") oldDataStore.setStartDate(date);
              else if (type === "endDate") oldDataStore.setEndDate(date);
            },
          },
          customComponent: (
            <HStack spacing={2}>
              <Button size="sm" colorScheme="blue" onClick={() => oldDataStore.applyDateFilter("workFees")}>
                Apply
              </Button>
              <Button size="sm" colorScheme="purple" leftIcon={<FiPrinter />} isLoading={isPrinting} onClick={handlePreviewReport}>
                Preview Report
              </Button>
            </HStack>
          ),
          pagination: {
            show: true,
            currentPage: oldDataStore.workFeePage,
            totalPages: Math.ceil(oldDataStore.totalWorkFees / 20) || 1,
            onClick: handlePageChange
          },
          resetData: {
            show: true,
            text: "Reset",
            function: () => {
              setSearchQuery("");
              oldDataStore.resetDateFilter("workFees");
            }
          }
        }}
      />

      <LegacyRecordDrawer isOpen={isOpen} onClose={handleCloseDrawer} />
      <LegacyPatientHistoryDrawer isOpen={isHistoryOpen} onClose={handleCloseHistoryDrawer} />
      <ReceiptPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        pdfBase64={pdfBase64}
        fileName="historical_fees_report.pdf"
      />
    </Box>
  );
});

export default FeesTable;

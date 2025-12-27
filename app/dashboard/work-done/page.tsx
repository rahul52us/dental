"use client";

import {
  Box,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CustomInput from "../../component/config/component/customInput/CustomInput";

type ReportTab = "patient" | "doctor" | "appointment" | "recall";

const REPORT_TABS: { label: string; value: ReportTab; color: string }[] = [
  { label: "Patient", value: "patient", color: "teal" },
  { label: "Doctor", value: "doctor", color: "blue" },
  { label: "Appointment", value: "appointment", color: "purple" },
  { label: "Recall", value: "recall", color: "orange" },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>("patient");

  const [filters, setFilters] = useState<any>({
    patient: {},
    doctor: {},
    appointment: {},
    recall: {},
  });

  /* ================= REMEMBER LAST TAB ================= */
  useEffect(() => {
    const saved = localStorage.getItem("activeReportTab");
    if (saved) setActiveTab(saved as ReportTab);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeReportTab", activeTab);
  }, [activeTab]);

  /* ================= HANDLERS ================= */
  const handleChange = (section: ReportTab, name: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const applyQuickDate = (type: "today" | "month") => {
    const today = new Date();
    let fromDate = today;
    let toDate = today;

    if (type === "month") {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const format = (d: Date) => d.toISOString().split("T")[0];

    handleChange(activeTab, "fromDate", format(fromDate));
    handleChange(activeTab, "toDate", format(toDate));
  };

  const isDownloadDisabled = () => {
    const f = filters[activeTab];
    if (!f) return true;
    if (f.fromDate && f.toDate && f.fromDate > f.toDate) return true;
    return false;
  };

  const handleDownload = () => {
    console.log({
      reportType: activeTab,
      filters: filters[activeTab],
      format: "excel",
    });
  };

  const activeColor =
    REPORT_TABS.find((t) => t.value === activeTab)?.color || "teal";

  /* ================= UI ================= */
  return (
    <Box bg="gray.100" minH="80vh" py={5} borderRadius={10}>
      <Box  mx="auto" px={6}>
        {/* ================= PAGE HEADER ================= */}
        <Box>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="gray.800"
            letterSpacing="tight"
          >
            Reports
          </Text>
          <Text fontSize="sm" color="gray.500">
            Generate and download detailed system reports
          </Text>
        </Box>

        <Divider mb={8} />

        {/* ================= CARD TABS ================= */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={10}>
          {REPORT_TABS.map((tab) => (
            <Box
              key={tab.value}
              position="relative"
              p={5}
              borderRadius="2xl"
              cursor="pointer"
              bg={
                activeTab === tab.value
                  ? `linear-gradient(135deg, ${tab.color}.50, white)`
                  : "white"
              }
              border="1px solid"
              borderColor={
                activeTab === tab.value ? `${tab.color}.300` : "gray.200"
              }
              boxShadow={activeTab === tab.value ? "xl" : "sm"}
              transform={activeTab === tab.value ? "translateY(-3px)" : "none"}
              transition="all 0.25s ease"
              _hover={{
                boxShadow: "lg",
                transform: "translateY(-2px)",
              }}
              onClick={() => setActiveTab(tab.value)}
            >
              {activeTab === tab.value && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="4px"
                  bg={`${tab.color}.400`}
                  borderTopRadius="2xl"
                />
              )}

              <Text
                fontWeight="semibold"
                fontSize="md"
                color={
                  activeTab === tab.value ? `${tab.color}.700` : "gray.700"
                }
                textAlign="center"
              >
                {tab.label} Report
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* ================= ACTIVE REPORT CARD ================= */}
        <Box bg="white" borderRadius="2xl" boxShadow="xl" overflow="hidden">
          {/* ---------- HEADER ---------- */}
          <Box
            px={6}
            py={5}
            position="relative"
            bgGradient={`linear(to-r, ${activeColor}.50, white)`}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Box
              position="absolute"
              left={0}
              top={0}
              h="100%"
              w="4px"
              bg={`${activeColor}.400`}
            />

            <Text
              fontSize="lg"
              fontWeight="bold"
              color={`${activeColor}.700`}
            >
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report
            </Text>
            <Text fontSize="sm" color="gray.600">
              Configure filters and download the report
            </Text>
          </Box>

          {/* ---------- BODY ---------- */}
          <Box px={6} py={6}>
            {/* Quick Filters */}
            <HStack spacing={3} mb={4}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="full"
                onClick={() => applyQuickDate("today")}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderRadius="full"
                onClick={() => applyQuickDate("month")}
              >
                This Month
              </Button>
            </HStack>

            <Text fontSize="xs" color="gray.500" mb={4}>
              Quick date shortcuts
            </Text>

            {/* Filter Box */}
            <Box
              bg="gray.50"
              p={5}
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <CustomInput
                  name="fromDate"
                  type="date"
                  label="From Date"
                  value={filters[activeTab].fromDate || ""}
                  onChange={(e: any) =>
                    handleChange(activeTab, "fromDate", e.target.value)
                  }
                />

                <CustomInput
                  name="toDate"
                  type="date"
                  label="To Date"
                  value={filters[activeTab].toDate || ""}
                  onChange={(e: any) =>
                    handleChange(activeTab, "toDate", e.target.value)
                  }
                />

                {activeTab === "patient" && (
                  <CustomInput
                    name="category"
                    type="select"
                    label="Category"
                    options={[
                      { label: "All Patients", value: "all" },
                      { label: "With Appointments", value: "withAppointments" },
                      { label: "With Recalls", value: "withRecalls" },
                    ]}
                    value={filters.patient.category || ""}
                    onChange={(val: any) =>
                      handleChange("patient", "category", val?.value)
                    }
                  />
                )}

                {activeTab === "doctor" && (
                  <CustomInput
                    name="mode"
                    type="select"
                    label="Report Type"
                    options={[
                      { label: "Doctor List", value: "list" },
                      {
                        label: "Doctor-wise Appointments",
                        value: "appointments",
                      },
                    ]}
                    value={filters.doctor.mode || ""}
                    onChange={(val: any) =>
                      handleChange("doctor", "mode", val?.value)
                    }
                  />
                )}

                {activeTab === "appointment" && (
                  <CustomInput
                    name="status"
                    type="select"
                    label="Status"
                    options={[
                      { label: "All", value: "" },
                      { label: "Scheduled", value: "scheduled" },
                      { label: "Completed", value: "completed" },
                      { label: "Cancelled", value: "cancelled" },
                    ]}
                    value={filters.appointment.status || ""}
                    onChange={(val: any) =>
                      handleChange("appointment", "status", val?.value)
                    }
                  />
                )}

                {activeTab === "recall" && (
                  <CustomInput
                    name="status"
                    type="select"
                    label="Recall Status"
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Scheduled", value: "scheduled" },
                      { label: "Completed", value: "completed" },
                      { label: "Cancelled", value: "cancelled" },
                    ]}
                    value={filters.recall.status || ""}
                    onChange={(val: any) =>
                      handleChange("recall", "status", val?.value)
                    }
                  />
                )}
              </SimpleGrid>
            </Box>
          </Box>

          <Divider />

          {/* ---------- FOOTER ---------- */}
          <Flex
            px={6}
            py={5}
            justify="space-between"
            align="center"
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.600">
              You are downloading <b>{activeTab}</b> report
            </Text>

            <Button
              colorScheme={activeColor}
              size="md"
              px={8}
              boxShadow="lg"
              _hover={{ boxShadow: "xl" }}
              isDisabled={isDownloadDisabled()}
              onClick={handleDownload}
            >
              Download Report
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportsPage;

"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Flex,
  Button,
  Box,
  Badge,
  HStack,
  Text,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  VStack,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Divider,
  Center,
  Spacer,
} from "@chakra-ui/react";
import { FiList, FiHome, FiGlobe, FiDownload, FiCalendar, FiSend, FiClock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

import stores from "../../store/stores";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import LabSheet from "./component/LabSheet";
import LabSheetView from "./component/LabSheetView";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import useDebounce from "../../component/config/component/customHooks/useDebounce";

const LabWorkTable = observer(() => {
  const { labWorkStore, labWorkHierarchyStore, auth: { openNotification } } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const [selectedLabWork, setSelectedLabWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const searchParams = useSearchParams();
  const toast = stores.auth.openNotification;
  const [isDownloading, setIsDownloading] = useState(false);

  const [reportFilters, setReportFilters] = useState({
    sendDateFrom: "",
    sendDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    receivedDateFrom: "",
    receivedDateTo: "",
    workType: "all",
    patient: null as any,
    doctor: null as any,
    status: "all",
  });

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentPage(1);
  };

  const fetchLabWorks = useCallback(
    (page = 1, limit = tablePageLimit) => {
      let workType: any = undefined;
      if (activeTab === 1) workType = "in-house";
      else if (activeTab === 2) workType = "outside";

      const query: any = { page, limit };
      if (workType) query.workType = workType;

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }
      labWorkStore.getAllLabWorks(query)
        .catch((err: any) => {
          openNotification({
            type: "error",
            title: "Error",
            message: err?.message,
          });
        });
    },
    [labWorkStore, openNotification, activeTab, debouncedSearchQuery]
  );

  const resetReportFilters = () => {
    setReportFilters({
      sendDateFrom: "",
      sendDateTo: "",
      dueDateFrom: "",
      dueDateTo: "",
      receivedDateFrom: "",
      receivedDateTo: "",
      workType: "all",
      patient: null,
      doctor: null,
      status: "all",
    });
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setActiveTab(0);
  };

  // Sync tab with query param
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "in-house") setActiveTab(1);
    else if (type === "outside") setActiveTab(2);
    else setActiveTab(0);
  }, [searchParams]);

  useEffect(() => {
    fetchLabWorks(currentPage);
    labWorkHierarchyStore.getAllHierarchies();
  }, [currentPage, activeTab, debouncedSearchQuery, fetchLabWorks]);

  const handleAdd = () => {
    const defaultWorkType = activeTab === 1 ? "in-house" : (activeTab === 2 ? "outside" : "outside");
    setSelectedLabWork({ workType: defaultWorkType } as any);
    onOpen();
  };

  const handleEdit = (data: any) => {
    setSelectedLabWork(data);
    onOpen();
  };

  const handleView = (data: any) => {
    setSelectedLabWork(data);
    onViewOpen();
  };

  const handleDelete = async (data: any) => {
    if (window.confirm("Are you sure you want to delete this lab sheet?")) {
      const res = await labWorkStore.deleteLabWork(data._id);
      if (res.status === "success") {
        fetchLabWorks(currentPage);
      }
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      let workType: any = "all";
      if (activeTab === 1) workType = "in-house";
      else if (activeTab === 2) workType = "outside";

      const payloadFilters = {
        ...reportFilters,
        workType: reportFilters.workType === "all" ? workType : reportFilters.workType,
        patientId: reportFilters.patient?._id || reportFilters.patient?.value || reportFilters.patient?.id,
        doctorId: reportFilters.doctor?._id || reportFilters.doctor?.value || reportFilters.doctor?.id,
        search: debouncedSearchQuery?.trim() || undefined,
      };

      const response = await stores.reportStore.getReportDownload({
        reportType: "labWork",
        filters: payloadFilters,
      });

      if (response?.status === "success" && response.data) {
        const { fileName, fileData } = response.data;
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          type: "success",
          title: "Success",
          message: "Report downloaded successfully!",
        });
        onReportClose();
      }
    } catch (err: any) {
      toast({
        type: "error",
        title: "Error",
        message: err.message || "Failed to download report",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let color = "blue";
    const s = status?.toLowerCase();
    if (s === "plan") color = "blue";
    else if (s === "sent") color = "orange";
    else if (s === "in-progress" || s === "processing") color = "purple";
    else if (s === "received") color = "teal";
    else if (s === "completed" || s === "delivered") color = "green";
    else if (s === "cancelled" || s === "rejected") color = "red";

    return <Badge colorScheme={color} borderRadius="full" px={2} variant="subtle">{status?.toUpperCase() || "N/A"}</Badge>;
  };

  const columns = useMemo(() => {
    const baseCols: any[] = [];

    // Show Work Type only if we are in the "All" tab (index 0)
    if (activeTab === 0) {
      baseCols.push({
        headerName: "Work Type",
        key: "workType",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Badge colorScheme={dt.workType === "in-house" ? "purple" : "cyan"}>
              {dt.workType}
            </Badge>
          ),
        },
      });
    }

    baseCols.push(
      {
        headerName: "Patient",
        key: "patient",
        function: (dt: any) => dt.patient?.name || dt.patientNameManual || "N/A",
      },
      {
        headerName: "Doctor",
        key: "doctor",
        function: (dt: any) => dt.primaryDoctor?.name || dt.primaryDoctor?.labDoctorName || dt.doctorNameManual || "N/A",
      },
      {
        headerName: "Selected Works",
        key: "works",
        type: "component",
        metaData: {
          component: (dt: any) => {
            const works = dt.selectedWorks?.map((w: any) => labWorkHierarchyStore.getNamePath(w.selections)) || [];
            if (works.length === 0) return <Text fontSize="xs" color="gray.400">None</Text>;
  
            return (
              <Tooltip
                label={
                  <VStack align="start" spacing={1} p={1}>
                    {works.map((w: string, i: number) => (
                      <Text key={i} fontSize="xs" fontWeight="600">• {w}</Text>
                    ))}
                  </VStack>
                }
                placement="top"
                hasArrow
                borderRadius="lg"
                bg="blue.800"
                color="white"
                p={3}
                boxShadow="xl"
              >
                <HStack spacing={2} cursor="help">
                  <Text fontSize="xs" fontWeight="700" color="blue.700" noOfLines={1} maxW="150px">
                    • {works[0]}
                  </Text>
                  {works.length > 1 && (
                    <Badge size="xs" colorScheme="blue" variant="solid" fontSize="10px" borderRadius="full" px={2}>
                      +{works.length - 1}
                    </Badge>
                  )}
                </HStack>
              </Tooltip>
            );
          },
        },
      }
    );

    // Only show Lab column if we are not strictly in the In-house tab
    if (activeTab !== 1) {
      baseCols.push({
        headerName: "Lab",
        key: "lab",
        function: (dt: any) => dt.lab?.name || dt.labNameManual || (dt.workType === "in-house" ? "In-house" : "N/A"),
      } as any);
    }

    return [
      ...baseCols,
      {
        headerName: "Send Date",
        key: "sendDate",
        function: (dt: any) => dt.sendDate ? formatDateTime(dt.sendDate).split(",")[0] : "-",
      },
      {
        headerName: "Due Date",
        key: "dueDate",
        function: (dt: any) => dt.dueDate ? formatDateTime(dt.dueDate).split(",")[0] : "-",
      },
      {
        headerName: "Received Date",
        key: "receivedDate",
        function: (dt: any) => dt.receivedDate ? formatDateTime(dt.receivedDate).split(",")[0] : "-",
      },
      {
        headerName: "Status",
        key: "status",
        type: "component",
        metaData: {
          component: (dt: any) => <StatusBadge status={dt.status} />,
        },
      },
      {
        headerName: "Actions",
        key: "table-actions",
        type: "table-actions",
      },
    ];
  }, [activeTab, labWorkHierarchyStore]);

  return (
    <Box p={4}>
      <Box display="none">
        <DashPageHeader breadcrumb={[]} />
      </Box>
      <DashPageTitle
        title="Lab Management"
        subTitle="Manage In-house and Outside laboratory orders and tracking"
      />
      <Box mt={2}>
        <Flex justify="space-between" align="center" mb={4}>
          <Tabs
            index={activeTab}
            onChange={handleTabChange}
            variant="unstyled"
          >
            <TabList
              bg={useColorModeValue("white", "gray.800")}
              p={1}
              borderRadius="xl"
              shadow="sm"
              w="fit-content"
              border="1px solid"
              borderColor={useColorModeValue("gray.100", "gray.700")}
            >
              {[
                { label: "All Sheets", icon: FiList },
                { label: "In-house", icon: FiHome },
                { label: "Outside", icon: FiGlobe }
              ].map((t, i) => (
                <Tab
                  key={i}
                  _selected={{
                    bg: "blue.500",
                    color: "white",
                    shadow: "md"
                  }}
                  _hover={{
                    bg: activeTab === i ? "blue.600" : useColorModeValue("gray.50", "gray.700")
                  }}
                  borderRadius="lg"
                  px={6}
                  py={2}
                  fontSize="sm"
                  fontWeight="600"
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Icon as={t.icon} />
                    <Text>{t.label}</Text>
                  </HStack>
                </Tab>
              ))}
            </TabList>
          </Tabs>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            size="md"
            borderRadius="xl"
            onClick={() => {
              let workType: any = "all";
              if (activeTab === 1) workType = "in-house";
              else if (activeTab === 2) workType = "outside";
              setReportFilters(prev => ({ ...prev, workType }));
              onReportOpen();
            }}
            isLoading={isDownloading}
            loadingText="Downloading..."
          >
            Download Report
          </Button>
        </Flex>

        <CustomTable
          title={activeTab === 0 ? "All Lab Sheets" : (activeTab === 1 ? "In-house Work" : "Outside Work")}
          data={labWorkStore.labWorks.map((item, index) => ({
            ...item,
            sno: (currentPage - 1) * tablePageLimit + index + 1,
          }))}
          columns={columns}
          actions={{
            actionBtn: {
              addKey: { showAddButton: true, function: handleAdd },
              editKey: { showEditButton: true, function: handleEdit },
              deleteKey: { showDeleteButton: true, function: handleDelete },
              viewKey: { showViewButton: true, function: handleView },
            },
            pagination: {
              show: true,
              onClick: setCurrentPage,
              currentPage: currentPage,
              totalPages: Math.ceil(labWorkStore.totalCount / tablePageLimit),
            },
            search: {
              show: true,
              searchValue: searchQuery,
              onSearchChange: (e: any) => setSearchQuery(e.target.value),
            },
            resetData: {
              show: true,
              text: "Reset Filters",
              function: resetTableData,
            },
          }}
          loading={labWorkStore.loading}
        />

        {/* Edit/Add Drawer */}
        <Drawer isOpen={isOpen} onClose={onClose} size="full" placement="right">
          <DrawerOverlay />
          <DrawerContent maxW="85%">
            <DrawerHeader
              bgGradient={`linear(to-r, ${stores.themeStore.themeConfig.colors.custom.light.primary}, ${stores.themeStore.themeConfig.colors.custom.light.primary}EE, ${stores.themeStore.themeConfig.colors.custom.light.primary}CC)`}
              color="white"
              fontWeight="700"
              fontSize="xl"
              boxShadow="md"
            >
              {selectedLabWork && (selectedLabWork as any)._id ? "Update Lab Order" : "New Lab Order"}
            </DrawerHeader>
            <DrawerCloseButton color="white" />
            <DrawerBody pb={6}>
              <Box mt={4}>
                <LabSheet
                  initialData={selectedLabWork}
                  onClose={onClose}
                  onSuccess={() => fetchLabWorks(currentPage)}
                />
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Report Filter Drawer */}
        <Drawer isOpen={isReportOpen} onClose={onReportClose} size="lg" placement="right">
          <DrawerOverlay backdropFilter="blur(5px)" />
          <DrawerContent borderLeftRadius="3xl" shadow="2xl">
            <DrawerHeader bg="blue.600" color="white" py={6} px={8}>
              <HStack spacing={3}>
                <Icon as={FiDownload} boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="bold">Report Configuration</Text>
                  <Text fontSize="xs" fontWeight="normal" opacity={0.8}>Fine-tune your lab work export</Text>
                </VStack>
              </HStack>
              <DrawerCloseButton color="white" mt={4} />
            </DrawerHeader>

            <DrawerBody p={8}>
              <VStack spacing={8} align="stretch">
                {/* Date Filters Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiCalendar} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color="gray.600">DATE RANGE FILTERS</Text>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    {/* Send Date Row */}
                    <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="stretch" spacing={3}>
                        <HStack spacing={3}>
                          <Center bg="blue.100" color="blue.600" p={2} borderRadius="lg">
                            <Icon as={FiSend} />
                          </Center>
                          <Text fontWeight="bold" fontSize="sm" color="gray.700">SEND DATE</Text>
                        </HStack>
                        <SimpleGrid columns={2} spacing={4}>
                          <CustomInput
                            name="sendDateFrom"
                            type="date"
                            label="From"
                            value={reportFilters.sendDateFrom}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, sendDateFrom: e.target.value })}
                          />
                          <CustomInput
                            name="sendDateTo"
                            type="date"
                            label="To"
                            value={reportFilters.sendDateTo}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, sendDateTo: e.target.value })}
                          />
                        </SimpleGrid>
                      </VStack>
                    </Box>

                    {/* Due Date Row */}
                    <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="stretch" spacing={3}>
                        <HStack spacing={3}>
                          <Center bg="orange.100" color="orange.600" p={2} borderRadius="lg">
                            <Icon as={FiClock} />
                          </Center>
                          <Text fontWeight="bold" fontSize="sm" color="gray.700">DUE DATE</Text>
                        </HStack>
                        <SimpleGrid columns={2} spacing={4}>
                          <CustomInput
                            name="dueDateFrom"
                            type="date"
                            label="From"
                            value={reportFilters.dueDateFrom}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, dueDateFrom: e.target.value })}
                          />
                          <CustomInput
                            name="dueDateTo"
                            type="date"
                            label="To"
                            value={reportFilters.dueDateTo}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, dueDateTo: e.target.value })}
                          />
                        </SimpleGrid>
                      </VStack>
                    </Box>

                    {/* Received Date Row */}
                    <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="stretch" spacing={3}>
                        <HStack spacing={3}>
                          <Center bg="teal.100" color="teal.600" p={2} borderRadius="lg">
                            <Icon as={FiCheckCircle} />
                          </Center>
                          <Text fontWeight="bold" fontSize="sm" color="gray.700">RECEIVED DATE</Text>
                        </HStack>
                        <SimpleGrid columns={2} spacing={4}>
                          <CustomInput
                            name="receivedDateFrom"
                            type="date"
                            label="From"
                            value={reportFilters.receivedDateFrom}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, receivedDateFrom: e.target.value })}
                          />
                          <CustomInput
                            name="receivedDateTo"
                            type="date"
                            label="To"
                            value={reportFilters.receivedDateTo}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, receivedDateTo: e.target.value })}
                          />
                        </SimpleGrid>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>

                <Divider />

                {/* Other Filters Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiList} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color="gray.600">ENTITY FILTERS</Text>
                  </HStack>
                  <VStack spacing={5} align="stretch">
                    <SimpleGrid columns={2} spacing={4}>
                      <CustomInput
                        name="workType"
                        type="select"
                        label="Work Type"
                        isPortal
                        options={[
                          { label: "All", value: "all" },
                          { label: "In-house", value: "in-house" },
                          { label: "Outside", value: "outside" },
                        ]}
                        value={reportFilters.workType}
                        onChange={(val: any) => setReportFilters({ ...reportFilters, workType: val?.value || "all" })}
                      />
                      <CustomInput
                        name="status"
                        type="select"
                        label="Status"
                        isPortal
                        options={[
                          { label: "All", value: "all" },
                          { label: "Plan", value: "plan" },
                          { label: "Sent", value: "sent" },
                          { label: "Received", value: "received" },
                          { label: "Completed", value: "completed" },
                          { label: "Cancelled", value: "cancelled" },
                        ]}
                        value={reportFilters.status}
                        onChange={(val: any) => setReportFilters({ ...reportFilters, status: val?.value || "all" })}
                      />
                    </SimpleGrid>
                    <CustomInput
                      name="patient"
                      placeholder="Search Patient"
                      type="real-time-user-search"
                      label="Filter by Patient"
                      isPortal
                      value={reportFilters.patient}
                      onChange={(val: any) => setReportFilters({ ...reportFilters, patient: val })}
                      query={{ type: "patient" }}
                    />
                    <CustomInput
                      name="doctor"
                      placeholder="Search Doctor"
                      type="real-time-user-search"
                      label="Filter by Doctor"
                      isPortal
                      value={reportFilters.doctor}
                      onChange={(val: any) => setReportFilters({ ...reportFilters, doctor: val })}
                      query={{ type: "doctor" }}
                    />
                  </VStack>
                </Box>
              </VStack>
            </DrawerBody>

            <DrawerFooter bg="gray.50" p={6} borderTopWidth="1px">
              <HStack w="100%" spacing={4}>
                <Button
                  variant="ghost"
                  leftIcon={<FiRefreshCw />}
                  onClick={resetReportFilters}
                  borderRadius="xl"
                >
                  Reset
                </Button>
                <Spacer />
                <Button variant="outline" onClick={onReportClose} borderRadius="xl">
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiDownload />}
                  onClick={handleDownloadReport}
                  isLoading={isDownloading}
                  px={8}
                  borderRadius="xl"
                  shadow="md"
                >
                  Generate Report
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* View Drawer */}
        <Drawer isOpen={isViewOpen} onClose={onViewClose} size="lg" placement="right">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px" bg="blue.600" color="white">
              Lab Order Details
            </DrawerHeader>
            <DrawerCloseButton color="white" />
            <DrawerBody p={0}>
              {selectedLabWork && <LabSheetView data={selectedLabWork} />}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </Box>
  );
});

export default LabWorkTable;

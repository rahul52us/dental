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
  Select,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  IconButton,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiList, FiDownload, FiCalendar, FiSend, FiClock, FiCheckCircle, FiRefreshCw, FiUser, FiColumns } from "react-icons/fi";

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
import ReportPreviewDrawer from "../../component/ReportPreviewDrawer/ReportPreviewDrawer";

interface LabWorkTableProps {
  patientId?: string;
  patientDetails?: any;
  isDrawer?: boolean;
  defaultWorkType?: "in-house" | "outside" | "all";
}
const defaultLabWorkCols = [
  { label: "Patient", value: "patientName" },
  { label: "Doctor", value: "doctorName" },
  { label: "Work Type", value: "workType" },
  { label: "Lab", value: "labName" },
  { label: "Creation Date", value: "createdAt" },
  { label: "Send Date", value: "sendDate" },
  { label: "Due Date", value: "dueDate" },
  { label: "Received Date", value: "receivedDate" },
  { label: "Status", value: "status" },
  { label: "Price", value: "price" },
  { label: "Selected Works", value: "works" },
  { label: "Teeth Number", value: "teethNumber" },
  { label: "Shade", value: "shade" },
  { label: "Unit", value: "unit" },
  { label: "Warranty Card", value: "warrantyCardNumber" },
];


const LabWorkTable = observer(({ patientId, patientDetails, isDrawer, defaultWorkType }: LabWorkTableProps = {}) => {
  const { labWorkStore, labWorkHierarchyStore, labWorkStatusStore, auth: { openNotification } } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const [selectedLabWork, setSelectedLabWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    if (isDrawer) {
      return defaultWorkType === "in-house" ? 1 : (defaultWorkType === "outside" ? 2 : 0);
    }
    const type = searchParams.get("type");
    if (type === "in-house") return 1;
    if (type === "outside") return 2;
    return 0;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const debouncedDoctorSearch = useDebounce(doctorSearch, 1000);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const toast = stores.auth.openNotification;
  const [isDownloading, setIsDownloading] = useState(false);
  const [noReceivedDate, setNoReceivedDate] = useState(false);
  const [noSendDate, setNoSendDate] = useState(false);

  const [previewData, setPreviewData] = useState<{ columns: any[]; rows: any[] } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [reportFilters, setReportFilters] = useState({
    dateType: "receivedDate" as string | string[],
    fromDate: "",
    toDate: "",
    workType: "in-house",
    patient: null as any,
    doctor: null as any,
    labDoctor: null as any,
    status: "all" as string | string[],
    selectedColumns: [] as string[],
  });

  useEffect(() => {
    const savedCols = localStorage.getItem("labReportColumns");
    if (savedCols) {
      try {
        const cols = JSON.parse(savedCols);
        setReportFilters((prev) => ({ ...prev, selectedColumns: cols }));
      } catch (e) {}
    }
  }, []);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentPage(1);
  };

  const hasTabPermission = (action: string) => {
    if (activeTab === 1) return stores.auth.hasPermission('inhouse_lab', action);
    if (activeTab === 2) return stores.auth.hasPermission('outside_lab', action);
    return stores.auth.hasPermission('inhouse_lab', action) || stores.auth.hasPermission('outside_lab', action);
  };

  const fetchLabWorks = useCallback(
    (page = 1, limit = tablePageLimit) => {
      let workType: any = undefined;
      if (activeTab === 1) workType = "in-house";
      else if (activeTab === 2) workType = "outside";

      const query: any = { page, limit };
      if (workType) query.workType = workType;
      if (patientId) query.patient = patientId;
      if (statusFilter !== "all") query.status = statusFilter;
      if (fromDate) query.fromDate = fromDate;
      if (toDate) query.toDate = toDate;

      if (debouncedDoctorSearch?.trim()) {
        query.doctorName = debouncedDoctorSearch.trim();
      }

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }
      if (noReceivedDate) {
        query.noReceivedDate = true;
      }
      if (noSendDate) {
        query.noSendDate = true;
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
    [labWorkStore, openNotification, activeTab, debouncedSearchQuery, debouncedDoctorSearch, patientId, statusFilter, fromDate, toDate, noReceivedDate, noSendDate]
  );

  const resetReportFilters = () => {
    setReportFilters({
      dateType: "receivedDate",
      fromDate: "",
      toDate: "",
      workType: "in-house",
      patient: null,
      doctor: null,
      labDoctor: null,
      status: "all",
      selectedColumns: [],
    });
    localStorage.removeItem("labReportColumns");
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setTempFromDate("");
    setTempToDate("");
    setDoctorSearch("");
    setNoReceivedDate(false);
    setNoSendDate(false);
  };

  // Sync tab with query param
  useEffect(() => {
    if (!isDrawer) {
      const type = searchParams.get("type");
      if (type === "in-house") setActiveTab(1);
      else if (type === "outside") setActiveTab(2);
      else setActiveTab(0);
    }
  }, [searchParams, isDrawer]);

  useEffect(() => {
    fetchLabWorks(currentPage);
    labWorkHierarchyStore.getAllHierarchies();
  }, [currentPage, activeTab, debouncedSearchQuery, debouncedDoctorSearch, statusFilter, fromDate, toDate, noReceivedDate, noSendDate, fetchLabWorks, labWorkHierarchyStore]);

  useEffect(() => {
    labWorkStatusStore.getLabWorkStatuses();
  }, [labWorkStatusStore]);

  const handleAdd = () => {
    const defaultWorkType = activeTab === 1 ? "in-house" : (activeTab === 2 ? "outside" : "outside");
    const newLabWork: any = { workType: defaultWorkType };
    
    // Auto-populate patient if we have the details (e.g., from waiting room / patient view)
    if (patientDetails) {
      newLabWork.patient = {
        label: patientDetails.name,
        value: patientDetails._id,
        _id: patientDetails._id,
        name: patientDetails.name
      };
    }
    
    setSelectedLabWork(newLabWork);
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

  const handleDownloadReport = async (isPreview = false) => {
    setIsDownloading(true);
    try {
      let workType: any = "all";
      if (activeTab === 1) workType = "in-house";
      else if (activeTab === 2) workType = "outside";

      const payloadFilters = {
        ...reportFilters,
        workType: reportFilters.workType === "all" ? workType : reportFilters.workType,
        patientId: reportFilters.patient?._id || reportFilters.patient?.value || reportFilters.patient?.id,
        doctorId: reportFilters.doctor?._id || reportFilters.doctor?.value || reportFilters.doctor?.id || reportFilters.labDoctor?._id || reportFilters.labDoctor?.value || reportFilters.labDoctor?.id,
        search: debouncedSearchQuery?.trim() || undefined,
        selectedColumns: reportFilters.selectedColumns,
      };

      const response = await stores.reportStore.getReportDownload({
        reportType: "labWork",
        filters: payloadFilters,
        isPreview
      });

      if (response?.status === "success" && response.data) {
        if (isPreview) {
          setPreviewData(response.data);
          setIsPreviewOpen(true);
        } else {
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
        setIsPreviewOpen(false);
        onReportClose();
      }
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

    const dateCols: any[] = [];
    if (activeTab === 1) {
      // In-house: Send -> Due -> Received
      dateCols.push(
        { headerName: "Send Date", key: "sendDate", function: (dt: any) => dt.sendDate ? formatDateTime(dt.sendDate).split(",")[0] : "-" },
        { headerName: "Due Date", key: "dueDate", function: (dt: any) => dt.dueDate ? formatDateTime(dt.dueDate).split(",")[0] : "-" },
        { headerName: "Received Date", key: "receivedDate", function: (dt: any) => dt.receivedDate ? formatDateTime(dt.receivedDate).split(",")[0] : "-" }
      );
    } else {
      // Outside & All: Received -> Due -> Send
      dateCols.push(
        { headerName: "Received Date", key: "receivedDate", function: (dt: any) => dt.receivedDate ? formatDateTime(dt.receivedDate).split(",")[0] : "-" },
        { headerName: "Due Date", key: "dueDate", function: (dt: any) => dt.dueDate ? formatDateTime(dt.dueDate).split(",")[0] : "-" },
        { headerName: "Send Date", key: "sendDate", function: (dt: any) => dt.sendDate ? formatDateTime(dt.sendDate).split(",")[0] : "-" }
      );
    }

    // Add Delay column
    dateCols.push({
      headerName: "Delay",
      key: "delay",
      type: "component",
      metaData: {
        component: (dt: any) => {
          if (dt.delay === undefined || dt.delay === null || dt.delay === "") return <Text>-</Text>;
          return <Badge colorScheme={dt.delay < 0 ? "red" : (dt.delay > 0 ? "green" : "gray")} borderRadius="full" px={2}>{dt.delay} Days</Badge>;
        }
      }
    });

    return [
      ...baseCols,
      ...dateCols,
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
    <Box p={isDrawer ? 0 : 4}>
      {!isDrawer && (
        <>
          <Box display="none">
            <DashPageHeader breadcrumb={[]} />
          </Box>
          <DashPageTitle
            title="Lab Management"
            subTitle="Manage In-house and Outside laboratory orders and tracking"
          />
        </>
      )}
      <Box mt={isDrawer ? 0 : 2}>
        <CustomTable
          title={activeTab === 0 ? "All Lab Sheets" : (activeTab === 1 ? "." : ".")}
          data={labWorkStore.labWorks.map((item, index) => ({
            ...item,
            sno: (currentPage - 1) * tablePageLimit + index + 1,
          }))}
          columns={columns}
          actions={{
            customComponent: (
              <Flex gap={3} align="center" justify="flex-start" wrap="nowrap" overflowX="auto" pb={1} className="customScrollBar">
                {/* Advanced Filters Popover */}
                <Popover placement="bottom-start" closeOnBlur={true}>
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      borderRadius="xl"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<FiList />}
                    >
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent p={2} w="300px" boxShadow="xl" borderRadius="xl" border="1px solid" borderColor="gray.200">
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <VStack spacing={4} align="stretch" mt={4}>
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500">DATE RANGE</Text>
                          <VStack spacing={2}>
                            <Input
                              type="date"
                              size="sm"
                              borderRadius="md"
                              value={tempFromDate}
                              onChange={(e) => setTempFromDate(e.target.value)}
                              bg={useColorModeValue("white", "gray.800")}
                            />
                            <Input
                              type="date"
                              size="sm"
                              borderRadius="md"
                              value={tempToDate}
                              onChange={(e) => setTempToDate(e.target.value)}
                              bg={useColorModeValue("white", "gray.800")}
                            />
                            <Button
                              size="sm"
                              colorScheme="blue"
                              w="full"
                              onClick={() => {
                                setFromDate(tempFromDate);
                                setToDate(tempToDate);
                                setCurrentPage(1);
                              }}
                            >
                              Apply Date Filter
                            </Button>
                          </VStack>
                        </Box>

                        <Box>
                          <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500">DOCTOR</Text>
                          <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                              <FiUser color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Search Doctor..."
                              borderRadius="md"
                              value={doctorSearch}
                              onChange={(e) => {
                                setDoctorSearch(e.target.value);
                                setCurrentPage(1);
                              }}
                              bg={useColorModeValue("white", "gray.800")}
                            />
                          </InputGroup>
                        </Box>

                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>

                <Box w="180px" zIndex={10}>
                  <CustomInput
                    name="statusFilter"
                    type="select"
                    isPortal={true}
                    options={[
                      { label: "All Statuses", value: "all" },
                      ...labWorkStatusStore.statuses
                        .filter((s: any) => activeTab === 0 || s.type === (activeTab === 1 ? "in-house" : "outside"))
                        .sort((a: any, b: any) => a.status.localeCompare(b.status))
                        .map((s: any) => ({ label: s.status, value: s.status }))
                    ]}
                    value={{ label: statusFilter === "all" ? "All Statuses" : statusFilter, value: statusFilter }}
                    onChange={(val: any) => {
                      setStatusFilter(val ? val.value : "all");
                      setCurrentPage(1);
                    }}
                  />
                </Box>

                {activeTab === 1 && (
                  <Button
                    size="sm"
                    borderRadius="xl"
                    colorScheme={noReceivedDate ? "orange" : "gray"}
                    variant={noReceivedDate ? "solid" : "outline"}
                    onClick={() => {
                      setNoReceivedDate(prev => !prev);
                      setNoSendDate(false);
                      setCurrentPage(1);
                    }}
                    leftIcon={<FiClock />}
                    flexShrink={0}
                  >
                    {noReceivedDate ? "✓ No Received Date" : "No Received Date"}
                  </Button>
                )}

                {activeTab === 2 && (
                  <Button
                    size="sm"
                    borderRadius="xl"
                    colorScheme={noSendDate ? "orange" : "gray"}
                    variant={noSendDate ? "solid" : "outline"}
                    onClick={() => {
                      setNoSendDate(prev => !prev);
                      setNoReceivedDate(false);
                      setCurrentPage(1);
                    }}
                    leftIcon={<FiClock />}
                    flexShrink={0}
                  >
                    {noSendDate ? "✓ No Send Date" : "No Send Date"}
                  </Button>
                )}

                {hasTabPermission('download') && (
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
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
                    flexShrink={0}
                  >
                    Download Report
                  </Button>
                )}

                {(fromDate || toDate || doctorSearch || statusFilter !== "all" || noReceivedDate || noSendDate) && (
                  <IconButton
                    aria-label="Reset All Filters"
                    icon={<FiRefreshCw />}
                    size="sm"
                    colorScheme="red"
                    borderRadius="xl"
                    onClick={resetTableData}
                    title="Reset All Filters"
                    flexShrink={0}
                  />
                )}
              </Flex>
            ),
            actionBtn: {
              addKey: {
                showAddButton: hasTabPermission('create'),
                function: handleAdd
              },
              editKey: {
                showEditButton: hasTabPermission('edit'),
                function: handleEdit
              },
              deleteKey: {
                showDeleteButton: hasTabPermission('delete'),
                function: handleDelete
              },
              viewKey: {
                showViewButton: hasTabPermission('view'),
                function: handleView
              },
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
        <Drawer isOpen={isReportOpen} onClose={onReportClose} size="full" placement="right">
          <DrawerOverlay backdropFilter="blur(5px)" />
          <DrawerContent maxW="75%" borderLeftRadius="3xl" shadow="2xl">
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
                {/* Work Type Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiList} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color="gray.600">WORK TYPE</Text>
                  </HStack>
                  <CustomInput
                    name="workType"
                    type="select"
                    isPortal
                    options={[
                      { label: "All", value: "all" },
                      { label: "In-house", value: "in-house" },
                      { label: "Outside", value: "outside" },
                    ]}
                    value={{
                      label: reportFilters.workType === "all" ? "All" : reportFilters.workType === "in-house" ? "In-house" : "Outside",
                      value: reportFilters.workType
                    }}
                    onChange={(val: any) => {
                      if (!val || val.value === "all") {
                        setReportFilters({ ...reportFilters, workType: "all", labDoctor: null, doctor: null });
                      } else if (val.value === "in-house") {
                        setReportFilters({ ...reportFilters, workType: "in-house", labDoctor: null, dateType: "sendDate" });
                      } else {
                        setReportFilters({ ...reportFilters, workType: "outside", doctor: null, dateType: "receivedDate" });
                      }
                    }}
                  />
                </Box>

                <Divider />

                {/* Date Filters Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiCalendar} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color="gray.600">DATE RANGE FILTERS</Text>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="stretch" spacing={3}>
                        <HStack mb={2} spacing={2} justify="space-between">
                          <HStack spacing={2}>
                            <Icon as={FiCalendar} color="teal.500" />
                            <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color="gray.600">DATE FILTER</Text>
                          </HStack>
                        </HStack>
                        <CustomInput
                          name="dateType"
                          type="select"
                          isPortal
                          options={
                            reportFilters.workType === "in-house"
                              ? [
                                  { label: "Send Date", value: "sendDate" },
                                  { label: "Due Date", value: "dueDate" },
                                  { label: "Received Date", value: "receivedDate" },
                                  { label: "Creation Date", value: "createdAt" },
                                ]
                              : [
                                  { label: "Received Date", value: "receivedDate" },
                                  { label: "Due Date", value: "dueDate" },
                                  { label: "Send Date", value: "sendDate" },
                                  { label: "Creation Date", value: "createdAt" },
                                ]
                          }
                          value={{
                            label: (Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType) === "receivedDate" ? "Received Date" : (Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType) === "sendDate" ? "Send Date" : (Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType) === "createdAt" ? "Creation Date" : "Due Date",
                            value: Array.isArray(reportFilters.dateType) ? reportFilters.dateType[0] : reportFilters.dateType
                          }}
                          onChange={(val: any) => {
                            if (val) {
                              setReportFilters({ ...reportFilters, dateType: val.value });
                            }
                          }}
                        />
                        <SimpleGrid columns={2} spacing={4} w="100%">
                          <CustomInput
                            name="fromDate"
                            type="date"
                            label="From"
                            value={reportFilters.fromDate}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, fromDate: e.target.value })}
                          />
                          <CustomInput
                            name="toDate"
                            type="date"
                            label="To"
                            value={reportFilters.toDate}
                            onChange={(e: any) => setReportFilters({ ...reportFilters, toDate: e.target.value })}
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
                    <SimpleGrid columns={1} spacing={4}>
                    </SimpleGrid>
                    <CustomInput
                      name="status"
                      type="select"
                      label="Status"
                      isPortal
                      isMulti
                      options={(labWorkStatusStore.statuses || [])
                        .filter((s: any) => reportFilters.workType === "all" || s.type === reportFilters.workType)
                        .sort((a: any, b: any) => a.status.localeCompare(b.status))
                        .map((s: any) => ({
                          label: s.status,
                          value: s.status,
                        }))}
                      value={
                        reportFilters.status === "all"
                          ? (labWorkStatusStore.statuses || [])
                              .filter((s: any) => reportFilters.workType === "all" || s.type === reportFilters.workType)
                              .sort((a: any, b: any) => a.status.localeCompare(b.status))
                              .map((s: any) => ({ label: s.status, value: s.status }))
                          : Array.isArray(reportFilters.status)
                          ? reportFilters.status.map((s: string) => ({ label: s, value: s }))
                          : []
                      }
                      onChange={(val: any) => {
                        if (!val || val.length === 0) {
                          setReportFilters({ ...reportFilters, status: [] });
                        } else {
                          setReportFilters({ ...reportFilters, status: val.map((v: any) => v.value) });
                        }
                      }}
                    />
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
                    {reportFilters.workType === "in-house" && (
                      <CustomInput
                        name="doctor"
                        placeholder="Search Doctor"
                        type="real-time-user-search"
                        label="Filter by Doctor (In-house)"
                        isPortal
                        value={reportFilters.doctor}
                        onChange={(val: any) => setReportFilters({ ...reportFilters, doctor: val, labDoctor: null })}
                        query={{ type: "doctor" }}
                      />
                    )}
                    {reportFilters.workType === "outside" && (
                      <CustomInput
                        name="labDoctor"
                        placeholder="Search Lab Doctor"
                        type="real-time-search"
                        params={{
                          entityName: "labDoctorStore",
                          functionName: "getLabDoctors",
                          key: "labDoctorName",
                        }}
                        label="Filter by Lab Doctor (Outside)"
                        isPortal
                        value={reportFilters.labDoctor}
                        onChange={(val: any) => setReportFilters({ ...reportFilters, labDoctor: val, doctor: null })}
                      />
                    )}
                  </VStack>
                </Box>
                <Divider />

                {/* Columns Selection Section */}
                <Box>
                  <HStack mb={4} spacing={2}>
                    <Icon as={FiColumns} color="blue.500" />
                    <Text fontWeight="extrabold" fontSize="sm" letterSpacing="wider" color="gray.600">REPORT COLUMNS</Text>
                  </HStack>
                  <VStack spacing={4} align="stretch">
                    <Box bg="gray.50" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                      <VStack align="stretch" spacing={3}>
                        <Text fontSize="xs" color="gray.500">
                          Select the columns you want to include in the report. The order you select them is the order they will appear in the exported file.
                        </Text>
                        <CustomInput
                          name="selectedColumns"
                          type="select"
                          isPortal
                          isMulti
                          options={defaultLabWorkCols}
                          value={reportFilters.selectedColumns.map(val => defaultLabWorkCols.find(c => c.value === val))}
                          onChange={(val: any) => {
                            const newCols = val ? val.map((v: any) => v.value) : [];
                            setReportFilters({
                              ...reportFilters,
                              selectedColumns: newCols
                            });
                            localStorage.setItem("labReportColumns", JSON.stringify(newCols));
                          }}
                        />
                      </VStack>
                    </Box>
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
                  leftIcon={<FiList />}
                  onClick={() => handleDownloadReport(true)}
                  isLoading={isDownloading}
                  px={8}
                  borderRadius="xl"
                  shadow="md"
                >
                  Preview Report
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* View Drawer */}
        <Drawer isOpen={isViewOpen} onClose={onViewClose} size="full" placement="right">
          <DrawerOverlay />
          <DrawerContent maxW="75%">
            <DrawerHeader borderBottomWidth="1px" bg="blue.600" color="white">
              Lab Order Details
            </DrawerHeader>
            <DrawerCloseButton color="white" />
            <DrawerBody p={0}>
              {selectedLabWork && <LabSheetView data={selectedLabWork} />}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Report Preview Drawer */}
        <ReportPreviewDrawer
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Lab Work Report Preview"
          columns={previewData?.columns || []}
          rows={previewData?.rows || []}
          onDownload={() => handleDownloadReport(false)}
          isDownloading={isDownloading}
        />
      </Box>
    </Box>
  );
});

export default LabWorkTable;

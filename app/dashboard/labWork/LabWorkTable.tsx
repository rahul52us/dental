"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
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
  DrawerCloseButton,
  VStack,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiList, FiHome, FiGlobe } from "react-icons/fi";

import stores from "../../store/stores";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import LabSheet from "./component/LabSheet";
import LabSheetView from "./component/LabSheetView";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import useDebounce from "../../component/config/component/customHooks/useDebounce";

const LabWorkTable = observer(() => {
  const { labWorkStore, labWorkHierarchyStore, auth: { openNotification } } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const [selectedLabWork, setSelectedLabWork] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const searchParams = useSearchParams();

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

  const StatusBadge = ({ status }: { status: string }) => {
    let color = "gray";
    switch (status) {
      case "plan": color = "blue"; break;
      case "sent": color = "orange"; break;
      case "in-progress": color = "purple"; break;
      case "received": color = "teal"; break;
      case "completed": color = "green"; break;
      case "cancelled": color = "red"; break;
    }
    return <Badge colorScheme={color} borderRadius="full" px={2}>{status.toUpperCase()}</Badge>;
  };

  const columns = [
    { headerName: "S.No.", key: "sno", props: { row: { textAlign: "center" } } },
    {
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
    },
    {
      headerName: "Patient",
      key: "patient",
      function: (dt: any) => dt.patient?.name || dt.patientNameManual || "N/A",
    },
    {
      headerName: "Doctor",
      key: "doctor",
      function: (dt: any) => dt.primaryDoctor?.name || dt.doctorNameManual || "N/A",
    },
    {
      headerName: "Selected Works",
      key: "works",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={1}>
            {dt.selectedWorks?.map((w: any, i: number) => {
              const fullPath = labWorkHierarchyStore.getNamePath(w.selections);
              return (
                <Box key={i} mb={1}>
                  <Tooltip label={fullPath} placement="top" hasArrow borderRadius="md">
                    <Text fontSize="xs" fontWeight="700" color="blue.700" noOfLines={1} maxW="200px">
                      • {fullPath}
                    </Text>
                  </Tooltip>
                  <HStack spacing={2} ml={3}>
                      {w.teethNumbers?.length > 0 && (
                        <Tooltip label={`Teeth: ${w.teethNumbers.join(", ")}`}>
                            <Badge variant="subtle" colorScheme="gray" fontSize="9px">{w.teethNumbers.join(",")}</Badge>
                        </Tooltip>
                      )}
                      {w.shadeValue && (
                        <Tooltip label={`Shade: ${w.shadeValue}`}>
                            <Badge variant="subtle" colorScheme="orange" fontSize="9px">S: {w.shadeValue}</Badge>
                        </Tooltip>
                      )}
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        ),
      },
    },
    {
      headerName: "Lab",
      key: "lab",
      function: (dt: any) => dt.lab?.name || dt.labNameManual || "In-house",
    },
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
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => <StatusBadge status={dt.status} />,
      },
    },
    {
      headerName: "Delay",
      key: "delay",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text color={dt.delay > 0 ? "red.500" : "green.500"} fontWeight="bold">
            {dt.delay > 0 ? `+${dt.delay} days` : "On Time"}
          </Text>
        ),
      },
    },
    {
      headerName: "Price",
      key: "price",
      function: (dt: any) => `₹${dt.price || 0}`,
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
    },
  ];

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
        <Tabs 
          index={activeTab} 
          onChange={handleTabChange} 
          variant="unstyled" 
          mb={2}
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

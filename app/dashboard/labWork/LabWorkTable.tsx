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
} from "@chakra-ui/react";
import stores from "../../store/stores";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import LabSheet from "./component/LabSheet";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import useDebounce from "../../component/config/component/customHooks/useDebounce";

const LabWorkTable = observer(() => {
  const { labWorkStore, auth: { openNotification } } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      const workType = activeTab === 0 ? undefined : (activeTab === 1 ? "in-house" : "outside");
      const query: any = { page, limit, workType };
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
  }, [currentPage, activeTab, debouncedSearchQuery, fetchLabWorks]);

  const handleAdd = () => {
    setSelectedLabWork(null);
    onOpen();
  };

  const handleEdit = (data: any) => {
    setSelectedLabWork(data);
    onOpen();
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
      function: (dt: any) => dt.patient?.name || "N/A",
    },
    {
      headerName: "Selected Works",
      key: "works",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={0}>
            {dt.selectedWorks?.map((w: any, i: number) => (
              <VStack key={i} align="start" spacing={0} mb={1}>
                {w.selections && w.selections.length > 0 && (
                  <Text fontSize="xs" fontWeight="700">
                    • {w.selections.filter((s: string) => s && !s.startsWith("TXT:")).join(" > ")}
                  </Text>
                )}
                {w.selections && w.selections.some((s: string) => s?.startsWith("TXT:")) && (
                   <Text fontSize="xs" fontStyle="italic" color="gray.600">
                     + {w.selections.find((s: string) => s?.startsWith("TXT:"))?.replace("TXT:", "")}
                   </Text>
                )}
                <HStack spacing={2}>
                    <Text fontSize="10px" color="gray.500">{w.teethNumbers?.join(", ")}</Text>
                    {w.shadeValue && <Text fontSize="10px" color="orange.500">Shade: {w.shadeValue}</Text>}
                </HStack>
              </VStack>
            ))}
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
      <Box>
      <CustomTable
        title="Lab Sheets & Work Orders"
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
            {selectedLabWork ? "Update Lab Order" : "New Lab Order"}
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
      </Box>
    </Box>
  );
});

export default LabWorkTable;

"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Tooltip,
  IconButton,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FiClock, FiActivity, FiEye, FiEdit } from "react-icons/fi";
import stores from "../../../../store/stores";
import { formatDateTime } from "../../../../component/config/utils/dateUtils";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import LabSheetView from "../../../labWork/component/LabSheetView";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import LabSheet from "../../../labWork/component/LabSheet";

interface PatientLabWorkHistoryProps {
  patientDetails: any;
}

const PatientLabWorkHistory = observer(({ patientDetails }: PatientLabWorkHistoryProps) => {
  const { labWorkStore, labWorkHierarchyStore, auth: { openNotification } } = stores;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWork, setSelectedWork] = useState<{ open: boolean, type: "view" | "edit", data: any }>({
    open: false,
    type: "view",
    data: null
  });

  const fetchRecords = useCallback(() => {
    labWorkStore.getAllLabWorks({
      patient: patientDetails?._id,
      page: currentPage,
      limit: tablePageLimit
    }).catch((err: any) => {
      openNotification({
        type: "error",
        title: "Fetch Failed",
        message: err?.message,
      });
    });
  }, [labWorkStore, patientDetails?._id, currentPage, openNotification]);

  useEffect(() => {
    fetchRecords();
    labWorkHierarchyStore.getAllHierarchies();
  }, [fetchRecords]);

  const columns = [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Work Details",
      key: "works",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={1}>
            {dt.selectedWorks?.map((w: any, i: number) => {
              const fullPath = labWorkHierarchyStore.getNamePath(w.selections);
              return (
                <Box key={i}>
                  <Tooltip label={fullPath} placement="top" hasArrow borderRadius="md">
                    <Text fontSize="xs" fontWeight="700" color="blue.700" noOfLines={1} maxW="250px">
                      • {fullPath}
                    </Text>
                  </Tooltip>
                  <HStack spacing={2} ml={3}>
                    {w.teethNumbers?.length > 0 && (
                      <Badge variant="subtle" colorScheme="gray" fontSize="9px">T: {w.teethNumbers.join(",")}</Badge>
                    )}
                    {w.shadeValue && (
                      <Badge variant="subtle" colorScheme="orange" fontSize="9px">S: {w.shadeValue}</Badge>
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
      headerName: "Lab / Doctor",
      key: "details",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" fontWeight="bold">Lab: {dt.lab?.name || dt.labNameManual || "In-house"}</Text>
            <Text fontSize="xs" color="gray.500">Dr. {dt.primaryDoctor?.name || dt.primaryDoctor?.labDoctorName || dt.doctorNameManual || "N/A"}</Text>
          </VStack>
        ),
      },
    },
    {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => {
          let color = "blue";
          const s = dt.status?.toLowerCase();
          if (s === "plan") color = "blue";
          else if (s === "sent") color = "orange";
          else if (s === "received") color = "teal";
          else if (s === "completed") color = "green";
          else if (s === "cancelled") color = "red";
          return <Badge colorScheme={color} borderRadius="full" px={2}>{dt.status?.toUpperCase()}</Badge>;
        },
      },
    },
    {
      headerName: "Timeline",
      key: "timeline",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="xs">Sent: {dt.sendDate ? formatDateTime(dt.sendDate).split(",")[0] : "-"}</Text>
            <Text fontSize="xs" color="red.500">Due: {dt.dueDate ? formatDateTime(dt.dueDate).split(",")[0] : "-"}</Text>
          </VStack>
        ),
      },
    },
    {
      headerName: "Actions",
      key: "actions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <HStack spacing={2}>
            <IconButton
              size="xs"
              variant="ghost"
              icon={<FiEye />}
              onClick={() => setSelectedWork({ open: true, type: "view", data: dt })}
              aria-label="View"
            />
            <IconButton
              size="xs"
              variant="ghost"
              icon={<FiEdit />}
              onClick={() => setSelectedWork({ open: true, type: "edit", data: dt })}
              aria-label="Edit"
            />
          </HStack>
        ),
      },
    },
  ];

  return (
    <Box p={4} h="full">
      {labWorkStore.loading && labWorkStore.labWorks.length === 0 ? (
        <Center py={20}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : (
        <CustomTable
          title="Laboratory History"
          loading={labWorkStore.loading}
          data={labWorkStore.labWorks.map((item, index) => ({
            ...item,
            sno: (currentPage - 1) * tablePageLimit + index + 1,
          }))}
          columns={columns}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: true,
                text: "New Lab Order",
                function: () => setSelectedWork({ open: true, type: "edit", data: { workType: "in-house", patient: patientDetails } })
              }
            },
            pagination: {
              show: true,
              onClick: setCurrentPage,
              currentPage: currentPage,
              totalPages: Math.ceil(labWorkStore.totalCount / tablePageLimit),
            },
          }}
        />
      )}

      {/* View Detail Drawer */}
      <CustomDrawer
        open={selectedWork.open && selectedWork.type === "view"}
        close={() => setSelectedWork({ ...selectedWork, open: false })}
        title="Lab Order Details"
        width="60vw"
      >
        {selectedWork.data && <LabSheetView data={selectedWork.data} />}
      </CustomDrawer>

      {/* Edit Drawer */}
      <CustomDrawer
        open={selectedWork.open && selectedWork.type === "edit"}
        close={() => setSelectedWork({ ...selectedWork, open: false })}
        title="Edit Lab Order"
        width="80vw"
      >
        {selectedWork.data && (
          <LabSheet
            initialData={selectedWork.data}
            onClose={() => setSelectedWork({ ...selectedWork, open: false })}
            onSuccess={() => {
              fetchRecords();
              setSelectedWork({ ...selectedWork, open: false });
            }}
          />
        )}
      </CustomDrawer>
    </Box>
  );
});

export default PatientLabWorkHistory;

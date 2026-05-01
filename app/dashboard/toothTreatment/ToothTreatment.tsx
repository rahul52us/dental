"use client";
import { Box, Text, Badge, HStack, Circle, VStack, SimpleGrid, IconButton, Flex, Input, Button, Heading, Icon, Tooltip, Divider, Spinner, Center } from "@chakra-ui/react";

import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import CustomDrawer from "../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import stores from "../../store/stores";
import Index from "../../component/common/TeethModel/DentalChartComponent";
import { PatientHeader } from "../../component/common/TeethModel/DentalChartComponent/component/PatientHeader";
import TreatmentDetailsView from "./element/TreatmentDetailsView";
import { FiGrid, FiList, FiPlus, FiEye, FiEdit3, FiSearch, FiActivity, FiTrash2 } from "react-icons/fi";
import { FaTooth } from "react-icons/fa";
import Pagination from "../../component/config/component/pagination/Pagination";
import WorkDoneForm from "../workDone/component/WorkDoneForm";
import WorkDoneList from "../workDone/component/WorkDoneList";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { FiCheckCircle } from "react-icons/fi";




const TreatmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    toothTreatmentStore: { getToothTreatments, toothTreatment, deleteToothTreatment },
    auth: { openNotification, userType },
  } = stores;

  const [openView, setOpenView] = useState({ open: false, data: null });
  const [isTableView, setIsTableView] = useState<"table" | "card">("card");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openReportModal, setOpenReportModal] = useState<any>({
    open: false,
    type: "add",
    data: null
  });
  const [openWorkDone, setOpenWorkDone] = useState({ open: false, data: null as any });


  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [complaintTypeFilter, setComplaintTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllRecords = useCallback(
    ({ page = currentPage, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      if (isPatient && patientDetails) {
        query.patientId = patientDetails?._id;
      }

      if (complaintTypeFilter !== "all") {
        query.complaintType = complaintTypeFilter;
      }

      if (statusFilter !== "all") {
        query.status = statusFilter;
      }

      getToothTreatments(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to get treatment",
          message: err?.message,
        });
      });
    },
    [
      debouncedSearchQuery,
      getToothTreatments,
      openNotification,
      currentPage,
      patientDetails,
      complaintTypeFilter,
      statusFilter,
    ]
  );

  useEffect(() => {
    applyGetAllRecords({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, complaintTypeFilter, statusFilter, applyGetAllRecords]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setComplaintTypeFilter("all");
    setStatusFilter("all");
    applyGetAllRecords({ page: 1, reset: true });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteToothTreatment(id);
        openNotification({
          type: "success",
          title: "Record Deleted",
          message: "Treatment record has been successfully removed."
        });
        applyGetAllRecords({ page: currentPage });
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Delete Failed",
          message: err?.message || "Something went wrong"
        });
      }
    }
  };


  /* ---------------- Patient Column ---------------- */
  const patientColumn = {
    headerName: "Patient",
    key: "patientName",
    metaData: {
      component: (dt: any) => (
        <Box>
          <Text fontWeight="medium">{dt?.patientName || "--"}</Text>
        </Box>
      ),
    },
    props: { row: { textAlign: "center" } },
  };

  /* ---------------- Table Columns ---------------- */
  const ContactTableColumn = [
    {
      headerName: "Tooth",
      key: "toothFDI",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text fontSize="sm" fontWeight="bold">{dt?.toothFDI || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "System",
      key: "toothNotation",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
              {(dt?.toothNotation || "FDI").toUpperCase()}
            </Badge>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {dt?.toothName || ""}
            </Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    ...(!isPatient ? [patientColumn] : []),

    {
      headerName: "Doctor",
      key: "doctorName",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text>{dt?.doctorName || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Examining Doctor",
      key: "examiningDoctorName",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text>{dt?.examiningDoctorName || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Complaint Type",
      key: "complaintType",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Badge
              colorScheme={
                dt?.complaintType?.toUpperCase() === "CHIEF COMPLAINT" ? "red" :
                  dt?.complaintType?.toUpperCase() === "OTHER FINDING" ? "orange" :
                    dt?.complaintType?.toUpperCase() === "EXISTING FINDING" ? "green" : "gray"
              }
              variant="subtle"
              borderRadius="full"
              px={2}
            >
              {dt?.complaintType || "--"}
            </Badge>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Est Min",
      key: "estimateMin",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="bold" color="blue.600">₹{dt?.estimateMin || 0}</Text>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Est Max",
      key: "estimateMax",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="bold" color="blue.600">₹{dt?.estimateMax || 0}</Text>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case "scheduled":
                return "blue";
              case "in-progress":
                return "yellow";
              case "completed":
                return "green";
              case "cancelled":
                return "red";
              case "shift":
                return "purple";
              case "no-show":
                return "gray";
              case "arrived":
                return "green";
              default:
                return "gray";
            }
          };

          return (
            <Box
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
              textTransform="capitalize"
              bg={`${getStatusColor(dt.status)}.100`}
              color={`${getStatusColor(dt.status)}.700`}
              display="inline-block"
            >
              {dt.status?.replace("-", " ") || "—"}
            </Box>
          );
        },
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },

    {
      headerName: "Treatment Date",
      key: "treatmentDate",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{formatDate(dt?.treatmentDate)}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },

    {
      headerName: "Created By",
      key: "createdBy",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text>{dt?.createdBy?.name || "--"}</Text>
            <Text fontSize="xs" color="gray.500">
              {dt?.createdBy?.code || ""}
            </Text>
          </Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },

    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  const subTitle = patientDetails?.name;

  const renderCard = (dt: any) => {
    const statusColors: any = {
      scheduled: "blue",
      "in-progress": "yellow",
      completed: "green",
      cancelled: "red",
      planned: "gray",
    };
    const color = statusColors[dt.status?.toLowerCase()] || "gray";

    return (
      <Box
        key={dt._id}
        bg="white"
        p={5}
        borderRadius="3xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
        transition="all 0.2s"
        position="relative"
        _hover={{ shadow: "md", transform: "translateY(-2px)", borderColor: "blue.200" }}
      >
        <Flex align="start" gap={6}>
          {/* Left side: Tooth Identifier Box */}
          <VStack
            minW="75px"
            h="75px"
            bg="blue.50"
            borderRadius="2xl"
            border="1px solid"
            borderColor="blue.100"
            justify="center"
            spacing={0}
          >
            <Text fontSize="10px" fontWeight="800" color="blue.400" letterSpacing="wider">TOOTH</Text>
            <Text fontSize="2xl" fontWeight="900" color="blue.700" lineHeight="1">{dt.toothFDI || dt.tooth || "??"}</Text>
            {(() => {
              const tId = String(dt.toothFDI || dt.tooth || "");
              const id = parseInt(tId);
              let pos = dt.position;
              let side = dt.side;

              if (!pos || !side) {
                if (id >= 11 && id <= 18) { pos = "upper"; side = "right"; }
                else if (id >= 21 && id <= 28) { pos = "upper"; side = "left"; }
                else if (id >= 31 && id <= 38) { pos = "lower"; side = "left"; }
                else if (id >= 41 && id <= 48) { pos = "lower"; side = "right"; }
                else if (id >= 51 && id <= 55) { pos = "upper"; side = "right"; }
                else if (id >= 61 && id <= 65) { pos = "upper"; side = "left"; }
                else if (id >= 71 && id <= 75) { pos = "lower"; side = "left"; }
                else if (id >= 81 && id <= 85) { pos = "lower"; side = "right"; }
              }

              return (pos && side) ? (
                <Text fontSize="9px" fontWeight="1000" color="blue.500" textTransform="uppercase" mt={1}>
                  {pos} {side}
                </Text>
              ) : null;
            })()}
          </VStack>

          {/* Middle part: Details */}
          <VStack align="start" spacing={2} flex={1}>
            <Text fontSize="11px" fontWeight="900" color="gray.400" letterSpacing="widest" textTransform="uppercase">
              {formatDate(dt.treatmentDate)}
            </Text>

            <HStack spacing={2}>
              {dt.complaintType && (
                <Badge colorScheme="red" variant="subtle" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                  {dt.complaintType?.toUpperCase()}
                </Badge>
              )}
              <Badge colorScheme={color} variant="subtle" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                {dt.status?.toUpperCase() || "PENDING"}
              </Badge>
              {(dt.estimateMin || dt.estimateMax) && (
                <Badge colorScheme="blue" variant="outline" borderRadius="full" px={3} fontSize="14px" fontWeight="800">
                  ₹{dt.estimateMin || 0} - ₹{dt.estimateMax || 0}
                </Badge>
              )}
            </HStack>



            {dt.notes && (
              <Box
                bg="blue.50"
                p={3}
                borderRadius="xl"
                border="1px solid"
                borderColor="blue.100"
                w="full"
                mt={1}
              >
                <Text fontSize="lg" fontWeight="bold" color="gray.800" fontStyle="italic" noOfLines={2}>
                  {dt.notes}
                </Text>
              </Box>
            )}

            <Text fontSize="lg" fontWeight="800" color="gray.800" noOfLines={2} pt={1}>
              {dt.treatmentPlan || "General Consultation"}
            </Text>
          </VStack>

          {/* Right side: Floating Actions */}
          <HStack
            spacing={1}
            bg="gray.50"
            p={2}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            position="absolute"
            top={4}
            right={4}
          >
            <Tooltip label="Add Work Done">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="orange"
                icon={<FiCheckCircle />}
                aria-label="Work Done"
                onClick={() => {
                  setOpenWorkDone({ open: true, data: dt });
                }}
              />
            </Tooltip>
            <Tooltip label="View Treatment">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="green"
                icon={<FaTooth />}
                aria-label="Add"
                onClick={() => {
                  const { _id, ...rest } = dt;
                  setOpenReportModal({ open: true, type: "add", data: { ...rest, _isContextualAdd: true } });
                }}
              />
            </Tooltip>
            <Tooltip label="View Treatment">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="blue"
                icon={<FiEye />}
                aria-label="View"
                onClick={() => setOpenView({ open: true, data: dt })}
              />
            </Tooltip>
            <Tooltip label="Edit Record">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="blue"
                icon={<FiEdit3 />}
                aria-label="Edit"
                onClick={() => setOpenReportModal({ open: true, type: "edit", data: dt })}
              />
            </Tooltip>
            <Tooltip label="Delete Record">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete"
                onClick={() => handleDelete(dt._id)}
                display={["admin", "superAdmin"].includes(userType) ? "flex" : "none"}
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Box>
    );
  };


  return (
    <>
      <Box>

        {/* Custom Dashboard Header */}
        <Flex
          bg="white"
          p={4}
          borderRadius="2xl"
          shadow="xs"
          border="1px solid"
          borderColor="gray.100"
          mb={4}
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={4}
        >
          <VStack align="start" spacing={0}>
            <Heading size="md" color="blue.600">Treatment Records</Heading>
            {subTitle && <Text fontSize="xs" color="gray.500" fontWeight="bold">PATIENT: {subTitle.toUpperCase()}</Text>}
          </VStack>

          <HStack spacing={4} flex={1} maxW="850px" justify="flex-end">
            <HStack bg="gray.50" px={3} borderRadius="full" border="1px solid" borderColor="gray.200" flex={1}>
              <Icon as={FiSearch} color="gray.400" />
              <Input
                placeholder="Search clinical records..."
                variant="unstyled"
                py={2}
                fontSize="sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </HStack>

            <Box w="220px">
              <select
                value={complaintTypeFilter}
                onChange={(e) => setComplaintTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '16px',
                  padding: '0 12px',
                  fontSize: '14px',
                  border: '1px solid #E2E8F0',
                  background: 'white',
                  fontWeight: '700',
                  color: '#4A5568',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Complaints</option>
                <option value="CHIEF COMPLAINT">CHIEF COMPLAINT</option>
                <option value="OTHER FINDING">OTHER FINDING</option>
                <option value="EXISTING FINDING">EXISTING FINDING</option>
              </select>
            </Box>

            <Box w="220px">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '16px',
                  padding: '0 12px',
                  fontSize: '14px',
                  border: '1px solid #E2E8F0',
                  background: 'white',
                  fontWeight: '700',
                  color: '#4A5568',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="shift">Shift</option>
                <option value="no-show">No Show</option>
                <option value="scheduled">Scheduled</option>
                <option value="arrived">Arrived</option>
              </select>
            </Box>

            <HStack bg="gray.100" p={1} borderRadius="xl">
              <IconButton
                size="sm"
                variant={isTableView === "card" ? "solid" : "ghost"}
                colorScheme={isTableView === "card" ? "blue" : "gray"}
                icon={<FiGrid />}
                onClick={() => setIsTableView("card")}
                aria-label="Grid View"
              />
              <IconButton
                size="sm"
                variant={isTableView === "table" ? "solid" : "ghost"}
                colorScheme={isTableView === "table" ? "blue" : "gray"}
                icon={<FiList />}
                onClick={() => setIsTableView("table")}
                aria-label="List View"
              />
            </HStack>

            <Button
              colorScheme="blue"
              leftIcon={<FiPlus />}
              borderRadius="xl"
              size="sm"
              onClick={() => setOpenReportModal({ open: true, type: "add" })}
              display={["admin", "superAdmin"].includes(userType) ? "flex" : "none"}
            >
              Add Record
            </Button>
          </HStack>
        </Flex>

        {isTableView === "table" ? (
          <CustomTable
            data={toothTreatment?.data || []}
            columns={ContactTableColumn}
            loading={toothTreatment?.loading}
            actions={{
              actionBtn: {
                editKey: {
                  showEditButton: ["admin", "superAdmin"].includes(userType),
                  function: (dt: any) => setOpenReportModal({ open: true, type: "edit", data: dt }),
                },
                viewKey: {
                  showViewButton: true,
                  function: (dt: any) => setOpenView({ open: true, data: dt }),
                },
              },
              pagination: {
                show: true,
                onClick: handleChangePage,
                currentPage,
                totalPages: toothTreatment?.totalPages,
              }
            }}
          />
        ) : (
          <VStack align="stretch" spacing={6}>
            {toothTreatment?.loading ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
                  <Text color="gray.500" fontWeight="bold">Fetching treatment history...</Text>
                </VStack>
              </Center>
            ) : (
              <>
                <SimpleGrid columns={{ base: 1, md: 1, lg: 1 }} spacing={6}>
                  {toothTreatment?.data?.map((dt: any) => renderCard(dt))}
                </SimpleGrid>

                {toothTreatment?.totalPages > 1 && (
                  <Flex justify="center" pt={4}>
                    <Pagination
                      currentPage={currentPage}
                      onPageChange={handleChangePage}
                      totalPages={toothTreatment?.totalPages}
                    />
                  </Flex>
                )}

                {!toothTreatment?.loading && toothTreatment?.data?.length === 0 && (
                  <VStack py={20} bg="white" borderRadius="3xl" border="1px dashed" borderColor="gray.200">
                    <Icon as={FiActivity} fontSize="40px" color="gray.200" />
                    <Text fontWeight="bold" color="gray.400">No matching records found</Text>
                  </VStack>
                )}
              </>
            )}
          </VStack>
        )}
      </Box>

      <CustomDrawer
        width={"80vw"}
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title={<PatientHeader title="Clinical Procedure Details" patient={openView.data?.patient || patientDetails} />}
      >
        <TreatmentDetailsView data={openView.data} />
      </CustomDrawer>
      {/* Drawer */}
      <CustomDrawer
        width="90vw"
        open={openReportModal.open}
        close={() => setOpenReportModal({ open: false, type: "add" })}
        title={<PatientHeader title="Treatment Selection" patient={patientDetails} />}
      >
        <Index
          appointments={toothTreatment}
          isPatient={isPatient}
          patientDetails={{ ...patientDetails, editData: openReportModal.data, applyGetAllRecords }}
          closeWizard={() => setOpenReportModal({ open: false, type: "add", data: null })}
        />
      </CustomDrawer>

      {/* Work Done Drawer */}
      {openWorkDone.open && (
        <CustomDrawer
          open={openWorkDone.open}
          close={() => setOpenWorkDone({ open: false, data: null })}
          title={`Work Done: ${openWorkDone.data?.patient?.name || patientDetails?.name || "Patient"}`}
          width={{ base: "100%", md: "90%" }}
        >
          <Box px={6}>
            <Tabs variant="line" colorScheme="blue">
              <TabList mb="1em">
                <Tab
                  fontWeight="bold"
                  fontSize="14px"
                  px={6}
                  _selected={{
                    color: "blue.700",
                    borderColor: "blue.600",
                    borderBottomWidth: "3px",
                    bg: "blue.100",
                    borderTopRadius: "lg"
                  }}
                >
                  Create New Entry
                </Tab>
                <Tab
                  fontWeight="bold"
                  fontSize="14px"
                  px={6}
                  _selected={{
                    color: "blue.700",
                    borderColor: "blue.600",
                    borderBottomWidth: "3px",
                    bg: "blue.100",
                    borderTopRadius: "lg"
                  }}
                >
                  Previous work done
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <WorkDoneForm
                    patientDetails={openWorkDone.data?.patient || patientDetails}
                    treatmentDetails={openWorkDone.data}
                    onSuccess={() => {
                      setOpenWorkDone({ open: false, data: null });
                      applyGetAllRecords({ page: currentPage });
                    }}
                  />
                </TabPanel>
                <TabPanel p={0}>
                  <WorkDoneList
                    patientDetails={openWorkDone.data?.patient || patientDetails}
                    treatmentId={openWorkDone.data?._id}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </CustomDrawer>
      )}
    </>
  );
});


export default TreatmentList;
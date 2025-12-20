import { CalendarIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { GiPsychicWaves } from "react-icons/gi";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { genderOptions } from "../../../../config/constant";
import { copyToClipboard } from "../../../../config/utils/function";
import stores from "../../../../store/stores";
import AppointmentList from "../../../appointments/Appointments";
import LineItems from "../../LineItems/LineItems";
import ViewDoctor from "./ViewPatient";

const PatientTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;
  const [openAppointDetails, setOpenAppointmentDetails] = useState({
    open: false,
    data: null,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedTherapist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // for lineItems drawer
  const [lineItemDrawer, setLineItemDrawer] = useState({
    isOpen: false,
    data: null,
  });

  const applyGetAllTherapists = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit, type: "patient" };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getAllUsers(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to get patient",
          message: err?.message,
        });
      });
    },
    [debouncedSearchQuery, getAllUsers, openNotification]
  );

  useEffect(() => {
    applyGetAllTherapists({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllTherapists]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllTherapists({ reset: true });
  };

  const handleRowClick = (user: any) => {
    setSelectedTherapist(user);
    onOpen();
  };

  const TherapistTableColumns = [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Pic",
      key: "user",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Avatar src={dt.pic?.url} name={dt.pic?.name} size="sm" />
          </Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Name",
      key: "name",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Code",
      key: "code",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Gender",
      key: "gender",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const genderLabel =
            genderOptions.find((option: any) => option.value === dt?.gender)
              ?.label || "--";

          const colorScheme =
            genderLabel === "Male"
              ? "blue"
              : genderLabel === "Female"
              ? "pink"
              : "gray";

          return (
            <Box m={1} textAlign="center" minW="120px">
              <Badge
                colorScheme={colorScheme}
                variant="solid"
                px={4}
                py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight="semibold"
                boxShadow="sm"
              >
                {genderLabel}
              </Badge>
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
      headerName: "Mobile No.",
      key: "mobile",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const number =
            dt.phones?.find((it: any) => it.primary)?.number || "--";
          const displayNumber =
            number !== "--" ? `•••${number.slice(-4)}` : "--";

          return (
            <Tooltip label={`Click to copy: ${number}`} hasArrow>
              <Box
                m={1}
                textAlign="center"
                cursor={number !== "--" ? "pointer" : "default"}
                onClick={() => copyToClipboard(number)}
              >
                {displayNumber}
              </Box>
            </Tooltip>
          );
        },
      },
      props: {
        row: { minW: 10, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
   {
  headerName: "Appointments",
  key: "appointment",
  type: "component",
  metaData: {
    component: (dt: any) => (
      <Badge
        as="button"
        px={4}
        py={2}
        borderRadius="lg"
        display="inline-flex"
        alignItems="center"
        gap={2}
        fontWeight="600"
        fontSize="sm"
        colorScheme="blue"
        cursor="pointer"
        transition="all 0.2s ease"
        _hover={{
          bg: "blue.600",
          transform: "translateY(-1px)",
        }}
        _active={{
          bg: "blue.700",
          transform: "scale(0.96)",
        }}
        onClick={() =>
          setOpenAppointmentDetails({ open: true, data: dt })
        }
      >
        <CalendarIcon boxSize={4} />
        Appointment
      </Badge>
    ),
  },
  props: {
    row: { minW: 12, textAlign: "center" },
    column: { textAlign: "center" },
  },
},

    // {
    //   headerName: "Orders",
    //   key: "orders",
    //   type: "component",
    //   metaData: {
    //     component: (dt: any) => (
    //       <Badge
    //         as="button"
    //         px={3}
    //         py={1}
    //         borderRadius="md"
    //         colorScheme="blue"
    //         cursor="pointer"
    //         onClick={() => setLineItemDrawer({ isOpen: true, data: dt })}
    //       >
    //         View
    //       </Badge>
    //     ),
    //   },
    //   props: {
    //     row: { minW: 10, textAlign: "center" },
    //     column: { textAlign: "center" },
    //   },
    // },
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

  return (
    <>
      <Box p={4}>
        <CustomTable
          title="Patient"
          data={
            user.data?.map((t: any, index: number) => {
              return {
                ...t,
                ...t.profileDetails?.personalInfo,
                refrenceBy: t.refrenceBy,
                sno: index + 1,
              };
            }) || []
          }
          columns={TherapistTableColumns}
          actions={{
            actionBtn: {
              addKey: { showAddButton: true, function: onAdd },
              editKey: { showEditButton: true, function: onEdit },
              viewKey: { showViewButton: true, function: handleRowClick },
              deleteKey: { showDeleteButton: true, function: onDelete },
            },
            search: {
              show: true,
              searchValue: searchQuery,
              onSearchChange: (e: any) => setSearchQuery(e.target.value),
            },
            resetData: {
              show: false,
              text: "Reset Data",
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: user.totalPages || 1,
            },
          }}
          loading={user.loading}
        />

        {/* Profile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent minW={{ md: "80vw", sm: "100vw" }}>
            <DrawerCloseButton />
            <DrawerHeader
              bgGradient="linear(to-r, blue.400, purple.400)"
              color="white"
            >
              <Flex align="center" gap={3}>
                <GiPsychicWaves size="24px" />
                User Profile
              </Flex>
            </DrawerHeader>

            {selectedUser && (
              <DrawerBody>
                <ViewDoctor
                  user={{
                    ...selectedUser.profileDetails?.personalInfo,
                    ...selectedUser,
                  }}
                />
              </DrawerBody>
            )}
          </DrawerContent>
        </Drawer>
      </Box>

      {/* LineItems Drawer */}
      {lineItemDrawer.isOpen && (
        <CustomDrawer
          loading={false}
          open={lineItemDrawer.isOpen}
          width={"85vw"}
          close={() => setLineItemDrawer({ isOpen: false, data: null })}
          title={"Orders"}
        >
          <LineItems data={lineItemDrawer.data} />
        </CustomDrawer>
      )}

      {openAppointDetails.open && (
        <CustomDrawer
          width="92%"
          title="Appointments"
          open={openAppointDetails.open}
          close={() => setOpenAppointmentDetails({ open: false, data: null })}
        >
          <AppointmentList
            isPatient={true}
            patientDetails={openAppointDetails?.data}
          />
        </CustomDrawer>
      )}
    </>
  );
});

export default PatientTable;
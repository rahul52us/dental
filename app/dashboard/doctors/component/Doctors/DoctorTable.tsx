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
  IconButton,
  Text,
  Button,
  Tooltip,
  useDisclosure,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { FiPower, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import FormModel from "../../../../component/common/FormModel/FormModel";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { GiPsychicWaves } from "react-icons/gi";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { genderOptions } from "../../../../config/constant";
import { copyToClipboard } from "../../../../config/utils/function";
import stores from "../../../../store/stores";
import ViewDoctor from "./ViewDoctor";

const DoctorTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [statusUser, setStatusUser] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<any>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllTherapists = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false, isActive = isActiveFilter }) => {
      const query: any = { page, limit, type: "doctor", isActive };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getAllUsers(query)
        .then(() => { })
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to get therapists",
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getAllUsers, openNotification]
  );

  useEffect(() => {
    applyGetAllTherapists({ page: currentPage, limit: tablePageLimit, isActive: isActiveFilter });
  }, [currentPage, debouncedSearchQuery, isActiveFilter, applyGetAllTherapists]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setIsActiveFilter(true);
    applyGetAllTherapists({ reset: true, isActive: true });
  };

  const handleRowClick = (user: any) => {
    setSelectedTherapist(user);
    onOpen();
  };

  const handleStatusClick = (user: any) => {
    setStatusUser(user);
    onStatusOpen();
  };

  const confirmStatusChange = async () => {
    try {
      setStatusLoading(true);
      const res = await stores.userStore.updateUser({
        ...statusUser,
        is_active: !statusUser.is_active,
      });
      if (res.data.status === "success") {
        openNotification({
          type: "success",
          title: "Status Updated",
          message: `${statusUser.name}'s status has been updated successfully.`,
        });
        applyGetAllTherapists({ page: currentPage, isActive: isActiveFilter });
        onStatusClose();
      }
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Update Failed",
        message: err?.message || "Failed to update status",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const TherapistTableColumns = [
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
      key: "gender",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const genderLabel =
            genderOptions.find((opt: any) => opt.value === dt?.gender)?.label ||
            "--";

          const colorScheme =
            genderLabel === "Male"
              ? "blue"
              : genderLabel === "Female"
                ? "pink"
                : "gray";

          return (
            <Badge
              colorScheme={colorScheme}
              variant="solid"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {dt?.name}
            </Badge>
          );
        },
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: "Code",
      key: "code",
      props: { row: { textAlign: "center" } },
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
      headerName: "Status",
      key: "is_active",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex justify="center" align="center" gap={2}>
            <Badge colorScheme={dt.is_active ? "green" : "red"} variant="subtle" px={2} borderRadius="full">
              {dt.is_active ? "Active" : "Inactive"}
            </Badge>
            <Tooltip label={dt.is_active ? "Deactivate" : "Activate"}>
              <IconButton
                aria-label="Toggle Status"
                icon={<FiPower />}
                size="xs"
                colorScheme={dt.is_active ? "red" : "green"}
                variant="ghost"
                onClick={() => handleStatusClick(dt)}
              />
            </Tooltip>
          </Flex>
        ),
      },
      props: {
        row: { textAlign: "center" },
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

  return (
    <Box p={1}>
      <CustomTable
        title="Doctors"
        data={
          user.data?.map((t: any, index: number) => {
            return {
              ...t,
              ...t.profileDetails?.personalInfo,
              sno: index + 1,
            };
          }) || []
        }
        columns={TherapistTableColumns}
        actions={{
          actionBtn: {
            resetData: false,
            addKey: {
              showAddButton: true,
              function: () => {
                onAdd();
              },
            },
            editKey: {
              showEditButton: true,
              function: (e: any) => {
                onEdit(e);
              },
            },
            viewKey: {
              showViewButton: true,
              function: (e: any) => {
                handleRowClick(e);
              },
            },
            deleteKey: {
              showDeleteButton: true,
              function: (e: any) => {
                onDelete(e);
              },
            },
          },
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
            resetData: {
              show: true,
              text: "Reset Data",
              function: resetTableData,
            },
            multidropdown: {
              show: true,
              title: "Filter Status",
              dropdowns: [
                {
                  label: "Status",
                  options: [
                    { label: "Active", value: true },
                    { label: "Inactive", value: false },
                    { label: "All", value: "all" },
                  ],
                },
              ],
              onDropdownChange: (selected: any, label: string) => {
                if (label === "Status") {
                  // Since MultiDropdown uses isMulti=true, selected will be an array
                  // But we only want the last selected or we can just take the first
                  const val = selected?.length > 0 ? selected[selected.length - 1].value : "all";
                  setIsActiveFilter(val);
                }
              },
              selectedOptions: {
                Status: isActiveFilter === "all" 
                  ? [{ label: "All", value: "all" }] 
                  : (isActiveFilter === true 
                    ? [{ label: "Active", value: true }] 
                    : [{ label: "Inactive", value: false }])
              },
              onApply: () => {
                setCurrentPage(1);
                applyGetAllTherapists({ page: 1, isActive: isActiveFilter });
              },
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

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent minW={{ md: "80vw", sm: "100vw" }}>
          <DrawerCloseButton />
          <DrawerHeader
            bg={stores.themeStore.themeConfig.colors.custom.light.primary}
            color="white"
          >
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              User Profile
            </Flex>
          </DrawerHeader>

          {selectedTherapist && (
            <DrawerBody>
              <ViewDoctor
                doctor={{
                  ...selectedTherapist.profileDetails?.personalInfo,
                  ...selectedTherapist,
                }}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      <FormModel 
        open={isStatusOpen} 
        close={onStatusClose} 
        title="Confirm Status Change"
        isCentered
        size="md"
      >
        <VStack spacing={4} p={4} align="center" textAlign="center">
          <Icon as={FiAlertCircle} w={12} h={12} color={statusUser?.is_active ? "orange.400" : "green.400"} />
          <Box>
            <Text fontSize="lg" fontWeight="medium">
              You are about to {statusUser?.is_active ? "deactivate" : "activate"} 
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {statusUser?.name}
            </Text>
          </Box>
          <Text color="gray.600">
            {statusUser?.is_active 
              ? "Deactivating this user will prevent them from logging in and performing clinical actions." 
              : "Activating this user will restore their access to the clinical dashboard."}
          </Text>
          
          <Flex gap={4} w="full" pt={4}>
            <Button variant="ghost" flex={1} onClick={onStatusClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={statusUser?.is_active ? "orange" : "green"} 
              flex={1}
              onClick={confirmStatusChange}
              isLoading={statusLoading}
              leftIcon={<FiPower />}
            >
              Confirm {statusUser?.is_active ? "Deactivation" : "Activation"}
            </Button>
          </Flex>
        </VStack>
      </FormModel>
    </Box>
  );
});

export default DoctorTable;
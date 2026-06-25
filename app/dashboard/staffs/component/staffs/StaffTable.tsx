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
import FormModel from "../../../../component/common/FormModel/FormModel";
import { FiPower, FiAlertCircle, FiLock } from "react-icons/fi";
import StaffPermissionsModal from "./StaffPermissionsModal";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { GiPsychicWaves } from "react-icons/gi";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { genderOptions } from "../../../../config/constant";
import { copyToClipboard } from "../../../../config/utils/function";
import stores from "../../../../store/stores";
import ViewUser from "./ViewUser";
import { useTranslation } from "react-i18next";

const StaffTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const [selectedUser, setSelectedTherapist] = useState<any>(null);
  const [statusUser, setStatusUser] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { t } = useTranslation();
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [permUser, setPermUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<any>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllTherapists = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false, isActive = isActiveFilter }) => {
      const query: any = { page, limit, type: "staff", isActive };

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
            title: t("staffs.table.failedToGetUsers"),
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
          title: t("staffs.table.statusUpdated"),
          message: t("staffs.table.statusUpdatedDesc", { name: statusUser.name }),
        });
        applyGetAllTherapists({ page: currentPage, isActive: isActiveFilter });
        onStatusClose();
      }
    } catch (err: any) {
      openNotification({
        type: "error",
        title: t("staffs.table.updateFailed"),
        message: err?.message || t("staffs.table.failedToUpdateStatus"),
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const UserTableColumns = [
    {
      headerName: t("staffs.table.sno"),
      key: "sno",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("staffs.table.pic"),
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
      headerName: t("staffs.table.name"),
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
      headerName: t("staffs.table.code"),
      key: "code",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("staffs.table.mobileNo"),
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
      headerName: t("staffs.table.permissions"),
      key: "permissions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={t("staffs.table.managePermissions")}>
            <IconButton
              aria-label={t("staffs.table.managePermissions")}
              icon={<FiLock />}
              size="sm"
              colorScheme="purple"
              variant="ghost"
              borderRadius="xl"
              onClick={() => {
                setPermUser(dt);
                setIsPermOpen(true);
              }}
            />
          </Tooltip>
        ),
      },
      props: {
        row: { textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("staffs.table.status"),
      key: "is_active",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex justify="center" align="center" gap={2}>
            <Badge colorScheme={dt.is_active ? "green" : "red"} variant="subtle" px={2} borderRadius="full">
              {dt.is_active ? t("staffs.table.active") : t("staffs.table.inactive")}
            </Badge>
            <Tooltip label={dt.is_active ? t("staffs.table.deactivate") : t("staffs.table.activate")}>
              <IconButton
                aria-label={t("staffs.table.toggleStatus")}
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
      headerName: t("staffs.table.actions"),
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ].filter(col => {
    if (col.key === 'permissions') return stores.auth.hasPermission('staffs', 'edit');
    if (col.key === 'is_active') return stores.auth.hasPermission('staffs', 'edit');
    return true;
  });

  return (
    <Box p={4}>
      <CustomTable
        title={t("staffs.table.staffs")}
        data={
          user.data?.map((t: any, index: number) => {
            return {
              ...t,
              ...t.profileDetails?.personalInfo,
              permissions: t.permissions,
              sno: index + 1,
            };
          }) || []
        }
        columns={UserTableColumns}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: stores.auth.hasPermission('staffs', 'create'),
              function: () => {
                onAdd();
              },
            },
            editKey: {
              showEditButton: stores.auth.hasPermission('staffs', 'edit'),
              function: (e: any) => {
                onEdit(e);
              },
            },
            viewKey: {
              showViewButton: stores.auth.hasPermission('staffs', 'view'),
              function: (e: any) => {
                handleRowClick(e);
              },
            },
            deleteKey: {
              showDeleteButton: stores.auth.hasPermission('staffs', 'delete'),
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
              text: t("staffs.table.resetData"),
              function: resetTableData,
            },
            multidropdown: {
              show: true,
              title: t("staffs.table.filterStatus"),
              dropdowns: [
                {
                  label: t("staffs.table.status"),
                  options: [
                    { label: t("staffs.table.active"), value: true },
                    { label: t("staffs.table.inactive"), value: false },
                    { label: t("staffs.table.all"), value: "all" },
                  ],
                },
              ],
              onDropdownChange: (selected: any, label: string) => {
                if (label === t("staffs.table.status") || label === "Status") {
                  const val = selected?.length > 0 ? selected[selected.length - 1].value : "all";
                  setIsActiveFilter(val);
                }
              },
              selectedOptions: {
                [t("staffs.table.status")]: isActiveFilter === "all" 
                  ? [{ label: t("staffs.table.all"), value: "all" }] 
                  : (isActiveFilter === true 
                    ? [{ label: t("staffs.table.active"), value: true }] 
                    : [{ label: t("staffs.table.inactive"), value: false }]),
                "Status": isActiveFilter === "all" 
                  ? [{ label: t("staffs.table.all"), value: "all" }] 
                  : (isActiveFilter === true 
                    ? [{ label: t("staffs.table.active"), value: true }] 
                    : [{ label: t("staffs.table.inactive"), value: false }])
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
              {t("staffs.table.userProfile")}
            </Flex>
          </DrawerHeader>

          {selectedUser && (
            <DrawerBody>
              <ViewUser
                user={{
                  ...selectedUser.profileDetails?.personalInfo,
                  ...selectedUser,
                }}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      <FormModel 
        open={isStatusOpen} 
        close={onStatusClose} 
        title={t("staffs.table.confirmStatusChange")}
        isCentered
        size="md"
      >
        <VStack spacing={4} p={4} align="center" textAlign="center">
          <Icon as={FiAlertCircle} w={12} h={12} color={statusUser?.is_active ? "orange.400" : "green.400"} />
          <Box>
            <Text fontSize="lg" fontWeight="medium">
              {t("staffs.table.youAreAboutTo", { action: statusUser?.is_active ? t("staffs.table.deactivate").toLowerCase() : t("staffs.table.activate").toLowerCase() })}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {statusUser?.name}
            </Text>
          </Box>
          <Text color="gray.600">
            {statusUser?.is_active 
              ? t("staffs.table.deactivatingStaff")
              : t("staffs.table.activatingStaff")}
          </Text>
          
          <Flex gap={4} w="full" pt={4}>
            <Button variant="ghost" flex={1} onClick={onStatusClose}>
              {t("staffs.table.cancel")}
            </Button>
            <Button 
              colorScheme={statusUser?.is_active ? "orange" : "green"} 
              flex={1}
              onClick={confirmStatusChange}
              isLoading={statusLoading}
              leftIcon={<FiPower />}
            >
              {statusUser?.is_active ? t("staffs.table.confirmDeactivation") : t("staffs.table.confirmActivation")}
            </Button>
          </Flex>
        </VStack>
      </FormModel>

      <StaffPermissionsModal
        isOpen={isPermOpen}
        onClose={() => setIsPermOpen(false)}
        staff={permUser}
        onUpdate={() => applyGetAllTherapists({ page: currentPage, isActive: isActiveFilter })}
      />
    </Box>
  );
});

export default StaffTable;
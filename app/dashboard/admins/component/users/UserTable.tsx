import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Avatar, Box, Badge, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Grid, GridItem, Image, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip, useDisclosure, IconButton, Switch, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from "@chakra-ui/react";
import { FaBrain, FaUserFriends, FaVideo, FaEdit, FaTrash } from "react-icons/fa";
import { FiLock, FiAlertCircle, FiKey } from "react-icons/fi";
import { GiPsychicWaves } from "react-icons/gi";
import Link from "next/link";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../../../component/config/utils/dateUtils";
import StaffPermissionsModal from "../../../staffs/component/staffs/StaffPermissionsModal";
import ChangePasswordModal from "./ChangePasswordModal";

const UserTable = observer(({onAdd, onEdit, onDelete} : any) => {
  const {
    userStore: { getAllUsers, user, updateAdminStatus },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [permUser, setPermUser] = useState<any>(null);

  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedPassUser, setSelectedPassUser] = useState<any>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{id: string, newStatus: boolean} | null>(null);
  const cancelRef = useRef<any>(null);

  const confirmStatusChange = async () => {
    if (pendingStatusUpdate) {
      setIsUpdatingStatus(true);
      try {
        await updateAdminStatus(pendingStatusUpdate.id, pendingStatusUpdate.newStatus);
        openNotification({
          type: "success",
          title: "Success",
          message: "Admin status updated successfully",
        });
        applyGetAllTherapists({ type: "superAdmin", page: currentPage, limit: tablePageLimit });
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Failed to update status",
          message: err?.message || "An error occurred",
        });
      } finally {
        setIsUpdatingStatus(false);
      }
    }
    setIsConfirmOpen(false);
    setPendingStatusUpdate(null);
  };

  const applyGetAllTherapists = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false, type }) => {
      const query: any = { page, limit , type , userType : "admin", isActive: "all" };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getAllUsers(query)
        .then(() => {})
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
    applyGetAllTherapists({ type: "superAdmin", page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllTherapists]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllTherapists({ reset: true, type : 'superAdmin' });
  };

  const handleRowClick = (user: any) => {
    setSelectedTherapist(user);
    onOpen();
  };

  const AvailabilityBadge = ({ type }: { type: string }) => (
    <Badge colorScheme={type === "online" ? "green" : "blue"} px={3} py={1} borderRadius="full" w={"fit-content"} display="flex" alignItems="center" gap={2}>
      {type === "online" ? <FaVideo /> : <FaUserFriends />}
      {type}
    </Badge>
  );

  const TherapistTableColumns = useMemo(() => [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "User",
      key: "user",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Avatar
              src={dt.pic?.url}
              name={dt.pic?.name}
              size="sm"
            />
          </Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Username",
      key: "username",
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Role",
      key: "role",
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Special Details",
      key: "bio",
      type: "tooltip",
      function: (dt: any) => dt.profileDetails?.personalInfo?.bio ? (
        <Tooltip label={dt.profileDetails.personalInfo.bio} hasArrow zIndex={9999}>
          <span>{dt.profileDetails.personalInfo.bio.slice(0, 50)}</span>
        </Tooltip>
      ) : "-",
      props: { row: { textAlign: "center" } }
    },
    {
          headerName: "Created At",
          key: "createdAt",
          type: "component",
          metaData: {
            component: (dt: any) => (
              <Box m={1}>
                 {formatDateTime(dt?.createdAt)}
              </Box>
            ),
          },
          props: {
            row: { minW: 120, textAlign: "center" },
            column: { textAlign: "center" },
          },
        },
    {
      headerName: "Status",
      key: "is_active",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Switch
            colorScheme="green"
            isChecked={dt.is_active}
            onChange={(e) => {
              setPendingStatusUpdate({ id: dt._id, newStatus: e.target.checked });
              setIsConfirmOpen(true);
            }}
          />
        ),
      },
      props: {
        row: { textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Permissions",
      key: "permissions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="Manage Permissions">
            <IconButton
              aria-label="Manage Permissions"
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
      headerName: "Actions",
      key: "table-actions-custom",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex gap={2} justify="center">
            <Tooltip label="Edit Admin">
              <IconButton
                aria-label="Edit"
                icon={<FaEdit />}
                size="sm"
                colorScheme="blue"
                variant="ghost"
                borderRadius="xl"
                onClick={() => onEdit(dt)}
              />
            </Tooltip>
            <Tooltip label="Change Password">
              <IconButton
                aria-label="Change Password"
                icon={<FiKey />}
                size="sm"
                colorScheme="orange"
                variant="ghost"
                borderRadius="xl"
                onClick={() => {
                  setSelectedPassUser(dt);
                  setIsPassModalOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip label="Delete Admin">
              <IconButton
                aria-label="Delete"
                icon={<FaTrash />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                borderRadius="xl"
                onClick={() => onDelete(dt)}
              />
            </Tooltip>
          </Flex>
        ),
      },
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ], [onEdit, onDelete]);

  const tableData = useMemo(() => {
    return user.data?.map((t: any, index: number) => ({
      ...t,
      ...t.profileDetails?.personalInfo,
      permissions: t.permissions,
      sno: index + 1,
    })) || [];
  }, [user.data]);

  const tableActions = useMemo(() => ({
    actionBtn: {
      addKey: {
        showAddButton: true,
        function: () => onAdd(),
      },
      editKey: {
        showEditButton: true,
        function: (e: any) => onEdit(e),
      },
      viewKey: {
        showViewButton: false,
        function: (e: any) => handleRowClick(e),
      },
      deleteKey: {
        showDeleteButton: true,
        function: (e: any) => onDelete(e),
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
    pagination: {
      show: true,
      onClick: handleChangePage,
      currentPage: currentPage,
      totalPages: user.totalPages || 1,
    },
  }), [onAdd, onEdit, onDelete, searchQuery, currentPage, user.totalPages]);

  return (
    <Box p={4}>
      <CustomTable
        title="Admins"
        data={tableData}
        columns={TherapistTableColumns}
        actions={tableActions}
        loading={user.loading}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white">
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              User Profile
            </Flex>
          </DrawerHeader>

          {selectedTherapist && (
            <DrawerBody>
              <Box position="relative">
                <Flex justify={"center"}>
                  <Image src={selectedTherapist?.pic?.url} h={"160px"} objectFit={"cover"} rounded={"xl"} alt="Top Clinical Psychologist Doctors in Noida" />
                </Flex>

                <Box textAlign="center" mt={2}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {selectedTherapist.profileDetails?.personalInfo?.name}
                  </Text>
                  <Text color="gray.500">{selectedTherapist.profileDetails?.personalInfo?.qualifications}</Text>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
                    <GridItem>
                      <Box bg={stores.themeStore.themeConfig.colors.custom.light.primary + "1A"} p={3} borderRadius="lg">
                        <Text fontSize="sm" color="gray.500">Experience</Text>
                        <Text fontWeight="bold">{selectedTherapist.profileDetails?.personalInfo?.experience} Years</Text>
                      </Box>
                    </GridItem>
                    <GridItem>
                      <Box bg={stores.themeStore.themeConfig.colors.custom.light.primary + "1A"} p={3} borderRadius="lg">
                        <Text fontSize="sm" color="gray.500">Session Fee</Text>
                        <Text fontWeight="bold">₹{selectedTherapist.profileDetails?.personalInfo?.charges}</Text>
                      </Box>
                    </GridItem>
                  </Grid>
                </Box>

                <Tabs mt={6} variant="soft-rounded" colorScheme="teal">
                  <TabList>
                    <Tab _selected={{ color: "white", bg: stores.themeStore.themeConfig.colors.custom.light.primary }}>Special Details</Tab>
                    <Tab _selected={{ color: "white", bg: stores.themeStore.themeConfig.colors.custom.light.primary }}>Expertise</Tab>
                    <Tab _selected={{ color: "white", bg: stores.themeStore.themeConfig.colors.custom.light.primary }}>Availability</Tab>
                    <Tab _selected={{ color: "white", bg: stores.themeStore.themeConfig.colors.custom.light.primary }}>Contact</Tab>
                    <Tab _selected={{ color: "white", bg: stores.themeStore.themeConfig.colors.custom.light.primary }}>Link</Tab>
                  </TabList>

                  <TabPanels mt={2}>
                    <TabPanel>
                      <Text color="gray.600" lineHeight="tall">
                        {selectedTherapist.profileDetails?.personalInfo?.bio}
                      </Text>
                    </TabPanel>

                    <TabPanel>
                      <Stack spacing={3}>
                        {selectedTherapist.profileDetails?.personalInfo?.expertise?.map((item: string, idx: number) => (
                          <Flex key={idx} align="center" gap={3} p={3} bg="gray.50" borderRadius="md">
                            <FaBrain color="#3182CE" />
                            <Text fontWeight="500">{item}</Text>
                          </Flex>
                        ))}
                      </Stack>
                    </TabPanel>

                    <TabPanel>
                      <Stack spacing={4}>
                        {selectedTherapist.profileDetails?.personalInfo?.availability?.map((type: string, idx: number) => (
                          <AvailabilityBadge key={idx} type={type} />
                        ))}
                      </Stack>
                    </TabPanel>

                    <TabPanel>
                      <Stack spacing={4}>
                        <Text fontSize="sm" color="gray.500">Email: {selectedTherapist.username}</Text>
                        <Text fontSize="sm" color="gray.500">Phone: {selectedTherapist.profileDetails?.personalInfo?.phoneNumber}</Text>
                      </Stack>
                    </TabPanel>

                    <TabPanel>
                      <Link href={selectedTherapist.profileDetails?.personalInfo?.link || "#"} target="_blank" rel="noopener noreferrer">
                        {selectedTherapist.profileDetails?.personalInfo?.link}
                      </Link>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      <StaffPermissionsModal
        isOpen={isPermOpen}
        onClose={() => setIsPermOpen(false)}
        staff={permUser}
        onUpdate={() => applyGetAllTherapists({ type: "superAdmin", page: currentPage, limit: tablePageLimit })}
      />

      {selectedPassUser && (
        <ChangePasswordModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          userId={selectedPassUser._id}
          userName={selectedPassUser.name || selectedPassUser.username}
        />
      )}

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        isCentered
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingStatusUpdate(null);
        }}
      >
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.300">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl" p={2}>
            <AlertDialogHeader fontSize="xl" fontWeight="bold" display="flex" alignItems="center" gap={3}>
              <Box bg={pendingStatusUpdate?.newStatus ? "green.100" : "red.100"} p={2} borderRadius="full" color={pendingStatusUpdate?.newStatus ? "green.600" : "red.600"}>
                <FiAlertCircle size={24} />
              </Box>
              {pendingStatusUpdate?.newStatus ? "Activate Admin" : "Deactivate Admin"}
            </AlertDialogHeader>

            <AlertDialogBody color="gray.600" fontSize="md">
              Are you sure you want to {pendingStatusUpdate?.newStatus ? "activate" : "deactivate"} this admin? 
              {pendingStatusUpdate?.newStatus 
                ? " They will regain access to their account immediately." 
                : " They will be logged out and lose access to the platform."}
            </AlertDialogBody>

            <AlertDialogFooter mt={4}>
              <Button 
                ref={cancelRef} 
                onClick={() => {
                  setIsConfirmOpen(false);
                  setPendingStatusUpdate(null);
                }}
                variant="ghost"
                borderRadius="full"
              >
                Cancel
              </Button>
              <Button 
                colorScheme={pendingStatusUpdate?.newStatus ? "green" : "red"} 
                onClick={confirmStatusChange} 
                isLoading={isUpdatingStatus}
                loadingText="Updating..."
                ml={3}
                borderRadius="full"
                px={6}
                boxShadow="md"
              >
                Yes, {pendingStatusUpdate?.newStatus ? "Activate" : "Deactivate"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default UserTable;
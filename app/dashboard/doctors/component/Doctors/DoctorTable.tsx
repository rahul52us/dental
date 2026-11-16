import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Text,
  Button,
  Tooltip,
  useDisclosure,
  VStack,
  Icon,
  Image,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Spinner,
} from "@chakra-ui/react";
import FormModel from "../../../../component/common/FormModel/FormModel";
import {
  FiPower,
  FiAlertCircle,
  FiDollarSign,
  FiLock,
  FiKey,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiPlus,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiPhoneCall,
  FiUserX,
} from "react-icons/fi";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import DoctorAccountHistory from "./DoctorAccountHistory";
import StaffPermissionsModal from "../../../staffs/component/staffs/StaffPermissionsModal";
import ChangePasswordModal from "../../../staffs/component/staffs/ChangePasswordModal";
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
import { useTranslation } from "react-i18next";

const DoctorTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const detailsPlacement =
    useBreakpointValue<"bottom" | "right">({ base: "bottom", md: "right" }) ?? "right";
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [statusUser, setStatusUser] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { t } = useTranslation();
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [permUser, setPermUser] = useState<any>(null);
  
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedPassUser, setSelectedPassUser] = useState<any>(null);

  const [openAccountDetails, setOpenAccountDetails] = useState({
    open: false,
    data: null as any,
  });
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
            title: t("doctors.table.failedToGetUsers"),
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
          title: t("doctors.table.statusUpdated"),
          message: t("doctors.table.statusUpdatedDesc", { name: statusUser.name }),
        });
        applyGetAllTherapists({ page: currentPage, isActive: isActiveFilter });
        onStatusClose();
      }
    } catch (err: any) {
      openNotification({
        type: "error",
        title: t("doctors.table.updateFailed"),
        message: err?.message || t("doctors.table.failedToUpdateStatus"),
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const TherapistTableColumns = [

    {
      headerName: t("doctors.table.name"),
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

          const displayTitle = dt?.title || (genderLabel === "Male" ? "Dr." : genderLabel === "Female" ? "Dr." : "");

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
              {displayTitle ? `${displayTitle} ${dt?.name}` : dt?.name}
            </Badge>
          );
        },
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: t("doctors.table.code"),
      key: "code",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("doctors.table.mobileNo"),
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
      headerName: t("doctors.table.status"),
      key: "is_active",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex justify="center" align="center" gap={2}>
            <Badge colorScheme={dt.is_active ? "green" : "red"} variant="subtle" px={2} borderRadius="full">
              {dt.is_active ? t("doctors.table.active") : t("doctors.table.inactive")}
            </Badge>
            <Tooltip label={dt.is_active ? t("doctors.table.deactivate") : t("doctors.table.activate")}>
              <IconButton
                aria-label={t("doctors.table.toggleStatus")}
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
      headerName: t("doctors.table.permissions"),
      key: "permissions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex justify="center" align="center" gap={2}>
            <Tooltip label={t("doctors.table.managePermissions") || "Manage Permissions"}>
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
          </Flex>
        ),
      },
      props: {
        row: { textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("doctors.table.account"),
      key: "account",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="Doctor Payouts & Stats" hasArrow borderRadius="xl">
            <IconButton
              aria-label="Account"
              icon={<Image src="/images/coin.png" alt="Account" boxSize="32px" borderRadius="full" objectFit="cover" />}
              colorScheme="purple"
              bg="purple.50"
              color="purple.600"
              _hover={{ bg: "purple.600", color: "white", transform: "translateY(-2px)", shadow: "lg" }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() => setOpenAccountDetails({ open: true, data: dt })}
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
      headerName: t("doctors.table.actions"),
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ].filter(col => {
    if (col.key === 'permissions') return stores.auth.hasPermission('doctor', 'edit');
    if (col.key === 'account') return stores.auth.hasPermission('accountability', 'view');
    if (col.key === 'is_active') return stores.auth.hasPermission('doctor', 'edit');
    return true;
  });

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  return (
    <Box p={{ base: 2, md: 4 }}>
      {/* ============================================================== */}
      {/* MOBILE APK DEDICATED INTERFACE (< 768px)                       */}
      {/* ============================================================== */}
      {isMobile ? (
        <Box pb="calc(80px + env(safe-area-inset-bottom, 12px))">
          {/* Header */}
          <Flex align="center" justify="space-between" gap={2} mb={3}>
            <Box>
              <HStack spacing={2} align="center">
                <Text fontSize={{ base: "20px", sm: "22px" }} fontWeight="900" color="gray.850" letterSpacing="-0.4px">
                  {t("doctors.table.doctors") || "Doctors"}
                </Text>
                {user.data?.length !== undefined && (
                  <Badge
                    bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 100%)"
                    color="white"
                    fontSize="10px"
                    fontWeight="800"
                    px={2}
                    py={0.5}
                    rounded="full"
                    boxShadow="0 2px 6px rgba(13, 148, 136, 0.25)"
                  >
                    {user.totalCount || user.data?.length}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="12px" color="gray.500" fontWeight="500" mt={0.5}>
                Clinic Practitioners & Specialists
              </Text>
            </Box>

            {stores.auth.hasPermission("doctor", "create") && (
              <Button
                h="40px"
                leftIcon={<FiPlus size={15} />}
                bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 100%)"
                color="white"
                borderRadius="14px"
                px={4}
                fontSize="13px"
                fontWeight="800"
                boxShadow="0 4px 14px -2px rgba(13, 148, 136, 0.4)"
                _hover={{
                  bgGradient: "linear(135deg, #0284C7 0%, #0F766E 100%)",
                  transform: "translateY(-1px)",
                }}
                _active={{ transform: "scale(0.96)" }}
                onClick={onAdd}
              >
                Add Doctor
              </Button>
            )}
          </Flex>

          {/* Search Bar */}
          <InputGroup size="md" mb={3}>
            <InputLeftElement pointerEvents="none" h="46px" w="44px">
              <Icon as={FiSearch} color="#0D9488" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="Search doctor by name, mobile, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="15px"
              bg="white"
              borderColor="#E2E8F0"
              fontSize="13px"
              fontWeight="600"
              h="46px"
              px={11}
              boxShadow="0 2px 8px rgba(0,0,0,0.03)"
              _focus={{
                borderColor: "#0EA5E9",
                boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
              }}
              _placeholder={{ color: "gray.400", fontWeight: "400" }}
            />
            {searchQuery && (
              <InputRightElement h="46px">
                <IconButton
                  aria-label="Clear search"
                  icon={<FiX size={14} />}
                  size="sm"
                  minW="40px"
                  h="40px"
                  variant="ghost"
                  rounded="full"
                  onClick={() => setSearchQuery("")}
                />
              </InputRightElement>
            )}
          </InputGroup>

          {/* Filter Pills */}
          <HStack spacing={2} overflowX="auto" pb={3} sx={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
            <Button
              size="sm"
              rounded="full"
              minH="36px"
              px={4}
              fontSize="12px"
              fontWeight="750"
              bg={isActiveFilter === "all" ? "teal.600" : "gray.100"}
              color={isActiveFilter === "all" ? "white" : "gray.600"}
              boxShadow={isActiveFilter === "all" ? "0 2px 6px rgba(13, 148, 136, 0.3)" : "none"}
              onClick={() => {
                setIsActiveFilter("all");
                setCurrentPage(1);
              }}
            >
              All Doctors
            </Button>
            <Button
              size="sm"
              rounded="full"
              minH="36px"
              px={4}
              fontSize="12px"
              fontWeight="750"
              bg={isActiveFilter === true ? "teal.600" : "gray.100"}
              color={isActiveFilter === true ? "white" : "gray.600"}
              boxShadow={isActiveFilter === true ? "0 2px 6px rgba(13, 148, 136, 0.3)" : "none"}
              leftIcon={<Box as="span" w="7px" h="7px" borderRadius="full" bg={isActiveFilter === true ? "white" : "#10B981"} />}
              onClick={() => {
                setIsActiveFilter(true);
                setCurrentPage(1);
              }}
            >
              Active
            </Button>
            <Button
              size="sm"
              rounded="full"
              minH="36px"
              px={4}
              fontSize="12px"
              fontWeight="750"
              bg={isActiveFilter === false ? "red.600" : "gray.100"}
              color={isActiveFilter === false ? "white" : "gray.600"}
              boxShadow={isActiveFilter === false ? "0 2px 6px rgba(220, 38, 38, 0.3)" : "none"}
              leftIcon={<Box as="span" w="7px" h="7px" borderRadius="full" bg={isActiveFilter === false ? "white" : "#EF4444"} />}
              onClick={() => {
                setIsActiveFilter(false);
                setCurrentPage(1);
              }}
            >
              Inactive
            </Button>
          </HStack>

          {/* Cards Stack */}
          {user.loading ? (
            <Flex direction="column" align="center" justify="center" py={16} gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500" fontWeight="600">
                Loading doctors...
              </Text>
            </Flex>
          ) : !user.data || user.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={14}
              textAlign="center"
              bg="white"
              borderRadius="20px"
              border="1px dashed"
              borderColor="gray.200"
              px={4}
            >
              <Icon as={FiUserX} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Doctors Found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {searchQuery ? `No matching doctors for "${searchQuery}"` : "No doctors recorded yet."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {user.data.map((doctor: any) => {
                const genderLabel =
                  genderOptions.find((option: any) => option.value === doctor.gender)?.label || "";
                const isMale = genderLabel === "Male";
                const isFemale = genderLabel === "Female";
                const displayTitle = doctor.title || (isMale || isFemale ? "Dr." : "");
                const phone = doctor.phones?.find((item: any) => item.primary)?.number;

                return (
                  <Box
                    key={doctor._id || doctor.id}
                    bg="white"
                    border="1px solid"
                    borderColor="#E8EEF4"
                    borderRadius="22px"
                    p={3.5}
                    boxShadow="0 8px 24px -12px rgba(15, 23, 42, 0.18)"
                    position="relative"
                    transition="all 0.2s ease"
                  >
                    {/* Top Identity Strip */}
                    <Flex align="center" justify="space-between" gap={3} mb={2.5}>
                      <Flex align="center" gap={3} flex={1} minW={0} cursor="pointer" onClick={() => handleRowClick(doctor)}>
                        <Box position="relative">
                          <Avatar
                            size="md"
                            name={doctor.name}
                            src={doctor.pic?.url}
                            rounded="16px"
                            bg={isMale ? "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)" : "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)"}
                            color={isMale ? "blue.700" : "pink.700"}
                            fontWeight="900"
                            border="2px solid white"
                            boxShadow="0 4px 10px rgba(15,23,42,0.1)"
                          />
                          <Box
                            position="absolute"
                            bottom="-1px"
                            right="-1px"
                            w="10px"
                            h="10px"
                            rounded="full"
                            bg={doctor.is_active ? "#10B981" : "#EF4444"}
                            border="2px solid white"
                          />
                        </Box>

                        <Box flex={1} minW={0}>
                          <Text fontSize="15px" fontWeight="850" color="gray.850" noOfLines={1} letterSpacing="-0.2px">
                            {displayTitle ? `${displayTitle} ${doctor.name}` : doctor.name}
                          </Text>
                          <HStack spacing={1.5} mt={0.5} wrap="wrap">
                            <Badge
                              bg={doctor.is_active ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)"}
                              color={doctor.is_active ? "#059669" : "#DC2626"}
                              border="1px solid"
                              borderColor={doctor.is_active ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                              borderRadius="full"
                              fontSize="9.5px"
                              fontWeight="800"
                              px={2}
                              py={0.5}
                              textTransform="uppercase"
                              letterSpacing="0.3px"
                            >
                              {doctor.is_active ? "Active" : "Inactive"}
                            </Badge>

                            {doctor.code && (
                              <Badge
                                bg="gray.100"
                                color="gray.600"
                                borderRadius="full"
                                fontSize="9.5px"
                                fontWeight="700"
                                px={2}
                                py={0.5}
                              >
                                #{doctor.code}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      </Flex>

                      {stores.auth.hasPermission("doctor", "edit") && (
                        <Tooltip label={doctor.is_active ? "Deactivate Doctor" : "Activate Doctor"}>
                          <IconButton
                            aria-label="Toggle status"
                            icon={<FiPower size={15} />}
                            size="sm"
                            w="34px"
                            h="34px"
                            borderRadius="xl"
                            colorScheme={doctor.is_active ? "green" : "red"}
                            variant="ghost"
                            bg={doctor.is_active ? "green.50" : "red.50"}
                            color={doctor.is_active ? "green.600" : "red.500"}
                            _hover={{ bg: doctor.is_active ? "green.100" : "red.100" }}
                            onClick={() => handleStatusClick(doctor)}
                          />
                        </Tooltip>
                      )}
                    </Flex>

                    {/* Phone strip */}
                    <Flex
                      align="center"
                      justify="space-between"
                      bg="gray.50"
                      borderRadius="14px"
                      px={3}
                      py={1.5}
                      mb={2.5}
                      border="1px solid"
                      borderColor="gray.150"
                    >
                      <HStack
                        spacing={2}
                        minW={0}
                        flex={1}
                        cursor={phone ? "pointer" : "default"}
                        onClick={() => {
                          if (phone) {
                            copyToClipboard(phone);
                            openNotification({ type: "success", title: "Copied", message: `Phone: ${phone}` });
                          }
                        }}
                      >
                        <Icon as={FiPhone} color="teal.600" fontSize="13px" />
                        <Text fontSize="12px" fontWeight="600" color={phone ? "gray.750" : "gray.400"} noOfLines={1}>
                          {phone ? `+91 •••• ${phone.slice(-4)}` : "No phone registered"}
                        </Text>
                        {phone && <Icon as={FiCopy} color="gray.400" fontSize="11px" />}
                      </HStack>

                      {phone && (
                        <IconButton
                          as="a"
                          href={`tel:${phone}`}
                          aria-label="Call Doctor"
                          icon={<FiPhoneCall size={13} />}
                          size="xs"
                          w="28px"
                          h="28px"
                          borderRadius="lg"
                          colorScheme="teal"
                          variant="solid"
                        />
                      )}
                    </Flex>

                    {/* Primary Action Buttons */}
                    <HStack spacing={2} mb={2}>
                      {stores.auth.hasPermission("doctor", "view") && (
                        <Button
                          size="sm"
                          flex={1}
                          minH="36px"
                          borderRadius="xl"
                          bg="teal.50"
                          color="teal.700"
                          border="1px solid"
                          borderColor="teal.100"
                          _hover={{ bg: "teal.100" }}
                          _active={{ transform: "scale(0.98)" }}
                          leftIcon={<FiEye size={13} />}
                          fontSize="12px"
                          fontWeight="750"
                          onClick={() => handleRowClick(doctor)}
                        >
                          Profile
                        </Button>
                      )}

                      {stores.auth.hasPermission("doctor", "edit") && (
                        <Button
                          size="sm"
                          flex={1}
                          minH="36px"
                          borderRadius="xl"
                          bg="blue.50"
                          color="blue.700"
                          border="1px solid"
                          borderColor="blue.100"
                          _hover={{ bg: "blue.100" }}
                          _active={{ transform: "scale(0.98)" }}
                          leftIcon={<FiEdit2 size={13} />}
                          fontSize="12px"
                          fontWeight="750"
                          onClick={() => onEdit(doctor)}
                        >
                          Edit
                        </Button>
                      )}

                      {stores.auth.hasPermission("accountability", "view") && (
                        <Button
                          size="sm"
                          flex={1}
                          minH="36px"
                          borderRadius="xl"
                          bg="purple.50"
                          color="purple.700"
                          border="1px solid"
                          borderColor="purple.100"
                          _hover={{ bg: "purple.100" }}
                          _active={{ transform: "scale(0.98)" }}
                          leftIcon={<FiDollarSign size={13} />}
                          fontSize="12px"
                          fontWeight="750"
                          onClick={() => setOpenAccountDetails({ open: true, data: doctor })}
                        >
                          Payouts
                        </Button>
                      )}
                    </HStack>

                    {/* Security & Secondary Actions */}
                    <Flex justify="space-between" align="center" pt={1.5} borderTop="1px dashed" borderColor="gray.200">
                      <Text fontSize="11px" fontWeight="600" color="gray.400">
                        Account & Security
                      </Text>
                      <HStack spacing={1.5}>
                        {stores.auth.hasPermission("doctor", "edit") && (
                          <>
                            <Tooltip label="Permissions">
                              <IconButton
                                aria-label="Permissions"
                                icon={<FiLock size={13} />}
                                size="xs"
                                w="30px"
                                h="30px"
                                borderRadius="lg"
                                bg="gray.100"
                                color="gray.700"
                                _hover={{ bg: "purple.50", color: "purple.600" }}
                                onClick={() => {
                                  setPermUser(doctor);
                                  setIsPermOpen(true);
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Change Password">
                              <IconButton
                                aria-label="Change Password"
                                icon={<FiKey size={13} />}
                                size="xs"
                                w="30px"
                                h="30px"
                                borderRadius="lg"
                                bg="orange.50"
                                color="orange.600"
                                _hover={{ bg: "orange.100" }}
                                onClick={() => {
                                  setSelectedPassUser(doctor);
                                  setIsPassModalOpen(true);
                                }}
                              />
                            </Tooltip>
                          </>
                        )}
                        {stores.auth.hasPermission("doctor", "delete") && (
                          <Tooltip label="Delete Doctor">
                            <IconButton
                              aria-label="Delete Doctor"
                              icon={<FiTrash2 size={13} />}
                              size="xs"
                              w="30px"
                              h="30px"
                              borderRadius="lg"
                              bg="red.50"
                              color="red.600"
                              _hover={{ bg: "red.100" }}
                              onClick={() => onDelete(doctor)}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Mobile Pagination */}
          {user.totalPages && user.totalPages > 1 && (
            <Flex justify="space-between" align="center" pt={4} pb={2}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                leftIcon={<FiChevronLeft size={14} />}
                isDisabled={currentPage <= 1}
                onClick={() => handleChangePage(currentPage - 1)}
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color="gray.600">
                Page {currentPage} of {user.totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={currentPage >= user.totalPages}
                onClick={() => handleChangePage(currentPage + 1)}
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        /* ============================================================== */
        /* DESKTOP VIEW (100% UNCHANGED AS OLD >= 768px)                  */
        /* ============================================================== */
        <CustomTable
          title={t("doctors.table.doctors")}
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
          columns={TherapistTableColumns}
          actions={{
            actionBtn: {
              resetData: false,
              addKey: {
                showAddButton: stores.auth.hasPermission('doctor', 'create'),
                function: () => {
                  onAdd();
                },
              },
              editKey: {
                showEditButton: stores.auth.hasPermission('doctor', 'edit'),
                function: (e: any) => {
                  onEdit(e);
                },
              },
              viewKey: {
                showViewButton: stores.auth.hasPermission('doctor', 'view'),
                function: (e: any) => {
                  handleRowClick(e);
                },
              },
              deleteKey: {
                showDeleteButton: stores.auth.hasPermission('doctor', 'delete'),
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
              text: t("doctors.table.resetData"),
              function: resetTableData,
            },
            multidropdown: {
              show: true,
              title: t("doctors.table.filterStatus"),
              dropdowns: [
                {
                  label: t("doctors.table.status"),
                  options: [
                    { label: t("doctors.table.active"), value: true },
                    { label: t("doctors.table.inactive"), value: false },
                    { label: t("doctors.table.all"), value: "all" },
                  ],
                },
              ],
              onDropdownChange: (selected: any, label: string) => {
                if (label === t("doctors.table.status") || label === "Status") {
                  const val = selected?.length > 0 ? selected[selected.length - 1].value : "all";
                  setIsActiveFilter(val);
                }
              },
              selectedOptions: {
                [t("doctors.table.status")]: isActiveFilter === "all" 
                  ? [{ label: t("doctors.table.all"), value: "all" }] 
                  : (isActiveFilter === true 
                    ? [{ label: t("doctors.table.active"), value: true }] 
                    : [{ label: t("doctors.table.inactive"), value: false }]),
                "Status": isActiveFilter === "all" 
                  ? [{ label: t("doctors.table.all"), value: "all" }] 
                  : (isActiveFilter === true 
                    ? [{ label: t("doctors.table.active"), value: true }] 
                    : [{ label: t("doctors.table.inactive"), value: false }])
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
      )}

      <Drawer
        isOpen={isOpen}
        placement={detailsPlacement}
        onClose={() => {
          onClose();
          setSelectedTherapist(null);
        }}
      >
        <DrawerOverlay />
        <DrawerContent
          w={{ base: "100vw", md: "75vw" }}
          maxW={{ base: "100vw", md: "75vw" }}
          h="100dvh"
          maxH="100dvh"
          borderRadius={0}
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <DrawerCloseButton color="white" bg="whiteAlpha.200" borderRadius="full" _hover={{ bg: "whiteAlpha.350" }} top={{ base: 2, md: 4 }} right={{ base: 2, md: 4 }} />
          <DrawerHeader
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            py={{ base: 3, md: 4 }}
            fontSize={{ base: "sm", md: "lg" }}
          >
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              {t("doctors.table.userProfile")}
            </Flex>
          </DrawerHeader>

          {selectedTherapist && (
            <DrawerBody p={0} minH={0} overflowY="auto" overscrollBehaviorY="contain">
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
        title={t("doctors.table.confirmStatusChange")}
        isCentered
        size="md"
      >
        <VStack spacing={4} p={4} align="center" textAlign="center">
          <Icon as={FiAlertCircle} w={12} h={12} color={statusUser?.is_active ? "orange.400" : "green.400"} />
          <Box>
            <Text fontSize="lg" fontWeight="medium">
              {t("doctors.table.youAreAboutTo", { action: statusUser?.is_active ? t("doctors.table.deactivate").toLowerCase() : t("doctors.table.activate").toLowerCase() })}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              {statusUser?.name}
            </Text>
          </Box>
          <Text color="gray.600">
            {statusUser?.is_active 
              ? t("doctors.table.deactivatingDoctor")
              : t("doctors.table.activatingDoctor")}
          </Text>
          
          <Flex gap={4} w="full" pt={4}>
            <Button variant="ghost" flex={1} onClick={onStatusClose}>
              {t("doctors.table.cancel")}
            </Button>
            <Button 
              colorScheme={statusUser?.is_active ? "orange" : "green"} 
              flex={1}
              onClick={confirmStatusChange}
              isLoading={statusLoading}
              leftIcon={<FiPower />}
            >
              {statusUser?.is_active ? t("doctors.table.confirmDeactivation") : t("doctors.table.confirmActivation")}
            </Button>
          </Flex>
        </VStack>
      </FormModel>

      {/* Doctor Accountability Drawer */}
      {openAccountDetails.open && (
        <CustomDrawer
          open={openAccountDetails.open}
          close={() => setOpenAccountDetails({ open: false, data: null })}
          title={`Doctor Accountability: ${openAccountDetails.data?.name}`}
          width={{ base: "100%", md: "80%" }}
        >
          <DoctorAccountHistory doctorDetails={openAccountDetails.data} />
        </CustomDrawer>
      )}

      <StaffPermissionsModal
        isOpen={isPermOpen}
        onClose={() => setIsPermOpen(false)}
        staff={permUser}
        onUpdate={() => applyGetAllTherapists({ page: currentPage, isActive: isActiveFilter })}
      />

      {selectedPassUser && (
        <ChangePasswordModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          userId={selectedPassUser._id}
          userName={selectedPassUser.name || selectedPassUser.username}
        />
      )}
    </Box>
  );
});

export default DoctorTable;
import { CalendarIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import PatientWorkDoneHistory from "./PatientWorkDoneHistory";
import {
  FiFileText,
  FiDollarSign,
  FiPaperclip,
  FiCreditCard,
  FiDatabase,
  FiSearch,
  FiPlus,
  FiX,
  FiPhoneCall,
  FiCopy,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiEye,
  FiUserX,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import WalletHistoryDrawer from "../../../../component/WalletHistoryDrawer";
import { GiMedicalDrip, GiPsychicWaves } from "react-icons/gi";
import { FaFlask, FaHistory, FaWhatsapp, FaTooth } from "react-icons/fa";
import LabSheet from "../../../labWork/component/LabSheet";
import LegacyPatientHistoryDrawer from "../../../old-data/component/LegacyPatientHistoryDrawer";
import PatientOldDataDrawer from "../../../old-data/component/PatientOldDataDrawer";
import PatientLabWorkHistory from "./PatientLabWorkHistory";
import PatientAccountHistory from "./PatientAccountHistory";
import PatientDocuments from "./PatientDocuments";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { genderOptions } from "../../../../config/constant";
import { copyToClipboard } from "../../../../config/utils/function";
import stores from "../../../../store/stores";
import AppointmentList from "../../../appointments/Appointments";
import ViewDoctor from "./ViewPatient";
import Treatment from "../../../toothTreatment/page";
import RecallAppointmentList from "../../../recall-appointment/component/recallAppointmentTable/RecallTable";
import { useTranslation } from "react-i18next";

const PatientTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
    oldDataStore,
  } = stores;
  const { t } = useTranslation();

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const [openAppointmentDetails, setOpenAppointmentDetails] = useState({
    open: false,
    data: null as any,
  });

  const [openTreatmentDetails, setOpenTreatmentDetails] = useState({
    open: false,
    data: null as any,
    defaultTab: 0,
    defaultStatusFilter: "all",
  });

  const [openRecallDetails, setOpenRecallDetails] = useState({
    open: false,
    data: null as any,
  });

  const [openLabSheetDetails, setOpenLabSheetDetails] = useState({
    open: false,
    data: null as any,
  });

  const [openAccountDetails, setOpenAccountDetails] = useState({
    open: false,
    data: null as any,
  });

  const [openDocumentsDetails, setOpenDocumentsDetails] = useState({
    open: false,
    data: null as any,
  });

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const toggleCardExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [mobileFilter, setMobileFilter] = useState<"all" | "pending" | "male" | "female">("all");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose,
  } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleOpenHistoryDrawer = (row: any) => {
    oldDataStore.fetchLegacyPatientHistory(row.code);
    onHistoryOpen();
  };

  const handleCloseHistoryDrawer = () => {
    onHistoryClose();
    oldDataStore.clearPatientFullHistory();
  };

  // New OldData drawer
  const [isOldDataDrawerOpen, setIsOldDataDrawerOpen] = useState(false);
  const [selectedOldDataPatient, setSelectedOldDataPatient] = useState<any>(null);

  const handleOpenOldDataDrawer = (row: any) => {
    setSelectedOldDataPatient(row);
    oldDataStore.fetchPatientOldData(row._id);
    setIsOldDataDrawerOpen(true);
  };

  const handleCloseOldDataDrawer = () => {
    setIsOldDataDrawerOpen(false);
    setSelectedOldDataPatient(null);
    oldDataStore.clearPatientOldData();
  };

  const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState(false);
  const [selectedWalletPatient, setSelectedWalletPatient] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllPatients = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit, type: "patient" };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        setCurrentPage(1);
      }

      getAllUsers(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to fetch patients",
          message: err?.message || "Something went wrong",
        });
      });
    },
    [debouncedSearchQuery, getAllUsers, openNotification]
  );

  useEffect(() => {
    applyGetAllPatients({ page: currentPage });
  }, [currentPage, debouncedSearchQuery, applyGetAllPatients]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllPatients({ reset: true });
  };

  const handleRowClick = (userRow: any) => {
    setSelectedUser(userRow);
    onOpen();
  };

  const blueTextColor = useColorModeValue("blue.600", "blue.300");
  const grayTextColor = useColorModeValue("gray.500", "gray.400");
  const bgBlue = useColorModeValue("blue.50", "blue.900");
  const bgTeal = useColorModeValue("teal.50", "teal.900");
  const bgPurple = useColorModeValue("purple.50", "purple.900");
  const bgPink = useColorModeValue("pink.50", "pink.900");
  const bgCyan = useColorModeValue("cyan.50", "cyan.900");
  const bgGreen = useColorModeValue("green.50", "green.900");
  const bgOrange = useColorModeValue("orange.50", "orange.900");

  const cardBg = useColorModeValue("#FFFFFF", "#1E293B");
  const cardBorder = useColorModeValue("rgba(226, 232, 240, 0.85)", "rgba(51, 65, 85, 0.6)");
  const textColor = useColorModeValue("#0F172A", "#F8FAFC");
  const subtextColor = useColorModeValue("#64748B", "#94A3B8");

  // Permissions helper
  const canCreate = stores.auth.hasPermission("patient", "create");
  const canEdit = stores.auth.hasPermission("patient", "edit");
  const canView = stores.auth.hasPermission("patient", "view");
  const canDelete = stores.auth.hasPermission("patient", "delete");
  const canAppointment = stores.auth.hasPermission("appointment", "view");
  const canTreatment = stores.auth.hasPermission("treatment", "view");
  const canRecall = stores.auth.hasPermission("recall", "view");
  const canWorkDone = stores.auth.hasPermission("workdone", "view");
  const canLab =
    stores.auth.hasPermission("inhouse_lab", "view") ||
    stores.auth.hasPermission("outside_lab", "view");
  const canAccount = stores.auth.hasPermission("accountability", "view");
  const canDocs = stores.auth.hasPermission("patient_documents", "view");

  // Helper to reliably extract phone number across all patient record shapes
  const getPatientPhone = (patient: any): { display: string; raw: string | null } => {
    const primaryPhone =
      patient.phones?.find((p: any) => p.primary) ||
      patient.phones?.[0] ||
      patient.profileDetails?.personalInfo?.phones?.find((p: any) => p.primary) ||
      patient.profileDetails?.personalInfo?.phones?.[0];

    const candidate =
      primaryPhone?.number ||
      patient.mobile ||
      patient.phone ||
      patient.phoneNumber ||
      patient.profileDetails?.personalInfo?.mobile ||
      patient.profileDetails?.personalInfo?.phone;

    if (candidate && candidate !== "--" && String(candidate).trim()) {
      const clean = String(candidate).trim();
      return { display: clean, raw: clean.replace(/\D/g, "") };
    }

    // Fallback: If code starts with a 10-digit number (common in Indian clinic migrations, e.g. 8588964882ZU)
    if (patient.code) {
      const match = String(patient.code).match(/^(\d{10})/);
      if (match) {
        return { display: match[1], raw: match[1] };
      }
    }

    return { display: "--", raw: null };
  };

  const PatientTableColumns = [
    {
      headerName: t("patients.table.name", "Name"),
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

          const displayTitle =
            dt?.title ||
            (genderLabel === "Male"
              ? "Mr."
              : genderLabel === "Female"
                ? "Mrs."
                : "");

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
      headerName: t("patients.table.mobileNo", "Mobile No."),
      key: "mobile",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const phone = getPatientPhone(dt);
          const masked = phone.display !== "--" ? `••••${phone.display.slice(-4)}` : "--";

          return (
            <Tooltip label={phone.display !== "--" ? `Copy: ${phone.display}` : ""} hasArrow>
              <Box
                cursor={phone.display !== "--" ? "pointer" : "default"}
                onClick={() => phone.display !== "--" && copyToClipboard(phone.display)}
                color={phone.display !== "--" ? blueTextColor : grayTextColor}
                fontWeight="medium"
              >
                {masked}
              </Box>
            </Tooltip>
          );
        },
      },
      props: { row: { minW: 140, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.code", "Code"),
      key: "code",
      type: "text",
      props: { row: { minW: 100, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.appointments", "Appointments"),
      key: "appointments",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge
            as="button"
            px={3}
            py={1}
            borderRadius="md"
            colorScheme="green"
            variant="solid"
            cursor="pointer"
            fontWeight="600"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
            _hover={{ bg: bgGreen, color: "green.600", shadow: "sm" }}
            transition="all 0.2s"
            onClick={() => setOpenAppointmentDetails({ open: true, data: dt })}
          >
            <CalendarIcon boxSize={3} />
            Appointments
          </Badge>
        ),
      },
      props: { row: { minW: 130, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.treatment", "Treatment"),
      key: "treatment",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge
            as="button"
            px={3}
            py={1}
            borderRadius="md"
            colorScheme="purple"
            variant="solid"
            cursor="pointer"
            fontWeight="600"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
            _hover={{ bg: bgPurple, color: "purple.600", shadow: "sm" }}
            transition="all 0.2s"
            onClick={() =>
              setOpenTreatmentDetails({
                open: true,
                data: dt,
                defaultTab: 1,
                defaultStatusFilter:
                  dt?.pendingTreatmentCount > 0 ? "pending" : "all",
              })
            }
          >
            <GiMedicalDrip size={14} />
            Treatment
          </Badge>
        ),
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.recall", "Recall"),
      key: "recall",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge
            as="button"
            px={3}
            py={1}
            borderRadius="md"
            colorScheme="orange"
            variant="solid"
            cursor="pointer"
            fontWeight="600"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
            _hover={{ bg: bgOrange, color: "orange.600", shadow: "sm" }}
            transition="all 0.2s"
            onClick={() => setOpenRecallDetails({ open: true, data: dt })}
          >
            <CalendarIcon boxSize={3} />
            Recall
          </Badge>
        ),
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.workDone", "Work Done"),
      key: "history",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="View Work Done" hasArrow borderRadius="xl">
            <IconButton
              aria-label="Work Done"
              icon={
                <Box as="span" fontSize="lg" fontWeight="900">
                  W
                </Box>
              }
              colorScheme="blue"
              bg={bgBlue}
              color={blueTextColor}
              _hover={{
                bg: "blue.600",
                color: "white",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() =>
                setOpenTreatmentDetails({
                  open: true,
                  data: dt,
                  defaultTab: 2,
                  defaultStatusFilter: "all",
                })
              }
            />
          </Tooltip>
        ),
      },
      props: { row: { minW: 100, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.labWork", "Lab Work"),
      key: "labSheet",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="Laboratory History" hasArrow borderRadius="xl">
            <IconButton
              aria-label="Lab Sheet"
              icon={
                <Image
                  src="/images/lab.jpeg"
                  alt="Lab"
                  boxSize="32px"
                  borderRadius="full"
                  objectFit="cover"
                />
              }
              colorScheme="teal"
              bg={bgTeal}
              _hover={{
                bg: "teal.600",
                color: "white",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() => setOpenLabSheetDetails({ open: true, data: dt })}
            />
          </Tooltip>
        ),
      },
      props: { row: { minW: 100, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.account", "Account"),
      key: "account",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="Account Management" hasArrow borderRadius="xl">
            <IconButton
              aria-label="Account"
              icon={
                <Image
                  src="/images/coin.png"
                  alt="Account"
                  boxSize="32px"
                  borderRadius="full"
                  objectFit="cover"
                />
              }
              colorScheme="purple"
              bg={bgPurple}
              _hover={{
                bg: "purple.600",
                color: "white",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() => setOpenAccountDetails({ open: true, data: dt })}
            />
          </Tooltip>
        ),
      },
      props: { row: { minW: 100, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.wallet", "Wallet"),
      key: "wallet",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="Wallet History" hasArrow borderRadius="xl">
            <IconButton
              aria-label="Wallet History"
              icon={<FiCreditCard />}
              colorScheme="pink"
              bg={bgPink}
              color={useColorModeValue("pink.600", "pink.300")}
              _hover={{
                bg: "pink.600",
                color: "white",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() => {
                setSelectedWalletPatient(dt);
                setIsWalletHistoryOpen(true);
              }}
            />
          </Tooltip>
        ),
      },
      props: { row: { minW: 100, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.documents", "Documents"),
      key: "documents",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label="Documents & Media" hasArrow borderRadius="xl">
            <IconButton
              aria-label="Documents"
              icon={<FiPaperclip />}
              colorScheme="cyan"
              bg={bgCyan}
              color={useColorModeValue("cyan.600", "cyan.300")}
              _hover={{
                bg: "cyan.600",
                color: "white",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() => setOpenDocumentsDetails({ open: true, data: dt })}
            />
          </Tooltip>
        ),
      },
      props: { row: { minW: 100, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.oldData", "Old Data"),
      key: "importedOldData",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip
            label="View Imported Patient History"
            hasArrow
            borderRadius="xl"
          >
            <IconButton
              aria-label="Imported Old Data"
              icon={<FiDatabase />}
              colorScheme="blue"
              bg={useColorModeValue("blue.50", "blue.900")}
              color={useColorModeValue("blue.600", "blue.300")}
              _hover={{
                bg: "blue.600",
                color: "white",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              variant="ghost"
              size="md"
              borderRadius="2xl"
              transition="all 0.3s"
              onClick={() => handleOpenOldDataDrawer(dt)}
            />
          </Tooltip>
        ),
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: t("patients.table.actions", "Actions"),
      key: "table-actions",
      type: "table-actions",
      props: { row: { minW: 180, textAlign: "center" } },
    },
  ].filter((col) => {
    if (col.key === "appointments") return canAppointment;
    if (col.key === "treatment") return canTreatment;
    if (col.key === "recall") return canRecall;
    if (col.key === "history") return canWorkDone;
    if (col.key === "labSheet") return canLab;
    if (col.key === "account") return canAccount;
    if (col.key === "documents") return canDocs;
    return true;
  });

  // Ensure ALL personal info fields are unpacked into the row so both mobile and desktop have full parity
  const formattedPatients = (user.data || []).map(
    (patient: any, index: number) => {
      const { references, ...personalInfoRest } =
        patient.profileDetails?.personalInfo || {};
      return {
        ...patient,
        ...personalInfoRest,
        sno: index + 1 + (currentPage - 1) * tablePageLimit,
      };
    }
  );

  const totalPages = user.totalPages || 1;

  return (
    <>
      <Box p={{ base: 2, md: 4 }} overflowX={{ base: "hidden", md: "auto" }} maxW="100vw">
        {/* ============================================================== */}
        {/* MOBILE APK DEDICATED INTERFACE (< 768px)                       */}
        {/* ============================================================== */}
        {isMobile ? (
          <Box pb="calc(80px + env(safe-area-inset-bottom, 12px))">
            {/* Mobile Header & Search Bar */}
            <Box px={1} pt={1} pb={3}>
              {/* App Bar Header */}
              <Flex align="center" justify="space-between" mb={3}>
                <Box>
                  <HStack spacing={2} align="center">
                    <Text
                      fontSize="19px"
                      fontWeight="900"
                      color={textColor}
                      letterSpacing="-0.4px"
                    >
                      Patients
                    </Text>
                    {user.totalCount !== undefined && (
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
                        {user.totalCount}
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="11.5px" color={subtextColor} fontWeight="500" mt={0.5}>
                    Clinic Directory & Medical Records
                  </Text>
                </Box>

                {canCreate && (
                  <Button
                    size="sm"
                    leftIcon={<FiPlus size={14} />}
                    bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 100%)"
                    color="white"
                    borderRadius="full"
                    px={3.5}
                    py={1.5}
                    fontSize="12px"
                    fontWeight="800"
                    boxShadow="0 4px 14px -2px rgba(13, 148, 136, 0.4)"
                    _hover={{
                      bgGradient: "linear(135deg, #0284C7 0%, #0F766E 100%)",
                      transform: "translateY(-1px)",
                    }}
                    _active={{ transform: "scale(0.96)" }}
                    onClick={onAdd}
                  >
                    New Patient
                  </Button>
                )}
              </Flex>

              {/* Instant Search Bar */}
              <InputGroup size="md" mb={2.5}>
                <InputLeftElement pointerEvents="none" h="42px">
                  <FiSearch color="#0D9488" size={16} />
                </InputLeftElement>
                <Input
                  placeholder="Search patient by name, mobile, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="16px"
                  bg={useColorModeValue("white", "gray.800")}
                  borderColor={useColorModeValue("#E2E8F0", "gray.700")}
                  fontSize="13px"
                  fontWeight="600"
                  h="42px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.03)"
                  _focus={{
                    borderColor: "#0EA5E9",
                    bg: useColorModeValue("white", "gray.800"),
                    boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
                  }}
                  _placeholder={{ color: "gray.400", fontWeight: "400" }}
                />
                {searchQuery && (
                  <InputRightElement h="42px">
                    <IconButton
                      aria-label="Clear search"
                      icon={<FiX size={14} />}
                      size="xs"
                      variant="ghost"
                      rounded="full"
                      onClick={resetTableData}
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              {/* Quick Filter Pills Row */}
              <HStack spacing={2} overflowX="auto" py={0.5} sx={{ "&::-webkit-scrollbar": { display: "none" } }}>
                <Button
                  size="xs"
                  rounded="full"
                  px={3}
                  py={1.5}
                  fontSize="11px"
                  fontWeight="750"
                  bg={mobileFilter === "all" ? "teal.600" : useColorModeValue("gray.100", "gray.800")}
                  color={mobileFilter === "all" ? "white" : subtextColor}
                  boxShadow={mobileFilter === "all" ? "0 2px 6px rgba(13, 148, 136, 0.3)" : "none"}
                  _hover={{}}
                  onClick={() => setMobileFilter("all")}
                >
                  All Patients
                </Button>
                <Button
                  size="xs"
                  rounded="full"
                  px={3}
                  py={1.5}
                  fontSize="11px"
                  fontWeight="750"
                  bg={mobileFilter === "pending" ? "purple.600" : useColorModeValue("purple.50", "whiteAlpha.100")}
                  color={mobileFilter === "pending" ? "white" : "purple.600"}
                  boxShadow={mobileFilter === "pending" ? "0 2px 6px rgba(147, 51, 234, 0.3)" : "none"}
                  leftIcon={<Box as="span">⚡</Box>}
                  _hover={{}}
                  onClick={() => setMobileFilter("pending")}
                >
                  Pending Tx
                </Button>
                <Button
                  size="xs"
                  rounded="full"
                  px={3}
                  py={1.5}
                  fontSize="11px"
                  fontWeight="750"
                  bg={mobileFilter === "male" ? "blue.600" : useColorModeValue("blue.50", "whiteAlpha.100")}
                  color={mobileFilter === "male" ? "white" : "blue.600"}
                  boxShadow={mobileFilter === "male" ? "0 2px 6px rgba(37, 99, 235, 0.3)" : "none"}
                  _hover={{}}
                  onClick={() => setMobileFilter("male")}
                >
                  Male
                </Button>
                <Button
                  size="xs"
                  rounded="full"
                  px={3}
                  py={1.5}
                  fontSize="11px"
                  fontWeight="750"
                  bg={mobileFilter === "female" ? "pink.600" : useColorModeValue("pink.50", "whiteAlpha.100")}
                  color={mobileFilter === "female" ? "white" : "pink.600"}
                  boxShadow={mobileFilter === "female" ? "0 2px 6px rgba(219, 39, 119, 0.3)" : "none"}
                  _hover={{}}
                  onClick={() => setMobileFilter("female")}
                >
                  Female
                </Button>
              </HStack>
            </Box>

            {/* Mobile Cards Stack */}
            {user.loading ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={16}
                gap={3}
              >
                <Spinner size="lg" color="teal.500" thickness="3px" />
                <Text fontSize="13px" color={subtextColor} fontWeight="600">
                  Loading patients...
                </Text>
              </Flex>
            ) : (() => {
              const mobileFilteredPatients = formattedPatients.filter((p: any) => {
                if (mobileFilter === "pending") return Number(p.pendingTreatmentCount) > 0;
                if (mobileFilter === "male") return p.gender === 1;
                if (mobileFilter === "female") return p.gender === 2;
                return true;
              });

              if (mobileFilteredPatients.length === 0) {
                return (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py={16}
                    textAlign="center"
                    bg={cardBg}
                    borderRadius="20px"
                    border="1px dashed"
                    borderColor={cardBorder}
                    px={4}
                  >
                    <Icon as={FiUserX as any} boxSize="36px" color="gray.400" mb={2} />
                    <Text fontSize="14px" fontWeight="750" color={textColor}>
                      No Patients Found
                    </Text>
                    <Text fontSize="12px" color={subtextColor} mt={1} maxW="240px">
                      {searchQuery
                        ? `No matching records for "${searchQuery}".`
                        : mobileFilter !== "all"
                          ? `No patients match the "${mobileFilter}" filter.`
                          : "No patients have been registered yet."}
                    </Text>
                    {(searchQuery || mobileFilter !== "all") && (
                      <Button
                        size="xs"
                        mt={3}
                        variant="outline"
                        colorScheme="teal"
                        rounded="full"
                        onClick={() => {
                          resetTableData();
                          setMobileFilter("all");
                        }}
                      >
                        Reset Filters
                      </Button>
                    )}
                  </Flex>
                );
              }

              return (
                <VStack spacing={3} align="stretch">
                  {mobileFilteredPatients.map((patient: any) => {
                    const genderLabel =
                      genderOptions.find(
                        (opt: any) => opt.value === patient?.gender
                      )?.label || "--";

                    const isMale = genderLabel === "Male";
                    const isFemale = genderLabel === "Female";
                    const genderColor = isMale
                      ? "blue"
                      : isFemale
                        ? "pink"
                        : "teal";

                    const displayTitle =
                      patient?.title ||
                      (isMale ? "Mr." : isFemale ? "Mrs." : "");
                    const fullName = displayTitle
                      ? `${displayTitle} ${patient?.name}`
                      : patient?.name;

                    const phoneContact = getPatientPhone(patient);
                    const hasPendingTreatments =
                      Number(patient?.pendingTreatmentCount) > 0;

                    const cardKey = String(patient._id || patient.id || patient.code);
                    const isExpanded = !!expandedCards[cardKey];

                    return (
                      <Box
                        key={patient._id || patient.id}
                        bg={cardBg}
                        border="1px solid"
                        borderColor={useColorModeValue("#F1F5F9", "gray.700")}
                        borderRadius="20px"
                        p={3.5}
                        boxShadow="0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0,0,0,0.03)"
                        position="relative"
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        {/* Top Patient Identity Strip */}
                        <Flex align="center" justify="space-between" mb={2.5}>
                          <Flex
                            align="center"
                            gap={3}
                            flex={1}
                            minW={0}
                            cursor="pointer"
                            onClick={() => handleRowClick(patient)}
                          >
                            {/* Stylized Modern Avatar with status indicator */}
                            <Box position="relative">
                              <Avatar
                                size="md"
                                name={patient?.name || "Patient"}
                                src={patient?.pic?.url || undefined}
                                rounded="16px"
                                bg={
                                  isMale
                                    ? "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)"
                                    : isFemale
                                      ? "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)"
                                      : "linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)"
                                }
                                color={isMale ? "blue.700" : isFemale ? "pink.700" : "teal.700"}
                                fontWeight="900"
                                border="2px solid white"
                                boxShadow="0 3px 8px rgba(0,0,0,0.08)"
                              />
                              <Box
                                position="absolute"
                                bottom="-1px"
                                right="-1px"
                                w="9px"
                                h="9px"
                                rounded="full"
                                bg="#10B981"
                                border="2px solid white"
                              />
                            </Box>

                            <Box flex={1} minW={0}>
                              <Text
                                fontSize="15px"
                                fontWeight="800"
                                color={textColor}
                                noOfLines={1}
                                letterSpacing="-0.2px"
                              >
                                {fullName}
                              </Text>

                              <HStack spacing={1.5} mt={0.5} wrap="wrap">
                                {genderLabel !== "--" && (
                                  <Badge
                                    colorScheme={genderColor}
                                    variant="subtle"
                                    borderRadius="full"
                                    fontSize="9px"
                                    fontWeight="800"
                                    px={2}
                                    py={0.2}
                                  >
                                    {genderLabel.toUpperCase()}
                                  </Badge>
                                )}

                                {patient.code && (
                                  <Badge
                                    bg={useColorModeValue("gray.100", "gray.700")}
                                    color={useColorModeValue("gray.600", "gray.300")}
                                    borderRadius="full"
                                    fontSize="9px"
                                    fontWeight="700"
                                    px={2}
                                    py={0.2}
                                  >
                                    #{patient.code}
                                  </Badge>
                                )}

                                {hasPendingTreatments && (
                                  <Badge
                                    bgGradient="linear(to-r, purple.500, indigo.500)"
                                    color="white"
                                    borderRadius="full"
                                    fontSize="9px"
                                    fontWeight="800"
                                    px={2}
                                    py={0.2}
                                    boxShadow="0 2px 6px rgba(139, 92, 246, 0.3)"
                                    cursor="pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenTreatmentDetails({
                                        open: true,
                                        data: patient,
                                        defaultTab: 1,
                                        defaultStatusFilter: "pending",
                                      });
                                    }}
                                  >
                                    ⚡ {patient.pendingTreatmentCount} PENDING
                                  </Badge>
                                )}
                              </HStack>
                            </Box>
                          </Flex>

                          {/* Kebab Action Menu */}
                          <Menu placement="bottom-end">
                            <MenuButton
                              as={IconButton}
                              aria-label="Patient options"
                              icon={<FiMoreVertical size={16} />}
                              size="sm"
                              variant="ghost"
                              color={subtextColor}
                              borderRadius="full"
                              _hover={{ bg: "gray.100" }}
                            />
                            <MenuList
                              zIndex={10}
                              boxShadow="0 8px 30px rgba(0,0,0,0.12)"
                              borderRadius="16px"
                              p={1.5}
                              fontSize="13px"
                              bg={cardBg}
                              borderColor={cardBorder}
                            >
                              {canView && (
                                <MenuItem
                                  icon={<FiEye size={15} />}
                                  borderRadius="10px"
                                  onClick={() => handleRowClick(patient)}
                                >
                                  View Full Profile
                                </MenuItem>
                              )}

                              {canEdit && (
                                <MenuItem
                                  icon={<FiEdit2 size={15} />}
                                  borderRadius="10px"
                                  onClick={() => onEdit(patient)}
                                >
                                  Edit Patient
                                </MenuItem>
                              )}

                              <MenuDivider my={1} />

                              {canLab && (
                                <MenuItem
                                  icon={<FaFlask size={14} />}
                                  borderRadius="10px"
                                  onClick={() =>
                                    setOpenLabSheetDetails({
                                      open: true,
                                      data: patient,
                                    })
                                  }
                                >
                                  Laboratory Cases
                                </MenuItem>
                              )}

                              {canRecall && (
                                <MenuItem
                                  icon={<FiClock size={15} />}
                                  borderRadius="10px"
                                  onClick={() =>
                                    setOpenRecallDetails({
                                      open: true,
                                      data: patient,
                                    })
                                  }
                                >
                                  Recall Follow-ups
                                </MenuItem>
                              )}

                              {canWorkDone && (
                                <MenuItem
                                  icon={<FaHistory size={14} />}
                                  borderRadius="10px"
                                  onClick={() =>
                                    setOpenTreatmentDetails({
                                      open: true,
                                      data: patient,
                                      defaultTab: 2,
                                      defaultStatusFilter: "all",
                                    })
                                  }
                                >
                                  Work Done History
                                </MenuItem>
                              )}

                              <MenuItem
                                icon={<FiCreditCard size={15} />}
                                borderRadius="10px"
                                onClick={() => {
                                  setSelectedWalletPatient(patient);
                                  setIsWalletHistoryOpen(true);
                                }}
                              >
                                Wallet History
                              </MenuItem>

                              {canDocs && (
                                <MenuItem
                                  icon={<FiPaperclip size={15} />}
                                  borderRadius="10px"
                                  onClick={() =>
                                    setOpenDocumentsDetails({
                                      open: true,
                                      data: patient,
                                    })
                                  }
                                >
                                  Documents & Media
                                </MenuItem>
                              )}

                              <MenuItem
                                icon={<FiDatabase size={15} />}
                                borderRadius="10px"
                                onClick={() => handleOpenOldDataDrawer(patient)}
                              >
                                Imported Old Data
                              </MenuItem>

                              {canDelete && (
                                <>
                                  <MenuDivider my={1} />
                                  <MenuItem
                                    icon={<FiTrash2 size={15} />}
                                    borderRadius="10px"
                                    color="red.500"
                                    _hover={{ bg: "red.50" }}
                                    onClick={() => onDelete(patient)}
                                  >
                                    Delete Patient
                                  </MenuItem>
                                </>
                              )}
                            </MenuList>
                          </Menu>
                        </Flex>

                        {/* Interactive Contact Strip with Direct Call & WhatsApp */}
                        <Flex
                          align="center"
                          justify="space-between"
                          py={1.5}
                          px={3}
                          borderRadius="14px"
                          bg={useColorModeValue("#F8FAFC", "whiteAlpha.50")}
                          border="1px solid"
                          borderColor={useColorModeValue("#F1F5F9", "transparent")}
                          mb={2.5}
                        >
                          <HStack spacing={2} align="center">
                            <Icon as={FiPhoneCall} color={phoneContact.raw ? "teal.500" : "gray.400"} boxSize={3.5} />
                            <Text
                              fontSize="12.5px"
                              fontWeight="700"
                              color={phoneContact.raw ? textColor : "gray.400"}
                              letterSpacing="0.2px"
                            >
                              {phoneContact.display !== "--"
                                ? `+91 •••• ${phoneContact.display.slice(-4)}`
                                : "No phone on file"}
                            </Text>
                          </HStack>

                          <HStack spacing={1.5}>
                            {phoneContact.raw && (
                              <>
                                <IconButton
                                  as="a"
                                  href={`tel:${phoneContact.raw}`}
                                  aria-label="Call patient"
                                  icon={<FiPhoneCall size={12} />}
                                  size="xs"
                                  rounded="full"
                                  colorScheme="teal"
                                  variant="solid"
                                  boxShadow="0 2px 6px rgba(13, 148, 136, 0.3)"
                                />
                                <IconButton
                                  as="a"
                                  href={`https://wa.me/91${phoneContact.raw}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="WhatsApp patient"
                                  icon={<FaWhatsapp size={13} />}
                                  size="xs"
                                  rounded="full"
                                  colorScheme="whatsapp"
                                  variant="solid"
                                  boxShadow="0 2px 6px rgba(37, 211, 102, 0.3)"
                                />
                                <IconButton
                                  aria-label="Copy phone"
                                  icon={<FiCopy size={11} />}
                                  size="xs"
                                  rounded="full"
                                  variant="ghost"
                                  color="gray.500"
                                  onClick={() => {
                                    copyToClipboard(phoneContact.display);
                                    openNotification({
                                      type: "success",
                                      title: "Phone Copied",
                                      message: `${phoneContact.display} copied to clipboard`,
                                    });
                                  }}
                                />
                              </>
                            )}
                          </HStack>
                        </Flex>

                        {/* Clean Ergonomic 2x2 Bento Action Grid (Proper Fit, Never Truncates!) */}
                        <SimpleGrid columns={2} spacing={2} pt={1.5}>
                          {canTreatment && (
                            <Button
                              h="38px"
                              rounded="13px"
                              bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 100%)"
                              color="white"
                              fontWeight="800"
                              fontSize="12px"
                              leftIcon={<GiMedicalDrip size={14} color="white" />}
                              boxShadow="0 3px 10px -2px rgba(13, 148, 136, 0.4)"
                              _hover={{
                                bgGradient: "linear(135deg, #0284C7 0%, #0F766E 100%)",
                                transform: "translateY(-1px)",
                              }}
                              _active={{ transform: "scale(0.97)" }}
                              onClick={() =>
                                setOpenTreatmentDetails({
                                  open: true,
                                  data: patient,
                                  defaultTab: 1,
                                  defaultStatusFilter: patient?.pendingTreatmentCount > 0 ? "pending" : "all",
                                })
                              }
                            >
                              Treatment {patient?.pendingTreatmentCount > 0 ? `(${patient.pendingTreatmentCount})` : ""}
                            </Button>
                          )}

                          {canAppointment && (
                            <Button
                              h="38px"
                              rounded="13px"
                              bg={useColorModeValue("#F8FAFC", "gray.800")}
                              border="1px solid"
                              borderColor={useColorModeValue("#E2E8F0", "gray.700")}
                              color={useColorModeValue("gray.800", "gray.100")}
                              fontWeight="750"
                              fontSize="12px"
                              leftIcon={<CalendarIcon boxSize="13px" color="teal.500" />}
                              _hover={{ bg: useColorModeValue("teal.50", "gray.700"), borderColor: "teal.300" }}
                              _active={{ transform: "scale(0.97)" }}
                              onClick={() => setOpenAppointmentDetails({ open: true, data: patient })}
                            >
                              Appointment
                            </Button>
                          )}

                          {canAccount && (
                            <Button
                              h="38px"
                              rounded="13px"
                              bg={useColorModeValue("#F8FAFC", "gray.800")}
                              border="1px solid"
                              borderColor={useColorModeValue("#E2E8F0", "gray.700")}
                              color={useColorModeValue("gray.800", "gray.100")}
                              fontWeight="750"
                              fontSize="12px"
                              leftIcon={<FiCreditCard size={13} color="#0D9488" />}
                              _hover={{ bg: useColorModeValue("cyan.50", "gray.700"), borderColor: "cyan.300" }}
                              _active={{ transform: "scale(0.97)" }}
                              onClick={() => setOpenAccountDetails({ open: true, data: patient })}
                            >
                              Billing & Ledger
                            </Button>
                          )}

                          {canView && (
                            <Button
                              h="38px"
                              rounded="13px"
                              bg={useColorModeValue("#F8FAFC", "gray.800")}
                              border="1px solid"
                              borderColor={useColorModeValue("#E2E8F0", "gray.700")}
                              color={useColorModeValue("gray.800", "gray.100")}
                              fontWeight="750"
                              fontSize="12px"
                              leftIcon={<FiEye size={13} color="#2563EB" />}
                              _hover={{ bg: useColorModeValue("blue.50", "gray.700"), borderColor: "blue.300" }}
                              _active={{ transform: "scale(0.97)" }}
                              onClick={() => handleRowClick(patient)}
                            >
                              View Profile
                            </Button>
                          )}
                        </SimpleGrid>
                      </Box>
                    );
                  })}
                </VStack>
              );
            })()}

            {/* Mobile Pagination Bar */}
            {totalPages > 1 && (
              <Flex
                align="center"
                justify="space-between"
                mt={4}
                px={3}
                py={2}
                bg={cardBg}
                borderRadius="14px"
                border="1px solid"
                borderColor={cardBorder}
                boxShadow="xs"
              >
                <Button
                  size="xs"
                  leftIcon={<FiChevronLeft />}
                  onClick={() => handleChangePage(currentPage - 1)}
                  isDisabled={currentPage <= 1}
                  variant="ghost"
                  colorScheme="teal"
                  fontWeight="700"
                >
                  Prev
                </Button>
                <Text fontSize="11px" fontWeight="700" color={subtextColor}>
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  size="xs"
                  rightIcon={<FiChevronRight />}
                  onClick={() => handleChangePage(currentPage + 1)}
                  isDisabled={currentPage >= totalPages}
                  variant="ghost"
                  colorScheme="teal"
                  fontWeight="700"
                >
                  Next
                </Button>
              </Flex>
            )}
          </Box>
        ) : (
          /* ============================================================== */
          /* DESKTOP UI (Unchanged)                                         */
          /* ============================================================== */
          <CustomTable
            title={t("sidebar.Patients", "Patients")}
            data={formattedPatients}
            columns={PatientTableColumns}
            actions={{
              actionBtn: {
                addKey: {
                  showAddButton: canCreate,
                  function: onAdd,
                },
                editKey: {
                  showEditButton: canEdit,
                  function: onEdit,
                },
                viewKey: {
                  showViewButton: canView,
                  function: handleRowClick,
                },
                deleteKey: {
                  showDeleteButton: canDelete,
                  function: onDelete,
                },
              },
              search: {
                show: true,
                searchValue: searchQuery,
                onSearchChange: (e: any) => setSearchQuery(e.target.value),
              },
              resetData: {
                show: false,
                function: resetTableData,
              },
              pagination: {
                show: true,
                onClick: handleChangePage,
                currentPage,
                totalPages: user.totalPages || 1,
              },
            }}
            loading={user.loading}
          />
        )}

        {/* Patient Profile Drawer (Opens from BOTTOM on mobile!) */}
        <Drawer
          isOpen={isOpen}
          placement={isMobile ? "bottom" : "right"}
          onClose={onClose}
          size={isMobile ? "full" : "xl"}
        >
          <DrawerOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
          <DrawerContent
            borderTopRadius={isMobile ? "20px" : "none"}
            maxH={isMobile ? "100dvh" : "100vh"}
            height={isMobile ? "100dvh" : "100%"}
            overflow="hidden"
            bg={useColorModeValue("white", "gray.900")}
          >
            <DrawerHeader
              bgGradient={
                isMobile
                  ? "linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
                  : undefined
              }
              bg={
                isMobile
                  ? undefined
                  : stores.themeStore.themeConfig.colors.custom.light.primary
              }
              color="white"
              pt={isMobile ? 3 : 5}
              pb={4}
              px={5}
            >
              {isMobile && (
                <Box
                  w="38px"
                  h="4.5px"
                  borderRadius="full"
                  bg="whiteAlpha.450"
                  mx="auto"
                  mb={2.5}
                />
              )}
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={3}>
                  <GiPsychicWaves size={24} />
                  <Box>
                    <Text fontSize="16px" fontWeight="800">
                      Patient Profile
                    </Text>
                    {selectedUser?.name && (
                      <Text fontSize="11px" fontWeight="500" opacity={0.85}>
                        {selectedUser.name} &bull; #{selectedUser.code || "Patient"}
                      </Text>
                    )}
                  </Box>
                </Flex>
                <DrawerCloseButton
                  position="relative"
                  top="0"
                  right="0"
                  color="white"
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  _hover={{ bg: "red.500" }}
                />
              </Flex>
            </DrawerHeader>
            <DrawerBody px={{ base: 2, md: 6 }} py={4} className="customScrollBar">
              {selectedUser && <ViewDoctor user={selectedUser} />}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Appointments Drawer */}
        {openAppointmentDetails.open && (
          <CustomDrawer
            width="92%"
            title={`Patient Appointments ${
              openAppointmentDetails.data?.name
                ? `(${openAppointmentDetails.data.name})`
                : ""
            }`}
            open={openAppointmentDetails.open}
            close={() =>
              setOpenAppointmentDetails({ open: false, data: null })
            }
          >
            <AppointmentList
              isPatient={true}
              patientDetails={openAppointmentDetails.data}
            />
          </CustomDrawer>
        )}

        {/* Treatment Drawer */}
        {openTreatmentDetails.open && (
          <CustomDrawer
            width="92%"
            title={`Treatment advise ${
              openTreatmentDetails.data?.name
                ? `(${openTreatmentDetails.data.name})`
                : ""
            }`}
            open={openTreatmentDetails.open}
            close={() =>
              setOpenTreatmentDetails({
                open: false,
                data: null,
                defaultTab: 0,
                defaultStatusFilter: "all",
              })
            }
          >
            <Treatment
              isPatient={true}
              patientDetails={openTreatmentDetails.data}
              defaultTab={openTreatmentDetails.defaultTab}
              defaultStatusFilter={openTreatmentDetails.defaultStatusFilter}
            />
          </CustomDrawer>
        )}

        {/* Recall Drawer */}
        {openRecallDetails.open && (
          <CustomDrawer
            width="92%"
            title={`Recall Appointments ${
              openRecallDetails.data?.name
                ? `(${openRecallDetails.data.name})`
                : ""
            }`}
            open={openRecallDetails.open}
            close={() => setOpenRecallDetails({ open: false, data: null })}
          >
            <RecallAppointmentList
              isPatient={true}
              patientDetails={openRecallDetails.data}
            />
          </CustomDrawer>
        )}

        {/* Lab Sheet History Drawer */}
        {openLabSheetDetails.open && (
          <CustomDrawer
            open={openLabSheetDetails.open}
            close={() => setOpenLabSheetDetails({ open: false, data: null })}
            title={`Laboratory History: ${openLabSheetDetails.data?.name}`}
            width="90vw"
          >
            <Box m={-2}>
              <PatientLabWorkHistory
                patientDetails={openLabSheetDetails.data}
              />
            </Box>
          </CustomDrawer>
        )}

        {/* Accountability Drawer */}
        {openAccountDetails.open && (
          <CustomDrawer
            open={openAccountDetails.open}
            close={() => setOpenAccountDetails({ open: false, data: null })}
            title={`Accountability Management: ${openAccountDetails.data?.name}`}
            width={{ base: "100%", md: "92vw" }}
          >
            <PatientAccountHistory patientDetails={openAccountDetails.data} />
          </CustomDrawer>
        )}

        {/* Documents & Media Drawer */}
        {openDocumentsDetails.open && (
          <CustomDrawer
            open={openDocumentsDetails.open}
            close={() =>
              setOpenDocumentsDetails({ open: false, data: null })
            }
            title={`📎 Documents & Media — ${openDocumentsDetails.data?.name}`}
            width="80vw"
          >
            <PatientDocuments patientDetails={openDocumentsDetails.data} />
          </CustomDrawer>
        )}

        <WalletHistoryDrawer
          isOpen={isWalletHistoryOpen}
          onClose={() => setIsWalletHistoryOpen(false)}
          patient={selectedWalletPatient}
        />

        <LegacyPatientHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={handleCloseHistoryDrawer}
        />

        <PatientOldDataDrawer
          isOpen={isOldDataDrawerOpen}
          onClose={handleCloseOldDataDrawer}
          patient={selectedOldDataPatient}
        />
      </Box>
    </>
  );
});

export default PatientTable;

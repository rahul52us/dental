import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
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
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiLayers,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import ViewDoctor from "./ViewLab";
import { useTranslation } from "react-i18next";

const LabsTable = observer(({ onAdd, onEdit, onDelete, onItemView }: any) => {
  const {
    labStore: { getLabs, labs },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedTherapist] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

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

      getLabs(query)
        .then(() => {})
        .catch((err) => {
          openNotification({
            type: "error",
            title: t("labs.table.failedToGetLabs"),
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getLabs, openNotification, t]
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

  const handleRowClick = (lab: any) => {
    setSelectedTherapist(lab);
    onOpen();
  };

  const TherapistTableColumns = [
    {
      headerName: t("labs.table.sno"),
      key: "sno",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("labs.table.name"),
      key: "name",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: t("labs.table.actions"),
      key: "address",
      type: "component",
      metaData: {
        component: (dt: any) => {
          return (
            <Badge
              as="button"
              px={3}
              py={1}
              borderRadius="md"
              colorScheme="blue"
              cursor="pointer"
              onClick={() => onItemView(dt)}
            >
              View
            </Badge>
          );
        },
      },
      props: {
        row: { minW: 10, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Created At",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (dt: any) => <Box m={1}>{formatDate(dt?.createdAt)}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: t("labs.table.actions"),
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ].filter((col) => {
    if (col?.key === "address") return stores.auth.hasPermission("lab", "view");
    return true;
  });

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
                <Text
                  fontSize={{ base: "20px", sm: "22px" }}
                  fontWeight="900"
                  color="gray.850"
                  letterSpacing="-0.4px"
                >
                  {t("labs.table.labs") || "Labs"}
                </Text>
                {labs.data?.length !== undefined && (
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
                    {labs.data?.length}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="12px" color="gray.500" fontWeight="500" mt={0.5}>
                Dental Laboratories & Fabrication Partners
              </Text>
            </Box>

            {stores.auth.hasPermission("lab", "create") && (
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
                Add Lab
              </Button>
            )}
          </Flex>

          {/* Search Bar */}
          <InputGroup size="md" mb={3}>
            <InputLeftElement pointerEvents="none" h="46px" w="44px">
              <Icon as={FiSearch} color="#0D9488" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="Search lab by name..."
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

          {/* Cards Stack */}
          {labs.loading ? (
            <Flex direction="column" align="center" justify="center" py={16} gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500" fontWeight="600">
                Loading labs...
              </Text>
            </Flex>
          ) : !labs.data || labs.data.length === 0 ? (
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
              <Icon as={FiPackage} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Labs Found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {searchQuery ? `No matching labs for "${searchQuery}"` : "No labs registered yet."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {labs.data.map((lab: any) => {
                return (
                  <Box
                    key={lab._id || lab.id}
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
                    <Flex align="center" justify="space-between" gap={3} mb={3}>
                      <Flex
                        align="center"
                        gap={3}
                        flex={1}
                        minW={0}
                        cursor="pointer"
                        onClick={() => handleRowClick(lab)}
                      >
                        <Avatar
                          size="md"
                          name={lab.name}
                          rounded="16px"
                          bg="linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)"
                          color="teal.800"
                          fontWeight="900"
                          border="2px solid white"
                          boxShadow="0 4px 10px rgba(15,23,42,0.1)"
                        />

                        <Box flex={1} minW={0}>
                          <Text
                            fontSize="15px"
                            fontWeight="850"
                            color="gray.850"
                            noOfLines={1}
                            letterSpacing="-0.2px"
                          >
                            {lab.name}
                          </Text>
                          <HStack spacing={1.5} mt={0.5} wrap="wrap">
                            <Badge
                              bg="rgba(13, 148, 136, 0.12)"
                              color="teal.700"
                              border="1px solid"
                              borderColor="rgba(13, 148, 136, 0.3)"
                              borderRadius="full"
                              fontSize="9.5px"
                              fontWeight="800"
                              px={2}
                              py={0.5}
                              textTransform="uppercase"
                              letterSpacing="0.3px"
                            >
                              Lab
                            </Badge>

                            <HStack spacing={1} color="gray.500" fontSize="11px">
                              <Icon as={FiCalendar} fontSize="11px" />
                              <Text>{lab.createdAt ? formatDate(lab.createdAt) : "—"}</Text>
                            </HStack>
                          </HStack>
                        </Box>
                      </Flex>
                    </Flex>

                    {/* View Orders Portfolio Hero Button */}
                    {stores.auth.hasPermission("lab", "view") && (
                      <Button
                        w="full"
                        minH="40px"
                        borderRadius="xl"
                        bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                        color="white"
                        _hover={{
                          bgGradient: "linear(135deg, #082F49, #0F766E)",
                        }}
                        _active={{ transform: "scale(0.99)" }}
                        fontSize="12.5px"
                        fontWeight="800"
                        leftIcon={<FiLayers size={14} />}
                        onClick={() => onItemView(lab)}
                        boxShadow="0 4px 12px rgba(12, 74, 110, 0.2)"
                        mb={2.5}
                      >
                        View Orders Portfolio
                      </Button>
                    )}

                    {/* Quick Action Toolbelt */}
                    <Flex
                      align="center"
                      justify="space-between"
                      pt={2}
                      borderTop="1px dashed"
                      borderColor="#E2E8F0"
                      gap={1}
                    >
                      {stores.auth.hasPermission("lab", "view") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="teal"
                          leftIcon={<FiEye size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                          h="30px"
                          px={2}
                          borderRadius="lg"
                          onClick={() => handleRowClick(lab)}
                        >
                          Profile
                        </Button>
                      )}

                      {stores.auth.hasPermission("lab", "edit") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiEdit2 size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                          h="30px"
                          px={2}
                          borderRadius="lg"
                          onClick={() => onEdit(lab)}
                        >
                          Edit
                        </Button>
                      )}

                      {stores.auth.hasPermission("lab", "delete") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiTrash2 size={12} />}
                          fontSize="11px"
                          fontWeight="700"
                          h="30px"
                          px={2}
                          borderRadius="lg"
                          onClick={() => onDelete(lab)}
                        >
                          Delete
                        </Button>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Mobile Pagination */}
          {(labs.TotalPages || 1) > 1 && (
            <Flex align="center" justify="space-between" mt={4} px={1}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="12px"
                leftIcon={<FiChevronLeft />}
                isDisabled={currentPage <= 1}
                onClick={() => handleChangePage(currentPage - 1)}
                fontSize="12px"
                fontWeight="700"
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color="gray.600">
                Page {currentPage} of {labs.TotalPages || 1}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="12px"
                rightIcon={<FiChevronRight />}
                isDisabled={currentPage >= (labs.TotalPages || 1)}
                onClick={() => handleChangePage(currentPage + 1)}
                fontSize="12px"
                fontWeight="700"
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        /* ============================================================== */
        /* DESKTOP INTERFACE (>= 768px)                                   */
        /* ============================================================== */
        <CustomTable
          title={t("labs.table.labs")}
          data={
            labs.data?.map((t: any, index: number) => {
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
              addKey: {
                showAddButton: stores.auth.hasPermission("lab", "create"),
                function: () => {
                  onAdd();
                },
              },
              editKey: {
                showEditButton: stores.auth.hasPermission("lab", "edit"),
                function: (e: any) => {
                  onEdit(e);
                },
              },
              viewKey: {
                showViewButton: stores.auth.hasPermission("lab", "view"),
                function: (e: any) => {
                  handleRowClick(e);
                },
              },
              deleteKey: {
                showDeleteButton: stores.auth.hasPermission("lab", "delete"),
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
              show: false,
              text: t("labs.table.resetData"),
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: labs.TotalPages || 1,
            },
          }}
          loading={labs.loading}
        />
      )}

      {/* Lab Profile Details Drawer */}
      <Drawer
        isOpen={isOpen}
        placement={isMobile ? "bottom" : "right"}
        onClose={onClose}
        size={isMobile ? "full" : undefined}
      >
        <DrawerOverlay />
        <DrawerContent
          minW={{ md: "80vw", sm: "100vw" }}
          h={isMobile ? "100dvh" : undefined}
          maxH={isMobile ? "100dvh" : undefined}
          borderTopRadius={0}
          borderRadius={0}
          overflow="hidden"
        >
          <DrawerCloseButton color="white" zIndex={2} />
          <DrawerHeader
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            borderRadius={0}
            borderTopRadius={0}
            py={4}
            px={5}
          >
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              <Text fontSize="lg" fontWeight="bold">
                {t("labs.table.userProfile") || "Lab Profile"}
              </Text>
            </Flex>
          </DrawerHeader>

          {selectedUser && (
            <DrawerBody p={0}>
              <ViewDoctor
                data={{
                  ...selectedUser,
                }}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default LabsTable;

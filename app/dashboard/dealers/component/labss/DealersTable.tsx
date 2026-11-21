import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import {
  useColorModeValue,

  Avatar,
  Badge,
  Box,
  Button,
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
  Tooltip,
  useBreakpointValue,
  useDisclosure,
  VStack,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Spinner,

} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { MdShoppingBasket } from "react-icons/md";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
} from "react-icons/fi";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import { CardListSkeleton } from "../../../../component/common/Loader/ContentSkeleton";
import ViewDealer from "./ViewDealer";

const DealersTable = observer(({ onAdd, onEdit, onDelete, onItemView }: any) => {
  const {
    dealerStore: { getDealers, dealers },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const detailsPlacement =
    useBreakpointValue<"bottom" | "right">({ base: "bottom", md: "right" }) ?? "right";
  const [selectedUser, setSelectedDealer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllDealers = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getDealers(query)
        .then(() => { })
        .catch((err: any) => {
          openNotification({
            type: "error",
            title: "Failed to get dealers",
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getDealers, openNotification]
  );

  useEffect(() => {
    applyGetAllDealers({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllDealers]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllDealers({ reset: true });
  };

  const handleRowClick = (dealer: any) => {
    setSelectedDealer(dealer);
    onOpen();
  };

  const DealerTableColumns = [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Name",
      key: "name",
      props: { row: { textAlign: "center" } },
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
      headerName: "Orders Portfolio",
      key: "address",
      type: "component",
      metaData: {
        component: (dt: any) => {
          return (
            <Flex justify="center" w="full">
              <Badge
                as="button"
                px={4}
                py={2}
                borderRadius="full"
                colorScheme="blue"
                variant="solid"
                cursor="pointer"
                onClick={() => onItemView(dt)}
                display="flex"
                alignItems="center"
                gap={2}
                fontSize="xs"
                fontWeight="bold"
                boxShadow="sm"
                _hover={{ transform: "scale(1.05)", shadow: "md", bg: "blue.500" }}
                transition="all 0.2s"
              >
                <MdShoppingBasket size="14px" />
                Portfolio
              </Badge>
            </Flex>
          );
        },
      },
      props: {
        row: { minW: 10, textAlign: "center" },
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
  ].filter((col: any) => {
    if (col.key === 'address') return stores.auth.hasPermission('masters', 'view');
    return true;
  });

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  // Theme & Dark Mode tokens
  const dealerTitleColor = useColorModeValue("gray.850", "white");
  const dealerSubtextColor = useColorModeValue("gray.500", "gray.400");
  const dealerCardBg = useColorModeValue("white", "gray.800");
  const dealerCardBorder = useColorModeValue("#E8EEF4", "gray.700");
  const dealerSearchBg = useColorModeValue("white", "gray.800");
  const dealerSearchBorder = useColorModeValue("#E2E8F0", "gray.700");
  const dealerSearchColor = useColorModeValue("gray.800", "white");
  const dealerActionBg = useColorModeValue("gray.50", "gray.700");

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
                <Text fontSize={{ base: "20px", sm: "22px" }} fontWeight="900" color={dealerTitleColor} letterSpacing="-0.4px">
                  Dealers
                </Text>
                {dealers.data?.length !== undefined && (
                  <Badge
                    bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0EA5E9) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                    color="white"
                    fontSize="10px"
                    fontWeight="800"
                    px={2}
                    py={0.5}
                    rounded="full"
                    boxShadow="0 2px 6px rgba(13, 148, 136, 0.25)"
                  >
                    {dealers.data?.length}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="12px" color={dealerSubtextColor} fontWeight="500" mt={0.5}>
                Vendors & Laboratory Supply Dealers
              </Text>
            </Box>

            {stores.auth.hasPermission("masters", "create") && (
              <Button
                h="36px"
                leftIcon={<FiPlus size={14} />}
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0EA5E9) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                borderRadius="14px"
                px={4}
                fontSize="13px"
                fontWeight="800"
                boxShadow="0 4px 14px -2px rgba(13, 148, 136, 0.4)"
                _hover={{
                  bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #0284C7) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)",
                  transform: "translateY(-1px)",
                }}
                _active={{ transform: "scale(0.96)" }}
                onClick={onAdd}
              >
                Add Dealer
              </Button>
            )}
          </Flex>

          {/* Search Bar */}
          <InputGroup size="md" mb={3}>
            <InputLeftElement pointerEvents="none" h="40px" w="40px">
              <Icon as={FiSearch} color="brand.500" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="Search dealer by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="15px"
              bg={dealerSearchBg}
              borderColor={dealerSearchBorder}
              color={dealerSearchColor}
              fontSize="13px"
              fontWeight="600"
              h="40px"
              pl="38px"
              pr={searchQuery ? "38px" : 3}
              boxShadow="0 2px 8px rgba(0,0,0,0.03)"
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 3px var(--theme-shadow, rgba(14, 165, 233, 0.15))",
              }}
              _placeholder={{ color: "gray.400", fontWeight: "400" }}
            />
            {searchQuery && (
              <InputRightElement h="40px">
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
          {dealers.loading ? (
            <CardListSkeleton count={4} />
          ) : !dealers.data || dealers.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={14}
              textAlign="center"
              bg={dealerCardBg}
              borderRadius="20px"
              border="1px dashed"
              borderColor={dealerCardBorder}
              px={4}
            >
              <Icon as={FiPackage} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Dealers Found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {searchQuery ? `No matching dealers for "${searchQuery}"` : "No dealers registered yet."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {dealers.data.map((dealer: any) => {
                return (
                  <Box
                    key={dealer._id || dealer.id}
                    bg={dealerCardBg}
                    border="1px solid"
                    borderColor={dealerCardBorder}
                    borderRadius="22px"
                    p={3.5}
                    boxShadow="0 8px 24px -12px rgba(15, 23, 42, 0.18)"
                    position="relative"
                    transition="all 0.2s ease"
                  >
                    {/* Top Identity Strip */}
                    <Flex align="center" justify="space-between" gap={3} mb={3}>
                      <Flex align="center" gap={3} flex={1} minW={0} cursor="pointer" onClick={() => handleRowClick(dealer)}>
                        <Avatar
                          size="md"
                          name={dealer.name}
                          rounded="16px"
                          bg="linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)"
                          color="teal.800"
                          fontWeight="900"
                          border="2px solid white"
                          boxShadow="0 4px 10px rgba(15,23,42,0.1)"
                        />

                        <Box flex={1} minW={0}>
                          <Text fontSize="15px" fontWeight="850" color={dealerTitleColor} noOfLines={1} letterSpacing="-0.2px">
                            {dealer.name}
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
                              Dealer
                            </Badge>

                            <HStack spacing={1} color="gray.500" fontSize="11px">
                              <Icon as={FiCalendar} fontSize="11px" />
                              <Text>{dealer.createdAt ? formatDate(dealer.createdAt) : "—"}</Text>
                            </HStack>
                          </HStack>
                        </Box>
                      </Flex>
                    </Flex>

                    {/* View Orders Portfolio Hero Button */}
                    {stores.auth.hasPermission("masters", "view") && (
                      <Button
                        w="full"
                        minH="40px"
                        borderRadius="xl"
                        bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                        color="white"
                        _hover={{
                          bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)",
                          shadow: "md",
                        }}
                        _active={{ transform: "scale(0.98)" }}
                        leftIcon={<MdShoppingBasket size={18} />}
                        fontSize="12.5px"
                        fontWeight="800"
                        boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                        mb={3}
                        onClick={() => onItemView(dealer)}
                      >
                        View Orders Portfolio
                      </Button>
                    )}

                    {/* Quick Actions Row */}
                    <Flex justify="space-between" align="center" pt={1.5} borderTop="1px dashed" borderColor={dealerCardBorder}>
                      <Text fontSize="11px" fontWeight="600" color="gray.400">
                        Dealer Actions
                      </Text>
                      <HStack spacing={1.5}>
                        {stores.auth.hasPermission("masters", "view") && (
                          <Tooltip label="View Dealer">
                            <IconButton
                              aria-label="View Dealer"
                              icon={<FiEye size={13} />}
                              size="xs"
                              w="30px"
                              h="30px"
                              borderRadius="lg"
                              bg="teal.50"
                              color="teal.700"
                              _hover={{ bg: "teal.100" }}
                              onClick={() => handleRowClick(dealer)}
                            />
                          </Tooltip>
                        )}
                        {stores.auth.hasPermission("masters", "edit") && (
                          <Tooltip label="Edit Dealer">
                            <IconButton
                              aria-label="Edit Dealer"
                              icon={<FiEdit2 size={13} />}
                              size="xs"
                              w="30px"
                              h="30px"
                              borderRadius="lg"
                              bg="blue.50"
                              color="blue.700"
                              _hover={{ bg: "blue.100" }}
                              onClick={() => onEdit(dealer)}
                            />
                          </Tooltip>
                        )}
                        {stores.auth.hasPermission("masters", "delete") && (
                          <Tooltip label="Delete Dealer">
                            <IconButton
                              aria-label="Delete Dealer"
                              icon={<FiTrash2 size={13} />}
                              size="xs"
                              w="30px"
                              h="30px"
                              borderRadius="lg"
                              bg="red.50"
                              color="red.600"
                              _hover={{ bg: "red.100" }}
                              onClick={() => onDelete(dealer)}
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
          {dealers.TotalPages && dealers.TotalPages > 1 && (
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
                Page {currentPage} of {dealers.TotalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={currentPage >= dealers.TotalPages}
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
          title="Dealers"
          data={
            dealers.data?.map((t: any, index: number) => {
              return {
                ...t,
                sno: index + 1,
              };
            }) || []
          }
          columns={DealerTableColumns}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: stores.auth.hasPermission('masters', 'create'),
                function: () => {
                  onAdd();
                },
              },
              editKey: {
                showEditButton: stores.auth.hasPermission('masters', 'edit'),
                function: (e: any) => {
                  onEdit(e);
                },
              },
              viewKey: {
                showViewButton: stores.auth.hasPermission('masters', 'view'),
                function: (e: any) => {
                  handleRowClick(e);
                },
              },
              deleteKey: {
                showDeleteButton: stores.auth.hasPermission('masters', 'delete'),
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
              text: "Reset Data",
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: currentPage,
              totalPages: dealers.TotalPages || 1,
            },
          }}
          loading={dealers.loading}
        />
      )}

      <Drawer
        isOpen={isOpen}
        placement={detailsPlacement}
        onClose={() => {
          onClose();
          setSelectedDealer(null);
        }}
      >
        <DrawerOverlay />
        <DrawerContent
          w={{ base: "100vw", md: "80vw" }}
          maxW={{ base: "100vw", md: "80vw" }}
          h="100dvh"
          maxH="100dvh"
          borderRadius={0}
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <DrawerCloseButton color="white" bg="whiteAlpha.200" borderRadius="full" _hover={{ bg: "whiteAlpha.350" }} top={{ base: 2, md: 4 }} right={{ base: 2, md: 4 }} />
          <DrawerHeader
            bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
            color="white"
            py={{ base: 3, md: 4 }}
            fontSize={{ base: "sm", md: "lg" }}
          >
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              Dealer Profile
            </Flex>
          </DrawerHeader>

          {selectedUser && (
            <DrawerBody p={0} minH={0} overflowY="auto" overscrollBehaviorY="contain">
              <ViewDealer
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

export default DealersTable;
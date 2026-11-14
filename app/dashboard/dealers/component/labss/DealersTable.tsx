import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
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
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { MdShoppingBasket } from "react-icons/md";
import { FiEye, FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
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

  return (
    <Box p={{ base: 2, md: 4 }}>
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
        mobileCard={(row: any) => (
          <Card
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderLeft="4px solid"
            borderLeftColor="teal.500"
            borderRadius="xl"
            boxShadow="sm"
          >
            <CardBody p={3}>
              <Flex align="center" gap={3}>
                <Avatar name={row.name} size="md" bg="teal.100" color="teal.700" />
                <Box minW={0} flex={1}>
                  <Text fontWeight="bold" fontSize="sm" noOfLines={1} color="gray.800">
                    {row.name}
                  </Text>
                  <HStack mt={1} spacing={1.5} color="gray.500" fontSize="xs">
                    <FiCalendar />
                    <Text>Added {row.createdAt ? formatDate(row.createdAt) : "—"}</Text>
                  </HStack>
                </Box>
                <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} py={1} fontSize="10px">
                  Dealer
                </Badge>
              </Flex>

              {stores.auth.hasPermission("masters", "view") && (
                <Button
                  mt={3}
                  size="sm"
                  w="full"
                  minH="40px"
                  leftIcon={<MdShoppingBasket />}
                  colorScheme="teal"
                  variant="outline"
                  borderRadius="lg"
                  onClick={() => onItemView(row)}
                >
                  View orders portfolio
                </Button>
              )}

              <Divider my={2} />
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  Dealer actions
                </Text>
                <HStack spacing={1}>
                  {stores.auth.hasPermission("masters", "view") && (
                    <Tooltip label="View dealer">
                      <IconButton aria-label="View dealer" icon={<FiEye />} size="sm" minW="40px" minH="40px" variant="ghost" colorScheme="teal" onClick={() => handleRowClick(row)} />
                    </Tooltip>
                  )}
                  {stores.auth.hasPermission("masters", "edit") && (
                    <Tooltip label="Edit dealer">
                      <IconButton aria-label="Edit dealer" icon={<FiEdit2 />} size="sm" minW="40px" minH="40px" variant="ghost" colorScheme="blue" onClick={() => onEdit(row)} />
                    </Tooltip>
                  )}
                  {stores.auth.hasPermission("masters", "delete") && (
                    <Tooltip label="Delete dealer">
                      <IconButton aria-label="Delete dealer" icon={<FiTrash2 />} size="sm" minW="40px" minH="40px" variant="ghost" colorScheme="red" onClick={() => onDelete(row)} />
                    </Tooltip>
                  )}
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}
      />

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
          <DrawerCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <DrawerHeader
            bg={stores.themeStore.themeConfig.colors.custom.light.primary}
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
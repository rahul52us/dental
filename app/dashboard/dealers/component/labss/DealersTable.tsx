import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { MdShoppingBasket } from "react-icons/md";
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
  ];

  return (
    <Box p={4}>
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

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent minW={{ md: "80vw", sm: "100vw" }}>
          <DrawerCloseButton />
          <DrawerHeader bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white">
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              Dealer Profile
            </Flex>
          </DrawerHeader>

          {selectedUser && (
            <DrawerBody>
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
"use client";

import { Badge, Box, Flex, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import stores from "../../../../store/stores";
import ChairsForm from "../ChairsForm/ChairsForm";
import DeleteChairModal from "./DeleteChairModal";

const ChairsTable = observer(() => {
  const { chairsStore } = stores;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const [isDrawerOpen, setIsDrawerOpen] = useState<any>(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState(null);

  // --------------------------------------------
  // Fetch Chairs from API
  // --------------------------------------------
  const fetchChairs = useCallback(async () => {
    await chairsStore.getChairs({
      page: currentPage,
      limit: tablePageLimit,
      search: debouncedSearch,
    });
  }, [currentPage, debouncedSearch, chairsStore]);

  useEffect(() => {
    fetchChairs();
  }, [fetchChairs]);

  const resetTable = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const chairsData = chairsStore.chairs.data || [];
  const totalPages = chairsStore.chairs.totalPages || 1;

  // --------------------------------------------
  // Table Columns
  // --------------------------------------------
  const ChairColumns = [
    {
      headerName: "Chair No",
      key: "chairNo",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge colorScheme="cyan" size={"lg"} px={2} py={1} rounded={"full"}>
            {dt.chairNo}
          </Badge>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    {
      headerName: "Chair Name",
      key: "chairName",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Chair Color",
      key: "chairColor",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex justify={"center"}>
            <Box bg={dt.chairColor} boxSize={5} rounded={"full"}>
              {""}
            </Box>
          </Flex>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Details",
      key: "chairDetails",
      type: "tooltip",
      function: (c: any) =>
        c.chairDetails ? (
          <Tooltip label={c.chairDetails} hasArrow zIndex={9999}>
            <span>{c.chairDetails.slice(0, 40)}...</span>
          </Tooltip>
        ) : (
          "-"
        ),
      props: { row: { textAlign: "center" } },
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
    <>
      <CustomTable
        title="Chairs"
        data={chairsData}
        columns={ChairColumns}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: true,
              function: () => setIsDrawerOpen(true),
            },
            editKey: { showEditButton: false },
            deleteKey: {
              showDeleteButton: true,
              function: (c: any) => {
                setSelectedChair(c);
                setIsDeleteOpen(true); // open confirmation modal
              },
            },
          },
          search: {
            show: true,
            searchValue: search,
            onSearchChange: (e: any) => setSearch(e.target.value),
          },
          resetData: {
            show: true,
            text: "Reset Data",
            function: resetTable,
          },
          pagination: {
            show: true,
            currentPage,
            totalPages,
            onClick: (p: number) => setCurrentPage(p),
          },
        }}
        loading={chairsStore.chairs.loading}
      />

      <CustomDrawer
        open={isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        title="Add Chair"
      >
        <ChairsForm
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            fetchChairs(); // Refresh after add
          }}
        />
      </CustomDrawer>
      <DeleteChairModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        data={selectedChair}
        refresh={fetchChairs}
      />
    </>
  );
});

export default ChairsTable;

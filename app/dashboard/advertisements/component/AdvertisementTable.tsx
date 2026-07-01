import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Flex, Tooltip, IconButton, Switch, Image, Text, Badge } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import stores from "../../../store/stores";
import useDebounce from "../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../component/config/utils/variable";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import { formatDateTime } from "../../../component/config/utils/dateUtils";
import moment from "moment";

const AdvertisementTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const { advertisementStore: { getAdvertisements, updateAdvertisement, advertisements } } = stores;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAdvertisements = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const querySearch = debouncedSearchQuery?.trim() || "";
      getAdvertisements(page, limit, querySearch);
    },
    [debouncedSearchQuery, getAdvertisements]
  );

  useEffect(() => {
    applyGetAdvertisements({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAdvertisements]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAdvertisements({ reset: true });
  };

  const AdvertisementTableColumns = useMemo(() => [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Image",
      key: "image",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1} display="flex" justifyContent="center">
            {dt.image?.url ? (
              <Image src={dt.image?.url} alt="Advertisement" h="50px" w="auto" objectFit="cover" rounded="md" />
            ) : (
              <Text fontSize="xs" color="gray.500">No Image</Text>
            )}
          </Box>
        ),
      },
      props: {
        row: { minW: 100, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Title",
      key: "title",
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Valid From",
      key: "validFrom",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text>{moment(dt.validFrom).format("DD MMM YYYY")}</Text>
        )
      },
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Valid To",
      key: "validTo",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text>{moment(dt.validTo).format("DD MMM YYYY")}</Text>
        )
      },
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Link",
      key: "link",
      type: "component",
      metaData: {
        component: (dt: any) => (
          dt.link ? <a href={dt.link} target="_blank" rel="noreferrer" style={{color: 'blue'}}>Link</a> : <Text>-</Text>
        )
      },
      props: { row: { textAlign: "center" } }
    },
    {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Switch
            colorScheme="green"
            isChecked={dt.status}
            onChange={(e) => {
              updateAdvertisement(dt._id, { status: e.target.checked });
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
      headerName: "Actions",
      key: "actions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex gap={2} justify="center">
            <Tooltip label="Edit Advertisement">
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
            <Tooltip label="Delete Advertisement">
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
        row: { minW: 100, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ], [onEdit, onDelete, updateAdvertisement]);

  const tableData = useMemo(() => {
    return advertisements.data?.map((t: any, index: number) => ({
      ...t,
      sno: index + 1 + (currentPage - 1) * tablePageLimit,
    })) || [];
  }, [advertisements.data, currentPage]);

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
        function: () => {},
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
      totalPages: advertisements.totalPages || 1,
    },
  }), [onAdd, onEdit, onDelete, searchQuery, currentPage, advertisements.totalPages]);

  return (
    <Box p={4}>
      <CustomTable
        title="Advertisements"
        data={tableData}
        columns={AdvertisementTableColumns}
        actions={tableActions}
        loading={advertisements.loading}
      />
    </Box>
  );
});

export default AdvertisementTable;

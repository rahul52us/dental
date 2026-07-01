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
      props: { row: { textAlign: "center", fontWeight: "700", color: "gray.500" } }
    },
    {
      headerName: "Advertisement",
      key: "image",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex m={2} justify="center" align="center">
            {dt.image?.url ? (
              <Box position="relative" borderRadius="xl" overflow="hidden" boxShadow="md" _hover={{ transform: 'scale(1.05)', boxShadow: 'xl' }} transition="all 0.3s ease" bg="gray.100" p={1}>
                <Image src={dt.image?.url} alt="Ad" h="60px" w="100px" objectFit="contain" rounded="lg" bg="white" />
              </Box>
            ) : (
              <Box h="60px" w="100px" bg="gray.50" rounded="lg" display="flex" alignItems="center" justifyContent="center" border="1px dashed" borderColor="gray.300">
                <Text fontSize="xs" color="gray.400" fontWeight="600">No Image</Text>
              </Box>
            )}
          </Flex>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Details",
      key: "title",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box textAlign="left" pl={4}>
            <Text fontSize="md" fontWeight="800" color="gray.700" noOfLines={2} title={dt.title}>{dt.title}</Text>
            {dt.link && (
              <Text fontSize="xs" fontWeight="700" color="blue.500" mt={1} as="a" href={dt.link} target="_blank" rel="noreferrer" _hover={{ textDecoration: 'underline' }}>
                🔗 Visit Link
              </Text>
            )}
          </Box>
        )
      },
      props: { row: { textAlign: "left", minW: 200 } }
    },
    {
      headerName: "Validity",
      key: "validity",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex direction="column" gap={2} align="center">
            <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="widest">
              From: {moment(dt.validFrom).format("DD MMM YYYY")}
            </Badge>
            <Badge colorScheme="red" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="widest">
              To: {moment(dt.validTo).format("DD MMM YYYY")}
            </Badge>
          </Flex>
        )
      },
      props: { row: { textAlign: "center", minW: 180 } }
    },
    {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex direction="column" align="center" gap={1}>
            <Switch
              colorScheme="blue"
              size="lg"
              isChecked={dt.status}
              onChange={(e) => {
                updateAdvertisement(dt._id, { status: e.target.checked });
              }}
            />
            <Text fontSize="10px" fontWeight="800" color={dt.status ? "blue.500" : "gray.400"} textTransform="uppercase" letterSpacing="widest">
              {dt.status ? "Active" : "Inactive"}
            </Text>
          </Flex>
        ),
      },
      props: {
        row: { textAlign: "center", minW: 100 },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Actions",
      key: "actions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex gap={3} justify="center">
            <Tooltip label="Edit Advertisement" placement="top" hasArrow bg="blue.500">
              <IconButton
                aria-label="Edit"
                icon={<FaEdit />}
                size="md"
                colorScheme="blue"
                variant="light"
                bg="blue.50"
                color="blue.500"
                _hover={{ bg: "blue.100", transform: "translateY(-2px)" }}
                borderRadius="xl"
                onClick={() => onEdit(dt)}
                transition="all 0.2s"
              />
            </Tooltip>
            <Tooltip label="Delete Advertisement" placement="top" hasArrow bg="red.500">
              <IconButton
                aria-label="Delete"
                icon={<FaTrash />}
                size="md"
                colorScheme="red"
                variant="light"
                bg="red.50"
                color="red.500"
                _hover={{ bg: "red.100", transform: "translateY(-2px)" }}
                borderRadius="xl"
                onClick={() => onDelete(dt)}
                transition="all 0.2s"
              />
            </Tooltip>
          </Flex>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
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

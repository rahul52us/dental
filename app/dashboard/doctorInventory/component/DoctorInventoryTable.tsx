"use client";
import {
  Avatar,
  Badge,
  Box,
  Button,
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
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFileText,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";
import moment from "moment";

const DoctorInventoryTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const {
    doctorInventoryStore: { doctorInventories, getDoctorInventories },
  } = stores;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getDoctorInventories({ page, limit: tablePageLimit, search });
  }, [page, search, getDoctorInventories]);

  const handleChangePage = (p: number) => {
    setPage(p);
  };

  const columns = [
    {
      headerName: "Name",
      key: "labDoctor",
      type: "component",
      metaData: {
        component: (item: any) => (
          <Badge
            colorScheme={"blue"}
            variant="solid"
            borderRadius="full"
            fontSize="sm"
            fontWeight="semibold"
          >
            {typeof item.labDoctor === "object" && item.labDoctor !== null
              ? item.labDoctor.labDoctorName || item.labDoctor.label || item.labDoctor.value || "Unknown"
              : item.labDoctor || "Unknown"}
          </Badge>
        ),
      },
    },
    {
      headerName: "Description",
      key: "description",
    },
    {
      headerName: "Date",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (item: any) => (
          <span>{moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
        )
      }
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: { row: { textAlign: "right" } },
    },
  ];

  return (
    <Box p={{ base: 2, md: 0 }}>
      {isMobile ? (
        /* ============================================================== */
        /* MOBILE VIEW: DEDICATED NATIVE APP PERSPECTIVE                  */
        /* ============================================================== */
        <Box pb={8}>
          {/* Top App Bar / Actions Strip */}
          <Flex justify="space-between" align="center" mb={3} gap={2} px={1}>
            <HStack spacing={2}>
              <Text fontSize="16px" fontWeight="900" color="gray.800" letterSpacing="-0.3px">
                In & Out Ledger
              </Text>
              <Badge
                bg="rgba(13, 148, 136, 0.12)"
                color="teal.700"
                border="1px solid"
                borderColor="rgba(13, 148, 136, 0.25)"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="11px"
                fontWeight="800"
              >
                {doctorInventories.data?.length || 0}
              </Badge>
            </HStack>

            {stores.auth.hasPermission("doctorInventory", "create") && (
              <Button
                size="sm"
                bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
                _active={{ transform: "scale(0.96)" }}
                leftIcon={<IoMdAdd fontSize="16px" />}
                borderRadius="xl"
                fontWeight="800"
                px={3.5}
                h="36px"
                boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                onClick={onAdd}
              >
                Add Ledger
              </Button>
            )}
          </Flex>

          {/* Search Box */}
          <InputGroup size="sm" mb={3}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#94A3B8" />
            </InputLeftElement>
            <Input
              placeholder="Search ledger doctor, description..."
              value={search}
              onChange={(e: any) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              borderRadius="xl"
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px #0D9488",
              }}
            />
            {search && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear search"
                  icon={<FiX size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                />
              </InputRightElement>
            )}
          </InputGroup>

          {/* Cards List or Loading / Empty state */}
          {doctorInventories.loading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading ledger records...</Text>
            </Flex>
          ) : !doctorInventories.data || doctorInventories.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg="white"
              borderRadius="22px"
              border="1px dashed"
              borderColor="gray.200"
              textAlign="center"
            >
              <Icon as={FiFileText} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Ledger Records Found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {search ? `No matching records for "${search}"` : "Tap + Add Ledger to create a new ledger record."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {doctorInventories.data.map((item: any, idx: number) => {
                const doctorName =
                  typeof item.labDoctor === "object" && item.labDoctor !== null
                    ? item.labDoctor.labDoctorName || item.labDoctor.label || item.labDoctor.value || "Unknown"
                    : item.labDoctor || "Unknown";

                const dateFormatted = item.createdAt
                  ? moment(item.createdAt).format("DD MMM YYYY, hh:mm A")
                  : "—";

                return (
                  <Box
                    key={item._id || idx}
                    bg="white"
                    border="1px solid"
                    borderColor="#E8EEF4"
                    borderRadius="20px"
                    p={3.5}
                    boxShadow="0 6px 18px -8px rgba(15, 23, 42, 0.12)"
                    position="relative"
                  >
                    {/* Top Row: Identity & Date */}
                    <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
                      <HStack spacing={2.5} align="center" flex={1} minW={0}>
                        <Avatar
                          size="sm"
                          boxSize="38px"
                          name={doctorName}
                          borderRadius="12px"
                          bg="linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)"
                          color="teal.800"
                          fontWeight="900"
                          border="2px solid white"
                          boxShadow="0 2px 8px rgba(15,23,42,0.08)"
                          flexShrink={0}
                        />
                        <Box flex={1} minW={0}>
                          <Text fontSize="14.5px" fontWeight="850" color="gray.850" noOfLines={1} letterSpacing="-0.2px">
                            {doctorName}
                          </Text>
                          <HStack spacing={1} color="gray.400" fontSize="11px" mt={0.5}>
                            <Icon as={FiCalendar} boxSize={3} />
                            <Text>{dateFormatted}</Text>
                          </HStack>
                        </Box>
                      </HStack>
                    </Flex>

                    {/* Description Box */}
                    {item.description ? (
                      <Box
                        bg="gray.50"
                        borderRadius="xl"
                        p={2.5}
                        my={2}
                        border="1px solid"
                        borderColor="gray.150"
                      >
                        <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" mb={0.5}>
                          Description
                        </Text>
                        <Text fontSize="12.5px" color="gray.700" fontWeight="500" wordBreak="break-word">
                          {item.description}
                        </Text>
                      </Box>
                    ) : (
                      <Box my={1} />
                    )}

                    {/* Action Buttons Toolbar */}
                    <Flex justify="flex-end" align="center" pt={1.5} borderTop="1px dashed" borderColor="gray.100" gap={1}>
                      {stores.auth.hasPermission("doctorInventory", "edit") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiEdit2 size={12} />}
                          onClick={() => onEdit(item)}
                          borderRadius="lg"
                          fontSize="11px"
                          fontWeight="700"
                        >
                          Edit
                        </Button>
                      )}
                      {stores.auth.hasPermission("doctorInventory", "delete") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiTrash2 size={12} />}
                          onClick={() => onDelete(item)}
                          borderRadius="lg"
                          fontSize="11px"
                          fontWeight="700"
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

          {/* Pagination Controls */}
          {doctorInventories.TotalPages > 1 && (
            <Flex justify="space-between" align="center" mt={4} pt={2}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                leftIcon={<FiChevronLeft size={14} />}
                isDisabled={page <= 1}
                onClick={() => handleChangePage(page - 1)}
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color="gray.600">
                Page {page} of {doctorInventories.TotalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={page >= doctorInventories.TotalPages}
                onClick={() => handleChangePage(page + 1)}
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        /* ============================================================== */
        /* DESKTOP VIEW: 100% UNCHANGED AS ORIGINAL                       */
        /* ============================================================== */
        <CustomTable
          title="In & Out Ledger"
          columns={columns}
          data={doctorInventories.data || []}
          loading={doctorInventories.loading}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: stores.auth.hasPermission('doctorInventory', 'create'),
                function: () => onAdd(),
              },
              editKey: {
                showEditButton: stores.auth.hasPermission('doctorInventory', 'edit'),
                function: (row: any) => onEdit(row),
              },
              deleteKey: {
                showDeleteButton: stores.auth.hasPermission('doctorInventory', 'delete'),
                function: (row: any) => onDelete(row),
              },
            },
            search: {
              show: true,
              searchValue: search,
              onSearchChange: (e: any) => {
                setSearch(e.target.value);
                setPage(1);
              },
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage: page,
              totalPages: doctorInventories.TotalPages || 1,
            },
          }}
        />
      )}
    </Box>
  );
});

export default DoctorInventoryTable;

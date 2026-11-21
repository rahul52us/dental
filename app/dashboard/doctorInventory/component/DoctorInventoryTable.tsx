"use client";
import {
  useColorModeValue,

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
import { CardListSkeleton } from "../../../component/common/Loader/ContentSkeleton";
import { tablePageLimit } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";
import moment from "moment";

const DoctorInventoryTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  // Theme & Dark Mode tokens
  const invTitleColor = useColorModeValue("gray.800", "white");
  const invSubtextColor = useColorModeValue("gray.500", "gray.400");
  const invCardBg = useColorModeValue("white", "gray.800");
  const invCardBorder = useColorModeValue("#E8EEF4", "gray.700");
  const invSearchBg = useColorModeValue("white", "gray.800");
  const invSearchBorder = useColorModeValue("gray.200", "gray.700");
  const invSearchColor = useColorModeValue("gray.800", "white");
  const invDescBg = useColorModeValue("gray.50", "gray.700");
  const invDescBorder = useColorModeValue("gray.150", "gray.600");
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
              <Text fontSize="16px" fontWeight="900" color={invTitleColor} letterSpacing="-0.3px">
                In & Out Ledger
              </Text>
              <Badge
                bg={useColorModeValue("rgba(13, 148, 136, 0.12)", "rgba(13, 148, 136, 0.25)")}
                color={useColorModeValue("teal.700", "teal.200")}
                border="1px solid"
                borderColor={useColorModeValue("rgba(13, 148, 136, 0.25)", "rgba(13, 148, 136, 0.4)")}
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
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
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
          <InputGroup size="sm" mb={2}>
            <InputLeftElement pointerEvents="none" h="40px">
              <FiSearch color="#94A3B8" />
            </InputLeftElement>
            <Input
              placeholder="Search ledger doctor, description..."
              value={search}
              onChange={(e: any) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              borderRadius="12px"
              h="40px"
              bg={invSearchBg}
              borderColor={invSearchBorder}
              color={invSearchColor}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px #0D9488",
              }}
            />
            {search && (
              <InputRightElement h="40px">
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
            <CardListSkeleton count={4} />
          ) : !doctorInventories.data || doctorInventories.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={invCardBg}
              borderRadius="22px"
              border="1px dashed"
              borderColor={invCardBorder}
              textAlign="center"
            >
              <Icon as={FiFileText} boxSize="36px" color={invSubtextColor} mb={2} />
              <Text fontSize="14px" fontWeight="750" color={invTitleColor}>
                No Ledger Records Found
              </Text>
              <Text fontSize="12px" color={invSubtextColor} mt={1}>
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
                    bg={invCardBg}
                    border="1px solid"
                    borderColor={invCardBorder}
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
                          border="2px solid"
                          borderColor={invCardBorder}
                          boxShadow="0 2px 8px rgba(15,23,42,0.08)"
                          flexShrink={0}
                        />
                        <Box flex={1} minW={0}>
                          <Text fontSize="14.5px" fontWeight="850" color={invTitleColor} noOfLines={1} letterSpacing="-0.2px">
                            {doctorName}
                          </Text>
                          <HStack spacing={1} color={invSubtextColor} fontSize="11px" mt={0.5}>
                            <Icon as={FiCalendar} boxSize={3} />
                            <Text>{dateFormatted}</Text>
                          </HStack>
                        </Box>
                      </HStack>
                    </Flex>

                    {/* Description Box */}
                    {item.description ? (
                      <Box
                        bg={invDescBg}
                        borderRadius="xl"
                        p={2.5}
                        my={2}
                        border="1px solid"
                        borderColor={invDescBorder}
                      >
                        <Text fontSize="10px" fontWeight="700" color={invSubtextColor} textTransform="uppercase" mb={0.5}>
                          Description
                        </Text>
                        <Text fontSize="12.5px" color={useColorModeValue("gray.700", "gray.200")} fontWeight="500" wordBreak="break-word">
                          {item.description}
                        </Text>
                      </Box>
                    ) : (
                      <Box my={1} />
                    )}

                    {/* Action Buttons Toolbar */}
                    <Flex justify="flex-end" align="center" pt={1.5} borderTop="1px dashed" borderColor={invDescBorder} gap={1}>
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

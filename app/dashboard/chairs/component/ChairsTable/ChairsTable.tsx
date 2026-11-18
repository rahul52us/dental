"use client";

import {
  Badge,
  Box,
  Button,
  Circle,
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
  Tooltip,
  VStack,
  Heading,
  useBreakpointValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import { FaChair } from "react-icons/fa";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import stores from "../../../../store/stores";
import ChairsForm from "../ChairsForm/ChairsForm";
import DeleteChairModal from "./DeleteChairModal";

const ChairsTable = observer(() => {
  const { chairsStore } = stores;
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);

  const [isDrawerOpen, setIsDrawerOpen] = useState<false | "add" | "edit">(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState<any>(null);

  // --------------------------------------------
  // Fetch Chairs
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
  // Columns (Desktop)
  // --------------------------------------------
  const ChairColumns = [
    {
      headerName: "Chair No",
      key: "chairNo",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge colorScheme="cyan" size="lg" px={2.5} py={1} rounded="full" fontWeight="800">
            {dt?.chairNo}
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
          <Flex justify="center">
            <Box
              bg={dt?.chairColor || "#0D9488"}
              boxSize={6}
              rounded="full"
              border="2px solid white"
              boxShadow="0 2px 6px rgba(0,0,0,0.2)"
            />
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
        c?.chairDetails ? (
          <Tooltip label={c?.chairDetails} hasArrow zIndex={9999}>
            <span>{c?.chairDetails.slice(0, 40)}...</span>
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
    <Box p={{ base: 2, sm: 3, md: 0 }}>
      {/* ============================================================== */}
      {/* MOBILE VIEW: DEDICATED NATIVE APP PERSPECTIVE (< 768px via CSS)*/}
      {/* ============================================================== */}
      <Box display={{ base: "block", md: "none" }} pb={10}>
        <VStack spacing={3} align="stretch">
          {/* 1. Sleek Gradient Hero Card */}
          <Box
            p={4}
            borderRadius="22px"
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            boxShadow="0 8px 20px -4px rgba(12, 74, 110, 0.35)"
            position="relative"
            overflow="hidden"
          >
            <Circle position="absolute" size="130px" bg="whiteAlpha.100" right="-25px" bottom="-35px" />
            <Circle position="absolute" size="70px" bg="teal.300" opacity="0.15" left="-20px" top="-20px" />

            <Flex justify="space-between" align="center" position="relative" zIndex={1}>
              <HStack spacing={3}>
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="14px"
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={FaChair} boxSize={5} color="white" />
                </Flex>
                <Box>
                  <HStack spacing={2} mb={0.5}>
                    <Text fontSize="9px" fontWeight="800" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.8px">
                      OPERATORY MANAGEMENT
                    </Text>
                    <Badge
                      bg="whiteAlpha.300"
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={0.2}
                      fontSize="10px"
                      fontWeight="800"
                    >
                      {chairsData.length} CHAIRS
                    </Badge>
                  </HStack>
                  <Heading fontSize="18px" fontWeight="900" letterSpacing="-0.3px" color="white" lineHeight="1.2">
                    Dental Chairs
                  </Heading>
                  <Text color="whiteAlpha.900" fontSize="11px" fontWeight="500" mt={0.5}>
                    Operatory stations & color coordination
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </Box>

          {/* 2. Unified Power Action Bar (Search + Add Chair) */}
          <Flex gap={2} align="center">
            <InputGroup size="sm" flex={1}>
              <InputLeftElement pointerEvents="none" h="42px">
                <FiSearch color="#94A3B8" />
              </InputLeftElement>
              <Input
                placeholder="Search chair name, number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="white"
                focusBorderColor="teal.500"
                borderRadius="16px"
                border="1px solid"
                borderColor="gray.200"
                h="42px"
                fontSize="13px"
                boxShadow="0 2px 6px rgba(0,0,0,0.02)"
              />
              {search && (
                <InputRightElement h="42px">
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX size={12} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setSearch("")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            {stores.auth.hasPermission('chairs', 'create') && (
              <Button
                size="sm"
                h="42px"
                bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
                _active={{ transform: "scale(0.96)" }}
                leftIcon={<FiPlus fontSize="16px" />}
                borderRadius="16px"
                fontWeight="800"
                fontSize="12px"
                px={3.5}
                boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                onClick={() => {
                  setSelectedChair(null);
                  setIsDrawerOpen("add");
                }}
                flexShrink={0}
              >
                Add Chair
              </Button>
            )}
          </Flex>

          {/* 3. Native Chair Cards List */}
          {chairsStore.chairs.loading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading dental chairs...</Text>
            </Flex>
          ) : chairsData.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg="white"
              borderRadius="20px"
              border="1px dashed"
              borderColor="gray.200"
              textAlign="center"
            >
              <Icon as={FaChair} boxSize={40} color="gray.400" mb={2} />
              <Text fontSize="15px" fontWeight="800" color="gray.700">
                No chairs found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1} mb={3}>
                {search ? `No chairs matching "${search}"` : "Add your first dental chair operatory station."}
              </Text>
              {stores.auth.hasPermission('chairs', 'create') && (
                <Button
                  size="sm"
                  bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                  color="white"
                  borderRadius="xl"
                  onClick={() => {
                    setSelectedChair(null);
                    setIsDrawerOpen("add");
                  }}
                >
                  + Add Chair
                </Button>
              )}
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {chairsData.map((chair: any) => {
                const chairColor = chair.chairColor || "#0D9488";
                return (
                  <Box
                    key={chair._id}
                    bg="white"
                    border="1px solid"
                    borderColor="#E8EEF4"
                    borderRadius="20px"
                    p={3.5}
                    boxShadow="0 4px 14px -6px rgba(15, 23, 42, 0.08)"
                    transition="all 0.15s ease-out"
                    _active={{ bg: "gray.50" }}
                  >
                    {/* Card Top Row: Color Swatch + Name + Chair No Badge */}
                    <Flex justify="space-between" align="flex-start" gap={3} mb={2}>
                      <HStack spacing={3} flex={1} minW={0}>
                        {/* Operatory Color Swatch Pill */}
                        <Flex
                          w="42px"
                          h="42px"
                          borderRadius="14px"
                          bg={chairColor}
                          color="white"
                          boxShadow={`0 4px 12px ${chairColor}44`}
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Icon as={FaChair} boxSize={5} />
                        </Flex>

                        <Box minW={0} flex={1}>
                          <HStack spacing={2} align="center">
                            <Text
                              fontSize="15px"
                              fontWeight="900"
                              color="#0C4A6E"
                              noOfLines={1}
                              letterSpacing="-0.2px"
                            >
                              {chair.chairName || `Chair ${chair.chairNo}`}
                            </Text>
                          </HStack>

                          {chair.chairDetails ? (
                            <Text fontSize="12px" color="gray.600" fontWeight="600" mt={0.5} noOfLines={2}>
                              {chair.chairDetails}
                            </Text>
                          ) : (
                            <Text fontSize="11px" color="gray.400" fontStyle="italic" mt={0.5}>
                              No details specified
                            </Text>
                          )}
                        </Box>
                      </HStack>

                      <Badge
                        bg="cyan.50"
                        color="cyan.800"
                        border="1px solid"
                        borderColor="cyan.200"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="11px"
                        fontWeight="800"
                        flexShrink={0}
                      >
                        #{chair.chairNo}
                      </Badge>
                    </Flex>

                    {/* Footer Action Toolbar */}
                    <Flex
                      justify="space-between"
                      align="center"
                      pt={2}
                      borderTop="1px solid"
                      borderColor="gray.100"
                      gap={2}
                    >
                      <HStack spacing={2}>
                        <Box
                          w="10px"
                          h="10px"
                          borderRadius="full"
                          bg={chairColor}
                          border="1px solid rgba(0,0,0,0.1)"
                        />
                        <Text fontSize="11px" fontWeight="700" color="gray.500">
                          {chairColor}
                        </Text>
                      </HStack>

                      <HStack spacing={1.5}>
                        {stores.auth.hasPermission('chairs', 'edit') && (
                          <Button
                            size="xs"
                            h="28px"
                            px={2.5}
                            variant="ghost"
                            colorScheme="blue"
                            bg="blue.50"
                            _hover={{ bg: "blue.100" }}
                            borderRadius="lg"
                            fontWeight="700"
                            fontSize="11px"
                            leftIcon={<FiEdit2 size={12} />}
                            onClick={() => {
                              setSelectedChair(chair);
                              setIsDrawerOpen("edit");
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {stores.auth.hasPermission('chairs', 'delete') && (
                          <IconButton
                            size="xs"
                            w="28px"
                            h="28px"
                            variant="ghost"
                            colorScheme="red"
                            bg="red.50"
                            _hover={{ bg: "red.100" }}
                            borderRadius="lg"
                            icon={<FiTrash2 size={12} />}
                            aria-label="Delete"
                            onClick={() => {
                              setSelectedChair(chair);
                              setIsDeleteOpen(true);
                            }}
                          />
                        )}
                      </HStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Mobile Pagination Controls */}
          {totalPages > 1 && (
            <Flex justify="space-between" align="center" pt={3} px={1}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                leftIcon={<FiChevronLeft size={14} />}
                isDisabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color="gray.600">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </Flex>
          )}
        </VStack>
      </Box>

      {/* ============================================================== */}
      {/* DESKTOP VIEW: ORIGINAL TABLE (>= 768px via CSS)                */}
      {/* ============================================================== */}
      <Box display={{ base: "none", md: "block" }}>
        <CustomTable
          title="Chairs"
          data={chairsData}
          columns={ChairColumns}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: stores.auth.hasPermission('chairs', 'create'),
                function: () => {
                  setSelectedChair(null);
                  setIsDrawerOpen("add");
                },
              },

              editKey: {
                showEditButton: stores.auth.hasPermission('chairs', 'edit'),
                function: (c: any) => {
                  setSelectedChair(c);
                  setIsDrawerOpen("edit");
                },
              },

              deleteKey: {
                showDeleteButton: stores.auth.hasPermission('chairs', 'delete'),
                function: (c: any) => {
                  setSelectedChair(c);
                  setIsDeleteOpen(true);
                },
              },
            },

            search: {
              show: false,
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
      </Box>

      {/* Drawer */}
      <CustomDrawer
        open={!!isDrawerOpen}
        close={() => setIsDrawerOpen(false)}
        title={selectedChair ? "Update Chair" : "Add Chair"}
      >
        <ChairsForm
          isOpen={!!isDrawerOpen}
          isEdit={!!selectedChair}
          initialValues={
            selectedChair || {
              chairName: "",
              chairColor: "",
              chairDetails: "",
              chairNo: "",
            }
          }
          onClose={() => {
            setIsDrawerOpen(false);
            fetchChairs();
          }}
        />
      </CustomDrawer>

      {/* Delete Modal */}
      <DeleteChairModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        data={selectedChair}
        refresh={fetchChairs}
      />
    </Box>
  );
});

export default ChairsTable;
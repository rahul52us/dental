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
  SimpleGrid,
  Spinner,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiUserX,
  FiX,
} from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";

const LabDoctorTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const {
    labDoctorStore: { labDoctors, getLabDoctors },
  } = stores;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getLabDoctors({ page, limit: tablePageLimit, search });
  }, [page, search, getLabDoctors]);

  const handleChangePage = (p: number) => {
    setPage(p);
  };

  const columns = [
    {
      headerName: "Name",
      key: "gender",
      type: "component",
      metaData: {
        component: (doctor: any) => {
          const colorScheme =
            doctor.gender === 1
              ? "blue"
              : doctor.gender === 2
                ? "pink"
                : "gray";

          return (
            <Badge
              colorScheme={colorScheme}
              variant="solid"
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {doctor.labDoctorName}
            </Badge>
          );
        },
      },
    },
    {
      headerName: "Email / Mobile",
      key: "email",
      type: "component",
      metaData: {
        component: (doctor: any) => (
          <VStack spacing={0}>
            <Text fontSize="sm">{doctor.email}</Text>
            <Text fontSize="xs" color="gray.500">{doctor.mobileNumber}</Text>
          </VStack>
        ),
      },
    },
    {
      headerName: "Languages",
      key: "languages",
      type: "component",
      metaData: {
        component: (doctor: any) => (
          <HStack>
            {doctor.languages?.map((lang: string) => (
              <Badge key={lang} variant="outline" size="sm" textTransform="capitalize">
                {lang}
              </Badge>
            ))}
          </HStack>
        ),
      },
    },
    {
      headerName: "Address",
      key: "address",
      // props: { row: { isTruncated: true, maxW: "200px" } },
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
                Lab Doctors
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
                {labDoctors.data?.length || 0}
              </Badge>
            </HStack>

            {stores.auth.hasPermission("lab_doctors", "create") && (
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
                Add Doctor
              </Button>
            )}
          </Flex>

          {/* Search Box */}
          <InputGroup size="sm" mb={3}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#94A3B8" />
            </InputLeftElement>
            <Input
              placeholder="Search doctor name, email, phone..."
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
          {labDoctors.loading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading lab doctors...</Text>
            </Flex>
          ) : !labDoctors.data || labDoctors.data.length === 0 ? (
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
              <Icon as={FiUserX} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Lab Doctors Found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {search ? `No results for "${search}"` : "Tap + Add Doctor to register a lab doctor."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {labDoctors.data.map((doctor: any, idx: number) => {
                const isMale = doctor.gender === 1;
                const isFemale = doctor.gender === 2;
                const genderText = isMale ? "Male" : isFemale ? "Female" : "Other";
                const staffCount = doctor.staffDetails?.length || 0;

                return (
                  <Box
                    key={doctor._id || idx}
                    bg="white"
                    border="1px solid"
                    borderColor="#E8EEF4"
                    borderRadius="20px"
                    p={3.5}
                    boxShadow="0 6px 18px -8px rgba(15, 23, 42, 0.12)"
                    position="relative"
                  >
                    {/* Top Row: Identity */}
                    <Flex justify="space-between" align="flex-start" gap={3} mb={2.5}>
                      <HStack spacing={3} align="center" flex={1} minW={0}>
                        <Avatar
                          size="md"
                          boxSize="44px"
                          name={doctor.labDoctorName}
                          borderRadius="14px"
                          bg={
                            isMale
                              ? "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)"
                              : isFemale
                              ? "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)"
                              : "linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)"
                          }
                          color={isMale ? "blue.700" : isFemale ? "pink.700" : "teal.800"}
                          fontWeight="900"
                          border="2px solid white"
                          boxShadow="0 4px 10px rgba(15,23,42,0.08)"
                          flexShrink={0}
                        />

                        <Box flex={1} minW={0}>
                          <Text fontSize="15px" fontWeight="850" color="gray.850" noOfLines={1} letterSpacing="-0.2px">
                            {doctor.labDoctorName}
                          </Text>
                          <HStack spacing={1.5} mt={0.5} wrap="wrap">
                            <Badge
                              bg={isMale ? "blue.50" : isFemale ? "pink.50" : "gray.100"}
                              color={isMale ? "blue.700" : isFemale ? "pink.700" : "gray.700"}
                              border="1px solid"
                              borderColor={isMale ? "blue.200" : isFemale ? "pink.200" : "gray.200"}
                              borderRadius="full"
                              px={2}
                              py={0.2}
                              fontSize="9.5px"
                              fontWeight="800"
                              textTransform="uppercase"
                            >
                              {genderText}
                            </Badge>

                            {staffCount > 0 && (
                              <Badge
                                bg="purple.50"
                                color="purple.700"
                                border="1px solid"
                                borderColor="purple.200"
                                borderRadius="full"
                                px={2}
                                py={0.2}
                                fontSize="9.5px"
                                fontWeight="800"
                              >
                                {staffCount} Staff
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      </HStack>
                    </Flex>

                    {/* Contact Details Meta */}
                    <VStack spacing={1.5} align="stretch" py={2} borderTop="1px dashed" borderColor="gray.100">
                      {doctor.email && (
                        <HStack spacing={2} fontSize="12px" color="gray.600">
                          <Icon as={FiMail} color="teal.500" boxSize={3.5} flexShrink={0} />
                          <Text noOfLines={1}>{doctor.email}</Text>
                        </HStack>
                      )}
                      {doctor.mobileNumber && (
                        <HStack spacing={2} fontSize="12px" color="gray.600">
                          <Icon as={FiPhone} color="teal.500" boxSize={3.5} flexShrink={0} />
                          <Text fontWeight="600">{doctor.mobileNumber}</Text>
                        </HStack>
                      )}
                      {doctor.address && (
                        <HStack spacing={2} fontSize="11.5px" color="gray.500">
                          <Icon as={FiMapPin} boxSize={3.5} flexShrink={0} />
                          <Text noOfLines={1}>{doctor.address}</Text>
                        </HStack>
                      )}
                    </VStack>

                    {/* Languages Strip if available */}
                    {doctor.languages && doctor.languages.length > 0 && (
                      <HStack spacing={1.5} wrap="wrap" pt={1.5} pb={1} borderTop="1px dashed" borderColor="gray.100">
                        <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">
                          Languages:
                        </Text>
                        {doctor.languages.map((lang: string) => (
                          <Badge
                            key={lang}
                            bg="gray.50"
                            color="gray.600"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            px={1.5}
                            py={0.2}
                            fontSize="9.5px"
                            fontWeight="700"
                            textTransform="capitalize"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </HStack>
                    )}

                    {/* Action Buttons Toolbar */}
                    <Flex justify="flex-end" align="center" pt={1.5} borderTop="1px dashed" borderColor="gray.100" gap={1}>
                      {stores.auth.hasPermission("lab_doctors", "edit") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiEdit2 size={12} />}
                          onClick={() => onEdit(doctor)}
                          borderRadius="lg"
                          fontSize="11px"
                          fontWeight="700"
                        >
                          Edit
                        </Button>
                      )}
                      {stores.auth.hasPermission("lab_doctors", "delete") && (
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiTrash2 size={12} />}
                          onClick={() => onDelete(doctor)}
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
          {labDoctors.TotalPages > 1 && (
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
                Page {page} of {labDoctors.TotalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={page >= labDoctors.TotalPages}
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
          title="Lab Doctors"
          columns={columns}
          data={labDoctors.data || []}
          loading={labDoctors.loading}
          actions={{
            actionBtn: {
              addKey: {
                showAddButton: stores.auth.hasPermission('lab_doctors', 'create'),
                function: onAdd,
              },
              editKey: {
                showEditButton: stores.auth.hasPermission('lab_doctors', 'edit'),
                function: onEdit,
              },
              deleteKey: {
                showDeleteButton: stores.auth.hasPermission('lab_doctors', 'delete'),
                function: onDelete,
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
              totalPages: labDoctors.TotalPages || 1,
            },
          }}
        />
      )}
    </Box>
  );
});

export default LabDoctorTable;

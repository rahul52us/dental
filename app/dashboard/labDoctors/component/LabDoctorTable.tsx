"use client";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEllipsisV, FaPlus } from "react-icons/fa";
import stores from "../../../store/stores";
import { tablePageLimit } from "../../../component/config/utils/variable";

const LabDoctorTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    labDoctorStore: { labDoctors, getLabDoctors },
  } = stores;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getLabDoctors({ page, limit: tablePageLimit, search });
  }, [page, search, getLabDoctors]);

  const handleSearch = (e: any) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={4}>
          <Input
            placeholder="Search Lab Doctors..."
            value={search}
            onChange={handleSearch}
            maxW="300px"
          />
        </HStack>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          onClick={onAdd}
        >
          Add Lab Doctor
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Name</Th>
              <Th>Email / Mobile</Th>
              <Th>Gender</Th>
              <Th>Languages</Th>
              <Th>Address</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {labDoctors.loading ? (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  Loading...
                </Td>
              </Tr>
            ) : labDoctors.data.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  No Lab Doctors found.
                </Td>
              </Tr>
            ) : (
              labDoctors.data.map((doctor: any) => (
                <Tr key={doctor._id}>
                  <Td fontWeight="medium">{doctor.labDoctorName}</Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">{doctor.email}</Text>
                      <Text fontSize="xs" color="gray.500">{doctor.mobileNumber}</Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={doctor.gender === 1 ? "blue" : doctor.gender === 2 ? "pink" : "gray"}>
                      {doctor.gender === 1 ? "Male" : doctor.gender === 2 ? "Female" : "Other"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      {doctor.languages?.map((lang: string) => (
                        <Badge key={lang} variant="outline" size="sm">{lang}</Badge>
                      ))}
                    </HStack>
                  </Td>
                  <Td isTruncated maxW="200px">{doctor.address}</Td>
                  <Td textAlign="right">
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem icon={<FaEdit />} onClick={() => onEdit(doctor)}>
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<FaTrash />}
                          color="red.500"
                          onClick={() => onDelete(doctor)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={4}>
        <Text fontSize="sm" color="gray.600">
          Page {page} of {labDoctors.TotalPages || 1}
        </Text>
        <HStack>
          <Button
            size="sm"
            onClick={() => setPage(page - 1)}
            isDisabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setPage(page + 1)}
            isDisabled={page >= labDoctors.TotalPages}
          >
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
});


export default LabDoctorTable;

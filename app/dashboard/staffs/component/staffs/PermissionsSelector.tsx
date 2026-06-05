import React, { useMemo, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Text,
  VStack,
  HStack,
  Icon,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
} from "@chakra-ui/react";
import {
  FiUser,
  FiActivity,
  FiUsers,
  FiCalendar,
  FiRefreshCw,
  FiBox,
  FiFileText,
  FiDollarSign,
  FiSettings,
  FiUserCheck,
  FiSearch,
} from "react-icons/fi";

export const MODULES = [
  { id: "patient", label: "Patient Management", icon: FiUser, color: "blue", category: "Clinical" },
  { id: "treatment", label: "Treatments", icon: FiActivity, color: "teal", category: "Clinical" },
  { id: "workdone", label: "Work Done / Clinical Records", icon: FiActivity, color: "green", category: "Clinical" },
  { id: "doctor", label: "Doctor Management", icon: FiUserCheck, color: "teal", category: "Clinical" },
  { id: "appointment", label: "Appointments", icon: FiCalendar, color: "purple", category: "Clinical" },
  { id: "recall", label: "Recalls", icon: FiRefreshCw, color: "orange", category: "Clinical" },
  { id: "lab", label: "Lab Work", icon: FiBox, color: "cyan", category: "Lab" },
  { id: "reports", label: "Financial Reports", icon: FiFileText, color: "red", category: "Admin" },
  { id: "accountability", label: "Financial Accountability", icon: FiDollarSign, color: "pink", category: "Admin" },
  { id: "doctorInventory", label: "Doctor Inventory", icon: FiBox, color: "cyan", category: "Lab" },
  { id: "masters", label: "Masters (Prescription/Procedure)", icon: FiSettings, color: "gray", category: "Admin" },
  { id: "staffs", label: "Staff Management", icon: FiUsers, color: "indigo", category: "Admin" },
  { id: "chairs", label: "Chair Management", icon: FiActivity, color: "yellow", category: "Clinical" },
];

export const PERMISSIONS = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete" },
  { id: "download", label: "Download" },
  { id: "print", label: "Print" },
  { id: "sidebar", label: "Sidebar" },
];

interface PermissionsSelectorProps {
  permissions: any;
  onChange: (newPermissions: any) => void;
}

const PermissionsSelector: React.FC<PermissionsSelectorProps> = ({ permissions, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = (moduleId: string, permId: string) => {
    onChange({
      ...permissions,
      [moduleId]: {
        ...(permissions[moduleId] || {}),
        [permId]: !permissions[moduleId]?.[permId],
      },
    });
  };

  const handleRowToggle = (moduleId: string) => {
    const allChecked = PERMISSIONS.every((p) => permissions[moduleId]?.[p.id]);
    const newState: any = {};
    PERMISSIONS.forEach((p) => {
      newState[p.id] = !allChecked;
    });
    onChange({
      ...permissions,
      [moduleId]: newState,
    });
  };

  const filteredModules = useMemo(() => {
    return MODULES.filter(
      (m) =>
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Box>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none" h="full" ml={2}>
          <FiSearch color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search modules or categories..."
          size="md"
          borderRadius="xl"
          bg="white"
          borderWidth="2px"
          _focus={{ borderColor: "brand.500", shadow: "sm" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="xl">
        <Table variant="simple" size="sm">
          <Thead bg="gray.50" position="sticky" top={0} zIndex={10}>
            <Tr>
              <Th py={3} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Module
              </Th>
              {PERMISSIONS.map((p) => (
                <Th key={p.id} py={3} textAlign="center" fontSize="xs" color="gray.500">
                  {p.label}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredModules.map((m) => (
              <Tr key={m.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                <Td py={3} minW="220px">
                  <HStack spacing={3} onClick={() => handleRowToggle(m.id)} cursor="pointer">
                    <Box p={2} bg={`${m.color}.50`} borderRadius="xl">
                      <Icon as={m.icon} color={`${m.color}.500`} boxSize={4} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="800" color="gray.800" fontSize="xs">
                        {m.label}
                      </Text>
                      <Badge colorScheme={m.color} variant="subtle" fontSize="8px" borderRadius="full" px={2}>
                        {m.category}
                      </Badge>
                    </VStack>
                  </HStack>
                </Td>
                {PERMISSIONS.map((p) => (
                  <Td key={p.id} textAlign="center" py={3}>
                    <Checkbox
                      colorScheme="brand"
                      size="md"
                      isChecked={permissions[m.id]?.[p.id] || false}
                      onChange={() => handleToggle(m.id, p.id)}
                      sx={{
                        "span.chakra-checkbox__control": {
                          borderRadius: "6px",
                          border: "2px solid",
                          borderColor: "gray.200",
                          _checked: {
                            bg: "brand.500",
                            borderColor: "brand.500",
                          },
                        },
                      }}
                    />
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredModules.length === 0 && (
          <VStack py={10} spacing={3}>
            <Icon as={FiSearch} boxSize={8} color="gray.300" />
            <Text color="gray.500" fontWeight="600" fontSize="sm">
              No modules found matching your search
            </Text>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default PermissionsSelector;

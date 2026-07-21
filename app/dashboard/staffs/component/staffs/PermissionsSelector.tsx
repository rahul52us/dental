import React, { useMemo, useState } from "react";
import {
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
  SimpleGrid,
  Wrap,
  WrapItem,
  Divider,
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
  { id: "patient", label: "Patient Management", icon: FiUser, color: "blue", category: "Clinical", keys: ["view", "create", "edit", "delete", "download", "print", "sidebar"] },
  { id: "patient_documents", label: "Patient Documents", icon: FiFileText, color: "cyan", category: "Clinical", keys: ["view", "create", "delete", "sidebar"] },
  { id: "treatment", label: "Treatments", icon: FiActivity, color: "teal", category: "Clinical", keys: ["view", "create", "edit", "delete", "download", "print", "sidebar"] },
  { id: "workdone", label: "Work Done / Clinical Records", icon: FiActivity, color: "green", category: "Clinical", keys: ["view", "create", "edit", "delete", "download", "print", "sidebar"] },
  { id: "historicalRecords", label: "Historical Records", icon: FiFileText, color: "gray", category: "Admin", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "doctor", label: "Doctor Management", icon: FiUserCheck, color: "teal", category: "Clinical", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "appointment", label: "Appointments", icon: FiCalendar, color: "purple", category: "Clinical", keys: ["view", "create", "edit", "delete", "download", "sidebar"] },
  { id: "recall", label: "Recalls", icon: FiRefreshCw, color: "orange", category: "Clinical", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "lab", label: "Labs", icon: FiBox, color: "cyan", category: "Lab", keys: ["view", "create", "edit", "delete", "download", "sidebar"] },
  { id: "inhouse_lab", label: "In-house Lab", icon: FiBox, color: "cyan", category: "Lab", keys: ["view", "create", "edit", "delete", "download", "sidebar"] },
  { id: "outside_lab", label: "Outside Lab", icon: FiBox, color: "cyan", category: "Lab", keys: ["view", "create", "edit", "delete", "download", "sidebar"] },
  { id: "lab_doctors", label: "Lab Doctors", icon: FiUserCheck, color: "cyan", category: "Lab", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "reports", label: "Financial Reports", icon: FiFileText, color: "red", category: "Admin", keys: ["view", "download", "print", "sidebar"] },
  { id: "accountability", label: "Financial Accountability", icon: FiDollarSign, color: "pink", category: "Admin", keys: ["view", "create", "edit", "delete", "download", "print", "sidebar"] },
  { id: "globalAccountability", label: "Global Accountability", icon: FiDollarSign, color: "blue", category: "Admin", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "doctorInventory", label: "In & Out Ledger", icon: FiBox, color: "cyan", category: "Lab", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "masters", label: "Masters (Prescription/Procedure)", icon: FiSettings, color: "gray", category: "Admin", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "staffs", label: "Staff Management", icon: FiUsers, color: "blue", category: "Admin", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "admins", label: "Admin Management", icon: FiUserCheck, color: "purple", category: "Admin", keys: ["view", "create", "edit", "delete", "sidebar"] },
  { id: "chairs", label: "Chair Management", icon: FiActivity, color: "yellow", category: "Clinical", keys: ["view", "create", "edit", "delete", "sidebar"] },
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

  const stores = require("../../../../store/stores").default;
  const user = stores.auth.user;
  const isSuperAdmin = user?.role === "superadmin" || user?.userType === "superadmin" || user?.role === "superAdmin" || user?.userType === "superAdmin";

  const hasSpecificPerm = (moduleId: string, permId: string) => {
    if (isSuperAdmin) return true;
    return user?.permissions?.[moduleId]?.[permId] === true;
  };

  const handleToggle = (moduleId: string, permId: string) => {
    if (!hasSpecificPerm(moduleId, permId)) return;

    onChange({
      ...permissions,
      [moduleId]: {
        ...(permissions[moduleId] || {}),
        [permId]: !permissions[moduleId]?.[permId],
      },
    });
  };

  const handleRowToggle = (moduleId: string) => {
    const moduleInfo = MODULES.find(m => m.id === moduleId);
    const keys = moduleInfo?.keys || PERMISSIONS.map(p => p.id);

    const allowedKeys = keys.filter(k => hasSpecificPerm(moduleId, k));
    if (allowedKeys.length === 0) return;

    const allChecked = allowedKeys.every((k) => permissions[moduleId]?.[k]);
    const newState: any = { ...(permissions[moduleId] || {}) };
    allowedKeys.forEach((k) => {
      newState[k] = !allChecked;
    });

    onChange({
      ...permissions,
      [moduleId]: newState,
    });
  };

  const filteredModules = useMemo(() => {
    const hasModuleAccess = (moduleId: string) => {
      if (isSuperAdmin) return true;

      // Admins (who give permissions to Staff) should not be able to give Staff Management access
      if (moduleId === "staffs" || moduleId === "admins") return false;

      const perms = user?.permissions;
      if (!perms) return false;
      return perms[moduleId] && Object.values(perms[moduleId]).some((v) => v === true);
    };

    return MODULES.filter(
      (m) =>
        (m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
         m.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
        hasModuleAccess(m.id)
    );
  }, [searchQuery, isSuperAdmin, user]);

  return (
    <Box>
      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none" h="full" ml={2}>
          <FiSearch color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search modules or categories..."
          size="lg"
          borderRadius="2xl"
          bg="white"
          borderWidth="2px"
          _focus={{ borderColor: "brand.500", shadow: "md" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredModules.map((m) => {
          const keysToRender = m.keys || PERMISSIONS.map(p => p.id);
          const allChecked = keysToRender.every((k) => permissions[m.id]?.[k]);

          return (
            <Box
              key={m.id}
              p={5}
              bg="white"
              border="2px solid"
              borderColor={allChecked ? `${m.color}.200` : "gray.100"}
              borderRadius="2xl"
              shadow="sm"
              transition="all 0.2s"
              _hover={{ shadow: "md", borderColor: `${m.color}.300` }}
            >
              <HStack justify="space-between" mb={4}>
                <HStack spacing={4}>
                  <Box p={3} bg={`${m.color}.50`} borderRadius="xl">
                    <Icon as={m.icon} color={`${m.color}.500`} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="800" color="gray.800" fontSize="md">{m.label}</Text>
                    <Badge colorScheme={m.color} variant="subtle" fontSize="10px" borderRadius="full" px={3}>
                      {m.category}
                    </Badge>
                  </VStack>
                </HStack>
                <Checkbox
                  colorScheme={m.color}
                  size="lg"
                  isChecked={allChecked}
                  onChange={() => handleRowToggle(m.id)}
                />
              </HStack>
              <Divider mb={4} />
              <SimpleGrid columns={2} spacing={3}>
                {PERMISSIONS.filter(p => keysToRender.includes(p.id)).map((p) => {
                  const isChecked = permissions[m.id]?.[p.id] || false;
                  const canToggle = hasSpecificPerm(m.id, p.id);

                  return (
                    <Box
                      key={p.id}
                      as="label"
                      display="flex"
                      alignItems="center"
                      p={2}
                      px={3}
                      bg={isChecked ? `${m.color}.50` : "gray.50"}
                      border="1px solid"
                      borderColor={isChecked ? `${m.color}.200` : "transparent"}
                      borderRadius="xl"
                      cursor={canToggle ? "pointer" : "not-allowed"}
                      opacity={canToggle ? 1 : 0.4}
                      transition="all 0.2s"
                      _hover={canToggle ? { bg: isChecked ? `${m.color}.100` : "gray.100" } : {}}
                    >
                      <Checkbox
                        colorScheme={m.color}
                        size="md"
                        isChecked={isChecked}
                        onChange={() => handleToggle(m.id, p.id)}
                        isDisabled={!canToggle}
                        sx={{
                          "span.chakra-checkbox__control": {
                            borderRadius: "6px",
                            borderWidth: "2px",
                          },
                        }}
                        mr={2}
                      />
                      <Text fontSize="sm" fontWeight={isChecked ? "700" : "600"} color={isChecked ? `${m.color}.700` : "gray.600"}>
                        {p.label}
                      </Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          );
        })}
      </SimpleGrid>

      {filteredModules.length === 0 && (
        <VStack py={16} spacing={4}>
          <Box p={6} bg="gray.50" borderRadius="full">
            <Icon as={FiSearch} boxSize={10} color="gray.400" />
          </Box>
          <Text color="gray.500" fontWeight="700" fontSize="lg">
            No modules found matching your search
          </Text>
        </VStack>
      )}
    </Box>
  );
};

export default PermissionsSelector;

"use client";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerBody,
  DrawerCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Text,
  useToast,
  VStack,
  HStack,
  Icon,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { 
  FiLock, 
  FiCheckCircle, 
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
  FiShield
} from "react-icons/fi";
import stores from "../../../../store/stores";

const MODULES = [
  { id: "patient", label: "Patient Management", icon: FiUser, color: "blue", category: "Clinical" },
  { id: "workdone", label: "Work Done / Treatments", icon: FiActivity, color: "green", category: "Clinical" },
  { id: "doctor", label: "Doctor Management", icon: FiUserCheck, color: "teal", category: "Clinical" },
  { id: "appointment", label: "Appointments", icon: FiCalendar, color: "purple", category: "Clinical" },
  { id: "recall", label: "Recalls", icon: FiRefreshCw, color: "orange", category: "Clinical" },
  { id: "lab", label: "Lab Work", icon: FiBox, color: "cyan", category: "Lab" },
  { id: "reports", label: "Financial Reports", icon: FiFileText, color: "red", category: "Admin" },
  { id: "accountability", label: "Financial Accountability", icon: FiDollarSign, color: "pink", category: "Admin" },
  { id: "masters", label: "Masters (Prescription/Procedure)", icon: FiSettings, color: "gray", category: "Admin" },
  { id: "staffs", label: "Staff Management", icon: FiUsers, color: "indigo", category: "Admin" },
  { id: "chairs", label: "Chair Management", icon: FiActivity, color: "yellow", category: "Clinical" },
];

const PERMISSIONS = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete" },
];

const StaffPermissionsModal = ({ isOpen, onClose, staff, onUpdate }: any) => {
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();
  const { userStore } = stores;

  useEffect(() => {
    if (staff && staff.permissions) {
      setPermissions(staff.permissions);
    } else {
      const defaultPerms: any = {};
      MODULES.forEach(m => {
        defaultPerms[m.id] = { view: false, create: false, edit: false, delete: false };
      });
      setPermissions(defaultPerms);
    }
  }, [staff, isOpen]);

  const handleToggle = (moduleId: string, permId: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || { view: false, create: false, edit: false, delete: false }),
        [permId]: !prev[moduleId]?.[permId]
      }
    }));
  };

  const handleRowToggle = (moduleId: string) => {
    const allChecked = PERMISSIONS.every(p => permissions[moduleId]?.[p.id]);
    const newState: any = {};
    PERMISSIONS.forEach(p => {
      newState[p.id] = !allChecked;
    });
    setPermissions((prev: any) => ({
      ...prev,
      [moduleId]: newState
    }));
  };

  const filteredModules = useMemo(() => {
    return MODULES.filter(m => 
      m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userStore.updatePermissions(staff._id, permissions);
      toast({
        title: "Permissions Updated",
        description: `Successfully updated permissions for ${staff.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg" placement="right">
      <DrawerOverlay backdropFilter="blur(8px)" />
      <DrawerContent borderLeftRadius="3xl" shadow="2xl">
        <DrawerHeader borderBottomWidth="1px" p={8} bg="gray.50">
          <HStack spacing={4} mb={6}>
            <Box p={3} bg="brand.500" borderRadius="2xl" shadow="lg">
              <Icon as={FiShield} color="white" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="900" letterSpacing="tight">Access Control</Text>
              <Text fontSize="sm" color="gray.500" fontWeight="600">Managing {staff?.name}</Text>
            </VStack>
          </HStack>

          <InputGroup>
            <InputLeftElement pointerEvents="none" h="full" ml={2}>
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search modules or categories..."
              size="lg"
              borderRadius="2xl"
              bg="white"
              borderWidth="2px"
              _focus={{ borderColor: "brand.500", shadow: "sm" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </DrawerHeader>

        <DrawerCloseButton mt={6} mr={4} />
        
        <DrawerBody p={0} bg="white">
          <Table variant="simple">
            <Thead bg="gray.50" position="sticky" top={0} zIndex={10}>
              <Tr>
                <Th py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">Module</Th>
                {PERMISSIONS.map(p => (
                  <Th key={p.id} py={4} textAlign="center" fontSize="xs" color="gray.500">{p.label}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {filteredModules.map(m => (
                <Tr key={m.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                  <Td py={4} minW="250px">
                    <HStack spacing={3} onClick={() => handleRowToggle(m.id)} cursor="pointer">
                      <Box p={2} bg={`${m.color}.50`} borderRadius="xl">
                        <Icon as={m.icon} color={`${m.color}.500`} boxSize={4} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="800" color="gray.800" fontSize="sm">{m.label}</Text>
                        <Badge colorScheme={m.color} variant="subtle" fontSize="9px" borderRadius="full" px={2}>{m.category}</Badge>
                      </VStack>
                    </HStack>
                  </Td>
                  {PERMISSIONS.map(p => (
                    <Td key={p.id} textAlign="center" py={4}>
                      <Checkbox
                        colorScheme="brand"
                        size="lg"
                        isChecked={permissions[m.id]?.[p.id] || false}
                        onChange={() => handleToggle(m.id, p.id)}
                        sx={{
                          'span.chakra-checkbox__control': {
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: 'gray.200',
                            _checked: {
                              bg: 'brand.500',
                              borderColor: 'brand.500',
                            }
                          }
                        }}
                      />
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>

          {filteredModules.length === 0 && (
            <VStack py={20} spacing={4}>
              <Icon as={FiSearch} boxSize={10} color="gray.300" />
              <Text color="gray.500" fontWeight="600">No modules found matching your search</Text>
            </VStack>
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" p={8} bg="gray.50">
          <Button 
            variant="ghost" 
            mr="auto" 
            onClick={onClose} 
            borderRadius="xl"
            color="gray.500"
            fontWeight="700"
          >
            Cancel
          </Button>
          <HStack spacing={4}>
            <Button 
              colorScheme="brand" 
              onClick={handleSave} 
              isLoading={loading}
              borderRadius="2xl"
              px={12}
              h="60px"
              fontSize="md"
              fontWeight="900"
              shadow="xl"
              _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
              _active={{ transform: "translateY(0)" }}
            >
              Apply Permissions
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default StaffPermissionsModal;

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
  Text,
  useToast,
  VStack,
  HStack,
  Icon,
  Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toJS } from "mobx";
import { FiShield } from "react-icons/fi";
import stores from "../../../../store/stores";
import PermissionsSelector, { MODULES } from "./PermissionsSelector";

const StaffPermissionsModal = ({ isOpen, onClose, staff, onUpdate }: any) => {
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { userStore } = stores;

  useEffect(() => {
    if (staff && staff.permissions) {
      setPermissions(toJS(staff.permissions));
    } else {
      const defaultPerms: any = {};
      MODULES.forEach(m => {
        defaultPerms[m.id] = { view: false, create: false, edit: false, delete: false, download: false, print: false, sidebar: false };
      });
      setPermissions(defaultPerms);
    }
  }, [staff, isOpen]);

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
    <Drawer isOpen={isOpen} onClose={onClose} size="full" placement="right">
      <DrawerOverlay backdropFilter="blur(8px)" />
      <DrawerContent maxW="80vw" borderLeftRadius="3xl" shadow="2xl">
        <DrawerHeader borderBottomWidth="1px" p={8} bg="gray.50">
          <HStack spacing={4} mb={2}>
            <Box p={3} bg="brand.500" borderRadius="2xl" shadow="lg">
              <Icon as={FiShield} color="white" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="900" letterSpacing="tight">Access Control</Text>
              <Text fontSize="sm" color="gray.500" fontWeight="600">Managing {staff?.name}</Text>
            </VStack>
          </HStack>
        </DrawerHeader>

        <DrawerCloseButton mt={6} mr={4} />
        
        <DrawerBody p={4} bg="white">
          <PermissionsSelector 
            permissions={permissions} 
            onChange={(newPerms) => setPermissions(newPerms)} 
          />
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" py={4} px={8} bg="gray.50">
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
              borderRadius="xl"
              px={10}
              size="lg"
              fontSize="md"
              fontWeight="800"
              shadow="md"
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
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

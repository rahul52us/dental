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
  useBreakpointValue,
  Flex,
  useColorModeValue,
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
  const placement =
    useBreakpointValue<"bottom" | "right">({ base: "bottom", md: "right" }) ?? "right";

  useEffect(() => {
    const defaultPerms: any = {};
    MODULES.forEach(m => {
      defaultPerms[m.id] = { view: false, create: false, edit: false, delete: false, download: false, print: false, sidebar: false };
    });

    if (staff && staff.permissions && Object.keys(staff.permissions).length > 0) {
      // Merge existing permissions with defaults so we never save an empty object
      setPermissions({ ...defaultPerms, ...toJS(staff.permissions) });
    } else {
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
    <Drawer isOpen={isOpen} onClose={onClose} size="full" placement={placement}>
      <DrawerOverlay backdropFilter="blur(8px)" />
      <DrawerContent
        w={{ base: "100vw", md: "80vw" }}
        maxW={{ base: "100vw", md: "80vw" }}
        h="100dvh"
        maxH="100dvh"
        borderRadius={0}
        shadow="2xl"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        bg={useColorModeValue("white", "darkBrand.50")}
      >
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor={useColorModeValue("gray.200", "darkBrand.200")}
          p={{ base: 4, md: 8 }}
          bg={useColorModeValue("gray.50", "darkBrand.100")}
        >
          <HStack spacing={{ base: 3, md: 4 }} mb={2} pr={10}>
            <Box p={{ base: 2, md: 3 }} bg="brand.500" borderRadius="xl" shadow="md">
              <Icon as={FiShield} color="white" boxSize={{ base: 5, md: 6 }} />
            </Box>
            <VStack align="start" spacing={0} minW={0}>
              <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="900" letterSpacing="tight" color={useColorModeValue("gray.800", "white")}>
                Access Control
              </Text>
              <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} fontWeight="600" noOfLines={1}>
                Managing {staff?.name}
              </Text>
            </VStack>
          </HStack>
        </DrawerHeader>

        <DrawerCloseButton
          top={{ base: 3, md: 6 }}
          right={{ base: 3, md: 4 }}
          color={useColorModeValue("gray.700", "gray.200")}
        />
        
        <DrawerBody p={{ base: 3, md: 4 }} bg={useColorModeValue("white", "darkBrand.50")} minH={0} overflowY="auto">
          <PermissionsSelector 
            permissions={permissions} 
            onChange={(newPerms) => setPermissions(newPerms)} 
          />
        </DrawerBody>

        <DrawerFooter
          borderTopWidth="1px"
          borderColor={useColorModeValue("gray.200", "darkBrand.200")}
          py={{ base: 3, md: 4 }}
          px={{ base: 4, md: 8 }}
          pb={{ base: "calc(12px + env(safe-area-inset-bottom))", md: 4 }}
          bg={useColorModeValue("gray.50", "darkBrand.100")}
        >
          <Flex direction={{ base: "column", md: "row" }} gap={2} w="full">
            <Button
              variant="ghost"
              onClick={onClose}
              borderRadius="xl"
              color={useColorModeValue("gray.600", "gray.300")}
              _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.100") }}
              fontWeight="700"
              minH="48px"
              flex={{ md: 1 }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSave}
              isLoading={loading}
              borderRadius="xl"
              px={10}
              minH="48px"
              fontSize="md"
              fontWeight="800"
              shadow="md"
              flex={{ md: 2 }}
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              _active={{ transform: "translateY(0)" }}
            >
              Apply Permissions
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default StaffPermissionsModal;

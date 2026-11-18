"use client";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useToast,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import stores from "../../store/stores";
import Form from "./component/DoctorInventoryForm";

import DoctorInventoryTable from "./component/DoctorInventoryTable";
import DeleteData from "../labDoctors/component/DeleteUser"; // Reusing delete user component or we can make one
import { tablePageLimit } from "../../component/config/utils/variable";
import { observer } from "mobx-react-lite";

const DoctorInventoryPage = observer(() => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    doctorInventoryStore: { createDoctorInventory, getDoctorInventories, updateDoctorInventory, deleteDoctorInventory },
  } = stores;

  const [isDrawerOpen, setIsDrawerOpen] = useState<any>({
    isOpen: false,
    type: "add",
    data: null,
  });

  const toast = useToast();

  const handleAddSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      await createDoctorInventory(formData);
      getDoctorInventories({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
      toast({
        title: "In & Out Ledger Added",
        description: `Item has been successfully added.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Failed to create",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      setFormLoading(true);
      await updateDoctorInventory(values);
      getDoctorInventories({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
      toast({
        title: "In & Out Ledger Updated",
        description: `Item has been successfully updated.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteData = async (status: boolean, data: any) => {
    setDeleteLoading(true);
    try {
      await deleteDoctorInventory({ id : data._id });
      toast({
        title: "In & Out Ledger Deleted",
        description: `Item has been deleted successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      getDoctorInventories({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!stores.auth.hasPermission('doctorInventory', 'view')) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl" color="gray.500">You do not have permission to view this page.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <DoctorInventoryTable
        onDelete={(ft: any) =>
          setIsDrawerOpen({ isOpen: true, type: "delete", data: ft })
        }
        onAdd={() =>
          setIsDrawerOpen({ isOpen: true, type: "add", data: null })
        }
        onEdit={(dt: any) => {
          setIsDrawerOpen({
            isOpen: true,
            type: "edit",
            data: dt,
          });
        }}
      />

      {/* Add / Edit Drawer */}
      {(isDrawerOpen.type === "add" || isDrawerOpen.type === "edit") && (
        <Drawer
          size={isMobile ? "full" : "md"}
          isOpen={isDrawerOpen.isOpen}
          placement={isMobile ? "bottom" : "right"}
          onClose={() =>
            setIsDrawerOpen({ isOpen: false, type: "add", data: null })
          }
          autoFocus={false}
        >
          <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
          <DrawerContent
            bg="white"
            borderRadius={isMobile ? 0 : "lg"}
            borderTopRadius={0}
            boxShadow="xl"
            maxW={isMobile ? "100vw" : { base: "100%", md: "93%" }}
            width={isMobile ? "100vw" : { base: "100%", md: "95%" }}
            h={isMobile ? "100dvh" : undefined}
            maxH={isMobile ? "100dvh" : undefined}
            overflow="hidden"
          >
            <DrawerCloseButton
              color="white"
              bg="whiteAlpha.200"
              borderRadius="full"
              top={3}
              right={3}
              _hover={{ bg: "whiteAlpha.350", transform: "scale(1.05)" }}
              transition="all 0.2s"
              zIndex={2}
            />
            <DrawerHeader
              bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
              color="white"
              fontSize={{ base: "16px", md: "lg" }}
              fontWeight="800"
              textAlign={{ base: "left", md: "center" }}
              py={3}
              px={4}
              borderRadius={0}
              borderTopRadius={0}
              borderBottom="1px solid"
              borderColor="whiteAlpha.200"
            >
              {isDrawerOpen?.type === "edit" ? "Edit In & Out Ledger" : "Add In & Out Ledger"}
            </DrawerHeader>
            <DrawerBody p={{ base: 3, md: 6 }} bg="gray.50" overflowY="auto" overscrollBehaviorY="contain">
              <Form
                initialData={
                  isDrawerOpen?.type === "edit"
                    ? { ...isDrawerOpen?.data }
                    : { labDoctor: "", description: "" }
                }
                onSubmit={
                  isDrawerOpen?.type === "edit"
                    ? handleEditSubmit
                    : handleAddSubmit
                }
                isOpen={isDrawerOpen}
                onClose={() =>
                  setIsDrawerOpen({ isOpen: false, type: "add", data: null })
                }
                isEdit={isDrawerOpen.type === "edit"}
                loading={formLoading}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete Drawer */}
      {isDrawerOpen.type === "delete" && isDrawerOpen.isOpen && (
        <DeleteData
          loading={deleteLoading}
          handleDeleteData={(status: boolean) =>
            handleDeleteData(status, isDrawerOpen.data)
          }
          data={isDrawerOpen.data}
          isOpen={isDrawerOpen.isOpen}
          onClose={() =>
            setIsDrawerOpen({ isOpen: false, type: "add", data: null })
          }
        />
      )}
    </Box>
  );
});

export default DoctorInventoryPage;

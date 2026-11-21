"use client";
import {
  Box,
  useToast,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import stores from "../../store/stores";
import Form from "./component/DoctorInventoryForm";
import CustomDrawer from "../../component/common/Drawer/CustomDrawer";

import DoctorInventoryTable from "./component/DoctorInventoryTable";
import DeleteData from "../labDoctors/component/DeleteUser"; // Reusing delete user component or we can make one
import { tablePageLimit } from "../../component/config/utils/variable";
import { observer } from "mobx-react-lite";

const DoctorInventoryPage = observer(() => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const drawerBg = useColorModeValue("white", "darkBrand.50");
  const drawerBodyBg = useColorModeValue("gray.50", "darkBrand.50");
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
      <CustomDrawer
        open={isDrawerOpen.isOpen && (isDrawerOpen.type === "add" || isDrawerOpen.type === "edit")}
        close={() =>
          setIsDrawerOpen({ isOpen: false, type: "add", data: null })
        }
        title={isDrawerOpen?.type === "edit" ? "Edit In & Out Ledger" : "Add In & Out Ledger"}
        width="45vw"
      >
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
          isOpen={isDrawerOpen.isOpen}
          onClose={() =>
            setIsDrawerOpen({ isOpen: false, type: "add", data: null })
          }
          isEdit={isDrawerOpen.type === "edit"}
          loading={formLoading}
        />
      </CustomDrawer>

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

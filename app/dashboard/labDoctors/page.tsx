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
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import stores from "../../store/stores";
import Form from "./component/Form";
import { initialValues } from "./component/utils/constant";
import DeleteData from "./component/DeleteUser";
import LabDoctorTable from "./component/LabDoctorTable";
import { replaceLabelValueObjects } from "../../config/utils/function";
import { tablePageLimit } from "../../component/config/utils/variable";
import { observer } from "mobx-react-lite";

const LabDoctorPage = observer(() => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const drawerBg = useColorModeValue("white", "darkBrand.50");
  const drawerBodyBg = useColorModeValue("gray.50", "darkBrand.50");
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    labDoctorStore: { createLabDoctor, getLabDoctors, updateLabDoctor, deleteLabDoctor },
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
      const values = { ...formData };
      await createLabDoctor({
        ...values,
        gender: values.gender?.value || 1,
        languages: values.languages?.map((l: any) => l.value || l) || [],
      });
      getLabDoctors({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
      toast({
        title: "Lab Doctor Added",
        description: `${formData.labDoctorName} has been successfully added.`,
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
      await updateLabDoctor({
        ...values,
        gender: values.gender?.value || 1,
        languages: values.languages?.map((l: any) => l.value || l) || [],
      });
      getLabDoctors({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
      toast({
        title: "Lab Doctor Updated",
        description: `${values.labDoctorName} has been successfully updated.`,
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
      await deleteLabDoctor({ id: data._id });
      toast({
        title: "Lab Doctor Deleted",
        description: `${data?.labDoctorName} has been deleted successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      getLabDoctors({ page: 1, limit: tablePageLimit });
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

  return (
    <Box>
      <LabDoctorTable
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
            data: { ...dt },
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
            bg={drawerBg}
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
              bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
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
              {isDrawerOpen?.type === "edit" ? "Edit Lab Doctor" : "Add Lab Doctor"}
            </DrawerHeader>
            <DrawerBody p={{ base: 3, md: 6 }} bg={drawerBodyBg} overflowY="auto" overscrollBehaviorY="contain">
              <Form
                initialData={
                  isDrawerOpen?.type === "edit"
                    ? { ...initialValues, ...isDrawerOpen?.data }
                    : initialValues
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

export default LabDoctorPage;

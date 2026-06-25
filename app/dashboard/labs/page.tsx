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
} from "@chakra-ui/react";
import { useState } from "react";
import stores from "../../store/stores";
import Form from "./component/Form";
import { initialValues } from "./component/utils/constant";
import DeleteData from "./component/labss/component/DeleteUser";
import DoctorsTable from "./component/labss/LabsTable";
import { replaceLabelValueObjects } from "../../config/utils/function";
import { tablePageLimit } from "../../component/config/utils/variable";
import { observer } from "mobx-react-lite";
import CustomDrawer from "../../component/common/Drawer/CustomDrawer";
import LineItems from "./component/LineItems/LineItems";
import { useTranslation } from "react-i18next";

const LabPage = observer(() => {
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    labStore: { createLab, getLabs, updateLab, deleteLab },
  } = stores;

  const [isDrawerOpen, setIsDrawerOpen] = useState<any>({
    isOpen: false,
    type: "add",
    data: null,
  });

  const toast = useToast();
  const { t } = useTranslation();

  const handleAddSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      const values = { ...formData };
      await createLab({
        ...values,
        ...(replaceLabelValueObjects(values) || {}),
      });
      getLabs({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
      toast({
        title: t("labs.page.labAdded"),
        description: t("labs.page.hasBeenAdded", { name: formData.name }),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: t("labs.page.failedToCreate"),
        description: err?.message || t("labs.page.somethingWentWrong"),
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
      await updateLab({
        ...values,
        ...(replaceLabelValueObjects(values) || {}),
      });
      getLabs({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
      toast({
        title: t("labs.page.labUpdated"),
        description: t("labs.page.hasBeenUpdated", { name: values.name }),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: t("labs.page.failedToUpdate"),
        description: err?.message || t("labs.page.somethingWentWrong"),
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
      await deleteLab({ id : data._id, deleted: status });
      toast({
        title: t("labs.page.labDeleted"),
        description: t("labs.page.hasBeenDeleted", { name: data?.name }),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      getLabs({ page: 1, limit: tablePageLimit });
      setIsDrawerOpen({ isOpen: false, type: "add", data: null });
    } catch (err: any) {
      toast({
        title: t("labs.page.deleteFailed"),
        description: err?.message || t("labs.page.somethingWentWrong"),
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
      <DoctorsTable
        onDelete={(ft: any) =>
          setIsDrawerOpen({ isOpen: true, type: "delete", data: ft })
        }
        onItemView={(dt: any) =>
          setIsDrawerOpen({ isOpen: true, type: "lineItems", data: dt })
        }
        onAdd={() =>
          setIsDrawerOpen({ isOpen: true, type: "add", data: null })
        }
        onEdit={(dt: any) => {
          const { ...rest } = dt;
          setIsDrawerOpen({
            isOpen: true,
            type: "edit",
            data: { ...rest },
          });
        }}
      />

      {/* Add / Edit Drawer */}
      {(isDrawerOpen.type === "add" || isDrawerOpen.type === "edit") && (
        <Drawer
          size="md"
          isOpen={isDrawerOpen.isOpen}
          placement="right"
          onClose={() =>
            setIsDrawerOpen({ isOpen: false, type: "add", data: null })
          }
          autoFocus={false}
        >
          <DrawerOverlay>
            <DrawerContent
              bg="white"
              borderRadius="lg"
              boxShadow="xl"
              maxW={{ base: "100%", md: "93%" }}
              width={{ base: "100%", md: "95%" }}
            >
              <DrawerCloseButton />
              <DrawerHeader
                bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                color="white"
                fontSize="lg"
                fontWeight="bold"
                textAlign="center"
              >
                {isDrawerOpen?.type === "edit" ? t("labs.page.editLab") : t("labs.page.addLab")}
              </DrawerHeader>
              <DrawerBody p={6} bg="gray.50">
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
          </DrawerOverlay>
        </Drawer>
      )}

      {/* Delete Drawer */}
      {isDrawerOpen.type === "delete" && isDrawerOpen.isOpen && (
        <DeleteData
          getData={() =>
            getLabs({ page: 1, limit: tablePageLimit, type: "lab" })
          }
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

      {/* LineItems Drawer */}
      {isDrawerOpen.type === "lineItems" && isDrawerOpen.isOpen && (
        <CustomDrawer
          loading={false}
          open={isDrawerOpen.isOpen}
          width={"85vw"}
          close={() =>
            setIsDrawerOpen({ isOpen: false, type: "add", data: null })
          }
          title={isDrawerOpen?.data?.name}
        >
          <LineItems data={isDrawerOpen.data} />
        </CustomDrawer>
      )}
    </Box>
  );
});

export default LabPage;

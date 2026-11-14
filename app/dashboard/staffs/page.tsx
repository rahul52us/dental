"use client";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { readFileAsBase64 } from "../../config/utils/utils";
import stores from "../../store/stores";
import { observer } from "mobx-react-lite";
import Form from "./component/Form";
import { initialValues, titles } from "./component/utils/constant";
import DeleteData from "./component/staffs/component/DeleteUser";
import { replaceLabelValueObjects } from "../../config/utils/function";
import { tablePageLimit } from "../../component/config/utils/variable";
import StaffTable from "./component/staffs/StaffTable";
import { useTranslation } from "react-i18next";

const StaffPage = observer(() => {
  const [formLoading, setFormLoading] = useState(false);
  const {
    userStore: { createUser, getAllUsers, updateUser },
  } = stores;
  const [isDrawerOpen, setIsDrawerOpen] = useState<any>({
    isOpen: false,
    type: "add",
    data: null,
  });
  const [thumbnail, setThumbnail] = useState([]);
  const toast = useToast();
  const { t } = useTranslation();
  const formPlacement =
    useBreakpointValue<"bottom" | "right">({ base: "bottom", md: "right" }) ?? "right";

  const handleAddSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      const values = { ...formData };
      if (values.pic?.file && values.pic?.file?.length !== 0) {
        const buffer = await readFileAsBase64(values.pic?.file);
        const fileData = {
          buffer: buffer,
          filename: values.pic?.file?.name,
          type: values.pic?.file?.type,
          isAdd: values.pic?.isAdd || 1,
        };
        formData.pic = fileData;
      }

      createUser({
        ...values,
        ...(replaceLabelValueObjects(values) || {}),
        pic: formData?.pic || {},
        title: formData?.data,
        mobileNumber:
          formData.phones.find((it: any) => it.primary === true).number ||
          undefined,
        username:
          formData.emails.find((it: any) => it.primary === true).email ||
          undefined,
        gender: formData?.gender?.value || 1,
        type: "staff",
      })
        .then(() => {
          getAllUsers({ page: 1, limit: tablePageLimit, type: "staff" });
          setFormLoading(false);
          setIsDrawerOpen({ isOpen: false, type: "add", data: null });
          toast({
            title: t("staffs.page.staffsAdded"),
            description: t("staffs.page.hasBeenAdded", { name: formData.name }),
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        })
        .catch((err: any) => {
          setFormLoading(false);
          toast({
            title: t("staffs.page.failedToCreate"),
            description: `${err?.message}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    } catch (err: any) {
      setFormLoading(false);
      toast({
        title: t("staffs.page.failedToCreate"),
        description: `${err?.message}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditSubmit = async (values: any) => {
    const formData: any = {
      ...values,
    };
    setFormLoading(true);
    if (formData?.pic?.file && formData?.pic?.isAdd) {
      const buffer = await readFileAsBase64(formData?.pic?.file);
      const fileData = {
        buffer: buffer,
        filename: formData?.pic?.file?.name,
        type: formData?.pic?.file?.type,
        isDeleted: formData?.pic?.isDeleted || 0,
        isAdd: formData?.pic?.isAdd || 0,
      };
      formData.pic = fileData;
    } else {
      if (formData?.pic?.isDeleted) {
        const fileData = {
          isDeleted: formData?.pic?.isDeleted || 0,
          isAdd: formData?.pic?.isAdd || 0,
        };
        formData.pic = fileData;
      }
    }

    updateUser({
      ...values,
      ...(replaceLabelValueObjects(values) || {}),
      mobileNumber:
        formData.phones.find((it: any) => it.primary === true).number ||
        undefined,
      username:
        formData.emails.find((it: any) => it.primary === true).email ||
        undefined,
      pic: formData?.pic,
      title: formData?.title?.label || titles[0].label,
      gender: formData?.gender?.value || 1,
    })
      .then(() => {
        getAllUsers({ page: 1, limit: tablePageLimit, type: "staff" });
        setFormLoading(false);
        setIsDrawerOpen({ isOpen: false, type: "add", data: null });
        toast({
          title: t("staffs.page.userUpdated"),
          description: t("staffs.page.hasBeenAdded", { name: formData.name }),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((err: any) => {
        setFormLoading(false);
        toast({
          title: t("staffs.page.failedToUpdate"),
          description: `${err?.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  return (
    <Box>
      <StaffTable
        onDelete={(ft: any) => {
          setIsDrawerOpen({ open: true, type: "delete", data: ft });
        }}
        onAdd={() => setIsDrawerOpen({ isOpen: true, type: "add", data: null })}
        onEdit={(dt: any) => {
          const { profileDetails, ...rest } = dt;
          setIsDrawerOpen({
            isOpen: true,
            type: "edit",
            data: {
              ...rest,
              ...profileDetails?.personalInfo,
            },
          });
        }}
      />
      {(isDrawerOpen.type === "add" || isDrawerOpen.type === "edit") && (
        <Drawer
          size="full"
          isOpen={isDrawerOpen.isOpen}
          placement={formPlacement}
          onClose={() =>
            setIsDrawerOpen({ isOpen: false, type: "add", data: null })
          }
          autoFocus={false}
        >
          <DrawerOverlay backdropFilter="blur(5px)" />
          <DrawerContent
            bg="white"
            borderRadius={{ base: 0, md: "3xl" }}
            boxShadow="2xl"
            w={{ base: "100vw", md: "80vw" }}
            maxW={{ base: "100vw", md: "80vw" }}
            h={{ base: "100dvh", md: "100vh" }}
            maxH={{ base: "100dvh", md: "100vh" }}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
              <DrawerHeader
                bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                color="white"
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="bold"
                textAlign="center"
                py={{ base: 3, md: 6 }}
                px={{ base: 4, md: 8 }}
              >
                {isDrawerOpen?.type === "edit" ? t("staffs.page.editStaffs") : t("staffs.page.addStaffs")}
              </DrawerHeader>
              <DrawerCloseButton
                color="white"
                bg="whiteAlpha.200"
                borderRadius="full"
                _hover={{ bg: "whiteAlpha.300" }}
                top={{ base: 2, md: 4 }}
                right={{ base: 2, md: 4 }}
              />
              <DrawerBody p={{ base: 2, md: 6 }} bg="gray.50" minH={0} overflowY="auto">
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
                  thumbnail={thumbnail}
                  isEdit={isDrawerOpen.type === "edit" ? true : false}
                  setThumbnail={setThumbnail}
                  loading={formLoading}
                  getAllUsers={getAllUsers}
                />
              </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
      {isDrawerOpen.type === "delete" && isDrawerOpen.open && (
        <DeleteData
          getData={() =>
            getAllUsers({ page: 1, limit: tablePageLimit, type: "staff" })
          }
          data={isDrawerOpen.data}
          isOpen={isDrawerOpen.open}
          onClose={() =>
            setIsDrawerOpen({ open: false, type: "add", data: null })
          }
        />
      )}
    </Box>
  );
});

export default StaffPage;
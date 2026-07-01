"use client";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { useState } from "react";
import { readFileAsBase64 } from "../../config/utils/utils";
import stores from "../../store/stores";
import Form from "./component/Form";
import AdvertisementTable from "./component/AdvertisementTable";
import { observer } from "mobx-react-lite";
import DeleteData from "../admins/component/users/component/DeleteUser"; // Reusing standard delete modal

const AdvertisementsPage = observer(() => {
  const [loading, setIsLoading] = useState(false);
  const { advertisementStore: { createAdvertisement, updateAdvertisement, deleteAdvertisement, getAdvertisements } } = stores;
  const [isDrawerOpen, setIsDrawerOpen] = useState<any>({
    isOpen: false,
    type: "add",
    data: null,
  });
  const [thumbnail, setThumbnail] = useState<any[]>([]);

  const handleAddSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const values = { ...formData };

      // Convert Image to Base64 structure for API if it's a new upload
      if (values.image?.file && values.image.file.name) {
        const buffer = await readFileAsBase64(values.image.file);
        values.image = {
          buffer,
          filename: values.image.file.name,
          type: values.image.file.type,
          isAdd: 1,
        };
      }

      await createAdvertisement(values, () => {
        setIsDrawerOpen({ isOpen: false, type: "add", data: null });
        setThumbnail([]);
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const values = { ...formData };

      if (values.image?.file && values.image.file.name) {
        const buffer = await readFileAsBase64(values.image.file);
        values.image = {
          buffer,
          filename: values.image.file.name,
          type: values.image.file.type,
          isAdd: 1,
        };
      } else {
        values.image = initialData?.image || null; // preserve existing or send null
      }

      await updateAdvertisement(isDrawerOpen.data._id, values, () => {
        setIsDrawerOpen({ isOpen: false, type: "add", data: null });
        setThumbnail([]);
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (dt: any) => {
    deleteAdvertisement(dt._id);
    setIsDrawerOpen({ isOpen: false, type: "add", data: null });
  };

  const initialData = isDrawerOpen?.data;

  return (
    <Box>
      <AdvertisementTable
        onAdd={() => {
          setThumbnail([]);
          setIsDrawerOpen({ isOpen: true, type: "add", data: null });
        }}
        onEdit={(dt: any) => {
          setIsDrawerOpen({ isOpen: true, type: "edit", data: dt });
        }}
        onDelete={(dt: any) => {
          setIsDrawerOpen({ isOpen: true, type: "delete", data: dt });
        }}
      />
      
      {(isDrawerOpen.type === "add" || isDrawerOpen.type === "edit") && (
        <Drawer
          size="xl"
          isOpen={isDrawerOpen.isOpen}
          placement="right"
          onClose={() => setIsDrawerOpen({ isOpen: false, type: "add", data: null })}
        >
          <DrawerOverlay>
            <DrawerContent bg="white" borderRadius="lg" boxShadow="xl">
              <DrawerCloseButton />
              <DrawerHeader
                bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                color="white"
                fontSize="lg"
                fontWeight="bold"
                textAlign="center"
              >
                {isDrawerOpen?.type === "edit" ? "Edit Advertisement" : "Add Advertisement"}
              </DrawerHeader>
              <DrawerBody p={6} bg="gray.50">
                <Form
                  initialData={isDrawerOpen?.data}
                  onSubmit={isDrawerOpen?.type === "edit" ? handleEditSubmit : handleAddSubmit}
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  isLoading={loading}
                />
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}

      {isDrawerOpen.type === "delete" && isDrawerOpen.isOpen && (
        <DeleteData
          getData={() => getAdvertisements()} // Just to trigger a fetch
          data={isDrawerOpen.data}
          isOpen={isDrawerOpen.isOpen}
          onClose={() => setIsDrawerOpen({ isOpen: false, type: "add", data: null })}
          deleteFunction={() => handleDelete(isDrawerOpen.data)} // Adding custom delete to reuse component if possible
        />
      )}
    </Box>
  );
});

export default AdvertisementsPage;

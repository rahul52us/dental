import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useDisclosure,
  Text,
  ModalFooter,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  SimpleGrid,
  VStack,
  HStack,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import ViewLineItems from "./component/ViewLineItems";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import FormModel from "../../../../component/common/FormModel/FormModel";

const MotionBox = motion(Box);

const validationSchema = Yup.object().shape({
  brandName: Yup.string().required("Brand Name is required"),
  itemName: Yup.string().required("Item Name is required"),
  quantity: Yup.number().required("Quantity required").positive(),
  price: Yup.number().required("Price required").positive(),
});

const LineItems = observer(({ data }: any) => {
  const {
    dealerStore: {
      getDealerLineItems,
      lineItems,
      createDealerItem,
      updateDealerItem,
      deleteDealerItem,
    },
    auth:{
      userType
    }
  } = stores;

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const [editData, setEditData] = useState<any>(null);

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelRef = useRef<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllItems = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      query.dealer = data?._id;

      getDealerLineItems(query).catch((err) => {
        toast({
          title: "Failed to get line items",
          description: err?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
    },
    [debouncedSearchQuery, getDealerLineItems, toast, data]
  );

  useEffect(() => {
    applyGetAllItems({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllItems]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllItems({ reset: true });
  };

  const handleRowClick = (item: any) => {
    setSelectedUser(item);
    onOpen();
  };

  const DealerItemTableColumns = [
    { headerName: "S.No.", key: "sno" },
    { headerName: "Item Name", key: "itemName", props: { row: { fontWeight: "bold" } } },
    { headerName: "Code", key: "itemCode" },
    { headerName: "Quantity", key: "quantity" },
    { headerName: "Price", key: "price" },
    { 
      headerName: "Total", 
      key: "total",
      type: "component",
      metaData: {
        component: (dt: any) => <Text fontWeight="black" color={stores.themeStore.themeConfig.colors.custom.light.primary}>₹{dt.total}</Text>
      }
    },
    {
      headerName: "Brand",
      key: "brandName",
      type: "component",
      metaData: {
        component: (dt: any) => <Text color="gray.600" fontWeight="medium">{dt?.brandName || "-"}</Text>,
      },
    },
    {
      headerName: "Date",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (dt: any) => <Text fontSize="xs" color="gray.400">{formatDate(dt?.createdAt)}</Text>,
      },
    },
    { headerName: "Actions", key: "table-actions", type: "table-actions" },
  ];

  const handleAdd = () => {
    setEditData(null);
    onFormOpen();
  };

  const handleEdit = (row: any) => {
    setEditData({
      ...row,
    });
    onFormOpen();
  };

  const handleSave = async (formData: any) => {
    try {
      setFormLoading(true);
      if (editData?._id) {
        await updateDealerItem({
          ...formData,
          dealer: data?._id,
          id: editData?._id,
        });
      } else {
        await createDealerItem({
          ...formData,
          dealer: data?._id,
        });
      }
      
      applyGetAllItems({ page: 1, limit: tablePageLimit });
      toast({
        title: "Line Item Saved",
        description: `${formData.itemName} has been successfully saved.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onFormClose();
    } catch (err: any) {
      toast({
        title: "Failed to save line item",
        description: err?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (row: any) => {
    setDeleteItem(row);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      setFormLoading(true);
      await deleteDealerItem({
        id: deleteItem?._id,
      });

      toast({
        title: "Line Item deleted Successfully",
        description: `${deleteItem.itemName} has been successfully deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onDeleteClose();
      setDeleteItem(null);
      applyGetAllItems({ page: currentPage, limit: tablePageLimit });
    } catch (err: any) {
      toast({
        title: "Failed to delete line item",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Box p={4} bg="gray.50" borderRadius="2xl">
      <CustomTable
        title="Portfolio Items"
        data={
          lineItems.data?.map((t: any, index: number) => ({
            ...t,
            sno: index + 1,
          })) || []
        }
        columns={DealerItemTableColumns}
        actions={{
          actionBtn: {
            addKey: { showAddButton: ['admin','superAdmin'].includes(userType), function: handleAdd },
            editKey: { showEditButton: ['admin','superAdmin'].includes(userType), function: handleEdit },
            viewKey: {
              showViewButton: true,
              function: (e: any) => handleRowClick(e),
            },
            deleteKey: { showDeleteButton: ['admin','superAdmin'].includes(userType), function: handleDelete },
          },
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          resetData: { show: false, function: resetTableData },
          pagination: {
            show: true,
            onClick: handleChangePage,
            currentPage,
            totalPages: lineItems.TotalPages || 1,
          },
        }}
        loading={lineItems.loading}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent minW={{ md: "60vw", sm: "100vw" }}>
          <DrawerCloseButton />
          <DrawerHeader bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white">
            <Flex align="center" gap={3}>
              <Icon as={GiPsychicWaves} size="24px" />
              Line Item Overview
            </Flex>
          </DrawerHeader>
          {selectedUser && (
            <DrawerBody p={0}>
              <ViewLineItems data={selectedUser} />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      <FormModel
        footer={false}
        title={editData ? "Edit Line Item" : "Add New Line Item"}
        isOpen={isFormOpen}
        onClose={onFormClose}
        size="lg"
        isCentered
      >
        <Formik
          initialValues={{
            brandName: editData?.brandName || "",
            itemName: editData?.itemName || "",
            itemCode: editData?.itemCode || "",
            quantity: editData?.quantity || "",
            price: editData?.price || "",
            total: editData?.total || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSave(values)}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, handleChange }: any) => {
            return (
              <Form>
                <VStack spacing={6} align="stretch" p={2}>
                  <Box p={6} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                    <VStack spacing={5} align="stretch">
                      <CustomInput
                        name="brandName"
                        label="Portfolio Brand"
                        value={values.brandName}
                        onChange={handleChange}
                        error={errors.brandName}
                        showError={errors.brandName}
                        placeholder="e.g. Oral-B, Sensodyne"
                      />
                      <SimpleGrid columns={2} spacing={4}>
                        <CustomInput
                          name="itemName"
                          label="Item Description"
                          value={values.itemName}
                          onChange={handleChange}
                          error={errors.itemName}
                          showError={errors.itemName}
                          placeholder="e.g. Electric Toothbrush"
                        />
                        <CustomInput
                          name="itemCode"
                          label="Internal Code"
                          value={values.itemCode}
                          onChange={handleChange}
                          placeholder="SKU-001"
                        />
                      </SimpleGrid>
                    </VStack>
                  </Box>

                  <Box p={6} bg="white" borderRadius="2xl" shadow="inner" border="1px dashed" borderColor={stores.themeStore.themeConfig.colors.custom.light.primary + "33"}>
                    <SimpleGrid columns={2} spacing={8}>
                      <CustomInput
                        name="quantity"
                        label="Order Quantity"
                        type="number"
                        value={values.quantity}
                        onChange={(e: any) => {
                          const qty = e.target.value ? parseInt(e.target.value) : "";
                          setFieldValue("quantity", qty);
                          setFieldValue("total", qty && values.price ? qty * values.price : "");
                        }}
                        error={errors.quantity}
                        showError={errors.quantity}
                      />
                      <CustomInput
                        name="price"
                        label="Unit Price (₹)"
                        type="number"
                        value={values.price}
                        onChange={(e: any) => {
                          const price = e.target.value ? parseFloat(e.target.value) : "";
                          setFieldValue("price", price);
                          setFieldValue("total", price && values.quantity ? price * values.quantity : "");
                        }}
                        error={errors.price}
                        showError={errors.price}
                      />
                    </SimpleGrid>

                    <MotionBox
                      mt={8}
                      p={5}
                      borderRadius="2xl"
                      bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                      color="white"
                      textAlign="center"
                      shadow="xl"
                      position="relative"
                      overflow="hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Box position="absolute" top="-20%" right="-10%" w="80px" h="80px" bg="whiteAlpha.100" borderRadius="full" />
                      <Text fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" opacity={0.9} mb={1}>
                        Projected Total
                      </Text>
                      <Text fontSize="3xl" fontWeight="black">
                        ₹ {Number(values.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </MotionBox>
                  </Box>
                  
                  <ModalFooter borderTopWidth="1px" pt={6} pb={2} px={0}>
                    <HStack spacing={4} w="full" justify="flex-end">
                      <Button onClick={onFormClose} variant="ghost" px={8} borderRadius="xl" _hover={{ bg: "red.50", color: "red.500" }}>
                        Dismiss
                      </Button>
                      <Button
                        bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                        color="white"
                        _hover={{ filter: "brightness(0.9)", shadow: "lg" }}
                        type="submit"
                        shadow="md"
                      >
                        {editData ? "Confirm Update" : "Establish Entry"}
                      </Button>
                    </HStack>
                  </ModalFooter>
                </VStack>
              </Form>
            );
          }}
        </Formik>
      </FormModel>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" p={2}>
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.600">
              Redaction Warning
            </AlertDialogHeader>
            <AlertDialogBody color="gray.600">
              Are you certain you wish to permanently remove **{deleteItem?.itemName}**? This data cannot be recovered.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onDeleteClose} variant="ghost" borderRadius="xl">
                Keep Item
              </Button>
              <Button
                isLoading={formLoading}
                colorScheme="red"
                onClick={confirmDelete}
                borderRadius="xl"
                shadow="md"
                _hover={{ shadow: "lg" }}
                px={6}
              >
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default LineItems;
import { observer } from "mobx-react-lite";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Badge,
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
  Divider,
  Icon,
  useBreakpointValue,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { GiPsychicWaves } from "react-icons/gi";
import { IoMdAdd } from "react-icons/io";
import {
  FiSearch,
  FiX,
  FiPackage,
  FiUser,
  FiCalendar,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import stores from "../../../store/stores";
import useDebounce from "../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../component/config/utils/variable";
import { formatDate } from "../../../component/config/utils/dateUtils";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import ViewLineItems from "./component/ViewLineItems";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import FormModel from "../../../component/common/FormModel/FormModel";

const validationSchema = Yup.object().shape({
  lab: Yup.mixed().required("Lab is Required"),
  itemName: Yup.string().required("Item Name is required"),
  quantity: Yup.number().required("Quantity required").positive(),
  price: Yup.number().required("Price required").positive(),
});

const LineItems = observer(({ data }: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const {
    labStore: {
      getPatientLabLineItems,
      patientItems,
      createLabItem,
      updateLabItem,
      deleteLabItem,
    },
    auth:{userType}
  } = stores;

  const toast = useToast();

  // Table + drawer states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Add/Edit Modal states
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const [editData, setEditData] = useState<any>(null);

  // Delete confirm states
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef<any>(null);

  // Loader for form submit
  const [formLoading, setFormLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const appGetAllData = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit, lab: data?._id };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getPatientLabLineItems({ ...query, id: data?._id }).catch((err) => {
        toast({
          title: "Failed to get line items",
          description: err?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
    },
    [debouncedSearchQuery, getPatientLabLineItems, toast, data]
  );

  useEffect(() => {
    appGetAllData({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, appGetAllData]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    appGetAllData({ reset: true });
  };

  const handleRowClick = (labs: any) => {
    setSelectedUser(labs);
    onOpen();
  };

  const TherapistTableColumns = [
    { headerName: "S.No.", key: "sno" },
    {
      headerName: "Lab Name",
      key: "labDetails.name",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{dt?.labDetails?.name || "-"}</Box>,
      },
    },
    { headerName: "Item Name", key: "itemName" },
    { headerName: "Item Code", key: "itemCode" },
    { headerName: "Quantity", key: "quantity" },
    { headerName: "Price", key: "price" },
    { headerName: "Total", key: "total" },
    {
      headerName: "Patient Name",
      key: "patientDetails.name",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{dt?.patientDetails?.name || "-"}</Box>,
      },
    },
    {
      headerName: "Created At",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{formatDate(dt?.createdAt)}</Box>,
      },
    },
    { headerName: "Actions", key: "table-actions", type: "table-actions" },
  ];

  // Handle Add
  const handleAdd = () => {
    setEditData(null);
    onFormOpen();
  };

  // Handle Edit
  const handleEdit = (row: any) => {
    setEditData({
      ...row,
      patientDetails: {
        label: `${row?.patientDetails?.name}-${row?.patientDetails?.code}`,
        value: row?.patientDetails?._id,
      },
      labDetails: {
        label: `${row?.labDetails?.name}`,
        value: row?.labDetails?._id,
      },
    });
    onFormOpen();
  };

  // Handle Save
  const handleSave = async (formData: any) => {
    try {
      if (editData?._id) {
        setFormLoading(true);
        const values = { ...formData };
        await updateLabItem({
          ...values,
          id: editData?._id,
          ...(replaceLabelValueObjects(values) || {}),
        });

        setEditData(null);
        getPatientLabLineItems({
          page: 1,
          limit: tablePageLimit,
          id: data?._id,
        });
        setFormLoading(false);

        toast({
          title: "Line Item Saved",
          description: `${formData.itemName} has been successfully saved.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onFormClose();
      } else {
        setFormLoading(true);
        const values = { ...formData };
        await createLabItem({
          ...values,
          ...(replaceLabelValueObjects(values) || {}),
          patientName: data?._id,
        });

        getPatientLabLineItems({
          page: 1,
          limit: tablePageLimit,
          id: data?._id,
        });
        setFormLoading(false);

        toast({
          title: "Line Item Saved",
          description: `${formData.itemName} has been successfully saved.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onFormClose();
      }
    } catch (err: any) {
      setFormLoading(false);
      toast({
        title: "Failed to save line item",
        description: err?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Delete
  const handleDelete = (row: any) => {
    setDeleteItem(row);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      setFormLoading(true);
      await deleteLabItem({
        id: deleteItem?._id,
      });

      toast({
        title: "Line Item deleted Successfully",
        description: `${deleteItem.name} has been successfully deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onDeleteClose();
      setDeleteItem(null);
      appGetAllData({ page: currentPage, limit: tablePageLimit });
      setFormLoading(false);

      onFormClose();
    } catch (err: any) {
      setFormLoading(false);
      toast({
        title: "Failed to save line item",
        description: err?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={{ base: 2, md: 4 }}>
      {isMobile ? (
        /* ============================================================== */
        /* MOBILE VIEW: DEDICATED NATIVE APP PERSPECTIVE                  */
        /* ============================================================== */
        <Box pb={8}>
          {/* Top App Bar / Actions Strip */}
          <Flex justify="space-between" align="center" mb={3} gap={2} px={1}>
            <HStack spacing={2}>
              <Text fontSize="16px" fontWeight="900" color="gray.800" letterSpacing="-0.3px">
                Line Items
              </Text>
              <Badge
                bg="rgba(13, 148, 136, 0.12)"
                color="teal.700"
                border="1px solid"
                borderColor="rgba(13, 148, 136, 0.25)"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="11px"
                fontWeight="800"
              >
                {patientItems.data?.length || 0}
              </Badge>
            </HStack>
          </Flex>

          {/* Search Box */}
          <InputGroup size="sm" mb={3}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#94A3B8" />
            </InputLeftElement>
            <Input
              placeholder="Search item name, code..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              borderRadius="xl"
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px #0D9488",
              }}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear search"
                  icon={<FiX size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                />
              </InputRightElement>
            )}
          </InputGroup>

          {/* List or Empty / Loading State */}
          {patientItems.loading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading line items...</Text>
            </Flex>
          ) : !patientItems.data || patientItems.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg="white"
              borderRadius="22px"
              border="1px dashed"
              borderColor="gray.200"
              textAlign="center"
            >
              <Icon as={FiPackage} boxSize="36px" color="gray.400" mb={2} />
              <Text fontSize="14px" fontWeight="750" color="gray.700">
                No Line Items
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1}>
                {searchQuery ? `No matching items for "${searchQuery}"` : "No line items found for this record."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {patientItems.data.map((item: any, idx: number) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const total = item.total ? Number(item.total) : qty * price;
                return (
                  <Box
                    key={item._id || idx}
                    bg="white"
                    border="1px solid"
                    borderColor="#E8EEF4"
                    borderRadius="20px"
                    p={3.5}
                    boxShadow="0 6px 18px -8px rgba(15, 23, 42, 0.12)"
                    position="relative"
                  >
                    {/* Item Top Row */}
                    <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
                      <Box flex={1} minW={0} cursor="pointer" onClick={() => handleRowClick(item)}>
                        <Text fontSize="15px" fontWeight="850" color="gray.850" noOfLines={1} letterSpacing="-0.2px">
                          {item.itemName}
                        </Text>
                        {item.itemCode && (
                          <Badge
                            mt={1}
                            bg="gray.100"
                            color="gray.700"
                            borderRadius="md"
                            px={1.5}
                            py={0.5}
                            fontSize="10px"
                            fontWeight="700"
                          >
                            Code: {item.itemCode}
                          </Badge>
                        )}
                      </Box>
                      <Badge
                        bg="rgba(13, 148, 136, 0.12)"
                        color="teal.700"
                        borderRadius="full"
                        px={2.5}
                        py={1}
                        fontSize="11px"
                        fontWeight="850"
                        flexShrink={0}
                      >
                        Qty: {qty}
                      </Badge>
                    </Flex>

                    {/* Patient & Date Meta */}
                    <Flex justify="space-between" align="center" py={1.5} borderTop="1px dashed" borderColor="gray.100" fontSize="11.5px" color="gray.500">
                      <HStack spacing={1.5} minW={0} flex={1}>
                        <Icon as={FiUser} color="teal.500" boxSize={3} />
                        <Text fontWeight="600" color="gray.700" noOfLines={1}>
                          {item.patientDetails?.name || "Patient"}
                        </Text>
                      </HStack>
                      <HStack spacing={1} flexShrink={0}>
                        <Icon as={FiCalendar} boxSize={3} />
                        <Text>{item.createdAt ? formatDate(item.createdAt) : "—"}</Text>
                      </HStack>
                    </Flex>

                    {/* Pricing Metric Strip */}
                    <SimpleGrid columns={2} spacing={2} my={2.5} p={2.5} bg="gray.50" borderRadius="xl">
                      <Box>
                        <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase">
                          Unit Price
                        </Text>
                        <Text fontSize="13px" fontWeight="800" color="gray.800">
                          ₹{price.toLocaleString("en-IN")}
                        </Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontSize="10px" fontWeight="700" color="teal.600" textTransform="uppercase">
                          Total
                        </Text>
                        <Text fontSize="14px" fontWeight="900" color="teal.700">
                          ₹{total.toLocaleString("en-IN")}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* Action Toolbar */}
                    <Flex justify="flex-end" align="center" pt={1} borderTop="1px dashed" borderColor="gray.100" gap={1}>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="teal"
                        leftIcon={<FiEye size={12} />}
                        onClick={() => handleRowClick(item)}
                        borderRadius="lg"
                        fontSize="11px"
                        fontWeight="700"
                      >
                        View
                      </Button>
                      {['admin', 'superAdmin'].includes(userType) && (
                        <>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            leftIcon={<FiEdit2 size={12} />}
                            onClick={() => handleEdit(item)}
                            borderRadius="lg"
                            fontSize="11px"
                            fontWeight="700"
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<FiTrash2 size={12} />}
                            onClick={() => handleDelete(item)}
                            borderRadius="lg"
                            fontSize="11px"
                            fontWeight="700"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Pagination Controls */}
          {patientItems.TotalPages > 1 && (
            <Flex justify="space-between" align="center" mt={4} pt={2}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                leftIcon={<FiChevronLeft size={14} />}
                isDisabled={currentPage <= 1}
                onClick={() => handleChangePage(currentPage - 1)}
              >
                Previous
              </Button>
              <Text fontSize="12px" fontWeight="700" color="gray.600">
                Page {currentPage} of {patientItems.TotalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={currentPage >= patientItems.TotalPages}
                onClick={() => handleChangePage(currentPage + 1)}
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        /* ============================================================== */
        /* DESKTOP VIEW: 100% UNCHANGED AS ORIGINAL                       */
        /* ============================================================== */
        <CustomTable
          title="Line Items"
          data={
            patientItems.data?.map((t: any, index: number) => ({
              ...t,
              sno: index + 1,
            })) || []
          }
          columns={TherapistTableColumns}
          actions={{
            actionBtn: {
              addKey: { showAddButton: false, function: handleAdd },
              editKey: { showEditButton: ['admin','superAdmin'].includes(userType) ? true : false, function: handleEdit },
              viewKey: {
                showViewButton: true,
                function: (e: any) => handleRowClick(e),
              },
              deleteKey: { showDeleteButton: ['admin','superAdmin'].includes(userType) ? true : false, function: handleDelete },
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
              totalPages: patientItems.TotalPages || 1,
            },
          }}
          loading={patientItems.loading}
        />
      )}

      {/* Drawer for viewing details */}
      <Drawer
        isOpen={isOpen}
        placement={isMobile ? "bottom" : "right"}
        onClose={onClose}
        size={isMobile ? "full" : undefined}
      >
        <DrawerOverlay />
        <DrawerContent
          minW={{ md: "60vw", sm: "100vw" }}
          h={isMobile ? "100dvh" : undefined}
          maxH={isMobile ? "100dvh" : undefined}
          borderTopRadius={0}
          borderRadius={0}
          overflow="hidden"
        >
          <DrawerCloseButton color="white" zIndex={2} />
          <DrawerHeader
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            borderRadius={0}
            borderTopRadius={0}
          >
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              Line Item Details
            </Flex>
          </DrawerHeader>
          {selectedUser && (
            <DrawerBody>
              <ViewLineItems data={selectedUser} />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      {/* Modal for Add/Edit Line Item */}
      <FormModel
        footer={false}
        title={editData ? "Edit Line Item" : "Add Line Item"}
        isOpen={isFormOpen}
        onClose={onFormClose}
        size="lg"
        isCentered
      >
        <Formik
          initialValues={{
            patientName: editData?.patientDetails || "",
            itemName: editData?.itemName || "",
            itemCode: editData?.itemCode || "",
            quantity: editData?.quantity || "",
            price: editData?.price || "",
            total: editData?.total || "",
            lab: editData?.labDetails || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSave(values)}
        >
          {({ values, setFieldValue, errors }: any) => {
            return (
              <Form>
                <Box mb={4}>
                  <VStack spacing={4} align="stretch">
                    <CustomInput
                      name="lab"
                      label="Lab"
                      value={values.lab}
                      options={editData ? [values?.lab || {}] : []}
                      type="real-time-search"
                      onChange={(e: any) => setFieldValue("lab", e)}
                      error={errors.lab}
                      showError={errors.lab}
                      params={{
                        key: "name",
                        functionName: "getLabs",
                        entityName: "labStore",
                      }}
                    />
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      <CustomInput
                        name="itemName"
                        label="Item Name"
                        value={values.itemName}
                        onChange={(e: any) =>
                          setFieldValue("itemName", e.target.value)
                        }
                        error={errors.itemName}
                        showError={errors.itemName}
                      />
                      <CustomInput
                        name="itemCode"
                        label="Item Code"
                        value={values.itemCode}
                        onChange={(e: any) =>
                          setFieldValue("itemCode", e.target.value)
                        }
                      />
                    </SimpleGrid>
                  </VStack>
                </Box>

                {/* Pricing */}
                <Box>
                  <SimpleGrid columns={2} spacing={3}>
                    <CustomInput
                      name="quantity"
                      label="Quantity"
                      type="number"
                      value={values.quantity}
                      onChange={(e: any) => {
                        const qty = e.target.value
                          ? parseInt(e.target.value)
                          : "";
                        setFieldValue("quantity", qty);
                        setFieldValue(
                          "total",
                          qty && values.price ? qty * values.price : ""
                        );
                      }}
                      error={errors.quantity}
                      showError={errors.quantity}
                    />
                    <CustomInput
                      name="price"
                      label="Price"
                      type="number"
                      value={values.price}
                      onChange={(e: any) => {
                        const price = e.target.value
                          ? parseFloat(e.target.value)
                          : "";
                        setFieldValue("price", price);
                        setFieldValue(
                          "total",
                          price && values.quantity
                            ? price * values.quantity
                            : ""
                        );
                      }}
                      error={errors.price}
                      showError={errors.price}
                    />
                  </SimpleGrid>

                  {/* Total */}
                  <Box
                    mt={4}
                    p={3.5}
                    borderRadius="xl"
                    bg="teal.50"
                    border="1px solid"
                    borderColor="teal.200"
                    textAlign="center"
                  >
                    <Text fontSize="11px" fontWeight="700" color="teal.800" textTransform="uppercase" letterSpacing="0.5px">
                      Total Amount
                    </Text>
                    <Text fontSize="24px" fontWeight="900" color="teal.700">
                      ₹{values.total || 0}
                    </Text>
                  </Box>
                </Box>
                <ModalFooter borderTopWidth="1px" py={3.5} px={{ base: 2, md: 6 }} gap={3} mt={4}>
                  <Button onClick={onFormClose} variant="outline" borderRadius="xl" flex={{ base: 1, md: "initial" }}>
                    Cancel
                  </Button>
                  <Button
                    bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                    color="white"
                    _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
                    _active={{ transform: "scale(0.98)" }}
                    type="submit"
                    isLoading={formLoading}
                    loadingText="Saving..."
                    borderRadius="xl"
                    fontWeight="800"
                    flex={{ base: 1, md: "initial" }}
                    px={6}
                  >
                    {editData ? "Update Item" : "Add Item"}
                  </Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </FormModel>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered={!isMobile}
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(4px)">
          <AlertDialogContent
            borderRadius={isMobile ? 0 : "2xl"}
            borderTopRadius={0}
            position={isMobile ? "fixed" : undefined}
            bottom={isMobile ? 0 : undefined}
            m={isMobile ? 0 : undefined}
            w={isMobile ? "100vw" : undefined}
            maxW={isMobile ? "100vw" : undefined}
            boxShadow="2xl"
            p={2}
          >
            <AlertDialogHeader>
              <HStack spacing={3} align="center">
                <Box
                  bg="red.100"
                  p={2}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiTrash2} w={5} h={5} color="red.500" />
                </Box>
                <Text fontSize="xl" fontWeight="bold">
                  Delete Line Item
                </Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody fontSize="md" color="gray.600" pt={2}>
              Are you sure you want to delete this line item? <br />
              <Text as="span" fontWeight="semibold" color="red.500">
                This action cannot be undone.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
                variant="outline"
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button
                isLoading={formLoading}
                colorScheme="red"
                borderRadius="xl"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default LineItems;
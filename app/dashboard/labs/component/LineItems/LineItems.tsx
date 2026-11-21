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
  useBreakpointValue,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Spinner,
  Icon,
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
import stores from "../../../../store/stores";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import ViewLineItems from "./component/ViewLineItems";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import FormModel from "../../../../component/common/FormModel/FormModel";
import { replaceLabelValueObjects } from "../../../../config/utils/function";

const validationSchema = Yup.object().shape({
  patientName: Yup.mixed().required("Patient Name is required"),
  itemName: Yup.string().required("Item Name is required"),
  quantity: Yup.number().required("Quantity required").positive(),
  price: Yup.number().required("Price required").positive(),
});

const LineItems = observer(({ data }: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const itemCardBg = useColorModeValue("white", "darkBrand.50");
  const itemBorder = useColorModeValue("#E8EEF4", "whiteAlpha.200");
  const itemTitle = useColorModeValue("gray.850", "white");
  const itemText = useColorModeValue("gray.700", "gray.200");
  const itemMuted = useColorModeValue("gray.500", "gray.400");
  const itemSearchBg = useColorModeValue("white", "darkBrand.100");
  const itemSearchBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const itemSearchText = useColorModeValue("gray.800", "white");
  const itemMetricBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const itemDividerBorder = useColorModeValue("gray.100", "whiteAlpha.150");
  const itemCodeBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const itemCodeText = useColorModeValue("gray.700", "gray.300");
  const {
    labStore: {
      getLabLineItems,
      lineItems,
      createLabItem,
      updateLabItem,
      deleteLabItem,
    },
    auth: {
      userType
    }
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

  const applyGetAllTherapists = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      // 👇 condition: pass patientId OR lab
      if (data?.isPatient) {
        query.patientId = data?.patientData?._id;
      } else {
        query.lab = data?._id;
      }

      getLabLineItems(query).catch((err) => {
        toast({
          title: "Failed to get line items",
          description: err?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
    },
    [debouncedSearchQuery, getLabLineItems, toast, data]
  );


  useEffect(() => {
    applyGetAllTherapists({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllTherapists]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllTherapists({ reset: true });
  };

  const handleRowClick = (labs: any) => {
    setSelectedUser(labs);
    onOpen();
  };

  const TherapistTableColumns = [
    { headerName: "S.No.", key: "sno" },
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
          lab: data?._id,
          id: editData?._id,
          ...(replaceLabelValueObjects(values) || {}),
        });

        setEditData(null);
        getLabLineItems({ page: 1, limit: tablePageLimit, lab: data?._id });
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
          lab: data?._id,
          ...(replaceLabelValueObjects(values) || {}),
        });

        getLabLineItems({ page: 1, limit: tablePageLimit, lab: data?._id });
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
      applyGetAllTherapists({ page: currentPage, limit: tablePageLimit });
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
              <Text fontSize="16px" fontWeight="900" color={itemTitle} letterSpacing="-0.3px">
                Line Items
              </Text>
              <Badge
                bg={useColorModeValue("rgba(13, 148, 136, 0.12)", "rgba(13, 148, 136, 0.25)")}
                color={useColorModeValue("teal.700", "teal.200")}
                border="1px solid"
                borderColor={useColorModeValue("rgba(13, 148, 136, 0.25)", "rgba(13, 148, 136, 0.4)")}
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="11px"
                fontWeight="800"
              >
                {lineItems.data?.length || 0}
              </Badge>
            </HStack>

            {stores.auth.hasPermission("lab", "create") && (
              <Button
                size="sm"
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                _active={{ transform: "scale(0.96)" }}
                leftIcon={<IoMdAdd fontSize="16px" />}
                borderRadius="xl"
                fontWeight="800"
                px={3.5}
                h="36px"
                boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                onClick={handleAdd}
              >
                Add Item
              </Button>
            )}
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
              bg={itemSearchBg}
              borderColor={itemSearchBorder}
              color={itemSearchText}
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
          {lineItems.loading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading line items...</Text>
            </Flex>
          ) : !lineItems.data || lineItems.data.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={itemCardBg}
              borderRadius="22px"
              border="1px dashed"
              borderColor={itemBorder}
              textAlign="center"
            >
              <Icon as={FiPackage} boxSize="36px" color={itemMuted} mb={2} />
              <Text fontSize="14px" fontWeight="750" color={itemTitle}>
                No Line Items
              </Text>
              <Text fontSize="12px" color={itemMuted} mt={1}>
                {searchQuery ? `No matching items for "${searchQuery}"` : "Tap + Add Item to create a line item."}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {lineItems.data.map((item: any, idx: number) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const total = item.total ? Number(item.total) : qty * price;
                return (
                  <Box
                    key={item._id || idx}
                    bg={itemCardBg}
                    border="1px solid"
                    borderColor={itemBorder}
                    borderRadius="20px"
                    p={3.5}
                    boxShadow="0 6px 18px -8px rgba(15, 23, 42, 0.12)"
                    position="relative"
                  >
                    {/* Item Top Row */}
                    <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
                      <Box flex={1} minW={0} cursor="pointer" onClick={() => handleRowClick(item)}>
                        <Text fontSize="15px" fontWeight="850" color={itemTitle} noOfLines={1} letterSpacing="-0.2px">
                          {item.itemName}
                        </Text>
                        {item.itemCode && (
                          <Badge
                            mt={1}
                            bg={itemCodeBg}
                            color={itemCodeText}
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
                        bg={useColorModeValue("rgba(13, 148, 136, 0.12)", "rgba(13, 148, 136, 0.25)")}
                        color={useColorModeValue("teal.700", "teal.200")}
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
                    <Flex justify="space-between" align="center" py={1.5} borderTop="1px dashed" borderColor={itemDividerBorder} fontSize="11.5px" color={itemMuted}>
                      <HStack spacing={1.5} minW={0} flex={1}>
                        <Icon as={FiUser} color="teal.500" boxSize={3} />
                        <Text fontWeight="600" color={itemText} noOfLines={1}>
                          {item.patientDetails?.name || "No Patient"}
                        </Text>
                      </HStack>
                      <HStack spacing={1} flexShrink={0}>
                        <Icon as={FiCalendar} boxSize={3} />
                        <Text>{item.createdAt ? formatDate(item.createdAt) : "—"}</Text>
                      </HStack>
                    </Flex>

                    {/* Pricing Metric Strip */}
                    <SimpleGrid columns={2} spacing={2} my={2.5} p={2.5} bg={itemMetricBg} borderRadius="xl">
                      <Box>
                        <Text fontSize="10px" fontWeight="700" color={itemMuted} textTransform="uppercase">
                          Unit Price
                        </Text>
                        <Text fontSize="13px" fontWeight="800" color={itemTitle}>
                          ₹{price.toLocaleString("en-IN")}
                        </Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontSize="10px" fontWeight="700" color={useColorModeValue("teal.600", "teal.300")} textTransform="uppercase">
                          Total
                        </Text>
                        <Text fontSize="14px" fontWeight="900" color={useColorModeValue("teal.700", "teal.200")}>
                          ₹{total.toLocaleString("en-IN")}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* Action Toolbar */}
                    <Flex justify="flex-end" align="center" pt={1} borderTop="1px dashed" borderColor={itemDividerBorder} gap={1}>
                      {stores.auth.hasPermission("lab", "view") && (
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
                      )}
                      {stores.auth.hasPermission("lab", "edit") && (
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
                      )}
                      {stores.auth.hasPermission("lab", "delete") && (
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
                      )}
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Pagination Controls */}
          {lineItems.TotalPages > 1 && (
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
                Page {currentPage} of {lineItems.TotalPages}
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderRadius="xl"
                rightIcon={<FiChevronRight size={14} />}
                isDisabled={currentPage >= lineItems.TotalPages}
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
            lineItems.data?.map((t: any, index: number) => ({
              ...t,
              sno: index + 1,
            })) || []
          }
          columns={TherapistTableColumns}
          actions={{
            actionBtn: {
              addKey: { showAddButton: stores.auth.hasPermission('lab', 'create'), function: handleAdd },
              editKey: { showEditButton: stores.auth.hasPermission('lab', 'edit'), function: handleEdit },
              viewKey: {
                showViewButton: stores.auth.hasPermission('lab', 'view'),
                function: (e: any) => handleRowClick(e),
              },
              deleteKey: { showDeleteButton: stores.auth.hasPermission('lab', 'delete'), function: handleDelete },
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
            bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
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
                      name="patientName"
                      label="Patient Name"
                      value={values.patientName}
                      options={editData ? [values?.patientName || {}] : []}
                      type="real-time-user-search"
                      onChange={(e: any) => setFieldValue("patientName", e)}
                      error={errors.patientName}
                      showError={errors.patientName}
                      query={{ userType: "patient" }}
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
                    bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                    color="white"
                    _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
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
            borderRadius={isMobile ? 0 : "xl"}
            borderTopRadius={0}
            position={isMobile ? "fixed" : undefined}
            bottom={isMobile ? 0 : undefined}
            m={isMobile ? 0 : undefined}
            w={isMobile ? "100vw" : undefined}
            maxW={isMobile ? "100vw" : undefined}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Line Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this line item? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} borderRadius="xl">
                Cancel
              </Button>
              <Button
                isLoading={formLoading}
                colorScheme="red"
                ml={3}
                onClick={confirmDelete}
                borderRadius="xl"
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
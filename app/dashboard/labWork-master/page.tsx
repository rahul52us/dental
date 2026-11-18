'use client';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  VStack,
  Text,
  useToast,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Textarea,
  Switch,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Card,
  CardBody,
  useBreakpointValue,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronRight,
  FiFolder,
  FiFileText,
  FiArrowLeft,
  FiDatabase,
  FiSearch,
  FiX,
  FiClock,
} from 'react-icons/fi';
import stores from '../../store/stores';
import { labWorkHierarchy } from '../labWork/utils/constants';

const LabWorkHierarchyMaster = observer(() => {
  const { labWorkHierarchyStore } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<{ name: string; isTextInput: boolean }>({
    name: '',
    isTextInput: false,
  });

  const resetForm = () => {
    setFormData({ name: '', isTextInput: false });
    setEditingItem(null);
  };

  const seedData = async () => {
    if (window.confirm('This will import all default lab work categories. Continue?')) {
      setLoading(true);
      try {
        const createRecursive = async (node: any, parentId: string | null = null) => {
          if (node.type === "text") return;

          const res = await labWorkHierarchyStore.createHierarchy({
            name: node.label,
            parent: parentId,
            isTextInput: false
          });
          
          if (res.status === "success" && node.children) {
            for (const child of node.children) {
              await createRecursive(child, res.data._id);
            }
          }
        };

        for (const rootNode of labWorkHierarchy) {
          await createRecursive(rootNode, null);
        }

        toast({ title: 'Default data seeded successfully', status: 'success' });
        labWorkHierarchyStore.getAllHierarchies();
      } catch (err: any) {
        toast({ title: 'Error seeding data', description: err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    labWorkHierarchyStore.getAllHierarchies();
  }, []);

  const currentItems = useMemo(() => {
    return labWorkHierarchyStore.hierarchies.filter((h) => {
      const itemParentId = h.parent ? (typeof h.parent === 'object' ? (h.parent as any)._id : h.parent) : null;
      return (itemParentId || null) === (currentParentId || null) &&
             (searchQuery.trim() === '' || h.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [labWorkHierarchyStore.hierarchies, currentParentId, searchQuery]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      isTextInput: item.isTextInput || false,
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item and its potential sub-items?')) {
      try {
        await labWorkHierarchyStore.deleteHierarchy(id);
        toast({ title: 'Deleted', status: 'success', duration: 2000 });
        labWorkHierarchyStore.getAllHierarchies();
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await labWorkHierarchyStore.updateHierarchy(editingItem._id, { 
            name: formData.name.trim(),
            isTextInput: formData.isTextInput 
        });
        toast({ title: 'Updated successfully', status: 'success' });
      } else {
        const names = formData.name.split('\n').map(n => n.trim()).filter(Boolean);
        if (names.length === 1) {
          await labWorkHierarchyStore.createHierarchy({
            name: names[0],
            parent: currentParentId,
            isTextInput: formData.isTextInput,
          });
        } else {
          await labWorkHierarchyStore.bulkCreateHierarchy(names.map(name => ({
            name,
            parent: currentParentId,
            isTextInput: formData.isTextInput,
          })));
        }
        toast({ title: `${names.length} item(s) created successfully`, status: 'success' });
      }
      onClose();
      resetForm();
      labWorkHierarchyStore.getAllHierarchies();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (item: any) => {
    setCurrentParentId(item._id);
    setBreadcrumb([...breadcrumb, item]);
  };

  const navigateBack = () => {
    if (breadcrumb.length === 0) return;
    const newBreadcrumb = [...breadcrumb];
    newBreadcrumb.pop();
    setBreadcrumb(newBreadcrumb);
    setCurrentParentId(newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1]._id : null);
  };

  const goToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentParentId(null);
      setBreadcrumb([]);
    } else {
      const newBreadcrumb = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newBreadcrumb);
      setCurrentParentId(newBreadcrumb[newBreadcrumb.length - 1]._id);
    }
  };

  return (
    <Box p={{ base: 2, sm: 3, md: 6 }}>
      <VStack align="stretch" spacing={{ base: 3, md: 6 }}>
        {/* Header Strip */}
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          gap={3}
        >
          <HStack spacing={2} align="center">
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Heading size={{ base: "md", md: "lg" }} color="#0C4A6E" fontWeight="900" letterSpacing="-0.3px">
                  Lab Work Hierarchy
                </Heading>
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
                  {currentItems.length}
                </Badge>
              </HStack>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                {breadcrumb.length > 0
                  ? `In folder: ${breadcrumb[breadcrumb.length - 1]?.name}`
                  : "Create infinite levels of lab classifications"}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2} align="center" justify={{ base: "flex-end", sm: "auto" }}>
            <Button
              leftIcon={<FiDatabase />}
              colorScheme="orange"
              variant="outline"
              onClick={seedData}
              isLoading={loading}
              size="sm"
              borderRadius="xl"
              fontWeight="700"
              fontSize="12px"
              h="36px"
              px={3}
            >
              Seed Data
            </Button>
            <Button
              leftIcon={<FiPlus />}
              bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
              color="white"
              _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
              _active={{ transform: "scale(0.96)" }}
              onClick={() => { resetForm(); onOpen(); }}
              size="sm"
              borderRadius="xl"
              fontWeight="800"
              fontSize="12px"
              h="36px"
              px={3.5}
              boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
            >
              Add {currentParentId ? 'Sub-item' : 'Item'}
            </Button>
          </HStack>
        </Flex>

        {/* Navigation & Search Card */}
        <Card variant="outline" borderRadius="20px" border="1px solid" borderColor="gray.100" shadow="sm" bg="white">
          <CardBody p={{ base: 3, md: 4 }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              gap={3}
            >
              {/* Breadcrumb Strip */}
              <HStack spacing={2} overflowX="auto" py={0.5} minW={0}>
                {breadcrumb.length > 0 && (
                  <IconButton
                    icon={<FiArrowLeft />}
                    aria-label="Back"
                    onClick={navigateBack}
                    variant="ghost"
                    size="sm"
                    borderRadius="full"
                    color="teal.600"
                    flexShrink={0}
                  />
                )}
                <Breadcrumb spacing="6px" separator={<FiChevronRight color="#94A3B8" size={12} />} fontSize="13px">
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => goToBreadcrumb(-1)} 
                      fontWeight={currentParentId === null ? "800" : "600"}
                      color={currentParentId === null ? "teal.600" : "gray.600"}
                    >
                      Root
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumb.map((item, index) => (
                    <BreadcrumbItem key={item._id}>
                      <BreadcrumbLink 
                        onClick={() => goToBreadcrumb(index)}
                        fontWeight={currentParentId === item._id ? "800" : "600"}
                        color={currentParentId === item._id ? "teal.600" : "gray.600"}
                        noOfLines={1}
                        maxW="130px"
                      >
                        {item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  ))}
                </Breadcrumb>
              </HStack>

              {/* Search Box */}
              <InputGroup size="sm" maxW={{ base: "100%", md: "260px" }}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="#94A3B8" />
                </InputLeftElement>
                <Input 
                  placeholder="Search in this folder..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
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
            </Flex>
          </CardBody>
        </Card>

        {/* ============================================================== */}
        {/* MOBILE VIEW: DEDICATED NATIVE APP PERSPECTIVE (< 768px via CSS)*/}
        {/* ============================================================== */}
        <Box display={{ base: "block", md: "none" }} pb={6}>
          {labWorkHierarchyStore.loading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading hierarchy items...</Text>
            </Flex>
          ) : currentItems.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg="white"
              borderRadius="20px"
              border="1px dashed"
              borderColor="gray.200"
              textAlign="center"
            >
              <Icon as={FiFolder} boxSize="40px" color="gray.400" mb={2} />
              <Text fontSize="15px" fontWeight="800" color="gray.700">
                No items here yet
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1} mb={3}>
                {searchQuery ? `No matching items for "${searchQuery}"` : "Add your first classification or seed default data."}
              </Text>
              <Button
                size="sm"
                bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                color="white"
                borderRadius="xl"
                onClick={() => { resetForm(); onOpen(); }}
              >
                + Add Item
              </Button>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {currentItems.map((item: any) => (
                <Box
                  key={item._id}
                  bg="white"
                  border="1px solid"
                  borderColor="#E8EEF4"
                  borderRadius="20px"
                  p={3.5}
                  boxShadow="0 4px 14px -6px rgba(15, 23, 42, 0.08)"
                  transition="all 0.2s"
                  _active={{ bg: "gray.50" }}
                >
                  {/* Card Row 1: Icon + Name + Level Badge */}
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={2}
                    cursor="pointer"
                    onClick={() => navigateTo(item)}
                    mb={2}
                  >
                    <HStack spacing={2.5} flex={1} minW={0}>
                      <Flex
                        w="38px"
                        h="38px"
                        borderRadius="12px"
                        bg={item.isTextInput ? "purple.50" : "teal.50"}
                        color={item.isTextInput ? "purple.600" : "teal.700"}
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={item.isTextInput ? FiFileText : FiFolder} boxSize={5} />
                      </Flex>
                      <Box minW={0} flex={1}>
                        <Text fontSize="14px" fontWeight="850" color="gray.850" noOfLines={1} letterSpacing="-0.2px">
                          {item.name}
                        </Text>
                        <HStack spacing={1} color="gray.400" fontSize="11px" mt={0.5}>
                          <Icon as={FiClock} boxSize={3} />
                          <Text>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </Text>
                        </HStack>
                      </Box>
                    </HStack>

                    <Badge
                      bg={item.isTextInput ? "purple.50" : "teal.50"}
                      color={item.isTextInput ? "purple.700" : "teal.700"}
                      border="1px solid"
                      borderColor={item.isTextInput ? "purple.200" : "teal.200"}
                      borderRadius="full"
                      px={2.5}
                      py={0.8}
                      fontSize="10px"
                      fontWeight="800"
                      flexShrink={0}
                    >
                      {item.isTextInput ? "Custom Text" : `Level ${breadcrumb.length + 1}`}
                    </Badge>
                  </Flex>

                  {/* Card Row 2: Action Toolbar */}
                  <Flex
                    justify="space-between"
                    align="center"
                    pt={2}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    gap={2}
                  >
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        h="28px"
                        variant="ghost"
                        colorScheme="teal"
                        borderRadius="lg"
                        fontWeight="700"
                        fontSize="11px"
                        leftIcon={<FiEdit2 fontSize="12px" />}
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        h="28px"
                        variant="ghost"
                        colorScheme="red"
                        borderRadius="lg"
                        fontWeight="700"
                        fontSize="11px"
                        leftIcon={<FiTrash2 fontSize="12px" />}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </HStack>

                    <Button
                      size="xs"
                      h="28px"
                      variant="outline"
                      colorScheme="teal"
                      borderRadius="lg"
                      fontWeight="700"
                      fontSize="11px"
                      rightIcon={<FiChevronRight fontSize="13px" />}
                      onClick={() => navigateTo(item)}
                    >
                      Open
                    </Button>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* ============================================================== */}
        {/* DESKTOP VIEW: ORIGINAL TABLE (>= 768px via CSS)                */}
        {/* ============================================================== */}
        <Box
          display={{ base: "none", md: "block" }}
          bg="white"
          borderRadius="2xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th px={8}>Name</Th>
                <Th>Type</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {labWorkHierarchyStore.loading ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={12}>
                    <Spinner color="blue.500" thickness="3px" size="xl" />
                    <Text mt={4} color="gray.500" fontWeight="medium">Loading items...</Text>
                  </Td>
                </Tr>
              ) : currentItems.length === 0 ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={12}>
                    <VStack spacing={2}>
                      <FiFolder size={40} color="#E2E8F0" />
                      <Text color="gray.400" fontSize="lg">No items here yet</Text>
                      <Button variant="link" colorScheme="blue" onClick={() => { resetForm(); onOpen(); }}>Click to add your first item</Button>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                currentItems.map((item: any) => (
                  <Tr key={item._id} _hover={{ bg: "blue.50" }} transition="all 0.2s" cursor="pointer" onClick={() => navigateTo(item)}>
                    <Td px={8}>
                      <HStack spacing={3}>
                        <Icon as={item.isTextInput ? FiFileText : FiFolder} color={item.isTextInput ? "purple.400" : "blue.400"} />
                        <VStack align="start" spacing={0}>
                           <HStack>
                              <Text fontWeight="bold" fontSize="md" color="gray.700">{item.name}</Text>
                              {item.isTextInput && <Badge colorScheme="purple" fontSize="10px">Text Input</Badge>}
                           </HStack>
                           <Text fontSize="xs" color="gray.400">Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A'}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={item.isTextInput ? "purple" : "blue"} variant="subtle" px={3} py={1} borderRadius="full">
                        {item.isTextInput ? "Custom Text" : `Level ${breadcrumb.length + 1}`}
                      </Badge>
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <HStack justify="center" spacing={2}>
                        <Tooltip label="Edit">
                          <IconButton
                            icon={<FiEdit2 />}
                            aria-label="Edit"
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(item)}
                            borderRadius="full"
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(item._id)}
                            borderRadius="full"
                          />
                        </Tooltip>
                        <Tooltip label="Open Folder">
                          <IconButton
                            icon={<FiChevronRight />}
                            aria-label="Open"
                            size="sm"
                            variant="ghost"
                            onClick={() => navigateTo(item)}
                            borderRadius="full"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Modal - Bottom Sheet on Mobile with Zero Top Corner Radius */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered={!isMobile}
        size={{ base: "full", md: "lg" }}
        motionPreset={isMobile ? "none" : undefined}
      >
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
        <ModalContent
          w={{ base: "100vw", md: undefined }}
          maxW={{ base: "100vw", md: "520px" }}
          m={{ base: 0, md: "auto" }}
          position={{ base: "fixed", md: undefined }}
          bottom={{ base: 0, md: undefined }}
          left={{ base: 0, md: undefined }}
          right={{ base: 0, md: undefined }}
          borderTopRadius={0}
          borderRadius={{ base: 0, md: "2xl" }}
          maxH={{ base: "88dvh", md: undefined }}
          overflow="hidden"
          boxShadow="2xl"
          sx={{
            "@keyframes modalSlideUpMobile": {
              "0%": {
                transform: "translateY(100%)",
                opacity: 0.85,
              },
              "100%": {
                transform: "translateY(0%)",
                opacity: 1,
              },
            },
            "@media screen and (max-width: 767px)": {
              position: "fixed !important",
              bottom: "0 !important",
              left: "0 !important",
              right: "0 !important",
              width: "100vw !important",
              maxWidth: "100vw !important",
              margin: "0 !important",
              borderRadius: "0 !important",
              borderTopLeftRadius: "0 !important",
              borderTopRightRadius: "0 !important",
              borderTopRadius: "0 !important",
              maxHeight: "88dvh !important",
              animation: "modalSlideUpMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards !important",
            },
          }}
        >
          <ModalHeader
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            borderRadius={0}
            borderTopRadius={0}
            px={{ base: 4, md: 5 }}
            py={{ base: 3.5, md: 4 }}
            sx={{
              "@media screen and (max-width: 767px)": {
                borderRadius: "0 !important",
                borderTopLeftRadius: "0 !important",
                borderTopRightRadius: "0 !important",
                borderTopRadius: "0 !important",
              },
            }}
          >
            <Text fontSize={{ base: "16px", md: "xl" }} fontWeight="800">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>
            <Text fontSize="12px" color="whiteAlpha.800" fontWeight="500" mt={0.5}>
              {currentParentId ? `Adding sub-item to "${breadcrumb[breadcrumb.length-1]?.name}"` : 'Adding a top-level category'}
            </Text>
          </ModalHeader>
          <ModalCloseButton color="white" zIndex={2} mt={{ base: 2, md: 1 }} />
          <ModalBody py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }} overflowY="auto">
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Item Name(s)</FormLabel>
                {editingItem ? (
                  <Input
                    placeholder="e.g. Zirconia"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    size="md"
                    borderRadius="xl"
                    focusBorderColor="teal.400"
                  />
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="xs" color="gray.500">You can enter multiple items, one per line.</Text>
                    <Textarea
                      placeholder="e.g.&#10;Zirconia&#10;E-Max&#10;Ceramic"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      size="md"
                      borderRadius="xl"
                      focusBorderColor="teal.400"
                      rows={4}
                    />
                  </VStack>
                )}
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} bg="gray.50" borderRadius="xl">
                <Box>
                  <FormLabel mb="0" fontWeight="700" fontSize="13px" color="gray.700">
                    Enable Custom Text Input?
                  </FormLabel>
                  <Text fontSize="11px" color="gray.500">
                    Shows text box instead of dropdown in lab sheet.
                  </Text>
                </Box>
                <Switch 
                  colorScheme="teal" 
                  isChecked={formData.isTextInput}
                  onChange={(e) => setFormData({ ...formData, isTextInput: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor="gray.100"
            py={3}
            px={{ base: 4, md: 6 }}
            bg="gray.50"
          >
            <HStack spacing={2} w="full">
              <Button
                variant="ghost"
                flex={1}
                onClick={onClose}
                borderRadius="xl"
                size="md"
              >
                Cancel
              </Button>
              <Button
                bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
                _active={{ transform: "scale(0.98)" }}
                onClick={handleSubmit}
                isLoading={loading}
                flex={1.5}
                size="md"
                borderRadius="xl"
                fontWeight="800"
                boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
              >
                {editingItem ? 'Update' : 'Save Item'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default LabWorkHierarchyMaster;
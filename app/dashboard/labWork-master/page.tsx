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
  SimpleGrid,
  Card,
  CardBody,
  Spinner,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Textarea,
  Switch,
  Icon,
} from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronRight, FiFolder, FiFileText, FiArrowLeft, FiDatabase } from 'react-icons/fi';
import stores from '../../store/stores';
import { labWorkHierarchy } from '../labWork/utils/constants';

const LabWorkHierarchyMaster = observer(() => {
  const { labWorkHierarchyStore } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
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
          if (node.type === "text") return; // Skip text input markers in constants

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
      return (itemParentId || null) === (currentParentId || null);
    });
  }, [labWorkHierarchyStore.hierarchies, currentParentId]);

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
        labWorkHierarchyStore.getAllHierarchies(); // Refresh
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
      labWorkHierarchyStore.getAllHierarchies(); // Refresh
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
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="blue.600">Lab Work Hierarchy Master</Heading>
            <Text color="gray.500">Create infinite levels of lab work classifications</Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiDatabase />}
              colorScheme="orange"
              variant="outline"
              onClick={seedData}
              isLoading={loading}
              size="md"
              borderRadius="full"
              px={6}
            >
              Seed Default Data
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => { resetForm(); onOpen(); }}
              size="md"
              borderRadius="full"
              px={6}
            >
              Add {currentParentId ? 'Sub-item' : 'Category'}
            </Button>
          </HStack>
        </Flex>

        <Card variant="outline" borderRadius="2xl" border="none" shadow="sm" bg="white">
          <CardBody p={4}>
            <HStack spacing={4}>
              {breadcrumb.length > 0 && (
                <IconButton
                  icon={<FiArrowLeft />}
                  aria-label="Back"
                  onClick={navigateBack}
                  variant="ghost"
                  borderRadius="full"
                />
              )}
              <Breadcrumb spacing="8px" separator={<FiChevronRight color="gray.500" />}>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => goToBreadcrumb(-1)} 
                    fontWeight={currentParentId === null ? "bold" : "normal"}
                    color={currentParentId === null ? "blue.600" : "gray.600"}
                  >
                    Root
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumb.map((item, index) => (
                  <BreadcrumbItem key={item._id}>
                    <BreadcrumbLink 
                      onClick={() => goToBreadcrumb(index)}
                      fontWeight={currentParentId === item._id ? "bold" : "normal"}
                      color={currentParentId === item._id ? "blue.600" : "gray.600"}
                    >
                      {item.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            </HStack>
          </CardBody>
        </Card>

        <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
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
                           <Text fontSize="xs" color="gray.400">Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
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

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" p={2}>
          <ModalHeader fontSize="2xl" fontWeight="bold">
            {editingItem ? 'Edit Item' : 'Add New Item'}
            <Text fontSize="sm" color="gray.500" mt={1}>
              {currentParentId ? `Adding sub-item to "${breadcrumb[breadcrumb.length-1]?.name}"` : 'Adding a top-level category'}
            </Text>
          </ModalHeader>
          <ModalCloseButton mt={4} mr={4} />
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
                 <FormControl isRequired>
                  <FormLabel fontWeight="bold">Item Name(s)</FormLabel>
                  {editingItem ? (
                    <Input
                      placeholder="e.g. Zirconia"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      size="lg"
                      borderRadius="xl"
                      focusBorderColor="blue.400"
                    />
                  ) : (
                    <VStack align="stretch" spacing={2}>
                       <Text fontSize="xs" color="gray.500">You can enter multiple items, one per line.</Text>
                       <Textarea
                        placeholder="e.g.&#10;Zirconia&#10;E-Max&#10;Ceramic"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        size="lg"
                        borderRadius="xl"
                        focusBorderColor="blue.400"
                        rows={5}
                      />
                    </VStack>
                  )}
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0" fontWeight="bold">
                    Enable Custom Text Input?
                  </FormLabel>
                  <Switch 
                    colorScheme="purple" 
                    isChecked={formData.isTextInput}
                    onChange={(e) => setFormData({ ...formData, isTextInput: e.target.checked })}
                  />
                </FormControl>
                <Text fontSize="xs" color="gray.500">
                  If enabled, this item will show a text box instead of a dropdown in the lab sheet.
                </Text>
              </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              px={10}
              size="lg"
              borderRadius="xl"
              shadow="md"
            >
              {editingItem ? 'Update' : 'Save Item'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default LabWorkHierarchyMaster;

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
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLayers, FiDatabase } from 'react-icons/fi';
import stores from '../../store/stores';
import { TREATMENT_CATEGORIES } from '../toothTreatment/treatmentDataConstant';

const ProcedureMaster = observer(() => {
  const { procedureStore } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState('');
  const [editingProcedure, setEditingProcedure] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    name: '',
    name2: '',
    name3: '',
  });

  useEffect(() => {
    procedureStore.getProcedures();
  }, []);

  const filteredProcedures = useMemo(() => {
    return procedureStore.procedures.data.filter((p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(search.toLowerCase())
    );
  }, [procedureStore.procedures.data, search]);

  const handleEdit = (procedure: any) => {
    setEditingProcedure(procedure);
    setFormData({
      category: procedure.category,
      subcategory: procedure.subcategory,
      name: procedure.name,
      name2: procedure.name2 || '',
      name3: procedure.name3 || '',
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this procedure?')) {
      try {
        await procedureStore.deleteProcedure(id);
        toast({ title: 'Deleted', status: 'success', duration: 2000 });
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingProcedure) {
        await procedureStore.updateProcedure(editingProcedure._id, formData);
        toast({ title: 'Procedure updated', status: 'success' });
      } else {
        await procedureStore.createProcedure(formData);
        toast({ title: 'Procedure created', status: 'success' });
      }
      onClose();
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProcedure(null);
    setFormData({
      category: '',
      subcategory: '',
      name: '',
      name2: '',
      name3: '',
    });
  };

  const seedData = async () => {
    if (window.confirm('This will import all default procedures. Continue?')) {
      const allProcedures: any[] = [];
      TREATMENT_CATEGORIES.forEach(cat => {
        cat.subcategories.forEach(sub => {
          sub.jobs.forEach(job => {
            allProcedures.push({
              category: cat.name,
              subcategory: sub.name,
              name: job.name,
              name2: '',
              name3: '',
            });
          });
        });
      });

      try {
        setLoading(true);
        await procedureStore.bulkCreateProcedures(allProcedures);
        toast({ title: 'Default procedures imported successfully', status: 'success' });
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="blue.600">Procedure Master</Heading>
            <Text color="gray.500">Manage treatment codes and classifications company-wise</Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiDatabase />}
              colorScheme="orange"
              variant="outline"
              onClick={seedData}
              isLoading={loading}
              size="md"
            >
              Seed Default Data
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => { resetForm(); onOpen(); }}
              size="md"
            >
              Add Procedure
            </Button>
          </HStack>
        </Flex>

        <Card variant="outline" borderRadius="xl">
          <CardBody p={4}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by category, subcategory or procedure name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="lg"
              />
            </InputGroup>
          </CardBody>
        </Card>

        <Box overflowX="auto" bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Category</Th>
                <Th>Subcategory</Th>
                <Th>Procedure Name</Th>
                <Th>Name 2</Th>
                <Th>Name 3</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {procedureStore.procedures.loading ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={10}>
                    <Spinner color="blue.500" />
                    <Text mt={2} color="gray.500">Loading procedures...</Text>
                  </Td>
                </Tr>
              ) : filteredProcedures.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={10}>
                    <Text color="gray.400">No procedures found</Text>
                  </Td>
                </Tr>
              ) : (
                filteredProcedures.map((p: any) => (
                  <Tr key={p._id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md">
                        {p.category}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontWeight="medium" fontSize="sm">{p.subcategory}</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="bold">{p.name}</Text>
                    </Td>
                    <Td>
                      <Text color="gray.600">{p.name2 || '-'}</Text>
                    </Td>
                    <Td>
                      <Text color="gray.600">{p.name3 || '-'}</Text>
                    </Td>
                    <Td>
                      <HStack justify="center" spacing={2}>
                        <Tooltip label="Edit">
                          <IconButton
                            icon={<FiEdit2 />}
                            aria-label="Edit"
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(p)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(p._id)}
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.100">
            {editingProcedure ? 'Edit Procedure' : 'Add New Procedure'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Input
                    placeholder="e.g. Diagnostic"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Subcategory</FormLabel>
                  <Input
                    placeholder="e.g. Clinical Evaluations"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Procedure Name</FormLabel>
                <Input
                  placeholder="e.g. Comprehensive Oral Evaluation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Procedure Name 2</FormLabel>
                  <Input
                    placeholder="Alternative name 2..."
                    value={formData.name2}
                    onChange={(e) => setFormData({ ...formData, name2: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Procedure Name 3</FormLabel>
                  <Input
                    placeholder="Alternative name 3..."
                    value={formData.name3}
                    onChange={(e) => setFormData({ ...formData, name3: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              px={8}
            >
              {editingProcedure ? 'Update' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default ProcedureMaster;

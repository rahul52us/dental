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
  Textarea,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiTablet, FiActivity } from 'react-icons/fi';
import stores from '../../store/stores';

const PrescriptionMaster = observer(() => {
  const { prescriptionStore } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState('');
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    type: '',
    category: '',
    form: '',
    basicSalt: '',
    brandName: '',
    companyName: '',
    dosage: '',
    details: '',
    doseNo: 0,
    description: '',
  });

  useEffect(() => {
    prescriptionStore.getPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const data = prescriptionStore.prescriptions.data || [];
    if (!search.trim()) return data;
    
    return data.filter((p: any) =>
      p.brandName?.toLowerCase().includes(search.toLowerCase()) ||
      p.basicSalt?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [prescriptionStore.prescriptions.data, search]);

  const handleEdit = (prescription: any) => {
    setEditingPrescription(prescription);
    setFormData({
      type: prescription.type || '',
      category: prescription.category || '',
      form: prescription.form || '',
      basicSalt: prescription.basicSalt || '',
      brandName: prescription.brandName || '',
      companyName: prescription.companyName || '',
      dosage: prescription.dosage || '',
      details: prescription.details || '',
      doseNo: prescription.doseNo || 0,
      description: prescription.description || '',
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this drug entry?')) {
      try {
        await prescriptionStore.deletePrescription(id);
        toast({ title: 'Drug entry deleted', status: 'success', duration: 2000 });
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.brandName || !formData.type) {
      toast({ title: 'Brand Name and Type are required', status: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (editingPrescription) {
        await prescriptionStore.updatePrescription(editingPrescription._id, formData);
        toast({ title: 'Prescription updated', status: 'success' });
      } else {
        await prescriptionStore.createPrescription(formData);
        toast({ title: 'New drug added to library', status: 'success' });
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
    setEditingPrescription(null);
    setFormData({
      type: '',
      category: '',
      form: '',
      basicSalt: '',
      brandName: '',
      companyName: '',
      dosage: '',
      details: '',
      doseNo: 0,
      description: '',
    });
  };

  const DoseVisualizer = ({ pattern }: { pattern: string }) => {
    if (!pattern) return null;
    const parts = pattern.split('_');
    return (
      <HStack spacing={1}>
        {parts.map((p, i) => (
          <Box 
            key={i} 
            w="8px" h="8px" 
            borderRadius="full" 
            bg={p === '*' ? "blue.500" : "gray.200"} 
            title={p === '*' ? "Dose" : "No Dose"}
          />
        ))}
      </HStack>
    );
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="blue.600">Prescription Master</Heading>
            <Text color="gray.500">Manage your drug library and default instructions</Text>
          </VStack>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => { resetForm(); onOpen(); }}
            size="md"
            boxShadow="md"
          >
            Add New Drug
          </Button>
        </Flex>

        <Card variant="outline" borderRadius="xl" shadow="sm">
          <CardBody p={4}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by brand name, salt, type or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="lg"
              />
            </InputGroup>
          </CardBody>
        </Card>

        <Box overflowX="auto" bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th py={4}>Brand Name</Th>
                <Th>Type & Category</Th>
                <Th>Form</Th>
                <Th>Basic Salt</Th>
                <Th>Company</Th>
                <Th>Dosage (Default)</Th>
                <Th>Pattern</Th>
                <Th>Dose No</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {prescriptionStore.prescriptions.loading ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={10}>
                    <Spinner color="blue.500" />
                    <Text mt={2} color="gray.500">Loading drug library...</Text>
                  </Td>
                </Tr>
              ) : filteredPrescriptions.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={10}>
                    <VStack spacing={2}>
                      <FiPackage size={40} color="#CBD5E0" />
                      <Text color="gray.400">No drugs found in library</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                filteredPrescriptions.map((p: any) => (
                  <Tr key={p._id} _hover={{ bg: "blue.50/30" }}>
                    <Td py={4}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="blue.700">{p.brandName}</Text>
                        <Text fontSize="xs" color="gray.500">{p.description.substring(0, 30)}...</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Badge colorScheme="blue" variant="subtle" fontSize="10px">{p.type}</Badge>
                        <Text fontSize="11px" color="gray.600">{p.category}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <FiTablet size={12} color="#4A5568" />
                        <Text fontWeight="medium">{p.form}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text color="gray.700" fontStyle="italic" fontSize="xs">{p.basicSalt}</Text>
                    </Td>
                    <Td>
                      <Text fontWeight="semibold" fontSize="xs" color="gray.600">{p.companyName}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" variant="outline">{p.dosage}</Badge>
                    </Td>
                    <Td>
                      <Tooltip label={p.details}>
                        <Box cursor="help">
                          <DoseVisualizer pattern={p.details} />
                        </Box>
                      </Tooltip>
                    </Td>
                    <Td fontWeight="bold" textAlign="center">{p.doseNo}</Td>
                    <Td>
                      <HStack justify="center" spacing={1}>
                        <IconButton
                          icon={<FiEdit2 />}
                          aria-label="Edit"
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(p)}
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          aria-label="Delete"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(p._id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader bg="blue.600" color="white" py={6}>
            <HStack>
              <FiActivity />
              <Text>{editingPrescription ? 'Edit Drug Record' : 'Add New Drug to Library'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={8} px={10}>
            <VStack spacing={6}>
              <SimpleGrid columns={2} spacing={8} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Type (Drug Group)</FormLabel>
                  <Input
                    placeholder="e.g. Antibiotic & Chemotherapeutic Agents"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Category</FormLabel>
                  <Input
                    placeholder="e.g. Miscellaneous Antimicrobials"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={3} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Brand Name</FormLabel>
                  <Input
                    placeholder="e.g. Ciprin 500mg"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    h="50px" borderRadius="xl" fontWeight="bold" color="blue.600"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Basic Salt</FormLabel>
                  <Input
                    placeholder="e.g. Ciprofloxacin"
                    value={formData.basicSalt}
                    onChange={(e) => setFormData({ ...formData, basicSalt: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Form</FormLabel>
                  <Input
                    placeholder="e.g. Tablet / Susp / Injection"
                    value={formData.form}
                    onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={4} spacing={4} w="full">
                 <FormControl>
                  <FormLabel fontWeight="bold">Company</FormLabel>
                  <Input
                    placeholder="e.g. Cipla / Lark"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Default Dosage</FormLabel>
                  <Input
                    placeholder="e.g. 1bid"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Dose Pattern</FormLabel>
                  <Input
                    placeholder="e.g. *_* or *_*_*_*"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Dose No.</FormLabel>
                  <Input
                    type="number"
                    value={formData.doseNo}
                    onChange={(e) => setFormData({ ...formData, doseNo: parseInt(e.target.value) })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="bold">Instructions / Description</FormLabel>
                <Textarea
                  placeholder="e.g. 9am after breakfast and 9pm after dinner"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  borderRadius="2xl" p={4} minH="100px"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" py={6} px={10}>
            <Button variant="ghost" mr={3} onClick={onClose} h="50px" px={8}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              h="50px" px={12}
              borderRadius="xl"
              boxShadow="lg"
            >
              {editingPrescription ? 'Update Record' : 'Save to Library'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default PrescriptionMaster;

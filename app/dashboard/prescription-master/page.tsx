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
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiTablet, FiActivity, FiUpload, FiEye } from 'react-icons/fi';
import stores from '../../store/stores';
import CustomDrawer from '../../component/common/Drawer/CustomDrawer';

const PrescriptionMaster = observer(() => {
  const { prescriptionStore } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const [search, setSearch] = useState('');
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const [viewingPrescription, setViewingPrescription] = useState<any>(null);
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

  const handleView = (prescription: any) => {
    setViewingPrescription(prescription);
    onViewOpen();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setLoading(true);
      try {
        const result = await prescriptionStore.bulkImportPrescriptions(base64);
        toast({
          title: 'Import Successful',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        toast({
          title: 'Import Failed',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        // Clear input
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="blue.600">Prescription Master</Heading>
            <HStack>
              <Text color="gray.500">Manage your drug library</Text>
              <Badge colorScheme="blue" variant="solid" borderRadius="full">
                {prescriptionStore.prescriptions.total} RECORDS
              </Badge>
            </HStack>
          </VStack>
          <HStack spacing={4}>
            <Input
              type="file"
              id="excel-upload"
              display="none"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
            <Button
              as="label"
              htmlFor="excel-upload"
              leftIcon={<FiUpload />}
              variant="outline"
              colorScheme="blue"
              size="md"
              cursor="pointer"
              isLoading={loading}
            >
              Import Excel
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => { resetForm(); onOpen(); }}
              size="md"
              boxShadow="md"
            >
              Add New Drug
            </Button>
          </HStack>
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

        <Box 
          overflowX="auto" 
          overflowY="auto"
          maxH="650px"
          bg="white" 
          borderRadius="xl" 
          shadow="sm" 
          border="1px solid" 
          borderColor="gray.100"
          className="custom-scrollbar"
        >
          <Table variant="simple" size="sm" colorScheme="gray">
            <Thead bg="gray.50" position="sticky" top={0} zIndex={1} shadow="sm">
              <Tr>
                <Th py={4} fontSize="10px">Brandname</Th>
                <Th fontSize="10px">Type</Th>
                <Th fontSize="10px">Catagory</Th>
                <Th fontSize="10px">Form</Th>
                <Th fontSize="10px">Companyname</Th>
                <Th textAlign="center" fontSize="10px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {prescriptionStore.prescriptions.loading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <Spinner color="blue.500" />
                    <Text mt={2} color="gray.500">Loading drug library...</Text>
                  </Td>
                </Tr>
              ) : filteredPrescriptions.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <VStack spacing={2}>
                      <FiPackage size={40} color="#CBD5E0" />
                      <Text color="gray.400">No drugs found in library</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                filteredPrescriptions.map((p: any) => (
                   <Tr key={p._id} _hover={{ bg: "blue.50/40" }} transition="all 0.2s">
                    <Td py={4}>
                      <Text fontWeight="bold" color="blue.700" fontSize="13px">{p.brandName}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" variant="subtle" fontSize="10px" borderRadius="full" px={2}>{p.type}</Badge>
                    </Td>
                    <Td>
                      <Text fontSize="12px" color="gray.600" fontWeight="600">{p.category}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <FiTablet size={12} color="#4A5568" />
                        <Text fontWeight="medium" fontSize="12px">{p.form}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontWeight="bold" fontSize="11px" color="gray.500">{p.companyName}</Text>
                    </Td>
                    <Td>
                      <HStack justify="center" spacing={1}>
                        <IconButton
                          icon={<FiEye />}
                          aria-label="View"
                          size="xs"
                          variant="ghost"
                          colorScheme="teal"
                          onClick={() => handleView(p)}
                        />
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

        {/* Pagination Controls */}
        <Flex justify="space-between" align="center" px={4} py={3} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
          <HStack spacing={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Showing {filteredPrescriptions.length} of {prescriptionStore.prescriptions.total}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Button
              size="xs"
              onClick={() => prescriptionStore.getPrescriptions({ page: prescriptionStore.prescriptions.page - 1 })}
              isDisabled={prescriptionStore.prescriptions.page <= 1}
            >
              Previous
            </Button>
            <HStack spacing={1}>
              {Array.from({ length: prescriptionStore.prescriptions.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - prescriptionStore.prescriptions.page) <= 2)
                .map(page => (
                  <Button
                    key={page}
                    size="xs"
                    colorScheme={prescriptionStore.prescriptions.page === page ? "blue" : "gray"}
                    onClick={() => prescriptionStore.getPrescriptions({ page })}
                  >
                    {page}
                  </Button>
                ))}
            </HStack>
            <Button
              size="xs"
              onClick={() => prescriptionStore.getPrescriptions({ page: prescriptionStore.prescriptions.page + 1 })}
              isDisabled={prescriptionStore.prescriptions.page >= prescriptionStore.prescriptions.totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
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
                  <FormLabel fontWeight="bold">Type</FormLabel>
                  <Input
                    placeholder="e.g. Antibiotic & Chemotherapeutic Agents"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Catagory</FormLabel>
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
                  <FormLabel fontWeight="bold">Brandname</FormLabel>
                  <Input
                    placeholder="e.g. Ciprin 500mg"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    h="50px" borderRadius="xl" fontWeight="bold" color="blue.600"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Basicsalt</FormLabel>
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
                  <FormLabel fontWeight="bold">Companyname</FormLabel>
                  <Input
                    placeholder="e.g. Cipla / Lark"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Dosage</FormLabel>
                  <Input
                    placeholder="e.g. 1bid"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">Details</FormLabel>
                  <Input
                    placeholder="e.g. *_* or *_*_*_*"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="bold">DoseNo</FormLabel>
                  <Input
                    type="number"
                    value={formData.doseNo}
                    onChange={(e) => setFormData({ ...formData, doseNo: parseInt(e.target.value) })}
                    h="50px" borderRadius="xl"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="bold">Description</FormLabel>
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

      {/* View Details Drawer */}
      <CustomDrawer
        open={isViewOpen}
        close={onViewClose}
        title="Drug Information Details"
        width="450px"
      >
        <Box p={6}>
          <VStack align="stretch" spacing={6}>
            {/* Header Identity */}
            <Box p={5} bg="blue.600" borderRadius="2xl" color="white" shadow="xl">
              <Text fontSize="10px" fontWeight="900" color="blue.200" letterSpacing="0.1em">BRANDNAME</Text>
              <Text fontSize="22px" fontWeight="1000">{viewingPrescription?.brandName}</Text>
            </Box>

            {/* Core Identity Section */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontSize="10px" fontWeight="900" color="gray.400" mb={1} letterSpacing="0.05em">TYPE</Text>
                <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                  <Text fontWeight="bold" color="blue.700" fontSize="14px">
                    {viewingPrescription?.type}
                  </Text>
                </Box>
              </Box>

              <Box>
                <Text fontSize="10px" fontWeight="900" color="gray.400" mb={1} letterSpacing="0.05em">CATAGORY</Text>
                <Box p={3} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.100">
                  <Text fontWeight="bold" color="teal.700" fontSize="14px">
                    {viewingPrescription?.category}
                  </Text>
                </Box>
              </Box>
            </VStack>

            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontSize="10px" fontWeight="900" color="gray.400" mb={1} letterSpacing="0.05em">FORM</Text>
                <HStack spacing={2} p={3} border="1px solid" borderColor="gray.200" borderRadius="xl">
                  <FiTablet color="#4A5568" />
                  <Text fontWeight="1000" color="gray.700" fontSize="12px" textTransform="uppercase">
                    {viewingPrescription?.form}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="10px" fontWeight="900" color="gray.400" mb={1} letterSpacing="0.05em">COMPANYNAME</Text>
                <Box p={3} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
                  <Text fontWeight="1000" color="purple.700" fontSize="12px">
                    {viewingPrescription?.companyName}
                  </Text>
                </Box>
              </Box>
            </SimpleGrid>

            <Box p={5} bg="gray.50" borderRadius="3xl" border="1px solid" borderColor="gray.100">
              <Text fontSize="10px" fontWeight="1000" color="gray.500" mb={4} letterSpacing="0.1em">TECHNICAL SPECIFICATIONS</Text>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontSize="11px" color="gray.500">Basicsalt</Text>
                  <Text fontWeight="bold" fontSize="12px" textAlign="right">{viewingPrescription?.basicSalt || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="11px" color="gray.500">Dosage</Text>
                  <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2} fontSize="10px">
                    {viewingPrescription?.dosage || 'N/A'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="11px" color="gray.500">DoseNo</Text>
                  <Text fontWeight="1000" fontSize="16px" color="blue.600">{viewingPrescription?.doseNo || '0'}</Text>
                </HStack>
                <Box pt={2}>
                  <Text fontSize="11px" color="gray.500" mb={2}>Details (Pattern)</Text>
                  <Box bg="white" px={3} py={2} borderRadius="lg" border="1px solid" borderColor="gray.200" w="fit-content">
                    <DoseVisualizer pattern={viewingPrescription?.details} />
                  </Box>
                </Box>
              </VStack>
            </Box>

            <Box>
              <Text fontSize="10px" fontWeight="900" color="gray.400" mb={2} letterSpacing="0.05em">DESCRIPTION</Text>
              <Box p={4} bg="blue.50" borderRadius="2xl" border="1px dashed" borderColor="blue.200">
                <Text fontSize="13px" color="blue.800" fontWeight="medium" fontStyle="italic" lineHeight="1.6">
                  "{viewingPrescription?.description || 'No specific instructions provided.'}"
                </Text>
              </Box>
            </Box>
          </VStack>
        </Box>
      </CustomDrawer>
    </Box>
  );
});

export default PrescriptionMaster;

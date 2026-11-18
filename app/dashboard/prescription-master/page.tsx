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
  InputRightElement,
  Card,
  CardBody,
  Spinner,
  Tooltip,
  Textarea,
  useBreakpointValue,
  Icon,
  Circle,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiActivity,
  FiUpload,
  FiEye,
  FiX,
  FiClock,
} from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';
import stores from '../../store/stores';
import CustomDrawer from '../../component/common/Drawer/CustomDrawer';
import CreatableSelect from 'react-select/creatable';

const PrescriptionMaster = observer(() => {
  const { prescriptionStore } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
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
    noOfDays: 0,
    details: '',
    doseNo: 0,
    description: '',
  });

  useEffect(() => {
    prescriptionStore.getPrescriptions();
    prescriptionStore.getSuggestions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const data = prescriptionStore.prescriptionsData || [];
    if (!search.trim()) return data;
    
    return data.filter((p: any) =>
      p.brandName?.toLowerCase().includes(search.toLowerCase()) ||
      p.basicSalt?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [prescriptionStore.prescriptionsData, search]);

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
      noOfDays: prescription.noOfDays || 0,
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
      prescriptionStore.getSuggestions();
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
      noOfDays: 0,
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
            w="7px" h="7px" 
            borderRadius="full" 
            bg={p === '*' ? "teal.500" : "gray.300"} 
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
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '44px',
      borderRadius: '12px',
      borderColor: '#E2E8F0',
      fontSize: '13px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#0D9488'
      }
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: '13px',
      backgroundColor: state.isFocused ? '#E6FFFA' : 'white',
      color: state.isFocused ? '#0D9488' : '#4A5568',
      cursor: 'pointer'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#A0AEC0'
    })
  };

  return (
    <Box p={{ base: 2, sm: 3, md: 6 }}>
      {/* ============================================================== */}
      {/* MOBILE APK VIEW (< 768px via CSS)                              */}
      {/* ============================================================== */}
      <Box display={{ base: "block", md: "none" }} pb={10}>
        <VStack spacing={3} align="stretch">
          {/* 1. Sleek Gradient Hero Card */}
          <Box
            p={4}
            borderRadius="22px"
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            boxShadow="0 8px 20px -4px rgba(12, 74, 110, 0.35)"
            position="relative"
            overflow="hidden"
          >
            <Circle position="absolute" size="130px" bg="whiteAlpha.100" right="-25px" bottom="-35px" />
            <Circle position="absolute" size="70px" bg="teal.300" opacity="0.15" left="-20px" top="-20px" />

            <Flex justify="space-between" align="center" position="relative" zIndex={1}>
              <HStack spacing={3}>
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="14px"
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={FaPills} boxSize={5} color="white" />
                </Flex>
                <Box>
                  <HStack spacing={2} mb={0.5}>
                    <Text fontSize="9px" fontWeight="800" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.8px">
                      DRUG REPOSITORY
                    </Text>
                    <Badge
                      bg="whiteAlpha.300"
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={0.2}
                      fontSize="10px"
                      fontWeight="800"
                    >
                      {filteredPrescriptions.length} DRUGS
                    </Badge>
                  </HStack>
                  <Heading fontSize="18px" fontWeight="900" letterSpacing="-0.3px" color="white" lineHeight="1.2">
                    Prescription Master
                  </Heading>
                  <Text color="whiteAlpha.900" fontSize="11px" fontWeight="500" mt={0.5}>
                    Pharmacy directory & dosage guide
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </Box>

          {/* 2. Unified Power Action Bar (Search + Import + Add Drug) */}
          <Flex gap={2} align="center">
            <InputGroup size="sm" flex={1}>
              <InputLeftElement pointerEvents="none" h="42px">
                <FiSearch color="#94A3B8" />
              </InputLeftElement>
              <Input
                placeholder="Search brand, salt, type, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="white"
                focusBorderColor="teal.500"
                borderRadius="16px"
                border="1px solid"
                borderColor="gray.200"
                h="42px"
                fontSize="13px"
                boxShadow="0 2px 6px rgba(0,0,0,0.02)"
              />
              {search && (
                <InputRightElement h="42px">
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX size={12} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setSearch("")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            <Input
              type="file"
              id="mobile-excel-upload"
              display="none"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
            <Tooltip label="Import Excel" placement="top" hasArrow>
              <IconButton
                as="label"
                htmlFor="mobile-excel-upload"
                aria-label="Import Excel"
                icon={<FiUpload size={16} />}
                size="sm"
                h="42px"
                w="42px"
                borderRadius="16px"
                variant="outline"
                colorScheme="teal"
                bg="white"
                borderColor="gray.200"
                cursor="pointer"
                isLoading={loading}
                flexShrink={0}
                _active={{ transform: "scale(0.96)" }}
              />
            </Tooltip>

            <Button
              size="sm"
              h="42px"
              bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
              color="white"
              _hover={{ bgGradient: "linear(135deg, #082F49, #0F766E)" }}
              _active={{ transform: "scale(0.96)" }}
              leftIcon={<FiPlus fontSize="16px" />}
              borderRadius="16px"
              fontWeight="800"
              fontSize="12px"
              px={3.5}
              boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
              onClick={() => { resetForm(); onOpen(); }}
              flexShrink={0}
            >
              Add Drug
            </Button>
          </Flex>

          {/* 3. Native Drug Cards List */}
          {prescriptionStore.prescriptionsLoading ? (
            <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
              <Spinner size="lg" color="teal.500" thickness="3px" />
              <Text fontSize="13px" color="gray.500">Loading drug library...</Text>
            </Flex>
          ) : filteredPrescriptions.length === 0 ? (
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
              <Icon as={FaPills} boxSize="40px" color="gray.400" mb={2} />
              <Text fontSize="15px" fontWeight="800" color="gray.700">
                No drugs found
              </Text>
              <Text fontSize="12px" color="gray.500" mt={1} mb={3}>
                {search ? `No results matching "${search}"` : "Add your first drug to the pharmacy library."}
              </Text>
              <Button
                size="sm"
                bgGradient="linear(135deg, #0C4A6E 0%, #0D9488 100%)"
                color="white"
                borderRadius="xl"
                onClick={() => { resetForm(); onOpen(); }}
              >
                + Add New Drug
              </Button>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {filteredPrescriptions.map((p: any) => (
                <Box
                  key={p._id}
                  bg="white"
                  border="1px solid"
                  borderColor="#E8EEF4"
                  borderRadius="20px"
                  p={3.5}
                  boxShadow="0 4px 14px -6px rgba(15, 23, 42, 0.08)"
                  transition="all 0.15s ease-out"
                  _active={{ bg: "gray.50" }}
                >
                  {/* Top Row: Pill Icon + Brand Name + Dosage */}
                  <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
                    <HStack spacing={2.5} flex={1} minW={0} cursor="pointer" onClick={() => handleView(p)}>
                      <Flex
                        w="40px"
                        h="40px"
                        borderRadius="13px"
                        bgGradient="linear(135deg, rgba(12, 74, 110, 0.08) 0%, rgba(13, 148, 136, 0.15) 100%)"
                        color="teal.700"
                        border="1px solid"
                        borderColor="rgba(13, 148, 136, 0.2)"
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={FaPills} boxSize={5} />
                      </Flex>

                      <Box minW={0} flex={1}>
                        <Text
                          fontSize="15px"
                          fontWeight="900"
                          color="#0C4A6E"
                          noOfLines={1}
                          letterSpacing="-0.2px"
                        >
                          {p.brandName}
                        </Text>

                        {/* Wrapping Badges to Prevent Horizontal Overflow */}
                        <Flex wrap="wrap" gap={1.5} mt={1} maxW="100%">
                          {p.form && (
                            <Badge
                              bg="purple.50"
                              color="purple.700"
                              border="1px solid"
                              borderColor="purple.200"
                              borderRadius="full"
                              px={2}
                              py={0.2}
                              fontSize="9px"
                              fontWeight="800"
                              textTransform="uppercase"
                            >
                              {p.form}
                            </Badge>
                          )}
                          {p.type && (
                            <Badge
                              bg="blue.50"
                              color="blue.700"
                              border="1px solid"
                              borderColor="blue.200"
                              borderRadius="full"
                              px={2}
                              py={0.2}
                              fontSize="9px"
                              fontWeight="800"
                              maxW="140px"
                              isTruncated
                            >
                              {p.type}
                            </Badge>
                          )}
                          {p.category && (
                            <Badge
                              bg="teal.50"
                              color="teal.700"
                              border="1px solid"
                              borderColor="teal.200"
                              borderRadius="full"
                              px={2}
                              py={0.2}
                              fontSize="9px"
                              fontWeight="800"
                              maxW="140px"
                              isTruncated
                            >
                              {p.category}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    </HStack>

                    {p.dosage && (
                      <Badge
                        bg="orange.50"
                        color="orange.700"
                        border="1px solid"
                        borderColor="orange.200"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="10px"
                        fontWeight="800"
                        flexShrink={0}
                      >
                        {p.dosage}
                      </Badge>
                    )}
                  </Flex>

                  {/* Body Section: Basic Salt, Company, Pattern */}
                  <VStack align="stretch" spacing={1} mb={2.5} pl="50px">
                    {p.basicSalt && (
                      <HStack spacing={1.5} color="gray.700" fontSize="12px">
                        <Icon as={FiActivity} color="teal.500" boxSize={3.5} flexShrink={0} />
                        <Text fontWeight="700" noOfLines={1}>
                          {p.basicSalt}
                        </Text>
                      </HStack>
                    )}
                    {p.companyName && (
                      <HStack spacing={1.5} color="gray.500" fontSize="11px">
                        <Icon as={FiPackage} boxSize={3} flexShrink={0} />
                        <Text fontWeight="600" noOfLines={1}>
                          {p.companyName}
                        </Text>
                      </HStack>
                    )}
                    {p.details && p.details.includes('_') && (
                      <HStack spacing={2} pt={0.5}>
                        <Text fontSize="10px" color="gray.400" fontWeight="700">Dose Pattern:</Text>
                        <DoseVisualizer pattern={p.details} />
                      </HStack>
                    )}
                  </VStack>

                  {/* Footer Action Toolbar */}
                  <Flex
                    justify="space-between"
                    align="center"
                    pt={2}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    gap={2}
                  >
                    <HStack spacing={1.5}>
                      <Button
                        size="xs"
                        h="28px"
                        px={2.5}
                        variant="ghost"
                        colorScheme="teal"
                        bg="teal.50"
                        _hover={{ bg: "teal.100" }}
                        borderRadius="lg"
                        fontWeight="700"
                        fontSize="11px"
                        leftIcon={<FiEye size={12} />}
                        onClick={() => handleView(p)}
                      >
                        View
                      </Button>
                      <Button
                        size="xs"
                        h="28px"
                        px={2.5}
                        variant="ghost"
                        colorScheme="blue"
                        bg="blue.50"
                        _hover={{ bg: "blue.100" }}
                        borderRadius="lg"
                        fontWeight="700"
                        fontSize="11px"
                        leftIcon={<FiEdit2 size={12} />}
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="xs"
                        w="28px"
                        h="28px"
                        variant="ghost"
                        colorScheme="red"
                        bg="red.50"
                        _hover={{ bg: "red.100" }}
                        borderRadius="lg"
                        icon={<FiTrash2 size={12} />}
                        aria-label="Delete"
                        onClick={() => handleDelete(p._id)}
                      />
                    </HStack>

                    <HStack spacing={1.5}>
                      {p.doseNo > 0 && (
                        <Text fontSize="11px" fontWeight="800" color="teal.700">
                          Qty: {p.doseNo}
                        </Text>
                      )}
                      {p.noOfDays > 0 && (
                        <Badge colorScheme="gray" variant="subtle" borderRadius="md" px={1.5} fontSize="10px">
                          {p.noOfDays}D
                        </Badge>
                      )}
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}

          {/* Mobile Footer Counter */}
          <Flex justify="center" align="center" mt={3} py={1}>
            <Text fontSize="xs" fontWeight="700" color="gray.500">
              Showing {filteredPrescriptions.length} of {prescriptionStore.prescriptionsMetadata.total || filteredPrescriptions.length} drugs
            </Text>
          </Flex>
        </VStack>
      </Box>

      {/* ============================================================== */}
      {/* DESKTOP VIEW: ORIGINAL TABLE (>= 768px via CSS)                */}
      {/* ============================================================== */}
      <Box display={{ base: "none", md: "block" }}>
        <VStack align="stretch" spacing={6}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Heading size="lg" color="blue.600">Prescription Master</Heading>
              <HStack>
                <Text color="gray.500">Manage your drug library</Text>
                <Badge colorScheme="blue" variant="solid" borderRadius="full">
                  {prescriptionStore.prescriptionsMetadata.total} RECORDS
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
                {prescriptionStore.prescriptionsLoading ? (
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
                          <Icon as={FaPills} boxSize={3} color="#4A5568" />
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

          {/* Total Records Counter (Desktop) */}
          <Flex
            justify="flex-end"
            px={4}
            py={3}
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Total Records: {prescriptionStore.prescriptionsMetadata.total}
            </Text>
          </Flex>
        </VStack>
      </Box>

      {/* Add / Edit Drug Modal - Bottom Sheet on Mobile with Zero Top Corner Radius */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered={!isMobile}
        size={{ base: "full", md: "4xl" }}
        motionPreset={isMobile ? "none" : undefined}
      >
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
        <ModalContent
          w={{ base: "100vw", md: undefined }}
          maxW={{ base: "100vw", md: "900px" }}
          m={{ base: 0, md: "auto" }}
          position={{ base: "fixed", md: undefined }}
          bottom={{ base: 0, md: undefined }}
          left={{ base: 0, md: undefined }}
          right={{ base: 0, md: undefined }}
          borderTopRadius={0}
          borderRadius={{ base: 0, md: "3xl" }}
          maxH={{ base: "90dvh", md: undefined }}
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
              maxHeight: "90dvh !important",
              animation: "modalSlideUpMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards !important",
            },
          }}
        >
          <ModalHeader
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            color="white"
            borderRadius={0}
            borderTopRadius={0}
            py={{ base: 3.5, md: 5 }}
            px={{ base: 4, md: 8 }}
            sx={{
              borderRadius: "0 !important",
              borderTopLeftRadius: "0 !important",
              borderTopRightRadius: "0 !important",
              borderTopRadius: "0 !important",
            }}
          >
            <HStack spacing={2.5}>
              <Icon as={FiActivity} boxSize={5} />
              <Box>
                <Text fontSize={{ base: "16px", md: "xl" }} fontWeight="800">
                  {editingPrescription ? 'Edit Drug Record' : 'Add New Drug to Library'}
                </Text>
                <Text fontSize="11px" color="whiteAlpha.800" fontWeight="500" mt={0.5}>
                  Configure pharmaceutical properties and dosage instructions
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" mt={{ base: 2, md: 3 }} />
          <ModalBody py={{ base: 4, md: 8 }} px={{ base: 4, md: 10 }} overflowY="auto">
            <VStack spacing={{ base: 4, md: 6 }}>
              {/* Type & Category */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, md: 6 }} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Type</FormLabel>
                  <CreatableSelect
                    isClearable
                    placeholder="Search or add type..."
                    options={prescriptionStore.types.map((t: string) => ({ label: t, value: t }))}
                    value={formData.type ? { label: formData.type, value: formData.type } : null}
                    onChange={(val: any) => setFormData({ ...formData, type: val?.value || '' })}
                    styles={selectStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Category</FormLabel>
                  <CreatableSelect
                    isClearable
                    placeholder="Search or add category..."
                    options={prescriptionStore.categories.map((c: string) => ({ label: c, value: c }))}
                    value={formData.category ? { label: formData.category, value: formData.category } : null}
                    onChange={(val: any) => setFormData({ ...formData, category: val?.value || '' })}
                    styles={selectStyles}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Brandname, Basic Salt, Form */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 3, md: 6 }} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Brand Name</FormLabel>
                  <CreatableSelect
                    isClearable
                    placeholder="Search or add brand..."
                    options={prescriptionStore.brandNames.map((b: string) => ({ label: b, value: b }))}
                    value={formData.brandName ? { label: formData.brandName, value: formData.brandName } : null}
                    onChange={(val: any) => setFormData({ ...formData, brandName: val?.value || '' })}
                    styles={{
                      ...selectStyles,
                      control: (base: any) => ({
                        ...selectStyles.control(base),
                        fontWeight: '700',
                        color: '#0C4A6E'
                      })
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Basic Salt</FormLabel>
                  <Input
                    placeholder="e.g. Ciprofloxacin"
                    value={formData.basicSalt}
                    onChange={(e) => setFormData({ ...formData, basicSalt: e.target.value })}
                    h="44px"
                    borderRadius="xl"
                    fontSize="13px"
                    focusBorderColor="teal.500"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Form</FormLabel>
                  <CreatableSelect
                    isClearable
                    placeholder="Search or add form..."
                    options={prescriptionStore.forms.map((f: string) => ({ label: f, value: f }))}
                    value={formData.form ? { label: formData.form, value: formData.form } : null}
                    onChange={(val: any) => setFormData({ ...formData, form: val?.value || '' })}
                    styles={selectStyles}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Company, Dosage, Days, Details */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }} w="full">
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Company Name</FormLabel>
                  <CreatableSelect
                    isClearable
                    placeholder="Search company..."
                    options={prescriptionStore.companyNames.map((c: string) => ({ label: c, value: c }))}
                    value={formData.companyName ? { label: formData.companyName, value: formData.companyName } : null}
                    onChange={(val: any) => setFormData({ ...formData, companyName: val?.value || '' })}
                    styles={selectStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Dosage</FormLabel>
                  <Input
                    placeholder="e.g. 1bid"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    h="44px"
                    borderRadius="xl"
                    fontSize="13px"
                    focusBorderColor="teal.500"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Days</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.noOfDays}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 0;
                      let timesPerDay = 1;
                      const patternMatch = formData.details.match(/\d/g);
                      if (patternMatch) {
                        timesPerDay = patternMatch.reduce((acc, curr) => acc + parseInt(curr), 0);
                      } else if (formData.dosage.toLowerCase().includes("bid")) {
                        timesPerDay = 2;
                      } else if (formData.dosage.toLowerCase().includes("tid")) {
                        timesPerDay = 3;
                      }
                      setFormData({ ...formData, noOfDays: days, doseNo: days * timesPerDay });
                    }}
                    h="44px"
                    borderRadius="xl"
                    fontSize="13px"
                    focusBorderColor="teal.500"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Pattern</FormLabel>
                  <Input
                    placeholder="e.g. *_* or *_*_*_*"
                    value={formData.details}
                    onChange={(e) => {
                      const pattern = e.target.value;
                      let timesPerDay = 1;
                      const patternMatch = pattern.match(/\d/g);
                      if (patternMatch) {
                        timesPerDay = patternMatch.reduce((acc, curr) => acc + parseInt(curr), 0);
                      }
                      setFormData({ ...formData, details: pattern, doseNo: (formData.noOfDays || 1) * timesPerDay });
                    }}
                    h="44px"
                    borderRadius="xl"
                    fontSize="13px"
                    focusBorderColor="teal.500"
                  />
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, md: 4 }} w="full">
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Dose No (Total Qty)</FormLabel>
                  <Input
                    type="number"
                    value={formData.doseNo}
                    onChange={(e) => setFormData({ ...formData, doseNo: parseInt(e.target.value) || 0 })}
                    h="44px"
                    borderRadius="xl"
                    fontSize="13px"
                    focusBorderColor="teal.500"
                  />
                </FormControl>
                {formData.details && (
                  <Box p={2.5} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.100" alignSelf="center">
                    <Text fontSize="11px" fontWeight="700" color="teal.800" mb={1}>
                      Pattern Preview:
                    </Text>
                    <DoseVisualizer pattern={formData.details} />
                  </Box>
                )}
              </SimpleGrid>

              <FormControl w="full">
                <FormLabel fontWeight="700" fontSize="13px" color="gray.700">Description / Instructions</FormLabel>
                <Textarea
                  placeholder="e.g. 9am after breakfast and 9pm after dinner"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  borderRadius="xl"
                  p={3}
                  minH="80px"
                  fontSize="13px"
                  focusBorderColor="teal.500"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" py={3} px={{ base: 4, md: 8 }} borderTop="1px solid" borderColor="gray.100">
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
                {editingPrescription ? 'Update Record' : 'Save to Library'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Drawer */}
      <CustomDrawer
        open={isViewOpen}
        close={onViewClose}
        title="Drug Information Details"
        width={isMobile ? "100vw" : "450px"}
      >
        <Box p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={5}>
            {/* Header Identity */}
            <Box
              p={4}
              bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
              borderRadius="20px"
              color="white"
              shadow="md"
            >
              <Text fontSize="10px" fontWeight="900" color="teal.200" letterSpacing="0.1em">
                BRAND NAME
              </Text>
              <Text fontSize="20px" fontWeight="900">
                {viewingPrescription?.brandName}
              </Text>
            </Box>

            {/* Core Identity Section */}
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="10px" fontWeight="800" color="gray.500" mb={1} letterSpacing="0.05em">
                  TYPE
                </Text>
                <Box p={3} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                  <Text fontWeight="800" color="blue.700" fontSize="13px">
                    {viewingPrescription?.type || 'N/A'}
                  </Text>
                </Box>
              </Box>

              <Box>
                <Text fontSize="10px" fontWeight="800" color="gray.500" mb={1} letterSpacing="0.05em">
                  CATEGORY
                </Text>
                <Box p={3} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.100">
                  <Text fontWeight="800" color="teal.700" fontSize="13px">
                    {viewingPrescription?.category || 'N/A'}
                  </Text>
                </Box>
              </Box>
            </VStack>

            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <Text fontSize="10px" fontWeight="800" color="gray.500" mb={1} letterSpacing="0.05em">
                  FORM
                </Text>
                <HStack spacing={2} p={3} border="1px solid" borderColor="gray.200" borderRadius="xl">
                  <Icon as={FaPills} color="#4A5568" />
                  <Text fontWeight="800" color="gray.700" fontSize="12px" textTransform="uppercase">
                    {viewingPrescription?.form || 'N/A'}
                  </Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="10px" fontWeight="800" color="gray.500" mb={1} letterSpacing="0.05em">
                  COMPANY
                </Text>
                <Box p={3} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
                  <Text fontWeight="800" color="purple.700" fontSize="12px" noOfLines={1}>
                    {viewingPrescription?.companyName || 'N/A'}
                  </Text>
                </Box>
              </Box>
            </SimpleGrid>

            {/* Technical Specs */}
            <Box p={4} bg="gray.50" borderRadius="20px" border="1px solid" borderColor="gray.200">
              <Text fontSize="10px" fontWeight="900" color="gray.500" mb={3} letterSpacing="0.1em">
                SPECIFICATIONS
              </Text>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="11px" color="gray.500" fontWeight="600">Basic Salt</Text>
                  <Text fontWeight="800" fontSize="12px" textAlign="right" color="gray.800">
                    {viewingPrescription?.basicSalt || 'N/A'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="11px" color="gray.500" fontWeight="600">Dosage</Text>
                  <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2} fontSize="10px">
                    {viewingPrescription?.dosage || 'N/A'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="11px" color="gray.500" fontWeight="600">Total Dose Qty</Text>
                  <Text fontWeight="900" fontSize="15px" color="teal.700">
                    {viewingPrescription?.doseNo || '0'}
                  </Text>
                </HStack>
                {viewingPrescription?.details && (
                  <Box pt={1}>
                    <Text fontSize="11px" color="gray.500" fontWeight="600" mb={1.5}>
                      Pattern
                    </Text>
                    <Box bg="white" px={3} py={2} borderRadius="lg" border="1px solid" borderColor="gray.200" w="fit-content">
                      <DoseVisualizer pattern={viewingPrescription?.details} />
                    </Box>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Description / Instructions */}
            <Box>
              <Text fontSize="10px" fontWeight="800" color="gray.500" mb={1.5} letterSpacing="0.05em">
                INSTRUCTIONS
              </Text>
              <Box p={3.5} bg="teal.50" borderRadius="xl" border="1px dashed" borderColor="teal.200">
                <Text fontSize="12px" color="teal.900" fontWeight="600" fontStyle="italic" lineHeight="1.6">
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
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
  useBreakpointValue,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLayers,
  FiDatabase,
  FiX,
} from 'react-icons/fi';
import stores from '../../store/stores';
import { TREATMENT_CATEGORIES } from '../toothTreatment/treatmentDataConstant';

const ProcedureMaster = observer(() => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  // Dark mode color tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const borderSubtle = useColorModeValue("gray.200", "gray.700");
  const borderLight = useColorModeValue("gray.100", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "gray.100");
  const textSecondary = useColorModeValue("gray.700", "gray.200");
  const textMuted = useColorModeValue("gray.600", "gray.300");
  const textFaint = useColorModeValue("gray.500", "gray.400");
  const modalBg = useColorModeValue("white", "gray.800");

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
  }, [procedureStore]);

  const filteredProcedures = useMemo(() => {
    return procedureStore.procedures.data.filter((p: any) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory?.toLowerCase().includes(search.toLowerCase())
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
    <Box p={{ base: 3, md: 6 }} pb={{ base: 20, md: 6 }}>
      <VStack align="stretch" spacing={4}>
        {/* Top Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={3}
        >
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Icon as={FiLayers} color="teal.500" boxSize={5} />
              <Heading size={{ base: "md", md: "lg" }} color={textPrimary}>
                Procedure Master
              </Heading>
              <Badge
                bg="rgba(13, 148, 136, 0.12)"
                color={useColorModeValue("teal.700", "teal.200")}
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="11px"
                fontWeight="800"
              >
                {filteredProcedures.length}
              </Badge>
            </HStack>
            <Text color={textFaint} fontSize={{ base: "12px", md: "sm" }}>
              Manage treatment codes & classifications
            </Text>
          </VStack>

          <HStack spacing={2} w={{ base: "100%", sm: "auto" }} justify={{ base: "space-between", sm: "flex-end" }}>
            <Button
              leftIcon={<FiDatabase />}
              colorScheme="orange"
              variant="outline"
              onClick={seedData}
              isLoading={loading}
              size="sm"
              borderRadius="xl"
              fontSize="12px"
              fontWeight="700"
              h="36px"
              flex={{ base: 1, sm: "initial" }}
            >
              Seed Data
            </Button>
            <Button
              leftIcon={<FiPlus />}
              bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
              _active={{ transform: "scale(0.96)" }}
              onClick={() => { resetForm(); onOpen(); }}
              size="sm"
              borderRadius="xl"
              fontSize="12px"
              fontWeight="800"
              h="36px"
              px={4}
              boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
              flex={{ base: 1, sm: "initial" }}
            >
              + Add Procedure
            </Button>
          </HStack>
        </Flex>

        {/* Search Input Box */}
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="#94A3B8" />
          </InputLeftElement>
          <Input
            placeholder="Search by category, subcategory, procedure name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="xl"
            bg={inputBg}
            color={textPrimary}
            borderColor={borderSubtle}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
            h="40px"
            fontSize="13px"
          />
          {search && (
            <InputRightElement h="40px">
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

        {/* Procedures Content: Mobile Cards or Desktop Table */}
        {isMobile ? (
          /* ================= MOBILE CARDS VIEW ================= */
          <Box>
            {procedureStore.procedures.loading ? (
              <Flex minH="200px" align="center" justify="center" direction="column" gap={3}>
                <Spinner size="lg" color="teal.500" thickness="3px" />
                <Text fontSize="13px" color={textFaint}>Loading procedures...</Text>
              </Flex>
            ) : filteredProcedures.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                p={8}
                bg={cardBg}
                borderRadius="22px"
                border="1px dashed"
                borderColor={borderSubtle}
                textAlign="center"
              >
                <Icon as={FiLayers} boxSize="36px" color="gray.400" mb={2} />
                <Text fontSize="14px" fontWeight="750" color={textSecondary}>
                  No Procedures Found
                </Text>
                <Text fontSize="12px" color={textFaint} mt={1}>
                  {search ? `No results for "${search}"` : "Tap + Add Procedure or Seed Data to begin."}
                </Text>
              </Flex>
            ) : (
              <VStack spacing={2.5} align="stretch">
                {filteredProcedures.map((p: any) => (
                  <Box
                    key={p._id}
                    bg={cardBg}
                    p={3.5}
                    borderRadius="20px"
                    boxShadow="0 2px 10px rgba(0,0,0,0.04)"
                    border="1px solid"
                    borderColor={borderSubtle}
                    borderLeft="4px solid #0D9488"
                    transition="all 0.2s"
                  >
                    {/* Category & Subcategory */}
                    <Flex justify="space-between" align="center" mb={1.5} gap={2}>
                      <Badge
                        bg="rgba(13, 148, 136, 0.12)"
                        color={useColorModeValue("teal.800", "teal.200")}
                        border="1px solid"
                        borderColor="rgba(13, 148, 136, 0.25)"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="11px"
                        fontWeight="800"
                      >
                        {p.category}
                      </Badge>
                      {p.subcategory && (
                        <Text fontSize="11px" fontWeight="600" color={textFaint} noOfLines={1}>
                          {p.subcategory}
                        </Text>
                      )}
                    </Flex>

                    {/* Procedure Name */}
                    <Text fontSize="14px" fontWeight="800" color={textPrimary} mb={1} lineHeight="1.3">
                      {p.name}
                    </Text>

                    {/* Alternative Names if present */}
                    {(p.name2 || p.name3) && (
                      <HStack spacing={2} fontSize="11px" color={textFaint} mb={2} wrap="wrap">
                        {p.name2 && <Text noOfLines={1}>• Alt 1: {p.name2}</Text>}
                        {p.name3 && <Text noOfLines={1}>• Alt 2: {p.name3}</Text>}
                      </HStack>
                    )}

                    {/* Action buttons */}
                    <Flex pt={2} borderTop="1px solid" borderColor={borderLight} justify="flex-end" gap={2}>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        color={useColorModeValue("blue.600", "blue.300")}
                        bg={useColorModeValue("blue.50", "whiteAlpha.100")}
                        _hover={{ bg: useColorModeValue("blue.100", "whiteAlpha.200") }}
                        leftIcon={<FiEdit2 fontSize="12px" />}
                        borderRadius="lg"
                        fontSize="12px"
                        fontWeight="700"
                        h="30px"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        color={useColorModeValue("red.600", "red.300")}
                        bg={useColorModeValue("red.50", "whiteAlpha.100")}
                        _hover={{ bg: useColorModeValue("red.100", "whiteAlpha.200") }}
                        leftIcon={<FiTrash2 fontSize="12px" />}
                        borderRadius="lg"
                        fontSize="12px"
                        fontWeight="700"
                        h="30px"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        ) : (
          /* ================= DESKTOP TABLE VIEW ================= */
          <Box overflowX="auto" bg={cardBg} borderRadius="xl" shadow="sm" border="1px solid" borderColor={borderLight}>
            <Table variant="simple">
              <Thead bg={subtleBg}>
                <Tr>
                  <Th color={textFaint}>Category</Th>
                  <Th color={textFaint}>Subcategory</Th>
                  <Th color={textFaint}>Procedure Name</Th>
                  <Th color={textFaint}>Name 2</Th>
                  <Th color={textFaint}>Name 3</Th>
                  <Th textAlign="center" color={textFaint}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {procedureStore.procedures.loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10}>
                      <Spinner color="teal.500" />
                      <Text mt={2} color={textMuted}>Loading procedures...</Text>
                    </Td>
                  </Tr>
                ) : filteredProcedures.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10}>
                      <Text color={textFaint}>No procedures found</Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredProcedures.map((p: any) => (
                    <Tr key={p._id} _hover={{ bg: subtleBg }}>
                      <Td>
                        <Badge
                          bg="rgba(13, 148, 136, 0.12)"
                          color="teal.800"
                          variant="subtle"
                          px={2.5}
                          py={1}
                          borderRadius="md"
                          fontWeight="750"
                        >
                          {p.category}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="medium" fontSize="sm" color={textSecondary}>{p.subcategory}</Text>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color={textPrimary}>{p.name}</Text>
                      </Td>
                      <Td>
                        <Text color={textMuted}>{p.name2 || '-'}</Text>
                      </Td>
                      <Td>
                        <Text color={textMuted}>{p.name3 || '-'}</Text>
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
        )}
      </VStack>

      {/* Add / Edit Procedure Modal (Bottom Sheet on Mobile) */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={isMobile ? "full" : "xl"}
        motionPreset={isMobile ? "none" : undefined}
      >
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent
          bg={modalBg}
          color={textPrimary}
          w={isMobile ? "100vw" : undefined}
          maxW={isMobile ? "100vw" : undefined}
          maxH={isMobile ? "88dvh" : undefined}
          m={isMobile ? 0 : undefined}
          position={isMobile ? "fixed" : undefined}
          bottom={isMobile ? 0 : undefined}
          left={isMobile ? 0 : undefined}
          right={isMobile ? 0 : undefined}
          borderTopRadius={0}
          borderRadius={isMobile ? 0 : "2xl"}
          overflow="hidden"
          display={isMobile ? "flex" : undefined}
          flexDirection={isMobile ? "column" : undefined}
          sx={
            isMobile
              ? {
                  animation: "modalSlideUpMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  "@keyframes modalSlideUpMobile": {
                    "0%": { transform: "translateY(100%)", opacity: 0.85 },
                    "100%": { transform: "translateY(0%)", opacity: 1 },
                  },
                }
              : undefined
          }
        >
          <ModalHeader
            bgGradient={isMobile ? "linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)" : undefined}
            color={isMobile ? "white" : textPrimary}
            borderBottom="1px solid"
            borderColor={isMobile ? "whiteAlpha.200" : borderLight}
            borderTopRadius={0}
            borderRadius={0}
            py={isMobile ? 3.5 : 4}
            px={isMobile ? 4 : 6}
            fontSize={isMobile ? "16px" : "lg"}
            fontWeight="800"
          >
            {editingProcedure ? 'Edit Procedure' : 'Add New Procedure'}
          </ModalHeader>
          <ModalCloseButton color={isMobile ? "white" : textMuted} top={isMobile ? 3 : 4} right={isMobile ? 3 : 4} />
          <ModalBody py={4} px={isMobile ? 4 : 6} flex={isMobile ? 1 : undefined} overflowY={isMobile ? "auto" : undefined}>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="12px" fontWeight="700" color={textSecondary}>Category</FormLabel>
                  <Input
                    placeholder="e.g. Diagnostic"
                    borderRadius="xl"
                    bg={inputBg}
                    color={textPrimary}
                    borderColor={borderSubtle}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="12px" fontWeight="700" color={textSecondary}>Subcategory</FormLabel>
                  <Input
                    placeholder="e.g. Clinical Evaluations"
                    borderRadius="xl"
                    bg={inputBg}
                    color={textPrimary}
                    borderColor={borderSubtle}
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="12px" fontWeight="700" color={textSecondary}>Procedure Name</FormLabel>
                <Input
                  placeholder="e.g. Comprehensive Oral Evaluation"
                  borderRadius="xl"
                  bg={inputBg}
                  color={textPrimary}
                  borderColor={borderSubtle}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} w="full">
                <FormControl>
                  <FormLabel fontSize="12px" fontWeight="700" color={textSecondary}>Procedure Name 2</FormLabel>
                  <Input
                    placeholder="Alternative name 2..."
                    borderRadius="xl"
                    bg={inputBg}
                    color={textPrimary}
                    borderColor={borderSubtle}
                    value={formData.name2}
                    onChange={(e) => setFormData({ ...formData, name2: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="12px" fontWeight="700" color={textSecondary}>Procedure Name 3</FormLabel>
                  <Input
                    placeholder="Alternative name 3..."
                    borderRadius="xl"
                    bg={inputBg}
                    color={textPrimary}
                    borderColor={borderSubtle}
                    value={formData.name3}
                    onChange={(e) => setFormData({ ...formData, name3: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor={borderLight}
            p={isMobile ? 3.5 : 4}
            bg={subtleBg}
          >
            <HStack spacing={2} w="full">
              <Button variant="ghost" flex={1} borderRadius="xl" onClick={onClose}>
                Cancel
              </Button>
              <Button
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                flex={1}
                borderRadius="xl"
                fontWeight="700"
                onClick={handleSubmit}
                isLoading={loading}
              >
                {editingProcedure ? 'Update' : 'Save'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default ProcedureMaster;

'use client';
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon, InfoIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Collapse,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useState } from 'react';
import stores from '../../store/stores';

type Option = { optionName: string; code: string };
type MasterData = { category: string; options: Option[] };

const MotionBox = motion(Box);
interface Sidebar {
  showSidebar?: boolean;
  handleCloseDrawer?: () => void
}

const MasterDataForm: React.FC<Sidebar> = observer(({ showSidebar = true, handleCloseDrawer }) => {
  const { dashboardStore: { getMasterData, createOrUpdateMasterData } } = stores;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [optionName, setOptionName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [masterData, setMasterData] = useState<MasterData[]>([]);
  const [editing, setEditing] = useState<Option | null>(null);
  const [errors, setErrors] = useState<{ category?: string; option?: string; code?: string }>({});
  const [loading, setLoading] = useState(false); // Loading state for Save button
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });
  const toast = useToast();

  // Fetch master data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: any = await getMasterData();
        const masters = data?.masters || [];
        setMasterData(masters);

        const cats = masters.map((m: any) => m.category);
        setCategories(cats);

        if (cats.length > 0) setSelectedCategory(cats[0]);
      } catch (err: any) {
        alert(err?.message);
      }
    };

    fetchData();
  }, [getMasterData]);

  // Add category
  const handleAddCategory = useCallback(() => {
    if (!newCategory.trim()) {
      setErrors({ category: 'Category name is required' });
      return;
    }
    if (categories.includes(newCategory.trim())) {
      setErrors({ category: 'Category already exists' });
      return;
    }
    setCategories(prev => [...prev, newCategory.trim()]);
    setSelectedCategory(newCategory.trim());
    setNewCategory('');
    setErrors({});
    toast({
      title: 'Category added',
      description: `${newCategory} has been created.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [newCategory, categories, toast]);

  // Add or update option in current category
  const handleAddOption = useCallback(() => {
    const newErrors: { option?: string; code?: string } = {};
    if (!optionName.trim()) newErrors.option = 'Option name is required';
    if (!code.trim()) newErrors.code = 'Code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setMasterData(prev => {
      const updated = [...prev];
      let catIndex = updated.findIndex(c => c.category === selectedCategory);
      if (catIndex === -1) {
        updated.push({ category: selectedCategory, options: [] });
        catIndex = updated.length - 1;
      }

      const options = [...updated[catIndex].options];
      if (editing) {
        const optIndex = options.findIndex(o => o.optionName === editing.optionName);
        if (optIndex !== -1) options[optIndex] = { optionName: optionName.trim(), code: code.trim() };
      } else {
        options.push({ optionName: optionName.trim(), code: code.trim() });
      }

      updated[catIndex].options = options;
      return updated;
    });

    setOptionName('');
    setCode('');
    setEditing(null);
    setErrors({});
  }, [optionName, code, selectedCategory, editing]);

  const handleEditOption = (opt: Option) => {
    setEditing(opt);
    setOptionName(opt.optionName);
    setCode(opt.code);
  };

  const handleDeleteOption = (optName: string) => {
    setMasterData(prev => {
      const updated = [...prev];
      const catIndex = updated.findIndex(c => c.category === selectedCategory);
      if (catIndex !== -1) {
        updated[catIndex].options = updated[catIndex].options.filter(o => o.optionName !== optName);
      }
      return updated;
    });
  };

  // Save all master data to backend
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await createOrUpdateMasterData({ masters: masterData });
      toast({
        title: 'Data Saved',
        description: 'All categories and options saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (handleCloseDrawer) {
        handleCloseDrawer();
      }
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Error while saving data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const currentOptions = masterData.find(c => c.category === selectedCategory)?.options || [];

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h="100%" bg={stores.themeStore.themeConfig.colors.custom.light.primary + "0D"} overflow="hidden" p={4} gap={4}>
      {/* Sidebar */}
      {showSidebar && (
        <Box w={{ base: '100%', md: isSidebarOpen ? '280px' : '70px' }} bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white" borderRadius="2xl" boxShadow="lg" p={4} transition="all 0.3s ease">
          <HStack justify="space-between" mb={4}>
            {isSidebarOpen && <Heading size="md">Categories</Heading>}
            <IconButton aria-label="Toggle sidebar" icon={<HamburgerIcon />} variant="ghost" color="white" onClick={toggleSidebar} />
          </HStack>
          <Collapse in={isSidebarOpen}>
            <VStack align="stretch" spacing={2}>
              {categories.map(cat => (
                <Button
                  key={cat}
                  justifyContent="space-between"
                  onClick={() => setSelectedCategory(cat)}
                  colorScheme={selectedCategory === cat ? 'blue' : 'whiteAlpha'}
                  bg={selectedCategory === cat ? stores.themeStore.themeConfig.colors.custom.light.primary + "33" : 'transparent'}
                  border={selectedCategory === cat ? "1px solid white" : "none"}
                  borderRadius="lg"
                  size="sm"
                >
                  {cat}
                  <Badge colorScheme="whiteAlpha">{masterData.find(c => c.category === cat)?.options.length || 0}</Badge>
                </Button>
              ))}
              <FormControl isInvalid={!!errors.category} mt={4}>
                <Input
                  size="sm"
                  placeholder="New Category"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  bg="whiteAlpha.800"
                  color="blue.900"
                />
                <FormErrorMessage>{errors.category}</FormErrorMessage>
              </FormControl>
              <Button leftIcon={<AddIcon />} size="sm" mt={2} bg="white" color={stores.themeStore.themeConfig.colors.custom.light.primary} _hover={{ bg: "gray.100" }} variant="solid" onClick={handleAddCategory}>
                Add
              </Button>
            </VStack>
          </Collapse>
        </Box>
      )}

      {/* Main area */}
      <Box flex="1" bg="white" borderRadius="2xl" boxShadow="xl" p={{ base: 4, md: 6 }} overflowY="auto">
        {!selectedCategory ? (
          <Center h="100%">
            <VStack spacing={3}>
              <InfoIcon boxSize={10} color="blue.400" />
              <Text fontSize="lg" color="gray.600">Select or create a category to manage options.</Text>
            </VStack>
          </Center>
        ) : (
          <>
            <HStack justify="space-between" mb={6}>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="blue.600">{selectedCategory}</Heading>
                <Text color="gray.500" fontSize="sm">Manage options and codes for this category</Text>
              </VStack>
              <Button colorScheme="blue" leftIcon={<InfoIcon />} onClick={handleSaveAll} isLoading={loading} shadow="md" borderRadius="full" px={8}>
                Save All
              </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
              <FormControl isInvalid={!!errors.option}>
                <FormLabel fontWeight="bold">Full Name</FormLabel>
                <Input placeholder="e.g. Engineer" value={optionName} onChange={e => setOptionName(e.target.value)} focusBorderColor="blue.400" />
                <FormErrorMessage>{errors.option}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.code}>
                <FormLabel fontWeight="bold">Short Name (for display)</FormLabel>
                <Input placeholder="e.g. Eg." value={code} onChange={e => setCode(e.target.value)} focusBorderColor="blue.400" />
                <FormErrorMessage>{errors.code}</FormErrorMessage>
              </FormControl>
              <Flex align="end">
                <Button colorScheme={editing ? "orange" : "blue"} leftIcon={editing ? <EditIcon /> : <AddIcon />} onClick={handleAddOption} w="full" shadow="sm">
                  {editing ? "Update Option" : "Add Option"}
                </Button>
              </Flex>
            </SimpleGrid>

            <Divider mb={6} />

            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
              {currentOptions.map((opt, idx) => (
                <Box key={idx} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl" _hover={{ shadow: "md", borderColor: "blue.200" }} transition="all 0.2s" bg="gray.50">
                  <HStack justify="space-between" mb={2}>
                    <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3}>{opt.code}</Badge>
                    <HStack spacing={1}>
                      <IconButton size="xs" variant="ghost" colorScheme="blue" icon={<EditIcon />} onClick={() => handleEditOption(opt)} aria-label="Edit" />
                      <IconButton size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => handleDeleteOption(opt.optionName)} aria-label="Delete" />
                    </HStack>
                  </HStack>
                  <Text fontWeight="bold" fontSize="md" color="gray.700">{opt.optionName}</Text>
                </Box>
              ))}
              {currentOptions.length === 0 && (
                <Flex gridColumn="span 3" justify="center" align="center" py={12} direction="column" color="gray.400">
                  <InfoIcon boxSize={8} mb={2} />
                  <Text>No options added yet for this category.</Text>
                </Flex>
              )}
            </SimpleGrid>
          </>
        )}
      </Box>
    </Flex>
  );
});

export default MasterDataForm;

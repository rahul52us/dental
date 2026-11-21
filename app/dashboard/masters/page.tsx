'use client';
import {
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiEdit2,
  FiFolderPlus,
  FiLayers,
  FiMenu,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
  FiInfo,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useState } from 'react';
import stores from '../../store/stores';

type Option = { optionName: string; code: string };
type MasterData = { category: string; options: Option[] };

interface Sidebar {
  showSidebar?: boolean;
  handleCloseDrawer?: () => void;
}

const MasterDataForm: React.FC<Sidebar> = observer(({ showSidebar = true, handleCloseDrawer }) => {
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
  const drawerBg = useColorModeValue("white", "gray.800");

  const { dashboardStore: { getMasterData, createOrUpdateMasterData } } = stores;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [optionName, setOptionName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [masterData, setMasterData] = useState<MasterData[]>([]);
  const [editing, setEditing] = useState<Option | null>(null);
  const [errors, setErrors] = useState<{ category?: string; option?: string; code?: string }>({});
  const [loading, setLoading] = useState(false);
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isAddCatOpen, onOpen: openAddCat, onClose: closeAddCat } = useDisclosure();
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
        toast({
          title: 'Failed to load master data',
          description: err?.message,
          status: 'error',
          duration: 3000,
        });
      }
    };

    fetchData();
  }, [getMasterData, toast]);

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
    closeAddCat();
    toast({
      title: 'Category added',
      description: `${newCategory} has been created.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [newCategory, categories, toast, closeAddCat]);

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

  if (!stores.auth.hasPermission('masters', 'view')) {
    return (
      <Box p={10} textAlign="center" bg={cardBg} borderRadius="2xl" m={4} shadow="sm">
        <VStack spacing={4}>
          <Icon as={FiInfo} boxSize={12} color="red.500" />
          <Heading size="md" color={textSecondary}>Access Denied</Heading>
          <Text color={textFaint}>You do not have permission to view or manage master settings.</Text>
        </VStack>
      </Box>
    );
  }

  const currentOptions = masterData.find(c => c.category === selectedCategory)?.options || [];

  return (
    <Box p={{ base: 3, md: 6 }} pb={{ base: 20, md: 6 }} minH="100%">
      {isMobile ? (
        /* ================= MOBILE APK INTERFACE ================= */
        <VStack align="stretch" spacing={3.5}>
          {/* Header Action Row */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Icon as={FiLayers} color="teal.500" boxSize={5} />
                <Text fontSize="18px" fontWeight="800" color={textPrimary}>
                  {selectedCategory || "Categories"}
                </Text>
                <Badge
                  bg="rgba(13, 148, 136, 0.12)"
                  color={useColorModeValue("teal.700", "teal.200")}
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="11px"
                  fontWeight="800"
                >
                  {currentOptions.length}
                </Badge>
              </HStack>
              <Text fontSize="12px" color={textFaint}>
                Manage options & codes
              </Text>
            </VStack>

            {(stores.auth.hasPermission('masters', 'create') || stores.auth.hasPermission('masters', 'edit')) && (
              <Button
                size="sm"
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                _active={{ transform: "scale(0.96)" }}
                borderRadius="xl"
                fontWeight="800"
                fontSize="12px"
                leftIcon={<FiSave />}
                onClick={handleSaveAll}
                isLoading={loading}
                boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                h="36px"
                px={3.5}
              >
                Save All
              </Button>
            )}
          </Flex>

          {/* Horizontal Scrollable Categories Strip */}
          <Box
            overflowX="auto"
            py={1}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <HStack spacing={2} minW="max-content">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = masterData.find((c) => c.category === cat)?.options.length || 0;
                return (
                  <Button
                    key={cat}
                    size="sm"
                    borderRadius="full"
                    px={3.5}
                    h="36px"
                    fontSize="13px"
                    fontWeight="750"
                    color={isSelected ? "white" : textSecondary}
                    bgGradient={isSelected ? "linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)" : undefined}
                    bg={isSelected ? undefined : cardBg}
                    border="1px solid"
                    borderColor={isSelected ? "transparent" : borderSubtle}
                    boxShadow={isSelected ? "0 2px 8px rgba(13, 148, 136, 0.3)" : "sm"}
                    _active={{ transform: "scale(0.97)" }}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setEditing(null);
                      setOptionName('');
                      setCode('');
                    }}
                    flexShrink={0}
                  >
                    {cat}
                    <Badge
                      ml={2}
                      borderRadius="full"
                      px={1.5}
                      py={0.2}
                      fontSize="10px"
                      fontWeight="800"
                      bg={isSelected ? "whiteAlpha.300" : subtleBg}
                      color={isSelected ? "white" : textMuted}
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}

              {stores.auth.hasPermission("masters", "create") && (
                <Button
                  size="sm"
                  borderRadius="full"
                  variant="outline"
                  colorScheme="teal"
                  borderStyle="dashed"
                  px={3}
                  h="36px"
                  fontSize="12px"
                  fontWeight="750"
                  leftIcon={<FiFolderPlus />}
                  onClick={openAddCat}
                  flexShrink={0}
                >
                  + Category
                </Button>
              )}
            </HStack>
          </Box>

          {/* Add / Edit Option Card */}
          <Box
            bg={cardBg}
            p={3.5}
            borderRadius="20px"
            boxShadow="0 2px 10px rgba(0,0,0,0.04)"
            border="1px solid"
            borderColor={borderSubtle}
          >
            <Text fontSize="12px" fontWeight="800" color={textSecondary} mb={2}>
              {editing ? `Editing: ${editing.optionName}` : `Add Option to "${selectedCategory}"`}
            </Text>

            <SimpleGrid columns={1} spacing={2.5}>
              <FormControl isInvalid={!!errors.option}>
                <Input
                  size="sm"
                  placeholder="Full Name (e.g. Engineer, Doctor)"
                  value={optionName}
                  onChange={(e) => setOptionName(e.target.value)}
                  borderRadius="xl"
                  bg={subtleBg}
                  color={textPrimary}
                  borderColor={borderSubtle}
                  fontWeight="600"
                  fontSize="13px"
                  _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
                />
                <FormErrorMessage fontSize="11px">{errors.option}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.code}>
                <Input
                  size="sm"
                  placeholder="Short Name (for display, e.g. Eng., Dr.)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  borderRadius="xl"
                  bg={subtleBg}
                  color={textPrimary}
                  borderColor={borderSubtle}
                  fontWeight="600"
                  fontSize="13px"
                  _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
                />
                <FormErrorMessage fontSize="11px">{errors.code}</FormErrorMessage>
              </FormControl>

              <Flex gap={2}>
                {editing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    borderRadius="xl"
                    fontSize="12px"
                    fontWeight="750"
                    h="36px"
                    flex={1}
                    onClick={() => {
                      setEditing(null);
                      setOptionName('');
                      setCode('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
                {((!editing && stores.auth.hasPermission('masters', 'create')) || (editing && stores.auth.hasPermission('masters', 'edit'))) && (
                  <Button
                    size="sm"
                    bgGradient={editing ? "linear(135deg, #D97706 0%, #B45309 100%)" : "linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"}
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    _active={{ transform: "scale(0.97)" }}
                    leftIcon={editing ? <FiCheck /> : <FiPlus />}
                    onClick={handleAddOption}
                    borderRadius="xl"
                    fontSize="12px"
                    fontWeight="800"
                    h="36px"
                    flex={editing ? 2 : 1}
                    boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                  >
                    {editing ? "Update Option" : "+ Add Option"}
                  </Button>
                )}
              </Flex>
            </SimpleGrid>
          </Box>

          {/* Options List Cards */}
          <Text fontSize="13px" fontWeight="800" color={textSecondary} mt={1}>
            Options in {selectedCategory} ({currentOptions.length})
          </Text>

          {currentOptions.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={6}
              bg={cardBg}
              borderRadius="20px"
              border="1px dashed"
              borderColor={borderSubtle}
              textAlign="center"
            >
              <Icon as={FiLayers} boxSize="32px" color="gray.400" mb={2} />
              <Text fontSize="13px" fontWeight="750" color={textSecondary}>
                No Options Yet
              </Text>
              <Text fontSize="12px" color={textFaint} mt={1}>
                Use the box above to add options for {selectedCategory}.
              </Text>
            </Flex>
          ) : (
            <VStack spacing={2} align="stretch">
              {currentOptions.map((opt, idx) => (
                <Flex
                  key={idx}
                  bg={cardBg}
                  p={3.5}
                  borderRadius="18px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.03)"
                  border="1px solid"
                  borderColor={borderSubtle}
                  align="center"
                  justify="space-between"
                  gap={3}
                >
                  <HStack spacing={2.5} flex={1} minW={0}>
                    <Badge
                      bg="rgba(13, 148, 136, 0.12)"
                      color={useColorModeValue("teal.800", "teal.200")}
                      border="1px solid"
                      borderColor="rgba(13, 148, 136, 0.25)"
                      borderRadius="lg"
                      px={2.5}
                      py={1}
                      fontSize="11px"
                      fontWeight="800"
                      flexShrink={0}
                    >
                      {opt.code}
                    </Badge>
                    <Text fontSize="14px" fontWeight="750" color={textPrimary} noOfLines={1}>
                      {opt.optionName}
                    </Text>
                  </HStack>

                  <HStack spacing={1} flexShrink={0}>
                    {stores.auth.hasPermission('masters', 'edit') && (
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        color={useColorModeValue("blue.600", "blue.300")}
                        icon={<FiEdit2 fontSize="13px" />}
                        onClick={() => handleEditOption(opt)}
                        aria-label="Edit"
                        borderRadius="lg"
                      />
                    )}
                    {stores.auth.hasPermission('masters', 'delete') && (
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        color={useColorModeValue("red.600", "red.300")}
                        icon={<FiTrash2 fontSize="13px" />}
                        onClick={() => handleDeleteOption(opt.optionName)}
                        aria-label="Delete"
                        borderRadius="lg"
                      />
                    )}
                  </HStack>
                </Flex>
              ))}
            </VStack>
          )}

          {/* Mobile Category Half-Bottom Sheet Drawer */}
          <Drawer isOpen={isAddCatOpen} onClose={closeAddCat} placement="bottom">
            <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
            <DrawerContent
              borderTopRadius={0}
              borderRadius={0}
              maxH="50vh"
              bg={drawerBg}
              boxShadow="0 -10px 30px rgba(0,0,0,0.25)"
              overflow="hidden"
            >
              <DrawerCloseButton color="white" zIndex={3} mt={1} />
              <DrawerHeader
                bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                borderTopRadius={0}
                borderRadius={0}
                fontSize="16px"
                fontWeight="800"
                py={3.5}
                px={4}
              >
                <HStack spacing={2}>
                  <Icon as={FiFolderPlus} boxSize={4} />
                  <Text>Create New Category</Text>
                </HStack>
              </DrawerHeader>
              <DrawerBody p={4}>
                <FormControl isInvalid={!!errors.category}>
                  <FormLabel fontSize="12px" fontWeight="700" color={textMuted}>
                    Category Name
                  </FormLabel>
                  <Input
                    placeholder="e.g. departments, blood_group, titles"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    borderRadius="xl"
                    bg={subtleBg}
                    color={textPrimary}
                    borderColor={borderSubtle}
                    fontWeight="600"
                    _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px #0D9488" }}
                  />
                  <FormErrorMessage fontSize="11px">{errors.category}</FormErrorMessage>
                </FormControl>
              </DrawerBody>
              <DrawerFooter bg={subtleBg} py={3} px={4} borderTop="1px solid" borderColor={borderLight}>
                <HStack spacing={2} w="full">
                  <Button size="sm" variant="ghost" flex={1} borderRadius="xl" onClick={closeAddCat}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                    color="white"
                    flex={1}
                    borderRadius="xl"
                    fontWeight="700"
                    onClick={handleAddCategory}
                  >
                    Add Category
                  </Button>
                </HStack>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </VStack>
      ) : (
        /* ================= DESKTOP INTERFACE ================= */
        <Flex direction="row" h="100%" bg={useColorModeValue("gray.50", "gray.900")} borderRadius="2xl" overflow="hidden" gap={4}>
          {/* Sidebar */}
          {showSidebar && (
            <Box
              w={isSidebarOpen ? '280px' : '70px'}
              bgGradient="linear(180deg, #091E42 0%, #0C4A6E 100%)"
              color="white"
              borderRadius="2xl"
              boxShadow="lg"
              p={4}
              transition="all 0.3s ease"
              flexShrink={0}
            >
              <HStack justify="space-between" mb={4}>
                {isSidebarOpen && <Heading size="md" color="white">Categories</Heading>}
                <IconButton
                  aria-label="Toggle sidebar"
                  icon={<FiMenu />}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={toggleSidebar}
                />
              </HStack>
              <Collapse in={isSidebarOpen}>
                <VStack align="stretch" spacing={2}>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      justifyContent="space-between"
                      onClick={() => setSelectedCategory(cat)}
                      colorScheme={selectedCategory === cat ? 'teal' : 'whiteAlpha'}
                      bg={selectedCategory === cat ? 'whiteAlpha.300' : 'transparent'}
                      border={selectedCategory === cat ? "1px solid white" : "none"}
                      borderRadius="lg"
                      size="sm"
                      fontWeight="700"
                    >
                      {cat}
                      <Badge colorScheme={selectedCategory === cat ? 'teal' : 'whiteAlpha'}>
                        {masterData.find((c) => c.category === cat)?.options.length || 0}
                      </Badge>
                    </Button>
                  ))}
                  <FormControl isInvalid={!!errors.category} mt={4}>
                    <Input
                      size="sm"
                      placeholder="New Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      bg="whiteAlpha.900"
                      color="gray.800"
                      borderRadius="md"
                    />
                    <FormErrorMessage>{errors.category}</FormErrorMessage>
                  </FormControl>
                  {stores.auth.hasPermission('masters', 'create') && (
                    <Button
                      leftIcon={<FiPlus />}
                      size="sm"
                      mt={2}
                      bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                      color="white"
                      _hover={{ opacity: 0.9 }}
                      variant="solid"
                      onClick={handleAddCategory}
                      borderRadius="md"
                    >
                      Add
                    </Button>
                  )}
                </VStack>
              </Collapse>
            </Box>
          )}

          {/* Main area */}
          <Box flex="1" bg={cardBg} borderRadius="2xl" boxShadow="sm" p={6} overflowY="auto">
            {!selectedCategory ? (
              <Center h="100%">
                <VStack spacing={3}>
                  <Icon as={FiLayers} boxSize={10} color="teal.400" />
                  <Text fontSize="lg" color={textMuted}>
                    Select or create a category to manage options.
                  </Text>
                </VStack>
              </Center>
            ) : (
              <>
                <HStack justify="space-between" mb={6}>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color={textPrimary}>
                      {selectedCategory}
                    </Heading>
                    <Text color={textFaint} fontSize="sm">
                      Manage options and codes for this category
                    </Text>
                  </VStack>
                  {(stores.auth.hasPermission('masters', 'create') || stores.auth.hasPermission('masters', 'edit')) && (
                    <Button
                      bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                      color="white"
                      _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                      leftIcon={<FiSave />}
                      onClick={handleSaveAll}
                      isLoading={loading}
                      shadow="md"
                      borderRadius="xl"
                      px={6}
                    >
                      Save All
                    </Button>
                  )}
                </HStack>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
                  <FormControl isInvalid={!!errors.option}>
                    <FormLabel fontWeight="bold" color={textSecondary}>Full Name</FormLabel>
                    <Input
                      placeholder="e.g. Engineer"
                      value={optionName}
                      onChange={(e) => setOptionName(e.target.value)}
                      bg={inputBg}
                      color={textPrimary}
                      borderColor={borderSubtle}
                      focusBorderColor="teal.400"
                      borderRadius="lg"
                    />
                    <FormErrorMessage>{errors.option}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.code}>
                    <FormLabel fontWeight="bold" color={textSecondary}>Short Name (for display)</FormLabel>
                    <Input
                      placeholder="e.g. Eg."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      bg={inputBg}
                      color={textPrimary}
                      borderColor={borderSubtle}
                      focusBorderColor="teal.400"
                      borderRadius="lg"
                    />
                    <FormErrorMessage>{errors.code}</FormErrorMessage>
                  </FormControl>
                  <Flex align="end">
                    {((!editing && stores.auth.hasPermission('masters', 'create')) || (editing && stores.auth.hasPermission('masters', 'edit'))) && (
                      <Button
                        bgGradient={editing ? "linear(135deg, #D97706, #B45309)" : "linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"}
                        color="white"
                        leftIcon={editing ? <FiEdit2 /> : <FiPlus />}
                        onClick={handleAddOption}
                        w="full"
                        borderRadius="lg"
                        shadow="sm"
                      >
                        {editing ? "Update Option" : "Add Option"}
                      </Button>
                    )}
                  </Flex>
                </SimpleGrid>

                <Divider mb={6} borderColor={borderSubtle} />

                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {currentOptions.map((opt, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      border="1px solid"
                      borderColor={borderSubtle}
                      borderRadius="xl"
                      _hover={{ shadow: "md", borderColor: "teal.200" }}
                      transition="all 0.2s"
                      bg={subtleBg}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Badge
                          bg="rgba(13, 148, 136, 0.12)"
                          color={useColorModeValue("teal.800", "teal.200")}
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={0.5}
                          fontWeight="800"
                        >
                          {opt.code}
                        </Badge>
                        <HStack spacing={1}>
                          {stores.auth.hasPermission('masters', 'edit') && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorScheme="teal"
                              icon={<FiEdit2 />}
                              onClick={() => handleEditOption(opt)}
                              aria-label="Edit"
                              borderRadius="lg"
                            />
                          )}
                          {stores.auth.hasPermission('masters', 'delete') && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              icon={<FiTrash2 />}
                              onClick={() => handleDeleteOption(opt.optionName)}
                              aria-label="Delete"
                              borderRadius="lg"
                            />
                          )}
                        </HStack>
                      </HStack>
                      <Text fontWeight="bold" fontSize="md" color={textPrimary}>
                        {opt.optionName}
                      </Text>
                    </Box>
                  ))}
                  {currentOptions.length === 0 && (
                    <Flex gridColumn="span 3" justify="center" align="center" py={12} direction="column" color="gray.400">
                      <Icon as={FiLayers} boxSize={8} mb={2} />
                      <Text>No options added yet for this category.</Text>
                    </Flex>
                  )}
                </SimpleGrid>
              </>
            )}
          </Box>
        </Flex>
      )}
    </Box>
  );
});

export default MasterDataForm;

'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  IconButton,
  List,
  ListItem,
  Flex,
  Divider,
  Tooltip,
  Badge,
  FormErrorMessage,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon, InfoIcon, HamburgerIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';

type Option = {
  optionName: string;
  code: string;
};

type MasterData = {
  category: string;
  options: Option[];
};

const MasterDataForm: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([
    'Insurance Options',
    'Title Options'
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [optionName, setOptionName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [masterData, setMasterData] = useState<MasterData[]>([]);
  const [editingOption, setEditingOption] = useState<{ category: string; code: string } | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ category: string; code: string } | null>(null);
  const [inlineOptionName, setInlineOptionName] = useState<string>('');
  const [inlineCode, setInlineCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [undoData, setUndoData] = useState<{ category: string; option: Option } | null>(null);
  const toast = useToast();
  const optionNameRef = useRef<HTMLInputElement>(null);
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });

  // Form validation states
  const [categoryError, setCategoryError] = useState('');
  const [optionNameError, setOptionNameError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [inlineOptionNameError, setInlineOptionNameError] = useState('');
  const [inlineCodeError, setInlineCodeError] = useState('');

  // Animations
  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  `;
  const glow = keyframes`
    0% { background-color: teal.100; }
    50% { background-color: teal.200; }
    100% { background-color: teal.100; }
  `;

  // Placeholder hints based on category
  const getPlaceholder = useCallback((category: string) => {
    switch (category) {
      case 'Insurance Options':
        return { name: 'e.g. Health Insurance', code: 'e.g. HI' };
      case 'Title Options':
        return { name: 'e.g. Mr, Ms', code: 'e.g. MR, MS' };
      default:
        return { name: 'e.g. Option Name', code: 'e.g. CODE' };
    }
  }, []);

  // Validate category input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (newCategory && categories.includes(newCategory.trim())) {
        setCategoryError('Please enter a unique category name');
      } else {
        setCategoryError('');
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [newCategory, categories]);

  // Validate option inputs
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!optionName) {
        setOptionNameError('Please enter an option name');
      } else {
        setOptionNameError('');
      }
      if (!code) {
        setCodeError('Please enter a code');
      } else if (
        masterData
          .find(c => c.category === selectedCategory)
          ?.options.some(o => o.code === code && (!editingOption || editingOption.code !== o.code))
      ) {
        setCodeError('This code already exists in the category');
      } else {
        setCodeError('');
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [optionName, code, selectedCategory, masterData, editingOption]);

  // Validate inline edit inputs
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inlineEdit) {
        if (!inlineOptionName) {
          setInlineOptionNameError('Please enter an option name');
        } else {
          setInlineOptionNameError('');
        }
        if (!inlineCode) {
          setInlineCodeError('Please enter a code');
        } else if (
          masterData
            .find(c => c.category === inlineEdit.category)
            ?.options.some(o => o.code === inlineCode && o.code !== inlineEdit.code)
        ) {
          setInlineCodeError('This code already exists in the category');
        } else {
          setInlineCodeError('');
        }
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [inlineOptionName, inlineCode, inlineEdit, masterData]);

  // Auto-focus input when editing or selecting category
  useEffect(() => {
    if ((inlineEdit || selectedCategory) && optionNameRef.current) {
      optionNameRef.current.focus();
    }
  }, [inlineEdit, selectedCategory]);

  // Handle add new category
  const handleAddCategory = useCallback(() => {
    if (!newCategory || categoryError) return;
    setIsLoading(true);
    setTimeout(() => {
      const newCat = newCategory.trim();
      setCategories(prev => [...prev, newCat]);
      setSelectedCategory(newCat);
      setNewCategory('');
      toast({
        title: 'Category Added',
        description: (
          <HStack>
            <CheckIcon color="green.500" />
            <Text>{`${newCat} has been added to your categories.`}</Text>
          </HStack>
        ),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }, 500);
  }, [newCategory, categoryError, toast]);

  // Handle add or update option
  const handleAddOrUpdateOption = useCallback(
    (addAnother: boolean = false) => {
      if (!selectedCategory || !optionName || !code || optionNameError || codeError) return;
      setIsLoading(true);
      setTimeout(() => {
        setMasterData(prev => {
          const existingCategory = prev.find(c => c.category === selectedCategory);
          if (editingOption) {
            const updatedData = prev.map(c =>
              c.category === selectedCategory
                ? {
                    ...c,
                    options: c.options.map(o =>
                      o.code === editingOption.code ? { optionName, code } : o
                    ),
                  }
                : c
            );
            toast({
              title: 'Option Updated',
              description: (
                <HStack>
                  <CheckIcon color="green.500" />
                  <Text>{`${optionName} has been updated in ${selectedCategory}.`}</Text>
                </HStack>
              ),
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            setEditingOption(null);
            return updatedData;
          } else {
            if (existingCategory) {
              return prev.map(c =>
                c.category === selectedCategory
                  ? { ...c, options: [...c.options, { optionName, code }] }
                  : c
              );
            }
            return [...prev, { category: selectedCategory, options: [{ optionName, code }] }];
          }
        });
        toast({
          title: editingOption ? 'Option Updated' : 'Option Added',
          description: (
            <HStack>
              <CheckIcon color="green.500" />
              <Text>{`${optionName} has been ${editingOption ? 'updated' : 'added'} in ${selectedCategory}.`}</Text>
            </HStack>
          ),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        if (!addAnother) {
          setOptionName('');
          setCode('');
        }
        setIsLoading(false);
      }, 500);
    },
    [selectedCategory, optionName, code, optionNameError, codeError, editingOption, toast]
  );

  // Handle inline edit
  const handleInlineEdit = useCallback((category: string, option: Option) => {
    setInlineEdit({ category, code: option.code });
    setInlineOptionName(option.optionName);
    setInlineCode(option.code);
  }, []);

  // Handle inline edit save
  const handleInlineEditSave = useCallback((category: string, oldCode: string) => {
    if (!inlineOptionName || !inlineCode || inlineOptionNameError || inlineCodeError) return;
    setIsLoading(true);
    setTimeout(() => {
      setMasterData(prev =>
        prev.map(c =>
          c.category === category
            ? {
                ...c,
                options: c.options.map(o =>
                  o.code === oldCode ? { optionName: inlineOptionName, code: inlineCode } : o
                ),
              }
            : c
        )
      );
      toast({
        title: 'Option Updated',
        description: (
          <HStack>
            <CheckIcon color="green.500" />
            <Text>{`${inlineOptionName} has been updated in ${category}.`}</Text>
          </HStack>
        ),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setInlineEdit(null);
      setInlineOptionName('');
      setInlineCode('');
      setIsLoading(false);
    }, 500);
  }, [inlineOptionName, inlineCode, inlineOptionNameError, inlineCodeError, toast]);

  // Handle inline edit cancel
  const handleInlineEditCancel = useCallback(() => {
    setInlineEdit(null);
    setInlineOptionName('');
    setInlineCode('');
    toast({
      title: 'Edit Canceled',
      description: 'Changes have been discarded.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  // Handle delete option with undo
  const handleDelete = useCallback((category: string, option: Option) => {
    setIsLoading(true);
    setTimeout(() => {
      setUndoData({ category, option });
      setMasterData(prev =>
        prev
          .map(c =>
            c.category === category
              ? { ...c, options: c.options.filter(opt => opt.code !== option.code) }
              : c
          )
          .filter(c => c.options.length > 0 || c.category === selectedCategory)
      );
      toast({
        title: 'Option Deleted',
        description: (
          <HStack>
            <Text>{`${option.optionName} has been deleted from ${category}.`}</Text>
            <Button
              size="sm"
              variant="link"
              colorScheme="teal"
              onClick={() => {
                setMasterData(prev => {
                  const existingCategory = prev.find(c => c.category === category);
                  if (existingCategory) {
                    return prev.map(c =>
                      c.category === category
                        ? { ...c, options: [...c.options, undoData!.option] }
                        : c
                    );
                  }
                  return [...prev, { category, options: [undoData!.option] }];
                });
                toast({
                  title: 'Undo Successful',
                  description: (
                    <HStack>
                      <CheckIcon color="green.500" />
                      <Text>{`${undoData!.option.optionName} has been restored.`}</Text>
                    </HStack>
                  ),
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
                setUndoData(null);
              }}
            >
              Undo
            </Button>
          </HStack>
        ),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }, 500);
  }, [selectedCategory, toast, undoData]);

  // Handle delete category
  const handleDeleteCategory = useCallback((category: string) => {
    if (category === selectedCategory) {
      setSelectedCategory('');
    }
    setCategories(prev => prev.filter(c => c !== category));
    setMasterData(prev => prev.filter(c => c.category !== category));
    toast({
      title: 'Category Deleted',
      description: (
        <HStack>
          <CheckIcon color="green.500" />
          <Text>{`${category} has been deleted.`}</Text>
        </HStack>
      ),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [selectedCategory, toast]);

  // Handle category selection with feedback
  const handleSelectCategory = useCallback(
    (category: string) => {
      if (category !== selectedCategory) {
        setSelectedCategory(category);
        toast({
          title: 'Category Selected',
          description: `Now managing options for ${category}.`,
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      }
    },
    [selectedCategory, toast]
  );

  // Handle Enter key for inline edit
  const handleInlineKeyPress = useCallback(
    (e: React.KeyboardEvent, category: string, oldCode: string) => {
      if (e.key === 'Enter') {
        handleInlineEditSave(category, oldCode);
      }
    },
    [handleInlineEditSave]
  );

  return (
    <Flex minH="85vh" bg="gray.50" p={{ base: 4, md: 8 }} bgGradient="linear(to-br, gray.50, teal.50)">
      {/* Sidebar for Categories */}
      <Box
        w={{ base: '100%', md: isSidebarOpen ? '350px' : '60px' }}
        bgGradient="linear(to-b, blue.500, blue.300)"
        color="white"
        borderRadius="xl"
        boxShadow="lg"
        p={4}
        mr={{ md: 6 }}
        mb={{ base: 4, md: 0 }}
        transition="width 0.3s ease"
      >
        <HStack justifyContent="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="bold" display={isSidebarOpen ? 'block' : 'none'}>
            Categories
          </Text>
          <IconButton
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            icon={<HamburgerIcon />}
            colorScheme="whiteAlpha"
            size="sm"
            onClick={toggleSidebar}
          />
        </HStack>
        <Collapse in={isSidebarOpen} animateOpacity>
          <VStack align="stretch" spacing={2}>
            {categories.map((cat, idx) => (
              <HStack key={idx} justifyContent="space-between">
                <Button
                  variant={selectedCategory === cat ? 'solid' : 'outline'}
                  colorScheme={selectedCategory === cat ? 'white' : 'white'}
                  justifyContent="flex-start"
                  onClick={() => handleSelectCategory(cat)}
                  leftIcon={selectedCategory === cat ? <CheckIcon /> : undefined}
                  borderRadius="full"
                  _hover={{ bg: 'teal.600' }}
                  _active={{ bg: 'teal.700' }}
                  aria-selected={selectedCategory === cat}
                  animation={selectedCategory === cat ? `${glow} 2s infinite` : undefined}
                >
                  {cat}
                  <Badge ml={2} colorScheme="whiteAlpha" variant="subtle">
                    {(masterData.find(c => c.category === cat)?.options.length || 0)}
                  </Badge>
                </Button>
                <Tooltip label="Delete category">
                  <IconButton
                    aria-label={`Delete ${cat}`}
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(cat)}
                    isDisabled={isLoading}
                  />
                </Tooltip>
              </HStack>
            ))}
            <Button
              leftIcon={<AddIcon />}
              variant="outline"
              colorScheme="whiteAlpha"
              borderRadius="full"
              onClick={() => {
                setSelectedCategory('');
                setNewCategory('');
              }}
            >
              New Category
            </Button>
          </VStack>
        </Collapse>
      </Box>

      {/* Main Content */}
      <Box flex={1} bg="white" borderRadius="xl" boxShadow="lg" p={6}>
        <HStack justifyContent="space-between" mb={4}>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="teal.600">
            {selectedCategory || 'Welcome to Master Data Manager'}
          </Text>
          <Tooltip
            label={
              <VStack align="start" p={2}>
                <Text fontWeight="bold">Quick Tips:</Text>
                <Text>1. Click a category to manage its options.</Text>
                <Text>2. Add options using the form below.</Text>
                <Text>3. Edit or delete options inline.</Text>
                <Text>{`4. Use "Undo" in notifications to recover deleted options.`}</Text>
              </VStack>
            }
            placement="left"
            hasArrow
          >
            <IconButton
              aria-label="Show quick tips"
              icon={<InfoIcon />}
              colorScheme="teal"
              variant="outline"
              size="sm"
            />
          </Tooltip>
        </HStack>

        {/* Welcome Message */}
        {!selectedCategory && (
          <Text color="gray.600" mb={4} fontStyle="italic">
            Select a category from the sidebar or create a new one to start managing your options.
          </Text>
        )}

        {/* Action Area */}
        <VStack spacing={4} align="stretch" mb={8}>
          <Text fontSize="md" fontWeight="semibold" color="gray.600">
            {selectedCategory ? 'Manage Options' : 'Create a New Category'}
          </Text>
          {selectedCategory ? (
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} flexDir={{ base: 'column', md: 'row' }} align="flex-start">
                <FormControl isInvalid={!!optionNameError}>
                  <FormLabel fontSize="sm">Option Name</FormLabel>
                  <Input
                    placeholder={getPlaceholder(selectedCategory).name}
                    value={optionName}
                    onChange={e => setOptionName(e.target.value)}
                    size="lg"
                    bg="gray.50"
                    ref={optionNameRef}
                    autoFocus
                    aria-describedby="option-name-hint"
                  />
                  <Text id="option-name-hint" fontSize="xs" color="gray.500" mt={1}>
                    This is what users will see (e.g., Male, Health Insurance).
                  </Text>
                  <FormErrorMessage>{optionNameError}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!codeError}>
                  <FormLabel fontSize="sm">Code</FormLabel>
                  <Input
                    placeholder={getPlaceholder(selectedCategory).code}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    size="lg"
                    bg="gray.50"
                    aria-describedby="code-hint"
                  />
                  <Text id="code-hint" fontSize="xs" color="gray.500" mt={1}>
                    A unique system identifier (e.g., M, HI).
                  </Text>
                  <FormErrorMessage>{codeError}</FormErrorMessage>
                </FormControl>
              </HStack>
              <HStack>
                <Button
                  leftIcon={editingOption ? <CheckIcon /> : <AddIcon />}
                  colorScheme="teal"
                  onClick={() => handleAddOrUpdateOption(false)}
                  isDisabled={!selectedCategory || !!optionNameError || !!codeError}
                  isLoading={isLoading}
                >
                  {editingOption ? 'Update Option' : 'Add Option'}
                </Button>
                {!editingOption && (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => handleAddOrUpdateOption(true)}
                    isDisabled={!selectedCategory || !!optionNameError || !!codeError}
                    isLoading={isLoading}
                  >
                    Save & Add Another
                  </Button>
                )}
                {(optionName || code || editingOption) && (
                  <Button
                    leftIcon={<CloseIcon />}
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => {
                      setEditingOption(null);
                      setOptionName('');
                      setCode('');
                      toast({
                        title: 'Form Cleared',
                        description: 'Input fields have been reset.',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Clear
                  </Button>
                )}
              </HStack>
            </VStack>
          ) : (
            <HStack alignItems="center" spacing={4} flexDir={{ base: 'column', md: 'row' }} align="flex-start">
              <FormControl isInvalid={!!categoryError}>
                <FormLabel fontSize="sm">New Category Name</FormLabel>
                <Input
                  placeholder="e.g. Payment Methods"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  size="lg"
                  bg="gray.50"
                  autoFocus
                  aria-describedby="category-hint"
                />
                <Text id="category-hint" fontSize="xs" color="gray.500" mt={1}>
                  A unique name for your category (e.g., Payment Methods).
                </Text>
                <FormErrorMessage>{categoryError}</FormErrorMessage>
              </FormControl>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                onClick={handleAddCategory}
                isDisabled={!!categoryError || !newCategory}
                isLoading={isLoading}
              >
                Add
              </Button>
            </HStack>
          )}
        </VStack>

        {/* Options List */}
        {selectedCategory && (
          <>
            <Divider my={4} />
            <Text fontSize="md" fontWeight="semibold" mb={4} color="gray.600">
              Options
            </Text>
            <List spacing={3} aria-live="polite">
              {masterData
                .find(c => c.category === selectedCategory)
                ?.options.map((opt, i) => (
                  <ListItem
                    key={i}
                    bg="white"
                    p={4}
                    borderRadius="lg"
                    boxShadow="md"
                    animation={`${fadeIn} 0.3s ease-in`}
                    _hover={{ bg: 'teal.50', transform: 'scale(1.02)', transition: 'all 0.2s' }}
                  >
                    {inlineEdit?.category === selectedCategory && inlineEdit?.code === opt.code ? (
                      <HStack spacing={3} flexDir={{ base: 'column', md: 'row' }} align="flex-start">
                        <FormControl isInvalid={!!inlineOptionNameError}>
                          <Input
                            value={inlineOptionName}
                            onChange={e => setInlineOptionName(e.target.value)}
                            onKeyPress={e => handleInlineKeyPress(e, selectedCategory, opt.code)}
                            size="lg"
                            placeholder={getPlaceholder(selectedCategory).name}
                            ref={optionNameRef}
                            aria-describedby="inline-option-name-hint"
                          />
                          <Text id="inline-option-name-hint" fontSize="xs" color="gray.500" mt={1}>
                            This is what users will see.
                          </Text>
                          <FormErrorMessage>{inlineOptionNameError}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!inlineCodeError}>
                          <Input
                            value={inlineCode}
                            onChange={e => setInlineCode(e.target.value)}
                            onKeyPress={e => handleInlineKeyPress(e, selectedCategory, opt.code)}
                            size="lg"
                            placeholder={getPlaceholder(selectedCategory).code}
                            aria-describedby="inline-code-hint"
                          />
                          <Text id="inline-code-hint" fontSize="xs" color="gray.500" mt={1}>
                            A unique system identifier.
                          </Text>
                          <FormErrorMessage>{inlineCodeError}</FormErrorMessage>
                        </FormControl>
                        <HStack>
                          <Tooltip label="Save changes">
                            <IconButton
                              aria-label="Save edit"
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="teal"
                              onClick={() => handleInlineEditSave(selectedCategory, opt.code)}
                              isDisabled={!!inlineOptionNameError || !!inlineCodeError}
                              isLoading={isLoading}
                            />
                          </Tooltip>
                          <Tooltip label="Cancel edit">
                            <IconButton
                              aria-label="Cancel edit"
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="gray"
                              onClick={handleInlineEditCancel}
                            />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    ) : (
                      <HStack justifyContent="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" color="gray.800">{opt.optionName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Code: {opt.code}
                          </Text>
                        </VStack>
                        <HStack>
                          <Tooltip label="Edit option">
                            <IconButton
                              aria-label={`Edit ${opt.optionName}`}
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleInlineEdit(selectedCategory, opt)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete option">
                            <IconButton
                              aria-label={`Delete ${opt.optionName}`}
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(selectedCategory, opt)}
                              isLoading={isLoading}
                            />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    )}
                  </ListItem>
                )) || (
                <Text color="gray.600" fontStyle="italic">
                  No options yet. Add one above!
                </Text>
              )}
            </List>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default MasterDataForm;
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  Flex,
  Tooltip,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Circle,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiLayers,
  FiPlus,
  FiCheckCircle,
} from 'react-icons/fi';
import { observer } from 'mobx-react-lite';
import stores from '../../../store/stores';

const LabWorkStatusManager = observer(() => {
  const { labWorkStatusStore } = stores;

  // Dark mode color tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const tabBg = useColorModeValue("gray.100", "gray.700");
  const tabActiveBg = useColorModeValue("white", "gray.600");
  const borderSubtle = useColorModeValue("gray.200", "gray.700");
  const borderLight = useColorModeValue("gray.100", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "gray.100");
  const textSecondary = useColorModeValue("gray.700", "gray.200");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const textFaint = useColorModeValue("gray.500", "gray.400");
  const drawerBg = useColorModeValue("white", "gray.800");

  const [status, setStatus] = useState('');
  const [type, setType] = useState<'in-house' | 'outside'>('outside');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  // Bottom Sheet Drawer for Mobile Add / Edit
  const {
    isOpen: isSheetOpen,
    onOpen: onSheetOpen,
    onClose: onSheetClose,
  } = useDisclosure();

  useEffect(() => {
    labWorkStatusStore.getLabWorkStatuses();
  }, []);

  const handleSubmit = async () => {
    if (!status.trim()) {
      toast({ title: 'Status is required', status: 'warning', duration: 2000 });
      return;
    }

    let res;
    if (editingId) {
      res = await labWorkStatusStore.updateLabWorkStatus(editingId, { status: status.trim(), type });
    } else {
      res = await labWorkStatusStore.createLabWorkStatus({ status: status.trim(), type });
    }

    if (res.status === 'success') {
      toast({ title: editingId ? 'Status updated' : 'Status created', status: 'success', duration: 2000 });
      setStatus('');
      setEditingId(null);
      onSheetClose();
      labWorkStatusStore.getLabWorkStatuses();
    } else {
      toast({ title: 'Action failed', description: res.message, status: 'error', duration: 3000 });
    }
  };

  const handleEdit = (item: any) => {
    setStatus(item.status);
    setType(item.type);
    setEditingId(item._id);
    onSheetOpen();
  };

  const handleOpenAdd = () => {
    setStatus('');
    setEditingId(null);
    onSheetOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this status?')) {
      const res = await labWorkStatusStore.deleteLabWorkStatus(id);
      if (res.status === 'success') {
        toast({ title: 'Deleted', status: 'info', duration: 2000 });
        labWorkStatusStore.getLabWorkStatuses();
      }
    }
  };

  const outsideCount = labWorkStatusStore.statuses.filter((s) => s.type === 'outside').length;
  const inHouseCount = labWorkStatusStore.statuses.filter((s) => s.type === 'in-house').length;

  const filteredStatuses = labWorkStatusStore.statuses.filter(
    (s) =>
      s.type === type &&
      (searchQuery.trim() === '' || s.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box w="full">
      {/* ============================================================== */}
      {/* MOBILE VIEW: DEDICATED NATIVE APP PERSPECTIVE (< 768px via CSS)*/}
      {/* ============================================================== */}
      <Box display={{ base: "block", md: "none" }} pb={10}>
        <VStack spacing={3} align="stretch">
          {/* 1. Sleek Gradient Hero Card */}
          <Box
            p={4}
            borderRadius="22px"
            bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
            color="white"
            boxShadow="0 8px 20px -4px rgba(12, 74, 110, 0.35)"
            position="relative"
            overflow="hidden"
          >
            <Circle position="absolute" size="120px" bg="whiteAlpha.100" right="-25px" bottom="-35px" />
            <Circle position="absolute" size="70px" bg="teal.300" opacity="0.15" left="-20px" top="-20px" />

            <Flex justify="space-between" align="center" position="relative" zIndex={1}>
              <HStack spacing={3}>
                <Flex
                  w="42px"
                  h="42px"
                  borderRadius="14px"
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={FiLayers} boxSize={5} color="white" />
                </Flex>
                <Box>
                  <Text fontSize="9px" fontWeight="800" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.8px">
                    WORKFLOW PIPELINE
                  </Text>
                  <Heading fontSize="17px" fontWeight="900" letterSpacing="-0.3px" color="white" lineHeight="1.2">
                    Lab Work Statuses
                  </Heading>
                  <Text color="whiteAlpha.900" fontSize="11px" fontWeight="500" mt={0.5}>
                    {type === 'outside' ? `${outsideCount} outside stages` : `${inHouseCount} in-house stages`}
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </Box>

          {/* 2. Modern Segmented Tab Switcher (iOS / Native APK Style) */}
          <Box
            p="3.5px"
            bg={tabBg}
            borderRadius="16px"
            border="1px solid"
            borderColor={borderSubtle}
          >
            <SimpleGrid columns={2} spacing={1}>
              <Button
                size="sm"
                h="36px"
                borderRadius="13px"
                fontWeight="800"
                fontSize="12px"
                bg={type === 'outside' ? tabActiveBg : "transparent"}
                color={type === 'outside' ? textPrimary : textMuted}
                boxShadow={type === 'outside' ? "0 2px 8px rgba(0,0,0,0.08)" : "none"}
                _hover={{ bg: type === 'outside' ? tabActiveBg : tabBg }}
                _active={{ transform: "scale(0.98)" }}
                onClick={() => {
                  setType('outside');
                  setStatus('');
                  setEditingId(null);
                }}
              >
                <HStack spacing={1.5}>
                  <Text>Outside Lab</Text>
                  <Badge
                    bg={type === 'outside' ? "teal.900" : "whiteAlpha.200"}
                    color={type === 'outside' ? "teal.200" : textMuted}
                    border="1px solid"
                    borderColor={type === 'outside' ? "teal.700" : "transparent"}
                    borderRadius="full"
                    px={1.5}
                    py={0.2}
                    fontSize="10px"
                    fontWeight="800"
                    sx={{
                      _light: {
                        bg: type === 'outside' ? "teal.50" : "gray.200",
                        color: type === 'outside' ? "teal.700" : "gray.600",
                        borderColor: type === 'outside' ? "teal.200" : "transparent",
                      }
                    }}
                  >
                    {outsideCount}
                  </Badge>
                </HStack>
              </Button>

              <Button
                size="sm"
                h="36px"
                borderRadius="13px"
                fontWeight="800"
                fontSize="12px"
                bg={type === 'in-house' ? tabActiveBg : "transparent"}
                color={type === 'in-house' ? textPrimary : textMuted}
                boxShadow={type === 'in-house' ? "0 2px 8px rgba(0,0,0,0.08)" : "none"}
                _hover={{ bg: type === 'in-house' ? tabActiveBg : tabBg }}
                _active={{ transform: "scale(0.98)" }}
                onClick={() => {
                  setType('in-house');
                  setStatus('');
                  setEditingId(null);
                }}
              >
                <HStack spacing={1.5}>
                  <Text>In-House Lab</Text>
                  <Badge
                    bg={type === 'in-house' ? "purple.900" : "whiteAlpha.200"}
                    color={type === 'in-house' ? "purple.200" : textMuted}
                    border="1px solid"
                    borderColor={type === 'in-house' ? "purple.700" : "transparent"}
                    borderRadius="full"
                    px={1.5}
                    py={0.2}
                    fontSize="10px"
                    fontWeight="800"
                    sx={{
                      _light: {
                        bg: type === 'in-house' ? "purple.50" : "gray.200",
                        color: type === 'in-house' ? "purple.700" : "gray.600",
                        borderColor: type === 'in-house' ? "purple.200" : "transparent",
                      }
                    }}
                  >
                    {inHouseCount}
                  </Badge>
                </HStack>
              </Button>
            </SimpleGrid>
          </Box>

          {/* 3. Search & Quick Action Toolbar */}
          <Flex gap={2} align="center">
            <InputGroup size="sm" flex={1}>
              <InputLeftElement pointerEvents="none" h="40px">
                <FiSearch color="#94A3B8" />
              </InputLeftElement>
              <Input
                placeholder="Search statuses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={inputBg}
                color={textPrimary}
                focusBorderColor="teal.500"
                borderRadius="16px"
                border="1px solid"
                borderColor={borderSubtle}
                h="40px"
                fontSize="13px"
                boxShadow="0 2px 6px rgba(0,0,0,0.02)"
              />
              {searchQuery && (
                <InputRightElement h="40px">
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

            <Button
              size="sm"
              h="40px"
              bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
              _active={{ transform: "scale(0.96)" }}
              leftIcon={<FiPlus fontSize="16px" />}
              borderRadius="16px"
              fontWeight="800"
              fontSize="12px"
              px={3.5}
              boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
              onClick={handleOpenAdd}
              flexShrink={0}
            >
              Add
            </Button>
          </Flex>

          {/* 4. Native Status Cards List */}
          {filteredStatuses.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={cardBg}
              borderRadius="20px"
              border="1px dashed"
              borderColor={borderSubtle}
              textAlign="center"
            >
              <Icon as={FiLayers} boxSize="40px" color="gray.400" mb={2} />
              <Text fontSize="15px" fontWeight="800" color={textPrimary}>
                No statuses found
              </Text>
              <Text fontSize="12px" color={textFaint} mt={1} mb={3}>
                {searchQuery
                  ? `No results matching "${searchQuery}"`
                  : `Add your first ${type === 'outside' ? 'outside' : 'in-house'} lab status.`}
              </Text>
              <Button
                size="sm"
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                borderRadius="xl"
                onClick={handleOpenAdd}
              >
                + Add Status
              </Button>
            </Flex>
          ) : (
            <VStack spacing={2.5} align="stretch">
              {filteredStatuses.map((item) => (
                <Box
                  key={item._id}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderLight}
                  borderRadius="18px"
                  p={3.5}
                  boxShadow="0 3px 12px -4px rgba(15, 23, 42, 0.06)"
                  transition="all 0.15s ease-out"
                  _active={{ bg: subtleBg }}
                >
                  <Flex justify="space-between" align="center" gap={3}>
                    <HStack spacing={3} flex={1} minW={0}>
                      {/* Leading Type Indicator Icon */}
                      <Flex
                        w="34px"
                        h="34px"
                        borderRadius="11px"
                        bg={item.type === 'in-house' ? "purple.900" : "teal.900"}
                        color={item.type === 'in-house' ? "purple.200" : "teal.200"}
                        border="1px solid"
                        borderColor={item.type === 'in-house' ? "purple.700" : "teal.700"}
                        align="center"
                        justify="center"
                        flexShrink={0}
                        sx={{
                          _light: {
                            bg: item.type === 'in-house' ? "purple.50" : "teal.50",
                            color: item.type === 'in-house' ? "purple.600" : "teal.600",
                            borderColor: item.type === 'in-house' ? "purple.100" : "teal.100",
                          }
                        }}
                      >
                        <Icon as={FiCheckCircle} boxSize={4} />
                      </Flex>

                      <Box minW={0} flex={1}>
                        <Text
                          fontSize="14px"
                          fontWeight="800"
                          color={textPrimary}
                          noOfLines={2}
                          lineHeight="1.3"
                          letterSpacing="-0.2px"
                        >
                          {item.status}
                        </Text>
                        <Badge
                          mt={1}
                          bg={item.type === 'in-house' ? "purple.900" : "teal.900"}
                          color={item.type === 'in-house' ? "purple.200" : "teal.200"}
                          border="1px solid"
                          borderColor={item.type === 'in-house' ? "purple.700" : "teal.700"}
                          borderRadius="full"
                          px={2}
                          py={0.2}
                          fontSize="9px"
                          fontWeight="800"
                          textTransform="uppercase"
                          sx={{
                            _light: {
                              bg: item.type === 'in-house' ? "purple.50" : "teal.50",
                              color: item.type === 'in-house' ? "purple.700" : "teal.700",
                              borderColor: item.type === 'in-house' ? "purple.200" : "teal.200",
                            }
                          }}
                        >
                          {item.type}
                        </Badge>
                      </Box>
                    </HStack>

                    {/* Action Icon Buttons */}
                    <HStack spacing={1.5} flexShrink={0}>
                      <IconButton
                        aria-label="Edit status"
                        icon={<FiEdit2 size={13} />}
                        size="sm"
                        w="32px"
                        h="32px"
                        variant="ghost"
                        colorScheme="teal"
                        borderRadius="full"
                        onClick={() => handleEdit(item)}
                      />
                      <IconButton
                        aria-label="Delete status"
                        icon={<FiTrash2 size={13} />}
                        size="sm"
                        w="32px"
                        h="32px"
                        variant="ghost"
                        colorScheme="red"
                        borderRadius="full"
                        onClick={() => handleDelete(item._id)}
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>

        {/* 5. Mobile Bottom Sheet Drawer for Add / Edit */}
        <Drawer
          isOpen={isSheetOpen}
          onClose={() => {
            onSheetClose();
            setStatus('');
            setEditingId(null);
          }}
          placement="bottom"
        >
          <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
          <DrawerContent
            borderTopRadius={0}
            borderRadius={0}
            maxH="75vh"
            bg={drawerBg}
            color={textPrimary}
            overflow="hidden"
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
                borderRadius: "0 !important",
                borderTopLeftRadius: "0 !important",
                borderTopRightRadius: "0 !important",
                borderTopRadius: "0 !important",
                animation: "modalSlideUpMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards !important",
              },
            }}
          >
            <DrawerCloseButton color="white" zIndex={3} mt={1} />
            <DrawerHeader
              bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
              color="white"
              borderRadius={0}
              borderTopRadius={0}
              py={3.5}
              px={4}
              sx={{
                borderRadius: "0 !important",
                borderTopLeftRadius: "0 !important",
                borderTopRightRadius: "0 !important",
                borderTopRadius: "0 !important",
              }}
            >
              <Text fontSize="16px" fontWeight="800">
                {editingId ? "Edit Status" : "Add New Status"}
              </Text>
              <Text fontSize="11px" color="whiteAlpha.800" fontWeight="500" mt={0.5}>
                Category: {type === 'outside' ? 'Outside Lab' : 'In-House Lab'}
              </Text>
            </DrawerHeader>

            <DrawerBody p={4} overflowY="auto">
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="12px" fontWeight="700" color={textSecondary} textTransform="uppercase">
                    Status Name
                  </FormLabel>
                  <Input
                    placeholder="e.g. Sent to Lab, Processing, Delivered"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    bg={inputBg}
                    color={textPrimary}
                    focusBorderColor="teal.500"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderSubtle}
                    fontSize="14px"
                    h="44px"
                    autoFocus
                  />
                </FormControl>
              </VStack>
            </DrawerBody>

            <DrawerFooter bg={subtleBg} py={3} px={4} borderTop="1px solid" borderColor={borderLight}>
              <HStack spacing={2} w="full">
                <Button
                  size="md"
                  variant="ghost"
                  flex={1}
                  borderRadius="xl"
                  onClick={() => {
                    onSheetClose();
                    setStatus('');
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                  color="white"
                  _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                  _active={{ transform: "scale(0.98)" }}
                  flex={1.5}
                  borderRadius="xl"
                  fontWeight="800"
                  isLoading={labWorkStatusStore.loading}
                  onClick={handleSubmit}
                  boxShadow="0 2px 8px rgba(13, 148, 136, 0.25)"
                >
                  {editingId ? "Update" : "Save Status"}
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Box>

      {/* ============================================================== */}
      {/* DESKTOP VIEW: ORIGINAL TABLE (>= 768px via CSS)                */}
      {/* ============================================================== */}
      <Box display={{ base: "none", md: "block" }}>
        <VStack spacing={6} align="stretch" h="full">
          <HStack justify="space-between">
            <Heading size="lg" color={stores.themeStore.themeConfig.colors.custom.light.primary}>
              Lab Work Status Master
            </Heading>
          </HStack>

          {/* Desktop Tabs */}
          <HStack spacing={2} p={1} bg={tabBg} borderRadius="xl" w="fit-content">
            <Button
              size="sm"
              borderRadius="lg"
              px={8}
              bg={type === 'outside' ? "blue.500" : "transparent"}
              color={type === 'outside' ? "white" : textMuted}
              onClick={() => { setType('outside'); setEditingId(null); setStatus(''); }}
            >
              Outside Lab ({outsideCount})
            </Button>
            <Button
              size="sm"
              borderRadius="lg"
              px={8}
              bg={type === 'in-house' ? "blue.500" : "transparent"}
              color={type === 'in-house' ? "white" : textMuted}
              onClick={() => { setType('in-house'); setEditingId(null); setStatus(''); }}
            >
              In-House Lab ({inHouseCount})
            </Button>
          </HStack>

          {/* Desktop Form Card */}
          <Card variant="outline" bg={cardBg} borderColor={borderLight} shadow="sm">
            <CardBody>
              <SimpleGrid columns={2} spacing={6}>
                <Box>
                  <FormLabel fontWeight="bold" color={textSecondary}>Search Statuses</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="#94A3B8" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search statuses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={inputBg}
                      color={textPrimary}
                      borderColor={borderSubtle}
                      focusBorderColor="blue.400"
                      borderRadius="xl"
                      shadow="sm"
                    />
                  </InputGroup>
                </Box>
                <Box>
                  <FormLabel fontWeight="bold" color={textSecondary}>
                    {editingId ? "Edit" : "Add New"} {type === 'outside' ? 'Outside' : 'In-House'} Status
                  </FormLabel>
                  <HStack w="full">
                    <Input
                      placeholder="e.g. Sent to Lab, Processing, etc."
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      bg={inputBg}
                      color={textPrimary}
                      borderColor={borderSubtle}
                      focusBorderColor="blue.400"
                      borderRadius="xl"
                      shadow="sm"
                    />
                    <Button
                      bgGradient="linear(to-r, blue.500, blue.600)"
                      color="white"
                      _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", transform: "translateY(-1px)", boxShadow: "md" }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.2s"
                      onClick={handleSubmit}
                      isLoading={labWorkStatusStore.loading}
                      leftIcon={editingId ? <EditIcon /> : <AddIcon />}
                      px={6}
                      borderRadius="xl"
                      fontWeight="bold"
                      shadow="sm"
                    >
                      {editingId ? 'Update' : 'Add Status'}
                    </Button>
                    {editingId && (
                      <Button variant="ghost" onClick={() => { setEditingId(null); setStatus(''); }} borderRadius="xl">
                        Cancel
                      </Button>
                    )}
                  </HStack>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Desktop List Table */}
          <Box overflowY="auto" flex={1} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderLight}>
            <Table variant="simple">
              <Thead bg={subtleBg}>
                <Tr>
                  <Th color={textFaint}>Status Name</Th>
                  <Th color={textFaint}>Category</Th>
                  <Th textAlign="right" color={textFaint}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredStatuses.map((item) => (
                  <Tr key={item._id} _hover={{ bg: subtleBg }} transition="all 0.2s">
                    <Td fontWeight="semibold" color={textPrimary}>{item.status}</Td>
                    <Td>
                      <Badge colorScheme={item.type === 'in-house' ? 'purple' : 'orange'} variant="subtle" px={3} py={1} borderRadius="full">
                        {item.type}
                      </Badge>
                    </Td>
                    <Td textAlign="right">
                      <HStack justify="flex-end" spacing={2}>
                        <Tooltip label="Edit">
                          <IconButton
                            aria-label="Edit"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(item)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(item._id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {filteredStatuses.length === 0 && (
                  <Tr>
                    <Td colSpan={3} textAlign="center" py={20}>
                      <VStack spacing={2}>
                        <Text color="gray.400" fontStyle="italic">No statuses defined for {type} work.</Text>
                        <Text fontSize="sm" color="gray.300">Add one using the form above.</Text>
                      </VStack>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
});

export default LabWorkStatusManager;
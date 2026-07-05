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
  Select,
  Divider,
  Heading,
  Card,
  CardBody,
  SimpleGrid,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';
import { InputGroup, InputLeftElement } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import stores from '../../../store/stores';

const LabWorkStatusManager = observer(() => {
  const { labWorkStatusStore } = stores;
  const [status, setStatus] = useState('');
  const [type, setType] = useState<'in-house' | 'outside'>('outside');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

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
      res = await labWorkStatusStore.updateLabWorkStatus(editingId, { status, type });
    } else {
      res = await labWorkStatusStore.createLabWorkStatus({ status, type });
    }

    if (res.status === 'success') {
      toast({ title: editingId ? 'Status updated' : 'Status created', status: 'success', duration: 2000 });
      setStatus('');
      setEditingId(null);
      labWorkStatusStore.getLabWorkStatuses();
    } else {
      toast({ title: 'Action failed', description: res.message, status: 'error', duration: 3000 });
    }
  };

  const handleEdit = (item: any) => {
    setStatus(item.status);
    setType(item.type);
    setEditingId(item._id);
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

  const filteredStatuses = labWorkStatusStore.statuses.filter(s => 
    s.type === type && (searchQuery.trim() === '' || s.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <VStack spacing={6} align="stretch" h="full">
      <HStack justify="space-between">
        <Heading size="lg" color={stores.themeStore.themeConfig.colors.custom.light.primary}>Lab Work Status Master</Heading>
      </HStack>

      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        onChange={(index) => setType(index === 0 ? 'outside' : 'in-house')}
        index={type === 'outside' ? 0 : 1}
      >
        <TabList bg="gray.50" p={1} borderRadius="xl" w="fit-content">
          <Tab borderRadius="lg" px={8}>Outside Lab</Tab>
          <Tab borderRadius="lg" px={8}>In-House Lab</Tab>
        </TabList>
      </Tabs>

      {/* Form Card */}
      <Card variant="outline" borderColor="blue.100" shadow="sm">
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <FormLabel fontWeight="bold" color="gray.700">Search Statuses</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search statuses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="white"
                  focusBorderColor="blue.400"
                  borderRadius="xl"
                  shadow="sm"
                />
              </InputGroup>
            </Box>
            <Box>
              <FormLabel fontWeight="bold" color="gray.700">Add New {type === 'outside' ? 'Outside' : 'In-House'} Status</FormLabel>
              <HStack w="full">
                <Input
                  placeholder="e.g. Sent to Lab, Processing, etc."
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  <Button variant="ghost" onClick={() => { setEditingId(null); setStatus(''); }} borderRadius="xl">Cancel</Button>
                )}
              </HStack>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* List Table */}
      <Box overflowY="auto" flex={1} borderRadius="xl" border="1px solid" borderColor="gray.100">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Status Name</Th>
              <Th>Category</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredStatuses.map((item) => (
              <Tr key={item._id} _hover={{ bg: "blue.50" }} transition="all 0.2s">
                <Td fontWeight="semibold" color="gray.700">{item.status}</Td>
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
  );
});

export default LabWorkStatusManager;

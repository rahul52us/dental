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
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import stores from '../../../store/stores';
import CustomDrawer from '../../../component/common/Drawer/CustomDrawer';

const LabWorkStatusDrawer = observer(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { labWorkStatusStore } = stores;
  const [status, setStatus] = useState('');
  const [type, setType] = useState<'in-house' | 'outside'>('outside');
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      labWorkStatusStore.getLabWorkStatuses();
    }
  }, [open]);

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

  return (
    <CustomDrawer open={open} close={onClose} title="Lab Work Status Master" width="500px">
      <VStack spacing={6} align="stretch" p={4}>
        <Box p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" bg="gray.50">
          <VStack spacing={4}>
            <FormControl>
              <FormLabel fontWeight="bold">Lab Work Type</FormLabel>
              <Select value={type} onChange={(e: any) => setType(e.target.value)} bg="white">
                <option value="outside">Outside</option>
                <option value="in-house">In-house</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="bold">Status Name</FormLabel>
              <Input
                placeholder="e.g. Sent to Lab, Fabricating, etc."
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                bg="white"
              />
            </FormControl>
            <Button
              colorScheme="blue"
              w="full"
              leftIcon={editingId ? <EditIcon /> : <AddIcon />}
              onClick={handleSubmit}
              isLoading={labWorkStatusStore.loading}
            >
              {editingId ? 'Update Status' : 'Add Status'}
            </Button>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setStatus(''); }}>
                Cancel Edit
              </Button>
            )}
          </VStack>
        </Box>

        <Divider />

        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Status</Th>
                <Th>Type</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {labWorkStatusStore.statuses.map((item) => (
                <Tr key={item._id}>
                  <Td fontWeight="medium">{item.status}</Td>
                  <Td>
                    <Badge colorScheme={item.type === 'in-house' ? 'purple' : 'orange'} variant="subtle">
                      {item.type}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end" spacing={1}>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(item._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {labWorkStatusStore.statuses.length === 0 && (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={4} color="gray.500">
                    No statuses found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </CustomDrawer>
  );
});

export default LabWorkStatusDrawer;

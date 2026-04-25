'use client';
import React, { useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FiChevronRight, FiFolder, FiFileText, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { observer } from 'mobx-react-lite';
import stores from '../../../store/stores';

interface HierarchySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string[], names: string[]) => void;
}

const HierarchySelectorModal = observer(({ isOpen, onClose, onSelect }: HierarchySelectorModalProps) => {
  const { labWorkHierarchyStore } = stores;
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);

  const currentItems = useMemo(() => {
    return labWorkHierarchyStore.hierarchies.filter((h) => {
      const itemParentId = h.parent ? (typeof h.parent === 'object' ? (h.parent as any)._id : h.parent) : null;
      return (itemParentId || null) === (currentParentId || null);
    });
  }, [labWorkHierarchyStore.hierarchies, currentParentId]);

  const navigateTo = (item: any) => {
    setCurrentParentId(item._id);
    setBreadcrumb([...breadcrumb, item]);
  };

  const goToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentParentId(null);
      setBreadcrumb([]);
    } else {
      const newBreadcrumb = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newBreadcrumb);
      setCurrentParentId(newBreadcrumb[newBreadcrumb.length - 1]._id);
    }
  };

  const handleFinalSelect = (item: any) => {
    const finalIds = [...breadcrumb.map(b => b._id), item._id];
    const finalNames = [...breadcrumb.map(b => b.name), item.name];
    onSelect(finalIds, finalNames);
    onClose();
    // Reset for next time
    setCurrentParentId(null);
    setBreadcrumb([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
          <Text fontSize="lg" fontWeight="bold">Select Lab Work Classification</Text>
          <HStack mt={2} spacing={2}>
            {breadcrumb.length > 0 && (
              <IconButton
                icon={<FiArrowLeft />}
                aria-label="Back"
                size="sm"
                variant="ghost"
                onClick={() => goToBreadcrumb(breadcrumb.length - 2)}
              />
            )}
            <Breadcrumb separator={<FiChevronRight color="gray.400" />}>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => goToBreadcrumb(-1)} color="blue.500">Root</BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumb.map((b, i) => (
                <BreadcrumbItem key={b._id}>
                  <BreadcrumbLink onClick={() => goToBreadcrumb(i)} color="blue.500">{b.name}</BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0} maxH="60vh" overflowY="auto">
          <VStack align="stretch" spacing={0}>
            {currentItems.length === 0 ? (
              <Box p={10} textAlign="center">
                <Text color="gray.500">No sub-items found.</Text>
                <Button mt={4} colorScheme="blue" size="sm" onClick={() => handleFinalSelect(breadcrumb[breadcrumb.length-1])}>
                  Select "{breadcrumb[breadcrumb.length-1]?.name}" as Final
                </Button>
              </Box>
            ) : (
              currentItems.map((item) => (
                <HStack
                  key={item._id}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.50"
                  _hover={{ bg: 'blue.50' }}
                  cursor="pointer"
                  onClick={() => navigateTo(item)}
                  justify="space-between"
                >
                  <HStack spacing={3}>
                    <Icon as={FiFolder} color="blue.400" />
                    <Text fontWeight="medium">{item.name}</Text>
                  </HStack>
                  <HStack>
                    <Button 
                        size="xs" 
                        colorScheme="green" 
                        variant="ghost" 
                        leftIcon={<FiCheck />}
                        onClick={(e) => { e.stopPropagation(); handleFinalSelect(item); }}
                    >
                      Select
                    </Button>
                    <FiChevronRight color="gray.300" />
                  </HStack>
                </HStack>
              ))
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default HierarchySelectorModal;

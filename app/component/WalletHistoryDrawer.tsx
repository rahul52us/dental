import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Icon,
  Text,
  Box,
  Spinner,
  Badge,
  Center,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from "@chakra-ui/react";
import { FiCreditCard, FiArrowDownLeft, FiArrowUpRight, FiAlertCircle, FiUser, FiPlus } from "react-icons/fi";
import stores from "../store/stores";

interface WalletHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any; // Using any for simplicity as it matches the selectedWalletPatient type
}

const WalletHistoryDrawer: React.FC<WalletHistoryDrawerProps> = ({ isOpen, onClose, patient }) => {
  const [walletHistoryData, setWalletHistoryData] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWalletHistoryLoading, setIsWalletHistoryLoading] = useState(false);

  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditValue, setCreditValue] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [isAddingCredit, setIsAddingCredit] = useState(false);

  const toast = useToast();

  const handleAddCredit = async () => {
    const credits = Number(creditAmount);
    const value = Number(creditValue);
    
    if (!credits || credits <= 0 || !value || value <= 0) {
      toast({ title: "Validation Error", description: "Please enter valid credits and value.", status: "error", duration: 3000 });
      return;
    }

    const totalAmount = credits * value;
    
    setIsAddingCredit(true);
    try {
      await stores.workDoneStore.addManualWalletCredit({
        patientId: patient._id,
        amount: totalAmount,
        description: creditDescription || `Added ${credits} credits @ ₹${value} each`
      });
      toast({ title: "Credit Added", description: `Successfully added ₹${totalAmount} to wallet.`, status: "success", duration: 3000 });
      setIsCreditModalOpen(false);
      setCreditAmount("");
      setCreditValue("");
      setCreditDescription("");
      fetchWalletHistory(patient._id); // Refresh data
    } catch (err: any) {
      toast({ title: "Error adding credit", description: err?.message || "Failed to add credit", status: "error", duration: 3000 });
    } finally {
      setIsAddingCredit(false);
    }
  };

  useEffect(() => {
    if (isOpen && patient?._id) {
      fetchWalletHistory(patient._id);
    }
  }, [isOpen, patient]);

  const fetchWalletHistory = async (patientId: string) => {
    setIsWalletHistoryLoading(true);
    try {
      const res = await stores.workDoneStore.getPatientWalletHistory(patientId);
      setWalletHistoryData(res.history || []);
      setWalletBalance(res.walletBalance || 0);
    } catch (err: any) {
      toast({
        title: "Error fetching wallet history",
        description: err?.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsWalletHistoryLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
        <DrawerContent borderLeftRadius="3xl" bg="gray.50" shadow="2xl">
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.100" bg="white" py={6} px={8}>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={4}>
                <VStack align="start" spacing={0}>
                  <HStack>
                    <Icon as={FiCreditCard} color="purple.500" boxSize={6} />
                    <Text fontWeight="900" fontSize="2xl" color="gray.800">Wallet History</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500" fontWeight="bold" pl={8}>
                    {patient?.name || "Patient"}
                  </Text>
                </VStack>
                
                <HStack spacing={4}>
                  <Box bg="purple.50" px={5} py={3} borderRadius="2xl" border="1px dashed" borderColor="purple.200" shadow="sm">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="800" color="purple.600" textTransform="uppercase" letterSpacing="wider">Current Balance</Text>
                      <Text fontSize="2xl" fontWeight="900" color="purple.800">₹{walletBalance.toLocaleString()}</Text>
                    </VStack>
                  </Box>
                  <Button 
                    leftIcon={<FiPlus />} 
                    colorScheme="purple" 
                    variant="solid" 
                    borderRadius="xl" 
                    onClick={() => setIsCreditModalOpen(true)}
                    shadow="sm"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  >
                    Add Credit
                  </Button>
                </HStack>
              </VStack>
              <DrawerCloseButton position="relative" top={0} right={0} bg="gray.100" color="gray.600" borderRadius="full" size="md" _hover={{ bg: "red.100", color: "red.500", transform: "scale(1.1)" }} transition="all 0.2s" />
            </HStack>
          </DrawerHeader>
          <DrawerBody p={6} bg="gray.50">
            {isWalletHistoryLoading ? (
              <VStack py={20} spacing={4}>
                <Spinner size="xl" color="purple.500" thickness="4px" />
                <Text color="gray.500" fontWeight="bold">Loading wallet history...</Text>
              </VStack>
            ) : walletHistoryData.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {walletHistoryData.map((txn: any) => (
                  <Box key={txn._id} p={5} bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" _hover={{ shadow: "md", transform: "translateY(-2px)", borderColor: "purple.200" }} transition="all 0.2s">
                    <HStack justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Center w="48px" h="48px" borderRadius="xl" bg={txn.type === "Deposit" ? "green.50" : "orange.50"} color={txn.type === "Deposit" ? "green.500" : "orange.500"}>
                          <Icon as={txn.type === "Deposit" ? FiArrowDownLeft : FiArrowUpRight} boxSize={6} />
                        </Center>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="800" color="gray.800" fontSize="md">
                            {txn.type === "Deposit" ? "Added to Wallet" : "Deducted from Wallet"}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="gray.500" fontWeight="700">
                              {new Date(txn.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </Text>
                            <Badge colorScheme={txn.type === "Deposit" ? "green" : "orange"} variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                              {new Date(txn.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </Badge>
                          </HStack>
                          {txn.description && txn.description !== "Transaction" && (
                            <Text fontSize="xs" color="gray.400" fontWeight="600" noOfLines={1} maxW="200px">
                              {txn.description}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <Text fontWeight="900" fontSize="xl" letterSpacing="tight" color={txn.type === "Deposit" ? "green.600" : "orange.600"}>
                        {txn.type === "Deposit" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <VStack py={20} color="gray.400">
                <Icon as={FiAlertCircle} boxSize={12} mb={4} opacity={0.3} />
                <Text fontWeight="bold">No wallet transactions found.</Text>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="3xl" shadow="2xl" overflow="hidden" bg="white">
          <Box bgGradient="linear(to-br, purple.500, purple.700)" px={6} py={8} position="relative" overflow="hidden">
            <Box position="absolute" top="-20%" right="-10%" opacity={0.1}>
              <Icon as={FiPlus} boxSize="150px" color="white" transform="rotate(-15deg)" />
            </Box>
            <VStack align="start" spacing={2} position="relative" zIndex={10}>
              <Text fontSize="2xl" fontWeight="1000" color="white" letterSpacing="tight">Add Wallet Credit</Text>
              <Text fontSize="sm" color="purple.100" fontWeight="600">Manually add credits to {patient?.name}'s wallet.</Text>
            </VStack>
            <ModalCloseButton color="white" top={4} right={4} bg="whiteAlpha.200" borderRadius="full" _hover={{ bg: "whiteAlpha.300" }} />
          </Box>
          <ModalBody py={8} px={6}>
            <VStack spacing={6}>
              <HStack w="full" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="gray.600" mb={3}>CREDITS</FormLabel>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    h="60px"
                    borderRadius="xl"
                    fontWeight="900"
                    fontSize="xl"
                    color="gray.800"
                    bg="gray.50"
                    borderWidth="2px"
                    borderColor="gray.200"
                    _focus={{ borderColor: "purple.500", bg: "white", shadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    placeholder="e.g. 5"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="gray.600" mb={3}>VALUE PER CREDIT</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" color="purple.500" h="full" px={4} fontSize="lg" fontWeight="900">₹</InputLeftElement>
                    <Input
                      type="number"
                      value={creditValue}
                      onChange={(e) => setCreditValue(e.target.value)}
                      h="60px"
                      pl={12}
                      borderRadius="xl"
                      fontWeight="900"
                      fontSize="xl"
                      color="gray.800"
                      bg="gray.50"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _focus={{ borderColor: "purple.500", bg: "white", shadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                      placeholder="e.g. 100"
                    />
                  </InputGroup>
                </FormControl>
              </HStack>

              <Box bg="purple.50" p={5} borderRadius="2xl" w="full" border="2px dashed" borderColor="purple.200" position="relative">
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="purple.600" fontWeight="800" textTransform="uppercase" letterSpacing="wider">Total Amount Added</Text>
                    <Text fontSize="2xl" color="purple.800" fontWeight="900">
                      ₹{(Number(creditAmount) * Number(creditValue) || 0).toLocaleString()}
                    </Text>
                  </VStack>
                  <Center w="48px" h="48px" bg="purple.100" borderRadius="xl" color="purple.600">
                    <Icon as={FiArrowDownLeft} boxSize={6} />
                  </Center>
                </HStack>
              </Box>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="900" color="gray.600" mb={3}>DESCRIPTION (OPTIONAL)</FormLabel>
                <Input
                  type="text"
                  value={creditDescription}
                  onChange={(e) => setCreditDescription(e.target.value)}
                  h="60px"
                  borderRadius="xl"
                  fontWeight="600"
                  fontSize="md"
                  color="gray.800"
                  bg="gray.50"
                  borderWidth="2px"
                  borderColor="gray.200"
                  _focus={{ borderColor: "purple.500", bg: "white", shadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  placeholder="e.g. Goodwill credit"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" py={6} px={6} borderTop="1px solid" borderColor="gray.100">
            <Button variant="ghost" mr={3} onClick={() => setIsCreditModalOpen(false)} borderRadius="xl" fontWeight="bold" size="lg">Cancel</Button>
            <Button colorScheme="purple" borderRadius="xl" px={10} py={6} fontSize="lg" fontWeight="bold" isLoading={isAddingCredit} onClick={handleAddCredit} shadow="xl" _hover={{ shadow: '2xl', transform: 'translateY(-2px)' }} transition="all 0.2s">Add Credit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default WalletHistoryDrawer;

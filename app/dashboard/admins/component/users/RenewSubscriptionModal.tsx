import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Box,
  Flex,
  Icon,
  Divider,
  HStack,
  Spinner,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { FiClock, FiCalendar, FiCheckCircle, FiShield, FiStar, FiEdit2, FiPlus } from "react-icons/fi";
import stores from "../../../../store/stores";
import { formatDateTime } from "../../../../component/config/utils/dateUtils";
import axios from "axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

const RenewSubscriptionModal = ({ isOpen, onClose, user, onSuccess }: Props) => {
  const {
    auth: { openNotification },
  } = stores;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);

  // States for updating history
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [isUpdatingHistory, setIsUpdatingHistory] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.company) return;
      setIsFetching(true);
      try {
        const { data } = await axios.get(`/company/subscription/${user.company}`);
        const comp = data.data;
        if (comp) {
          const start = comp.subscriptionStartDate
            ? new Date(comp.subscriptionStartDate).toISOString().split('T')[0]
            : "";
          const end = comp.subscriptionEndDate
            ? new Date(comp.subscriptionEndDate).toISOString().split('T')[0]
            : "";
          setStartDate(start);
          setEndDate(end);
          setSubscriptionHistory(comp.subscriptionHistory || []);
        }
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Error fetching data",
          message: err?.response?.data?.message || err.message,
        });
      } finally {
        setIsFetching(false);
      }
    };

    if (isOpen && user) {
      setAmount("");
      setDescription("");
      fetchCompanyData();
    }
  }, [isOpen, user]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      openNotification({
        type: "error",
        title: "Validation Error",
        message: "Please select both start and end dates.",
      });
      return;
    }

    if (!user?.company) {
       openNotification({
        type: "error",
        title: "Error",
        message: "This admin does not have a linked company to renew.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`/company/subscription/update`, {
        companyId: user.company,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        amount: amount ? Number(amount) : undefined,
        description: description || undefined
      });

      openNotification({
        type: "success",
        title: "Success",
        message: "Subscription updated successfully",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Update Failed",
        message: err?.response?.data?.message || err.message || "Failed to update subscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHistory = async (historyId: string) => {
    if (!user?.company || !historyId) return;
    setIsUpdatingHistory(true);
    try {
      await axios.put(`/company/subscription/history/update`, {
        companyId: user.company,
        historyId: historyId,
        amount: editAmount ? Number(editAmount) : undefined,
        description: editDescription || undefined
      });
      openNotification({
        type: "success",
        title: "Success",
        message: "History updated successfully",
      });
      setEditingHistoryId(null);
      // Refresh the data to reflect changes
      const { data } = await axios.get(`/company/subscription/${user.company}`);
      if (data?.data) {
        setSubscriptionHistory(data.data.subscriptionHistory || []);
      }
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Update Failed",
        message: err?.response?.data?.message || err.message || "Failed to update history",
      });
    } finally {
      setIsUpdatingHistory(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <DrawerContent bg="gray.50">
        <DrawerCloseButton top={8} right={6} color="white" _hover={{ bg: "whiteAlpha.200" }} zIndex={10} size="lg" />
        <DrawerHeader
          borderBottomWidth="1px"
          bg="brand.600"
          color="white"
          pt={8}
          pb={6}
          boxShadow="md"
        >
          <Flex align="center" gap={4}>
            <Box p={3} bg="whiteAlpha.200" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiClock} boxSize={6} color="white" />
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">Manage Subscription {user?.company}</Text>
              <Text fontSize="md" fontWeight="medium" color="whiteAlpha.800" mt={1}>
                {user?.name}
              </Text>
            </Box>
          </Flex>
        </DrawerHeader>

        <DrawerBody px={6} py={8}>
          {isFetching ? (
            <Flex justify="center" align="center" h="100%" direction="column" gap={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text color="gray.500" fontWeight="medium">Loading subscription details...</Text>
            </Flex>
          ) : (
            <VStack spacing={8} align="stretch">

              <Box
                p={5}
                borderRadius="2xl"
                bg="white"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="brand.100"
                position="relative"
                overflow="hidden"
              >
                <Box position="absolute" top={0} left={0} w="4px" h="100%" bg="brand.500" />
                <Flex align="center" gap={3} mb={2}>
                  <Icon as={FiShield} color="brand.500" boxSize={5} />
                  <Text fontWeight="bold" color="gray.800" fontSize="lg">Active Plan Settings</Text>
                </Flex>
                <Text fontSize="sm" color="gray.500" mb={5}>
                  Update the billing cycle. Changes apply instantly and are logged to history.
                </Text>

                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600" fontSize="sm" color="gray.700">Valid From</FormLabel>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      bg="gray.50"
                      size="lg"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "brand.300" }}
                      _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="600" fontSize="sm" color="gray.700">Valid Until</FormLabel>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      bg="gray.50"
                      size="lg"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "brand.300" }}
                      _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm" color="gray.700">Amount</FormLabel>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      bg="gray.50"
                      size="lg"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "brand.300" }}
                      _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm" color="gray.700">Description / Modules</FormLabel>
                    <Input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Premium Plan + WhatsApp Module"
                      bg="gray.50"
                      size="lg"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "brand.300" }}
                      _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                    />
                  </FormControl>
                </VStack>
              </Box>

              {subscriptionHistory.length > 0 && (
                <Box>
                  <Flex align="center" gap={2} mb={4}>
                    <Icon as={FiClock} color="gray.400" />
                    <Text fontWeight="bold" color="gray.700" fontSize="md">Renewal History</Text>
                  </Flex>

                  <VStack
                    spacing={3}
                    align="stretch"
                    maxH="280px"
                    overflowY="auto"
                    pr={2}
                    sx={{
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-track': { width: '8px', background: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '24px' },
                    }}
                  >
                    {subscriptionHistory.slice().reverse().map((history: any, idx: number) => (
                      <Box
                        key={idx}
                        p={4}
                        bg="white"
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="gray.100"
                        boxShadow="sm"
                        transition="all 0.2s"
                        _hover={{ borderColor: "gray.200", transform: "translateY(-1px)", boxShadow: "md" }}
                      >
                        <Flex justify="space-between" align="center" mb={2}>
                          <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2} py={0.5} display="flex" alignItems="center" gap={1}>
                            <FiCheckCircle /> Renewed
                          </Badge>
                          <Text fontSize="xs" color="gray.400" fontWeight="medium">
                            {formatDateTime(history.updatedAt)}
                          </Text>
                        </Flex>

                        <Flex align="center" justify="space-between" mt={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wider">Start</Text>
                            <Flex align="center" gap={1.5}>
                              <Icon as={FiCalendar} color="gray.400" boxSize={3} />
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                {new Date(history.startDate).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </Box>

                          <Divider orientation="horizontal" w="20px" borderColor="gray.300" />

                          <Box textAlign="right">
                            <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wider">End</Text>
                            <Flex align="center" gap={1.5} justify="flex-end">
                              <Icon as={FiCalendar} color="gray.400" boxSize={3} />
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                {new Date(history.endDate).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>

                        <Box>
                          {(history.amount !== undefined || history.description) && (
                            <Box mt={3} p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.100" position="relative">
                              <Flex justify="space-between" align="flex-start">
                                <Box>
                                  {history.amount !== undefined && (
                                    <Text fontSize="sm" fontWeight="bold" color="gray.800">
                                      Amount: ₹{history.amount}
                                    </Text>
                                  )}
                                  {history.description && (
                                    <Text fontSize="sm" color="gray.600" mt={history.amount !== undefined ? 1 : 0}>
                                      {history.description}
                                    </Text>
                                  )}
                                </Box>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  leftIcon={<FiEdit2 />}
                                  onClick={() => {
                                    setEditingHistoryId(history._id);
                                    setEditAmount(history.amount !== undefined ? String(history.amount) : "");
                                    setEditDescription(history.description || "");
                                  }}
                                >
                                  Edit
                                </Button>
                              </Flex>
                            </Box>
                          )}
                          {history.amount === undefined && !history.description && (
                             <Flex justify="flex-end" mt={2}>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme="gray"
                                  leftIcon={<FiPlus />}
                                  onClick={() => {
                                    setEditingHistoryId(history._id);
                                    setEditAmount("");
                                    setEditDescription("");
                                  }}
                                >
                                  Add Amount/Desc
                                </Button>
                             </Flex>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

            </VStack>
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" bg="white" p={4}>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading} borderRadius="xl">
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Processing..."
            borderRadius="xl"
            px={8}
            size="lg"
            w="full"
            boxShadow="0 4px 12px rgba(var(--chakra-colors-brand-500), 0.3)"
            _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(var(--chakra-colors-brand-500), 0.4)" }}
            transition="all 0.2s"
          >
            Apply Renewal
          </Button>
        </DrawerFooter>
      </DrawerContent>

      <Modal isOpen={!!editingHistoryId} onClose={() => setEditingHistoryId(null)} isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader color="brand.600">Update Subscription History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm" color="gray.700">Amount</FormLabel>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Amount (e.g. 5000)"
                  bg="gray.50"
                  size="lg"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm" color="gray.700">Description / Modules</FormLabel>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="e.g. Premium Plan"
                  bg="gray.50"
                  size="lg"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingHistoryId(null)} isDisabled={isUpdatingHistory} borderRadius="xl">
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => editingHistoryId && handleUpdateHistory(editingHistoryId)} isLoading={isUpdatingHistory} borderRadius="xl">
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Drawer>
  );
};

export default RenewSubscriptionModal;

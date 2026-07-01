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
} from "@chakra-ui/react";
import { FiClock, FiCalendar, FiCheckCircle, FiShield, FiStar } from "react-icons/fi";
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
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.adminCompanyId) return;
      setIsFetching(true);
      try {
        const { data } = await axios.get(`/company/subscription/${user.adminCompanyId}`);
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

    if (!user?.adminCompanyId) {
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
        companyId: user.adminCompanyId,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
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
              <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">Manage Subscription</Text>
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
    </Drawer>
  );
};

export default RenewSubscriptionModal;

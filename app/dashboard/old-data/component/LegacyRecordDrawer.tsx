import React from "react";
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Spinner,
  Center,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Flex,
  Divider
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { FaTooth, FaHistory, FaRupeeSign, FaFileInvoiceDollar, FaUserAlt, FaCalendarAlt, FaUserMd } from "react-icons/fa";

interface LegacyRecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegacyRecordDrawer = observer(({ isOpen, onClose }: LegacyRecordDrawerProps) => {
  const { oldDataStore } = stores;
  const loading = oldDataStore.detailsLoading;
  const record = oldDataStore.selectedFullRecord;

  const getDoctorName = () => {
    if (!record) return "N/A";
    if (record.workComp?.doctorId?.name) return record.workComp.doctorId.name;
    if (record.workComp?.legacyDocCode && record.workComp.legacyDocCode !== "0") return record.workComp.legacyDocCode;
    
    // Fallback: Try to find a valid doctor name in the related ToothWorks
    const tw = record.toothWorks?.find((t: any) => t.doctorId?.name || (t.legacyDocCode && t.legacyDocCode !== "0"));
    if (tw) {
      return tw.doctorId?.name || tw.legacyDocCode;
    }

    return record.workComp?.legacyDocCode || "N/A";
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent maxW="85vw">
        <DrawerCloseButton mt={2} mr={2} size="lg" />
        <DrawerHeader borderBottomWidth="1px" bgGradient="linear(to-r, blue.50, white)" color="blue.800" py={5}>
          <HStack spacing={3}>
            <Box p={2} bg="blue.500" color="white" rounded="lg" shadow="sm">
              <Icon as={FaTooth} boxSize={5} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold">Complete Work Record Details</Text>
          </HStack>
        </DrawerHeader>
        <DrawerBody p={0} bg="gray.50">
          {loading ? (
            <Center h="100%" minH="50vh">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : !record || !record.workComp ? (
            <Center h="100%" minH="50vh">
              <Text color="gray.500" fontSize="lg">No complete record found.</Text>
            </Center>
          ) : (
            <VStack align="stretch" spacing={0} h="100%">
              {/* Premium Header Info */}
              <Box p={6} bg="white" shadow="sm" zIndex={1} borderBottom="1px solid" borderColor="gray.100">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                  <Flex align="center">
                    <Box p={4} bg="blue.50" color="blue.600" rounded="xl" mr={4}>
                      <Icon as={FaCalendarAlt} boxSize={6} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wide">Date</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">{new Date(record.workComp.wrk_date).toLocaleDateString()}</Text>
                    </Box>
                  </Flex>
                  <Flex align="center">
                    <Box p={4} bg="green.50" color="green.600" rounded="xl" mr={4}>
                      <Icon as={FaUserAlt} boxSize={6} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wide">Patient</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">{record.workComp.patientId?.name || "Unknown"}</Text>
                      <Badge colorScheme="green" variant="subtle" mt={1}>{record.workComp.legacyPatCode}</Badge>
                    </Box>
                  </Flex>
                  <Flex align="center">
                    <Box p={4} bg="purple.50" color="purple.600" rounded="xl" mr={4}>
                      <Icon as={FaUserMd} boxSize={6} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wide">Doctor</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">{getDoctorName()}</Text>
                    </Box>
                  </Flex>
                  <Flex align="center">
                    <Box w="100%" p={4} bg="gray.50" rounded="xl" border="1px dashed" borderColor="gray.300">
                      <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>Treatment Stage</Text>
                      <Badge colorScheme={record.workComp.treat_stage === 'Done' ? 'green' : 'blue'} px={3} py={1} rounded="md" fontSize="md">
                        {record.workComp.treat_stage}
                      </Badge>
                    </Box>
                  </Flex>
                </SimpleGrid>
              </Box>

              {/* Tabs Section */}
              <Box flex={1} p={6} bg="gray.50">
                <Tabs variant="unstyled" h="100%">
                  <TabList mb={6} bg="white" p={2} rounded="full" shadow="sm" display="inline-flex">
                    <Tab 
                      rounded="full" fontWeight="bold" px={6} py={2} 
                      _selected={{ bg: "blue.600", color: "white", shadow: "md" }}
                      _hover={{ bg: "blue.50", color: "blue.700" }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaTooth} mr={2} />Work Details ({record.details?.length || 0})
                    </Tab>
                    <Tab 
                      rounded="full" fontWeight="bold" px={6} py={2} 
                      _selected={{ bg: "blue.600", color: "white", shadow: "md" }}
                      _hover={{ bg: "blue.50", color: "blue.700" }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaHistory} mr={2} />History ({record.toothWorks?.length || 0})
                    </Tab>
                    <Tab 
                      rounded="full" fontWeight="bold" px={6} py={2} 
                      _selected={{ bg: "blue.600", color: "white", shadow: "md" }}
                      _hover={{ bg: "blue.50", color: "blue.700" }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaRupeeSign} mr={2} />Transactions ({record.transactions?.length || 0})
                    </Tab>
                    <Tab 
                      rounded="full" fontWeight="bold" px={6} py={2} 
                      _selected={{ bg: "blue.600", color: "white", shadow: "md" }}
                      _hover={{ bg: "blue.50", color: "blue.700" }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaFileInvoiceDollar} mr={2} />Fees ({record.workFees?.length || 0})
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Work Details Panel */}
                    <TabPanel px={0}>
                      <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                        {record.details?.map((d: any, idx: number) => {
                          const hasToothInfo = d.ToothName || d.ToothNoS;
                          const toothDisplay = [d.ToothName, d.ToothNoS ? `(${d.ToothNoS})` : ""].filter(Boolean).join(" ");
                          
                          return (
                            <Box key={idx} p={5} bg="white" border="1px" borderColor="gray.100" rounded="2xl" shadow="sm" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
                              {hasToothInfo ? (
                                <Badge colorScheme="teal" mb={3} px={2} py={1} rounded="md">Tooth: {toothDisplay}</Badge>
                              ) : (
                                <Badge colorScheme="gray" mb={3} px={2} py={1} rounded="md">General Work</Badge>
                              )}
                              
                              {d.Wrk_Done && (
                                <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>{d.Wrk_Done}</Text>
                              )}
                              
                              {d.Sp_Notes && (
                                <Box bg="gray.50" p={3} rounded="lg" borderLeft="4px solid" borderColor={hasToothInfo ? "teal.400" : "gray.400"}>
                                  <Text fontSize="sm" color="gray.600"><strong>Notes:</strong> {d.Sp_Notes}</Text>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                        {(!record.details || record.details.length === 0) && (
                          <Text color="gray.500" fontStyle="italic">No work details available.</Text>
                        )}
                      </SimpleGrid>
                    </TabPanel>

                    {/* History Panel */}
                    <TabPanel px={0}>
                      <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                        {record.toothWorks?.map((tw: any, idx: number) => (
                          <Box key={idx} p={5} bg="white" borderTop="4px solid" borderColor="blue.400" rounded="2xl" shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
                            <HStack justify="space-between" mb={3}>
                              <Badge colorScheme="blue" px={2} py={1} rounded="md">Tooth: {tw.ToothNoS}</Badge>
                              <Text fontSize="sm" fontWeight="bold" color="blue.600">{new Date(tw.wrkdate).toLocaleDateString()}</Text>
                            </HStack>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={2}>{tw.name}</Text>
                            <Text fontSize="md" color="gray.600">{tw.descript}</Text>
                          </Box>
                        ))}
                        {(!record.toothWorks || record.toothWorks.length === 0) && (
                          <Text color="gray.500" fontStyle="italic">No tooth work history available.</Text>
                        )}
                      </SimpleGrid>
                    </TabPanel>

                    {/* Transactions Panel */}
                    <TabPanel px={0}>
                      <SimpleGrid columns={{ base: 1, lg: 3, xl: 4 }} spacing={6}>
                        {record.transactions?.map((t: any, idx: number) => (
                          <Box key={idx} p={6} bg="white" border="1px" borderColor="green.100" rounded="2xl" shadow="sm" textAlign="center" _hover={{ shadow: 'md', borderColor: 'green.300' }} transition="all 0.2s">
                            <Box w="12" h="12" bg="green.50" color="green.500" rounded="full" mx="auto" mb={3} display="flex" alignItems="center" justifyContent="center">
                              <Icon as={FaRupeeSign} boxSize={5} />
                            </Box>
                            <Text fontSize="3xl" fontWeight="extrabold" color="green.600" mb={1}>₹{t.fee_rec}</Text>
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">{new Date(t.date).toLocaleDateString()}</Text>
                            <Badge colorScheme="green" mt={3} px={3} py={1} rounded="full">Amount Paid</Badge>
                          </Box>
                        ))}
                        {(!record.transactions || record.transactions.length === 0) && (
                          <Text color="gray.500" fontStyle="italic">No transactions available.</Text>
                        )}
                      </SimpleGrid>
                    </TabPanel>

                    {/* Fees Panel */}
                    <TabPanel px={0}>
                      <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                        {record.workFees?.map((f: any, idx: number) => (
                          <Box key={idx} p={6} bg="white" border="1px" borderColor="orange.100" rounded="2xl" shadow="sm" _hover={{ shadow: 'md', borderColor: 'orange.300' }} transition="all 0.2s">
                            <HStack justify="space-between" mb={4}>
                              <Text fontSize="sm" fontWeight="bold" color="gray.500">Date: {new Date(f.wrk_date).toLocaleDateString()}</Text>
                              <Badge colorScheme="orange" px={2} py={1} rounded="md">Fee Record</Badge>
                            </HStack>
                            <HStack spacing={8} divider={<Divider orientation="vertical" h="10" />}>
                              <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>Amount Due</Text>
                                <Text fontSize="2xl" fontWeight="extrabold" color="red.500">₹{f.fee_due || 0}</Text>
                              </Box>
                              <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>Discount</Text>
                                <Text fontSize="2xl" fontWeight="extrabold" color="green.500">₹{f.fee_dis || 0}</Text>
                              </Box>
                            </HStack>
                          </Box>
                        ))}
                        {(!record.workFees || record.workFees.length === 0) && (
                          <Text color="gray.500" fontStyle="italic">No fee records available.</Text>
                        )}
                      </SimpleGrid>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default LegacyRecordDrawer;

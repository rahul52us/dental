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
  Badge,
  Spinner,
  Center,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { FaTooth, FaHistory, FaRupeeSign, FaFileInvoiceDollar, FaCalendarAlt, FaUserMd } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Divider, Flex } from "@chakra-ui/react";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";

interface LegacyPatientHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const toDateString = (d: any) => d ? new Date(d).toLocaleDateString('en-IN') : "--";

const LegacyPatientHistoryDrawer = observer(({ isOpen, onClose }: LegacyPatientHistoryDrawerProps) => {
  const { oldDataStore } = stores;
  const { t } = useTranslation();
  const loading = oldDataStore.patientFullHistoryLoading;
  const history = oldDataStore.patientFullHistory;

  const patientCode = history?.workComp?.[0]?.legacyPatCode || history?.toothWorks?.[0]?.legacyPatCode || "N/A";
  const patientName = history?.workComp?.[0]?.patientId?.name || history?.toothWorks?.[0]?.patientId?.name || "Unknown Patient";

  const getDoctorName = (twRecord?: any, wcRecord?: any) => {
    if (wcRecord?.doctorId?.name) return wcRecord.doctorId.name;
    if (wcRecord?.legacyDocCode && wcRecord.legacyDocCode !== "0") return wcRecord.legacyDocCode;
    if (twRecord?.doctorId?.name) return twRecord.doctorId.name;
    if (twRecord?.legacyDocCode && twRecord.legacyDocCode !== "0") return twRecord.legacyDocCode;
    return "N/A";
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent maxW="90vw">
        <DrawerCloseButton mt={2} mr={2} size="lg" />
        <DrawerHeader borderBottomWidth="1px" bgGradient="linear(to-r, blue.50, white)" color="blue.800" py={5}>
          <HStack spacing={3}>
            <Box p={2} bg="purple.500" color="white" rounded="lg" shadow="sm">
              <Icon as={FaHistory} boxSize={5} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold">{t("Comprehensive Patient History")}</Text>
          </HStack>
          <HStack mt={1}>
            <Text fontSize="md" color="gray.600">{patientName}</Text>
            <Badge colorScheme="green" variant="subtle">{patientCode}</Badge>
          </HStack>
        </DrawerHeader>
        <DrawerBody p={0} bg="gray.100">
          {loading ? (
            <Center h="100%" minH="50vh">
              <Spinner size="xl" color="purple.500" thickness="4px" />
            </Center>
          ) : !history || !history.workComp || history.workComp.length === 0 ? (
            <Center h="100%" minH="50vh">
              <Text color="gray.500" fontSize="lg">{t("No history found for this patient.")}</Text>
            </Center>
          ) : (
            <VStack align="stretch" spacing={4} p={4} bg="gray.100">
              {history.workComp?.map((work: any, wIdx: number) => {
                const wDetails = history.details?.filter((d: any) => d.legacyWrkDoneId === work.legacyWrkDoneId) || [];
                const wToothWorks = history.toothWorks?.filter((tw: any) => tw.legacyWrkDoneId === work.legacyWrkDoneId || (tw.wrkdate && work.wrk_date && new Date(tw.wrkdate).getTime() === new Date(work.wrk_date).getTime())) || [];
                const wTransactions = history.transactions?.filter((t: any) => t.legacyWrkDoneId === work.legacyWrkDoneId || (t.date && work.wrk_date && new Date(t.date).getTime() === new Date(work.wrk_date).getTime())) || [];
                const wFees = history.workFees?.filter((f: any) => f.legacyWrkDoneId === work.legacyWrkDoneId || (f.wrk_date && work.wrk_date && new Date(f.wrk_date).getTime() === new Date(work.wrk_date).getTime())) || [];

                return (
                  <Box key={wIdx} bg="white" shadow="sm" rounded="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
                    <Box bg="white" p={6} borderBottom="1px solid" borderColor="gray.200" roundedTop="2xl">
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Flex align="center">
                          <Box p={3} bg="purple.50" color="purple.600" rounded="lg" mr={3}>
                            <Icon as={FaCalendarAlt} boxSize={5} />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wide">{t("Date")}</Text>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">{new Date(work.wrk_date).toLocaleDateString('en-IN')}</Text>
                          </Box>
                        </Flex>
                        <Flex align="center">
                          <Box p={3} bg="purple.50" color="purple.600" rounded="lg" mr={3}>
                            <Icon as={FaUserMd} boxSize={5} />
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">{t("Doctor")}</Text>
                            <Text fontSize="md" fontWeight="bold" color="gray.800">{getDoctorName(wToothWorks[0], work)}</Text>
                          </Box>
                        </Flex>
                        <Flex align="center">
                          <Box w="100%" p={3} bg="gray.50" rounded="lg" border="1px dashed" borderColor="gray.300">
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>{t("Treatment Stage")}</Text>
                            <Badge colorScheme={work.treat_stage === 'Done' ? 'green' : 'blue'} px={2} py={0.5} rounded="md" fontSize="sm">
                              {work.treat_stage}
                            </Badge>
                          </Box>
                        </Flex>
                      </SimpleGrid>
                    </Box>

                    <Box p={4} bg="gray.50">
                      <Accordion defaultIndex={[0, 1, 2, 3]} allowMultiple>
                        
                        {/* Work Details Section */}
                        <AccordionItem border="1px solid" borderColor="gray.200" rounded="xl" mb={4} bg="white" overflow="hidden">
                          <h2>
                            <AccordionButton p={4} _hover={{ bg: 'gray.50' }}>
                              <Flex flex="1" align="center">
                                <Icon as={FaTooth} color="purple.500" mr={3} boxSize={5} />
                                <Text fontSize="md" fontWeight="bold" color="gray.800">
                                  {t("Work Details")} <Badge ml={2} colorScheme="purple" rounded="full">{wDetails.length}</Badge>
                                </Text>
                              </Flex>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4} bg="white">
                            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                              {wDetails.map((d: any, idx: number) => {
                                const hasToothInfo = d.ToothName || d.ToothNoS;
                                const toothDisplay = [d.ToothName, d.ToothNoS ? `(${d.ToothNoS})` : ""].filter(Boolean).join(" ");

                                return (
                                  <Box key={idx} p={4} bg="white" border="1px" borderColor="gray.100" rounded="xl" shadow="sm" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
                                    {hasToothInfo ? (
                                      <Badge colorScheme="teal" mb={2} px={2} py={0.5} rounded="md">Tooth: {toothDisplay}</Badge>
                                    ) : (
                                      <Badge colorScheme="gray" mb={2} px={2} py={0.5} rounded="md">General Work</Badge>
                                    )}

                                    {d.Wrk_Done && (
                                      <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={2}>{d.Wrk_Done}</Text>
                                    )}

                                    {d.Sp_Notes && (
                                      <Box bg="gray.50" p={2} rounded="md" borderLeft="3px solid" borderColor={hasToothInfo ? "teal.400" : "gray.400"}>
                                        <Text fontSize="xs" color="gray.600"><strong>Notes:</strong> {d.Sp_Notes}</Text>
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })}
                              {wDetails.length === 0 && (
                                <Text color="gray.500" fontStyle="italic">No work details available.</Text>
                              )}
                            </SimpleGrid>
                          </AccordionPanel>
                        </AccordionItem>

                        {/* History Section */}
                        <AccordionItem border="1px solid" borderColor="gray.200" rounded="xl" mb={4} bg="white" overflow="hidden">
                          <h2>
                            <AccordionButton p={4} _hover={{ bg: 'gray.50' }}>
                              <Flex flex="1" align="center">
                                <Icon as={FaHistory} color="blue.500" mr={3} boxSize={5} />
                                <Text fontSize="md" fontWeight="bold" color="gray.800">
                                  {t("History")} <Badge ml={2} colorScheme="blue" rounded="full">{wToothWorks.length}</Badge>
                                </Text>
                              </Flex>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4} bg="white">
                            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                              {wToothWorks.map((tw: any, idx: number) => (
                                <Box key={idx} p={4} bg="white" borderTop="3px solid" borderColor="blue.400" rounded="xl" shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
                                  <HStack justify="space-between" mb={2}>
                                    <Badge colorScheme="blue" px={2} py={0.5} rounded="md">Tooth: {tw.ToothNoS}</Badge>
                                    <Text fontSize="xs" fontWeight="bold" color="blue.600">{new Date(tw.wrkdate).toLocaleDateString('en-IN')}</Text>
                                  </HStack>
                                  <Text fontSize="md" fontWeight="bold" color="gray.800" mb={1}>{tw.name}</Text>
                                  <Text fontSize="sm" color="gray.600">{tw.descript}</Text>
                                </Box>
                              ))}
                              {wToothWorks.length === 0 && (
                                <Text color="gray.500" fontStyle="italic">No tooth work history available.</Text>
                              )}
                            </SimpleGrid>
                          </AccordionPanel>
                        </AccordionItem>

                        {/* Transactions Section */}
                        <AccordionItem border="1px solid" borderColor="gray.200" rounded="xl" mb={4} bg="white" overflow="hidden">
                          <h2>
                            <AccordionButton p={4} _hover={{ bg: 'gray.50' }}>
                              <Flex flex="1" align="center">
                                <Icon as={FaRupeeSign} color="green.500" mr={3} boxSize={5} />
                                <Text fontSize="md" fontWeight="bold" color="gray.800">
                                  {t("Transactions")} <Badge ml={2} colorScheme="green" rounded="full">{wTransactions.length}</Badge>
                                </Text>
                              </Flex>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4} bg="white">
                            <SimpleGrid columns={{ base: 1, lg: 3, xl: 4 }} spacing={4}>
                              {wTransactions.map((t: any, idx: number) => (
                                <Box key={idx} p={4} bg="white" border="1px" borderColor="green.100" rounded="xl" shadow="sm" textAlign="center" _hover={{ shadow: 'md', borderColor: 'green.300' }} transition="all 0.2s">
                                  <Box w="10" h="10" bg="green.50" color="green.500" rounded="full" mx="auto" mb={2} display="flex" alignItems="center" justifyContent="center">
                                    <Icon as={FaRupeeSign} boxSize={4} />
                                  </Box>
                                  <Text fontSize="2xl" fontWeight="extrabold" color="green.600" mb={1}>₹{t.fee_rec}</Text>
                                  <Text fontSize="xs" color="gray.500" fontWeight="medium">{new Date(t.date).toLocaleDateString('en-IN')}</Text>
                                  <Badge colorScheme="green" mt={2} px={2} py={0.5} rounded="full" fontSize="xs">Amount Paid</Badge>
                                </Box>
                              ))}
                              {wTransactions.length === 0 && (
                                <Text color="gray.500" fontStyle="italic">No transactions available.</Text>
                              )}
                            </SimpleGrid>
                          </AccordionPanel>
                        </AccordionItem>

                        {/* Fees Section */}
                        <AccordionItem border="1px solid" borderColor="gray.200" rounded="xl" bg="white" overflow="hidden">
                          <h2>
                            <AccordionButton p={4} _hover={{ bg: 'gray.50' }}>
                              <Flex flex="1" align="center">
                                <Icon as={FaFileInvoiceDollar} color="orange.500" mr={3} boxSize={5} />
                                <Text fontSize="md" fontWeight="bold" color="gray.800">
                                  {t("Fees")} <Badge ml={2} colorScheme="orange" rounded="full">{wFees.length}</Badge>
                                </Text>
                              </Flex>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4} bg="white">
                            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                              {wFees.map((f: any, idx: number) => (
                                <Box key={idx} p={4} bg="white" border="1px" borderColor="orange.100" rounded="xl" shadow="sm" _hover={{ shadow: 'md', borderColor: 'orange.300' }} transition="all 0.2s">
                                  <HStack justify="space-between" mb={3}>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500">Date: {new Date(f.wrk_date).toLocaleDateString('en-IN')}</Text>
                                    <Badge colorScheme="orange" px={2} py={0.5} rounded="md" fontSize="xs">Fee Record</Badge>
                                  </HStack>
                                  <HStack spacing={6} divider={<Divider orientation="vertical" h="8" />}>
                                    <Box>
                                      <Text fontSize="2xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={0.5}>Amount Due</Text>
                                      <Text fontSize="xl" fontWeight="extrabold" color="red.500">₹{f.fee_due || 0}</Text>
                                    </Box>
                                    <Box>
                                      <Text fontSize="2xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={0.5}>Discount</Text>
                                      <Text fontSize="xl" fontWeight="extrabold" color="green.500">₹{f.fee_dis || 0}</Text>
                                    </Box>
                                  </HStack>
                                </Box>
                              ))}
                              {wFees.length === 0 && (
                                <Text color="gray.500" fontStyle="italic">No fee records available.</Text>
                              )}
                            </SimpleGrid>
                          </AccordionPanel>
                        </AccordionItem>

                      </Accordion>
                    </Box>
                  </Box>
                );
              })}
              {(!history.workComp || history.workComp.length === 0) && (
                <Center p={10}>
                  <Text color="gray.500" fontSize="lg">No work records available for this patient.</Text>
                </Center>
              )}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default LegacyPatientHistoryDrawer;

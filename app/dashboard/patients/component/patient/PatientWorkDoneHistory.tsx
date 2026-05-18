"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Spinner,
  Heading,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import { FiPlus, FiClock } from "react-icons/fi";

import WorkDoneList from "../../../workDone/component/WorkDoneList";
import WorkDoneForm from "../../../workDone/component/WorkDoneForm";

interface PatientWorkDoneHistoryProps {
  patientDetails: any;
}

const PatientWorkDoneHistory = observer(({ patientDetails }: PatientWorkDoneHistoryProps) => {
  const {
    toothTreatmentStore: { getToothTreatments },
  } = stores;

  const [treatments, setTreatments] = useState<any[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all treatments for this patient to build the filter
      const res: any = await getToothTreatments({
        patientId: patientDetails._id,
        page: 1,
        search: "",
      });
      const data = res?.data?.data || res?.data || [];
      setTreatments(data);
    } catch (err) {
      console.error("Failed to fetch treatments for filter", err);
    } finally {
      setLoading(false);
    }
  }, [getToothTreatments, patientDetails._id]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  return (
    <Box py={3} px={6}>
      <Tabs index={activeTab} onChange={(index) => setActiveTab(index)} variant="unstyled" colorScheme="blue" w="full">
        <TabList 
          bg="gray.50" 
          p={1} 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="gray.100" 
          display="flex" 
          w="full"
          mb={4}
          gap={1.5}
        >
          <Tab
            flex={1}
            borderRadius="lg"
            fontSize="sm"
            fontWeight="bold"
            color="gray.500"
            py={2}
            transition="all 0.2s"
            _selected={{
              bg: "white",
              color: "blue.600",
              shadow: "sm",
              fontWeight: "extrabold",
            }}
            _hover={{
              color: "blue.500",
              bg: "gray.100",
            }}
          >
            <HStack spacing={2} justify="center">
              <Icon as={FiPlus} boxSize={3.5} />
              <Text>New Work Entry</Text>
            </HStack>
          </Tab>
          <Tab
            flex={1}
            borderRadius="lg"
            fontSize="sm"
            fontWeight="bold"
            color="gray.500"
            py={2}
            transition="all 0.2s"
            _selected={{
              bg: "white",
              color: "blue.600",
              shadow: "sm",
              fontWeight: "extrabold",
            }}
            _hover={{
              color: "blue.500",
              bg: "gray.100",
            }}
          >
            <HStack spacing={2} justify="center">
              <Icon as={FiClock} boxSize={3.5} />
              <Text>Work History</Text>
            </HStack>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <WorkDoneForm
              patientDetails={patientDetails}
              onSuccess={() => {
                setActiveTab(1); // Switch to Work History tab
                setRefreshKey((prev) => prev + 1); // Refresh the list
              }}
            />
          </TabPanel>
          <TabPanel p={0}>
            <VStack align="stretch" spacing={4} h="full" py={1} px={0}>
              {/* Filter Section */}
              <Box p={4} bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
                <VStack align="start" spacing={3}>
                  <HStack spacing={2}>
                    <Box w="3px" h="12px" bg="blue.500" borderRadius="full" />
                    <Heading size="xs" color="gray.600" textTransform="uppercase" letterSpacing="widest" fontSize="9px">
                      Filter by Treatment Plan
                    </Heading>
                  </HStack>
                  <HStack w="full" spacing={4}>
                    <Select
                      value={selectedTreatmentId}
                      onChange={(e) => setSelectedTreatmentId(e.target.value)}
                      bg="white"
                      borderRadius="xl"
                      h="38px"
                      fontSize="sm"
                      fontWeight="600"
                    >
                      <option value="all">All Treatments</option>
                      {treatments.map((t: any) => {
                        return (
                          <option key={t._id} value={t._id}>
                            {t.treatmentPlan} ({t.tooth} {t.toothNotation.toUpperCase()})
                          </option>
                        )
                      })}
                    </Select>
                    {loading && <Spinner size="sm" color="blue.500" />}
                  </HStack>
                </VStack>
              </Box>

              <Divider my={1} />

              {/* Work Done List Section */}
              <Box flex={1} overflowY="auto">
                <WorkDoneList
                  key={refreshKey}
                  patientDetails={patientDetails}
                  treatmentId={selectedTreatmentId === "all" ? undefined : selectedTreatmentId}
                />
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
});

export default PatientWorkDoneHistory;

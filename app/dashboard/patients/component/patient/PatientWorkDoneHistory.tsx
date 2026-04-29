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
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";

import WorkDoneList from "../../../workDone/component/WorkDoneList";

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
    <VStack align="stretch" spacing={6} h="full" p={4}>
      {/* Filter Section */}
      <Box p={6} bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" shadow="sm">
        <VStack align="start" spacing={4}>
          <HStack spacing={2}>
            <Box w="3px" h="15px" bg="blue.500" borderRadius="full" />
            <Heading size="xs" color="gray.600" textTransform="uppercase" letterSpacing="widest">
              Filter by Treatment Plan
            </Heading>
          </HStack>
          <HStack w="full" spacing={4}>
            <Select
              value={selectedTreatmentId}
              onChange={(e) => setSelectedTreatmentId(e.target.value)}
              bg="white"
              borderRadius="xl"
              h="45px"
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

      <Divider />

      {/* Work Done List Section */}
      <Box flex={1} overflowY="auto">
        <WorkDoneList
          patientDetails={patientDetails}
          treatmentId={selectedTreatmentId === "all" ? undefined : selectedTreatmentId}
        />
      </Box>
    </VStack>
  );
});

export default PatientWorkDoneHistory;

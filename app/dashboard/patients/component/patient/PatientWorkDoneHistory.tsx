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
    <Box p={2}>
      <VStack align="stretch" spacing={4} h="full" p={0}>
        {/* Compact Treatment Plan Filter */}
        <Box
          p={{ base: 2, md: 3 }}
          bg="white"
          borderRadius={{ base: "14px", md: "xl" }}
          border="1px solid"
          borderColor="gray.150"
          shadow="xs"
        >
          <HStack justify="space-between" align="center" mb={1}>
            <HStack spacing={1.5}>
              <Box w="3px" h="10px" bg="blue.500" borderRadius="full" />
              <Text color="gray.600" textTransform="uppercase" letterSpacing="0.4px" fontSize="9px" fontWeight="800">
                Filter by Treatment Plan & Tooth
              </Text>
            </HStack>
            {loading && <Spinner size="xs" color="blue.500" />}
          </HStack>
          <Select
            value={selectedTreatmentId}
            onChange={(e) => setSelectedTreatmentId(e.target.value)}
            bg="gray.50"
            borderRadius="10px"
            h={{ base: "34px", md: "38px" }}
            fontSize="12px"
            fontWeight="700"
            borderColor="gray.200"
          >
            <option value="all">All Treatments</option>
            {treatments.map((t: any) => {
              const toothStr = (typeof t.tooth === 'object' && t.tooth !== null) ? (t.tooth.fdi || t.tooth.id || "") : (t.toothFDI || t.tooth);
              const notationStr = (t.toothNotation || 'FDI').toUpperCase();
              return (
                <option key={t._id} value={t._id}>
                  {t.treatmentPlan} {toothStr && toothStr !== "General" ? `(${toothStr} ${notationStr})` : ''}
                </option>
              )
            })}
          </Select>
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
    </Box>
  );
});

export default PatientWorkDoneHistory;

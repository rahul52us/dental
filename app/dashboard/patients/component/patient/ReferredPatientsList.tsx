import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { MdGroups } from "react-icons/md";
import stores from "../../../../store/stores";

const ReferredPatientsList = ({ userId }: { userId: string }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const cardBg = useColorModeValue("white", "gray.800");
  const itemBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    let active = true;

    if (!userId) {
      setLoading(false);
      setPatients([]);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");
    stores.userStore
      .getReferredPatients(userId)
      .then((data) => {
        if (active) setPatients(data || []);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load referred patients.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <Card
      w="100%"
      bg={cardBg}
      borderWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      borderRadius="xl"
      shadow="sm"
    >
      <CardHeader px={{ base: 4, md: 5 }} pt={4} pb={2}>
        <HStack spacing={2}>
          <Box color="teal.500">
            <MdGroups size={18} />
          </Box>
          <Heading size="sm">Referred patients</Heading>
          {!loading && !error && (
            <Text ml="auto" fontSize="xs" color="gray.500">
              {patients.length}
            </Text>
          )}
        </HStack>
      </CardHeader>
      <CardBody px={{ base: 4, md: 5 }} pt={1} pb={4}>
        {loading ? (
          <Flex align="center" gap={2} py={2} color="gray.500">
            <Spinner size="sm" color="teal.500" />
            <Text fontSize="sm">Loading referred patients...</Text>
          </Flex>
        ) : error ? (
          <Text color="red.500" fontSize="sm">{error}</Text>
        ) : patients.length === 0 ? (
          <Text color="gray.500" fontSize="sm">No referred patients</Text>
        ) : (
          <VStack align="stretch" spacing={2}>
            {patients.map((patient, index) => (
              <HStack key={patient._id || index} p={2} bg={itemBg} borderRadius="lg" spacing={3}>
                <Avatar size="sm" src={patient.pic?.url} name={patient.name || patient.username} />
                <Text minW={0} flex={1} fontSize="sm" fontWeight="medium" wordBreak="break-word">
                  {patient.name || patient.username || "Patient"}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};

export default ReferredPatientsList;

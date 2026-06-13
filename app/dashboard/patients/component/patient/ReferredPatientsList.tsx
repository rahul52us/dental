import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Center,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Divider,
} from "@chakra-ui/react";
import stores from "../../../../store/stores";

const ReferredPatientsList = ({ userId }: { userId: string }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (userId) {
      setLoading(true);
      stores.userStore
        .getReferredPatients(userId)
        .then((data) => {
          setPatients(data || []);
          if (data && data.length > 0) {
            onOpen(); // Automatically open if there are referred patients
          }
        })
        .catch((err) => {
          console.error("Failed to fetch referred patients", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, onOpen]);

  if (loading) {
    return (
      <Center p={5}>
        <Spinner size="md" color="teal.500" />
      </Center>
    );
  }

  if (patients.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered motionPreset="slideInBottom">
      <ModalOverlay backdropFilter="blur(3px)" bg="blackAlpha.300" />
      <ModalContent borderRadius="xl" overflow="hidden" shadow="2xl">
        <ModalHeader bg="teal.500" color="white" py={4} textAlign="center">
          Patients Referred By This User
        </ModalHeader>
        <ModalCloseButton color="white" mt={1} />
        <ModalBody p={0}>
          <Box maxH="400px" overflowY="auto" bg={useColorModeValue("gray.50", "gray.800")}>
            <VStack align="stretch" spacing={0} divider={<Divider borderColor={borderColor} />}>
              {patients.map((patient, idx) => (
                <HStack
                  key={idx}
                  p={4}
                  bg={cardBg}
                  _hover={{ bg: hoverBg, cursor: "default" }}
                  transition="all 0.2s"
                  spacing={4}
                >
                  <Avatar
                    size="md"
                    src={patient.pic?.url}
                    name={patient.name}
                    shadow="sm"
                    border="2px solid white"
                  />
                  <Box flex="1">
                    <Text fontWeight="bold" fontSize="md" color="teal.600">
                      {patient.name || patient.username}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReferredPatientsList;

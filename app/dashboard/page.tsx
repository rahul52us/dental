"use client";

import { Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Text, HStack, Badge, Button, Icon, Flex } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiPhone, FiUser } from "react-icons/fi";
import stores from "../store/stores";

import PatientDashboard from "./components/Dashboard/PatientDashboard";
import DoctorDashboard from "./components/Dashboard/DoctorDashboard";
import StaffDashboard from "./components/Dashboard/StaffDashboard";
import Dashboard from "./components/Dashboard/Dashboard";

const Page = observer(() => {
  const {
    auth: { user },
  } = stores;

  const [pendingRecalls, setPendingRecalls] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.userType !== "patient") {
      stores.recallAppointmentStore.getTodayPendingRecallAppointments()
        .then((data: any[]) => {
          if (data && data.length > 0) {
            setPendingRecalls(data);
            setIsModalOpen(true);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const renderDashboard = () => {
    switch (user?.userType) {
      case "patient":
        return <PatientDashboard />;
      case "doctor":
        return <DoctorDashboard />;
      case "staff":
        return <Dashboard />;
      case "admin":
        return <Dashboard />;
      case "superAdmin":
        return <Dashboard />;
      default:
        return <Box>No dashboard available</Box>;
    }
  };

  return (
    <Box>
      {renderDashboard()}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="orange.50" borderTopRadius="2xl" borderBottom="1px solid" borderColor="orange.100">
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text color="orange.800" fontWeight="bold">Today's Pending Recall Appointments</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <ModalBody py={6} maxH="60vh" overflowY="auto">
            <VStack align="stretch" spacing={4}>
              {pendingRecalls.map((recall, idx) => (
                <Box key={idx} p={4} borderWidth="1px" borderRadius="xl" borderColor="gray.200" bg="white" shadow="sm">
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiUser} color="gray.400" />
                        <Text fontWeight="bold" fontSize="lg">{recall.patient?.name}</Text>
                        <Badge colorScheme="blue">{recall.patient?.code}</Badge>
                      </HStack>
                      <HStack color="gray.600" fontSize="sm">
                        <Icon as={FiPhone} />
                        <Text>{recall.patient?.mobileNumber}</Text>
                      </HStack>
                      {recall.doctor && (
                        <Text fontSize="sm" color="gray.500">
                          Dr. {recall.doctor?.name}
                        </Text>
                      )}
                    </VStack>
                    <Badge colorScheme="orange" variant="subtle" px={2} py={1} borderRadius="md">
                      PENDING
                    </Badge>
                  </Flex>
                  {recall.reason && (
                    <Box mt={3} p={2} bg="gray.50" borderRadius="md" fontSize="sm" color="gray.700">
                      <strong>Reason:</strong> {recall.reason}
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default Page;
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  Stack,
  Box
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiDatabase } from "react-icons/fi";
import stores from "../../../../store/stores";
import { observer } from "mobx-react-lite";

interface CloneDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: any;
}

const CloneDatabaseModal = observer(({ isOpen, onClose, adminUser }: CloneDatabaseModalProps) => {
  const {
    userStore: { cloneCompanyDatabase },
    auth: { openNotification, user },
  } = stores;

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setEmail(user.username);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email) {
      openNotification({
        type: "error",
        title: "Validation Error",
        message: "Notification email is required.",
      });
      return;
    }

    const companyId = adminUser?.adminCompanyId || adminUser?.company?._id || adminUser?.company;

    if (!companyId) {
      openNotification({
        type: "error",
        title: "Error",
        message: "No company associated with this admin user.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await cloneCompanyDatabase(companyId, email);
      openNotification({
        type: "success",
        title: "Clone Process Initiated",
        message: "The database cloning process has been started. You will receive an email once complete.",
      });
      onClose();
    } catch (error: any) {
      openNotification({
        type: "error",
        title: "Error",
        message: error?.message || "Failed to start database clone.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent borderRadius="2xl" p={1}>
        <ModalHeader display="flex" alignItems="center" gap={3}>
          <Box bg="purple.100" p={2} borderRadius="full" color="purple.600">
            <FiDatabase size={24} />
          </Box>
          Clone Company Database
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <Text color="gray.600">
              You are about to clone the database content for the company associated with{" "}
              <strong>{adminUser?.name || adminUser?.username}</strong>.
            </Text>
            <Text fontSize="sm" color="gray.500">
              This process runs in the background. It will copy all collection documents belonging to this company's ID to a new database.
            </Text>
            <FormControl isRequired>
              <FormLabel>Send Notification Email To</FormLabel>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter mt={2}>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            borderRadius="full"
            px={6}
          >
            Start Clone
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default CloneDatabaseModal;

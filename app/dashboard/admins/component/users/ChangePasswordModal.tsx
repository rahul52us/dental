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
  InputGroup,
  InputRightElement,
  IconButton
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import stores from "../../../../store/stores";
import { observer } from "mobx-react-lite";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

const ChangePasswordModal = observer(({ isOpen, onClose, userId, userName }: ChangePasswordModalProps) => {
  const {
    userStore: { updateAdminPassword },
    auth: { openNotification },
  } = stores;

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = () => setShow(!show);

  const handleSubmit = async () => {
    if (password.length < 6) {
      openNotification({
        type: "error",
        title: "Validation Error",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAdminPassword(userId, password);
      openNotification({
        type: "success",
        title: "Success",
        message: "Password updated successfully.",
      });
      setPassword("");
      onClose();
    } catch (error: any) {
      openNotification({
        type: "error",
        title: "Error",
        message: error?.message || "Failed to update password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent borderRadius="xl">
        <ModalHeader>Change Password {userName && `for ${userName}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Hidden dummy inputs to stop browser autofill from hijacking the page's search bar */}
          <input type="text" autoComplete="username" style={{ display: 'none' }} />
          <input type="password" autoComplete="current-password" style={{ display: 'none' }} />
          
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  variant="ghost"
                  onClick={handleClick}
                  icon={show ? <FiEyeOff /> : <FiEye />}
                  aria-label={show ? "Hide password" : "Show password"}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            borderRadius="full"
          >
            Save Password
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default ChangePasswordModal;

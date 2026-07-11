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
  IconButton,
  Flex,
  Box,
  Text
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff, FiKey } from "react-icons/fi";
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
    userStore: { updateUserPassword },
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
      await updateUserPassword(userId, password);
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.400" />
      <ModalContent borderRadius="2xl" p={2} boxShadow="2xl">
        <ModalCloseButton mt={3} mr={3} borderRadius="full" />
        
        <ModalHeader pt={6} pb={2}>
          <Flex direction="column" align="center" gap={3}>
            <Flex
              w={14}
              h={14}
              bg="orange.100"
              color="orange.500"
              borderRadius="full"
              align="center"
              justify="center"
              boxShadow="sm"
            >
              <FiKey size={26} />
            </Flex>
            <Box textAlign="center">
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Change Password
              </Text>
              {userName && (
                <Text fontSize="sm" color="gray.500" fontWeight="normal" mt={1}>
                  Updating credentials for <Text as="span" fontWeight="semibold" color="gray.700">{userName}</Text>
                </Text>
              )}
            </Box>
          </Flex>
        </ModalHeader>
        
        <ModalBody py={4}>
          {/* Hidden dummy inputs to stop browser autofill from hijacking the page's search bar */}
          <input type="text" autoComplete="username" style={{ display: 'none' }} />
          <input type="password" autoComplete="current-password" style={{ display: 'none' }} />
          
          <FormControl isRequired>
            <FormLabel fontWeight="medium" color="gray.700" fontSize="sm">New Password</FormLabel>
            <InputGroup size="lg">
              <Input
                pr="3rem"
                type={show ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                borderRadius="xl"
                fontSize="md"
                bg="gray.50"
                _focus={{ bg: "white", borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)" }}
              />
              <InputRightElement width="3rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "gray.600", bg: "transparent" }}
                  onClick={handleClick}
                  icon={show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  aria-label={show ? "Hide password" : "Show password"}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </ModalBody>

        <ModalFooter pb={6}>
          <Flex w="full" gap={3}>
            <Button 
              flex={1} 
              variant="outline" 
              onClick={onClose} 
              borderRadius="xl"
              size="lg"
              fontSize="md"
              borderColor="gray.200"
              _hover={{ bg: "gray.50" }}
            >
              Cancel
            </Button>
            <Button
              flex={1}
              colorScheme="brand"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              borderRadius="xl"
              size="lg"
              fontSize="md"
              boxShadow="md"
              _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              Save Password
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default ChangePasswordModal;

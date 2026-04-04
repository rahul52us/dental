import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  useColorModeValue,
  Flex,
  Text,
  ModalOverlay,
  Button,
  Divider,
  Box,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";

const FormModel = observer(({
  open,
  close,
  isCentered,
  title,
  footer,
  children,
  size,
  ...rest
}: any) => {
  const { themeStore: { themeConfig } } = stores;
  const headerBg = useColorModeValue(themeConfig.colors.custom.light.primary, "darkBrand.200");
  const headerTextColor = "white";
  const borderColor = useColorModeValue("gray.300", "gray.600")
  return (
    <Modal isCentered={isCentered} size={size || "2xl"} isOpen={open} onClose={close} {...rest}>
      <ModalOverlay style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }} />
      <ModalContent borderRadius="xl" overflow="hidden" boxShadow="2xl">
        {title && (
          <Flex
            justify="space-between"
            align="center"
            p={4}
            bg={headerBg}
            color={headerTextColor}
            borderBottom="1px solid"
            borderColor={borderColor}
            boxShadow="md"
          >
            <Text fontSize="lg" fontWeight="bold">
              {title}
            </Text>
            <Box>
              <ModalCloseButton
                size="lg"
                borderRadius="full"
                bg={headerBg}
                color="white"
                _hover={{ filter: "brightness(0.9)", transform: "scale(1.1)" }}
                _focus={{ boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)" }}
                transition="all 0.2s ease-in-out"
              />
            </Box>
          </Flex>
        )}
        <ModalBody p={2}>{children}</ModalBody>
        {footer && (
          <>
            <Divider />
            <Flex justifyContent="flex-end" p={4} columnGap={3} alignItems="center">
              <Button variant="outline" onClick={close} colorScheme="gray">
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={() => {}}>
                Submit
              </Button>
            </Flex>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

export default FormModel;
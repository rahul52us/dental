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
  useBreakpointValue,
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
  mobileFullScreen = false,
  ...rest
}: any) => {
  const { themeStore: { themeConfig } } = stores;
  const headerBg = useColorModeValue(themeConfig.colors.custom.light.primary, "darkBrand.200");
  const headerTextColor = "white";
  const borderColor = useColorModeValue("gray.300", "gray.600")
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const isMobileFullScreen = mobileFullScreen && isMobile;
  return (
    <Modal
      isCentered={isCentered}
      size={size || "2xl"}
      isOpen={open}
      onClose={close}
      motionPreset={isMobileFullScreen ? "slideInBottom" : undefined}
      {...rest}
    >
      <ModalOverlay style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }} />
      <ModalContent
        w={isMobileFullScreen ? "100vw" : undefined}
        maxW={isMobileFullScreen ? "100vw" : undefined}
        h={isMobileFullScreen ? "100dvh" : undefined}
        maxH={isMobileFullScreen ? "100dvh" : undefined}
        m={isMobileFullScreen ? 0 : undefined}
        borderRadius={isMobileFullScreen ? 0 : "xl"}
        overflow="hidden"
        boxShadow="2xl"
        display={isMobileFullScreen ? "flex" : undefined}
        flexDirection={isMobileFullScreen ? "column" : undefined}
      >
        {title && (
          <Flex
            justify="space-between"
            align="center"
            p={isMobileFullScreen ? 3 : 4}
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
        <ModalBody
          p={isMobileFullScreen ? 0 : 2}
          flex={isMobileFullScreen ? 1 : undefined}
          minH={isMobileFullScreen ? 0 : undefined}
          overflowY={isMobileFullScreen ? "auto" : undefined}
        >
          {children}
        </ModalBody>
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
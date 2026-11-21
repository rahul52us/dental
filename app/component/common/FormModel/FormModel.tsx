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
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const isMobileFullScreen = (mobileFullScreen || isMobile) && isMobile;

  const modalIsOpen = open !== undefined ? open : rest.isOpen;
  const modalClose = close || rest.onClose;

  return (
    <Modal
      isCentered={isMobile ? false : isCentered}
      size={isMobile ? "full" : (size || "2xl")}
      isOpen={modalIsOpen}
      onClose={modalClose}
      motionPreset={isMobile ? "none" : undefined}
      {...rest}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent
        w={isMobile ? "100vw" : undefined}
        maxW={isMobile ? "100vw" : undefined}
        h={isMobile ? (mobileFullScreen ? "100dvh" : undefined) : undefined}
        maxH={isMobile ? (mobileFullScreen ? "100dvh" : "92dvh") : undefined}
        m={isMobile ? 0 : undefined}
        position={isMobile ? "fixed" : undefined}
        bottom={isMobile ? 0 : undefined}
        left={isMobile ? 0 : undefined}
        right={isMobile ? 0 : undefined}
        borderTopRadius={0}
        borderRadius={isMobile ? 0 : "xl"}
        overflow="hidden"
        boxShadow="2xl"
        display={isMobile ? "flex" : undefined}
        flexDirection={isMobile ? "column" : undefined}
        bg={useColorModeValue("white", "darkBrand.50")}
        sx={
          isMobile
            ? {
                animation: "modalSlideUpMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "@keyframes modalSlideUpMobile": {
                  "0%": {
                    transform: "translateY(100%)",
                    opacity: 0.85,
                  },
                  "100%": {
                    transform: "translateY(0%)",
                    opacity: 1,
                  },
                },
              }
            : undefined
        }
      >
        {title && (
          <Flex
            justify="space-between"
            align="center"
            px={isMobile ? 4 : 5}
            py={isMobile ? 3 : 4}
            bgGradient={isMobile ? "linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)" : undefined}
            bg={isMobile ? undefined : headerBg}
            color="white"
            borderBottom="1px solid"
            borderColor={isMobile ? "whiteAlpha.200" : borderColor}
            borderTopRadius={0}
            borderRadius={0}
            boxShadow="sm"
            flexShrink={0}
          >
            <Text fontSize={{ base: "15px", md: "lg" }} fontWeight="800" color="white" noOfLines={1}>
              {title}
            </Text>
            <Box>
              <ModalCloseButton
                position="static"
                size={isMobile ? "sm" : "md"}
                borderRadius="full"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.350", transform: "scale(1.05)" }}
                _focus={{ boxShadow: "none" }}
                transition="all 0.2s ease-in-out"
                onClick={modalClose}
              />
            </Box>
          </Flex>
        )}
        <ModalBody
          p={isMobile ? 4 : 4}
          flex={isMobile ? 1 : undefined}
          minH={isMobile ? 0 : undefined}
          overflowY={isMobile ? "auto" : undefined}
          overscrollBehaviorY="contain"
        >
          {children}
        </ModalBody>
        {footer && (
          <Box flexShrink={0}>
            <Divider />
            <Flex justifyContent="flex-end" p={4} columnGap={3} alignItems="center">
              <Button variant="outline" onClick={modalClose} colorScheme="gray" borderRadius="xl">
                Cancel
              </Button>
              <Button
                bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
                borderRadius="xl"
                onClick={() => {}}
              >
                Submit
              </Button>
            </Flex>
          </Box>
        )}
      </ModalContent>
    </Modal>
  );
});

export default FormModel;
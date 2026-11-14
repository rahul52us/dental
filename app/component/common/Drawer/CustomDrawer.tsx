import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  DrawerFooter,
  Flex,
  Text,
  Button,
   HStack,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRef } from "react";
import { observer } from "mobx-react-lite";
import DrawerLoader from "../Loader/DrawerLoader";
import stores from "../../../store/stores";

interface CustomDrawerProps {
  open: boolean;
  title?: any;
  close: () => void;
  children: React.ReactNode;
  size?: string;
  props?: any;
  width?: any;
  loading?: boolean;
  extraActions?: React.ReactNode;
}

const CustomDrawer: React.FC<CustomDrawerProps> = observer(({
  title,
  open,
  close,
  size,
  children,
  width,
  loading = false,
  props,
  extraActions,
}) => {
  const {
    themeStore: { themeConfig },
  } = stores;

  const drawerRef = useRef<HTMLDivElement>(null);
  const { colorMode } = useColorMode();
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;
  const isMobile = !isDesktop;

  const headerBgColor = useColorModeValue(
    themeConfig.colors.custom.light.primary,
    "darkBrand.200"
  );

  const headerTextColor = "white";

  const handleCloseDrawer = () => {
    close();
  };

  return (
    <Drawer
      isOpen={open}
      placement={isMobile ? "bottom" : "right"}
      onClose={handleCloseDrawer}
      size={isDesktop ? (size || "xl") : "full"}
      finalFocusRef={drawerRef}
      {...props}
    >
      <DrawerOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />

      <DrawerContent
        width={isDesktop ? (width || undefined) : "100%"}
        maxW={isDesktop ? (width || undefined) : "100%"}
        maxH={isMobile ? "100dvh" : "100%"}
        height={isMobile ? "100dvh" : "100%"}
        borderRadius="0"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        bg={useColorModeValue("white", "darkBrand.50")}
      >
        {/* 🔹 HEADER */}
        {title && (
          <Flex
            direction="column"
            p={isMobile ? 3 : 4}
            bgGradient={
              isMobile
                ? "linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
                : undefined
            }
            bg={isMobile ? undefined : headerBgColor}
            color={headerTextColor}
            fontWeight="bold"
            py={isMobile ? 3.5 : 6}
            px={{ base: 4, md: 8 }}
          >
            <Flex justify="space-between" align="center" width="100%">
              <HStack spacing={3} flex="1" pr={3}>
                {typeof title === "string" ? (
                  <Text
                    fontSize={{ base: "sm", sm: "md", md: "xl" }}
                    fontWeight="800"
                    noOfLines={2}
                    lineHeight="short"
                    letterSpacing="-0.2px"
                  >
                    {title}
                  </Text>
                ) : (
                  <Box>{title}</Box>
                )}
              </HStack>

              <HStack spacing={2} align="center" flexShrink={0}>
                {extraActions && <Box mr={2}>{extraActions}</Box>}
                <DrawerCloseButton
                  position="relative"
                  top="0"
                  right="0"
                  insetEnd="0"
                  bg="whiteAlpha.250"
                  color="white"
                  borderRadius="full"
                  size="sm"
                  _hover={{ bg: "red.500" }}
                  mt={0}
                />
              </HStack>
            </Flex>
          </Flex>
        )}

        <Divider />

        {/* 🔹 BODY */}
        <DrawerBody
          flex="1"
          overflowY="auto"
          p={isDesktop ? "15px" : "8px"}
        >
          <DrawerLoader loading={loading}>
            <Box>{children}</Box>
          </DrawerLoader>
        </DrawerBody>

        {/* 🔹 FOOTER */}
        <DrawerFooter borderTopWidth="1px" display="none">
          <Button colorScheme="red" w="full" onClick={handleCloseDrawer}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

export default CustomDrawer;

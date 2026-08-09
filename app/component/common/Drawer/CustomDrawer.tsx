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
  const isDesktop = useBreakpointValue({ base: false, md: true });

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
      placement="right"
      onClose={handleCloseDrawer}
      size={isDesktop ? (size || "xl") : "full"}
      finalFocusRef={drawerRef}
      {...props}
    >
      <DrawerOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />

      <DrawerContent
        width={isDesktop ? (width || undefined) : "100%"}
        maxW={isDesktop ? (width || undefined) : "100%"}
        display="flex"
        flexDirection="column"
        bg={useColorModeValue("white", "darkBrand.50")}
        borderLeftRadius={{ base: "none", md: "3xl" }}
      >
        {/* 🔹 HEADER */}
        {title && (
          <Flex
            justify="space-between"
            align="center"
            p={4}
            bg={headerBgColor}
            color={headerTextColor}
            fontWeight="bold"
            py={6}
            px={{ base: 4, md: 8 }}
          >
            <HStack spacing={4} flex="1" pr={4}>
              {typeof title === "string" ? (
                <Text fontSize={{ base: "md", md: "xl" }} noOfLines={2} lineHeight="short">{title}</Text>
              ) : (
                <Box>{title}</Box>
              )}
            </HStack>
            
            <HStack spacing={2} align="center" flexShrink={0}>
              {extraActions && (
                <Box mr={3}>
                  {extraActions}
                </Box>
              )}
              <DrawerCloseButton
                position="relative"
                top="0"
                right="0"
                insetEnd="0"
                bg="red.500"
                color="white"
                borderRadius="full"
                size="md"
                _hover={{ bg: "red.600" }}
                mt={1}
              />
            </HStack>
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

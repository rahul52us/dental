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
}) => {
  const {
    themeStore: { themeConfig },
  } = stores;

  const drawerRef = useRef<HTMLDivElement>(null);
  const { colorMode } = useColorMode();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const headerBgColor = useColorModeValue(
    themeConfig.colors.custom.light.primary,
    themeConfig.colors.custom.dark.primary
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
      size={size ? size : "xl"}
      finalFocusRef={drawerRef}
      {...props}
    >
      <DrawerOverlay />

      <DrawerContent
        width={width ? width : undefined}
        maxW={width ? width : undefined}
        display="flex"
        flexDirection="column"
        bg={useColorModeValue("white", "darkBrand.50")}
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
          >
            {typeof title === "string" ? (
              <Text fontSize="xl">{title}</Text>
            ) : (
              <Box>{title}</Box>
            )}

            {/* 🔴 RED CIRCULAR CLOSE BUTTON */}
            <DrawerCloseButton
              position="relative"
              bg={headerBgColor}
              color="white"
              borderRadius="full"
              size="lg"
              _hover={{ filter: "brightness(0.9)" }}
              _active={{ filter: "brightness(0.8)" }}
              mb={2}
            />
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
